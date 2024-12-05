// services/emailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(user) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'ご登録ありがとうございます',
        html: `
          <h1>ようこそ ${user.name} さん</h1>
          <p>アカウントの登録が完了しました。</p>
        `
      });
      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send welcome email', { error });
      throw new AppError('メール送信に失敗しました', 500);
    }
  }

  async sendSubscriptionConfirmation(user) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'プレミアムプランへのご登録ありがとうございます',
        html: `
          <h1>プレミアムプラン登録完了</h1>
          <p>プレミアムプランのご登録ありがとうございます。</p>
          <p>プレミアム機能をお楽しみください。</p>
        `
      });
      logger.info(`Subscription confirmation email sent to ${user.email}`);
    } catch (error) {
      logger.error('Failed to send subscription confirmation email', { error });
      throw new AppError('メール送信に失敗しました', 500);
    }
  }
}

module.exports = new EmailService();