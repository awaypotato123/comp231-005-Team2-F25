import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import skillRoutes from "./routes/skill.route.js";
import cors from "cors";

dotenv.config();

// Debug: Check if JWT_SECRET is loaded
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES ✓" : "NO ✗");

connectDB();

const app = express();
app.use(express.json()); 
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes)

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});