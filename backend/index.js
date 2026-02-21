import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "./Routes/AuthRouter.js";
import { connectDB } from "./Config/db.js";
import vehicleRoutes from "./Routes/Vehicleroute.js";
import uploadRoutes from "./Routes/Uploadroute.js";
import bookingRoutes from "./Routes/Bookingroutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ROUTES
app.use("/api/users", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/bookings", bookingRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});