const mongoose = require("mongoose");

const State = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    state: { type: String, default: "start" },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("State", State);
