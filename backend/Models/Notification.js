import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["booking", "purchase", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);