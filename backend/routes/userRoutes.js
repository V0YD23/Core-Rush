const express = require("express");
const router = express.Router();
const User = require("../database/models/user");

// Create a new user
router.post("/create", async (req, res) => {
  const { publicKey } = req.body;
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }

    let user = await User.findOne({ username: publicKey });
    if (user) {
      return res.status(200).json({ message: "User already exists!" });
    }

    user = new User({ username: publicKey });
    await user.save();

    res.status(201).json({ message: "User created successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
