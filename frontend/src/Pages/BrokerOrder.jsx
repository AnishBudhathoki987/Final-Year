import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCarSide,
  FaCheckCircle,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

function BookingStatusPill({ status }) {
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
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 border border-amber-100">
      Pending
    </span>
  );
}

function PurchaseStatusPill({ status }) {
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
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 border border-blue-100">
      Processing
    </span>
  );
}

export default function BrokerOrders({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [bookingsRes, purchasesRes] = await Promise.all([
        axios.get("/api/bookings/broker/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/purchases/broker/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBookings(bookingsRes.data?.bookings || []);
      setPurchases(purchasesRes.data?.purchases || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load broker orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "broker") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const counts = useMemo(
    () => ({
      bookings: bookings.length,
      purchases: purchases.length,
    }),
    [bookings, purchases]
  );

  const handlePurchaseAction = async (id, action) => {
    try {
      await axios.put(
        `/api/purchases/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Orders
            </h1>
            <p className="mt-2 text-slate-500">
              View bookings on your rent vehicles and purchase requests on your
              sale vehicles.
            </p>
          </div>

          <button
            onClick={() => navigate("/broker/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6 max-w-3xl">
          <StatCard
            icon={<FaCalendarAlt />}
            label="TOTAL BOOKINGS"
            value={counts.bookings}
          />
          <StatCard
            icon={<FaClipboardList />}
            label="PURCHASE REQUESTS"
            value={counts.purchases}
          />
        </div>

        <div className="mt-8 inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("bookings")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              tab === "bookings"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-600"
            }`}
          >
            Booked Cars
          </button>
          <button
            type="button"
            onClick={() => setTab("purchases")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              tab === "purchases"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-600"
            }`}
          >
            Purchase Requests
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-3xl bg-white border border-slate-100 p-10">
            <p className="text-slate-500">Loading...</p>
          </div>
        ) : tab === "bookings" ? (
          <div className="mt-6 space-y-4">
            {bookings.length === 0 ? (
              <EmptyState text="No bookings found for your rent vehicles." />
            ) : (
              bookings.map((b) => <BookingCard key={b._id} booking={b} />)
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {purchases.length === 0 ? (
              <EmptyState text="No purchase requests found for your sale vehicles." />
            ) : (
              purchases.map((p) => (
                <PurchaseCard
                  key={p._id}
                  purchase={p}
                  onConfirm={() =>
                    handlePurchaseAction(p._id, "broker-confirm")
                  }
                  onCancel={() =>
                    handlePurchaseAction(p._id, "broker-cancel")
                  }
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }) {
  const v = booking.vehicle || {};
  const u = booking.user || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row gap-5">
        <img
          src={img}
          alt={v.title || "Vehicle"}
          className="h-32 w-full md:w-44 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FaUser className="text-slate-400" />
                  {u.username || "User"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {booking.pickupLocation || v.location || "—"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  {booking.startDate
                    ? new Date(booking.startDate).toLocaleDateString()
                    : "—"}{" "}
                  -{" "}
                  {booking.endDate
                    ? new Date(booking.endDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-extrabold text-slate-900">
                {fmt(booking.totalPrice)}
              </p>
              <div className="mt-2">
                <BookingStatusPill status={booking.status} />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to={`/vehicles/${v._id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
            >
              <FaCarSide /> View Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ purchase, onConfirm, onCancel }) {
  const v = purchase.vehicle || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  const canAct = (purchase.status || "").toLowerCase() === "pending";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row gap-5">
        <img
          src={img}
          alt={v.title || "Vehicle"}
          className="h-32 w-full md:w-44 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <FaUser className="text-slate-400" />
                  {purchase.fullName}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaPhoneAlt className="text-slate-400" />
                  {purchase.phone}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {purchase.address}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaMoneyBillWave className="text-slate-400" />
                  {fmt(purchase.vehiclePrice)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mt-2">
                <PurchaseStatusPill status={purchase.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={`/vehicles/${v._id}`}
              className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
            >
              View Vehicle
            </Link>

            {canAct && (
              <>
                <button
                  onClick={onConfirm}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition"
                  type="button"
                >
                  Accept Purchase
                </button>

                <button
                  onClick={onCancel}
                  className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                  type="button"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] p-6">
      <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <div className="mt-4 text-xs font-extrabold text-slate-500 tracking-wider">
        {label}
      </div>
      <div className="mt-2 text-4xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <FaTimesCircle className="mx-auto text-3xl text-slate-300" />
      <p className="mt-3 text-slate-500 font-semibold">{text}</p>
    </div>
  );
}