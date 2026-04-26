const express = require('express');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'יותר מדי ניסיונות. נסה שוב בעוד 15 דקות.' },
});

router.post('/verify-access', limiter, async (req, res) => {
  const { token, recaptchaToken } = req.body;

  if (!token || token !== process.env.ACCESS_TOKEN) {
    return res.json({ success: false, error: 'wrong_token' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey) {
    if (!recaptchaToken) {
      return res.json({ success: false, error: 'missing_captcha' });
    }
    try {
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${recaptchaToken}`,
      });
      const data = await verifyRes.json();
      if (!data.success) {
        return res.json({ success: false, error: 'captcha_failed' });
      }
    } catch (err) {
      console.error('reCAPTCHA verify error:', err);
      return res.status(500).json({ success: false, error: 'server_error' });
    }
  }

  res.json({ success: true });
});

module.exports = router;
