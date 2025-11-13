import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

export async function register(req, res) {
  try {
    const { firstName, lastName, email, password, role, skills } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: String(email).toLowerCase().trim(),
      password, 
      role: role || "learner",
      skills: skills || [],
    });

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      message: "Registration successful",
      user: safeUser,
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  console.log("Login Request Body:", req.body);  
  console.log("Email:", email);  
  console.log("Password:", password); 

  if (!email || !password) {
    console.log("Email or password is missing");
    return res.status(400).json({ message: "Please provide both email and password." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log("No user found with this email:", email);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = user.authenticate(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials." });
    }



    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    console.log("Login successful for user:", email);

    return res.status(200).json({
      message: "Login successful",
      token, 
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
