const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import cors
const snarkjs = require("snarkjs");
const crypto = require("crypto");
require("dotenv").config();
const connectDB = require("./database/conn");
const app = express();
const PORT = process.env.PORT || 5000; // Use Render’s assigned port

const User = require("./database/models/user");
const Game = require("./database/models/game");
const Ocean = require("./database/models/tournament");
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY; // Store API key securely
// Connect to MongoDB Atlas
connectDB();

// SSL Certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Enable CORS for all origins
app.use(cors("*"));

// Redirect HTTP to HTTPS (optional)
// app.use((req, res, next) => {
//   if (req.protocol === "http") {
//     res.redirect(`https://${req.headers.host}${req.url}`);
//   } else {
//     next();
//   }
// });

// Serve static files from the 'game' folder
app.use(express.static(path.join(__dirname, "game")));

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "First Game.html"));
});

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/api/leaderboard", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $sort: { createdAt: -1 } // Sort by createdAt (latest first), assuming you have timestamps
      },
      {
        $group: {
          _id: "$username", // Group by username
          userData: { $first: "$$ROOT" } // Take the latest entry for each username
        }
      },
      {
        $replaceRoot: { newRoot: "$userData" } // Flatten the result
      }
    ]);

    res.json(users); // Return unique users based on username
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to handle coin collection data
app.post("/api/coin-collection", (req, res) => {
  const coinData = req.body;
  console.log("Received coin collection data:", coinData);
  res.status(200).send({ message: "Data received successfully" });
});

app.get("/api/message", async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const { publicKey } = req.query; // ✅ Get from query params

  if (!publicKey) {
    return res.status(400).json({ error: "Public key is required!" });
  }

  try {
    let gameUser = await Game.findOne({ username: publicKey }); // ✅ Await DB call

    if (!gameUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.json({ score: gameUser.score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/message", async (req, res) => {
  const { score, publicKey } = req.body;
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }
    let gameUser = await Game.findOne({ username: publicKey });
    if (
      (score == 1 && gameUser.score == 0) ||
      (score >= 1 && gameUser.score != 0)
    ) {
      console.log(score, gameUser.score);
      gameUser.score += 1;
    }

    await gameUser.save();

    console.log("Received Score:", score);
    res
      .status(200)
      .json({ message: "Data received successfully", receivedScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-core-price", async (req, res) => {
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
});

app.post("/create-user", async (req, res) => {
  const { publicKey } = req.body; // User will send publicKey
  console.log(publicKey);
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
    let game = new Game({ username: publicKey });
    await user.save();
    await game.save();

    res.status(201).json({ message: "User created successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/game-end", async (req, res) => {
  try {
    const { won, publicKey } = req.body;

    let user = await User.findOne({ username: publicKey });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // user.score += numericScore;

    if (won) {
      user.games_won += 1;
      user.level.set(user.games_won.toString(), 1); // Use set() for Maps
    } else {
      user.games_lost += 1;
    }

    await user.save();
    res.status(200).json({ message: "Updated the LeaderBoard Data" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/transferred-nft", async (req, res) => {
  try {
    const { originalOwner_publicKey,newOwner_publicKey, which_level } = req.body;
    if (!originalOwner_publicKey || newOwner_publicKey ) {
      return res.status(400).json({ error: "publicKey is required" });
    }
    // Assuming you have a User model
    const owner = await User.findOne({ username: originalOwner_publicKey });
    const renter = await User.findOne({username: newOwner_publicKey})

    if (!owner || !renter){
      return res.status(404).json({ error: "User not found" });
    }

    owner.level.set(which_level.toString(),0)
    renter.level.set(which_level.toString(),1)
    owner.games_won -=1
    renter.games_won +=1
    await owner.save()
    await renter.save()

    res.status(200).json({ message: "Updated the Database" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/current-level", async (req, res) => {
  try {
    const { publicKey } = req.query; // Get publicKey from query

    if (!publicKey) {
      return res.status(400).json({ error: "publicKey is required" });
    }

    // Assuming you have a User model
    const user = await User.findOne({ username: publicKey });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const levelEntries = Array.from(user.level.entries()); // Convert Map to an array of key-value pairs

    // Find the first level with value 0
    const firstZeroLevel = levelEntries.find(([key, value]) => value === 0);

    if (firstZeroLevel) {
      return res.json({ level: Number(firstZeroLevel[0]) });
    }

    // If no level with 0 value is found, find the highest level and return +1
    const highestLevel = Math.max(
      ...levelEntries.map(([key]) => Number(key)),
      0
    ); // Ensure a fallback of 0
    res.json({ level: highestLevel + 1 });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post("/generate-tournament-metadata",async(req,res)=>{
  try {
    const {publicKey,latest_cleared_level} = req.body
    if (!publicKey || latest_cleared_level == null) {
      return res.status(400).json({ error: "Missing publicKey or score" });
    }

    const temp = latest_cleared_level
    var Type = "";

    if (temp < 10) {
      Type = "Ocean Warrior"
    }
    else if(temp >= 10 && temp < 15){
      Type = "Storm Bringer"
    }
    else if(temp >= 15 && temp < 20){
      Type = "Azure Legend"
    }

    const metadata = {
      name: `BattleKey NFT - Type ${Type}`,
      description: `NFT for ${publicKey} for completing level ${temp} and becoming elegible for ${Type} Battle`,
      
      attributes: [
        { trait_type: "Level", value: temp },
        { trait_type: "Type", value: `${Type}` },
        { trait_type: "Owner", value: publicKey },
      ],
    };
    console.log("Generated Metadata:", metadata); // Debugging

    res.status(200).json({ metadata });

  } catch (error) {
    console.error("Error generating metadata:", error);
    res.status(500).json({ error: error.message });
  }
})

app.post("/generate-metadata-nft", async (req, res) => {
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
    const wasmPath = "builds/game_js/game.wasm";
    const zkeyPath = "builds/game.zkey";
    const input = { finalScore };

    // Generate witness
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );
    const calldata = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );
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

app.get("/api/Ocean/leaderboard", async (req, res) => {
  try {
    const leaderboardData = await Ocean.find(); // Fetch all records
    res.status(200).json(leaderboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/Ocean/Stake", async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }

    // Check if user already exists
    const existingUser = await Ocean.findOne({ username: publicKey });

    if (existingUser) {
      return res.status(409).json({ error: "User already staked!" }); // 409 Conflict
    }

    // Create new user
    const OceanUser = new Ocean({ username: publicKey, staked: true });
    await OceanUser.save();

    res.status(201).json({ message: "User joined Tournament successfully!", user: OceanUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/api/Ocean/score",async(req,res)=>{
  const { score, publicKey } = req.body;
  try {
    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required!" });
    }
    let tournamentUser = await Ocean.findOne({ username: publicKey });
    if (
      tournamentUser.staked
    ) {
      console.log(score, tournamentUser.score);
      tournamentUser.score += 1;
      tournamentUser.played = true;
    }

    await tournamentUser.save();

    console.log("Received Score:", score);
    res
      .status(200)
      .json({ message: "Data received successfully", receivedScore: score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


app.delete("/api/Ocean/clear-tournament", async (req, res) => {
  try {
    // Assuming you're using Mongoose and the collection is called 'Ocean'
    await Ocean.deleteMany({});
    res.status(200).json({ message: "Tournament data cleared successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear tournament data", details: error.message });
  }
});























app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// https.createServer(app).listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running at http://0.0.0.0:${PORT}`);
// });


































