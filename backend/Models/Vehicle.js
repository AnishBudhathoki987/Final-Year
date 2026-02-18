import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // Basic
    title: { type: String, required: true, trim: true }, // "Toyota Fortuner 2023"
    type: { type: String, enum: ["rent", "sale"], required: true },

    // Pricing
    price: { type: Number, default: null }, // sale price
    pricePerDay: { type: Number, default: null }, // rent price per day

    // Broker form fields (matching your UI)
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },

    mileage: { type: Number, default: 0 },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
      trim: true,
    },

    category: { type: String, trim: true }, // SUV/Sedan/Hatchback (optional)

    transmission: {
      type: String,
      enum: ["Automatic", "Manual"],
      trim: true,
    },

    location: { type: String, required: true, trim: true },

    // Listing control
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
    },

    // UI content
    features: { type: String, trim: true }, // short features field
    description: { type: String, trim: true },

    images: [{ type: String }], // URLs for now

    // broker (owner)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Helpful indexes for search (regex or later $text)
vehicleSchema.index({
  title: "text",
  brand: "text",
  model: "text",
  location: "text",
});

export default mongoose.model("Vehicle", vehicleSchema);
