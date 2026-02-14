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
        username: formData.username, // ✅ FIXED
        email: formData.email,
        password: formData.password,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex justify-center pt-16">
      <div className="w-[90%] max-w-6xl h-[78vh] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-[#121212]">

        {/* LEFT IMAGE */}
        <div className="hidden md:block">
          <img
            src="/car.png"
            alt="Car"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="flex justify-start pt-12">
          <div className="w-full max-w-md px-10 text-white">

            <h1 className="text-3xl font-bold text-center mb-4">
              <span className="text-blue-500">Car</span>Fusion
            </h1>

            <h2 className="text-lg text-center text-orange-400">Hello!</h2>
            <p className="text-center text-gray-400 mb-5">
              Create an account to get started
            </p>

            {error && (
              <p className="bg-red-500/20 text-red-400 text-sm p-2 rounded mb-3 text-center">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* USERNAME */}
              <div className="relative">
                <FaUser className="absolute top-3.5 left-4 text-gray-400" />
                <input
                  type="text"
                  name="username"            // ✅ FIXED
                  placeholder="Full Name"
                  value={formData.username} // ✅ FIXED
                  onChange={handleChange}
                  required
                  className="w-full pl-12 py-2.5 bg-[#1b1b1b] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute top-3.5 left-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 py-2.5 bg-[#1b1b1b] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
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
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-2.5 bg-[#1b1b1b] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* TERMS */}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="accent-blue-500"
                />
                <span>
                  I agree to the{" "}
                  <span className="text-blue-400 cursor-pointer">
                    Terms & Privacy Policy
                  </span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
              >
                CREATE ACCOUNT
              </button>
            </form>

            <div className="text-center text-sm text-gray-400 mt-4">
              Already have an account?
              <span
                onClick={() => navigate("/login")}
                className="ml-2 text-blue-400 hover:underline cursor-pointer"
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
