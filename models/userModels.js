const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "User should have a first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "User should have a last name"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "User should have a password"],
  },
  email: {
    type: String,
    required: [true, "User should have an email"],
    unique: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
  },
  updateToken: {
    type: String,
    required: true,
    unique: true,
  },
  tokenTime: {
    type: Date,
    required: true,
  },
  following: {
    type: [String],
    required: true,
  },
  followers: {
    type: [String],
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
