import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get("paymentId");
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/payments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const found = res.data.payments.find((p) => p._id === paymentId);
        setPayment(found || null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      loadPayment();
    } else {
      setLoading(false);
    }
  }, [paymentId, bookingId]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white border border-slate-100 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.06)] text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Payment Successful
        </h1>
        <p className="mt-2 text-slate-500">
          Your booking payment has been completed successfully.
        </p>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading payment details...</p>
        ) : payment ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
            <p>
              <strong>Transaction ID:</strong>{" "}
              {payment.payment_transaction_uuid}
            </p>
            <p>
              <strong>eSewa Ref ID:</strong> {payment.esewa_ref_id || "-"}
            </p>
            <p>
              <strong>Amount:</strong> NPR{" "}
              {Number(payment.payment_amount).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {payment.payment_status}
            </p>
            <p>
              <strong>Vehicle:</strong> {payment.vehicle?.title || "-"}
            </p>
          </div>
        ) : (
          <p className="mt-6 text-slate-500">Payment completed.</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/my-bookings"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            View My Bookings
          </Link>

          <Link
            to="/my-payments"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            View Payment History
          </Link>
        </div>
      </div>
    </div>
  );
}