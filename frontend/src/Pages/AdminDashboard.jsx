import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUsers,
  FaUserTie,
  FaBan,
  FaCheckCircle,
  FaArrowLeft,
} from "react-icons/fa";

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    users: 0,
    brokers: 0,
    blockedAccounts: 0,
    verifiedBrokers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");

      try {
        const [usersRes, brokersRes] = await Promise.all([
          axios.get("/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/brokers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const users = usersRes.data?.users || [];
        const brokers = brokersRes.data?.brokers || [];

        setStats({
          users: users.length,
          brokers: brokers.length,
          blockedAccounts: [...users, ...brokers].filter((u) => u.isBlocked).length,
          verifiedBrokers: brokers.filter((b) => b.isVerified).length,
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && token) loadStats();
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
              Manage users, brokers, and account status across CarFusion.
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
            </div>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                to="/admin/users"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 transition"
              >
                Manage Users
              </Link>

              <Link
                to="/admin/brokers"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                Manage Brokers
              </Link>
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
      <div className="mt-2 text-4xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}