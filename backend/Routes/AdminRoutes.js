import express from "express";
import User from "../Models/user.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

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