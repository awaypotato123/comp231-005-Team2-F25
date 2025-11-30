import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// Routes
import authRoutes from "./routes/auth.route.js";
import skillRoutes from "./routes/skill.route.js";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import classRoutes from "./routes/class.route.js";
import classPostsRoutes from "./routes/classpost.route.js";
import feedbackRoutes from "./routes/feedback.route.js";

// Load environment variables FIRST
dotenv.config();

// Verify environment variables
console.log("=== Environment Variables Check ===");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ MISSING");
console.log("MONGO_URL:", process.env.MONGO_URL ? "✓ Loaded" : "✗ MISSING");
console.log("PORT:", process.env.PORT || "3000 (default)");
console.log("===================================");

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());   // JSON parsing
app.use(cors());           // Enable CORS

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/classposts", classPostsRoutes);
app.use("/api/feedbacks", feedbackRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
