import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Register_fyp", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Register_fyp", required: true },
    message: { type: String },
    image: {
      data: Buffer,
      contentType: String,
      name: String
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);