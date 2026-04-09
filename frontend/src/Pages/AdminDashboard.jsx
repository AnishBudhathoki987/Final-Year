import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaUserTie,
  FaBan,
  FaCheckCircle,
  FaArrowLeft,
  FaCarSide,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartLine,
} from "react-icons/fa";

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    users: 0,
    brokers: 0,
    blockedAccounts: 0,
    verifiedBrokers: 0,
    totalVehicles: 0,
    rentVehicles: 0,
    saleVehicles: 0,
    totalBookings: 0,
    totalPurchases: 0,
  });

  const [recentActivity, setRecentActivity] = useState({
    users: [],
    brokers: [],
    vehicles: [],
    bookings: [],
    purchases: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/api/admin/overview", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats(res.data?.stats || {});
        setRecentActivity(
          res.data?.recentActivity || {
            users: [],
            brokers: [],
            vehicles: [],
            bookings: [],
            purchases: [],
          }
        );
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && token) loadOverview();
  }, [user, token]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Monitor users, brokers, vehicles, and transactions across CarFusion.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            type="button"
          >
            <FaArrowLeft /> Back to Home
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white border border-slate-100 p-10 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
            <p className="text-slate-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<FaUsers />} label="TOTAL USERS" value={stats.users} />
              <StatCard icon={<FaUserTie />} label="TOTAL BROKERS" value={stats.brokers} />
              <StatCard icon={<FaBan />} label="BLOCKED ACCOUNTS" value={stats.blockedAccounts} />
              <StatCard icon={<FaCheckCircle />} label="VERIFIED BROKERS" value={stats.verifiedBrokers} />
              <StatCard icon={<FaCarSide />} label="TOTAL VEHICLES" value={stats.totalVehicles} />
              <StatCard icon={<FaCarSide />} label="RENT VEHICLES" value={stats.rentVehicles} />
              <StatCard icon={<FaCarSide />} label="SALE VEHICLES" value={stats.saleVehicles} />
              <StatCard icon={<FaClipboardList />} label="TOTAL BOOKINGS" value={stats.totalBookings} />
            </div>

            <div className="mt-8 grid lg:grid-cols-3 gap-6">
              <QuickLinkCard
                title="Manage Users"
                text="Search, block, and manage customer accounts."
                to="/admin/users"
                primary
              />
              <QuickLinkCard
                title="Manage Brokers"
                text="Verify, unblock, and monitor broker accounts."
                to="/admin/brokers"
              />
              <QuickLinkCard
                title="View Vehicles"
                text="See all vehicles listed in the platform."
                to="/admin/vehicles"
              />
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-6">
              <QuickLinkCard
                title="Transactions"
                text="View all booking and purchase transactions."
                to="/admin/transactions"
              />
              <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 grid place-items-center text-blue-600">
                    <FaChartLine />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      System Status
                    </h3>
                    <p className="text-sm text-slate-500">
                      Overview of the current platform condition
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm font-semibold">
                  <Row label="Hidden Vehicles" value={stats.hiddenVehicles || 0} />
                  <Row label="Deleted Vehicles" value={stats.deletedVehicles || 0} />
                  <Row label="Total Purchases" value={stats.totalPurchases || 0} />
                </div>
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-6">
              <RecentCard
                title="Recent Users"
                items={recentActivity.users}
                renderItem={(item) => (
                  <div>
                    <div className="font-bold text-slate-900">{item.username}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                  </div>
                )}
              />

              <RecentCard
                title="Recent Brokers"
                items={recentActivity.brokers}
                renderItem={(item) => (
                  <div>
                    <div className="font-bold text-slate-900">{item.username}</div>
                    <div className="text-xs text-slate-500">
                      {item.email} • {item.isVerified ? "Verified" : "Not Verified"}
                    </div>
                  </div>
                )}
              />

              <RecentCard
                title="Recent Vehicles"
                items={recentActivity.vehicles}
                renderItem={(item) => (
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.type} • {item.location} • {item.createdBy?.username || "Broker"}
                    </div>
                  </div>
                )}
              />

              <RecentCard
                title="Recent Bookings"
                items={recentActivity.bookings}
                renderItem={(item) => (
                  <div>
                    <div className="font-bold text-slate-900">
                      {item.vehicle?.title || "Vehicle"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.user?.username || "User"} • NPR {Number(item.totalPrice || 0).toLocaleString()}
                    </div>
                  </div>
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
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
      <div className="mt-2 text-4xl font-extrabold text-slate-900">{value || 0}</div>
    </div>
  );
}

function QuickLinkCard({ title, text, to, primary = false }) {
  return (
    <Link
      to={to}
      className={`rounded-3xl border p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] transition ${
        primary
          ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
          : "bg-white border-slate-100 text-slate-900 hover:bg-slate-50"
      }`}
    >
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className={`mt-2 text-sm ${primary ? "text-blue-100" : "text-slate-500"}`}>
        {text}
      </p>
    </Link>
  );
}

function RecentCard({ title, items, renderItem }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>

      <div className="mt-4 space-y-3">
        {items?.length ? (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              {renderItem(item)}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No recent data.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-600">{label}</span>
      <span className="font-extrabold text-slate-900">{value}</span>
    </div>
  );
}