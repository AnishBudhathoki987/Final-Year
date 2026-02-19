import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "./Routes/AuthRouter.js";
import { connectDB } from "./Config/db.js";
import vehicleRoutes from "./Routes/Vehicleroute.js";
import uploadRoutes from "./Routes/UploadRoute.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS (frontend vite)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/users", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

// ✅ image upload endpoint
app.use("/api/upload", uploadRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
