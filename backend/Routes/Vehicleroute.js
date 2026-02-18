import express from "express";
import Vehicle from "../Models/vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/**
 * PUBLIC: GET /api/vehicles
 * Filters:
 *  - type=rent|sale
 *  - location=Kathmandu
 *  - maxPrice=5000
 *  - q=keyword
 *  - status=active|hidden (public should default to active)
 */
router.get("/", async (req, res) => {
  try {
    const { type, location, maxPrice, q, status } = req.query;
    const filter = {};

    // ✅ default show only active for public
    filter.status = status && ["active", "hidden"].includes(status) ? status : "active";

    if (type && ["rent", "sale"].includes(type)) filter.type = type;
    if (location) filter.location = new RegExp(location, "i");

    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { location: new RegExp(q, "i") },
      ];
    }

    if (maxPrice) {
      const mp = Number(maxPrice);
      if (!Number.isNaN(mp)) {
        filter.$and = filter.$and || [];

        if (filter.type === "rent") filter.$and.push({ pricePerDay: { $lte: mp } });
        else if (filter.type === "sale") filter.$and.push({ price: { $lte: mp } });
        else {
          filter.$and.push({
            $or: [{ price: { $lte: mp } }, { pricePerDay: { $lte: mp } }],
          });
        }
      }
    }

    const vehicles = await Vehicle.find(filter)
      .populate("createdBy", "username role")
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
});

/**
 * ✅ BROKER: GET /api/vehicles/mine/list
 * MUST be above "/:id"
 */
router.get("/mine/list", protect, authorize("broker"), async (req, res) => {
  try {
    const myVehicles = await Vehicle.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(myVehicles);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Failed to fetch your vehicles" });
  }
});

/**
 * PUBLIC: GET /api/vehicles/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("createdBy", "username role");
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (e) {
    res.status(400).json({ message: "Invalid vehicle id" });
  }
});

/**
 * BROKER: POST /api/vehicles
 */
router.post("/", protect, authorize("broker"), async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.type || !data.location) {
      return res.status(400).json({ message: "title, type, location are required" });
    }

    if (data.type === "rent" && (data.pricePerDay === null || data.pricePerDay === undefined)) {
      return res.status(400).json({ message: "pricePerDay is required for rent type" });
    }

    if (data.type === "sale" && (data.price === null || data.price === undefined)) {
      return res.status(400).json({ message: "price is required for sale type" });
    }

    const created = await Vehicle.create({
      ...data,
      createdBy: req.user._id,
    });

    res.status(201).json(created);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});

/**
 * BROKER: PUT /api/vehicles/:id (only owner)
 */
router.put("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const existing = await Vehicle.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Vehicle not found" });

    if (existing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own vehicle" });
    }

    // ✅ validate pricing rules on update too
    const incomingType = req.body.type ?? existing.type;
    const incomingPrice = req.body.price ?? existing.price;
    const incomingPricePerDay = req.body.pricePerDay ?? existing.pricePerDay;

    if (incomingType === "rent" && (incomingPricePerDay === null || incomingPricePerDay === undefined)) {
      return res.status(400).json({ message: "pricePerDay is required for rent type" });
    }

    if (incomingType === "sale" && (incomingPrice === null || incomingPrice === undefined)) {
      return res.status(400).json({ message: "price is required for sale type" });
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // ✅ IMPORTANT
    });

    res.json(updated);
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Failed to update vehicle" });
  }
});

/**
 * BROKER: DELETE /api/vehicles/:id (only owner)
 */
router.delete("/:id", protect, authorize("broker"), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    if (vehicle.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own vehicle" });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle deleted" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Failed to delete vehicle" });
  }
});

export default router;
