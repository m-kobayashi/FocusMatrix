// validations/authValidation.js
const { body } = require("express-validator");

exports.registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("有効なメールアドレスを入力してください"),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage(
      "パスワードは8文字以上で、数字・大文字・小文字を含める必要があります",
    ),
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("名前は2文字以上50文字以下で入力してください"),
];

exports.loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];
