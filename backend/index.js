import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './Routes/AuthRouter.js'
import {connectDB} from "./Config/db.js";
dotenv.config();


const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.use("/api/users", authRoutes)

connectDB();


app.listen(PORT, ()=>{ 
    console.log(`server is running on ${PORT}`);
})