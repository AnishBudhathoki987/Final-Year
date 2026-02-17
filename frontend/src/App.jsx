import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar";

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

  // ✅ Hide navbar on auth pages
  const hideNavbar = ["/login", "/register", "/unauthorized"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public vehicle browsing */}
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/compare" element={<Compare />} />

        {/* ================= AUTH (ANY LOGGED-IN USER) ================= */}
        <Route element={<PrivateRoute user={user} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>

        {/* ================= BROKER ONLY ================= */}
        <Route element={<RoleRoute user={user} roles={["broker"]} />}>
          <Route path="/broker/dashboard" element={<BrokerDashboard />} />
          <Route path="/broker/manage-vehicles" element={<ManageVehicles />} />
          <Route path="/broker/add-vehicle" element={<AddVehicle />} />
          <Route path="/broker/edit-vehicle/:id" element={<EditVehicle />} />
        </Route>

        {/* ================= ADMIN ONLY ================= */}
        <Route element={<RoleRoute user={user} roles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Keep user logged in after refresh
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
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <Router>
      <Layout user={user} setUser={setUser} />
    </Router>
  );
}
