import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
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

  payment_amount: {
    type: Number,
    required: true,
  },

  payment_status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },

  payment_method: {
    type: String,
    default: "esewa",
  },

  payment_transaction_uuid: {
    type: String,
    required: true,
  },

  esewa_ref_id: {
    type: String,
    default: "",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Paymentmodel = mongoose.model("Payment", paymentSchema);

export default Paymentmodel;