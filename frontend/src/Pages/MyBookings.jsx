import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaTimesCircle,
  FaCheckCircle,
  FaBan,
  FaCarSide,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

const toDate = (d) => {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const isFutureOrToday = (d) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const x = toDate(d);
  return x && x.getTime() >= today.getTime();
};

const daysBetween = (start, end) => {
  const s = toDate(start);
  const e = toDate(end);
  if (!s || !e) return 0;
  const ms = e.getTime() - s.getTime();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
};

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
      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700 border border-rose-100">
        <FaBan /> Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 border border-slate-200">
      <FaClock /> Pending
    </span>
  );
}

export default function MyBookings({ user }) {
  const navigate = useNavigate();

  const [tab, setTab] = useState("upcoming"); // upcoming | history
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
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
      const res = await axios.get("/api/bookings/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.bookings || [];
      setBookings(list);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalized = (bookings || []).map((b) => {
      const days = daysBetween(b.startDate, b.endDate);
      const total = Number(b.totalPrice || 0);
      const start = toDate(b.startDate);
      const end = toDate(b.endDate);
      const status = (b.status || "").toLowerCase();

      const completedByTime = end && end.getTime() <= today.getTime();
      const computedStatus =
        status === "cancelled"
          ? "cancelled"
          : completedByTime
          ? "completed"
          : status || "confirmed";

      return {
        ...b,
        __days: days,
        __total: total,
        __start: start,
        __end: end,
        __computedStatus: computedStatus,
      };
    });

    const upcoming = normalized.filter((b) => {
      if (b.__computedStatus === "cancelled") return false;
      return isFutureOrToday(b.startDate) || isFutureOrToday(b.endDate);
    });

    const history = normalized.filter((b) => {
      if (b.__computedStatus === "cancelled") return true;
      const end = b.__end;
      return end && end.getTime() <= today.getTime();
    });

    upcoming.sort(
      (a, b) => (a.__start?.getTime() || 0) - (b.__start?.getTime() || 0)
    );
    history.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { upcoming, history };
  }, [bookings]);

  const list = tab === "upcoming" ? computed.upcoming : computed.history;

  const openCancel = (booking) => {
    setSelected(booking);
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
        `/api/bookings/${selected._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConfirmOpen(false);
      setSelected(null);
      await fetchMine();
    } catch (e) {
      alert(e?.response?.data?.message || "Cancel failed.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="text-right">
            <p className="text-xs font-extrabold text-slate-400">My Bookings</p>
            <p className="text-sm text-slate-500">
              View and manage your reservations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center justify-end">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setTab("history")}
              className={
                tab === "history"
                  ? "rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white"
                  : "rounded-xl px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
              }
              type="button"
            >
              History
            </button>
            <button
              onClick={() => setTab("upcoming")}
              className={
                tab === "upcoming"
                  ? "rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white"
                  : "rounded-xl px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
              }
              type="button"
            >
              Upcoming
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-[28px] bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
              <p className="text-slate-500">Loading your bookings...</p>
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
          ) : list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <div className="space-y-4">
              {list.map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  tab={tab}
                  onCancel={() => openCancel(b)}
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
                  Cancel booking?
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
                {new Date(selected?.startDate).toLocaleDateString()} →{" "}
                {new Date(selected?.endDate).toLocaleDateString()}
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
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, tab, onCancel }) {
  const v = booking.vehicle || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  const status = (booking.status || "").toLowerCase();
  const canCancel = tab === "upcoming" && status !== "cancelled";

  return (
    <div className="rounded-[24px] bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-4 sm:p-5 hover:shadow-[0_28px_85px_rgba(0,0,0,0.08)] transition">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-[200px]">
          <img
            src={img}
            alt={v.title || "Vehicle"}
            className="h-[120px] w-full sm:h-[130px] rounded-2xl object-cover border border-slate-100"
          />
        </div>

        {/* Middle */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {v.location || "—"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  {new Date(booking.startDate).toLocaleDateString()} →{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2">
                  <FaClock className="text-slate-400" />
                  {booking.__days || 0} day(s)
                </span>
              </div>

              <div className="mt-3">
                <StatusPill status={booking.status} />
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-[11px] font-extrabold text-slate-400">
                TOTAL PRICE
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {fmt(booking.totalPrice)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to={`/vehicles/${v._id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              <FaCarSide /> View Vehicle
            </Link>

            {canCancel ? (
              <button
                onClick={onCancel}
                className="ml-auto rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                type="button"
              >
                Cancel Booking
              </button>
            ) : (
              <span className="ml-auto text-xs text-slate-400 font-semibold">
                {status === "cancelled"
                  ? "Cancelled"
                  : tab === "history"
                  ? "History"
                  : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ tab }) {
  return (
    <div className="rounded-[28px] bg-white border border-slate-100 p-12 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center">
        <FaCarSide className="text-slate-500" />
      </div>
      <h3 className="mt-4 text-xl font-extrabold text-slate-900">
        No bookings found
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        {tab === "upcoming"
          ? "You don’t have any upcoming bookings right now."
          : "You don’t have any booking history yet."}
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