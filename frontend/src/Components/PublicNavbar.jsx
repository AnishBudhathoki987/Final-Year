// src/Components/PublicNavbar.jsx
import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

export default function PublicNavbar({ user, setUser }) {
  const navigate = useNavigate();

  const linkBase =
    "text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors";
  const linkActive = "text-blue-600";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser?.(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="text-xl">🚗</span>
            </div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">
              CarFusion
            </div>
          </Link>

          {/* Middle: Links */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink
              to="/vehicles?type=rent"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive ? linkActive : ""
                }`
              }
            >
              Rent
            </NavLink>

            <NavLink
              to="/vehicles?type=sale"
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive ? linkActive : ""
                }`
              }
            >
              Buy
            </NavLink>

            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              Compare
            </NavLink>

            <NavLink
              to="/become-broker"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              Become a Broker
            </NavLink>
          </nav>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="h-10 px-5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center hover:bg-blue-700 transition"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.username || "Account"}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({user?.role || "user"})
                  </span>
                </div>

                {/* If broker, show quick link to broker area */}
                {user?.role === "broker" && (
                  <Link
                    to="/broker/dashboard"
                    className="h-10 px-4 rounded-xl border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition"
                  >
                    Broker Panel
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile Menu (optional simple) */}
            <div className="md:hidden">
              <button
                onClick={() => navigate("/vehicles")}
                className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition"
                title="Browse"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
