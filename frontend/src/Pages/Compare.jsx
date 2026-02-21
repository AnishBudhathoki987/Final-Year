// src/Pages/Compare.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaTimes,
  FaCarSide,
  FaMapMarkerAlt,
  FaGasPump,
  FaCogs,
  FaUsers,
  FaTachometerAlt,
  FaTag,
  FaCheckCircle,
} from "react-icons/fa";

const LS_KEY = "carfusion_compare_ids";
const MAX_COMPARE = 2;

export default function Compare({ user }) {
  const navigate = useNavigate();

  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]); // fetched objects
  const [error, setError] = useState("");

  const saveIds = (next) => {
    const clean = Array.isArray(next) ? next.slice(0, MAX_COMPARE) : [];
    setIds(clean);
    localStorage.setItem(LS_KEY, JSON.stringify(clean));
  };

  const clearAll = () => saveIds([]);

  const removeFromCompare = (id) => {
    saveIds(ids.filter((x) => x !== id));
  };

  const formatNPR = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

  const badgeText = (v) => (v?.type === "rent" ? "FOR RENT" : "FOR SALE");
  const badgeClass = (v) => (v?.type === "rent" ? "bg-blue-600" : "bg-emerald-500");

  const priceLabel = (v) => (v?.type === "rent" ? "per day" : "total");
  const priceValue = (v) => (v?.type === "rent" ? v?.pricePerDay : v?.price);

  const coverImg = (v) =>
    v?.image ||
    v?.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop";

  // fetch each id via existing endpoint GET /api/vehicles/:id
  useEffect(() => {
    const load = async () => {
      setError("");
      setVehicles([]);
      if (ids.length === 0) return;

      setLoading(true);
      try {
        const results = await Promise.all(ids.map((id) => axios.get(`/api/vehicles/${id}`)));
        const list = results.map((r) => r.data?.vehicle ?? r.data).filter(Boolean);
        setVehicles(list);
      } catch (e) {
        setError("Failed to load vehicles for comparison. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [ids]);

  // Keep card order same as ids
  const slots = useMemo(() => {
    const map = new Map(vehicles.map((v) => [v._id, v]));
    return ids.map((id) => map.get(id) || null);
  }, [ids, vehicles]);

  // Spec rows (like your screenshot)
  const specRows = useMemo(() => {
    const a = slots[0];
    const b = slots[1];

    const pick = (v, key) => {
      if (!v) return "—";
      const val = v?.[key];
      if (val === null || val === undefined || val === "") return "—";
      return String(val);
    };

    return [
      { label: "Vehicle Type", icon: <FaCarSide />, a: a?.category || a?.type || "—", b: b?.category || b?.type || "—" },
      { label: "Brand", icon: <FaTag />, a: pick(a, "brand"), b: pick(b, "brand") },
      { label: "Model", icon: <FaTag />, a: pick(a, "model"), b: pick(b, "model") },
      { label: "Year", icon: <FaTag />, a: pick(a, "year"), b: pick(b, "year") },
      { label: "Fuel Type", icon: <FaGasPump />, a: pick(a, "fuelType"), b: pick(b, "fuelType") },
      { label: "Transmission", icon: <FaCogs />, a: pick(a, "transmission"), b: pick(b, "transmission") },
      { label: "Seating Capacity", icon: <FaUsers />, a: a?.seats ? `${a.seats} persons` : "—", b: b?.seats ? `${b.seats} persons` : "—" },
      {
        label: "Mileage",
        icon: <FaTachometerAlt />,
        a: a?.mileage ? `${Number(a.mileage).toLocaleString("en-US")} km` : "—",
        b: b?.mileage ? `${Number(b.mileage).toLocaleString("en-US")} km` : "—",
      },
      { label: "Location", icon: <FaMapMarkerAlt />, a: pick(a, "location"), b: pick(b, "location") },
      { label: "Availability", icon: <FaCheckCircle />, a: a ? (a.isAvailable ? "Available" : "Not available") : "—", b: b ? (b.isAvailable ? "Available" : "Not available") : "—" },
      { label: "Daily Rate / Price", icon: <FaTag />, a: a ? formatNPR(priceValue(a)) : "—", b: b ? formatNPR(priceValue(b)) : "—" },
    ];
  }, [slots]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Top Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
              type="button"
            >
              Clear All
            </button>

            <Link
              to="/vehicles"
              className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
            >
              Browse Vehicles
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="mt-7">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Compare Vehicles</h1>
          <p className="mt-2 text-slate-500">
            Analyze specs side-by-side to find your perfect drive for any terrain.
          </p>
        </div>

        {/* States */}
        {ids.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <div className="mx-auto h-14 w-14 rounded-3xl bg-blue-50 border border-blue-100 grid place-items-center text-blue-600">
              <FaCarSide className="text-2xl" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-slate-900">No vehicles selected</h3>
            <p className="mt-2 text-slate-500">
              Go to Vehicles page and select <span className="font-extrabold">Compare</span> on two vehicles.
            </p>
            <Link
              to="/vehicles"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="mt-10 text-slate-500">Loading compared vehicles...</div>
            ) : error ? (
              <div className="mt-10 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : (
              <>
                {/* Top cards like screenshot */}
                <div className="mt-10 grid lg:grid-cols-2 gap-8">
                  {/* Slot 1 */}
                  <CompareCard
                    v={slots[0]}
                    onRemove={() => slots[0] && removeFromCompare(slots[0]._id)}
                    formatNPR={formatNPR}
                    badgeText={badgeText}
                    badgeClass={badgeClass}
                    priceLabel={priceLabel}
                    priceValue={priceValue}
                    coverImg={coverImg}
                  />

                  {/* Slot 2 placeholder or card */}
                  {slots[1] ? (
                    <CompareCard
                      v={slots[1]}
                      onRemove={() => slots[1] && removeFromCompare(slots[1]._id)}
                      formatNPR={formatNPR}
                      badgeText={badgeText}
                      badgeClass={badgeClass}
                      priceLabel={priceLabel}
                      priceValue={priceValue}
                      coverImg={coverImg}
                    />
                  ) : (
                    <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-10 grid place-items-center text-center">
                      <div className="h-14 w-14 rounded-3xl bg-slate-50 border border-slate-100 grid place-items-center text-slate-400">
                        <FaCarSide className="text-2xl" />
                      </div>
                      <h3 className="mt-5 text-lg font-extrabold text-slate-900">Select another vehicle</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Add a vehicle to compare features side-by-side.
                      </p>
                      <Link
                        to="/vehicles"
                        className="mt-5 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Browse Inventory
                      </Link>
                    </div>
                  )}
                </div>

                {/* Specs table */}
                <div className="mt-10 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-slate-900">Technical Specifications</h2>

                    <div className="text-xs font-extrabold text-slate-400 flex items-center gap-8">
                      <span className="text-blue-600">
                        {slots[0]?.title ? slots[0].title : "Not selected"}
                      </span>
                      <span>{slots[1]?.title ? slots[1].title : "Not selected"}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <tbody className="divide-y divide-slate-100">
                        {specRows.map((r) => (
                          <tr key={r.label} className="hover:bg-slate-50/60 transition">
                            <td className="px-6 py-4 w-[280px]">
                              <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                <span className="text-slate-400">{r.icon}</span>
                                {r.label}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                              {r.a}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-400">
                              {r.b === "—" ? "—" : r.b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 text-center text-xs text-slate-400">
                    Tip: Select vehicles from the Vehicles page to update this comparison.
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CompareCard({
  v,
  onRemove,
  formatNPR,
  badgeText,
  badgeClass,
  priceLabel,
  priceValue,
  coverImg,
}) {
  const navigate = useNavigate();

  if (!v) return null;

  return (
    <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="relative h-56">
        <img src={coverImg(v)} alt={v.title} className="h-full w-full object-cover" />

        <div
          className={`absolute top-4 left-4 ${badgeClass(v)} text-white text-xs font-extrabold px-3 py-1.5 rounded-full`}
        >
          {badgeText(v)}
        </div>

        <button
          onClick={onRemove}
          className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 grid place-items-center shadow hover:bg-slate-50 transition"
          type="button"
          title="Remove"
        >
          <FaTimes className="text-slate-600" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{v.title}</h3>
            <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
              <FaMapMarkerAlt className="text-slate-400" />
              {v.location}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] font-bold text-slate-500 uppercase">Price</p>
            <p className="text-sm font-extrabold text-blue-600">{formatNPR(priceValue(v))}</p>
            <p className="text-[11px] font-bold text-slate-400">{priceLabel(v)}</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-[#f6f7fb] border border-slate-100 p-4 grid grid-cols-4 gap-3 text-center">
          <MiniSpec icon={<FaGasPump />} value={v.fuelType || "—"} />
          <MiniSpec icon={<FaCogs />} value={v.transmission || "—"} />
          <MiniSpec icon={<FaUsers />} value={v.seats ? `${v.seats} seats` : "—"} />
          <MiniSpec
            icon={<FaTachometerAlt />}
            value={v.mileage ? `${Number(v.mileage).toLocaleString("en-US")} km` : "—"}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/vehicles/${v._id}`)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            View Details
          </button>

          <button
            onClick={() => alert(v.type === "rent" ? "Booking in Sprint 3" : "Checkout in Sprint 3")}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
            type="button"
          >
            {v.type === "rent" ? "Book Now" : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniSpec({ icon, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-3">
      <div className="mx-auto h-9 w-9 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <p className="mt-2 text-[11px] font-extrabold text-slate-700 truncate">{value}</p>
    </div>
  );
}