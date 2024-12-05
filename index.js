// index.js
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
require("dotenv").config();
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(compression());

// 静的ファイルの提供
app.use(express.static('public'));

// レート制限の適用
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ルートの設定
app.use("/api/auth", require("./routes/auth"));
app.use("/api/subscription", require("./routes/subscription"));

// エラーハンドリング
app.use(errorHandler);

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// index.jsのmongoose接続部分
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("MongoDB connected successfully");
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

// プロフィールルートを追加
app.use("/api/profile", require("./routes/profile"));
