import express from "express";
import Notification from "../Models/Notification.js";
import { protect } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

router.get("/mine", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.log("Load notifications error:", error);
    res.status(500).json({ message: "Failed to load notifications." });
  }
});

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read.", notification });
  } catch (error) {
    console.log("Mark notification read error:", error);
    res.status(500).json({ message: "Failed to update notification." });
  }
});

router.put("/read-all/all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.log("Mark all notifications read error:", error);
    res.status(500).json({ message: "Failed to update notifications." });
  }
});

export default router;