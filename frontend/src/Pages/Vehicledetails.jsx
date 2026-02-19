import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaHeart,
  FaMapMarkerAlt,
  FaGasPump,
  FaCogs,
  FaUsers,
  FaTachometerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function VehicleDetails({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // ✅ If Vehicles.jsx navigates with state, this will work
  const stateVehicle = location.state?.vehicle || null;

  const [vehicle, setVehicle] = useState(stateVehicle);
  const [loading, setLoading] = useState(!stateVehicle);
  const [error, setError] = useState("");

  const [selectedImg, setSelectedImg] = useState(0);
  const [saved, setSaved] = useState(false);

  // ✅ SAME demo list (so demo details page works even without backend)
  const demoVehicles = useMemo(
    () => [
      {
        _id: "demo1",
        type: "rent",
        title: "Toyota Prado 2018",
        location: "Kathmandu, Nepal",
        fuelType: "Diesel",
        transmission: "Automatic",
        seats: 7,
        mileage: 45000,
        pricePerDay: 25000,
        category: "SUV",
        description:
          "This 2018 Toyota Prado is perfect for city rides and long-distance mountain trips in Nepal.",
        image:
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop",
        ],
      },
      {
        _id: "demo2",
        type: "sale",
        title: "Hyundai Creta 2021",
        location: "Pokhara, Nepal",
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 5,
        mileage: 22000,
        price: 4500000,
        category: "SUV",
        description: "Well maintained Hyundai Creta for sale. Great condition.",
        image:
          "https://images.unsplash.com/photo-1605559424843-9e61a7b5b4b2?q=80&w=2000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1605559424843-9e61a7b5b4b2?q=80&w=2000&auto=format&fit=crop",
        ],
      },
      {
        _id: "demo3",
        type: "sale",
        title: "Kia Sportage 2020",
        location: "Lalitpur, Nepal",
        fuelType: "Diesel",
        transmission: "Automatic",
        seats: 5,
        mileage: 30000,
        price: 6200000,
        category: "SUV",
        description: "Powerful and reliable SUV. Perfect for family.",
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop",
        ],
      },
      {
        _id: "demo4",
        type: "rent",
        title: "Honda City 2022",
        location: "Bhaktapur, Nepal",
        fuelType: "Petrol",
        transmission: "CVT",
        seats: 5,
        mileage: 12000,
        pricePerDay: 12000,
        category: "Sedan",
        description: "Smooth sedan for rent. Great for city travel.",
        image:
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2000&auto=format&fit=crop",
        ],
      },
      {
        _id: "demo5",
        type: "sale",
        title: "Ford Ranger 2019",
        location: "Chitwan, Nepal",
        fuelType: "Diesel",
        transmission: "Auto",
        seats: 5,
        mileage: 40000,
        price: 8500000,
        category: "Pickup",
        description: "Strong pickup truck for sale. Off-road ready.",
        image:
          "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2000&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2000&auto=format&fit=crop",
        ],
      },
      {
        _id: "demo6",
        type: "rent",
        title: "BYD Atto 3",
        location: "Kathmandu, Nepal",
        fuelType: "Electric",
        transmission: "Auto",
        seats: 5,
        mileage: 8000,
        pricePerDay: 18000,
        category: "EV",
        description: "Electric SUV for rent. Clean and modern ride.",
        image:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2400&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2400&auto=format&fit=crop",
        ],
      },
    ],
    []
  );

  // ✅ Demo broker card (UI only)
  const broker = useMemo(
    () => ({
      name: "Kushal Shrestha",
      verified: true,
      rating: 4.9,
      carsSold: 128,
      experience: "5 Years",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    }),
    []
  );

  useEffect(() => {
    // 1) If state vehicle exists, use it
    if (stateVehicle) {
      setVehicle(stateVehicle);
      setLoading(false);
      return;
    }

    // 2) If demo id, load from demo list
    const demoHit = demoVehicles.find((d) => d._id === id);
    if (demoHit) {
      setVehicle(demoHit);
      setLoading(false);
      return;
    }

    // 3) Otherwise fetch from backend
    const fetchById = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        const v = res.data?.vehicle ?? res.data;
        setVehicle(v);
      } catch {
        setVehicle(null);
        setError("Vehicle not found. Invalid id or listing removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchById();
  }, [id, stateVehicle, demoVehicles]);

  useEffect(() => setSelectedImg(0), [vehicle?._id]);

  const images = useMemo(() => {
    if (!vehicle) return [];
    if (vehicle.image) return [vehicle.image, ...(vehicle.images || [])].filter(Boolean);
    if (Array.isArray(vehicle.images) && vehicle.images.length) return vehicle.images;
    return [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop",
    ];
  }, [vehicle]);

  const isRent = vehicle?.type === "rent";
  const badgeText = isRent ? "FOR RENT" : "FOR SALE";
  const badgeClass = isRent ? "bg-blue-600" : "bg-emerald-500";

  const formatNPR = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;
  const mainPrice = isRent ? vehicle?.pricePerDay : vehicle?.price;
  const priceLabel = isRent ? "Price per day" : "Total Price";
  const actionText = isRent ? "Book Now" : "Buy Now";

  const onPrimaryAction = () => {
    if (!user) return navigate("/login");
    alert(`${actionText} clicked! (connect to booking/checkout later)`);
  };

  const onMessage = () => {
    if (!user) return navigate("/login");
    alert("Message clicked! (connect to chat later)");
  };

  const onCall = () => alert("Call clicked! (connect to broker contact later)");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white border border-slate-100 p-10 shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <p className="text-slate-500">Loading vehicle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              type="button"
            >
              <FaArrowLeft /> Back
            </button>

            <Link to="/vehicles" className="text-sm font-semibold text-blue-600 hover:underline">
              Back to Browse
            </Link>
          </div>

          <div className="mt-6 rounded-3xl bg-white border border-slate-100 p-14 text-center shadow-[0_30px_90px_rgba(0,0,0,0.06)]">
            <h2 className="text-3xl font-extrabold text-slate-900">Vehicle not found</h2>
            <p className="mt-2 text-slate-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 hover:text-slate-700" type="button">
            <FaArrowLeft /> Back to Browse
          </button>
          <span>/</span>
          <span className="capitalize">{vehicle.category || "Vehicles"}</span>
          <span>/</span>
          <span className="text-slate-700 font-semibold">{vehicle.title}</span>
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* left */}
          <div>
            <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="relative h-[360px]">
                <img src={images[selectedImg]} alt={vehicle.title} className="h-full w-full object-cover" />

                <div className={`absolute top-5 left-5 ${badgeClass} text-white text-xs font-extrabold px-3 py-1.5 rounded-full`}>
                  {badgeText}
                </div>

                <button
                  onClick={() => setSaved((s) => !s)}
                  className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/90 grid place-items-center shadow"
                  type="button"
                  title="Save"
                >
                  <FaHeart className={saved ? "text-rose-500" : "text-slate-400"} />
                </button>
              </div>

              {/* thumbs */}
              <div className="p-5">
                <div className="grid grid-cols-4 gap-4">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={img + idx}
                      onClick={() => setSelectedImg(idx)}
                      className={`relative rounded-2xl overflow-hidden border ${
                        idx === selectedImg ? "border-blue-600" : "border-slate-200"
                      }`}
                      type="button"
                    >
                      <img src={img} alt="thumb" className="h-20 w-full object-cover" />
                      {idx === 3 && images.length > 4 ? (
                        <div className="absolute inset-0 bg-black/45 grid place-items-center text-white text-sm font-bold">
                          +{images.length - 3} photos
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* specs */}
            <div className="mt-8 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-lg font-extrabold text-slate-900">Specifications</h3>

              <div className="mt-5 grid sm:grid-cols-4 gap-4">
                <Spec icon={<FaGasPump />} label="Fuel Type" value={vehicle.fuelType || "—"} />
                <Spec icon={<FaCogs />} label="Transmission" value={vehicle.transmission || "—"} />
                <Spec icon={<FaUsers />} label="Capacity" value={vehicle.seats ? `${vehicle.seats} Seats` : "—"} />
                <Spec
                  icon={<FaTachometerAlt />}
                  label="Mileage"
                  value={vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString("en-US")} km` : "—"}
                />
              </div>
            </div>

            {/* about */}
            <div className="mt-8 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6">
              <h3 className="text-lg font-extrabold text-slate-900">About this Vehicle</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {vehicle.description || "No description provided yet."}
              </p>
            </div>
          </div>

          {/* right */}
          <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] p-6 h-fit sticky top-24">
            <h2 className="text-3xl font-extrabold text-slate-900">{vehicle.title}</h2>

            <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
              <FaMapMarkerAlt className="text-slate-400" />
              {vehicle.location}
            </p>

            <div className="mt-6 rounded-3xl bg-[#f6f7fb] p-5 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500">{priceLabel}</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-3xl font-extrabold text-slate-900">{formatNPR(mainPrice)}</p>
                {isRent ? <span className="text-sm text-slate-500 mb-1">/ Day</span> : null}
              </div>
            </div>

            <button
              onClick={onPrimaryAction}
              className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition flex items-center justify-center gap-2"
              type="button"
            >
              <FaCalendarAlt />
              {actionText}
            </button>

            <div className="mt-3 grid grid-cols-[1fr_56px] gap-3">
              <button
                onClick={onMessage}
                className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                type="button"
              >
                <FaEnvelope /> Message
              </button>

              <button
                onClick={onCall}
                className="rounded-2xl border border-slate-200 bg-white grid place-items-center text-slate-700 hover:bg-slate-50 transition"
                type="button"
                title="Call"
              >
                <FaPhoneAlt />
              </button>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={broker.avatar} alt={broker.name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{broker.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {broker.verified ? (
                        <>
                          <FaCheckCircle className="text-emerald-500" /> Verified Broker
                        </>
                      ) : (
                        "Broker"
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Rating</p>
                  <p className="text-sm font-extrabold text-slate-900">⭐ {broker.rating}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat label="CARS SOLD" value={broker.carsSold} />
                <MiniStat label="EXPERIENCE" value={broker.experience} />
              </div>
            </div>

            <div className="mt-6">
              <Link to="/vehicles" className="text-sm font-semibold text-blue-600 hover:underline">
                ← Back to Vehicles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ icon, label, value }) {
  return (
    <div className="rounded-3xl bg-[#f6f7fb] border border-slate-100 p-5">
      <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-3xl bg-[#f6f7fb] border border-slate-100 p-4 text-center">
      <p className="text-[10px] font-extrabold tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
