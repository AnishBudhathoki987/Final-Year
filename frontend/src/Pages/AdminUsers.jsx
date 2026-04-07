import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaBan, FaCheckCircle } from "react-icons/fa";

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data?.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && token) loadUsers();
  }, [user, token]);

  const toggleBlock = async (id, isBlocked) => {
    try {
      await axios.put(
        `/api/admin/users/${id}/${isBlocked ? "unblock" : "block"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Users</h1>
            <p className="mt-2 text-slate-500">Block or unblock normal user accounts.</p>
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
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Users List</h2>
            <button
              onClick={loadUsers}
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
                  <th className="px-6 py-4">USERNAME</th>
                  <th className="px-6 py-4">EMAIL</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTION</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-5 font-bold text-slate-900">{u.username}</td>
                      <td className="px-6 py-5 text-slate-600">{u.email}</td>
                      <td className="px-6 py-5">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700 border border-rose-100">
                            <FaBan /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
                            <FaCheckCircle /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => toggleBlock(u._id, u.isBlocked)}
                          className={`rounded-2xl px-4 py-2 text-sm font-extrabold text-white transition ${
                            u.isBlocked
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-rose-600 hover:bg-rose-700"
                          }`}
                          type="button"
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}