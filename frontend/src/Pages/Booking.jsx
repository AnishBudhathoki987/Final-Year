// src/Pages/Booking.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

const toISO = (d) => {
  if (!d) return "";
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};

const dayDiff = (a, b) => {
  if (!a || !b) return 0;
  const start = new Date(a);
  const end = new Date(b);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? Math.ceil(ms / (1000 * 60 * 60 * 24)) : 0;
};

export default function Booking({ user }) {
  const navigate = useNavigate();
  const { id } = useParams(); // vehicleId

  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");

  // status
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null); // null|true|false
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // load vehicle
  useEffect(() => {
    const load = async () => {
      setLoadingVehicle(true);
      setError("");
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        const v = res.data?.vehicle ?? res.data;
        setVehicle(v);
        setPickupLocation(v?.location || "");
      } catch (e) {
        setVehicle(null);
        setError("Vehicle not found.");
      } finally {
        setLoadingVehicle(false);
      }
    };
    load();
  }, [id]);

  const days = useMemo(() => dayDiff(startDate, endDate), [startDate, endDate]);

  const total = useMemo(() => {
    const ppd = Number(vehicle?.pricePerDay || 0);
    return days > 0 ? days * ppd : 0;
  }, [days, vehicle]);

  const minEnd = useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + 1);
    return toISO(d);
  }, [startDate]);

  // availability check
  useEffect(() => {
    const run = async () => {
      setAvailable(null);
      setError("");

      if (!startDate || !endDate) return;
      if (days <= 0) return;

      setChecking(true);
      try {
        const res = await axios.get("/api/bookings/check", {
          params: { vehicleId: id, startDate, endDate },
        });

        setAvailable(!!res.data?.available);

        if (res.data?.available === false) {
          setError("Selected dates are not available. Try different dates.");
        }
      } catch (e) {
        console.log("Availability check error:", e?.response?.data || e?.message);
        setAvailable(null);
        setError(e?.response?.data?.message || "Failed to check availability.");
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [id, startDate, endDate, days]);

  const submitBooking = async () => {
    setError("");
    setSuccess("");

    if (!startDate || !endDate) return setError("Please select start and end date.");
    if (days <= 0) return setError("End date must be after start date.");
    if (available === false) return setError("Selected dates are not available.");
    if (!pickupLocation.trim()) return setError("Pickup location is required.");
    if (!fullName.trim()) return setError("Full name is required.");
    if (!phone.trim()) return setError("Phone number is required.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: id,
        startDate,
        endDate,
        pickupLocation: pickupLocation.trim(),
        // fullName, phone (save later if you add to Booking model)
      };

      await axios.post("/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Booking confirmed! Payment will be added later.");
      setTimeout(() => navigate("/my-bookings"), 700);
    } catch (e) {
      setError(e?.response?.data?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-[28px] bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <p className="text-slate-500">Loading booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="mt-6 rounded-[28px] bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <h2 className="text-2xl font-extrabold text-slate-900">Vehicle not found</h2>
            <p className="mt-2 text-slate-500">{error}</p>
            <Link
              to="/vehicles"
              className="mt-6 inline-block text-blue-600 font-bold hover:underline"
            >
              Back to Vehicles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-400">BOOK THIS VEHICLE</p>
            <p className="text-lg font-extrabold text-slate-900">{vehicle.title}</p>
          </div>
        </div>

        {/* Layout like sample */}
        <div className="mt-8 grid lg:grid-cols-[1.25fr_0.75fr] gap-7">
          {/* Left: Form */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">Book this Vehicle</h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete your details to reserve your ride instantly.
            </p>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 flex items-center gap-2">
                <FaCheckCircle /> {success}
              </div>
            )}

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Field label="Pickup Date">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaCalendarAlt className="text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    min={toISO(new Date())}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value && endDate <= e.target.value) setEndDate("");
                    }}
                    className="w-full text-sm outline-none"
                  />
                </div>
              </Field>

              <Field label="Return Date">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaCalendarAlt className="text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    min={minEnd || toISO(new Date())}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm outline-none"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Pickup Location">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaMapMarkerAlt className="text-slate-400" />
                  <input
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="Pickup location"
                  />
                </div>
              </Field>
              <p className="mt-2 text-xs text-slate-400">
                Auto-filled from vehicle location. You can edit if needed.
              </p>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaUser className="text-slate-400" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </Field>

              <Field label="Phone Number">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaPhoneAlt className="text-slate-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="text-slate-500 font-semibold">
                {checking
                  ? "Checking availability..."
                  : available === true
                  ? "Available ✅"
                  : available === false
                  ? "Not available ❌"
                  : "Select dates to check"}
              </div>

              <div className="text-slate-700 font-extrabold">
                {days > 0 ? `${days} day(s)` : "—"}
              </div>
            </div>

            <button
              onClick={submitBooking}
              disabled={submitting || checking || available === false}
              className="mt-7 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-60"
              type="button"
            >
              {submitting ? "Confirming..." : "Confirm Booking →"}
            </button>

            <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
              <FaLock /> Payment will be added in later sprint.
            </div>
          </div>

          {/* Right: Summary */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 sm:p-8 h-fit">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-400">FOR RENT</p>
              <p className="text-xs font-bold text-slate-500">PRICE DETAILS</p>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <img
                src={
                  vehicle.images?.[0] ||
                  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                }
                alt={vehicle.title}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-100"
              />
              <div>
                <p className="font-extrabold text-slate-900">{vehicle.title}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {vehicle.location}
                </p>
              </div>
            </div>

            {/* ✅ PRICE DETAILS (NO SERVICE FEE) */}
            <div className="mt-6 rounded-3xl bg-[#f6f7fb] border border-slate-100 p-5">
              <Row
                label={`NPR ${Number(vehicle.pricePerDay || 0).toLocaleString(
                  "en-US"
                )} x ${days || 0} day(s)`}
                value={days > 0 ? fmt(total) : "—"}
              />
              <Row label="Insurance & Protection" value="Included" green />
              <div className="my-3 h-px bg-slate-200/70" />
              <Row label="Total (NPR)" value={days > 0 ? fmt(total) : "—"} strong />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-100 p-5">
              <p className="text-xs font-bold text-slate-400">BOOKING FOR</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 grid place-items-center font-extrabold text-slate-700">
                  {(user?.name || user?.username || "U").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {user?.name || user?.username || "User"}
                  </p>
                  <p className="text-xs text-slate-500">Verified account</p>
                </div>
              </div>
            </div>

            <Link
              to="/my-bookings"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              View My Bookings
            </Link>

            <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
              <FaPhoneAlt /> Contact support later.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold text-slate-600">{label}</p>
      {children}
    </div>
  );
}

function Row({ label, value, strong, green }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <span className="text-slate-500 font-semibold">{label}</span>
      <span
        className={
          strong
            ? "text-slate-900 font-extrabold"
            : green
            ? "text-emerald-600 font-extrabold"
            : "text-slate-700 font-bold"
        }
      >
        {value}
      </span>
    </div>
  );
}