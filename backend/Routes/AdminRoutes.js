import express from "express";
import User from "../Models/user.js";
import Vehicle from "../Models/vehicle.js";
import Booking from "../Models/Booking.js";
import Purchase from "../Models/purchase.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/**
 * GET dashboard overview
 */
router.get("/overview", protect, authorize("admin"), async (req, res) => {
  try {
    const [
      users,
      brokers,
      blockedAccounts,
      verifiedBrokers,
      totalVehicles,
      rentVehicles,
      saleVehicles,
      activeVehicles,
      hiddenVehicles,
      deletedVehicles,
      totalBookings,
      totalPurchases,
      recentUsers,
      recentBrokers,
      recentVehicles,
      recentBookings,
      recentPurchases,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "broker" }),
      User.countDocuments({ role: { $in: ["user", "broker"] }, isBlocked: true }),
      User.countDocuments({ role: "broker", isVerified: true }),

      Vehicle.countDocuments({}),
      Vehicle.countDocuments({ type: "rent" }),
      Vehicle.countDocuments({ type: "sale" }),
      Vehicle.countDocuments({ status: "active", isDeleted: false }),
      Vehicle.countDocuments({ status: "hidden", isDeleted: false }),
      Vehicle.countDocuments({ isDeleted: true }),

      Booking.countDocuments({}),
      Purchase.countDocuments({}),

      User.find({ role: "user" })
        .select("username email isBlocked createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      User.find({ role: "broker" })
        .select("username email isBlocked isVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Vehicle.find({})
        .populate("createdBy", "username email")
        .select("title brand model type status isDeleted location createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Booking.find({})
        .populate("user", "username email")
        .populate("vehicle", "title brand model numberPlate")
        .select("status totalPrice createdAt")
        .sort({ createdAt: -1 })
        .limit(5),

      Purchase.find({})
        .populate("vehicle", "title brand model numberPlate")
        .select("fullName phone vehiclePrice status createdAt")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      stats: {
        users,
        brokers,
        blockedAccounts,
        verifiedBrokers,
        totalVehicles,
        rentVehicles,
        saleVehicles,
        activeVehicles,
        hiddenVehicles,
        deletedVehicles,
        totalBookings,
        totalPurchases,
      },
      recentActivity: {
        users: recentUsers,
        brokers: recentBrokers,
        vehicles: recentVehicles,
        bookings: recentBookings,
        purchases: recentPurchases,
      },
    });
  } catch (error) {
    console.log("Admin overview error:", error);
    res.status(500).json({ message: "Failed to load admin overview." });
  }
});

/**
 * GET all normal users
 */
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.log("Load users error:", error);
    res.status(500).json({ message: "Failed to load users." });
  }
});

/**
 * GET all brokers
 */
router.get("/brokers", protect, authorize("admin"), async (req, res) => {
  try {
    const brokers = await User.find({ role: "broker" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ brokers });
  } catch (error) {
    console.log("Load brokers error:", error);
    res.status(500).json({ message: "Failed to load brokers." });
  }
});

/**
 * GET all vehicles
 */
router.get("/vehicles", protect, authorize("admin"), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({})
      .populate("createdBy", "username email role")
      .sort({ createdAt: -1 });

    res.json({ vehicles });
  } catch (error) {
    console.log("Load vehicles error:", error);
    res.status(500).json({ message: "Failed to load vehicles." });
  }
});

/**
 * GET all transactions
 * bookings + purchases
 */
router.get("/transactions", protect, authorize("admin"), async (req, res) => {
  try {
    const [bookings, purchases] = await Promise.all([
      Booking.find({})
        .populate("user", "username email")
        .populate({
          path: "vehicle",
          populate: {
            path: "createdBy",
            select: "username email",
          },
        })
        .sort({ createdAt: -1 }),

      Purchase.find({})
        .populate({
          path: "vehicle",
          populate: {
            path: "createdBy",
            select: "username email",
          },
        })
        .sort({ createdAt: -1 }),
    ]);

    const bookingTransactions = bookings.map((b) => ({
      _id: b._id,
      source: "booking",
      customerName: b.user?.username || "User",
      customerEmail: b.user?.email || "—",
      brokerName: b.vehicle?.createdBy?.username || "Broker",
      brokerEmail: b.vehicle?.createdBy?.email || "—",
      vehicleTitle: b.vehicle?.title || "Vehicle",
      vehicleType: b.vehicle?.type || "rent",
      amount: b.totalPrice || 0,
      status: b.status || "pending",
      paymentStatus: b.paymentStatus || "paid",
      createdAt: b.createdAt,
    }));

    const purchaseTransactions = purchases.map((p) => ({
      _id: p._id,
      source: "purchase",
      customerName: p.fullName || "Customer",
      customerEmail: p.email || "—",
      brokerName: p.vehicle?.createdBy?.username || "Broker",
      brokerEmail: p.vehicle?.createdBy?.email || "—",
      vehicleTitle: p.vehicle?.title || "Vehicle",
      vehicleType: p.vehicle?.type || "sale",
      amount: p.vehiclePrice || 0,
      status: p.status || "pending",
      paymentStatus: p.paymentStatus || "paid",
      createdAt: p.createdAt,
    }));

    const transactions = [...bookingTransactions, ...purchaseTransactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ transactions });
  } catch (error) {
    console.log("Load transactions error:", error);
    res.status(500).json({ message: "Failed to load transactions." });
  }
});

/**
 * BLOCK user or broker
 */
router.put("/users/:id/block", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin account cannot be blocked." });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot block your own account." });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked successfully.", user });
  } catch (error) {
    console.log("Block user error:", error);
    res.status(500).json({ message: "Failed to block user." });
  }
});

/**
 * UNBLOCK user or broker
 */
router.put("/users/:id/unblock", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin account cannot be modified here." });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked successfully.", user });
  } catch (error) {
    console.log("Unblock user error:", error);
    res.status(500).json({ message: "Failed to unblock user." });
  }
});

/**
 * VERIFY broker
 */
router.put("/brokers/:id/verify", protect, authorize("admin"), async (req, res) => {
  try {
    const broker = await User.findById(req.params.id).select("-password");

    if (!broker) {
      return res.status(404).json({ message: "Broker not found." });
    }

    if (broker.role !== "broker") {
      return res.status(400).json({ message: "This account is not a broker." });
    }

    broker.isVerified = true;
    await broker.save();

    res.json({ message: "Broker verified successfully.", broker });
  } catch (error) {
    console.log("Verify broker error:", error);
    res.status(500).json({ message: "Failed to verify broker." });
  }
});

/**
 * UNVERIFY broker
 */
router.put("/brokers/:id/unverify", protect, authorize("admin"), async (req, res) => {
  try {
    const broker = await User.findById(req.params.id).select("-password");

    if (!broker) {
      return res.status(404).json({ message: "Broker not found." });
    }

    if (broker.role !== "broker") {
      return res.status(400).json({ message: "This account is not a broker." });
    }

    broker.isVerified = false;
    await broker.save();

    res.json({ message: "Broker unverified successfully.", broker });
  } catch (error) {
    console.log("Unverify broker error:", error);
    res.status(500).json({ message: "Failed to unverify broker." });
  }
});

export default router;