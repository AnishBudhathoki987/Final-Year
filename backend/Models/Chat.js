import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    broker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: [messageSchema],

    unreadForBroker: {
      type: Number,
      default: 0,
    },

    unreadForUser: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// one chat between one user and one broker
chatSchema.index({ user: 1, broker: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);