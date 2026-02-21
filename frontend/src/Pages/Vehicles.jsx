// src/Pages/Vehicles.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaMapMarkerAlt, FaGasPump, FaCogs, FaUsers, FaHeart } from "react-icons/fa";

export default function Vehicles({ user }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // ✅ URL -> initial applied filters
  const initialType = params.get("type") || "all";
  const initialQ = params.get("search") || "";
  const initialCategory = params.get("category") || "All Types";
  const initialLocation = params.get("location") || "";

  // =========================
  // ✅ Draft (typing) states
  // =========================
  const [listingType, setListingType] = useState(initialType); // all | rent | sale
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);

  // =========================
  // ✅ Applied states (ONLY used for filtering & API)
  // =========================
  const [appliedType, setAppliedType] = useState(initialType);
  const [appliedQ, setAppliedQ] = useState(initialQ);
  const [appliedCategory, setAppliedCategory] = useState(initialCategory);
  const [appliedLocation, setAppliedLocation] = useState(initialLocation);

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState(() => new Set());

  // =========================
  // ✅ Compare
  // =========================
  const LS_KEY = "carfusion_compare_ids";
  const MAX_COMPARE = 2;

  const [compareIds, setCompareIds] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
    } catch {
      return [];
    }
  });

  const saveCompare = (next) => {
    const cleaned = Array.isArray(next) ? next.slice(0, MAX_COMPARE) : [];
    setCompareIds(cleaned);
    localStorage.setItem(LS_KEY, JSON.stringify(cleaned));
  };

  const toggleCompare = (id) => {
    const has = compareIds.includes(id);

    if (has) {
      saveCompare(compareIds.filter((x) => x !== id));
      return;
    }

    if (compareIds.length >= MAX_COMPARE) {
      alert(`You can compare only ${MAX_COMPARE} vehicles.`);
      return;
    }

    saveCompare([...compareIds, id]);
  };

  const clearCompare = () => saveCompare([]);
  // =========================

  const formatNPR = (n) => {
    if (n === null || n === undefined) return "—";
    return `NPR ${Number(n).toLocaleString("en-US")}`;
  };

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchVehicles = async (sp) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/vehicles?${sp.toString()}`);
      const list = Array.isArray(res.data) ? res.data : res.data?.vehicles || [];
      setVehicles(list);
    } catch (err) {
      console.log("Vehicles fetch failed:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Build params from APPLIED state (not draft)
  const buildParamsFromApplied = () => {
    const next = new URLSearchParams();

    if (appliedType !== "all") next.set("type", appliedType);
    if (appliedQ.trim()) next.set("search", appliedQ.trim());
    if (appliedCategory !== "All Types") next.set("category", appliedCategory);
    if (appliedLocation.trim()) next.set("location", appliedLocation.trim());

    return next;
  };

  // ✅ Initial load using URL (applied)
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    fetchVehicles(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Back/forward: URL -> both draft + applied
  const skipSyncRef = useRef(false);
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    const pType = params.get("type") || "all";
    const pQ = params.get("search") || "";
    const pCategory = params.get("category") || "All Types";
    const pLocation = params.get("location") || "";

    // draft
    setListingType(pType);
    setQ(pQ);
    setCategory(pCategory);
    setLocation(pLocation);

    // applied
    setAppliedType(pType);
    setAppliedQ(pQ);
    setAppliedCategory(pCategory);
    setAppliedLocation(pLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const setParamsSafe = (next) => {
    skipSyncRef.current = true;
    setParams(next);
  };

  // ✅ MANUAL APPLY: draft -> applied, then fetch
  const applyFilters = () => {
    setAppliedType(listingType);
    setAppliedQ(q);
    setAppliedCategory(category);
    setAppliedLocation(location);

    // build params from what user just applied
    const next = new URLSearchParams();
    if (listingType !== "all") next.set("type", listingType);
    if (q.trim()) next.set("search", q.trim());
    if (category !== "All Types") next.set("category", category);
    if (location.trim()) next.set("location", location.trim());

    setParamsSafe(next);
    fetchVehicles(next);
  };

  const clearFilters = () => {
    // draft
    setListingType("all");
    setQ("");
    setCategory("All Types");
    setLocation("");

    // applied
    setAppliedType("all");
    setAppliedQ("");
    setAppliedCategory("All Types");
    setAppliedLocation("");

    const next = new URLSearchParams(); // empty => all
    setParamsSafe(next);
    fetchVehicles(next);
  };

  // ✅ NOW filtering is MANUAL because it uses APPLIED values only
  const visibleList = useMemo(() => {
    return vehicles
      .filter((v) => (appliedType === "all" ? true : v.type === appliedType))
      .filter((v) =>
        appliedQ.trim()
          ? (v.title || "").toLowerCase().includes(appliedQ.trim().toLowerCase())
          : true
      )
      .filter((v) =>
        appliedCategory === "All Types"
          ? true
          : (v.category || "").toLowerCase() === appliedCategory.toLowerCase()
      )
      .filter((v) =>
        appliedLocation.trim()
          ? (v.location || "").toLowerCase().includes(appliedLocation.trim().toLowerCase())
          : true
      );
  }, [vehicles, appliedType, appliedQ, appliedCategory, appliedLocation]);

  return (
    <div className="bg-[#f6f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Browse Vehicles</h1>
            <p className="mt-2 text-slate-500">Find the perfect car for your journey.</p>
          </div>

          {/* Clear + Apply */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearFilters}
              type="button"
              className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
            >
              Clear
            </button>

            <button
              onClick={applyFilters}
              type="button"
              className="rounded-3xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-10">
          <div className="rounded-[40px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.08)] px-4 sm:px-6 py-5">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              {/* Search */}
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3.5 flex-1 min-w-[240px]">
                <div className="h-9 w-9 rounded-2xl bg-slate-100 grid place-items-center">
                  <FaSearch className="text-slate-400" />
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search vehicles (make, model...)"
                  className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                />
              </div>

              {/* All / Rent / Buy */}
              <div className="inline-flex rounded-3xl bg-slate-100 p-1.5 self-start xl:self-auto">
                <button
                  type="button"
                  onClick={() => setListingType("all")}
                  className={`px-6 py-2.5 rounded-3xl text-sm font-extrabold transition ${
                    listingType === "all"
                      ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={`px-6 py-2.5 rounded-3xl text-sm font-extrabold transition ${
                    listingType === "rent"
                      ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("sale")}
                  className={`px-6 py-2.5 rounded-3xl text-sm font-extrabold transition ${
                    listingType === "sale"
                      ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Buy
                </button>
              </div>

              {/* Category */}
              <div className="min-w-[210px]">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option>All Types</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Hatchback</option>
                  <option>Pickup</option>
                  <option>EV</option>
                </select>
              </div>

              {/* Location */}
              <div className="min-w-[260px] flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3.5">
                <div className="h-9 w-9 rounded-2xl bg-slate-100 grid place-items-center">
                  <FaMapMarkerAlt className="text-slate-400" />
                </div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10">
          {loading ? (
            <div className="text-slate-500">Loading vehicles...</div>
          ) : visibleList.length === 0 ? (
            <div className="rounded-[28px] bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
              <h3 className="text-2xl font-extrabold text-slate-900">No vehicles found</h3>
              <p className="mt-2 text-slate-500">Add a listing from Broker Dashboard or change filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleList.map((v) => {
                const badge = v.type === "rent" ? "FOR RENT" : "FOR SALE";
                const badgeCls = v.type === "rent" ? "bg-blue-600" : "bg-emerald-500";
                const isCompared = compareIds.includes(v._id);

                return (
                  <div
                    key={v._id}
                    className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden"
                  >
                    <div className="relative h-52">
                      <img
                        src={
                          v.image ||
                          v.images?.[0] ||
                          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop"
                        }
                        alt={v.title}
                        className="h-full w-full object-cover"
                      />

                      <div className={`absolute top-4 left-4 ${badgeCls} text-white text-xs font-extrabold px-3 py-1.5 rounded-full`}>
                        {badge}
                      </div>

                      <button
                        onClick={() => toggleFav(v._id)}
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 grid place-items-center"
                        type="button"
                        title="Save"
                      >
                        <FaHeart className={favorites.has(v._id) ? "text-rose-500" : "text-slate-400"} />
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-extrabold text-slate-900">{v.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-400" />
                        {v.location}
                      </p>

                      <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-600">
                        <div className="flex flex-col items-center gap-2">
                          <FaGasPump className="text-slate-400" />
                          <span>{v.fuelType || "—"}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <FaCogs className="text-slate-400" />
                          <span>{v.transmission || "—"}</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <FaUsers className="text-slate-400" />
                          <span>{v.seats ? `${v.seats} Seats` : "—"}</span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            {v.type === "rent" ? "Price per day" : "Total Price"}
                          </p>
                          <p className="text-xl font-extrabold text-slate-900">
                            {v.type === "rent" ? formatNPR(v.pricePerDay || 0) : formatNPR(v.price || 0)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCompare(v._id)}
                            className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${
                              isCompared
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                            type="button"
                          >
                            {isCompared ? "Compared" : "Compare"}
                          </button>

                          <button
                            onClick={() => navigate(`/vehicles/${v._id}`, { state: { vehicle: v } })}
                            className="rounded-2xl bg-blue-50 text-blue-700 px-4 py-2.5 text-sm font-bold hover:bg-blue-100 transition"
                            type="button"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Compare Bar */}
          {compareIds.length > 0 && (
            <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
              <div className="max-w-6xl mx-auto rounded-[28px] bg-white/90 backdrop-blur border border-slate-200 shadow-[0_25px_70px_rgba(0,0,0,0.12)] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-extrabold text-slate-900">
                    Compare ({compareIds.length}/{MAX_COMPARE})
                  </div>
                  <button
                    onClick={clearCompare}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700"
                    type="button"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={() => navigate("/compare")}
                  disabled={compareIds.length < 2}
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-60"
                  type="button"
                >
                  Compare Now
                </button>
              </div>
            </div>
          )}

          {/* Pagination UI placeholder */}
          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-slate-500">
            <button className="hover:text-slate-700" type="button">
              ← Previous
            </button>
            <div className="h-12 w-12 rounded-full bg-blue-600 text-white grid place-items-center font-bold shadow-lg shadow-blue-600/25">
              1
            </div>
            <button className="hover:text-slate-700" type="button">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}