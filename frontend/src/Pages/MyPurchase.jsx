import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCarSide,
  FaTimesCircle,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

function StatusPill({ status }) {
  const s = (status || "").toLowerCase();

  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
        <FaCheckCircle /> Confirmed
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500 border border-slate-200">
        <FaBan /> Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 border border-amber-100">
      <FaTimesCircle /> Pending
    </span>
  );
}

export default function MyPurchases({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  // cancel modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMine = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.get("/api/purchases/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.purchases || [];
      setPurchases(list);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCancel = (purchase) => {
    setSelected(purchase);
    setConfirmOpen(true);
  };

  const doCancel = async () => {
    if (!selected?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setCancelling(true);
    try {
      await axios.put(
        `/api/purchases/${selected._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmOpen(false);
      setSelected(null);
      await fetchMine();
    } catch (e) {
      alert(e?.response?.data?.message || "Cancel request failed.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              My Purchases
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View and manage your vehicle purchase requests
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-[28px] bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
              <p className="text-slate-500">Loading your purchases...</p>
            </div>
          ) : error ? (
            <div className="rounded-[28px] bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
              <p className="text-rose-600 font-extrabold">{error}</p>
              <button
                onClick={fetchMine}
                className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white"
                type="button"
              >
                Retry
              </button>
            </div>
          ) : purchases.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {purchases.map((purchase) => (
                <PurchaseCard
                  key={purchase._id}
                  purchase={purchase}
                  onCancel={() => openCancel(purchase)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white border border-slate-100 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-slate-900">
                  Cancel purchase request?
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl p-2 hover:bg-slate-100"
                type="button"
              >
                <FaTimesCircle className="text-slate-400" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-sm font-extrabold text-slate-900">
                {selected?.vehicle?.title || "Vehicle"}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Requested on{" "}
                {selected?.createdAt
                  ? new Date(selected.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
                type="button"
                disabled={cancelling}
              >
                Keep
              </button>

              <button
                onClick={doCancel}
                className="rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
                type="button"
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PurchaseCard({ purchase, onCancel }) {
  const v = purchase.vehicle || {};
  const status = (purchase.status || "").toLowerCase();
  const canCancel = status === "pending";

  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-4 sm:p-5 hover:shadow-[0_28px_85px_rgba(0,0,0,0.08)] transition">
      <div className="flex flex-col md:flex-row gap-5 md:items-center">
        {/* Image */}
        <div className="w-full md:w-[180px] shrink-0">
          <img
            src={img}
            alt={v.title || "Vehicle"}
            className={`h-[120px] w-full rounded-2xl object-cover border border-slate-100 ${
              status === "cancelled" ? "grayscale opacity-70" : ""
            }`}
          />
        </div>

        {/* Middle */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {v.location || "—"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  {purchase.createdAt
                    ? new Date(purchase.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p
                className={`text-2xl font-extrabold ${
                  status === "cancelled"
                    ? "text-slate-400 line-through"
                    : "text-slate-900"
                }`}
              >
                {fmt(purchase.vehiclePrice || v.price || 0)}
              </p>

              <div className="mt-2">
                <StatusPill status={purchase.status} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {canCancel && (
              <button
                onClick={onCancel}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                type="button"
              >
                Cancel Request
              </button>
            )}

            <Link
              to={`/vehicles/${v._id}`}
              className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
            >
              View Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] bg-white border border-slate-100 p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center">
        <FaCarSide className="text-slate-500" />
      </div>

      <h3 className="mt-4 text-xl font-extrabold text-slate-900">
        No purchases yet
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        You haven't submitted any vehicle purchase requests yet.
      </p>

      <Link
        to="/vehicles"
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
      >
        Browse Vehicles
      </Link>
    </div>
  );
}