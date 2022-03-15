const mongoose = require("mongoose");

const User = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    subjects: { type: Object, default: {} },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("User", User);
