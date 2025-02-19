const express = require("express");
const router = express.Router();
const User = require("../database/models/user");

// Generate NFT Metadata
router.post("/generate-metadata", async (req, res) => {
  try {
    const { publicKey, score, level } = req.body;
    if (!publicKey || score == null) {
      return res.status(400).json({ error: "Missing publicKey or score" });
    }

    let user = await User.findOne({ username: publicKey });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const metadata = {
      name: `Game NFT - Level ${level}`,
      description: `NFT for ${publicKey} for completing level ${level}`,
      attributes: [
        { trait_type: "Level", value: level },
        { trait_type: "Score", value: `${score} coins collected` },
        { trait_type: "Owner", value: publicKey },
      ],
    };

    res.status(200).json({ metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
