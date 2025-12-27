const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true
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

module.exports = mongoose.model("User", userSchema);
