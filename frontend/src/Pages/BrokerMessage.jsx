import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaComments, FaUserCircle } from "react-icons/fa";

export default function BrokerMessages({ user }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    const loadChats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/api/chats/broker/mine/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChats(res.data?.chats || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load chats.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "broker") loadChats();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Messages
            </h1>
            <p className="mt-2 text-slate-500">
              View all conversations from users.
            </p>
          </div>

          <button
            onClick={() => navigate("/broker/dashboard")}
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

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-3xl bg-white border border-slate-100 p-10 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <p className="text-slate-500">Loading messages...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="rounded-3xl bg-white border border-slate-100 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
              <FaComments className="mx-auto text-3xl text-slate-300" />
              <p className="mt-3 text-slate-500 font-semibold">
                No messages yet.
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const otherUser = chat.user || {};
              const lastMessage =
                chat.messages?.length > 0
                  ? chat.messages[chat.messages.length - 1]
                  : null;

              return (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/broker/chat/${chat._id}`)}
                  className="w-full text-left rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition"
                  type="button"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-slate-100 grid place-items-center text-slate-500 text-xl">
                      <FaUserCircle />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-extrabold text-slate-900">
                        {otherUser.username || "User"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500 truncate">
                        {lastMessage?.text || "No messages yet"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400 font-semibold">
                        {lastMessage?.createdAt
                          ? new Date(lastMessage.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}