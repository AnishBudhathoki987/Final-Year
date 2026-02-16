import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCarSide, FaSearch, FaMapMarkerAlt } from "react-icons/fa";

export default function Home({ user }) {
  const navigate = useNavigate();

  const [type, setType] = useState("rent");
  const [location, setLocation] = useState("Kathmandu");
  const [maxPrice, setMaxPrice] = useState("");

  // ✅ Put images in: frontend/public/
  // Example: fortuner.png, honda.png, creta.png, swift.png...
  // If you don't want an image for a car, set image: "" (empty)
  const trendingRentals = useMemo(
    () => [
      {
        id: "r1",
        title: "Toyota Fortuner 2023",
        price: 4999,
        unit: "/day",
        image: "/fortuner.png",
      },
      { id: "r2", title: "Honda City 2022", price: 4499, unit: "/day", image: "/honda.png" },
      { id: "r3", title: "Hyundai Creta 2021", price: 5499, unit: "/day", image: "/creta.png" },
      { id: "r4", title: "Suzuki Swift 2020", price: 4299, unit: "/day", image: "/swift.png" },
    ],
    []
  );

  const purchaseCars = useMemo(
    () => [
      { id: "s1", title: "Toyota Hilux 2018", price: 3890000, image: "/hilux.png" },
      { id: "s2", title: "Hyundai Venue 2020", price: 1425000, image: "/venue.png" },
      { id: "s3", title: "Honda Civic 2019", price: 1775000, image: "/civic.png" },
      { id: "s4", title: "Ford EcoSport 2017", price: 1450000, image: "/ecosport.png" },
    ],
    []
  );

  const formatNpr = (n) => `रु ${Number(n).toLocaleString("en-IN")}`;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", type);
    if (location) params.set("location", location);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/cars?${params.toString()}`);
  };

  const goLoginOrDashboard = () => {
    if (!user) return navigate("/login");
    if (user.role === "admin") return navigate("/admin/dashboard");
    if (user.role === "broker") return navigate("/broker/dashboard");
    return navigate("/user/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-gray-900">
      {/* ================= NAVBAR (SCROLLS AWAY) ================= */}
      <header className="w-full px-4 pt-6">
        <div className="w-full rounded-2xl bg-black px-6 py-4 flex items-center justify-between shadow-xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <FaCarSide />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              <span className="text-emerald-400">Car</span>Fusion
            </h1>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex gap-10 text-sm font-medium text-white/80">
            <button onClick={() => navigate("/")} className="hover:text-emerald-400 transition">
              Home
            </button>
            <button onClick={() => navigate("/cars?type=rent")} className="hover:text-emerald-400 transition">
              Rent Cars
            </button>
            <button onClick={() => navigate("/cars?type=sell")} className="hover:text-emerald-400 transition">
              Purchase Cars
            </button>
            <a href="#how" className="hover:text-emerald-400 transition">
              How it works
            </a>
          </nav>

          {/* CTA */}
          <button
            onClick={goLoginOrDashboard}
            className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            {user ? "Dashboard" : "Login"}
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-4 pt-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* BIG HERO IMAGE */}
          <div className="rounded-3xl shadow-2xl overflow-hidden border bg-white">
            <img
              src="/car.png"
              alt="Hero Car"
              className="w-full h-[500px] object-cover"
            />
          </div>

          {/* Hero Text */}
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              Rent or Buy Cars in Nepal —{" "}
              <span className="text-emerald-600">All in One Place</span>
            </h2>

            <p className="mt-4 text-gray-600">
              A unified platform for rentals and second-hand vehicles with verified brokers and secure transactions.
            </p>

            <div className="mt-6 flex gap-4 flex-wrap">
              <button
                onClick={() => navigate("/cars?type=rent")}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Explore Rentals
              </button>

              <button
                onClick={() => navigate("/cars?type=sell")}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white font-semibold hover:bg-gray-100 transition"
              >
                Explore Purchase Cars
              </button>
            </div>
          </div>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <form
          onSubmit={handleSearch}
          className="mt-12 bg-white rounded-2xl shadow-lg border p-5 grid md:grid-cols-4 gap-4"
        >
          <div className="flex items-center gap-2 border rounded-xl px-3">
            <FaMapMarkerAlt className="text-gray-500" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full py-3 outline-none bg-transparent text-sm"
            >
              {["Kathmandu", "Pokhara", "Lalitpur", "Chitwan", "Butwal"].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Single dropdown arrow */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none w-full border rounded-xl px-4 py-3 text-sm outline-none"
            >
              <option value="rent">Type: Rental</option>
              <option value="sell">Type: Sale</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
              ▾
            </div>
          </div>

          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={type === "rent" ? "Max रु /day" : "Max रु"}
            className="border rounded-xl px-4 py-3 text-sm outline-none"
          />

          <button
            type="submit"
            className="bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <FaSearch /> Search
          </button>
        </form>
      </section>

      {/* ================= TRENDING RENTALS ================= */}
      <Section title="Trending Rentals" />
      <CardGrid data={trendingRentals} format={formatNpr} showPerDay />

      {/* ================= PURCHASE CARS ================= */}
      <Section title="Cars for Purchase" />
      <CardGrid data={purchaseCars} format={formatNpr} />

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <h3 className="text-2xl font-extrabold text-center mb-10">How It Works</h3>

        <div className="grid md:grid-cols-4 gap-6">
          <HowCard step="1" title="Create an Account" desc="Register and log in to start exploring cars." />
          <HowCard step="2" title="Browse & Compare" desc="Search, filter and compare different cars easily." />
          <HowCard step="3" title="Book or Purchase" desc="Choose rental or purchase option securely." />
          <HowCard step="4" title="Track & Manage" desc="Manage bookings and track your transactions." />
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl border p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Ready to Find Your Perfect Car?
          </h2>

          <button
            onClick={() => navigate(user ? "/user/dashboard" : "/register")}
            className="mt-8 px-10 py-4 rounded-2xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition shadow-md"
          >
            Get Started Today
          </button>
        </div>
      </section>

      <footer className="w-full bg-black text-white mt-10">
      <div className="w-full px-8 md:px-20 py-12">
    
    {/* Top Section */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
      
      {/* Brand */}
      <div>
        <h3 className="text-2xl font-extrabold">
          <span className="text-emerald-400">Car</span>Fusion
        </h3>
        <p className="text-white/70 text-sm mt-3 max-w-md">
          Rent or buy cars in Nepal with verified listings, trusted brokers, and secure transactions.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-8 text-sm font-medium text-white/80">
        <span className="hover:text-emerald-400 cursor-pointer">Home</span>
        <span className="hover:text-emerald-400 cursor-pointer">Rentals</span>
        <span className="hover:text-emerald-400 cursor-pointer">Purchase</span>
        <span className="hover:text-emerald-400 cursor-pointer">About</span>
        <span className="hover:text-emerald-400 cursor-pointer">Contact</span>
      </div>
    </div>

    {/* Divider */}
    <div className="border-t border-white/10 my-8"></div>

    {/* Bottom Section */}
    <div className="flex flex-col md:flex-row items-center justify-between text-xs text-white/60">
      <p>© {new Date().getFullYear()} CarFusion. All rights reserved.</p>

      <div className="flex gap-6 mt-3 md:mt-0">
        <span className="hover:text-emerald-400 cursor-pointer">Terms</span>
        <span className="hover:text-emerald-400 cursor-pointer">Privacy</span>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-14 pb-6">
      <h3 className="text-2xl font-extrabold text-center">{title}</h3>
    </div>
  );
}

function CardGrid({ data, format, showPerDay = false }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-lg border hover:shadow-xl transition overflow-hidden"
        >
          {/* ✅ If no image => empty (NO fallback) */}
          <div className="h-[180px] bg-slate-100">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : null}
          </div>

          <div className="p-4">
            <h4 className="font-bold text-sm">{item.title}</h4>

            <p className="mt-2 text-emerald-600 font-semibold">
              {format(item.price)} {showPerDay && item.unit ? item.unit : ""}
            </p>

            <button className="mt-4 w-full bg-emerald-600 text-white rounded-xl py-2 font-semibold hover:bg-emerald-700 transition">
               {showPerDay ? "Book Now" : "Purchase Now"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HowCard({ step, title, desc }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 text-center hover:shadow-lg transition">
      <div className="text-3xl mb-3 text-emerald-600 font-extrabold">{step}</div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm text-gray-600 mt-2">{desc}</p>
    </div>
  );
}
