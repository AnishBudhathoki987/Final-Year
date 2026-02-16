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
    <nav className="bg-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-white text-xl font-bold">
          <span className="text-blue-500">Car</span>Fusion
        </Link>

        <div className="flex items-center space-x-4">

          {/* If Logged In */}
          {user ? (
            <>
              {/* Role-based Dashboard Link */}
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="text-white hover:text-blue-400"
                >
                  Admin Dashboard
                </Link>
              )}

              {user.role === "broker" && (
                <Link
                  to="/broker/dashboard"
                  className="text-white hover:text-blue-400"
                >
                  Broker Dashboard
                </Link>
              )}

              {user.role === "user" && (
                <Link
                  to="/user/dashboard"
                  className="text-white hover:text-blue-400"
                >
                  My Dashboard
                </Link>
              )}

              {/* Show username */}
              <span className="text-gray-300">
                Hello, {user.username}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* If Not Logged In */}
              <Link
                className="text-white hover:text-blue-400"
                to="/login"
              >
                Login
              </Link>

              <Link
                className="text-white hover:text-blue-400"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
