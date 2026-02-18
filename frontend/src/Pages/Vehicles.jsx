import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Vehicles() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ get initial type from URL: /vehicles?type=rent OR sale
  const initialType = searchParams.get("type");
  const safeInitialType = initialType === "sale" ? "sale" : "rent";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState(safeInitialType); // rent | sale
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // simple client pagination (because backend not paginating)
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ✅ debounce search so API isn't called every keypress
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("type", type);
      return next;
    });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // ✅ Fetch vehicles when filters change (INCLUDING search)
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, location, maxPrice, debouncedSearch]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/vehicles", {
        params: {
          type, // rent|sale
          location: location || undefined,
          maxPrice: maxPrice || undefined,
          q: debouncedSearch?.trim() || undefined,
          // status not passed => backend defaults to active ✅
        },
      });

      setVehicles(res.data || []);
    } catch (err) {
      console.log(err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setPage(1);
  };

  // ✅ client-side pagination
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(vehicles.length / pageSize));
  }, [vehicles.length]);

  const pageVehicles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return vehicles.slice(start, start + pageSize);
  }, [vehicles, page]);

  return (
    <div className="bg-[#f6f6f8] min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
            Browse Vehicles
          </h1>
          <p className="text-slate-500">
            Find the perfect car for your journey or purchase.
          </p>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-10 border border-slate-200">
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full xl:w-[430px]">
              <input
                type="text"
                placeholder="Search by make, model, or keyword..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
              />
              <div className="text-xs text-slate-500 mt-2">
                Showing <span className="font-semibold">{vehicles.length}</span>{" "}
                results
              </div>
            </div>

            {/* Rent / Purchase Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setType("rent")}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  type === "rent"
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500"
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => setType("sale")}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  type === "sale"
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500"
                }`}
              >
                Purchase
              </button>
            </div>

            {/* Location */}
            <input
              type="text"
              placeholder="Location (e.g. Kathmandu)"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-[250px] h-12 px-4 rounded-xl border border-slate-200 bg-white"
            />

            {/* Max Price */}
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-[180px] h-12 px-4 rounded-xl border border-slate-200 bg-white"
            />

            <button
              onClick={resetFilters}
              className="text-blue-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* VEHICLE GRID */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No vehicles found.
            <div className="mt-2 text-sm">
              (Tip: Add a vehicle as Broker — status must be{" "}
              <span className="font-semibold">active</span>)
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageVehicles.map((v) => (
                <div
                  key={v._id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-slate-200"
                >
                  {/* IMAGE */}
                  <div className="relative h-56 bg-slate-100 flex items-center justify-center">
                    {/* ✅ keep empty / placeholder if no image */}
                    {v.images && v.images.length > 0 ? (
                      <img
                        src={v.images[0]}
                        alt={v.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="text-slate-400 text-center px-6">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm font-semibold">Image Placeholder</p>
                        <p className="text-xs">Your uploaded image will show here</p>
                      </div>
                    )}

                    <div
                      className={`absolute top-3 left-3 text-white text-xs font-extrabold px-3 py-1.5 rounded-full ${
                        v.type === "rent" ? "bg-blue-600" : "bg-emerald-500"
                      }`}
                    >
                      {v.type === "rent" ? "Rent" : "Purchase"}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                        {v.title}
                      </h3>
                      {v.year ? (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {v.year}
                        </span>
                      ) : null}
                    </div>

                    <div className="text-sm text-slate-500 mt-2">
                      {v.fuelType || "—"} • {v.transmission || "—"} •{" "}
                      {v.category || "—"}
                    </div>

                    <div className="text-sm text-slate-500 mt-2">
                      📍 {v.location}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Price</p>
                        {v.type === "rent" ? (
                          <p className="text-blue-600 font-extrabold">
                            NPR {v.pricePerDay ?? 0}{" "}
                            <span className="text-xs font-semibold text-slate-400">
                              /day
                            </span>
                          </p>
                        ) : (
                          <p className="text-blue-600 font-extrabold">
                            NPR {v.price ?? 0}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/vehicles/${v._id}`)}
                        className={`px-4 py-2 rounded-xl font-bold transition ${
                          v.type === "rent"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {v.type === "rent" ? "Book Now" : "Details"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center mt-12 gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-200 disabled:opacity-50"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).slice(0, 8).map((_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-bold ${
                      page === p
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-200 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
