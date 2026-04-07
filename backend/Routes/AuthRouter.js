import express from "express";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// REGISTER
// user, broker, admin allowed
// but admin can be only 2 accounts total
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    let safeRole = "user";

    if (role === "broker") {
      safeRole = "broker";
    } else if (role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount >= 2) {
        return res.status(400).json({
          message: "Only 2 admin accounts are allowed.",
        });
      }

      safeRole = "admin";
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: safeRole,
      isBlocked: false,
      isVerified: safeRole === "broker" ? false : true,
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Register error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin.",
      });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// CURRENT USER
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// ADMIN ONLY TEST
router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin ✅" });
});

export default router;