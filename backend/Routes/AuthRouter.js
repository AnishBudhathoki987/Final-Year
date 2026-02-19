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

// ✅ Register (allow role: user or broker only)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    // ✅ Allow ONLY "user" or "broker"
    const safeRole = role === "broker" ? "broker" : "user";

    // ✅ Check email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Check username exists (THIS WAS MISSING)
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: safeRole,
    });

    return res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Register error:", error);

    // ✅ Handle Mongo duplicate key error nicely
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Current user profile
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

// ✅ RBAC Proof Route (for Sprint 1 completion)
router.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin ✅" });
});

export default router;
