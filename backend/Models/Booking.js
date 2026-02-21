import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },

    pickupLocation: { type: String, trim: true, default: "" },

    pricePerDay: { type: Number, required: true },
    days: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
      index: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });

export default mongoose.model("Booking", bookingSchema);