const User = require("../models/User");
const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Result = require("../models/Result");
 const bcrypt = require("bcryptjs");

// Get questions
router.get("/questions", async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

// Submit exam
router.post("/submit", async (req, res) => {
  const { email, answers } = req.body;

  const questions = await Question.find();
  let score = 0;

  questions.forEach((q, i) => {
    if (Number(answers[i]) === q.correctAnswer) {
  score++;
}
  });

  await Result.create({
    email,
    score,
    total: questions.length
  });

router.post("/result", async (req, res) => {
  try {
    const { referenceCode, password } = req.body;

    if (!referenceCode || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ referenceCode });

    if (!user) {
      return res.status(404).json({ message: "Invalid reference code" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    if (!user.examCompleted) {
      return res.status(403).json({ message: "Exam not completed yet" });
    }

    const result = await Result.findOne({ email: user.email });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      score: result.score,
      total: result.total
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


  // ✅ mark exam completed
  await User.findOneAndUpdate(
    { email },
    { examCompleted: true }
  );

  res.json({ score, total: questions.length });
});
module.exports = router;
