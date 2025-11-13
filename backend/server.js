import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import skillRoutes from "./routes/skill.route.js";
import searchRoutes from "./routes/search.route.js";
import cors from "cors";


dotenv.config();
connectDB();

const app = express();
app.use(express.json()); 

app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/search/", searchRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});