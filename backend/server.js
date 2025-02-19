const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const connectDB = require("./database/conn");
const cors = require("./middlewares/corsConfig");
const httpsRedirect = require("./middlewares/httpsRedirect");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const nftRoutes = require("./routes/nftRoutes");

const app = express();
const PORT = 8443;

// Connect to MongoDB
connectDB();

// SSL Certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Middlewares
app.use(cors);
app.use(httpsRedirect);
app.use(express.json());
app.use(express.static(path.join(__dirname, "game")));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/game", gameRoutes); // ✅ Now includes /api/game/generate-proof
app.use("/api/nft", nftRoutes);

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "game", "First Game.html"));
});

// Start HTTPS Server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Secure server running on https://localhost:${PORT}`);
});
