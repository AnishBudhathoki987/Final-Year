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

const CARS_PER_PAGE = 4;
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
  const title = item?.title || "";

  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
    return `${brand} ${model}`.trim();
  }

  if (model) return model;
  if (title) return title;
  if (brand) return brand;

  return "Unknown";
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
  const [selectedCar, setSelectedCar] = useState(null);

  const [carsPage, setCarsPage] = useState(1);
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

  const carsUnderSelectedModel = useMemo(() => {
    if (!selectedModel) return [];

    const selectedKey = buildModelKey({
      brand: selectedModel.brand,
      model: selectedModel.model,
      title: selectedModel.title,
    });

    const carMap = new Map();

    bookings.forEach((b) => {
      const v = b?.vehicle || {};
      const bookingKey = buildModelKey({
        brand: v.brand,
        model: v.model,
        title: v.title,
      });

      if (bookingKey !== selectedKey) return;
      if (!v?._id) return;

      if (!carMap.has(v._id)) {
        carMap.set(v._id, {
          _id: v._id,
          title: v.title || "Vehicle",
          brand: v.brand || "",
          model: v.model || "",
          numberPlate: v.numberPlate || "No plate",
          location: v.location || "—",
          image:
            v.images?.[0] ||
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop",
          bookingCount: 0,
          totalRevenue: 0,
        });
      }

      const existing = carMap.get(v._id);
      existing.bookingCount += 1;
      existing.totalRevenue += Number(b.totalPrice || 0);
    });

    return Array.from(carMap.values()).sort((a, b) => b.bookingCount - a.bookingCount);
  }, [bookings, selectedModel]);

  const totalCarsPages = useMemo(() => {
    return Math.ceil(carsUnderSelectedModel.length / CARS_PER_PAGE) || 1;
  }, [carsUnderSelectedModel]);

  const paginatedCars = useMemo(() => {
    const start = (carsPage - 1) * CARS_PER_PAGE;
    const end = start + CARS_PER_PAGE;
    return carsUnderSelectedModel.slice(start, end);
  }, [carsUnderSelectedModel, carsPage]);

  const selectedCarBookings = useMemo(() => {
    if (!selectedCar?._id) return [];
    return bookings.filter((b) => b?.vehicle?._id === selectedCar._id);
  }, [bookings, selectedCar]);

  const totalHistoryPages = useMemo(() => {
    return Math.ceil(selectedCarBookings.length / HISTORY_PER_PAGE) || 1;
  }, [selectedCarBookings]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PER_PAGE;
    const end = start + HISTORY_PER_PAGE;
    return selectedCarBookings.slice(start, end);
  }, [selectedCarBookings, historyPage]);

  useEffect(() => {
    setCarsPage(1);
    setHistoryPage(1);
    setSelectedCar(null);
  }, [selectedModel]);

  useEffect(() => {
    setHistoryPage(1);
  }, [selectedCar]);

  useEffect(() => {
    if (!selectedCar && carsUnderSelectedModel.length > 0) {
      setSelectedCar(carsUnderSelectedModel[0]);
    }
  }, [carsUnderSelectedModel, selectedCar]);

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
    setSelectedCar(null);
    setCarsPage(1);
    setHistoryPage(1);
    setTab("bookings");
  };

  const selectCar = (car) => {
    setSelectedCar(car);
    setHistoryPage(1);
    setTab("bookings");
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
                Click a model to view all cars under that model
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Loading model summary...</p>
          ) : modelSummary.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No model statistics yet.</p>
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
          <div className="mt-6 space-y-6">
            {!selectedModel ? (
              <EmptyState text="Click a vehicle model above to see its cars." />
            ) : (
              <>
                <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <FaCarSide className="text-blue-600" />
                    Cars under {displayModelName(selectedModel)}
                  </h3>
                </div>

                {carsUnderSelectedModel.length === 0 ? (
                  <EmptyState
                    text={`No cars found under ${displayModelName(selectedModel)}.`}
                  />
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {paginatedCars.map((car) => (
                        <CarCard
                          key={car._id}
                          car={car}
                          isActive={selectedCar?._id === car._id}
                          onClick={() => selectCar(car)}
                        />
                      ))}
                    </div>

                    {carsUnderSelectedModel.length > CARS_PER_PAGE && (
                      <PaginationBar
                        currentPage={carsPage}
                        totalPages={totalCarsPages}
                        totalItems={carsUnderSelectedModel.length}
                        perPage={CARS_PER_PAGE}
                        onPrev={() => setCarsPage((prev) => Math.max(prev - 1, 1))}
                        onNext={() =>
                          setCarsPage((prev) => Math.min(prev + 1, totalCarsPages))
                        }
                        label="cars"
                      />
                    )}
                  </>
                )}

                {!selectedCar ? (
                  <EmptyState text="Click a car to see its booking history." />
                ) : selectedCarBookings.length === 0 ? (
                  <EmptyState
                    text={`No booking history found for ${selectedCar.title}.`}
                  />
                ) : (
                  <>
                    <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]">
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <FaHistory className="text-blue-600" />
                        Booking History for {selectedCar.title}
                      </h3>
                    </div>

                    {paginatedHistory.map((b) => (
                      <BookingCard key={b._id} booking={b} />
                    ))}

                    {selectedCarBookings.length > HISTORY_PER_PAGE && (
                      <PaginationBar
                        currentPage={historyPage}
                        totalPages={totalHistoryPages}
                        totalItems={selectedCarBookings.length}
                        perPage={HISTORY_PER_PAGE}
                        onPrev={() =>
                          setHistoryPage((prev) => Math.max(prev - 1, 1))
                        }
                        onNext={() =>
                          setHistoryPage((prev) =>
                            Math.min(prev + 1, totalHistoryPages)
                          )
                        }
                        label="bookings"
                      />
                    )}
                  </>
                )}
              </>
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

function CarCard({ car, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-3xl border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)] transition ${
        isActive
          ? "bg-blue-50/70 border-blue-200"
          : "bg-white border-slate-100 hover:bg-slate-50"
      }`}
    >
      <div className="flex gap-4">
        <img
          src={car.image}
          alt={car.title}
          className="h-24 w-24 rounded-2xl object-cover border border-slate-100"
        />

        <div className="flex-1">
          <h4 className="text-lg font-extrabold text-slate-900">{car.title}</h4>

          <div className="mt-2 text-sm text-slate-600 font-semibold">
            <p className="inline-flex items-center gap-2">
              <FaMapMarkerAlt className="text-slate-400" />
              {car.location}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-extrabold">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {car.bookingCount} bookings
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              {fmt(car.totalRevenue)}
            </span>
          </div>
        </div>
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
                  {u.username || u.name || "User"}
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

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPrev,
  onNext,
  label,
}) {
  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  return (
    <div className="rounded-3xl bg-white border border-slate-100 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm font-semibold text-slate-500">
        Showing <span className="font-extrabold text-slate-900">{start}</span>{" "}
        to <span className="font-extrabold text-slate-900">{end}</span> of{" "}
        <span className="font-extrabold text-slate-900">{totalItems}</span>{" "}
        {label}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Prev
        </button>

        <div className="text-sm font-extrabold text-slate-900">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Next
        </button>
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