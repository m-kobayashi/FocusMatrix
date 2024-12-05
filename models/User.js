// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profile: {
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    phoneNumber: { type: String },
    location: { type: String },
  },
  preferences: {
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: "ja" },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
  },
});

// パスワードのハッシュ化
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// パスワード検証メソッド
userSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
