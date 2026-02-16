import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./Routes/AuthRouter.js";
import { connectDB } from "./Config/db.js";

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

app.use("/api/users", authRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
