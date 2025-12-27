// ================= LOAD ENV (ROOT .env) =================
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env")
});

// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ================= MODELS =================
const User = require("./models/User");


// ================= ROUTES =================
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const examRoutes = require("./routes/examRoutes");

// ================= APP INIT =================
const app = express();
app.use(express.json());
app.use(express.static("frontend"));

// ================= LOG =================
console.log("SERVER FILE RUNNING ✔");
console.log("MONGO_URI =", process.env.MONGO_URI ? "LOADED ✔" : "NOT LOADED ❌");

// ================= DATABASE =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✔"))
  .catch(err => {
    console.error("MongoDB Connection Failed ❌");
    console.error(err.message);
    process.exit(1);
  });

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
console.log("AUTH ROUTES LOADED ✔");

app.use("/api/admin", adminRoutes);
app.use("/api/exam", examRoutes);

// ================= CREATE DEFAULT ADMIN =================

async function createAdmin() {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) return;

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Admin",
      email: "admin@exam.com",
      password: "$2b$10$bWSm2YCJANTQtgkAohezB.pwe5IrqaoAJXfVV0FBlaVa16fE96ljK",
      referenceCode: "admin",   // 🔥 REQUIRED FIX
      role: "admin",
      examCompleted: true
    });

    console.log("Admin created successfully ✔");
  } catch (err) {
    console.error("Admin creation failed ❌", err.message);
  }
}

createAdmin();

// ================= SERVER START =================
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
