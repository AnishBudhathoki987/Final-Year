import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // Core
    title: { type: String, required: true, trim: true }, // e.g. "Toyota Fortuner 2023"

    // ✅ IMPORTANT: use type (rent/sale)
    type: { type: String, enum: ["rent", "sale"], required: true },

    // Pricing
    price: { type: Number, default: null }, // sale price
    pricePerDay: { type: Number, default: null }, // rent price per day

    // Details
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },
    mileage: { type: Number, default: 0 },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      trim: true,
    },

    category: { type: String, trim: true }, // SUV/Sedan/Hatchback/EV etc.

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

    features: { type: String, trim: true },
    description: { type: String, trim: true },

    images: [{ type: String }], // image URLs

    // owner (broker)
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
