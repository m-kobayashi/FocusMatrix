const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

// ユーザー登録
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "このメールアドレスは既に登録されています" });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email, name } });
  } catch (error) {
    res.status(500).json({ message: "登録に失敗しました" });
  }
});

// ログイン
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "メールアドレスまたはパスワードが正しくありません" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "メールアドレスまたはパスワードが正しくありません" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "ログインに失敗しました" });
  }
});

// ユーザー情報の取得
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "ユーザー情報の取得に失敗しました" });
  }
});

module.exports = router;
