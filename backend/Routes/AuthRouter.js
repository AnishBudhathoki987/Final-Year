import express from "express";
import jwt from "jsonwebtoken";
import User from "../Models/user.js";
import { protect } from "../MiddleWare/AuthValidation.js";

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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: safeRole,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Register error:", error);
    res.status(500).json({ message: "Server error" });
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

    res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get current user
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
