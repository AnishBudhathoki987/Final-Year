import { useEffect, useState } from "react";
import axios from "axios";

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/payments/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data.payments || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900">
          My Payments
        </h1>
        <p className="mt-2 text-slate-500">View your booking payment history.</p>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 border border-slate-100">
            No payments found.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {payments.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {p.vehicle?.title || "Vehicle"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Transaction: {p.payment_transaction_uuid}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      p.payment_status === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : p.payment_status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <p>
                    <strong>Amount:</strong> NPR{" "}
                    {Number(p.payment_amount).toLocaleString()}
                  </p>
                  <p>
                    <strong>Method:</strong> {p.payment_method}
                  </p>
                  <p>
                    <strong>eSewa Ref:</strong> {p.esewa_ref_id || "-"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(p.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}