const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Question = require("../models/Question");
const Result = require("../models/Result");


// ================= USERS =================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(
      { role: "student" }, // optional filter
      "name email referenceCode examCompleted"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users" });
  }
});



// ================= ADD QUESTION =================
router.post("/add-question", async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;

    if (!question || !options || options.length !== 4 || !correctAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await Question.create({
      question,
      options,
      correctAnswer
    });

    res.json({ message: "Question added successfully ✔" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding question" });
  }
});


// ================= GET QUESTIONS =================
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Failed to load questions" });
  }
});


// ================= DELETE QUESTION =================
router.delete("/question/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted ✔" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});


// ================= RESULTS =================
router.get("/results", async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to load results" });
  }
});


// ================= RESET EXAM =================
router.post("/reset/:email", async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { email: req.params.email },
      { examCompleted: false }
    );

    await Result.deleteMany({ email: req.params.email });

    res.json({ message: "Exam reset successful ✔" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
});

module.exports = router;
