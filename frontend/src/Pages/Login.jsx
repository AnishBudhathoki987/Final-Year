import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye } from "react-icons/fa";

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      const res = await axios.post("/api/users/login", {
        email: formData.email,
        password: formData.password,
      });

      // ✅ Save token
      localStorage.setItem("token", res.data.token);

      // ✅ Save user state
      setUser(res.data);

      // ✅ Role-based redirect
      const role = res.data.role;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "broker") {
        navigate("/broker/dashboard");
      } else {
        navigate("/user/dashboard");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex justify-center pt-16">
      <div className="w-[90%] max-w-4xl h-[78vh] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-[#141414]">

        {/* LEFT IMAGE */}
        <div className="hidden md:flex items-center justify-center p-6">
          <img
            src="/car.png"
            alt="Car"
            className="w-full object-contain"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex justify-start pt-12 bg-[#1a1a1a]">
          <div className="w-full max-w-xs mx-auto text-white">

            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="text-blue-500">Car</span>Fusion
            </h1>

            <h2 className="text-lg font-semibold text-center mb-1 text-orange-400">
              Hello!
            </h2>

            <p className="text-center text-gray-400 mb-5 text-sm">
              Sign In to Get Started
            </p>

            {error && (
              <p className="bg-red-500/20 text-red-400 p-2 rounded mb-4 text-sm text-center">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute top-3.5 left-4 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FaLock className="absolute top-3.5 left-4 text-gray-400 text-sm" />
                <FaEye
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3.5 right-4 text-gray-400 cursor-pointer text-sm"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full pl-11 pr-10 py-2.5 text-sm bg-transparent border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition py-2.5 rounded-lg font-semibold text-sm"
              >
                LOGIN
              </button>
            </form>

            <div className="flex justify-between text-xs text-gray-400 mt-5">
              <span className="cursor-pointer hover:text-orange-400">
                Forgot Password?
              </span>
              <span
                onClick={() => navigate("/register")}
                className="cursor-pointer hover:text-orange-400"
              >
                Create Account
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
