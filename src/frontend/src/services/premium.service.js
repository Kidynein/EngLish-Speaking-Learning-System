import api from "./api";

const premiumService = {
    getSubscription: async () => {
        try {
            const response = await api.get("/premium/subscription");
            return response.data.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { plan: 'free', status: 'active' };
            }
            throw error;
        }
    },

    getPlans: async () => {
        const response = await api.get("/premium/plans");
        return response.data.data;
    },

    upgradePlan: async (planId, billingCycle = 'monthly') => {
        const response = await api.post("/premium/upgrade", { planId, billingCycle });
        return response.data.data;
    },

    cancelSubscription: async () => {
        try {
            const response = await api.post("/premium/cancel");
            return response.data;
        } catch (error) {
            // Extract error message from server response
            const errorMessage = error.response?.data?.message || 'Không thể hủy gói đăng ký';
            const customError = new Error(errorMessage);
            customError.response = error.response;
            throw customError;
        }
    },

    createCheckoutSession: async (planId, billingCycle = 'monthly') => {
        const response = await api.post("/premium/checkout", { planId, billingCycle });
        return response.data.data;
    },

    verifyPayment: async (sessionId) => {
        const response = await api.post("/premium/verify-payment", { sessionId });
        return response.data.data;
    },

    getBillingHistory: async () => {
        const response = await api.get("/premium/billing-history");
        return response.data.data;
    },

    applyPromoCode: async (code) => {
        const response = await api.post("/premium/promo", { code });
        return response.data.data;
    }
};

export default premiumService;
