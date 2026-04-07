import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaBan, FaCheckCircle, FaUserTie } from "react-icons/fa";

export default function AdminBrokers({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "admin") return navigate("/unauthorized");
  }, [user, navigate]);

  const loadBrokers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("/api/admin/brokers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrokers(res.data?.brokers || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load brokers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" && token) loadBrokers();
  }, [user, token]);

  const toggleVerify = async (id, isVerified) => {
    try {
      await axios.put(
        `/api/admin/brokers/${id}/${isVerified ? "unverify" : "verify"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadBrokers();
    } catch (err) {
      alert(err?.response?.data?.message || "Verify action failed.");
    }
  };

  const toggleBlock = async (id, isBlocked) => {
    try {
      await axios.put(
        `/api/admin/users/${id}/${isBlocked ? "unblock" : "block"}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadBrokers();
    } catch (err) {
      alert(err?.response?.data?.message || "Block action failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Brokers</h1>
            <p className="mt-2 text-slate-500">
              Verify, unverify, block, or unblock broker accounts.
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
          <div className="p-6 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FaUserTie className="text-blue-600" />
              Brokers List
            </h2>

            <button
              onClick={loadBrokers}
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
                  <th className="px-6 py-4">VERIFIED</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-right">ACTIONS</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-slate-500">
                      Loading brokers...
                    </td>
                  </tr>
                ) : brokers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-slate-500">
                      No brokers found.
                    </td>
                  </tr>
                ) : (
                  brokers.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-5 font-bold text-slate-900">{b.username}</td>
                      <td className="px-6 py-5 text-slate-600">{b.email}</td>

                      <td className="px-6 py-5">
                        {b.isVerified ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
                            <FaCheckCircle /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 border border-amber-100">
                            Not Verified
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {b.isBlocked ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700 border border-rose-100">
                            <FaBan /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 border border-emerald-100">
                            <FaCheckCircle /> Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => toggleVerify(b._id, b.isVerified)}
                            className={`rounded-2xl px-4 py-2 text-sm font-extrabold text-white transition ${
                              b.isVerified
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                            type="button"
                          >
                            {b.isVerified ? "Unverify" : "Verify"}
                          </button>

                          <button
                            onClick={() => toggleBlock(b._id, b.isBlocked)}
                            className={`rounded-2xl px-4 py-2 text-sm font-extrabold text-white transition ${
                              b.isBlocked
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-rose-600 hover:bg-rose-700"
                            }`}
                            type="button"
                          >
                            {b.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </div>
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