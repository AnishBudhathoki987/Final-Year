import express from "express";
import crypto from "crypto";
import axios from "axios";
import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";
import Vehicle from "../Models/vehicle.js";
import { protect } from "../MiddleWare/AuthValidation.js";

const router = express.Router();

function generateEsewaSignature(total_amount, transaction_uuid, product_code, secret) {
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

// INITIATE eSewa PAYMENT - BOOKING ONLY
router.post("/esewa/initiate", protect, async (req, res) => {
  try {
    const { vehicleId, bookingId, amount } = req.body;

    if (!vehicleId || !bookingId || !amount) {
      return res.status(400).json({
        message: "vehicleId, bookingId and amount are required",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.isDeleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (String(booking.vehicle) !== String(vehicleId)) {
      return res.status(400).json({ message: "Booking does not match vehicle" });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({ message: "Booking is already paid and confirmed" });
    }

    // expire old pending booking
    if (
      booking.status === "pending" &&
      booking.pendingUntil &&
      new Date(booking.pendingUntil).getTime() < Date.now()
    ) {
      booking.status = "expired";
      await booking.save();

      return res.status(400).json({
        message: "This booking has expired. Please create a new booking.",
      });
    }

    const existingSuccessPayment = await Payment.findOne({
      booking: bookingId,
      payment_status: "success",
    });

    if (existingSuccessPayment) {
      return res.status(400).json({ message: "Payment already completed for this booking" });
    }

    const transaction_uuid = `CF-BOOK-${Date.now()}`;
    const product_code = process.env.ESEWA_PRODUCT_CODE;
    const secret = process.env.ESEWA_SECRET_KEY;

    const payment = await Payment.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: bookingId,
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
        failure_url: `${process.env.SERVER_URL}/api/payments/esewa/failure?paymentId=${payment._id}`,
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
      return res.redirect(`${process.env.CLIENT_URL}/payment-failure?message=Missing payment data`);
    }

    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));

    const payment = await Payment.findOne({
      payment_transaction_uuid: decoded.transaction_uuid,
    });

    if (!payment) {
      return res.redirect(`${process.env.CLIENT_URL}/payment-failure?message=Payment record not found`);
    }

    if (payment.payment_status === "success") {
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}&bookingId=${payment.booking}`
      );
    }

    const statusCheckUrl = `${process.env.ESEWA_STATUS_CHECK_URL}?product_code=${encodeURIComponent(
      decoded.product_code
    )}&total_amount=${encodeURIComponent(decoded.total_amount)}&transaction_uuid=${encodeURIComponent(
      decoded.transaction_uuid
    )}`;

    const verifyResponse = await axios.get(statusCheckUrl);
    const verifyData = verifyResponse.data;

    if (verifyData.status === "COMPLETE") {
      payment.payment_status = "success";
      payment.esewa_ref_id = verifyData.ref_id || "";
      await payment.save();

      if (payment.booking) {
        await Booking.findByIdAndUpdate(payment.booking, {
          status: "confirmed",
        });
      }

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}&bookingId=${payment.booking}`
      );
    } else {
      payment.payment_status = "failed";
      await payment.save();

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-failure?paymentId=${payment._id}&bookingId=${payment.booking}`
      );
    }
  } catch (error) {
    console.log("eSewa success error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/payment-failure?message=Verification failed`);
  }
});

// eSewa FAILURE
router.get("/esewa/failure", async (req, res) => {
  try {
    const { paymentId } = req.query;

    if (paymentId) {
      const payment = await Payment.findById(paymentId);
      if (payment && payment.payment_status === "pending") {
        payment.payment_status = "failed";
        await payment.save();
      }
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment-failure`);
  } catch (error) {
    console.log("eSewa failure error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/payment-failure`);
  }
});

// GET MY PAYMENTS
router.get("/mine", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("vehicle")
      .populate("booking")
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