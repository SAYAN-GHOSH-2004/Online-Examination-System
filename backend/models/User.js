const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  referenceCode: {
    type: String,
    unique: true   // ✅ very important
  },
  role: {
    type: String,
    default: "student"
  },
  examCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("User", UserSchema);
