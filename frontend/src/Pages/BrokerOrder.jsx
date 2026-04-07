import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCarSide,
  FaCheckCircle,
  FaClipboardList,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaTimesCircle,
  FaUser,
  FaChartBar,
  FaHistory,
} from "react-icons/fa";

const fmt = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;
const HISTORY_PER_PAGE = 4;

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const buildModelKey = ({ brand = "", model = "", title = "" }) => {
  const b = normalizeText(brand);
  const m = normalizeText(model);
  const t = normalizeText(title);

  if (b && m) {
    if (m.startsWith(b)) return m;
    return `${b} ${m}`.trim();
  }

  if (m) return m;
  if (t) return t;
  return b;
};

const displayModelName = (item) => {
  const brand = item?.brand || "";
  const model = item?.model || "";

  if (!model) return brand || "Unknown";
  if (brand && model.toLowerCase().startsWith(brand.toLowerCase())) {
    return model;
  }

  return `${brand} ${model}`.trim();
};

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
      Pending
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

export default function BrokerOrders({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tab, setTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [modelSummary, setModelSummary] = useState([]);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  const fetchData = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [bookingsRes, purchasesRes, summaryRes] = await Promise.all([
        axios.get("/api/bookings/broker/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/purchases/broker/mine", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/vehicles/stats/model-performance", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const bookingList = bookingsRes.data?.bookings || [];
      const purchaseList = purchasesRes.data?.purchases || [];
      const summaryList = summaryRes.data?.summary || [];

      setBookings(bookingList);
      setPurchases(purchaseList);
      setModelSummary(summaryList);

      if (summaryList.length > 0 && !selectedModel) {
        setSelectedModel({
          brand: summaryList[0].brand,
          model: summaryList[0].model,
          title: summaryList[0].title,
        });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load broker orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "broker") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const counts = useMemo(
    () => ({
      bookings: bookings.length,
      purchases: purchases.length,
      models: modelSummary.length,
    }),
    [bookings, purchases, modelSummary]
  );

  const selectedModelBookings = useMemo(() => {
    if (!selectedModel) return [];

    const selectedKey = buildModelKey({
      brand: selectedModel.brand,
      model: selectedModel.model,
      title: selectedModel.title,
    });

    return bookings.filter((b) => {
      const bookingKey = buildModelKey({
        brand: b?.vehicle?.brand,
        model: b?.vehicle?.model,
        title: b?.vehicle?.title,
      });

      return bookingKey === selectedKey;
    });
  }, [bookings, selectedModel]);

  const totalHistoryPages = useMemo(() => {
    return Math.ceil(selectedModelBookings.length / HISTORY_PER_PAGE) || 1;
  }, [selectedModelBookings]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;
    const end = start + HISTORY_PER_PAGE;
    return selectedModelBookings.slice(start, end);
  }, [selectedModelBookings, historyPage]);

  useEffect(() => {
    setHistoryPage(1);
  }, [selectedModel]);

  const handlePurchaseAction = async (id, action) => {
    try {
      await axios.put(
        `/api/purchases/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed.");
    }
  };

  const selectModel = (item) => {
    setSelectedModel({
      brand: item.brand,
      model: item.model,
      title: item.title,
    });
    setTab("bookings");
    setHistoryPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Orders
            </h1>
            <p className="mt-2 text-slate-500">
              View bookings on your rent vehicles and purchase requests on your
              sale vehicles.
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

        <div className="mt-8 grid sm:grid-cols-3 gap-6 max-w-5xl">
          <StatCard
            icon={<FaCalendarAlt />}
            label="TOTAL BOOKINGS"
            value={counts.bookings}
          />
          <StatCard
            icon={<FaClipboardList />}
            label="PURCHASE REQUESTS"
            value={counts.purchases}
          />
          <StatCard
            icon={<FaChartBar />}
            label="VEHICLE MODELS"
            value={counts.models}
          />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Top Vehicle Models
              </h2>
              <p className="text-sm text-slate-500">
                Click a model to view only its booking history
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading model summary...</p>
          ) : modelSummary.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No model statistics yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs font-extrabold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3">MODEL</th>
                    <th className="px-4 py-3">BOOKINGS</th>
                    <th className="px-4 py-3">SALES</th>
                    <th className="px-4 py-3">BOOKING REVENUE</th>
                    <th className="px-4 py-3">SALES VALUE</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {modelSummary.map((item, index) => {
                    const isActive =
                      selectedModel?.brand === item.brand &&
                      selectedModel?.model === item.model;

                    return (
                      <tr
                        key={`${item.brand}-${item.model}-${index}`}
                        onClick={() => selectModel(item)}
                        className={`cursor-pointer transition ${
                          isActive ? "bg-blue-50/60" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                item.image ||
                                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop"
                              }
                              alt={item.title || item.model}
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                            />
                            <div>
                              <p className="font-extrabold text-slate-900">
                                {displayModelName(item)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.title || "Vehicle model summary"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-700">
                          {item.bookingCount}
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-700">
                          {item.purchaseCount}
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-700">
                          {fmt(item.totalBookingRevenue)}
                        </td>

                        <td className="px-4 py-4 font-bold text-slate-700">
                          {fmt(item.totalSalesValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 inline-flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("bookings")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              tab === "bookings"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-600"
            }`}
          >
            Booked Cars
          </button>
          <button
            type="button"
            onClick={() => setTab("purchases")}
            className={`px-5 py-2 rounded-2xl text-sm font-extrabold ${
              tab === "purchases"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-600"
            }`}
          >
            Purchase Requests
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl bg-white border border-slate-100 p-10">
            <p className="text-slate-500">Loading...</p>
          </div>
        ) : tab === "bookings" ? (
          <div className="mt-6">
            {!selectedModel ? (
              <EmptyState text="Click a vehicle model above to see its booking history." />
            ) : selectedModelBookings.length === 0 ? (
              <EmptyState
                text={`No booking history found for ${displayModelName(
                  selectedModel
                )}.`}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FaHistory className="text-blue-600" />
                    Booking History for {displayModelName(selectedModel)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    All bookings made for this vehicle model till now
                  </p>
                </div>

                {paginatedHistory.map((b) => (
                  <BookingCard key={b._id} booking={b} />
                ))}

                {selectedModelBookings.length > HISTORY_PER_PAGE && (
                  <div className="rounded-3xl bg-white border border-slate-100 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      Showing{" "}
                      <span className="font-extrabold text-slate-900">
                        {(historyPage - 1) * HISTORY_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-extrabold text-slate-900">
                        {Math.min(
                          historyPage * HISTORY_PER_PAGE,
                          selectedModelBookings.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-extrabold text-slate-900">
                        {selectedModelBookings.length}
                      </span>{" "}
                      bookings
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setHistoryPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={historyPage === 1}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        Prev
                      </button>

                      <div className="text-sm font-extrabold text-slate-900">
                        {historyPage} / {totalHistoryPages}
                      </div>

                      <button
                        onClick={() =>
                          setHistoryPage((prev) =>
                            Math.min(prev + 1, totalHistoryPages)
                          )
                        }
                        disabled={historyPage === totalHistoryPages}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {purchases.length === 0 ? (
              <EmptyState text="No purchase requests found for your sale vehicles." />
            ) : (
              purchases.map((p) => (
                <PurchaseCard
                  key={p._id}
                  purchase={p}
                  onConfirm={() =>
                    handlePurchaseAction(p._id, "broker-confirm")
                  }
                  onCancel={() =>
                    handlePurchaseAction(p._id, "broker-cancel")
                  }
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }) {
  const v = booking.vehicle || {};
  const u = booking.user || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row gap-5">
        <img
          src={img}
          alt={v.title || "Vehicle"}
          className="h-32 w-full md:w-44 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-2">
                  <FaUser className="text-slate-400" />
                  {u.username || "User"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {booking.pickupLocation || v.location || "—"}
                </span>

                <span className="inline-flex items-center gap-2">
                  <FaCalendarAlt className="text-slate-400" />
                  {booking.startDate
                    ? new Date(booking.startDate).toLocaleDateString()
                    : "—"}{" "}
                  -{" "}
                  {booking.endDate
                    ? new Date(booking.endDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-extrabold text-slate-900">
                {fmt(booking.totalPrice)}
              </p>
              <div className="mt-2">
                <BookingStatusPill status={booking.status} />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to={`/vehicles/${v._id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
            >
              <FaCarSide /> View Vehicle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ purchase, onConfirm, onCancel }) {
  const v = purchase.vehicle || {};
  const img =
    v.images?.[0] ||
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop";

  const canAct = (purchase.status || "").toLowerCase() === "pending";

  return (
    <div className="rounded-3xl bg-white border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] p-5">
      <div className="flex flex-col md:flex-row gap-5">
        <img
          src={img}
          alt={v.title || "Vehicle"}
          className="h-32 w-full md:w-44 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold text-slate-900">
                {v.title || "Vehicle"}
              </p>

              <div className="mt-2 space-y-1 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <FaUser className="text-slate-400" />
                  {purchase.fullName}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaPhoneAlt className="text-slate-400" />
                  {purchase.phone}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaMapMarkerAlt className="text-slate-400" />
                  {purchase.address}
                </p>
                <p className="inline-flex items-center gap-2">
                  <FaMoneyBillWave className="text-slate-400" />
                  {fmt(purchase.vehiclePrice)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="mt-2">
                <PurchaseStatusPill status={purchase.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={`/vehicles/${v._id}`}
              className="rounded-2xl bg-blue-50 px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
            >
              View Vehicle
            </Link>

            {canAct && (
              <>
                <button
                  onClick={onConfirm}
                  className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition"
                  type="button"
                >
                  Accept Purchase
                </button>

                <button
                  onClick={onCancel}
                  className="rounded-2xl bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                  type="button"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
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

function EmptyState({ text }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
      <FaTimesCircle className="mx-auto text-3xl text-slate-300" />
      <p className="mt-3 text-slate-500 font-semibold">{text}</p>
    </div>
  );
}