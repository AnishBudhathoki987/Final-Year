import express from "express";
import Chat from "../Models/Chat.js";
import User from "../Models/user.js";
import { protect, authorize } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

/* -------------------------------------------
   1) START OR GET CHAT BETWEEN USER & BROKER
------------------------------------------- */
router.post("/start", protect, authorize("user"), async (req, res) => {
  try {
    const { brokerId } = req.body;

    if (!brokerId) {
      return res.status(400).json({ message: "brokerId is required" });
    }

    const broker = await User.findById(brokerId);
    if (!broker || broker.role !== "broker") {
      return res.status(404).json({ message: "Broker not found" });
    }

    let chat = await Chat.findOne({
      user: req.user._id,
      broker: brokerId,
    })
      .populate("user", "username email role")
      .populate("broker", "username email role")
      .populate("messages.senderId", "username role");

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        broker: brokerId,
        messages: [],
        unreadForBroker: 0,
        unreadForUser: 0,
      });

      chat = await Chat.findById(chat._id)
        .populate("user", "username email role")
        .populate("broker", "username email role")
        .populate("messages.senderId", "username role");
    }

    return res.status(200).json(chat);
  } catch (err) {
    console.log("Start chat error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   2) GET SINGLE CHAT BY ID
------------------------------------------- */
router.get("/:chatId", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("user", "username email role")
      .populate("broker", "username email role")
      .populate("messages.senderId", "username role");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUser =
      String(chat.user?._id || chat.user) === String(req.user._id);
    const isBroker =
      String(chat.broker?._id || chat.broker) === String(req.user._id);

    if (!isUser && !isBroker) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(chat);
  } catch (err) {
    console.log("Get chat error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   3) SEND MESSAGE
------------------------------------------- */
router.post("/:chatId/message", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUser = String(chat.user) === String(req.user._id);
    const isBroker = String(chat.broker) === String(req.user._id);

    if (!isUser && !isBroker) {
      return res.status(403).json({ message: "Access denied" });
    }

    chat.messages.push({
      senderId: req.user._id,
      text: text.trim(),
    });

    // unread count update
    if (isUser) {
      chat.unreadForBroker += 1;
    }

    if (isBroker) {
      chat.unreadForUser += 1;
    }

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate("user", "username email role")
      .populate("broker", "username email role")
      .populate("messages.senderId", "username role");

    return res.status(201).json(updatedChat);
  } catch (err) {
    console.log("Send message error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   4) MARK CHAT AS READ
------------------------------------------- */
router.put("/:chatId/read", protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isUser = String(chat.user) === String(req.user._id);
    const isBroker = String(chat.broker) === String(req.user._id);

    if (!isUser && !isBroker) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (isBroker) {
      chat.unreadForBroker = 0;
    }

    if (isUser) {
      chat.unreadForUser = 0;
    }

    await chat.save();

    return res.json({ message: "Chat marked as read" });
  } catch (err) {
    console.log("Read chat error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   5) USER: MY CHATS
------------------------------------------- */
router.get("/user/mine/all", protect, authorize("user"), async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("user", "username email role")
      .populate("broker", "username email role")
      .populate("messages.senderId", "username role");

    return res.json({ chats });
  } catch (err) {
    console.log("User chats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/* -------------------------------------------
   6) BROKER: MY CHATS
------------------------------------------- */
router.get("/broker/mine/all", protect, authorize("broker"), async (req, res) => {
  try {
    const chats = await Chat.find({ broker: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("user", "username email role")
      .populate("broker", "username email role")
      .populate("messages.senderId", "username role");

    return res.json({ chats });
  } catch (err) {
    console.log("Broker chats error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;