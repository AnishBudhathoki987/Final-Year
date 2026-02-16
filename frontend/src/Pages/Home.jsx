import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaChevronDown,
  FaSearch,
  FaUserPlus,
  FaClipboardList,
  FaShoppingCart,
  FaCarSide,
} from "react-icons/fa";

export default function Home({ user }) {
  const navigate = useNavigate();

  // Search UI state (later connect to /cars page with real filters)
  const [location, setLocation] = useState("Kathmandu");
  const [type, setType] = useState("rent"); // rent | sell
  const [budget, setBudget] = useState("");

  const trendingRentals = useMemo(
    () => [
      { id: "r1", title: "Toyota Fortuner 2023", price: 4999, unit: "/day", cta: "Book Now" },
      { id: "r2", title: "Honda City 2022", price: 4499, unit: "/day", cta: "Book Now" },
      { id: "r3", title: "Hyundai Creta 2021", price: 5499, unit: "/day", cta: "Book Now" },
      { id: "r4", title: "Suzuki Swift 2020", price: 4299, unit: "/day", cta: "View Details" },
    ],
    []
  );

  const purchaseCars = useMemo(
    () => [
      { id: "s1", title: "Toyota Hilux 2018", price: 3890000, cta: "View Details" },
      { id: "s2", title: "Hyundai Venue 2020", price: 1425000, cta: "View Details" },
      { id: "s3", title: "Honda Civic 2019", price: 1775000, cta: "View Details" },
      { id: "s4", title: "Ford EcoSport 2017", price: 1450000, cta: "View Details" },
    ],
    []
  );

  const formatNpr = (n) => `रु ${Number(n).toLocaleString("en-IN")}`;

  const goDashboardOrRegister = () => {
    if (!user) return navigate("/register");
    if (user.role === "admin") return navigate("/admin/dashboard");
    if (user.role === "broker") return navigate("/broker/dashboard");
    return navigate("/user/dashboard");
  };

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    params.set("type", type);
    if (budget) params.set("budget", budget);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#07090c] text-white">
      {/* ===== BACKGROUND (cinematic) ===== */}
      <div className="relative overflow-hidden">
        {/* blurred texture */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.10),transparent_55%)]" />
          <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        {/* ===== HERO SECTION ===== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-10 pb-10">
            <div className="grid items-center gap-10 md:grid-cols-2">
              {/* Left: Car Visual */}
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_60px_rgba(16,185,129,0.12)]">
                  <div className="aspect-[16/10] rounded-xl bg-black/30 overflow-hidden flex items-center justify-center">
                    <img
                      src="/car.png"
                      alt="CarFusion Hero Car"
                      className="w-full h-full object-contain p-6 opacity-95"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Text + Buttons */}
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  Rent or Buy Cars in Nepal — All in One Place
                </h1>
                <p className="mt-3 text-sm md:text-base text-gray-300 max-w-xl">
                  A unified platform for rentals and second-hand vehicles with verified brokers and secure transactions.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/cars?type=rent"
                    className="rounded-lg bg-emerald-600/90 px-5 py-3 text-sm font-semibold hover:bg-emerald-700 transition shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                  >
                    Explore Rentals
                  </Link>
                  <Link
                    to="/cars?type=sell"
                    className="rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
                  >
                    Explore Purchased Cars
                  </Link>
                </div>

                {/* Search Bar (like screenshot) */}
                <form
                  onSubmit={onSearch}
                  className="mt-8 rounded-xl border border-white/10 bg-black/30 p-3 shadow-[0_0_35px_rgba(16,185,129,0.08)]"
                >
                  <div className="grid gap-3 md:grid-cols-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <FaMapMarkerAlt className="text-emerald-300" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                        placeholder="Location"
                      />
                      <FaChevronDown className="text-gray-500 text-xs" />
                    </div>

                    {/* Type */}
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-transparent text-sm text-white outline-none"
                      >
                        <option className="bg-[#07090c]" value="rent">
                          Type: Rental
                        </option>
                        <option className="bg-[#07090c]" value="sell">
                          Type: Sale
                        </option>
                      </select>
                      <FaChevronDown className="text-gray-500 text-xs" />
                    </div>

                    {/* Budget */}
                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <input
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                        placeholder="Budget"
                      />
                      <FaChevronDown className="text-gray-500 text-xs" />
                    </div>

                    {/* Search Button */}
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600/90 px-4 py-2 text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                      <FaSearch /> Search
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TRENDING RENTALS ===== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px flex-1 bg-emerald-500/25" />
                <h2 className="text-xl md:text-2xl font-bold tracking-wide">Trending Rentals</h2>
                <div className="h-px flex-1 bg-emerald-500/25" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trendingRentals.map((c, idx) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="p-3">
                    <div className="aspect-[16/9] rounded-xl bg-black/30 overflow-hidden flex items-center justify-center">
                      <img src="/car.png" alt={c.title} className="h-full w-full object-contain p-4" />
                    </div>

                    <div className="mt-3">
                      <h3 className="font-semibold text-sm">{c.title}</h3>
                      <p className="mt-1 text-emerald-300 font-semibold">
                        {formatNpr(c.price)}
                        <span className="text-gray-400 font-normal">{c.unit}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/cars/${c.id}`)}
                      className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold transition
                        ${idx === 3
                          ? "bg-white/5 border border-emerald-500/35 hover:bg-white/10"
                          : "bg-emerald-600/90 hover:bg-emerald-700"
                        }`}
                    >
                      {c.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CARS FOR PURCHASE ===== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px flex-1 bg-emerald-500/25" />
                <h2 className="text-xl md:text-2xl font-bold tracking-wide">Cars for Purchase</h2>
                <div className="h-px flex-1 bg-emerald-500/25" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {purchaseCars.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="p-3">
                    <div className="aspect-[16/9] rounded-xl bg-black/30 overflow-hidden flex items-center justify-center">
                      <img src="/car.png" alt={c.title} className="h-full w-full object-contain p-4" />
                    </div>

                    <div className="mt-3">
                      <h3 className="font-semibold text-sm">{c.title}</h3>
                      <p className="mt-1 text-emerald-300 font-semibold">{formatNpr(c.price)}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/cars/${c.id}`)}
                      className="mt-3 w-full rounded-lg bg-white/5 border border-emerald-500/35 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
                    >
                      {c.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS (4 steps like screenshot) ===== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px flex-1 bg-emerald-500/25" />
                <h2 className="text-xl md:text-2xl font-bold tracking-wide">How It Works</h2>
                <div className="h-px flex-1 bg-emerald-500/25" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <HowCard
                icon={<FaUserPlus />}
                title="1. Create an Account"
                desc="Register as a user or broker and get secure access."
              />
              <HowCard
                icon={<FaClipboardList />}
                title="2. Browse & Compare"
                desc="Explore rentals or used cars with filters and pricing."
              />
              <HowCard
                icon={<FaShoppingCart />}
                title="3. Book or Purchase"
                desc="Book rentals or contact broker to purchase."
              />
              <HowCard
                icon={<FaCarSide />}
                title="4. Track & Manage"
                desc="Manage bookings and listings from dashboards."
              />
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pb-14">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.10)]">
              <h3 className="text-2xl md:text-3xl font-bold">Ready to Find Your Perfect Car?</h3>
              <button
                onClick={goDashboardOrRegister}
                className="mt-6 rounded-lg bg-emerald-600/90 px-7 py-3 text-sm font-semibold hover:bg-emerald-700 transition shadow-[0_0_25px_rgba(16,185,129,0.25)]"
              >
                Get Started Today
              </button>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <Link to="/" className="hover:text-white">About</Link>
                <span className="text-gray-600">|</span>
                <Link to="/" className="hover:text-white">Contact</Link>
                <span className="text-gray-600">|</span>
                <Link to="/" className="hover:text-white">Terms</Link>
                <span className="text-gray-600">|</span>
                <Link to="/" className="hover:text-white">Privacy</Link>
              </div>

              <p className="mt-6 text-xs text-gray-500">
                © {new Date().getFullYear()} CarFusion. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HowCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition shadow-[0_0_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
          {icon}
        </div>
        <div className="font-semibold text-sm">{title}</div>
      </div>
      <p className="mt-3 text-sm text-gray-300">{desc}</p>
    </div>
  );
}
