const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number   // 👈 STORE INDEX (0,1,2,3)
});

module.exports = mongoose.model("Question", questionSchema);
