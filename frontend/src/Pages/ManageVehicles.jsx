import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCarSide } from "react-icons/fa";

export default function ManageVehicles({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ protect
  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // ✅ filter
  const [typeFilter, setTypeFilter] = useState("all"); // all | rent | sale

  const filteredItems = useMemo(() => {
    if (typeFilter === "all") return items;
    return items.filter((v) => v.type === typeFilter);
  }, [items, typeFilter]);

  // ✅ DELETE CONFIRM MODAL STATE (NEW)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMine = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/vehicles/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.vehicles || [];
      setItems(list);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your vehicles.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "broker") loadMine();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const formatNPR = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

  // ✅ OPEN CONFIRM MODAL INSTEAD OF confirm() (CHANGED)
  const onDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // ✅ CONFIRM DELETE (NEW)
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/vehicles/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((x) => x._id !== deleteId));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // ✅ CLOSE MODAL (NEW)
  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const resolveImg = (v) => {
    const img = v?.images?.[0] || v?.image;
    return (
      img ||
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/broker/dashboard")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/broker/add-vehicle")}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              type="button"
            >
              <FaPlus /> Add Vehicle
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mt-6">
          <h1 className="text-3xl font-extrabold text-slate-900">Manage Vehicles</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, edit, and delete your listings.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              typeFilter === "all" ? "bg-white text-blue-600 shadow" : "text-slate-600"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("rent")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              typeFilter === "rent" ? "bg-white text-blue-600 shadow" : "text-slate-600"
            }`}
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("sale")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              typeFilter === "sale" ? "bg-white text-blue-600 shadow" : "text-slate-600"
            }`}
          >
            Sale
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* List */}
        <div className="mt-6 rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FaCarSide className="text-blue-600" />
              Your Listings
            </h2>

            <button
              onClick={loadMine}
              className="text-sm font-bold text-blue-600 hover:underline"
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-extrabold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">VEHICLE</th>
                  <th className="px-6 py-4">TYPE</th>
                  <th className="px-6 py-4">PRICE</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-slate-500">
                      No vehicles found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={resolveImg(v)}
                            alt={v.title}
                            className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">{v.title}</div>
                            <div className="text-xs text-slate-500">
                              <Link
                                to={`/vehicles/${v._id}`}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                View Public Page
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-extrabold ${
                            v.type === "sale"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {v.type === "sale" ? "SALE" : "RENT"}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-bold text-slate-700">
                        {v.type === "rent"
                          ? `${formatNPR(v.pricePerDay)} / day`
                          : formatNPR(v.price)}
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-600 capitalize">
                          {v.status || "active"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => navigate(`/broker/edit-vehicle/${v._id}`)}
                            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 grid place-items-center text-slate-600"
                            title="Edit"
                            type="button"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => onDelete(v._id)}
                            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 grid place-items-center text-rose-600"
                            title="Delete"
                            type="button"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 text-center text-xs text-slate-400">
            Showing {filteredItems.length} vehicle(s)
          </div>
        </div>
      </div>

      {/* ✅ CUSTOM DELETE CONFIRM MODAL (NEW) */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Confirm Delete</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                disabled={deleting}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60"
                type="button"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}