const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import cors
const snarkjs = require("snarkjs");
const crypto = require('crypto')

const app = express();
const PORT = 8443;

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


app.post("/generate-proof", async (req, res) => {
  try {
      const { finalScore } = req.body;

      // Ensure score is in the correct format
      if (typeof finalScore !== "number") {
          return res.status(400).json({ error: "Invalid finalScore" });
      }

      // Load the WebAssembly and witness calculator
      const wasmPath = "./game_js/game.wasm";
      const zkeyPath = "./game.zkey";
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
