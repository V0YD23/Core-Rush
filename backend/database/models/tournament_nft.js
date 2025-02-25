const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  warrior_clash: {type:Boolean,default:false},
  arcane_master: {type:Boolean,default:false},
  super_showdown: {type:Boolean,default:false},
});

const Tournament = mongoose.model("Tournament", userSchema);

module.exports = Tournament;




