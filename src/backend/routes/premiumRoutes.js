const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.get('/plans', premiumController.getPlans);

// Protected routes
router.get('/subscription', authenticate, premiumController.getSubscription);
router.post('/upgrade', authenticate, premiumController.upgradePlan);
router.post('/cancel', authenticate, premiumController.cancelSubscription);
router.post('/promo', authenticate, premiumController.applyPromoCode);
router.post('/checkout', authenticate, premiumController.createCheckoutSession);
router.post('/verify-payment', authenticate, premiumController.verifyPayment);
router.get('/billing-history', authenticate, premiumController.getBillingHistory);
router.get('/check-access', authenticate, premiumController.checkPremiumAccess);

module.exports = router;
