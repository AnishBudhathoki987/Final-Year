import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const PAYMENTS_PER_PAGE = 4;

export default function MyPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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

  const totalPages = useMemo(() => {
    return Math.ceil(payments.length / PAYMENTS_PER_PAGE) || 1;
  }, [payments]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * PAYMENTS_PER_PAGE;
    const end = start + PAYMENTS_PER_PAGE;
    return payments.slice(start, end);
  }, [payments, page]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              My Payments
            </h1>
            <p className="mt-2 text-slate-500">
              View your booking payment history.
            </p>
          </div>

          <button
            onClick={() => navigate("/user/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 border border-slate-100">
            No payments found.
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4">
              {paginatedPayments.map((p) => (
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

            {payments.length > PAYMENTS_PER_PAGE && (
              <div className="mt-6 rounded-2xl bg-white border border-slate-100 px-5 py-4 flex items-center justify-between shadow-sm">
                <p className="text-sm font-semibold text-slate-500">
                  Showing{" "}
                  <span className="font-extrabold text-slate-900">
                    {(page - 1) * PAYMENTS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-extrabold text-slate-900">
                    {Math.min(page * PAYMENTS_PER_PAGE, payments.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-extrabold text-slate-900">
                    {payments.length}
                  </span>{" "}
                  payments
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    Prev
                  </button>

                  <div className="text-sm font-extrabold text-slate-900">
                    {page} / {totalPages}
                  </div>

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}