// Routes/Vehicleroute.js
import express from "express";
import Vehicle from "../Models/vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/**
 *  NEW: GET /api/vehicles/stats/mine (BROKER ONLY)
 */
router.get("/stats/mine", protect, authorize("broker"), async (req, res) => {
  try {
    const [activeCount, deletedCount] = await Promise.all([
      Vehicle.countDocuments({ createdBy: req.user._id, isDeleted: false }),
      Vehicle.countDocuments({ createdBy: req.user._id, isDeleted: true }),
    ]);

    res.json({ activeCount, deletedCount });
  } catch (e) {
    console.log("GET stats/mine error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

//  GET /api/vehicles (PUBLIC) with filters + pagination
router.get("/", async (req, res) => {
  try {
    const {
      type, // rent | sale
      search, // keyword
      location, // location text
      category, // SUV etc.
      minPrice,
      maxPrice,
      page = 1,
      limit = 6,
      sort = "newest", // newest | priceLow | priceHigh
      available, // true/false
    } = req.query;

    //  Only show active
    const filter = { status: "active", isDeleted: false };

    if (type && ["rent", "sale"].includes(type)) filter.type = type;

    if (location) filter.location = { $regex: location, $options: "i" };
    if (category) filter.category = { $regex: category, $options: "i" };

    if (available === "true") filter.isAvailable = true;
    if (available === "false") filter.isAvailable = false;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
      ];
    }

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null || max !== null) {
      const field = type === "rent" ? "pricePerDay" : "price";
      filter[field] = {};
      if (min !== null) filter[field].$gte = min;
      if (max !== null) filter[field].$lte = max;
    }

    let sortObj = { createdAt: -1 };
    if (sort === "priceLow") sortObj = type === "rent" ? { pricePerDay: 1 } : { price: 1 };
    if (sort === "priceHigh") sortObj = type === "rent" ? { pricePerDay: -1 } : { price: -1 };

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

/**
 * ✅ GET /api/vehicles/mine (BROKER ONLY)
 * Returns vehicles created by the logged-in broker (active + hidden), not deleted
 */
router.get("/mine", protect, authorize("broker"), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ createdBy: req.user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name username email role");

    res.json({ vehicles });
  } catch (error) {
    console.log("GET mine vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET /api/vehicles/:id (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id).populate(
      "createdBy",
      "name username email role"
    );

    // ✅ Block deleted
    if (!v || v.isDeleted) return res.status(404).json({ message: "Vehicle not found" });

    res.json(v);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/vehicles (BROKER ONLY)
router.post("/", protect, authorize("broker"), async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.type || !data.location) {
      return res.status(400).json({ message: "title, type, location are required" });
    }

    if (!["rent", "sale"].includes(data.type)) {
      return res.status(400).json({ message: "type must be rent or sale" });
    }

    if (data.type === "rent" && (data.pricePerDay === undefined || data.pricePerDay === null)) {
      return res.status(400).json({ message: "pricePerDay is required for rent type" });
    }

    if (data.type === "sale" && (data.price === undefined || data.price === null)) {
      return res.status(400).json({ message: "price is required for sale type" });
    }

    const created = await Vehicle.create({
      ...data,
      createdBy: req.user._id,
      // ✅ ensure new vehicles are not deleted
      isDeleted: false,
      deletedAt: null,
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
    if (!v || v.isDeleted) return res.status(404).json({ message: "Vehicle not found" });

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

// ✅ DELETE /api/vehicles/:id (BROKER ONLY, only own)  -> SOFT DELETE
router.delete("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v || v.isDeleted) return res.status(404).json({ message: "Vehicle not found" });

    if (String(v.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ soft delete (keep record for deleted count)
    v.isDeleted = true;
    v.deletedAt = new Date();
    await v.save();

    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    console.log("DELETE vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;