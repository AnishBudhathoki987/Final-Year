import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaCarSide, FaSearch } from "react-icons/fa";

const PER_PAGE = 6;
const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

export default function AdminVehicles({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user, navigate]);

  const loadVehicles = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("/api/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data?.vehicles || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && token) loadVehicles();
  }, [user, token]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.title?.toLowerCase().includes(search.toLowerCase()) ||
        v.brand?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase()) ||
        v.createdBy?.username?.toLowerCase().includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || v.type === typeFilter;

      const currentStatus = v.isDeleted ? "deleted" : v.status || "active";
      const matchesStatus =
        statusFilter === "all" || currentStatus === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filteredVehicles.length / PER_PAGE) || 1;

  const paginatedVehicles = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredVehicles.slice(start, start + PER_PAGE);
  }, [filteredVehicles, page]);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Vehicles</h1>
            <p className="mt-2 text-slate-500">
              View all vehicle listings across the platform.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FaCarSide className="text-blue-600" />
              Vehicles List
            </h2>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vehicle or broker"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>

              <button
                onClick={loadVehicles}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-slate-50"
                type="button"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="px-6 pb-4 text-sm text-slate-500 font-semibold">
            Showing {filteredVehicles.length} vehicles
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-extrabold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">VEHICLE</th>
                  <th className="px-6 py-4">TYPE</th>
                  <th className="px-6 py-4">PRICE</th>
                  <th className="px-6 py-4">BROKER</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4">LOCATION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-slate-500">
                      Loading vehicles...
                    </td>
                  </tr>
                ) : paginatedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-slate-500">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  paginatedVehicles.map((v) => {
                    const status = v.isDeleted ? "Deleted" : v.status || "Active";
                    return (
                      <tr key={v._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                v.images?.[0] ||
                                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                              }
                              alt={v.title}
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{v.title}</div>
                              <div className="text-xs text-slate-500">
                                {v.brand || "—"} {v.model || ""}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 capitalize font-semibold text-slate-700">
                          {v.type}
                        </td>

                        <td className="px-6 py-5 font-semibold text-slate-700">
                          {v.type === "rent"
                            ? `${fmt(v.pricePerDay)} / day`
                            : fmt(v.price)}
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-900">
                            {v.createdBy?.username || "Broker"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {v.createdBy?.email || "—"}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            {status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-slate-600">{v.location}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50"
      >
        Prev
      </button>
      <div className="text-sm font-bold text-slate-700">
        {page} / {totalPages}
      </div>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}