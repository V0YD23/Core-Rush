const express = require("express");
const router = express.Router();
const Ocean = require("../database/models/tournament"); // Adjust path as needed

// Get leaderboard data
router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboardData = await Ocean.find(); // Fetch all records
    res.status(200).json(leaderboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stake in the tournament
router.post("/Stake", async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }

    // Check if user already exists
    const existingUser = await Ocean.findOne({ username: publicKey });

    if (existingUser) {
      return res.status(409).json({ error: "User already staked!" });
    }

    // Create new user
    const OceanUser = new Ocean({ username: publicKey, staked: true });
    await OceanUser.save();

    res
      .status(201)
      .json({
        message: "User joined Tournament successfully!",
        user: OceanUser,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user score
router.post("/score", async (req, res) => {
  try {
    const { score, publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }

    let tournamentUser = await Ocean.findOne({ username: publicKey });
    if (tournamentUser && tournamentUser.staked) {
      console.log(score, tournamentUser.score);
      tournamentUser.score += 1;
      tournamentUser.played = true;
      await tournamentUser.save();
    }

    console.log("Received Score:", score);
    res
      .status(200)
      .json({ message: "Data received successfully", receivedScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear tournament data
router.delete("/clear-tournament", async (req, res) => {
  try {
    await Ocean.deleteMany({});
    res.status(200).json({ message: "Tournament data cleared successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to clear tournament data",
        details: error.message,
      });
  }
});

module.exports = router;
