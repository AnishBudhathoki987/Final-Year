// Models/vehicle.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // Core
    title: { type: String, required: true, trim: true },

    type: { type: String, enum: ["rent", "sale"], required: true },

    // Pricing
    price: { type: Number, default: null },
    pricePerDay: { type: Number, default: null },

    // Details
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    mileage: { type: Number, default: 0 },

    // ✅ NEW FIELD (IMPORTANT)
    numberPlate: {
      type: String,
      required: [true, "Number plate is required"],
      trim: true,
      uppercase: true,
      unique: true, // 🔥 UNIQUE
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      trim: true,
    },

    category: { type: String, trim: true },

    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      trim: true,
    },

    seats: { type: Number, default: 5 },

    location: { type: String, required: true, trim: true },

    // Listing
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    isAvailable: { type: Boolean, default: true },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    features: { type: String, trim: true },
    description: { type: String, trim: true },

    images: [{ type: String }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Search index
vehicleSchema.index({
  title: "text",
  brand: "text",
  model: "text",
  location: "text",
});

export default mongoose.model("Vehicle", vehicleSchema);