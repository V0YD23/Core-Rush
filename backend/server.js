const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import cors

const app = express();
const PORT = 8443;

// SSL Certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Enable CORS for all origins
app.use(cors());

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


app.post("/api/gameScore",(req,res)=> {
  const {finalScore} = req.body
  
})

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
