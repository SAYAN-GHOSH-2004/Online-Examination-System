console.log("AUTH ROUTES LOADED ✔");

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");


// ✅ REGISTER
function generateRefCode() {
  return "EXAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let refCode;
    let exists = true;

    // ensure unique reference code
    while (exists) {
      refCode = generateRefCode();
      exists = await User.findOne({ referenceCode: refCode });
    }

    await User.create({
      name,
      email,
      password: hashedPassword,
      referenceCode: refCode
    });

    res.json({
      message: "Registration successful",
      referenceCode: refCode
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { referenceCode, password } = req.body;

    // 🔑 ADMIN LOGIN
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

    // 👨‍🎓 STUDENT LOGIN
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
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
