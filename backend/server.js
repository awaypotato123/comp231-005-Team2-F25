import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "./routes/auth.route.js"
import skillRoutes from "./routes/skill.route.js"
import userRoutes from "./routes/user.route.js"
import adminRoutes from "./routes/admin.route.js"
import classRoutes from "./routes/class.route.js"
import classPostsRoutes from "./routes/classpost.route.js"
import feedbackRoutes from "./routes/feedback.route.js"
import bookingRoutes from "./routes/booking.route.js"

dotenv.config()

console.log("=== Environment Variables Check ===")
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ MISSING")
console.log("MONGO_URL:", process.env.MONGO_URL ? "✓ Loaded" : "✗ MISSING")
console.log("PORT:", process.env.PORT || "Render provided")
console.log("===================================")

connectDB()

const app = express()
const PORT = process.env.PORT || 10000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

/* API routes */
app.use("/api/auth", authRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/classposts", classPostsRoutes)
app.use("/api/feedbacks", feedbackRoutes)
app.use("/api/bookings", bookingRoutes)

/* Serve frontend build */
app.use(
  express.static(
    path.join(__dirname, "../frontend/dist")
  )
)

/* React router fallback */
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/dist/index.html")
  )
})

app.listen(PORT, () => {
  console.log("API is running...")
})
