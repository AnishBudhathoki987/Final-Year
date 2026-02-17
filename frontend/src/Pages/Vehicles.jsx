import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Vehicles() {
  const [params, setParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState(params.get("type") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        // sync URL
        const next = {};
        if (type) next.type = type;
        if (location) next.location = location;
        if (maxPrice) next.maxPrice = maxPrice;
        if (q) next.q = q;
        setParams(next);

        const res = await axios.get("/api/vehicles", {
          params: { type, location, maxPrice, q },
        });
        setVehicles(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, location, maxPrice, q]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Vehicles</h1>
            <p className="text-slate-600">Browse rentals and second-hand cars.</p>
          </div>

          <Link
            to="/compare"
            className="px-4 h-10 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Compare
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 grid gap-3 md:grid-cols-4 bg-white p-4 rounded-xl border border-slate-200">
          <select
            className="h-11 rounded-lg border border-slate-200 px-3"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>

          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            placeholder="Location (Kathmandu)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            placeholder="Search (Fortuner, Creta...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <p className="mt-6 text-slate-600">Loading...</p>
        ) : vehicles.length === 0 ? (
          <p className="mt-6 text-slate-600">No vehicles found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v._id} v={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ v }) {
  const img = v.images?.[0] || "https://via.placeholder.com/800x600?text=CarFusion";
  const price = v.type === "rent" ? `NPR ${v.pricePerDay}/day` : `NPR ${v.price}`;

  const addToCompare = () => {
    const current = JSON.parse(localStorage.getItem("compare") || "[]");
    if (!current.includes(v._id)) {
      const next = [...current, v._id].slice(-3);
      localStorage.setItem("compare", JSON.stringify(next));
      alert("Added to compare");
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
      <img src={img} alt={v.title} className="w-full h-44 object-cover" />
      <div className="p-4">
        <p className="text-xs font-bold text-blue-600 uppercase">{v.type}</p>
        <h3 className="font-black text-slate-900 line-clamp-1">{v.title}</h3>
        <p className="text-sm text-slate-500">{v.location}</p>
        <p className="mt-2 font-bold text-slate-900">{price}</p>

        <div className="mt-4 flex gap-2">
          <Link
            to={`/vehicles/${v._id}`}
            className="flex-1 h-10 rounded-lg bg-blue-600 text-white font-bold inline-flex items-center justify-center hover:bg-blue-700"
          >
            View
          </Link>
          <button
            onClick={addToCompare}
            className="h-10 px-3 rounded-lg border border-slate-200 font-bold hover:bg-slate-100"
            title="Add to compare"
          >
            ⇄
          </button>
        </div>
      </div>
    </div>
  );
}
