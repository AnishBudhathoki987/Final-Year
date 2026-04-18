import express from "express";
import crypto from "crypto";
import axios from "axios";
import Payment from "../Models/Payment.js";
import Booking from "../Models/Booking.js";
import Vehicle from "../Models/vehicle.js";
import User from "../Models/user.js";
import { protect } from "../MiddleWare/AuthValidation.js";
import Notification from "../Models/Notification.js";

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
      payment_for: "booking",
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

// INITIATE eSewa PAYMENT - BROKER SUBSCRIPTION
router.post("/broker-subscription/initiate", protect, async (req, res) => {
  try {
    if (req.user.role !== "broker") {
      return res.status(403).json({ message: "Only brokers can pay subscription." });
    }

    if (req.user.hasBrokerSubscription) {
      return res.status(400).json({ message: "Broker subscription already paid." });
    }

    const amount = 2000;
    const transaction_uuid = `CF-BROKER-${Date.now()}`;
    const product_code = process.env.ESEWA_PRODUCT_CODE;
    const secret = process.env.ESEWA_SECRET_KEY;

    const payment = await Payment.create({
      user: req.user._id,
      payment_for: "broker_subscription",
      payment_amount: amount,
      payment_status: "pending",
      payment_method: "esewa",
      payment_transaction_uuid: transaction_uuid,
    });

    const signature = generateEsewaSignature(
      amount,
      transaction_uuid,
      product_code,
      secret
    );

    res.status(201).json({
      message: "Broker subscription payment initiated",
      paymentId: payment._id,
      esewa: {
        amount,
        tax_amount: 0,
        total_amount: amount,
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
    console.log("Broker subscription initiate error:", error);
    res.status(500).json({ message: "Failed to initiate broker subscription payment" });
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
      if (payment.payment_for === "broker_subscription") {
        return res.redirect(
          `${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}&type=broker-subscription`
        );
      }

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

      if (payment.payment_for === "booking" && payment.booking) {
        const updatedBooking = await Booking.findByIdAndUpdate(
          payment.booking,
          { status: "confirmed" },
          { new: true }
        );

        await Notification.create({
          user: payment.user,
          title: "Booking Confirmed",
          message: "Your booking has been confirmed successfully.",
          type: "booking",
          booking: payment.booking,
        });

        return res.redirect(
          `${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}&bookingId=${payment.booking}`
        );
      }

      if (payment.payment_for === "broker_subscription") {
        await User.findByIdAndUpdate(payment.user, {
          hasBrokerSubscription: true,
          brokerSubscriptionPaidAt: new Date(),
          brokerSubscriptionAmount: Number(payment.payment_amount || 2000),
        });

        return res.redirect(
          `${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}&type=broker-subscription`
        );
      }

      return res.redirect(`${process.env.CLIENT_URL}/payment-success?paymentId=${payment._id}`);
    } else {
      payment.payment_status = "failed";
      await payment.save();

      if (payment.payment_for === "broker_subscription") {
        return res.redirect(
          `${process.env.CLIENT_URL}/payment-failure?paymentId=${payment._id}&type=broker-subscription`
        );
      }

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