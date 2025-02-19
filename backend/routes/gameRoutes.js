const express = require("express");
const router = express.Router();
const Game = require("../database/models/game");

// Fetch User Score
router.get("/score", async (req, res) => {
  const { publicKey } = req.query;
  if (!publicKey) return res.status(400).json({ error: "Public key required" });

  try {
    let gameUser = await Game.findOne({ username: publicKey });
    if (!gameUser) return res.status(404).json({ error: "User not found" });

    res.json({ score: gameUser.score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Score
router.post("/update-score", async (req, res) => {
  const { score, publicKey } = req.body;
  try {
    if (!publicKey) return res.status(400).json({ error: "Public key required" });

    let gameUser = await Game.findOne({ username: publicKey });
    if (!gameUser) return res.status(404).json({ error: "User not found" });

    gameUser.score += 1;
    await gameUser.save();

    res.status(200).json({ message: "Score updated", score: gameUser.score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/generate-proof", async (req, res) => {
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

    // Convert the string into a JavaScript array
    const parsedCalldata = JSON.parse(`[${calldata}]`);

    // Send the structured array to the frontend
    res.json({ calldata: parsedCalldata });
  } catch (error) {
    console.error("Error generating proof:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
