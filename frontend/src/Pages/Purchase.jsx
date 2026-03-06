import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaCarSide,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

export default function Purchase({ user }) {
  const navigate = useNavigate();
  const { id } = useParams(); // vehicleId

  const [vehicle, setVehicle] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // form
  const [fullName, setFullName] = useState(user?.name || user?.username || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // status
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

        // only allow sale vehicle
        if (!v || v.type !== "sale") {
          setVehicle(null);
          setError("This vehicle is not available for purchase.");
          return;
        }

        setVehicle(v);
        setAddress(v?.location || "");
      } catch (e) {
        setVehicle(null);
        setError("Vehicle not found.");
      } finally {
        setLoadingVehicle(false);
      }
    };

    load();
  }, [id]);

  const submitPurchase = async () => {
    setError("");
    setSuccess("");

    if (!fullName.trim()) return setError("Full name is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!address.trim()) return setError("Address is required.");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      await axios.post("/api/purchases", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Purchase request submitted successfully!");
      setTimeout(() => navigate("/my-purchases"), 800);
    } catch (e) {
      setError(e?.response?.data?.message || "Purchase request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const brokerObj = vehicle?.createdBy || {};
  const ownerName =
    brokerObj.name ||
    brokerObj.fullName ||
    brokerObj.username ||
    [brokerObj.firstName, brokerObj.lastName].filter(Boolean).join(" ") ||
    "Broker";

  const ownerEmail = brokerObj.email || "";

  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-[28px] bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <p className="text-slate-500">Loading purchase page...</p>
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
            <h2 className="text-2xl font-extrabold text-slate-900">
              Vehicle not available
            </h2>
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
            <p className="text-xs font-bold text-slate-400">PURCHASE THIS VEHICLE</p>
            <p className="text-lg font-extrabold text-slate-900">{vehicle.title}</p>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid lg:grid-cols-[1.25fr_0.75fr] gap-7">
          {/* Left: Form */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Purchase this Vehicle
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Please provide your details below to submit a purchase request for
              this vehicle.
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

            <div className="mt-6">
              <Field label="Full Name">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaUser className="text-slate-400" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-4">
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

            <div className="mt-4">
              <Field label="Delivery / Permanent Address">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaMapMarkerAlt className="text-slate-400" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm outline-none"
                    placeholder="e.g. Baneshwor, Kathmandu"
                  />
                </div>
              </Field>
            </div>

            <button
              onClick={submitPurchase}
              disabled={submitting}
              className="mt-7 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-60"
              type="button"
            >
              {submitting ? "Submitting..." : "Confirm Purchase →"}
            </button>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600 flex items-start gap-3">
              <FaLock className="text-blue-600 mt-0.5" />
              <p>
                Your request will be reviewed by the broker before confirmation.
                No payment is required at this step.
              </p>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 sm:p-8 h-fit">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Vehicle Summary
            </h3>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-100">
              <div className="relative h-56">
                <img
                  src={
                    vehicle.images?.[0] ||
                    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={vehicle.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-white">
                  FOR SALE
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-2xl font-extrabold text-white drop-shadow">
                    {vehicle.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-500">Total Price</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-900">
                {fmt(vehicle.price)}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                <FaMapMarkerAlt className="text-slate-400" />
                {vehicle.location || "Location not available"}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                <FaCarSide className="text-slate-400" />
                {vehicle.mileage
                  ? `${Number(vehicle.mileage).toLocaleString("en-US")} km`
                  : "Mileage N/A"}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-xs font-extrabold tracking-wide text-slate-400">
                BROKER INFORMATION
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 font-extrabold text-slate-700">
                  {(ownerName || "B").slice(0, 1).toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="text-lg font-extrabold text-slate-900">
                    {ownerName}
                  </p>
                  <p className="text-sm text-slate-500">Verified Broker</p>
                  {ownerEmail ? (
                    <p className="text-xs text-slate-400">{ownerEmail}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <Link
              to="/my-purchases"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              View My Purchases
            </Link>
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