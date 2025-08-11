const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  googleId: { type: String },
  photo: String,
});

module.exports = mongoose.model("User", userSchema);
