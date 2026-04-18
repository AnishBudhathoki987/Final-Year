import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBell, FaArrowLeft } from "react-icons/fa";

export default function MyNotifications({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/notifications/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/notifications/read-all/all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "user") return navigate("/unauthorized");
    loadNotifications();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              My Notifications
            </h1>
            <p className="mt-2 text-slate-500">
              View your booking and purchase updates.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Mark All Read
            </button>

            <button
              onClick={() => navigate("/user/dashboard")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              type="button"
            >
              <FaArrowLeft /> Back
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 border border-slate-100">
            No notifications found.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`rounded-2xl border p-5 ${
                  n.isRead
                    ? "bg-white border-slate-100"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FaBell className="text-blue-600" />
                      <h2 className="text-lg font-bold text-slate-900">
                        {n.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      type="button"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}