import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import cors from "cors";


dotenv.config();
connectDB();

const app = express();
app.use(express.json()); 

app.use(cors());

app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//mongodb+srv://riyadhahmed324_db_user:Fa9fQTIZ52RydwgJ@cluster0.r1pjqjx.mongodb.net/?appName=Cluster0