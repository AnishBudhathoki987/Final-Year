import React from "react";
import { Link, NavLink } from "react-router-dom";
import { MdSearch, MdNotificationsNone, MdSettings } from "react-icons/md";

export default function BrokerNavbar({ user, onLogout }) {
  const initial =
    (user?.username?.trim()?.[0] || user?.email?.trim()?.[0] || "B").toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo (left) */}
        <Link to="/broker/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
            <span className="text-blue-700 text-lg">🚗</span>
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">
            CarFusion
          </span>
        </Link>

        {/* Search (pill like sample) */}
        <div className="hidden md:block flex-1 max-w-sm">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input
              placeholder="Search inventory..."
              className="w-full h-10 pl-10 pr-3 rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Small icon buttons (right, before profile) */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100">
            <MdNotificationsNone className="text-xl text-slate-600" />
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100">
            <MdSettings className="text-xl text-slate-600" />
          </button>

          {/* divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2" />

          {/* Profile (like sample: name + email + avatar) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-bold text-slate-900">
                {user?.username || "Broker"}
              </p>
              <p className="text-xs text-slate-500">{user?.email || "broker@carfusion.com"}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
              {initial}
            </div>
          </div>
        </div>

        {/* Optional: top-level nav pills (if you want them in broker navbar) */}
        <nav className="hidden lg:flex items-center gap-2 ml-4">
          <NavLink
            to="/broker/dashboard"
            className={({ isActive }) =>
              `px-4 h-10 rounded-full flex items-center font-semibold transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/broker/add-vehicle"
            className={({ isActive }) =>
              `px-4 h-10 rounded-full flex items-center font-semibold transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Add Vehicle
          </NavLink>

          <NavLink
            to="/broker/manage-vehicles"
            className={({ isActive }) =>
              `px-4 h-10 rounded-full flex items-center font-semibold transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Manage Listings
          </NavLink>

          <NavLink
            to="/broker/bookings"
            className={({ isActive }) =>
              `px-4 h-10 rounded-full flex items-center font-semibold transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            Bookings
          </NavLink>
        </nav>

        {/* Logout (keep simple) */}
        <button
          onClick={onLogout}
          className="ml-3 px-5 h-10 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
