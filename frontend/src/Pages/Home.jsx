import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdLocationOn,
  MdAttachMoney,
  MdSearch,
  MdVerifiedUser,
  MdVerified,
  MdTouchApp,
  MdPayments,
  MdTune,
  MdCompareArrows,
  MdKey,
} from "react-icons/md";

export default function Home() {
  const navigate = useNavigate();

  // Search state
  const [mode, setMode] = useState("rent"); 
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Demo featured vehicles (replace with API later)
  const featuredVehicles = useMemo(
    () => [
      {
        id: "v1",
        title: "Hyundai Creta 2023",
        city: "Kathmandu",
        priceLabel: "NPR 4,500",
        tag: "AVAILABLE",
        img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "v2",
        title: "Toyota Yaris",
        city: "Lalitpur",
        priceLabel: "NPR 3,200",
        tag: "AVAILABLE",
        img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "v3",
        title: "Mahindra Scorpio",
        city: "Pokhara",
        priceLabel: "NPR 6,000",
        tag: "AVAILABLE",
        img: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
      },
      {
        id: "v4",
        title: "Suzuki Swift",
        city: "Bhaktapur",
        priceLabel: "NPR 3,000",
        tag: "AVAILABLE",
        img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
      },
    ],
    []
  );

  const handleHeroRent = () => navigate("/vehicles?type=rent");
  const handleHeroPurchase = () => navigate("/vehicles?type=sale");

  const handleSearch = (e) => {
    e.preventDefault();
    const type = mode === "rent" ? "rent" : "sale";

    const params = new URLSearchParams();
    params.set("type", type);
    if (location.trim()) params.set("location", location.trim());
    if (maxPrice) params.set("maxPrice", maxPrice);

    navigate(`/vehicles?${params.toString()}`);
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 overflow-x-hidden">
      {/* ====== HERO ====== */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Airy blobs */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[520px] h-[520px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[640px] h-[640px] rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight">
                <span className="text-blue-600">Rent</span> or{" "}
                <span className="text-blue-600">Buy</span> Cars in Nepal — Fast &{" "}
                Verified
              </h2>

              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Browse verified brokers, compare vehicles across the country, and
                book securely in minutes. Your journey starts here.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={handleHeroRent}
                  className="px-6 h-12 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  Browse Rentals
                </button>

                <button
                  onClick={handleHeroPurchase}
                  className="px-6 h-12 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  Purchase Cars
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 group bg-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent z-10" />
                <img
                  alt="Silver SUV driving on a mountain road"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1800&q=80"
                />
              </div>

              <div className="absolute -bottom-6 -left-2 sm:bottom-8 sm:-left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="bg-green-100 text-green-700 p-2 rounded-full">
                  <MdVerifiedUser className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Verified Dealers
                  </p>
                  <p className="text-sm font-bold text-slate-900">100% Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SEARCH CARD (floating) ====== */}
      <section className="relative z-20 -mt-16 px-4 mb-20">
        <div className="max-w-[1000px] mx-auto bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            {/* Toggle */}
            <div className="flex justify-start">
              <div className="inline-flex bg-slate-100 p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setMode("rent")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    mode === "rent"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Rent
                </button>
                <button
                  type="button"
                  onClick={() => setMode("buy")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    mode === "buy"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Buy
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto] items-center">
              <div className="relative">
                <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  className="w-full pl-10 h-12 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                  placeholder="Location (e.g. Kathmandu)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="relative">
                <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  className="w-full pl-10 h-12 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-shadow"
                  placeholder="Max Price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <MdSearch className="text-xl" /> Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ====== FEATURED (Rent section anchor) ====== */}
      <section id="rent" className="py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                Featured Vehicles
              </h2>
              <p className="text-slate-600">
                Top rated cars available for rent right now.
              </p>
            </div>

            <button
              onClick={() => navigate("/vehicles")}
              className="hidden sm:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors gap-1"
            >
              View all cars <span className="text-sm">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVehicles.map((v) => (
              <div
                key={v.id}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={v.img}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded">
                    {v.tag}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                    {v.title}
                  </h3>

                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                    <MdLocationOn className="text-base" /> {v.city}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-500">Daily Rate</p>
                      <p className="font-bold text-blue-600">{v.priceLabel}</p>
                    </div>

                    <button
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-full transition-colors"
                      aria-label="View details"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => navigate("/vehicles")}
              className="inline-flex items-center justify-center px-6 h-12 border border-slate-200 rounded-lg text-blue-600 font-bold hover:bg-slate-50 transition-colors w-full"
            >
              View all cars
            </button>
          </div>
        </div>
      </section>

      {/* ====== BUY anchor section (just for scroll target) ====== */}
      <div id="buy" />

      {/* ====== WHY CHOOSE (Compare anchor) ====== */}
      <section
        id="compare"
        className="py-20 bg-slate-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/70 to-transparent pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose CarFusion?
            </h2>
            <p className="text-slate-600">
              We prioritize trust and convenience, ensuring your car rental or
              buying experience is seamless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MdVerified className="text-3xl" />}
              iconBg="bg-blue-100 text-blue-600"
              title="Verified Brokers"
              desc="Every broker undergoes a strict verification process for your safety."
            />
            <FeatureCard
              icon={<MdTouchApp className="text-3xl" />}
              iconBg="bg-green-100 text-green-600"
              title="Easy Booking"
              desc="Book your dream car in just a few clicks with a fast interface."
            />
            <FeatureCard
              icon={<MdPayments className="text-3xl" />}
              iconBg="bg-purple-100 text-purple-600"
              title="Secure Payments"
              desc="Your transactions are protected with industry-standard security."
            />
            <FeatureCard
              icon={<MdTune className="text-3xl" />}
              iconBg="bg-orange-100 text-orange-600"
              title="Compare & Filters"
              desc="Use advanced filters to compare cars and find exactly what fits your needs."
            />
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-slate-600">Your journey in 3 simple steps.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10" />

            <StepCard
              step={1}
              icon={<MdSearch className="text-4xl text-blue-600" />}
              title="Search"
              desc="Enter your location, dates, and preferences to find available cars."
            />
            <StepCard
              step={2}
              icon={<MdCompareArrows className="text-4xl text-blue-600" />}
              title="Compare"
              desc="Compare prices, features, and dealer ratings to make the best choice."
            />
            <StepCard
              step={3}
              icon={<MdKey className="text-4xl text-blue-600" />}
              title="Book or Buy"
              desc="Secure your booking instantly or contact the seller to finalize the deal."
            />
          </div>
        </div>
      </section>

      {/* ====== BROKER CTA (Broker anchor) ====== */}
      <section id="broker" className="py-12 px-4">
        <div className="max-w-[1200px] mx-auto bg-blue-50 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 lg:p-16 items-center relative z-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                Want to earn with your car?
              </h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md">
                Become a broker on CarFusion. List your vehicles for rent or sale
                and reach thousands of potential customers in Nepal.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-[0.99]"
              >
                Become a Broker
              </button>
            </div>

            <div className="hidden md:block relative h-full min-h-[300px]">
              <div
                className="w-full h-full bg-cover bg-center rounded-2xl"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1200&q=80)",
                }}
              />
              <div className="absolute inset-0 bg-blue-600/10 rounded-2xl mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 flex items-center justify-center bg-blue-600/10 rounded-lg">
                  <span className="text-blue-600">🚗</span>
                </div>
                <h3 className="text-slate-900 text-lg font-bold">CarFusion</h3>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Nepal&apos;s trusted marketplace for renting and buying second-hand cars.
                Fast, verified, and secure.
              </p>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  🌐
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  ✉️
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  📞
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => scrollToId("rent")} className="text-slate-500 hover:text-blue-600 text-sm transition">
                    Rent a Car
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("buy")} className="text-slate-500 hover:text-blue-600 text-sm transition">
                    Buy a Car
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("compare")} className="text-slate-500 hover:text-blue-600 text-sm transition">
                    Compare Models
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToId("broker")} className="text-slate-500 hover:text-blue-600 text-sm transition">
                    Become a Broker
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a className="text-slate-500 hover:text-blue-600 text-sm transition" href="#">Help Center</a></li>
                <li><a className="text-slate-500 hover:text-blue-600 text-sm transition" href="#">Terms of Service</a></li>
                <li><a className="text-slate-500 hover:text-blue-600 text-sm transition" href="#">Privacy Policy</a></li>
                <li><a className="text-slate-500 hover:text-blue-600 text-sm transition" href="#">Safety Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span> Kathmandu, Nepal
                </li>
                <li className="flex items-center gap-3">
                  <span>📞</span> +977 1 4XXXXXX
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span> info@carfusion.np
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} CarFusion. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Small reusable cards ---------- */

function FeatureCard({ icon, iconBg, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mb-6 relative">
        {icon}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm px-4">{desc}</p>
    </div>
  );
}
