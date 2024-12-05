const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

// 支払いセッションの作成
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Stripeダッシュボードで設定した価格ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: '支払いセッションの作成に失敗しました' });
  }
});

// サブスクリプション状態の確認
router.get('/status', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.userId });
    res.json({ 
      isPremium: subscription?.status === 'active',
      expiresAt: subscription?.currentPeriodEnd 
    });
  } catch (error) {
    res.status(500).json({ message: 'サブスクリプション状態の確認に失敗しました' });
  }
});

// routes/subscription.js
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const payload = req.body;
  
  // 開発環境では署名検証をスキップ
  if (process.env.NODE_ENV === 'development') {
    try {
      // イベントの処理
      if (payload.type === 'checkout.session.completed') {
        const session = payload.data.object;
        
        // ユーザーのプレミアムステータスを更新
        const user = await User.findOne({ email: session.customer_email });
        if (user) {
          user.isPremium = true;
          await user.save();

          const subscription = new Subscription({
            user: user._id,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            status: 'active',
            currentPeriodEnd: new Date(session.current_period_end * 1000)
          });
          await subscription.save();
        }
      }

      res.json({received: true});
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    // 本番環境では署名検証を行う
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      // イベント処理（上記と同じ）
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
});


// テスト用webhookエンドポイント
router.post('/test-webhook', async (req, res) => {
  try {
    // テストユーザーを作成または取得
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      await testUser.save();
    }

    // テスト用のチェックアウトセッション完了イベントをシミュレート
    const testEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          customer_email: testUser.email,
          customer: 'cus_test123',
          subscription: 'sub_test123',
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
        }
      }
    };

    // サブスクリプション更新処理
    testUser.isPremium = true;
    await testUser.save();

    const subscription = new Subscription({
      user: testUser._id,
      stripeCustomerId: testEvent.data.object.customer,
      stripeSubscriptionId: testEvent.data.object.subscription,
      status: 'active',
      currentPeriodEnd: new Date(testEvent.data.object.current_period_end * 1000)
    });
    await subscription.save();

    res.json({ 
      success: true, 
      message: 'Test webhook processed successfully',
      user: {
        id: testUser._id,
        email: testUser.email,
        isPremium: testUser.isPremium
      },
      subscription: {
        id: subscription._id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Webhook test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;