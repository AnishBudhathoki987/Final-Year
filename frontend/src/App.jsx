// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";
import Vehicles from "./Pages/Vehicles";
import VehicleDetails from "./Pages/VehicleDetails"
import BrokerDashboard from "./Pages/BrokerDashboard";
import AddVehicle from "./Pages/AddVehicle";
import ManageVehicles from "./Pages/ManageVehicles";
import EditVehicle from "./Pages/EditVehicle";


function Layout({ user, setUser }) {
  const location = useLocation();

  // Hide navbar on login & register and brokerdashboard
  const hideNavbar =
  ["/login", "/register"].includes(location.pathname) ||
  location.pathname.startsWith("/broker") ||
  location.pathname.startsWith("/admin");
  

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Vehicle pages */}
        <Route path="/vehicles" element={<Vehicles user={user} />} />
        <Route path="/vehicles/:id" element={<VehicleDetails user={user} />} />

        {/*Broker dashboard*/}
        <Route path="/broker/dashboard" element={<BrokerDashboard user={user} setUser={setUser} />} />
        <Route path="/broker/add-vehicle" element={<AddVehicle user={user} />} />
        <Route path="/broker/my-vehicles" element={<ManageVehicles user={user} />} />
        <Route path="/broker/edit-vehicle/:id" element={<EditVehicle user={user} />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  if (loadingUser) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Router>
      <Layout user={user} setUser={setUser} />
    </Router>
  );
}
