import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaCarSide,
  FaClipboardList,
  FaShoppingCart,
  FaSignOutAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaBalanceScale,
  FaArrowRight,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;

function toDate(d) {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isUpcoming(startDate, endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = toDate(startDate);
  const end = toDate(endDate);

  if (!start || !end) return false;
  return start >= today || end >= today;
}

function BookingStatusPill({ status }) {
  const s = (status || "").toLowerCase();

  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
        <FaCheckCircle /> Confirmed
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500 border border-slate-200">
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 border border-amber-100">
      <FaClock /> Pending
    </span>
  );
}

function PurchaseStatusPill({ status }) {
  const s = (status || "").toLowerCase();

  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
        <FaCheckCircle /> Confirmed
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500 border border-slate-200">
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 border border-blue-100">
      Processing
    </span>
  );
}

export default function UserDashboard({ user, setUser }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user") {
      navigate("/unauthorized");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [bookingsRes, purchasesRes] = await Promise.all([
          axios.get("/api/bookings/mine", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/purchases/mine", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setBookings(bookingsRes.data?.bookings || []);
        setPurchases(purchasesRes.data?.purchases || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "user") fetchDashboardData();
  }, [user, navigate]);

  const stats = useMemo(() => {
    const totalBookings = bookings.length;

    const activeBookings = bookings.filter(
      (b) =>
        (b.status || "").toLowerCase() !== "cancelled" &&
        isUpcoming(b.startDate, b.endDate)
    ).length;

    const purchaseRequests = purchases.filter(
      (p) => (p.status || "").toLowerCase() !== "cancelled"
    ).length;

    return { totalBookings, activeBookings, purchaseRequests };
  }, [bookings, purchases]);

  const recentBookings = useMemo(() => [...bookings].slice(0, 2), [bookings]);
  const recentPurchases = useMemo(() => [...purchases].slice(0, 2), [purchases]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser?.(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-8">
        <div className="rounded-3xl bg-white border border-slate-100 p-10 shadow-[0_25px_70px_rgba(0,0,0,0.06)]">
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto flex gap-8 px-4 py-8">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
                CF
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900">CarFusion</div>
                <div className="text-xs font-semibold text-slate-500 tracking-wide">
                  CUSTOMER PORTAL
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
            <SideLink icon={<FaClipboardList />} label="Dashboard" to="/user/dashboard" active />
            <SideLink icon={<FaCalendarAlt />} label="My Bookings" to="/my-bookings" />
            <SideLink icon={<FaShoppingCart />} label="My Purchases" to="/my-purchases" />
            <SideLink icon={<FaMoneyBillWave />} label="My Payments" to="/my-payments" />
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

        {/* Main */}
        <main className="flex-1">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Welcome back, {user?.username || "User"}!
              </h1>
              <p className="mt-2 text-slate-500">
                Here is an overview of your recent activity, bookings, and purchases.
              </p>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl px-4 py-3 shadow-[0_25px_70px_rgba(0,0,0,0.06)] flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 grid place-items-center font-bold text-slate-700">
                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold text-slate-900">
                  {user?.name || user?.username || "User"}
                </div>
                <div className="text-xs font-bold text-blue-600 tracking-wide">
                  CARFUSION USER
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<FaClipboardList />}
              label="TOTAL BOOKINGS"
              value={stats.totalBookings}
            />
            <StatCard
              icon={<FaClock />}
              label="ACTIVE BOOKINGS"
              value={stats.activeBookings}
            />
            <StatCard
              icon={<FaMoneyBillWave />}
              label="PURCHASE REQUESTS"
              value={stats.purchaseRequests}
            />
          </div>

          {/* Recent sections */}
          <div className="mt-10 grid lg:grid-cols-2 gap-8">
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900">Recent Bookings</h2>
                <Link to="/my-bookings" className="text-sm font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {recentBookings.length === 0 ? (
                  <EmptyMiniCard
                    title="No bookings yet"
                    actionText="Browse Vehicles"
                    to="/vehicles"
                  />
                ) : (
                  recentBookings.map((b) => (
                    <BookingMiniCard key={b._id} booking={b} />
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900">Recent Purchases</h2>
                <Link to="/my-purchases" className="text-sm font-bold text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {recentPurchases.length === 0 ? (
                  <EmptyMiniCard
                    title="No purchases yet"
                    actionText="Browse Vehicles"
                    to="/vehicles"
                  />
                ) : (
                  recentPurchases.map((p) => (
                    <PurchaseMiniCard key={p._id} purchase={p} />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Quick actions */}
          <div className="mt-10 rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] p-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Quick Actions</h2>

            <div className="mt-6 grid md:grid-cols-4 gap-4">
              <QuickBtn to="/vehicles" icon={<FaCarSide />} label="Browse Vehicles" />
              <QuickBtn to="/compare" icon={<FaBalanceScale />} label="Compare Vehicles" />
              <QuickBtn to="/my-bookings" icon={<FaCalendarAlt />} label="View My Bookings" />
              <QuickBtn to="/my-payments" icon={<FaMoneyBillWave />} label="My Payments" />
            </div>
          </div>

          {/* Mobile quick links */}
          <div className="md:hidden mt-8 grid grid-cols-2 gap-4">
            <QuickBtnSmall to="/" label="Go to Website" />
            <QuickBtnSmall to="/my-bookings" label="My Bookings" />
            <QuickBtnSmall to="/my-purchases" label="My Purchases" />
            <QuickBtnSmall to="/my-payments" label="My Payments" />
            <QuickBtnSmall to="/vehicles" label="Browse" />
            <button
              onClick={handleLogout}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
              type="button"
            >
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`w-full inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
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
      <div className="flex items-center justify-between">
        <div className="text-xs font-extrabold text-slate-500 tracking-wider">
          {label}
        </div>
        <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 grid place-items-center text-blue-600">
          {icon}
        </div>
      </div>
      <div className="mt-6 text-5xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function BookingMiniCard({ booking }) {
  const v = booking.vehicle || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-4 flex gap-4 items-center">
      <img
        src={img}
        alt={v.title || "Vehicle"}
        className="h-24 w-32 rounded-2xl object-cover border border-slate-100"
      />

      <div className="flex-1">
        <p className="text-xl font-extrabold text-slate-900">{v.title || "Vehicle"}</p>
        <p className="mt-1 text-sm text-slate-500">
          {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "—"} -{" "}
          {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : "—"}
        </p>
      </div>

      <BookingStatusPill status={booking.status} />
    </div>
  );
}

function PurchaseMiniCard({ purchase }) {
  const v = purchase.vehicle || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-4 flex gap-4 items-center">
      <img
        src={img}
        alt={v.title || "Vehicle"}
        className="h-24 w-32 rounded-2xl object-cover border border-slate-100"
      />

      <div className="flex-1">
        <p className="text-xl font-extrabold text-slate-900">{v.title || "Vehicle"}</p>
        <p className="mt-1 text-lg font-extrabold text-blue-600">
          {fmt(purchase.vehiclePrice || v.price || 0)}
        </p>
      </div>

      <PurchaseStatusPill status={purchase.status} />
    </div>
  );
}

function EmptyMiniCard({ title, actionText, to }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-6">
      <p className="text-lg font-extrabold text-slate-900">{title}</p>
      <Link
        to={to}
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
      >
        {actionText} <FaArrowRight />
      </Link>
    </div>
  );
}

function QuickBtn({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
    >
      {icon}
      {label}
    </Link>
  );
}

function QuickBtnSmall({ to, label }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition text-center"
    >
      {label}
    </Link>
  );
}