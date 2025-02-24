const express = require("express");
const path = require("path");
require("dotenv").config();
const connectDB = require("./database/conn");
const app = express();
const PORT = process.env.PORT || 5000; // Use Render’s assigned port
const oceanRoutes = require("./routes/oceanRoutes"); // Import ocean routes
const userRoutes = require("./routes/userRoutes"); // Import user routes
const gameRoutes = require("./routes/gameRoutes")
const {
  getCorePrice,
  generateTournamentMetadata,
  generateMetadataNFT,
} = require("./routes/utils"); // Import functions


// Connect to MongoDB Atlas
connectDB();

const corsConfig = require("./config/corsConfig");
app.use(corsConfig);


// Serve static files from the 'game' folder
app.use(express.static(path.join(__dirname, "game")));

// Serve the main HTML file

app.use(express.json()); // Middleware to parse JSON bodies



// Endpoint to handle coin collection data

// app.post("/api/died",async(req,res)=>{
//   const {died,publicKey} = req.body
//   try {
//     if (!publicKey) {
//       return res.status(400).json({ error: "Public key is required!" });
//     }

//     if(died){
//       const gameUser = await Game.findOne({username:publicKey})
//       if (gameUser.score >= gameUser.expected_score) {
//         gameUser.latest_game = 1
//       }
//       else{
//         gameUser.latest_game = 0
//       }
//       res.status(200).json({message:"backend got the data successfully","score":score,"died":died,"key":publicKey})
//     }


//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// })




// Define routes using imported functions
app.get("/get-core-price", getCorePrice);
app.post("/generate-tournament-metadata", generateTournamentMetadata);
app.post("/generate-metadata-nft", generateMetadataNFT);
app.use("/api/User", userRoutes);
app.use("/api/Ocean", oceanRoutes);
app.use("/api", gameRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

