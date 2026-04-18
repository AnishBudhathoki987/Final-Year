import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BrokerSubscription({ user, setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
    if (user.hasBrokerSubscription) return navigate("/broker/dashboard");
  }, [user, navigate]);

  const handlePay = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/payments/broker-subscription/initiate",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const esewa = res.data?.esewa;
      if (!esewa) {
        throw new Error("eSewa data missing");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = esewa.url;

      Object.entries(esewa).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to start payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white border border-slate-100 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
        <h1 className="text-3xl font-extrabold text-slate-900 text-center">
          Broker Subscription
        </h1>
        <p className="mt-3 text-center text-slate-500">
          Complete the one-time broker subscription payment to activate your broker account.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-extrabold text-slate-900">Broker Activation Plan</h2>
          <p className="mt-2 text-slate-600">
            One-time payment for broker access on CarFusion.
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-blue-700">NPR 2000</span>
            <span className="text-sm font-semibold text-slate-500">one-time</span>
          </div>

          <ul className="mt-6 space-y-2 text-sm font-semibold text-slate-700">
            <li>• Add vehicle listings</li>
            <li>• Manage your vehicles</li>
            <li>• View broker orders</li>
            <li>• Access broker dashboard</li>
          </ul>

          <button
            onClick={handlePay}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            type="button"
          >
            {loading ? "Processing..." : "Pay with eSewa"}
          </button>
        </div>
      </div>
    </div>
  );
}