const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  score: { type: Number, default: 0 },
  played: {type: Boolean,default:false},
  staked: {type: Boolean,default:false},
});

const Ocean = mongoose.model("Ocean Warrior", userSchema);

module.exports = Ocean;




