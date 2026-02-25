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

    // prevent duplicate purchase (optional but recommended)
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
      .populate("vehicle", "title location images price type")
      .populate("user", "username email");

    return res.status(201).json(populated);
  } catch (err) {
    console.log("Create purchase error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
  2) MY PURCHASES (HISTORY) - ONLY USER
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
  3) CONFIRM PURCHASE (ADMIN OR BROKER later)
  For now: keep simple -> user confirms "I accept"
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
  4) CANCEL PURCHASE - ONLY USER
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