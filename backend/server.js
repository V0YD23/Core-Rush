const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import cors
const snarkjs = require("snarkjs");
const crypto = require('crypto')
require("dotenv").config();
const connectDB = require('./database/conn')
const app = express();
const PORT = 8443;
const User = require('./database/models/user')
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // Store API key securely
// Connect to MongoDB Atlas
connectDB();

// SSL Certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Enable CORS for all origins
app.use(cors('*'));

// Redirect HTTP to HTTPS (optional)
app.use((req, res, next) => {
  if (req.protocol === "http") {
    res.redirect(`https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});

// Serve static files from the 'game' folder
app.use(express.static(path.join(__dirname, "game")));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "First Game.html"));
});

app.use(express.json()); // Middleware to parse JSON bodies

// Endpoint to handle coin collection data
app.post("/api/coin-collection", (req, res) => {
  const coinData = req.body;
  console.log("Received coin collection data:", coinData);
  res.status(200).send({ message: "Data received successfully" });
});

app.get("/api/message", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.json({ message: "Hello, this is a message from your API!" });
});

app.post("/api/message", (req, res) => {
  const { score } = req.body;
  console.log("Received Score:", score);
  res.status(200).json({ message: "Data received successfully", receivedScore: score });
});

app.get("/get-core-price", async (req, res) => {
  try {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=CORE`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-CMC_PRO_API_KEY":COINMARKETCAP_API_KEY,
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
});

app.post("/create-user", async (req, res) => {
  const { publicKey } = req.body; // User will send publicKey
  console.log(publicKey)
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }

    // Check if user already exists
    let user = await User.findOne({ username: publicKey });
    if (user) {
      return res.status(200).json({ message: "User already exists!" });
    }
    

    // Create new user
    user = new User({ username: publicKey });
    await user.save();

    res.status(201).json({ message: "User created successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/game-end", async (req, res) => {
  try {
    const { score, won, publicKey } = req.body;

    let user = await User.findOne({ username: publicKey });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    // user.score += numericScore;
    
    if (won) {
      user.games_won += 1;
    } else {
      user.games_lost += 1;
    }


    await user.save();
    res.status(200).json({ message: "Updated the LeaderBoard Data" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-metadata-nft", async (req, res) => {
  try {
    const { publicKey, score } = req.body;
    if (!publicKey || score == null) {
      return res.status(400).json({ error: "Missing publicKey or score" });
    }

    let user = await User.findOne({ username: publicKey });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let level = user.games_lost + user.games_won + 1;

    const metadata = {
      name: `Game NFT - Level ${level}`,
      description: `NFT for ${publicKey} for completing level ${level}`,
      attributes: [
        { trait_type: "Level", value: level },
        { trait_type: "Score", value: `${score} coins collected` },
      ],
    };

    console.log("Generated Metadata:", metadata); // Debugging

    res.status(200).json({ metadata });
  } catch (error) {
    console.error("Error generating metadata:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/generate-proof", async (req, res) => {
  try {
      const { finalScore } = req.body;

      // Ensure score is in the correct format
      if (typeof finalScore !== "number") {
          return res.status(400).json({ error: "Invalid finalScore" });
      }

      // Load the WebAssembly and witness calculator
      const wasmPath = "build/game_js/game.wasm";
      const zkeyPath = "build/game.zkey";
      const input = { finalScore };

      // Generate witness
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
      const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
      console.log("Calldata:", calldata);
      
      // ✅ Convert the string into an actual JavaScript array
      const parsedCalldata = JSON.parse(`[${calldata}]`); // Ensures proper formatting
      
      // ✅ Now send the structured array to the frontend
      res.json({ calldata: parsedCalldata });
      
      
      
  } catch (error) {
      console.error("Error generating proof:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
