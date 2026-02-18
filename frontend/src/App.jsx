// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar"; // Public navbar
import BrokerNavbar from "./Components/BrokerNavbar"; // Broker navbar

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";

import PrivateRoute from "./Components/Privateroute";
import RoleRoute from "./Components/RuleRoute";

import UserDashboard from "./Pages/UserDashboard";
import BrokerDashboard from "./Pages/BrokerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";

import Vehicles from "./Pages/Vehicles";
import VehicleDetails from "./Pages/Vehicledetails";
import Compare from "./Pages/Compare";

import ManageVehicles from "./Pages/ManageVehicles";
import AddVehicle from "./Pages/AddVehicle";
import EditVehicle from "./Pages/EditVehicle";

function Layout({ user, setUser }) {
  const location = useLocation();
  const path = location.pathname;

  const isAuthPage = ["/login", "/register", "/unauthorized"].includes(path);

  const isBrokerArea = path.startsWith("/broker");
  const isUserArea = path.startsWith("/user");
  const isAdminArea = path.startsWith("/admin");

  // ✅ Navbar rules:
  // - Broker routes -> BrokerNavbar only
  // - Public routes -> Public Navbar only
  // - Auth pages -> none
  // - User/Admin dashboards -> none (you can add their own later)
  const showBrokerNavbar = !isAuthPage && isBrokerArea;
  const showPublicNavbar = !isAuthPage && !isBrokerArea && !isUserArea && !isAdminArea;

  return (
    <>
      {showPublicNavbar && <Navbar user={user} setUser={setUser} />}
      {showBrokerNavbar && <BrokerNavbar user={user} setUser={setUser} />}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles user={user} />} />
        <Route path="/vehicles/:id" element={<VehicleDetails user={user} />} />
        <Route path="/compare" element={<Compare user={user} />} />

        {/* ================= AUTH PAGES ================= */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ================= USER (ANY LOGGED IN) ================= */}
        <Route element={<PrivateRoute user={user} />}>
          <Route path="/user/dashboard" element={<UserDashboard user={user} setUser={setUser} />} />
        </Route>

        {/* ================= BROKER ONLY ================= */}
        <Route element={<RoleRoute user={user} roles={["broker"]} />}>
          <Route path="/broker/dashboard" element={<BrokerDashboard user={user} setUser={setUser} />} />
          <Route path="/broker/manage-vehicles" element={<ManageVehicles user={user} setUser={setUser} />} />
          <Route path="/broker/add-vehicle" element={<AddVehicle />} />
          <Route path="/broker/edit-vehicle/:id" element={<EditVehicle user={user} setUser={setUser} />} />
        </Route>

        {/* ================= ADMIN ONLY ================= */}
        <Route element={<RoleRoute user={user} roles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard user={user} setUser={setUser} />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Keep user logged in after refresh
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Prevent navbar flicker before /me finishes
  if (loadingUser) return null;

  return (
    <Router>
      <Layout user={user} setUser={setUser} />
    </Router>
  );
}
