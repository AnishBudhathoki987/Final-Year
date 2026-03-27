import express from "express";
import crypto from "crypto";
import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";
import Purchase from "../Models/purchase.js";
import Vehicle from "../Models/vehicle.js";
import { protect } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

function generateEsewaSignature(total_amount, transaction_uuid, product_code, secret) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

// INITIATE eSewa PAYMENT
router.post("/esewa/initiate", protect, async (req, res) => {
  try {
    const { vehicleId, bookingId, purchaseId, amount } = req.body;

    if (!vehicleId || !amount) {
      return res.status(400).json({
        message: "vehicleId and amount are required",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.isDeleted) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    const transaction_uuid = `CF-${Date.now()}`;
    const product_code = process.env.ESEWA_PRODUCT_CODE;
    const secret = process.env.ESEWA_SECRET_KEY;

    const payment = await Payment.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: bookingId || null,
      purchase: purchaseId || null,
      payment_amount: Number(amount),
      payment_status: "pending",
      payment_method: "esewa",
      payment_transaction_uuid: transaction_uuid,
    });

    const signature = generateEsewaSignature(
      Number(amount),
      transaction_uuid,
      product_code,
      secret
    );

    res.status(201).json({
      message: "eSewa payment initiated",
      paymentId: payment._id,
      esewa: {
        amount: Number(amount),
        tax_amount: 0,
        total_amount: Number(amount),
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${process.env.SERVER_URL}/api/payments/esewa/success`,
        failure_url: `${process.env.SERVER_URL}/api/payments/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
        url: process.env.ESEWA_BASE_URL,
      },
    });
  } catch (error) {
    console.log("eSewa initiate error:", error);
    res.status(500).json({
      message: "Failed to initiate payment",
    });
  }
});

// eSewa SUCCESS
router.get("/esewa/success", async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).send("Missing payment data");
    }

    const decoded = JSON.parse(
      Buffer.from(data, "base64").toString("utf-8")
    );

    const payment = await Payment.findOne({
      payment_transaction_uuid: decoded.transaction_uuid,
    });

    if (!payment) {
      return res.status(404).send("Payment record not found");
    }

    payment.payment_status = "success";
    payment.esewa_ref_id = decoded.transaction_code || "";
    await payment.save();

    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, {
        status: "confirmed",
      });
    }

    if (payment.purchase) {
      await Purchase.findByIdAndUpdate(payment.purchase, {
        status: "completed",
      });
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment-success`);
  } catch (error) {
    console.log("eSewa success error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/payment-failure`);
  }
});

// eSewa FAILURE
router.get("/esewa/failure", async (req, res) => {
  try {
    return res.redirect(`${process.env.CLIENT_URL}/payment-failure`);
  } catch (error) {
    console.log("eSewa failure error:", error);
    return res.status(500).send("Payment failed");
  }
});

// GET MY PAYMENTS
router.get("/mine", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("vehicle")
      .populate("booking")
      .populate("purchase")
      .sort({ created_at: -1 });

    res.json({ payments });
  } catch (error) {
    console.log("Fetch payments error:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
});

export default router;