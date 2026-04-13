import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCarSide,
  FaCheckCircle,
  FaHistory,
  FaIdCard,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;
const HISTORY_PER_PAGE = 4;

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

export default function BrokerOrderHistory({ user }) {
  const navigate = useNavigate();
  const { numberPlate } = useParams();
  const token = localStorage.getItem("token");

  const decodedPlate = decodeURIComponent(numberPlate || "").trim().toUpperCase();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/api/bookings/broker/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const allBookings = res.data?.bookings || [];
        const filtered = allBookings.filter((b) => {
          const plate = String(b?.vehicle?.numberPlate || "").trim().toUpperCase();
          return plate === decodedPlate;
        });

        setBookings(filtered);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load booking history.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "broker") fetchBookings();
  }, [user, token, navigate, decodedPlate]);

  const selectedVehicle = useMemo(() => {
    return bookings[0]?.vehicle || null;
  }, [bookings]);

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  }, [bookings]);

  const totalHistoryPages = useMemo(() => {
    return Math.ceil(bookings.length / HISTORY_PER_PAGE) || 1;
  }, [bookings]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;
    const end = start + HISTORY_PER_PAGE;
    return bookings.slice(start, end);
  }, [bookings, historyPage]);

  useEffect(() => {
    setHistoryPage(1);
  }, [decodedPlate]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Car Booking History
            </h1>
            <p className="mt-2 text-slate-500">
              View all bookings for vehicle number plate: {decodedPlate || "—"}
            </p>
          </div>

          <button
            onClick={() => navigate("/broker/orders")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back to Orders
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
        ) : bookings.length === 0 ? (
          <EmptyState text={`No booking history found for ${decodedPlate}.`} />
        ) : (
          <>
            <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FaCarSide className="text-blue-600" />
                Selected Car
              </h3>

              <div className="mt-5 flex flex-col md:flex-row gap-5">
                <img
                  src={
                    selectedVehicle?.images?.[0] ||
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={selectedVehicle?.title || "Vehicle"}
                  className="h-32 w-full md:w-44 rounded-2xl object-cover border border-slate-100"
                />

                <div className="flex-1">
                  <h4 className="text-2xl font-extrabold text-slate-900">
                    {selectedVehicle?.title || "Vehicle"}
                  </h4>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <FaMapMarkerAlt className="text-slate-400" />
                      {selectedVehicle?.location || "—"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <FaIdCard className="text-slate-400" />
                      {decodedPlate}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-extrabold">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                      {bookings.length} bookings
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                      {fmt(totalRevenue)}
                    </span>
                  </div>

                  {selectedVehicle?._id && (
                    <div className="mt-4">
                      <Link
                        to={`/vehicles/${selectedVehicle._id}`}
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <FaCarSide /> View Vehicle
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FaHistory className="text-blue-600" />
                Booking History for {decodedPlate}
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {paginatedHistory.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>

            {bookings.length > HISTORY_PER_PAGE && (
              <PaginationBar
                currentPage={historyPage}
                totalPages={totalHistoryPages}
                totalItems={bookings.length}
                perPage={HISTORY_PER_PAGE}
                onPrev={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
                onNext={() =>
                  setHistoryPage((prev) => Math.min(prev + 1, totalHistoryPages))
                }
                label="bookings"
              />
            )}
          </>
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
                  {u.username || u.name || "User"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {booking.pickupLocation || v.location || "—"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaIdCard className="text-slate-400" />
                  {v.numberPlate || "No plate"}
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

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPrev,
  onNext,
  label,
}) {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="mt-6 rounded-3xl bg-white border border-slate-100 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm font-semibold text-slate-500">
        Showing <span className="font-extrabold text-slate-900">{start}</span>{" "}
        to <span className="font-extrabold text-slate-900">{end}</span> of{" "}
        <span className="font-extrabold text-slate-900">{totalItems}</span>{" "}
        {label}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Prev
        </button>

        <div className="text-sm font-extrabold text-slate-900">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="mt-6 rounded-3xl bg-white border border-slate-100 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <FaTimesCircle className="mx-auto text-3xl text-slate-300" />
      <p className="mt-3 text-slate-500 font-semibold">{text}</p>
    </div>
  );
}