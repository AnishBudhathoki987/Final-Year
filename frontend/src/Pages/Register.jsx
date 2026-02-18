import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.agree) {
      setError("Please accept Terms & Privacy Policy");
      return;
    }

    try {
      await axios.post("/api/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl h-[600px] grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* LEFT IMAGE */}
        <div className="hidden md:block relative">
          <img src="/car.png" alt="Car" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-xl font-bold">Join CarFusion</h3>
            <p className="text-sm text-white/80">
              Rent or buy verified cars — fast & safe.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL (✅ scrollable if needed) */}
        <div className="relative h-[600px] overflow-y-auto">
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 text-sm font-semibold text-slate-600 hover:text-blue-600 transition z-10"
          >
            ← Back to Home
          </button>

          {/* Content */}
          <div className="min-h-full flex items-center justify-center px-6 sm:px-10 pt-20 pb-10">
            <div className="w-full max-w-md">
              <h1 className="text-3xl font-bold text-center mb-2">
                <span className="text-blue-600">Car</span>Fusion
              </h1>

              <p className="text-center text-gray-500 mb-6">
                Create an account
              </p>

              {error && (
                <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAME */}
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full pl-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* EMAIL */}
                <div className="relative">
                  <FaEnvelope className="absolute top-3.5 left-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full pl-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <FaLock className="absolute top-3.5 left-4 text-gray-400" />
                  <FaEye
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-3.5 right-4 text-gray-400 cursor-pointer"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ROLE */}
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Register as User</option>
                  <option value="broker">Register as Broker</option>
                </select>

                {/* TERMS */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={formData.agree}
                    onChange={handleChange}
                    className="accent-blue-600"
                  />
                  <span>I agree to Terms & Privacy Policy</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  CREATE ACCOUNT
                </button>
              </form>

              {/* ✅ Bottom links (now visible always) */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?
                <Link
                  to="/login"
                  className="ml-2 text-blue-600 hover:underline font-semibold"
                >
                  Login Here
                </Link>
              </p>

              <div className="text-center mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
                >
                  Continue browsing →
                </button>
              </div>

              {/* little extra space at bottom for safety */}
              <div className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
