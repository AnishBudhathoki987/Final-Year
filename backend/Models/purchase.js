import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
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

    // Purchase form fields
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    // optional docs (later)
    documents: [{ type: String, default: [] }],

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },

    // snapshot price at purchase time
    vehiclePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

purchaseSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Purchase", purchaseSchema);