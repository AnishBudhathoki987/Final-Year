// src/Pages/VehicleDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaHeart,
  FaMapMarkerAlt,
  FaGasPump,
  FaCogs,
  FaUsers,
  FaTachometerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function VehicleDetails({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // If navigated with state
  const stateVehicle = location.state?.vehicle || null;

  const [vehicle, setVehicle] = useState(stateVehicle);
  const [loading, setLoading] = useState(!stateVehicle);
  const [error, setError] = useState("");

  const [selectedImg, setSelectedImg] = useState(0);
  const [saved, setSaved] = useState(false);

  // ✅ ALWAYS fetch by id (to get populated createdBy), but keep UI instant if state exists
  useEffect(() => {
    if (stateVehicle) {
      setVehicle(stateVehicle);
      setLoading(false);
    }

    const fetchById = async () => {
      setError("");
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        const v = res.data?.vehicle ?? res.data;
        setVehicle(v); // overwrite with full populated version
      } catch {
        setVehicle(null);
        setError("Vehicle not found. Invalid id or listing removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchById();
  }, [id, stateVehicle]);

  useEffect(() => setSelectedImg(0), [vehicle?._id]);

  const images = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.image) return [vehicle.image, ...(vehicle.images || [])].filter(Boolean);
    if (Array.isArray(vehicle.images) && vehicle.images.length) return vehicle.images;
    return [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop",
    ];
  }, [vehicle]);

  const isRent = vehicle?.type === "rent";
  const badgeText = isRent ? "FOR RENT" : "FOR SALE";
  const badgeClass = isRent ? "bg-blue-600" : "bg-emerald-500";

  const formatNPR = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;
  const mainPrice = isRent ? vehicle?.pricePerDay : vehicle?.price;
  const priceLabel = isRent ? "Price per day" : "Total Price";
  const actionText = isRent ? "Book Now" : "Buy Now";

  const onPrimaryAction = () => {
    if (!user) return navigate("/login");
    alert(`${actionText} clicked! (connect to booking/checkout later)`);
  };

  const onMessage = () => {
    if (!user) return navigate("/login");
    alert("Message clicked! (connect to chat later)");
  };

  const onCall = () => alert("Call clicked! (connect to broker contact later)");

  // ✅ Strong broker name resolver
  const brokerObj = vehicle?.createdBy || {};
  const ownerName =
    brokerObj.name ||
    brokerObj.fullName ||
    brokerObj.username ||
    [brokerObj.firstName, brokerObj.lastName].filter(Boolean).join(" ") ||
    "Broker";

  const ownerEmail = brokerObj.email || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <p className="text-slate-500">Loading vehicle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              type="button"
            >
              <FaArrowLeft /> Back
            </button>

            <Link to="/vehicles" className="text-sm font-semibold text-blue-600 hover:underline">
              Back to Browse
            </Link>
          </div>

          <div className="mt-6 rounded-3xl bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <h2 className="text-3xl font-extrabold text-slate-900">Vehicle not found</h2>
            <p className="mt-2 text-slate-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 hover:text-slate-700"
            type="button"
          >
            <FaArrowLeft /> Back to Browse
          </button>
          <span>/</span>
          <span className="capitalize">{vehicle.category || "Vehicles"}</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{vehicle.title}</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* left */}
          <div>
            <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="relative h-[360px]">
                <img src={images[selectedImg]} alt={vehicle.title} className="h-full w-full object-cover" />

                <div className={`absolute top-5 left-5 ${badgeClass} text-white text-xs font-extrabold px-3 py-1.5 rounded-full`}>
                  {badgeText}
                </div>

                <button
                  onClick={() => setSaved((s) => !s)}
                  className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/90 grid place-items-center shadow"
                  type="button"
                  title="Save"
                >
                  <FaHeart className={saved ? "text-rose-500" : "text-slate-400"} />
                </button>
              </div>

              {/* thumbs */}
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={img + idx}
                      onClick={() => setSelectedImg(idx)}
                      className={`relative rounded-2xl overflow-hidden border ${
                        idx === selectedImg ? "border-blue-600" : "border-slate-200"
                      }`}
                      type="button"
                    >
                      <img src={img} alt="thumb" className="h-20 w-full object-cover" />
                      {idx === 3 && images.length > 4 ? (
                        <div className="absolute inset-0 bg-black/45 grid place-items-center text-white text-sm font-bold">
                          +{images.length - 3} photos
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* specs */}
            <div className="mt-8 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-lg font-extrabold text-slate-900">Specifications</h3>

              <div className="mt-5 grid sm:grid-cols-4 gap-4">
                <Spec icon={<FaGasPump />} label="Fuel Type" value={vehicle.fuelType || "—"} />
                <Spec icon={<FaCogs />} label="Transmission" value={vehicle.transmission || "—"} />
                <Spec icon={<FaUsers />} label="Capacity" value={vehicle.seats ? `${vehicle.seats} Seats` : "—"} />
                <Spec
                  icon={<FaTachometerAlt />}
                  label="Mileage"
                  value={vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString("en-US")} km` : "—"}
                />
              </div>
            </div>

            {/* about */}
            <div className="mt-8 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-lg font-extrabold text-slate-900">About this Vehicle</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {vehicle.description || "No description provided yet."}
              </p>
            </div>
          </div>

          {/* right */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 h-fit sticky top-24">
            <h2 className="text-3xl font-extrabold text-slate-900">{vehicle.title}</h2>

            <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
              <FaMapMarkerAlt className="text-slate-400" />
              {vehicle.location}
            </p>

            <div className="mt-6 rounded-3xl bg-[#f6f7fb] p-5 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500">{priceLabel}</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-extrabold text-slate-900">{formatNPR(mainPrice)}</p>
                {isRent ? <span className="text-sm text-slate-500 mb-1">/ Day</span> : null}
              </div>
            </div>

            <button
              onClick={onPrimaryAction}
              className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition flex items-center justify-center gap-2"
              type="button"
            >
              <FaCalendarAlt />
              {actionText}
            </button>

            <div className="mt-3 grid grid-cols-[1fr_56px] gap-3">
              <button
                onClick={onMessage}
                className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                type="button"
              >
                <FaEnvelope /> Message
              </button>

              <button
                onClick={onCall}
                className="rounded-2xl border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 transition"
                type="button"
                title="Call"
              >
                <FaPhoneAlt />
              </button>
            </div>

            {/* LISTED BY */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <p className="text-xs font-bold text-slate-400">LISTED BY</p>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 grid place-items-center font-extrabold text-slate-700">
                    {(ownerName || "B").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{ownerName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <FaCheckCircle className="text-emerald-500" /> Verified Broker
                    </p>
                    {ownerEmail ? <p className="text-xs text-slate-400">{ownerEmail}</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/vehicles" className="text-sm font-semibold text-blue-600 hover:underline">
                ← Back to Vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-[#f6f7fb] border border-slate-100 p-5">
      <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
