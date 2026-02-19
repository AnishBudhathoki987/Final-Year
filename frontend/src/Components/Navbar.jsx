import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaArrowRight, FaUserCircle, FaChevronDown } from "react-icons/fa";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  const goDashboard = () => {
    setOpen(false);
    if (!user) return navigate("/login");

    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "broker") navigate("/broker/dashboard");
    else navigate("/user/dashboard");
  };

  // Smooth scroll to #about if on home, otherwise go home then scroll
  const goToAbout = () => {
    setOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById("about");
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#about");
      setTimeout(() => {
        const el = document.getElementById("about");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">
            CF
          </div>
          <span className="text-xl font-extrabold text-slate-900">CarFusion</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>

          <Link to="/vehicles" className="hover:text-blue-600 transition">
            Vehicles
          </Link>

          <Link to="/compare" className="hover:text-blue-600 transition">
            Compare
          </Link>

          <button
            type="button"
            onClick={goToAbout}
            className="hover:text-blue-600 transition"
          >
            About
          </button>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Login <FaArrowRight className="text-slate-500" />
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              {/* Profile Button */}
              <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <FaUserCircle className="text-slate-500" />
                <span className="max-w-[120px] truncate">
                  {user.username || "Profile"}
                </span>
                <FaChevronDown className="text-slate-400 text-xs" />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <button
                    onClick={goDashboard}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
