// src/Pages/BrokerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaTachometerAlt,
  FaPlus,
  FaCarSide,
  FaUserCircle,
  FaSignOutAlt,
  FaEye,
  FaCheckCircle,
  FaEyeSlash,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function BrokerDashboard({ user, setUser }) {
  const navigate = useNavigate();

  // ✅ Guard: only broker can access
  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [myVehicles, setMyVehicles] = useState([]);

  const loadMyVehicles = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/vehicles/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.vehicles || [];
      setMyVehicles(list);
    } catch (err) {
      console.log("Load mine vehicles failed:", err);
      setMyVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch broker vehicles
  useEffect(() => {
    if (token && user?.role === "broker") loadMyVehicles();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const stats = useMemo(() => {
    const total = myVehicles.length;
    const active = myVehicles.filter((v) => v.status === "active").length;
    const hidden = myVehicles.filter((v) => v.status === "hidden").length;

    const views = myVehicles.reduce((sum, v) => sum + Number(v.views || 0), 0);
    const viewsLabel = views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views || 0);

    return { total, active, hidden, viewsLabel };
  }, [myVehicles]);

  const formatNPR = (n) => `Rs. ${Number(n || 0).toLocaleString("en-US")}`;

  const timeAgo = (iso) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser?.(null);
    navigate("/");
  };

  const handleEdit = (id) => navigate(`/broker/edit-vehicle/${id}`);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this vehicle?");
    if (!ok) return;

    try {
      await axios.delete(`/api/vehicles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // refresh
      setMyVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      console.log("Delete failed:", err);
      alert("Delete failed. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* ===================== SIDEBAR ===================== */}
        <aside className="hidden md:flex w-72 flex-col rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
                CF
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">CarFusion</div>
                <div className="text-xs font-semibold text-slate-500 tracking-wide">
                  BROKER PORTAL
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              type="button"
            >
              <FaHome /> Go to Website
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <SideLink icon={<FaTachometerAlt />} label="Dashboard" to="/broker/dashboard" active />
            <SideLink icon={<FaPlus />} label="Add Vehicle" to="/broker/add-vehicle" />
            <SideLink icon={<FaCarSide />} label="My Vehicles" to="/broker/my-vehicles" />
            <SideLink icon={<FaUserCircle />} label="Profile" to="/broker/profile" />
          </nav>

          <div className="mt-auto p-4">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
              type="button"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* ===================== MAIN ===================== */}
        <main className="flex-1">
          {/* Top header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Broker Dashboard
              </h1>
              <p className="mt-2 text-slate-500">
                Manage your vehicle listings and track activity
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl px-4 py-3 shadow-[0_25px_70px_rgba(0,0,0,0.06)] flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 grid place-items-center font-bold text-slate-700">
                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "B"}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-slate-900">
                  {user?.name || user?.username || "Broker"}
                </div>
                <div className="text-xs font-bold text-blue-600 tracking-wide">
                  PREMIUM BROKER
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FaCarSide />} label="TOTAL VEHICLES" value={stats.total} />
            <StatCard icon={<FaCheckCircle />} label="ACTIVE LISTINGS" value={stats.active} />
            <StatCard icon={<FaEyeSlash />} label="HIDDEN LISTINGS" value={stats.hidden} />
            <StatCard icon={<FaEye />} label="TOTAL VIEWS" value={stats.viewsLabel} />
          </div>

          {/* Primary actions */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/broker/add-vehicle")}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
              type="button"
            >
              <FaPlus /> Add New Vehicle
            </button>

            <button
              onClick={() => navigate("/broker/my-vehicles")}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-blue-600 bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition"
              type="button"
            >
              <FaCarSide /> Manage Listings
            </button>

            <button
              onClick={loadMyVehicles}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              type="button"
            >
              Refresh
            </button>
          </div>

          {/* Recent listings table */}
          <div className="mt-10 rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Recent Listings</h2>
              <Link to="/broker/my-vehicles" className="text-sm font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-extrabold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">VEHICLE</th>
                    <th className="px-6 py-4">MODE</th>
                    <th className="px-6 py-4">PRICE (NPR)</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-10 text-slate-500" colSpan={5}>
                        Loading your listings...
                      </td>
                    </tr>
                  ) : myVehicles.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12" colSpan={5}>
                        <div className="text-center">
                          <div className="text-lg font-extrabold text-slate-900">No listings yet</div>
                          <p className="mt-2 text-sm text-slate-500">
                            Add your first vehicle to start receiving bookings.
                          </p>
                          <button
                            onClick={() => navigate("/broker/add-vehicle")}
                            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
                            type="button"
                          >
                            <FaPlus /> Add Vehicle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    myVehicles.slice(0, 3).map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                v.images?.[0] ||
                                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                              }
                              alt={v.title}
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900">{v.title}</div>
                              <div className="text-xs text-slate-500">
                                Listed {timeAgo(v.createdAt)}
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
                          <span className="inline-flex items-center gap-2 text-sm font-bold">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                v.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            <span className={v.status === "active" ? "text-emerald-600" : "text-slate-500"}>
                              {v.status === "active" ? "Active" : "Hidden"}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(v._id)}
                              className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 grid place-items-center text-slate-600"
                              title="Edit"
                              type="button"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => handleDelete(v._id)}
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

            <div className="p-6 text-center text-sm text-slate-500 font-semibold">
              {myVehicles.length > 3 ? "View All listings →" : " "}
            </div>
          </div>

          {/* Mobile quick links */}
          <div className="md:hidden mt-8 grid grid-cols-2 gap-4">
            <QuickBtn to="/" icon={<FaHome />} label="Website" />
            <QuickBtn to="/broker/add-vehicle" icon={<FaPlus />} label="Add Vehicle" />
            <QuickBtn to="/broker/my-vehicles" icon={<FaCarSide />} label="My Vehicles" />
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition inline-flex items-center justify-center gap-2"
              type="button"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- small UI helpers ---------------- */

function SideLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`w-full inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] p-6">
      <div className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <div className="mt-4 text-xs font-extrabold text-slate-500 tracking-wider">
        {label}
      </div>
      <div className="mt-2 text-4xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function QuickBtn({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
    >
      {icon} {label}
    </Link>
  );
}
