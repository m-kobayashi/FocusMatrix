// routes/profile.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// プロフィール取得
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});

// プロフィール更新
router.put(
  "/me",
  auth,
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("profile.bio").optional().trim(),
    body("profile.phoneNumber").optional().trim(),
    body("profile.location").optional().trim(),
    body("preferences").optional().isObject(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updateData = {
        name: req.body.name,
        "profile.bio": req.body.profile?.bio,
        "profile.phoneNumber": req.body.profile?.phoneNumber,
        "profile.location": req.body.profile?.location,
        preferences: req.body.preferences,
      };

      // undefinedのフィールドを削除
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateData },
        { new: true, runValidators: true },
      ).select("-password");

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "プロフィールの更新に失敗しました" });
    }
  },
);

// パスワード変更
router.put(
  "/password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("現在のパスワードは必須です"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("新しいパスワードは6文字以上必要です"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.userId);
      const isValid = await user.validatePassword(req.body.currentPassword);

      if (!isValid) {
        return res
          .status(400)
          .json({ message: "現在のパスワードが正しくありません" });
      }

      user.password = req.body.newPassword;
      await user.save();

      res.json({ message: "パスワードを更新しました" });
    } catch (error) {
      res.status(500).json({ message: "パスワードの更新に失敗しました" });
    }
  },
);

module.exports = router;
