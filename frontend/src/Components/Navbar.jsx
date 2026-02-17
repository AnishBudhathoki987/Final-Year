import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center bg-blue-600/10 rounded-lg">
            <span className="text-blue-600 text-xl">🚗</span>
          </div>
          <h1 className="text-slate-900 text-xl font-bold tracking-tight">
            CarFusion
          </h1>
        </Link>

        {/* Middle Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition" href="#rent">
            Rent
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition" href="#buy">
            Buy
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition" href="#compare">
            Compare
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition" href="#broker">
            Become a Broker
          </a>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Role-based Dashboard */}
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Admin Dashboard
                </Link>
              )}

              {user.role === "broker" && (
                <Link
                  to="/broker/dashboard"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  Broker Dashboard
                </Link>
              )}

              {user.role === "user" && (
                <Link
                  to="/user/dashboard"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  My Dashboard
                </Link>
              )}

              {/* Username */}
              <span className="hidden sm:block text-sm text-slate-500">
                Hello, <span className="font-semibold">{user.username}</span>
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 h-9 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* ✅ Only Login (NO Register) */}
              <Link
                to="/login"
                className="px-5 h-9 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
