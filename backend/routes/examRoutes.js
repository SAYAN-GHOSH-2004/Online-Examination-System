const User = require("../models/User");
const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Result = require("../models/Result");

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

  // ✅ mark exam completed
  await User.findOneAndUpdate(
    { email },
    { examCompleted: true }
  );

  res.json({ score, total: questions.length });
});
module.exports = router;
