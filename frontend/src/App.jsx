// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "./Components/Navbar";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Unauthorized from "./Pages/Unauthorized";
import Vehicles from "./Pages/Vehicles";
import VehicleDetails from "./Pages/Vehicledetails";
import BrokerDashboard from "./Pages/BrokerDashboard";
import AddVehicle from "./Pages/AddVehicle";
import ManageVehicles from "./Pages/ManageVehicles";
import EditVehicle from "./Pages/EditVehicle";
import Compare from "./Pages/Compare";
import Booking from "./Pages/Booking";
import UserDashboard from "./Pages/UserDashboard";
import MyBookings from "./Pages/MyBookings";
import Purchase from "./Pages/Purchase";
import MyPurchases from "./Pages/MyPurchase";
import BrokerOrder from "./Pages/BrokerOrder";
import Chat from "./Pages/Chat";
import BrokerMessages from "./Pages/BrokerMessage";
import BrokerChat from "./Pages/BrokerChat";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentFailure from "./Pages/PaymentFailure";
import MyPayments from "./Pages/MyPayments";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminUsers from "./Pages/AdminUsers";
import AdminBrokers from "./Pages/AdminBrokers";

function Layout({ user, setUser }) {
  const location = useLocation();

  const hideNavbar =
    ["/login", "/register"].includes(location.pathname) ||
    location.pathname.startsWith("/broker") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/book/") ||
    location.pathname.startsWith("/purchase/") ||
    location.pathname.startsWith("/my-purchases") ||
    location.pathname.startsWith("/user/dashboard") ||
    location.pathname.startsWith("/chat/") ||
    location.pathname.startsWith("/payment-");

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/vehicles" element={<Vehicles user={user} />} />
        <Route path="/vehicles/:id" element={<VehicleDetails user={user} />} />
        <Route path="/compare" element={<Compare user={user} />} />
        <Route path="/broker/orders" element={<BrokerOrder user={user} />} />

        <Route
          path="/book/:id"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "user" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <Booking user={user} />
            )
          }
        />

        <Route
          path="/my-bookings"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "user" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <MyBookings user={user} />
            )
          }
        />

        <Route
          path="/purchase/:id"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "user" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <Purchase user={user} />
            )
          }
        />

        <Route
          path="/my-purchases"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "user" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <MyPurchases user={user} />
            )
          }
        />

        <Route
          path="/user/dashboard"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "user" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <UserDashboard user={user} setUser={setUser} />
            )
          }
        />

        <Route
          path="/chat/:brokerId"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <Chat user={user} />
            )
          }
        />

        <Route
          path="/payment-success"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <PaymentSuccess />
            )
          }
        />

        <Route
          path="/payment-failure"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <PaymentFailure />
            )
          }
        />

        <Route
          path="/my-payments"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <MyPayments />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "admin" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <AdminDashboard user={user} />
            )
          }
        />

        <Route
          path="/admin/users"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "admin" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <AdminUsers user={user} />
            )
          }
        />

        <Route
          path="/admin/brokers"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== "admin" ? (
              <Navigate to="/unauthorized" replace />
            ) : (
              <AdminBrokers user={user} />
            )
          }
        />

        <Route path="/broker/dashboard" element={<BrokerDashboard user={user} setUser={setUser} />} />
        <Route path="/broker/add-vehicle" element={<AddVehicle user={user} />} />
        <Route path="/broker/my-vehicles" element={<ManageVehicles user={user} />} />
        <Route path="/broker/edit-vehicle/:id" element={<EditVehicle user={user} />} />
        <Route path="/broker/messages" element={<BrokerMessages user={user} />} />
        <Route path="/broker/chat/:chatId" element={<BrokerChat user={user} />} />
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