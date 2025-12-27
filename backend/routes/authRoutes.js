console.log("AUTH ROUTES LOADED ✔");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ================= UTIL =================
function generateRefCode() {
  return "EXAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ BASIC VALIDATION
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ CHECK EMAIL
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ UNIQUE REF CODE
    let referenceCode;
    let exists = true;
    while (exists) {
      referenceCode = generateRefCode();
      exists = await User.findOne({ referenceCode });
    }

    // ✅ SAVE USER (IMPORTANT FIX)
    const user = await User.create({
      name: name.trim(),          // 🔥 FIXED
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      referenceCode,
      role: "student",
      examCompleted: false
    });

    res.json({
      message: "Registration successful",
      referenceCode: user.referenceCode
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { referenceCode, password } = req.body;

    if (!referenceCode || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ================= ADMIN LOGIN =================
    if (referenceCode === "admin") {
      const admin = await User.findOne({ role: "admin" });

      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Wrong admin password" });
      }

      return res.json({
        message: "Admin login successful",
        role: "admin"
      });
    }

    // ================= STUDENT LOGIN =================
    const user = await User.findOne({ referenceCode });

    if (!user) {
      return res.status(401).json({ message: "Invalid reference code" });
    }

    if (user.examCompleted) {
      return res.status(403).json({
        message: "Exam already completed. Login blocked."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login successful",
      role: "student",
      email: user.email,
      name: user.name
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
