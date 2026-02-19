import express from "express";
import Vehicle from "../Models/Vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

// ✅ GET /api/vehicles (PUBLIC) with filters + pagination
router.get("/", async (req, res) => {
  try {
    const {
      type,          // rent | sale
      search,        // keyword
      location,      // location text
      category,      // SUV etc.
      minPrice,
      maxPrice,
      page = 1,
      limit = 6,
      sort = "newest", // newest | priceLow | priceHigh
      available,       // true/false
    } = req.query;

    const filter = { status: "active" };

    // ✅ type filter
    if (type && ["rent", "sale"].includes(type)) {
      filter.type = type;
    }

    // location filter
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // category filter
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // available filter
    if (available === "true") filter.isAvailable = true;
    if (available === "false") filter.isAvailable = false;

    // search (text index if you want)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    // price filter (depends on type)
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null || max !== null) {
      const field = type === "rent" ? "pricePerDay" : "price";
      filter[field] = {};
      if (min !== null) filter[field].$gte = min;
      if (max !== null) filter[field].$lte = max;
    }

    // sorting
    let sortObj = { createdAt: -1 };
    if (sort === "priceLow") {
      sortObj = type === "rent" ? { pricePerDay: 1 } : { price: 1 };
    }
    if (sort === "priceHigh") {
      sortObj = type === "rent" ? { pricePerDay: -1 } : { price: -1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      vehicles,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.log("GET vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/vehicles/:id (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id).populate("createdBy", "username email role");
    if (!v) return res.status(404).json({ message: "Vehicle not found" });
    res.json(v);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/vehicles (BROKER ONLY)
router.post("/", protect, authorize("broker"), async (req, res) => {
  try {
    const data = req.body;

    // basic validation
    if (!data.title || !data.type || !data.location) {
      return res.status(400).json({ message: "title, type, location are required" });
    }

    if (!["rent", "sale"].includes(data.type)) {
      return res.status(400).json({ message: "type must be rent or sale" });
    }

    // ensure pricing rules
    if (data.type === "rent" && (data.pricePerDay === undefined || data.pricePerDay === null)) {
      return res.status(400).json({ message: "pricePerDay is required for rent type" });
    }
    if (data.type === "sale" && (data.price === undefined || data.price === null)) {
      return res.status(400).json({ message: "price is required for sale type" });
    }

    const created = await Vehicle.create({
      ...data,
      createdBy: req.user._id,
    });

    res.status(201).json(created);
  } catch (error) {
    console.log("POST vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT /api/vehicles/:id (BROKER ONLY, only own)
router.put("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Vehicle not found" });

    // only owner can update
    if (String(v.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.log("PUT vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE /api/vehicles/:id (BROKER ONLY, only own)
router.delete("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Vehicle not found" });

    if (String(v.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await v.deleteOne();
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    console.log("DELETE vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
