import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import premiumService from "../services/premium.service";

const PremiumContext = createContext();

export const usePremium = () => useContext(PremiumContext);

export const PREMIUM_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
            'Basic AI Voice Recognition',
            'Limited Topics (10)',
            'Basic Feedback',
            'Community Support',
            '5 Practice Sessions/Day'
        ],
        limits: {
            topicsAccess: 10,
            sessionsPerDay: 5,
            advancedFeedback: false,
            personalizedLearning: false,
            prioritySupport: false,
            offlineAccess: false,
            certificatesEnabled: false,
            analyticsAccess: 'basic'
        }
    },
    PREMIUM: {
        id: 'premium',
        name: 'Premium',
        price: 9.99,
        priceYearly: 99.99,
        features: [
            'Advanced AI Voice Recognition (95% Accuracy)',
            'Unlimited Topics Access (200+)',
            'Instant Detailed Feedback',
            'Personalized Learning Path',
            'Priority Email Support',
            'Unlimited Practice Sessions',
            'Progress Analytics Dashboard',
            'Ad-free Experience'
        ],
        limits: {
            topicsAccess: -1,
            sessionsPerDay: -1,
            advancedFeedback: true,
            personalizedLearning: true,
            prioritySupport: true,
            offlineAccess: false,
            certificatesEnabled: true,
            analyticsAccess: 'advanced'
        }
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 19.99,
        priceYearly: 199.99,
        features: [
            'Everything in Premium',
            'AI-Powered Personal Tutor',
            'Real-time Conversation Practice',
            'Offline Access',
            'Priority 24/7 Support',
            'Custom Learning Goals',
            'Completion Certificates',
            'Advanced Analytics & Insights',
            'Early Access to New Features'
        ],
        limits: {
            topicsAccess: -1,
            sessionsPerDay: -1,
            advancedFeedback: true,
            personalizedLearning: true,
            prioritySupport: true,
            offlineAccess: true,
            certificatesEnabled: true,
            analyticsAccess: 'pro',
            aiTutor: true,
            conversationPractice: true
        }
    }
};

export const PremiumProvider = ({ children }) => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [hasSeenPremiumModal, setHasSeenPremiumModal] = useState(() => {
        return localStorage.getItem('hasSeenPremiumModal') === 'true';
    });

    useEffect(() => {
        if (user) {
            fetchSubscription();
        } else {
            setSubscription(null);
            setLoading(false);
        }
    }, [user]);

    const fetchSubscription = async () => {
        try {
            setLoading(true);
            const data = await premiumService.getSubscription();
            setSubscription(data);

            // Show premium modal for free users or expired subscriptions who haven't seen it yet
            const isExpired = data?.status === 'cancelled' && data?.endDate && new Date(data.endDate) <= new Date();
            const isFreeOrExpired = !data || data.plan === 'free' || data.status === 'expired' || isExpired;
            const hasNotSeenModal = localStorage.getItem('hasSeenPremiumModal') !== 'true';

            if (isFreeOrExpired && hasNotSeenModal && user) {
                // Delay showing modal to let the page load first
                setTimeout(() => {
                    setShowPremiumModal(true);
                }, 1500);
            }
        } catch (error) {
            console.error("Failed to fetch subscription:", error);
            setSubscription({ plan: 'free', status: 'active' });
        } finally {
            setLoading(false);
        }
    };

    const dismissPremiumModal = (upgraded = false) => {
        setShowPremiumModal(false);
        setHasSeenPremiumModal(true);
        localStorage.setItem('hasSeenPremiumModal', 'true');

        if (upgraded) {
            // Refresh subscription after upgrade
            fetchSubscription();
        }
    };

    const openPremiumModal = () => {
        setShowPremiumModal(true);
    };

    const resetPremiumModalState = () => {
        // Allow showing modal again (useful for testing or after logout)
        setHasSeenPremiumModal(false);
        localStorage.removeItem('hasSeenPremiumModal');
    };

    /**
     * Check if subscription is still valid (active OR cancelled but within period)
     */
    const isSubscriptionValid = () => {
        if (!subscription) return false;

        // Active subscription is always valid
        if (subscription.status === 'active') return true;

        // Cancelled subscription is valid until endDate
        if (subscription.status === 'cancelled' && subscription.endDate) {
            const endDate = new Date(subscription.endDate);
            return endDate > new Date();
        }

        return false;
    };

    const getCurrentPlan = () => {
        if (!subscription) return PREMIUM_PLANS.FREE;

        // Check if subscription is still valid (active or cancelled but within period)
        if (!isSubscriptionValid()) {
            return PREMIUM_PLANS.FREE;
        }

        const planKey = subscription.plan?.toUpperCase() || 'FREE';
        return PREMIUM_PLANS[planKey] || PREMIUM_PLANS.FREE;
    };

    const isPremium = () => {
        // Check if subscription is valid (active or cancelled but within period)
        if (!isSubscriptionValid()) return false;
        return subscription?.plan === 'premium' || subscription?.plan === 'pro';
    };

    const isPro = () => {
        // Check if subscription is valid (active or cancelled but within period)
        if (!isSubscriptionValid()) return false;
        return subscription?.plan === 'pro';
    };

    const canAccessFeature = (feature) => {
        const plan = getCurrentPlan();
        return plan.limits[feature] === true || plan.limits[feature] === -1;
    };

    const getFeatureLimit = (feature) => {
        const plan = getCurrentPlan();
        return plan.limits[feature];
    };

    const upgradePlan = async (planId, billingCycle = 'monthly') => {
        try {
            const result = await premiumService.upgradePlan(planId, billingCycle);
            await fetchSubscription();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const cancelSubscription = async () => {
        try {
            await premiumService.cancelSubscription();
            await fetchSubscription();
        } catch (error) {
            throw error;
        }
    };

    const cancelScheduledChange = async () => {
        try {
            await premiumService.cancelScheduledChange();
            await fetchSubscription();
        } catch (error) {
            throw error;
        }
    };

    /**
     * Check if there is a scheduled plan change
     */
    const hasScheduledChange = () => {
        return subscription?.scheduledPlan !== null && subscription?.scheduledPlan !== undefined;
    };

    /**
     * Get scheduled plan info
     */
    const getScheduledPlanInfo = () => {
        if (!hasScheduledChange()) return null;
        return {
            plan: subscription.scheduledPlan,
            billingCycle: subscription.scheduledBillingCycle,
            changeDate: subscription.scheduledChangeDate
        };
    };

    const value = {
        subscription,
        loading,
        currentPlan: getCurrentPlan(),
        isPremium: isPremium(),
        isPro: isPro(),
        canAccessFeature,
        getFeatureLimit,
        upgradePlan,
        cancelSubscription,
        cancelScheduledChange,
        hasScheduledChange: hasScheduledChange(),
        scheduledPlanInfo: getScheduledPlanInfo(),
        refreshSubscription: fetchSubscription,
        plans: PREMIUM_PLANS,
        // Modal state
        showPremiumModal,
        hasSeenPremiumModal,
        dismissPremiumModal,
        resetPremiumModalState,
        openPremiumModal
    };

    return (
        <PremiumContext.Provider value={value}>
            {children}
        </PremiumContext.Provider>
    );
};

export default PremiumContext;