import express from "express";
import Purchase from "../Models/purchase.js";
import Vehicle from "../Models/vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/* -------------------------------------------
  1) CREATE PURCHASE (ONLY USER)
------------------------------------------- */
router.post("/", protect, authorize("user"), async (req, res) => {
  try {
    const { vehicleId, fullName, phone, address } = req.body;

    if (!vehicleId || !fullName || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.isDeleted || vehicle.status !== "active") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.type !== "sale") {
      return res.status(400).json({ message: "This vehicle is not for sale" });
    }

    const existing = await Purchase.findOne({
      vehicle: vehicleId,
      user: req.user._id,
      status: { $ne: "cancelled" },
    });

    if (existing) {
      return res.status(409).json({ message: "You already requested this purchase" });
    }

    const purchase = await Purchase.create({
      vehicle: vehicleId,
      user: req.user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      vehiclePrice: Number(vehicle.price || 0),
      status: "pending",
    });

    const populated = await Purchase.findById(purchase._id)
      .populate("vehicle", "title location images price type createdBy isAvailable status")
      .populate("user", "username email");

    return res.status(201).json(populated);
  } catch (err) {
    console.log("Create purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  2) MY PURCHASES (USER)
------------------------------------------- */
router.get("/mine", protect, authorize("user"), async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("vehicle", "title location images price type");

    return res.json({ purchases });
  } catch (err) {
    console.log("My purchases error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  3) BROKER PURCHASES
------------------------------------------- */
router.get("/broker/mine", protect, authorize("broker"), async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "vehicle",
        match: { createdBy: req.user._id, type: "sale" },
        select: "title location images price type createdBy isAvailable status",
      })
      .populate("user", "username email");

    const filtered = purchases.filter((p) => p.vehicle);

    return res.json({ purchases: filtered });
  } catch (err) {
    console.log("Broker purchases error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  4) BROKER CONFIRM PURCHASE
------------------------------------------- */
router.put("/:id/broker-confirm", protect, authorize("broker"), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate("vehicle");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (!purchase.vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (String(purchase.vehicle.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    purchase.status = "confirmed";
    await purchase.save();

    const vehicle = await Vehicle.findById(purchase.vehicle._id);
    if (vehicle) {
      vehicle.isAvailable = false;
      vehicle.status = "hidden";
      await vehicle.save();
    }

    return res.json({ message: "Purchase confirmed and vehicle marked unavailable" });
  } catch (err) {
    console.log("Broker confirm purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  5) BROKER CANCEL PURCHASE
------------------------------------------- */
router.put("/:id/broker-cancel", protect, authorize("broker"), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate("vehicle");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (!purchase.vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (String(purchase.vehicle.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    purchase.status = "cancelled";
    await purchase.save();

    return res.json({ message: "Purchase cancelled" });
  } catch (err) {
    console.log("Broker cancel purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  6) USER CONFIRM PURCHASE
------------------------------------------- */
router.put("/:id/confirm", protect, authorize("user"), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    if (String(purchase.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    purchase.status = "confirmed";
    await purchase.save();

    return res.json({ message: "Purchase confirmed" });
  } catch (err) {
    console.log("Confirm purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  7) USER CANCEL PURCHASE
------------------------------------------- */
router.put("/:id/cancel", protect, authorize("user"), async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    if (String(purchase.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    purchase.status = "cancelled";
    await purchase.save();

    return res.json({ message: "Purchase cancelled" });
  } catch (err) {
    console.log("Cancel purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;