import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Mock bookings (until Sprint 3 booking backend)
  const [bookings, setBookings] = useState(() => {
    try {
      const raw = localStorage.getItem("myBookings");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // ✅ Mock saved vehicles (optional)
  const [savedVehicles] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login", { replace: true });

      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMe(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  // If no bookings in localStorage, show demo bookings (for design preview)
  useEffect(() => {
    if (bookings.length === 0) {
      const demo = [
        {
          id: "b1",
          type: "rent",
          title: "Toyota Fortuner 2023",
          dateText: "Oct 24 - Oct 27, 2026",
          amountText: "Rs 12,000 Total",
          status: "confirmed",
          image:
            "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop",
        },
        {
          id: "b2",
          type: "purchase",
          title: "Honda Civic 2019",
          dateText: "Test Drive: Nov 02, 10:00 AM",
          amountText: "Rs 28,50,000 Offer",
          status: "pending",
          image:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
        },
        {
          id: "b3",
          type: "rent",
          title: "Hyundai Creta 2020",
          dateText: "Nov 15 - Nov 18, 2026",
          amountText: "Rs 8,500 Total",
          status: "confirmed",
          image:
            "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1200&auto=format&fit=crop",
        },
      ];
      setBookings(demo);
      localStorage.setItem("myBookings", JSON.stringify(demo));
    }
    // eslint-disable-next-line
  }, []);

  const stats = useMemo(() => {
    const activeCount = bookings.filter((b) => b.status !== "cancelled").length;
    const pendingCount = bookings.filter((b) => b.status === "pending").length;

    return {
      savedCount: savedVehicles.length || 0,
      activeCount,
      pendingCount,
      lastActivityText: "Today",
      lastActivitySub: `Logged in at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    };
  }, [bookings, savedVehicles]);

  const cancelBooking = (id) => {
    if (!confirm("Cancel this booking?")) return;
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, status: "cancelled" } : b
    );
    setBookings(updated);
    localStorage.setItem("myBookings", JSON.stringify(updated));
  };

  const badgeStyles = (status) => {
    if (status === "confirmed") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const badgeDot = (status) => {
    if (status === "confirmed") return "bg-green-500";
    if (status === "pending") return "bg-yellow-500 animate-pulse";
    return "bg-slate-400";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f6f6f8] flex items-center justify-center">
        <div className="text-slate-600 font-semibold">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f8] min-h-screen text-slate-900">
      {/* TOP NAV (Dashboard specific) */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="size-8 text-[#2b3bee]">
                <svg viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight group-hover:text-[#2b3bee] transition-colors">
                CarFusion
              </h2>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link className="text-sm font-semibold text-slate-600 hover:text-[#2b3bee] transition" to="/user/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-semibold text-slate-600 hover:text-[#2b3bee] transition" to="/vehicles">
                Rent
              </Link>
              <Link className="text-sm font-semibold text-slate-600 hover:text-[#2b3bee] transition" to="/vehicles">
                Purchase
              </Link>
              <Link className="text-sm font-semibold text-slate-600 hover:text-[#2b3bee] transition" to="/compare">
                Compare
              </Link>
              <button
                onClick={() => document.getElementById("my-bookings")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-semibold text-[#2b3bee] hover:text-[#1a25a0] transition"
              >
                My Bookings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2b3bee]">
                🔍
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 rounded-xl bg-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2b3bee] sm:text-sm transition-all w-64"
                placeholder="Search vehicles..."
                type="text"
              />
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#2b3bee] transition">
                🔔
              </button>
              <button className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#2b3bee] transition">
                👤
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2b3bee] via-[#6366f1] to-[#8b5cf6] shadow-lg">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl" />

          <div className="relative z-10 px-8 py-10 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-2">
                ✅ USER
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {me?.username || "User"}
              </h1>

              <p className="text-white/80 font-medium flex items-center gap-2">
                ✉️ {me?.email || ""}
              </p>
            </div>

            <button
              onClick={() => alert("Profile edit will be added later.")}
              className="bg-white text-[#2b3bee] hover:bg-slate-50 font-bold py-2.5 px-5 rounded-xl shadow-md active:scale-95 transition flex items-center gap-2"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex items-start justify-between">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Saved Vehicles</p>
              <p className="text-3xl font-extrabold">{stats.savedCount}</p>
              <p className="text-xs text-green-500 font-semibold mt-2">↗ +2 this week</p>
            </div>
            <div className="p-3 bg-[#2b3bee]/10 rounded-xl text-[#2b3bee] group-hover:bg-[#2b3bee] group-hover:text-white transition">
              ❤️
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex items-start justify-between">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Active Bookings</p>
              <p className="text-3xl font-extrabold">{stats.activeCount}</p>
              <p className="text-xs text-slate-400 font-semibold mt-2">
                {stats.pendingCount} pending approval
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              📅
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex items-start justify-between">
            <div>
              <p className="text-slate-500 font-medium text-sm mb-1">Last Activity</p>
              <p className="text-3xl font-extrabold">{stats.lastActivityText}</p>
              <p className="text-xs text-slate-400 font-semibold mt-2">{stats.lastActivitySub}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              🕘
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* BOOKINGS */}
          <div className="lg:col-span-2 space-y-6" id="my-bookings">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <button
                onClick={() => alert("Booking history page will be added later.")}
                className="text-sm font-semibold text-[#2b3bee] hover:text-[#1a25a0] transition"
              >
                View history →
              </button>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-600">
                  No bookings yet. Explore vehicles and book your first ride.
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-5 group"
                  >
                    <div className="w-full sm:w-48 h-48 sm:h-32 rounded-lg bg-slate-100 relative overflow-hidden flex-shrink-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url('${b.image}')` }}
                      />
                      <div
                        className={`absolute top-2 left-2 ${
                          b.type === "purchase" ? "bg-purple-500/90" : "bg-indigo-500/90"
                        } backdrop-blur-sm rounded-md px-2 py-1 text-xs font-bold text-white uppercase tracking-wide`}
                      >
                        {b.type}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="text-lg font-bold group-hover:text-[#2b3bee] transition">
                            {b.title}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyles(
                              b.status
                            )}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeDot(b.status)}`} />
                            {b.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-500">
                            📆 <span>{b.dateText}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            💳 <span>{b.amountText}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4 sm:mt-0 pt-3 border-t border-slate-100 sm:border-t-0 sm:pt-0">
                        <button
                          onClick={() => alert("Booking details page will be added later.")}
                          className="flex-1 sm:flex-none bg-[#2b3bee] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#1a25a0] transition shadow-sm"
                        >
                          View Booking
                        </button>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="flex-1 sm:flex-none bg-slate-100 text-slate-600 text-sm font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[#2b3bee] ring-4 ring-white" />
                  <p className="text-sm font-medium">Booked a vehicle</p>
                  <p className="text-xs text-slate-500 mt-0.5">2 hours ago</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white" />
                  <p className="text-sm font-medium">Offer pending</p>
                  <p className="text-xs text-slate-500 mt-0.5">Yesterday</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-300 ring-4 ring-white" />
                  <p className="text-sm font-medium">Searched vehicles</p>
                  <p className="text-xs text-slate-500 mt-0.5">2 days ago</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4 text-indigo-200">
                  ✅
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Buying & Renting Tips
                </h3>
                <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                  Always inspect the vehicle, verify broker details, and confirm documents
                  before finalizing.
                </p>
                <button
                  onClick={() => alert("Guide page will be added later.")}
                  className="inline-flex items-center text-white text-sm font-semibold hover:text-indigo-200 transition"
                >
                  Read Guide →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full mt-4">
          <button
            onClick={() => navigate("/vehicles")}
            className="w-full bg-[#2b3bee] hover:bg-[#1a25a0] text-white rounded-xl py-4 px-6 font-bold text-lg shadow-lg shadow-[#2b3bee]/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            🌍 Explore New Arrivals
          </button>
        </div>
      </main>
    </div>
  );
}
