import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

import PrivateRoute from "./Components/PrivateRoute";
import RoleRoute from "./Components/RuleRoute"; // ✅ because your file is RuleRoute.jsx

import UserDashboard from "./Pages/UserDashboard";
import BrokerDashboard from "./Pages/BrokerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import Unauthorized from "./Pages/Unauthorized";

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.log("Auth error:", err);
        setError("Failed to fetch user data");

        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ✅ Any logged-in user */}
        <Route element={<PrivateRoute user={user} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>

        {/* ✅ Broker only */}
        <Route element={<RoleRoute user={user} roles={["broker"]} />}>
          <Route path="/broker/dashboard" element={<BrokerDashboard />} />
        </Route>

        {/* ✅ Admin only */}
        <Route element={<RoleRoute user={user} roles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
