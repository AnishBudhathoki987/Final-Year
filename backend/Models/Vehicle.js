import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // "Toyota Fortuner 2023"
    type: { type: String, enum: ["rent", "sale"], required: true },

    // pricing
    price: { type: Number, default: null }, // for sale
    pricePerDay: { type: Number, default: null }, // for rent

    location: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: Number },

    fuelType: { type: String, trim: true }, // Petrol/Diesel/Electric
    transmission: { type: String, trim: true }, // Manual/Automatic
    seats: { type: Number, default: 5 },

    description: { type: String, trim: true },
    images: [{ type: String }], // URLs for now

    // broker (owner)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // later sprints can extend:
    // isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Helpful indexes for search
vehicleSchema.index({ title: "text", brand: "text", model: "text", location: "text" });

export default mongoose.model("Vehicle", vehicleSchema);
