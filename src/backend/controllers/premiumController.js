const Subscription = require('../models/Subscription');
const pool = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const PREMIUM_PLANS = {
    free: { id: 'free', name: 'Free', price: 0, priceYearly: 0 },
    premium: { id: 'premium', name: 'Premium', price: 9.99, priceYearly: 99.99 },
    pro: { id: 'pro', name: 'Pro', price: 19.99, priceYearly: 199.99 }
};

const premiumController = {
    getSubscription: async (req, res) => {
        try {
            const userId = req.user.userId;
            const subscription = await Subscription.findByUserId(userId);

            if (!subscription) {
                return successResponse(res, 200, 'Success', { plan: 'free', status: 'active' });
            }

            // Map to frontend expected format
            const response = {
                id: subscription.id,
                plan: subscription.plan,
                status: subscription.status,
                billingCycle: subscription.billingCycle,
                startDate: subscription.currentPeriodStart,
                endDate: subscription.currentPeriodEnd,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                // Scheduled plan change info
                scheduledPlan: subscription.scheduledPlan,
                scheduledBillingCycle: subscription.scheduledBillingCycle,
                scheduledChangeDate: subscription.scheduledChangeDate,
                createdAt: subscription.createdAt
            };

            return successResponse(res, 200, 'Success', response);
        } catch (error) {
            console.error('Get subscription error:', error);
            return errorResponse(res, 500, 'Failed to get subscription', error.message);
        }
    },

    getPlans: async (req, res) => {
        try {
            return successResponse(res, 200, 'Success', Object.values(PREMIUM_PLANS));
        } catch (error) {
            return errorResponse(res, 500, 'Failed to get plans', error.message);
        }
    },

    upgradePlan: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { planId, billingCycle = 'monthly' } = req.body;

            if (!planId || !['free', 'premium', 'pro'].includes(planId)) {
                return errorResponse(res, 400, 'Invalid plan selected');
            }

            const existingSubscription = await Subscription.findByUserId(userId);
            const planRank = { free: 0, premium: 1, pro: 2 };

            // No existing subscription - create new one
            if (!existingSubscription || existingSubscription.status !== 'active') {
                if (planId === 'free') {
                    return successResponse(res, 200, 'Bạn đang sử dụng gói miễn phí.', { plan: 'free', status: 'active' });
                }
                await Subscription.create({ userId, plan: planId, billingCycle });
                const newSubscription = await Subscription.findByUserId(userId);
                return successResponse(res, 200, `Đã đăng ký thành công gói ${PREMIUM_PLANS[planId].name}!`, newSubscription);
            }

            const currentPlanRank = planRank[existingSubscription.plan];
            const newPlanRank = planRank[planId];

            // Same plan - no change needed
            if (existingSubscription.plan === planId) {
                return errorResponse(res, 400, `Bạn đang sử dụng gói ${PREMIUM_PLANS[planId].name} rồi.`);
            }

            // UPGRADE: Chuyển lên gói cao hơn - áp dụng ngay
            if (newPlanRank > currentPlanRank) {
                await Subscription.update(existingSubscription.id, { 
                    plan: planId, 
                    billingCycle,
                    // Clear any scheduled changes
                    scheduledPlan: null,
                    scheduledBillingCycle: null,
                    scheduledChangeDate: null,
                    cancelAtPeriodEnd: false,
                    status: 'active'
                });
                const updatedSubscription = await Subscription.findByUserId(userId);
                return successResponse(res, 200, `Đã nâng cấp thành công lên gói ${PREMIUM_PLANS[planId].name}!`, updatedSubscription);
            }

            // DOWNGRADE: Chuyển xuống gói thấp hơn - lên lịch cho cuối kỳ
            const scheduledChangeDate = existingSubscription.currentPeriodEnd;
            await Subscription.schedulePlanChange(
                existingSubscription.id, 
                planId, 
                billingCycle, 
                scheduledChangeDate
            );

            const updatedSubscription = await Subscription.findByUserId(userId);
            
            const formattedDate = new Date(scheduledChangeDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return successResponse(res, 200, 
                `Đã lên lịch chuyển sang gói ${PREMIUM_PLANS[planId].name}. Bạn vẫn được sử dụng gói ${PREMIUM_PLANS[existingSubscription.plan].name} đến hết ngày ${formattedDate}. Sau đó hệ thống sẽ tự động chuyển sang gói mới.`,
                updatedSubscription
            );
        } catch (error) {
            console.error('Upgrade plan error:', error);
            return errorResponse(res, 500, 'Failed to upgrade plan', error.message);
        }
    },

    // Cancel scheduled plan change
    cancelScheduledChange: async (req, res) => {
        try {
            const userId = req.user.userId;
            const subscription = await Subscription.findByUserId(userId);

            if (!subscription) {
                return errorResponse(res, 400, 'Không tìm thấy gói đăng ký.');
            }

            if (!subscription.scheduledPlan) {
                return errorResponse(res, 400, 'Không có lịch chuyển đổi gói nào.');
            }

            await Subscription.cancelScheduledChange(subscription.id);
            const updatedSubscription = await Subscription.findByUserId(userId);

            return successResponse(res, 200, 'Đã hủy lịch chuyển đổi gói thành công.', updatedSubscription);
        } catch (error) {
            console.error('Cancel scheduled change error:', error);
            return errorResponse(res, 500, 'Không thể hủy lịch chuyển đổi', error.message);
        }
    },

    cancelSubscription: async (req, res) => {
        try {
            const userId = req.user.userId;
            const subscription = await Subscription.findByUserId(userId);

            // Check if user has no subscription or is on free plan
            if (!subscription) {
                return errorResponse(res, 400, 'Bạn đang sử dụng gói miễn phí, không cần hủy.');
            }

            // Check if already cancelled or on free plan
            if (subscription.plan === 'free') {
                return errorResponse(res, 400, 'Bạn đang sử dụng gói miễn phí, không cần hủy.');
            }

            if (subscription.status === 'cancelled') {
                return errorResponse(res, 400, 'Gói đăng ký đã được hủy trước đó.');
            }

            await Subscription.cancel(subscription.id);

            return successResponse(res, 200, 'Đã hủy gói đăng ký thành công. Bạn vẫn có thể sử dụng đến hết kỳ thanh toán.', {
                accessUntil: subscription.currentPeriodEnd,
                plan: 'free'
            });
        } catch (error) {
            console.error('Cancel subscription error:', error);
            return errorResponse(res, 500, 'Không thể hủy gói đăng ký', error.message);
        }
    },

    applyPromoCode: async (req, res) => {
        try {
            const { code } = req.body;

            if (!code) {
                return errorResponse(res, 400, 'Promo code is required');
            }

            // Check promo code in database
            const [rows] = await pool.query(
                `SELECT * FROM PromoCodes 
                WHERE code = ? AND is_active = 1 
                AND (valid_from IS NULL OR valid_from <= NOW()) 
                AND (valid_until IS NULL OR valid_until >= NOW())
                AND (max_uses IS NULL OR current_uses < max_uses)`,
                [code.toUpperCase()]
            );

            if (rows.length === 0) {
                return errorResponse(res, 400, 'Invalid or expired promo code');
            }

            const promo = rows[0];

            // Increment usage
            await pool.query(
                'UPDATE PromoCodes SET current_uses = current_uses + 1 WHERE promo_id = ?',
                [promo.promo_id]
            );

            return successResponse(res, 200, 'Promo code applied', {
                code: promo.code,
                discount: promo.discount_percent,
                description: promo.description
            });
        } catch (error) {
            console.error('Apply promo code error:', error);
            return errorResponse(res, 500, 'Failed to apply promo code', error.message);
        }
    },

    createCheckoutSession: async (req, res) => {
        try {
            const { planId, billingCycle = 'monthly' } = req.body;
            const plan = PREMIUM_PLANS[planId];

            if (!plan) {
                return errorResponse(res, 400, 'Invalid plan');
            }

            return successResponse(res, 200, 'Checkout session created', {
                sessionId: `session_${Date.now()}`,
                url: `/premium/checkout?plan=${planId}&cycle=${billingCycle}`
            });
        } catch (error) {
            return errorResponse(res, 500, 'Failed to create checkout session', error.message);
        }
    },

    verifyPayment: async (req, res) => {
        try {
            const { sessionId } = req.body;
            return successResponse(res, 200, 'Payment verified', { verified: true, sessionId });
        } catch (error) {
            return errorResponse(res, 500, 'Failed to verify payment', error.message);
        }
    },

    getBillingHistory: async (req, res) => {
        try {
            const userId = req.user.userId;

            const [rows] = await pool.query(
                `SELECT * FROM BillingHistory WHERE user_id = ? ORDER BY created_at DESC`,
                [userId]
            );

            return successResponse(res, 200, 'Success', rows);
        } catch (error) {
            console.error('Get billing history error:', error);
            return errorResponse(res, 500, 'Failed to get billing history', error.message);
        }
    },

    checkPremiumAccess: async (req, res) => {
        try {
            const userId = req.user.userId;
            const subscription = await Subscription.findByUserId(userId);

            const isPremium = subscription && 
                subscription.status === 'active' && 
                ['premium', 'pro'].includes(subscription.plan);

            return successResponse(res, 200, 'Success', {
                isPremium,
                plan: subscription?.plan || 'free',
                expiresAt: subscription?.currentPeriodEnd
            });
        } catch (error) {
            return errorResponse(res, 500, 'Failed to check premium access', error.message);
        }
    }
};

module.exports = premiumController;
