import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { usePremium, PREMIUM_PLANS } from '../context/PremiumContext';
import premiumService from '../services/premium.service';
import { useTheme } from '../context/ThemeContext';

const PremiumCheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshSubscription } = usePremium();
    const { setOverrideTheme } = useTheme();

    // Force Dark Theme
    React.useEffect(() => {
        setOverrideTheme('dark');
        return () => setOverrideTheme(null);
    }, [setOverrideTheme]);

    const { planId = 'premium', billingCycle: initialBillingCycle = 'monthly' } = location.state || {};

    const [billingCycle, setBillingCycle] = useState(initialBillingCycle);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [promoLoading, setPromoLoading] = useState(false);

    const plan = PREMIUM_PLANS[planId.toUpperCase()] || PREMIUM_PLANS.PREMIUM;
    const basePrice = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
    const finalPrice = basePrice - (basePrice * discount / 100);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        try {
            const result = await premiumService.applyPromoCode(promoCode);
            setDiscount(result.discount || 0);
            toast.success(`Promo code applied! ${result.discount}% discount`);
        } catch {
            toast.error('Invalid promo code');
            setDiscount(0);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            await premiumService.upgradePlan(planId, billingCycle);
            await refreshSubscription();
            toast.success('Welcome to Premium! 🎉');
            navigate('/dashboard');
        } catch {
            toast.error('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-20 pb-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Upgrade Your Experience
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Secure checkout for your premium subscription
                    </p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white mb-8 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200 dark:border-gray-700"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                        <div className="bg-linear-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name} Plan</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${planId === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {planId === 'pro' ? 'Best Value' : 'Popular'}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.slice(0, 5).map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <label className="text-gray-600 dark:text-gray-400 text-sm mb-2 block">Billing Cycle</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${billingCycle === 'yearly'
                                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Yearly <span className="text-xs text-emerald-500 font-bold ml-1">-20%</span>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-gray-600 dark:text-gray-400 text-sm mb-2 block">Promo Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    className="flex-1 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={promoLoading}
                                    className="px-6 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    {promoLoading ? '...' : 'Apply'}
                                </button>
                            </div>
                            {discount > 0 && (
                                <p className="text-emerald-400 text-sm mt-2">✓ {discount}% discount applied</p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 dark:text-gray-400">Total due today</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">${finalPrice.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
                                7-day money-back guarantee. Cancel anytime.
                            </p>
                        </div>
                    </motion.div>

                    {/* Payment Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200 dark:border-slate-700"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Details</h2>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-300">Demo Mode</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">This is a demo. No real payment will be processed.</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleCheckout(); }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Cardholder Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                        <div className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                        <div className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m-10 4h10M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 py-4 bg-linear-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Pay $${finalPrice.toFixed(2)}`
                                )}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-center gap-4 text-gray-400 text-sm">
                            <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure
                            </div>
                            <span>•</span>
                            <span>256-bit SSL</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default PremiumCheckoutPage;
