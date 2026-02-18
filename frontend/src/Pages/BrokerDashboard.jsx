import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BrokerNavbar from "../Components/BrokerNavbar";
import {
  FiPlus,
  FiGrid,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";

export default function BrokerDashboard({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser?.(null);
    navigate("/login");
  };

  // Placeholder stats + data (replace with API later)
  const stats = useMemo(
    () => ({
      total: 42,
      rent: 28,
      purchase: 14,
      pending: 5,
    }),
    []
  );

  const recent = useMemo(
    () => [
      {
        id: "1",
        title: "2023 Tesla Model 3",
        meta: "Electric • Automatic",
        type: "Rent",
        price: "$120/day",
        img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "2",
        title: "2022 BMW 330i",
        meta: "Gasoline • Automatic",
        type: "Purchase",
        price: "$42,500",
        img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "3",
        title: "2021 Audi Q5",
        meta: "Hybrid • Automatic",
        type: "Rent",
        price: "$145/day",
        img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=300&q=80",
      },
      {
        id: "4",
        title: "2020 Ford Mustang",
        meta: "Gasoline • Manual",
        type: "Rent",
        price: "$180/day",
        img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=300&q=80",
      },
    ],
    []
  );

  const requests = useMemo(
    () => [
      {
        id: "r1",
        name: "John Doe",
        line: "Wants to rent BMW X5",
        time: "2 mins ago",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      },
      {
        id: "r2",
        name: "Sarah Smith",
        line: "Offer for Audi A4",
        time: "1 hour ago",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
      },
      {
        id: "r3",
        name: "Michael Brown",
        line: "Wants to rent Tesla Model S",
        time: "3 hours ago",
        avatar:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <BrokerNavbar user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-slate-600 text-lg">
              Manage your fleet, track performance, and handle incoming requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/broker/add-vehicle")}
              className="h-11 px-5 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition inline-flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Vehicle
            </button>
            <button
              onClick={() => navigate("/broker/manage-vehicles")}
              className="h-11 px-5 rounded-full bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
            >
              <FiGrid /> Manage Listings
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          <StatCard title="Total Listings" value={stats.total} badge="+12%" icon="📦" />
          <StatCard title="Rent Listings" value={stats.rent} badge="+5%" icon="🗝️" />
          <StatCard title="Purchase Listings" value={stats.purchase} badge="+8%" icon="🏷️" />
          <StatCard title="Pending Bookings" value={stats.pending} badge="+20%" icon="📅" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent listings */}
          <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">
                Recent Listings
              </h2>
              <button
                onClick={() => navigate("/broker/manage-vehicles")}
                className="text-blue-600 font-bold hover:text-blue-700 inline-flex items-center gap-2"
              >
                View All <FiArrowRight />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="px-6 py-3 font-bold">VEHICLE</th>
                    <th className="px-6 py-3 font-bold">TYPE</th>
                    <th className="px-6 py-3 font-bold">PRICE</th>
                    <th className="px-6 py-3 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {recent.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.img}
                            alt={v.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900">
                              {v.title}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold">
                              {v.meta}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <TypePill type={v.type} />
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {v.price}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/broker/edit-vehicle/${v.id}`)}
                            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center"
                            title="Edit"
                          >
                            <FiEdit2 className="text-blue-700" />
                          </button>
                          <button
                            onClick={() => alert("Delete placeholder")}
                            className="w-10 h-10 rounded-xl border border-slate-200 hover:bg-red-50 transition flex items-center justify-center"
                            title="Delete"
                          >
                            <FiTrash2 className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {recent.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-slate-500" colSpan={4}>
                        No listings yet. Click <b>Add Vehicle</b> to create your first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Requests */}
          <aside className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Requests</h2>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                {requests.length} New
              </span>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900">{r.name}</p>
                      <p className="text-sm text-blue-600 font-semibold truncate">
                        {r.line}
                      </p>
                      <p className="text-xs text-slate-500">{r.time}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => alert("Accepted placeholder")}
                      className="h-10 rounded-full bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => alert("Rejected placeholder")}
                      className="h-10 rounded-full border border-slate-200 bg-white text-slate-900 font-extrabold hover:bg-slate-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => navigate("/broker/bookings")}
                className="w-full mt-2 text-blue-700 font-extrabold hover:text-blue-800"
              >
                View All Requests
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function StatCard({ title, value, badge, icon }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl">
          {icon}
        </div>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          {badge}
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold text-blue-700">{title}</p>
      <p className="mt-2 text-4xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function TypePill({ type }) {
  const isRent = type.toLowerCase() === "rent";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
        isRent ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
      }`}
    >
      {type}
    </span>
  );
}
