// src/Pages/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCarSide,
  FaTag,
  FaShieldAlt,
  FaWallet,
  FaClock,
  FaBalanceScale,
} from "react-icons/fa";

export default function Home({ user }) {
  const navigate = useNavigate();

  // ----- Search Bar State -----
  // ✅ all = show both rent + sale (default on page load)
  const [tab, setTab] = useState("all"); // all | rent | buy
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Any Type"); // UI label (maps to category)
  const [price, setPrice] = useState("Any Price");

  // ----- Home Vehicles shown on this page -----
  const [homeResults, setHomeResults] = useState([]);
  const [loadingHomeResults, setLoadingHomeResults] = useState(true);

  // ✅ to decide heading text (only show "Top Cars for Rent/Sale" after user searches)
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Load first 6 vehicles on page load (NO demo / NO forced type filter)
  useEffect(() => {
    const loadHomeVehicles = async () => {
      setLoadingHomeResults(true);
      try {
        const res = await axios.get("/api/vehicles?limit=6&sort=newest");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.vehicles || [];
        setHomeResults(data.slice(0, 6));
      } catch {
        setHomeResults([]); // no demo fallback
      } finally {
        setLoadingHomeResults(false);
      }
    };

    loadHomeVehicles();
  }, []);

  // ----- Actions / Gating -----
  const handleListYourCar = () => {
    if (!user) return navigate("/login");
    if (user.role !== "broker") return navigate("/unauthorized");
    navigate("/broker/add-vehicle");
  };

  const handleGetStarted = () => {
    if (!user) return navigate("/register");

    if (user.role === "admin") return navigate("/admin/dashboard");
    if (user.role === "broker") return navigate("/broker/dashboard");
    return navigate("/user/dashboard");
  };

  // ✅ HOME search (no navigation). Applies type filter ONLY when tab is rent/buy.
  const handleSearch = async () => {
    setLoadingHomeResults(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();

      // tab => backend expects type (rent | sale)
      if (tab === "rent") params.set("type", "rent");
      if (tab === "buy") params.set("type", "sale");
      // if tab === "all" => do not send type, so it returns both rent + sale

      if (location.trim()) params.set("location", location.trim());

      // UI "type" is actually backend category
      if (type !== "Any Type") params.set("category", type);

      // map price to min/max (⚠️ only meaningful when tab is rent or buy)
      if (price !== "Any Price") {
        if (tab === "rent") {
          // rent uses pricePerDay
          if (price === "Below NPR 3,000/day") params.set("maxPrice", "3000");
          if (price === "NPR 3,000–6,000/day") {
            params.set("minPrice", "3000");
            params.set("maxPrice", "6000");
          }
          if (price === "Above NPR 6,000/day") params.set("minPrice", "6000");
        }

        if (tab === "buy") {
          // buy uses price
          if (price === "Below NPR 30 Lakhs")
            params.set("maxPrice", String(30 * 100000));
          if (price === "NPR 30–60 Lakhs") {
            params.set("minPrice", String(30 * 100000));
            params.set("maxPrice", String(60 * 100000));
          }
          if (price === "Above NPR 60 Lakhs")
            params.set("minPrice", String(60 * 100000));
        }

        // ✅ if tab === "all", ignore price because rent+sale use different fields
      }

      params.set("limit", "6");
      params.set("sort", "newest");

      const res = await axios.get(`/api/vehicles?${params.toString()}`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.vehicles || [];

      setHomeResults(data.slice(0, 6));
    } catch {
      setHomeResults([]);
    } finally {
      setLoadingHomeResults(false);
    }
  };

  const resetFilters = async () => {
    setTab("all");
    setLocation("");
    setType("Any Type");
    setPrice("Any Price");
    setHasSearched(false);

    setLoadingHomeResults(true);
    try {
      const res = await axios.get("/api/vehicles?limit=6&sort=newest");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.vehicles || [];
      setHomeResults(data.slice(0, 6));
    } catch {
      setHomeResults([]);
    } finally {
      setLoadingHomeResults(false);
    }
  };

  const formatPrice = (v) => {
    if (!v) return "—";
    if (v.type === "rent") {
      return `NPR ${Number(v.pricePerDay || 0).toLocaleString()} / day`;
    }
    return `NPR ${Number(v.price || 0).toLocaleString()}`;
  };

  const getCardImage = (v) => {
    if (!v) return "https://via.placeholder.com/500x350?text=No+Image";
    if (Array.isArray(v.images) && v.images.length) return v.images[0];
    if (v.image) return v.image;
    return "https://via.placeholder.com/500x350?text=No+Image";
  };

  const sectionTitle = () => {
    // ✅ You asked: show “Top Cars for Rent/Sale only”, no subtitle line
    if (!hasSearched || tab === "all") return "Top Cars";
    if (tab === "rent") return "Top Cars for Rent";
    return "Top Cars for Sale";
  };

  return (
    <div className="bg-[#f6f7fb]">
      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              #1 MARKETPLACE IN NEPAL
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Rent or Buy Cars Across Nepal —{" "}
              <span className="text-blue-600">All in One Platform</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified brokers and sellers. Experience secure
              payments via{" "}
              <span className="font-semibold text-emerald-600">eSewa</span> &{" "}
              <span className="font-semibold text-purple-600">Khalti</span> for a
              hassle-free journey.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => navigate("/vehicles")}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
              >
                Browse Cars
              </button>

              <button
                onClick={handleListYourCar}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                List Your Car
              </button>
            </div>
          </div>

          {/* ================= SEARCH CARD ================= */}
          <div className="mt-10 bg-white rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
            {/* tabs */}
            <div className="px-6 pt-6 flex items-center gap-3">
              <button
                onClick={() => setTab("all")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  tab === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setTab("rent")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  tab === "rent"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Rent
              </button>

              <button
                onClick={() => setTab("buy")}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  tab === "buy"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Buy
              </button>
            </div>

            {/* fields */}
            <div className="px-6 pb-6 pt-4 grid md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400">LOCATION</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <FaMapMarkerAlt className="text-slate-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kathmandu, Pokhara..."
                    className="w-full outline-none text-slate-700 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400">TYPE</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <FaCarSide className="text-slate-400" />
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full outline-none bg-transparent text-slate-700"
                  >
                    <option>Any Type</option>
                    <option>SUV</option>
                    <option>Sedan</option>
                    <option>Hatchback</option>
                    <option>Pickup</option>
                    <option>EV</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400">
                  PRICE RANGE
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <FaTag className="text-slate-400" />
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full outline-none bg-transparent text-slate-700"
                  >
                    <option>Any Price</option>
                    <option>Below NPR 3,000/day</option>
                    <option>NPR 3,000–6,000/day</option>
                    <option>Above NPR 6,000/day</option>
                    <option>Below NPR 30 Lakhs</option>
                    <option>NPR 30–60 Lakhs</option>
                    <option>Above NPR 60 Lakhs</option>
                  </select>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                  {tab === "all"
                    ? "Tip: choose Rent or Buy to use price filter."
                    : "Price filter applied to your selection."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  className="flex-1 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FaSearch /> Search Now
                </button>
                <button
                  onClick={resetFilters}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RESULTS ================= */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {sectionTitle()}
            </h2>
          </div>

          <button
            onClick={() => navigate("/vehicles")}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {loadingHomeResults ? (
            <div className="md:col-span-3 text-center py-14 text-slate-500 font-semibold">
              Loading vehicles...
            </div>
          ) : homeResults.length === 0 ? (
            <div className="md:col-span-3 text-center py-14 text-slate-500 font-semibold">
              No vehicles found.
            </div>
          ) : (
            homeResults.slice(0, 6).map((v) => (
              <div
                key={v._id}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <div className="relative h-44">
                  <img
                    src={getCardImage(v)}
                    alt={v.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-slate-800">
                    {v.type === "rent" ? "FOR RENT" : "FOR SALE"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-extrabold text-slate-900">{v.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {v.year ? `${v.year} • ` : ""}
                    {v.fuelType || "—"} • {v.transmission || "—"}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-slate-400" />
                        {v.location || "—"}
                      </p>
                      <p className="mt-2 text-sm font-extrabold text-blue-600">
                        {formatPrice(v)}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/vehicles/${v._id}`)}
                      className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ================= WHY CHOOSE ================= */}
      <section id="about" className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center">
            Why Choose CarFusion?
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            We simplify the car buying and renting experience in Nepal with trust
            and technology.
          </p>

          <div className="mt-10 grid md:grid-cols-4 gap-6">
            <Feature
              icon={<FaShieldAlt />}
              title="Verified Brokers"
              desc="Every broker and seller is manually verified to ensure safety and authenticity of listings."
            />
            <Feature
              icon={<FaWallet />}
              title="Secure Payments"
              desc="Seamless integration with eSewa and Khalti for bookings and secure transactions."
            />
            <Feature
              icon={<FaClock />}
              title="Real-Time Booking"
              desc="Check availability instantly for rentals and book your ride without the wait."
            />
            <Feature
              icon={<FaBalanceScale />}
              title="Easy Comparison"
              desc="Compare prices, features and specs side-by-side to make the best decision."
            />
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <Stat value="500+" label="ACTIVE CAR LISTINGS" />
            <Stat value="200+" label="VERIFIED BROKERS" />
            <Stat value="1000+" label="HAPPY CUSTOMERS" />
          </div>

          {/* CTA Banner */}
          <div className="mt-12 rounded-3xl bg-gradient-to-br from-[#0b1220] via-[#0b1220] to-[#121a2b] text-white px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div>
              <h3 className="text-2xl font-extrabold">
                Ready to find your dream ride?
              </h3>
              <p className="mt-2 text-sm text-white/75 max-w-xl">
                Join thousands of users in Nepal who trust CarFusion for their
                automotive needs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGetStarted}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/vehicles")}
                className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition border border-white/15"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 border-t border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
                CF
              </div>
              <span className="font-extrabold text-slate-900">CarFusion</span>
            </div>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Nepal’s premier digital marketplace for renting and buying
              vehicles. Trusted by locals and tourists alike.
            </p>
            <div className="mt-4 text-xs text-slate-400">
              © 2026 CarFusion Nepal. All rights reserved.
            </div>
          </div>

          <FooterCol
            title="Marketplace"
            links={[
              { label: "Search for Cars", to: "/vehicles" },
              { label: "Sell your Car", onClick: handleListYourCar },
              { label: "Compare Prices", to: "/compare" },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { label: "About Us", to: "/#about" },
              { label: "Contact Support", to: "/#about" },
              { label: "Terms of Service", to: "/#about" },
              { label: "Privacy Policy", to: "/#about" },
            ]}
          />

          <div>
            <p className="text-sm font-extrabold text-slate-900">Contact</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>info@carfusion.com</p>
              <p>+977 9800-000000</p>
              <p>Lazimpat, Kathmandu</p>
            </div>
            <p className="mt-6 text-xs text-slate-400">Designed with ❤️ in Nepal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-[#f7f9ff] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.04)]">
      <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 grid place-items-center text-blue-600">
        {icon}
      </div>
      <h4 className="mt-4 font-extrabold text-slate-900">{title}</h4>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-[#f6f7fb] p-6">
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-2 text-xs font-bold text-slate-500 tracking-wider">
        {label}
      </div>
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      <div className="mt-3 space-y-2">
        {links.map((l) =>
          l.to ? (
            <Link
              key={l.label}
              to={l.to}
              className="block text-sm text-slate-600 hover:text-blue-600 transition"
            >
              {l.label}
            </Link>
          ) : (
            <button
              key={l.label}
              onClick={l.onClick}
              className="block text-left text-sm text-slate-600 hover:text-blue-600 transition"
              type="button"
            >
              {l.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}