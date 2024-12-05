// middleware/errorHandler.js
const AppError = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production環境
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // プログラミングエラーなどの予期せぬエラー
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'システムエラーが発生しました'
      });
    }
  }
};

module.exports = errorHandler;