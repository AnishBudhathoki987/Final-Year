import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

export default function Chat({ user }) {
  const navigate = useNavigate();
  const { brokerId } = useParams();

  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "user" && user.role !== "broker") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  useEffect(() => {
    const startChat = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      setLoading(true);
      setError("");

      try {
        const res = await axios.post(
          "/api/chats/start",
          { brokerId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setChat(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to open chat.");
      } finally {
        setLoading(false);
      }
    };

    if (brokerId && user?.role === "user") {
      startChat();
    }
  }, [brokerId, user, navigate]);

  const sendMessage = async () => {
    if (!text.trim() || !chat?._id) return;

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axios.post(
        `/api/chats/${chat._id}/message`,
        { text: text.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChat(res.data);
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] p-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-100 p-10">
          <p className="text-slate-500">Loading chat...</p>
        </div>
      </div>
    );
  }

  const brokerName =
    chat?.broker?.username || chat?.broker?.name || "Broker";

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          type="button"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="mt-6 rounded-3xl bg-white border border-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h1 className="text-xl font-extrabold text-slate-900">
              Chat with {brokerName}
            </h1>
            <p className="text-sm text-slate-500">
              Send messages directly here.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="h-[420px] overflow-y-auto px-6 py-5 space-y-4 bg-[#f8fafc] flex flex-col">
            {chat?.messages?.length > 0 ? (
              chat.messages.map((msg) => {
                const senderId =
                  typeof msg.senderId === "object"
                    ? msg.senderId?._id
                    : msg.senderId;

                const currentUserId = user?._id || user?.id;
                const mine = String(senderId) === String(currentUserId);

                return (
                  <div
                    key={msg._id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        mine
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-md"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          mine ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No messages yet.</p>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 flex items-center gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
            />

            <button
              onClick={sendMessage}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 transition"
              type="button"
            >
              <FaPaperPlane /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}