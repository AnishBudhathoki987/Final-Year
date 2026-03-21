// Routes/Vehicleroute.js
import express from "express";
import Vehicle from "../Models/vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/**
 *  GET stats
 */
router.get("/stats/mine", protect, authorize("broker"), async (req, res) => {
  try {
    const [activeCount, deletedCount] = await Promise.all([
      Vehicle.countDocuments({ createdBy: req.user._id, isDeleted: false }),
      Vehicle.countDocuments({ createdBy: req.user._id, isDeleted: true }),
    ]);

    res.json({ activeCount, deletedCount });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET vehicles
 */
router.get("/", async (req, res) => {
  try {
    const {
      type,
      search,
      location,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 6,
      sort = "newest",
      available,
    } = req.query;

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
        { numberPlate: { $regex: search, $options: "i" } }, // ✅ NEW
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

    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sortObj).skip(skip).limit(Number(limit)),
      Vehicle.countDocuments(filter),
    ]);

    res.json({
      vehicles,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET mine
 */
router.get("/mine", protect, authorize("broker"), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      createdBy: req.user._id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({ vehicles });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);

    if (!v || v.isDeleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(v);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST vehicle
 */
router.post("/", protect, authorize("broker"), async (req, res) => {
  try {
    const data = req.body;

    // ✅ UPDATED validation
    if (!data.title || !data.type || !data.location || !data.numberPlate) {
      return res.status(400).json({
        message: "title, type, location and numberPlate are required",
      });
    }

    if (!["rent", "sale"].includes(data.type)) {
      return res.status(400).json({ message: "type must be rent or sale" });
    }

    if (data.type === "rent" && !data.pricePerDay) {
      return res.status(400).json({ message: "pricePerDay required" });
    }

    if (data.type === "sale" && !data.price) {
      return res.status(400).json({ message: "price required" });
    }

    const created = await Vehicle.create({
      ...data,
      numberPlate: data.numberPlate.trim().toUpperCase(), // ✅ IMPORTANT
      createdBy: req.user._id,
      isDeleted: false,
      deletedAt: null,
    });

    res.status(201).json(created);
  } catch (error) {
    // ✅ DUPLICATE ERROR
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Number plate already exists",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT vehicle
 */
router.put("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);

    if (!v || v.isDeleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (String(v.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ HANDLE numberPlate
    if (req.body.numberPlate !== undefined) {
      if (!String(req.body.numberPlate).trim()) {
        return res.status(400).json({
          message: "Number plate cannot be empty",
        });
      }

      req.body.numberPlate = String(req.body.numberPlate)
        .trim()
        .toUpperCase();
    }

    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Number plate already exists",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE (soft)
 */
router.delete("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);

    if (!v || v.isDeleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (String(v.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    v.isDeleted = true;
    v.deletedAt = new Date();
    await v.save();

    res.json({ message: "Vehicle deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;