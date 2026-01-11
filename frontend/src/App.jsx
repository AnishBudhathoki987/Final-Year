import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      // 🚫 Do NOT call backend if no token
      if (!token) return;

      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);

      } catch (err) {
        console.log("Auth error:", err);
        setError("Failed to fetch user data");

        // remove bad token
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
        <Route path="/" element={<Home user={user} error={error} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
