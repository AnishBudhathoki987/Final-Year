import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agree: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agree) {
      setError("Please accept Terms & Privacy Policy");
      return;
    }

    try {
      await axios.post("/api/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl h-[600px] grid md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* LEFT IMAGE */}
        <div className="hidden md:block">
          <img
            src="/car.png"
            alt="Car"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center px-10">
          <div className="w-full max-w-md">

            <h1 className="text-3xl font-bold text-center mb-2">
              <span className="text-blue-600">Car</span>Fusion
            </h1>

            <p className="text-center text-gray-500 mb-6">
              Create an account to get started
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

            <div className="text-center text-sm text-gray-500 mt-5">
              Already have an account?
              <span
                onClick={() => navigate("/login")}
                className="ml-2 text-blue-600 hover:underline cursor-pointer"
              >
                LOGIN HERE
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
