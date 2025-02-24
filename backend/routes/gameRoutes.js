const express = require("express");
const router = express.Router();
const Game = require("../database/models/game"); // Assuming you have a Game model
const User = require("../database/models/user")
// Coin Collection Route
router.post("/coin-collection", (req, res) => {
  const coinData = req.body;
  console.log("Received coin collection data:", coinData);
  res.status(200).send({ message: "Data received successfully" });
});

// Get User Score Route
router.get("/message", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { publicKey } = req.query;
  if (!publicKey) {
    return res.status(400).json({ error: "Public key is required!" });
  }

  try {
    let gameUser = await Game.findOne({ username: publicKey });
    if (!gameUser) {
      return res.status(404).json({ error: "User not found!" });
    }
    res.json({ score: gameUser.score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset User Score Route
router.post("/reset-score", async (req, res) => {
  const { publicKey } = req.body;
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }
    const gameUser = await Game.findOne({ username: publicKey });
    if (!gameUser) {
      return res.status(404).json({ error: "User not found!" });
    }
    gameUser.score = 0;
    gameUser.latest_game = 0;
    await gameUser.save();
    res.status(200).json({ message: "Score has been reset" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Score Route
router.post("/message", async (req, res) => {
  const { score, publicKey } = req.body;
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }
    let gameUser = await Game.findOne({ username: publicKey });
    if (!gameUser) {
      return res.status(404).json({ error: `${publicKey} User not found!` });
    }
    console.log(score, gameUser.score);
    gameUser.score += 1;
    await gameUser.save();
    console.log("Received Score:", score);
    res
      .status(200)
      .json({ message: "Data received successfully", receivedScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $sort: { createdAt: -1 }, // Sort by createdAt (latest first), assuming you have timestamps
      },
      {
        $group: {
          _id: "$username", // Group by username
          userData: { $first: "$$ROOT" }, // Take the latest entry for each username
        },
      },
      {
        $replaceRoot: { newRoot: "$userData" }, // Flatten the result
      },
    ]);

    res.json(users); // Return unique users based on username
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
