// src/Pages/Vehicles.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaGasPump,
  FaCogs,
  FaUsers,
  FaHeart,
} from "react-icons/fa";

export default function Vehicles() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // ✅ Backend uses: type = "rent" | "sale"
  const initialType = params.get("type") || "rent"; // rent | sale
  const initialQ = params.get("q") || "";
  const initialCategory = params.get("category") || "All Types";
  const initialLocation = params.get("location") || "";
  const initialMaxPrice = Number(params.get("maxPrice") || 10000000);
  const initialSort = params.get("sort") || "recommended"; // recommended | newest | priceLow | priceHigh

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

  // ✅ demo data shown if backend has none yet
  const demoVehicles = useMemo(
    () => [
      {
        _id: "demo1",
        type: "rent",
        title: "Toyota Prado 2018",
        location: "Kathmandu, Nepal",
        fuelType: "Diesel",
        transmission: "Automatic",
        seats: 7,
        pricePerDay: 25000,
        image:
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop",
      },
      {
        _id: "demo2",
        type: "sale",
        title: "Hyundai Creta 2021",
        location: "Pokhara, Nepal",
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 5,
        price: 4500000,
        image:
          "https://images.unsplash.com/photo-1605559424843-9e61a7b5b4b2?q=80&w=2000&auto=format&fit=crop",
      },
      {
        _id: "demo3",
        type: "sale",
        title: "Kia Sportage 2020",
        location: "Lalitpur, Nepal",
        fuelType: "Diesel",
        transmission: "Automatic",
        seats: 5,
        price: 6200000,
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop",
      },
      {
        _id: "demo4",
        type: "rent",
        title: "Honda City 2022",
        location: "Bhaktapur, Nepal",
        fuelType: "Petrol",
        transmission: "CVT",
        seats: 5,
        pricePerDay: 12000,
        image:
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2000&auto=format&fit=crop",
      },
      {
        _id: "demo5",
        type: "sale",
        title: "Ford Ranger 2019",
        location: "Chitwan, Nepal",
        fuelType: "Diesel",
        transmission: "Auto",
        seats: 5,
        price: 8500000,
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2200&auto=format&fit=crop",
      },
      {
        _id: "demo6",
        type: "rent",
        title: "BYD Atto 3",
        location: "Kathmandu, Nepal",
        fuelType: "Electric",
        transmission: "Auto",
        seats: 5,
        pricePerDay: 18000,
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2400&auto=format&fit=crop",
      },
    ],
    []
  );

  const applyFilters = () => {
    const next = new URLSearchParams();

    next.set("type", listingType);
    if (q.trim()) next.set("q", q.trim());
    if (category !== "All Types") next.set("category", category);
    if (location.trim()) next.set("location", location.trim());
    next.set("maxPrice", String(maxPrice));
    next.set("available", String(availableNow));
    next.set("sort", sort);

    setParams(next);
    fetchVehicles(next);
  };

  const fetchVehicles = async (sp = params) => {
    setLoading(true);

    try {
      // ✅ Adjust to your backend query keys
      // We send: type, q, category, location, maxPrice, sort
      const res = await axios.get(`/api/vehicles?${sp.toString()}`);

      // Accept both {vehicles: []} OR [] response
      const list = Array.isArray(res.data) ? res.data : res.data?.vehicles || [];

      setVehicles(list);
    } catch (err) {
      console.log("Vehicles fetch failed:", err);
      setVehicles([]); // fallback will show
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchVehicles(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // use demo if backend empty
  const visibleList = useMemo(() => {
    const source = vehicles.length > 0 ? vehicles : demoVehicles;

    // frontend local filtering (so UI works even if backend doesn't support filters yet)
    return source
      .filter((v) => (listingType ? v.type === listingType : true))
      .filter((v) => (q.trim() ? (v.title || "").toLowerCase().includes(q.trim().toLowerCase()) : true))
      .filter((v) => (category === "All Types" ? true : (v.category || "").toLowerCase() === category.toLowerCase()))
      .filter((v) => (location.trim() ? (v.location || "").toLowerCase().includes(location.trim().toLowerCase()) : true))
      .filter((v) => {
        const priceValue = v.type === "rent" ? Number(v.pricePerDay || 0) : Number(v.price || 0);
        return priceValue <= maxPrice;
      });
  }, [vehicles, demoVehicles, listingType, q, category, location, maxPrice]);

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatNPR = (n) => {
    if (!n && n !== 0) return "—";
    return `NPR ${Number(n).toLocaleString("en-US")}`;
  };

  return (
    <div className="bg-[#f6f7fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-14">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
              Browse Vehicles
            </h1>
            <p className="mt-2 text-slate-500">
              Find the perfect car for your journey.
            </p>
          </div>

          <div className="min-w-[220px]">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filter bar card (second design style) */}
        <div className="mt-10 rounded-[28px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.08)] border border-slate-100 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* search */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-1">
              <FaSearch className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search make, model..."
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Rent / Buy toggle */}
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => setListingType("rent")}
                className={`px-6 py-2 rounded-2xl text-sm font-bold transition ${
                  listingType === "rent" ? "bg-white text-blue-600 shadow" : "text-slate-600"
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => setListingType("sale")}
                className={`px-6 py-2 rounded-2xl text-sm font-bold transition ${
                  listingType === "sale" ? "bg-white text-blue-600 shadow" : "text-slate-600"
                }`}
              >
                Buy
              </button>
            </div>

            {/* Type/category */}
            <div className="min-w-[220px]">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none"
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
            <div className="min-w-[240px] flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <FaMapMarkerAlt className="text-slate-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Price slider */}
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>Max Price</span>
                <span className="text-slate-500">{formatNPR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Available now */}
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={availableNow}
                onChange={(e) => setAvailableNow(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              Available Now
            </label>

            {/* Apply */}
            <button
              onClick={applyFilters}
              className="rounded-2xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition whitespace-nowrap"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10">
          {loading ? (
            <div className="text-slate-500">Loading vehicles...</div>
          ) : visibleList.length === 0 ? (
            <div className="rounded-[28px] bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
              <h3 className="text-2xl font-extrabold text-slate-900">No vehicles found</h3>
              <p className="mt-2 text-slate-500">Try changing filters or search keyword.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleList.map((v) => {
                const badge =
                  v.type === "rent" ? "FOR RENT" : "FOR SALE";
                const badgeCls =
                  v.type === "rent"
                    ? "bg-blue-600"
                    : "bg-emerald-500";

                return (
                  <div
                    key={v._id}
                    className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden"
                  >
                    <div className="relative h-52">
                      <img
                        src={v.image || (v.images?.[0] ?? "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop")}
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
                            {v.type === "rent"
                              ? formatNPR(v.pricePerDay || 0)
                              : formatNPR(v.price || 0)}
                          </p>
                        </div>

                        <button
                          onClick={() => navigate(`/vehicles/${v._id}`)}
                          className="rounded-2xl bg-blue-50 text-blue-700 px-5 py-2.5 text-sm font-bold hover:bg-blue-100 transition"
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

          {/* Pagination UI placeholder (same look) */}
          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-slate-500">
            <button className="hover:text-slate-700">← Previous</button>
            <div className="h-12 w-12 rounded-full bg-blue-600 text-white grid place-items-center font-bold shadow-lg shadow-blue-600/25">
              1
            </div>
            <button className="hover:text-slate-700">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
