const fetch = require("node-fetch");
const User = require("../database/models/user"); // Import User model if needed
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // Store API key securely

// Function to fetch CORE price
const getCorePrice = async (req, res) => {
  try {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=CORE`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
    });

    const data = await response.json();
    if (data && data.data && data.data.CORE) {
      res.json({ price: data.data.CORE.quote.USD.price });
    } else {
      res.status(400).json({ error: "Invalid API response" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
};

// Function to generate tournament metadata
const generateTournamentMetadata = async (req, res) => {
  try {
    const { publicKey, latest_cleared_level } = req.body;
    if (!publicKey || latest_cleared_level == null) {
      return res.status(400).json({ error: "Missing publicKey or score" });
    }

    const temp = latest_cleared_level;
    let Type = "";

    if (temp < 10) {
      Type = "Ocean Warrior";
    } else if (temp >= 10 && temp < 15) {
      Type = "Storm Bringer";
    } else if (temp >= 15 && temp < 20) {
      Type = "Azure Legend";
    }

    const metadata = {
      name: `BattleKey NFT - Type ${Type}`,
      description: `NFT for ${publicKey} for completing level ${temp} and becoming eligible for ${Type} Battle`,
      attributes: [
        { trait_type: "Level", value: temp },
        { trait_type: "Type", value: Type },
        { trait_type: "Owner", value: publicKey },
      ],
    };

    console.log("Generated Metadata:", metadata);
    res.status(200).json({ metadata });
  } catch (error) {
    console.error("Error generating metadata:", error);
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
    console.error("Error generating metadata:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export the functions
module.exports = {
  getCorePrice,
  generateTournamentMetadata,
  generateMetadataNFT,
};
