import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye } from "react-icons/fa";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/api/users/login", formData);

      localStorage.setItem("token", res.data.token);
      setUser(res.data);

      // ✅ Always go to Home after login
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl h-[600px] grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* LEFT IMAGE */}
        <div className="hidden md:block">
          <img src="/car.png" alt="Car" className="w-full h-full object-cover" />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center px-10 relative">
          {/* Back to Home */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            ← Back to Home
          </button>

          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-center mb-2">
              <span className="text-blue-600">Car</span>Fusion
            </h1>

            <p className="text-center text-gray-500 mb-6">
              Sign In to Get Started
            </p>

            {error && (
              <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FaLock className="absolute top-3.5 left-4 text-gray-400" />
                <FaEye
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 right-4 text-gray-400 cursor-pointer"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                LOGIN
              </button>
            </form>

            <div className="flex justify-between text-sm text-gray-500 mt-5">
              <span className="hover:text-blue-600 cursor-pointer">
                Forgot Password?
              </span>
              <span
                onClick={() => navigate("/register")}
                className="hover:text-blue-600 cursor-pointer"
              >
                Create Account
              </span>
            </div>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
              >
                Continue browsing without login →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
