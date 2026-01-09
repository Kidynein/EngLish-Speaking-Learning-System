import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { PREMIUM_PLANS } from '../../context/PremiumContext';

const PricingSection = () => {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleSelectPlan = (planId) => {
        if (!isAuthenticated) {
            navigate('/signup', { state: { selectedPlan: planId } });
        } else {
            navigate('/premium/checkout', { state: { planId, billingCycle } });
        }
    };

    const plans = [
        {
            ...PREMIUM_PLANS.FREE,
            highlight: false,
            buttonText: 'Start Free',
            buttonStyle: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        },
        {
            ...PREMIUM_PLANS.PREMIUM,
            highlight: true,
            badge: 'Most Popular',
            buttonText: 'Get Premium',
            buttonStyle: 'bg-linear-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30'
        },
        {
            ...PREMIUM_PLANS.PRO,
            highlight: false,
            badge: 'Best Value',
            buttonText: 'Go Pro',
            buttonStyle: 'bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
        }
    ];

    const getPrice = (plan) => {
        if (plan.price === 0) return 'Free';
        const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
        return `$${price}`;
    };

    return (
        <section className="py-24 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Choose Your
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-green-400"> Learning Path</span>
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                        Start for free and upgrade anytime. No credit card required.
                    </p>

                    <div className="inline-flex items-center bg-slate-700/50 rounded-full p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Yearly
                            <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative ${plan.highlight ? 'lg:-mt-8 lg:mb-8' : ''}`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                    <span className={`px-4 py-1 text-sm font-bold rounded-full ${plan.highlight ? 'bg-linear-to-r from-emerald-500 to-green-500 text-white' : 'bg-linear-to-r from-purple-500 to-pink-500 text-white'
                                        }`}>
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className={`h-full p-8 rounded-3xl border transition-all duration-300 ${plan.highlight
                                ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-500/50 shadow-2xl'
                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                }`}>
                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {getPrice(plan)}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className={plan.highlight ? 'text-gray-500 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}>
                                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className={`w-5 h-5 mt-0.5 shrink-0 ${plan.highlight ? 'text-emerald-500' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm ${plan.highlight ? 'text-slate-600 dark:text-gray-300' : 'text-slate-600 dark:text-gray-300'}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${plan.buttonStyle}`}
                                >
                                    {plan.buttonText}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div className="flex items-center justify-center gap-8 text-gray-500 dark:text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Secure Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Cancel Anytime</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default PricingSection;
