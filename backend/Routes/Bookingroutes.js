// Routes/Bookingroutes.js
import express from "express";
import Booking from "../Models/Booking.js";
import Vehicle from "../Models/vehicle.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/* ---------------- Helpers ---------------- */
const toMidnight = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const diffDays = (start, end) => {
  const ms = toMidnight(end).getTime() - toMidnight(start).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

/* ---------------- 1) CHECK AVAILABILITY */
router.get("/check", async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    if (!vehicleId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "vehicleId, startDate and endDate required" });
    }

    const start = toMidnight(startDate);
    const end = toMidnight(endDate);

    if (end <= start) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Optional: also ensure vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.isDeleted || vehicle.status !== "active") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.type !== "rent") {
      return res.status(400).json({ message: "This vehicle is not for rent" });
    }

    // Check overlapping bookings
    const overlap = await Booking.findOne({
      vehicle: vehicleId,
      status: { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    return res.json({ available: !overlap });
  } catch (err) {
    console.log("Check availability error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- 2) CREATE BOOKING (ONLY USER) ---------------- */
router.post("/", protect, authorize("user"), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupLocation } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "vehicleId, startDate and endDate are required" });
    }

    const start = toMidnight(startDate);
    const end = toMidnight(endDate);

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.isDeleted || vehicle.status !== "active") {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.type !== "rent") {
      return res.status(400).json({ message: "This vehicle is not for rent" });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: "Vehicle is not available" });
    }

    // overlap
    const overlap = await Booking.findOne({
      vehicle: vehicleId,
      status: { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlap) {
      return res.status(409).json({ message: "Selected dates are not available" });
    }

    const days = diffDays(start, end);
    const pricePerDay = Number(vehicle.pricePerDay || 0);

    if (!pricePerDay || pricePerDay <= 0) {
      return res.status(400).json({ message: "Vehicle pricePerDay is missing" });
    }

    const totalPrice = days * pricePerDay;

    const booking = await Booking.create({
      vehicle: vehicleId,
      user: req.user._id,
      startDate: start,
      endDate: end,
      pickupLocation: (pickupLocation || vehicle.location || "").trim(),
      pricePerDay,
      days,
      totalPrice,
      status: "confirmed",
    });

    const populated = await Booking.findById(booking._id)
      .populate("vehicle", "title location images pricePerDay")
      .populate("user", "name email");

    return res.status(201).json(populated);
  } catch (err) {
    console.log("Create booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- 3) USER BOOKINGS ---------------- */
router.get("/mine", protect, authorize("user"), async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("vehicle", "title location images pricePerDay");

    return res.json({ bookings });
  } catch (err) {
    console.log("Get my bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- 4) CANCEL BOOKING ---------------- */
router.put("/:id/cancel", protect, authorize("user"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.log("Cancel booking error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;