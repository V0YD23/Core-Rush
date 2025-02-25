const axios = require("axios");
const User = require("../database/models/user"); // Import User model if needed
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // Store API key securely
const Tournament = require("../database/models/tournament_nft")
// Function to fetch CORE price
const getCorePrice = async (req, res) => {
  try {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=CORE`;
    
    const { data } = await axios.get(url, {
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
    });

    if (data?.data?.CORE?.quote?.USD?.price) {
      res.json({ price: data.data.CORE.quote.USD.price });
    } else {
      res.status(400).json({ error: "Invalid API response" });
    }
  } catch (error) {
    console.error("Error fetching CORE price:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch price" });
  }
};

// Function to generate tournament metadata
const generateTournamentMetadata = async (req, res) => {
  try {
    const { publicKey, latest_cleared_level } = req.body;

    if (!publicKey || latest_cleared_level == null) {
      return res.status(400).json({ error: "Missing publicKey or latest_cleared_level" });
    }

    if (latest_cleared_level < 1) {
      return res.status(400).json({ message: "Latest level is not enough to obtain any tournament NFT" });
    }

    const tournament_nft = await Tournament.findOne({ username: publicKey });
    const metadataList = [];
    const unlockedTournaments = [];

    if (latest_cleared_level >= 1 && !tournament_nft.warrior_clash) {
      metadataList.push({
        name: "BattleKey NFT - Type Warrior Clash",
        description: `NFT for ${publicKey} for completing level ${latest_cleared_level} and becoming eligible for Ocean Warrior Battle`,
        attributes: [
          { trait_type: "Level", value: latest_cleared_level },
          { trait_type: "Type", value: "Warrior Clash" },
          { trait_type: "Owner", value: publicKey },
        ],
      });
      unlockedTournaments.push("Warrior Clash");
      tournament_nft.warrior_clash = true;
    }

    if (latest_cleared_level >= 2 && !tournament_nft.arcane_master) {
      metadataList.push({
        name: "BattleKey NFT - Type Arcane Master",
        description: `NFT for ${publicKey} for completing level ${latest_cleared_level} and becoming eligible for Storm Bringer Battle`,
        attributes: [
          { trait_type: "Level", value: latest_cleared_level },
          { trait_type: "Type", value: "Arcane Master" },
          { trait_type: "Owner", value: publicKey },
        ],
      });
      unlockedTournaments.push("Arcane Master");
      tournament_nft.arcane_master = true;
    }

    if (latest_cleared_level >= 3 && !tournament_nft.super_showdown) {
      metadataList.push({
        name: "BattleKey NFT - Type Super Showdown",
        description: `NFT for ${publicKey} for completing level ${latest_cleared_level} and becoming eligible for Azure Legend Battle`,
        attributes: [
          { trait_type: "Level", value: latest_cleared_level },
          { trait_type: "Type", value: "Super Showdown" },
          { trait_type: "Owner", value: publicKey },
        ],
      });
      unlockedTournaments.push("Super Showdown");
      tournament_nft.super_showdown = true;
    }

    await tournament_nft.save();

    console.log("Generated Metadata:", metadataList);
    res.status(200).json({ 
      metadata: metadataList, 
      unlockedTournaments 
    });

  } catch (error) {
    console.error("Error generating metadata:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Function to generate game NFT metadata
const generateMetadataNFT = async (req, res) => {
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

    console.log("Generated Metadata:", metadata);
    res.status(200).json({ metadata });
  } catch (error) {
    console.error("Error generating metadata:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Export the functions
module.exports = {
  getCorePrice,
  generateTournamentMetadata,
  generateMetadataNFT,
};
