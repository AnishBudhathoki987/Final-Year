// src/Pages/Vehicles.jsx  ✅ Demo data REMOVED (all other logic kept same)
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaSearch, FaMapMarkerAlt, FaGasPump, FaCogs, FaUsers, FaHeart } from "react-icons/fa";

export default function Vehicles({ user }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // ✅ Backend uses: type = "rent" | "sale"
  const initialType = params.get("type") || "rent";
  const initialQ = params.get("search") || ""; // ✅ match backend
  const initialCategory = params.get("category") || "All Types";
  const initialLocation = params.get("location") || "";
  const initialMaxPrice = Number(params.get("maxPrice") || 10000000);
  const initialSort = params.get("sort") || "recommended";

  const [listingType, setListingType] = useState(initialType);
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [availableNow, setAvailableNow] = useState(params.get("available") === "true");
  const [sort, setSort] = useState(initialSort);

  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState(() => new Set());

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

  const fetchVehicles = async (sp = params) => {
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

  const applyFilters = () => {
    const next = new URLSearchParams();

    next.set("type", listingType);

    if (q.trim()) next.set("search", q.trim()); // ✅ match backend key
    if (category !== "All Types") next.set("category", category);
    if (location.trim()) next.set("location", location.trim());

    // ✅ maxPrice only (backend supports maxPrice)
    next.set("maxPrice", String(maxPrice));
    next.set("available", String(availableNow));

    // ✅ map recommended to newest (backend supports newest/priceLow/priceHigh)
    const safeSort = sort === "recommended" ? "newest" : sort;
    next.set("sort", safeSort);

    setParams(next);
    fetchVehicles(next);
  };

  // initial load
  useEffect(() => {
    fetchVehicles(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Demo removed: show ONLY real vehicles from backend
  const visibleList = useMemo(() => {
    return vehicles
      .filter((v) => (listingType ? v.type === listingType : true))
      .filter((v) =>
        q.trim() ? (v.title || "").toLowerCase().includes(q.trim().toLowerCase()) : true
      )
      .filter((v) =>
        category === "All Types"
          ? true
          : (v.category || "").toLowerCase() === category.toLowerCase()
      )
      .filter((v) =>
        location.trim()
          ? (v.location || "").toLowerCase().includes(location.trim().toLowerCase())
          : true
      )
      .filter((v) => {
        const priceValue = v.type === "rent" ? Number(v.pricePerDay || 0) : Number(v.price || 0);
        return priceValue <= maxPrice;
      });
  }, [vehicles, listingType, q, category, location, maxPrice]);

  // Nice slider fill
  const sliderMax = 10000000;
  const sliderPct = Math.max(0, Math.min(100, (maxPrice / sliderMax) * 100));

  const clearFilters = () => {
    setListingType("rent");
    setQ("");
    setCategory("All Types");
    setLocation("");
    setMaxPrice(10000000);
    setAvailableNow(false);
    setSort("recommended");

    const next = new URLSearchParams();
    next.set("type", "rent");
    next.set("maxPrice", String(10000000));
    next.set("available", "false");
    next.set("sort", "newest"); // backend safe
    setParams(next);
    fetchVehicles(next);
  };

  return (
    <div className="bg-[#f6f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-14">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">Browse Vehicles</h1>
            <p className="mt-2 text-slate-500">Find the perfect car for your journey.</p>
          </div>

          <div className="w-full sm:w-[260px]">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-10">
          <div className="rounded-[36px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.08)] p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              {/* Search pill */}
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3.5 flex-1 min-w-[220px]">
                <div className="h-9 w-9 rounded-2xl bg-slate-100 grid place-items-center">
                  <FaSearch className="text-slate-400" />
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search vehicles (make, model...)"
                  className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>

              {/* Rent/Buy toggle pill */}
              <div className="inline-flex rounded-3xl bg-slate-100 p-1.5 self-start xl:self-auto">
                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={`px-7 py-2.5 rounded-3xl text-sm font-extrabold transition ${
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
                  className={`px-7 py-2.5 rounded-3xl text-sm font-extrabold transition ${
                    listingType === "sale"
                      ? "bg-white text-blue-600 shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Buy
                </button>
              </div>

              {/* Category pill */}
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

              {/* Location pill */}
              <div className="min-w-[260px] flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3.5">
                <div className="h-9 w-9 rounded-2xl bg-slate-100 grid place-items-center">
                  <FaMapMarkerAlt className="text-slate-400" />
                </div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>

              {/* Max price slider */}
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
                  <span>Max Price</span>
                  <span className="text-slate-600">{formatNPR(maxPrice)}</span>
                </div>

                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={sliderMax}
                    step={50000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #2563eb ${sliderPct}%, #e2e8f0 ${sliderPct}%)`,
                    }}
                  />
                </div>
              </div>

              {/* Available now */}
              <label className="flex items-center gap-2 text-sm font-extrabold text-slate-700 whitespace-nowrap px-2">
                <input
                  type="checkbox"
                  checked={availableNow}
                  onChange={(e) => setAvailableNow(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                Available Now
              </label>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  type="button"
                  className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
                >
                  Clear
                </button>

                <button
                  onClick={applyFilters}
                  type="button"
                  className="rounded-3xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition whitespace-nowrap"
                >
                  Apply Filters
                </button>
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

                      <div
                        className={`absolute top-4 left-4 ${badgeCls} text-white text-xs font-extrabold px-3 py-1.5 rounded-full`}
                      >
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
                            {v.type === "rent"
                              ? formatNPR(v.pricePerDay || 0)
                              : formatNPR(v.price || 0)}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/vehicles/${v._id}`, { state: { vehicle: v } })}
                          className="rounded-2xl bg-blue-50 text-blue-700 px-5 py-2.5 text-sm font-bold hover:bg-blue-100 transition"
                          type="button"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
