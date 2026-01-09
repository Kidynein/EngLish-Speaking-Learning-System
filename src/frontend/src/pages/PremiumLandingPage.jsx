import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PREMIUM_PLANS } from '../context/PremiumContext';

// --- Sub-components ---

const ComparisonTable = () => {
    const features = [
        { name: "AI Voice Recognition", free: "Basic", premium: "Advanced (95%)", pro: "Pro (99%)" },
        { name: "Daily Practice Limit", free: "15 mins", premium: "Unlimited", pro: "Unlimited" },
        { name: "Topics Access", free: "10 Topics", premium: "200+ Topics", pro: "All Topics + Custom" },
        { name: "Detailed Feedback", free: false, premium: true, pro: true },
        { name: "Ad-free Experience", free: false, premium: true, pro: true },
        { name: "Offline Mode", free: false, premium: false, pro: true },
        { name: "1-on-1 Tutor Session", free: false, premium: false, pro: "1/month" },
    ];

    return (
        <div className="mt-32 max-w-5xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white [.light-theme_&]:text-slate-900 mb-12">Compare Plans</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-700 [.light-theme_&]:border-slate-200 shadow-xl bg-slate-800/50 [.light-theme_&]:bg-white backdrop-blur-sm">
                <table className="w-full text-sm text-left text-slate-300 [.light-theme_&]:text-slate-600">
                    <thead className="text-xs uppercase bg-slate-900/50 [.light-theme_&]:bg-slate-50 text-slate-300 [.light-theme_&]:text-slate-700">
                        <tr>
                            <th className="px-6 py-6 font-bold tracking-wider">Feature</th>
                            <th className="px-6 py-6 text-center">Free</th>
                            <th className="px-6 py-6 text-center text-emerald-400 [.light-theme_&]:text-emerald-600 font-bold">Premium</th>
                            <th className="px-6 py-6 text-center text-purple-400 [.light-theme_&]:text-purple-600 font-bold">Pro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature, idx) => (
                            <tr key={idx} className="bg-transparent border-b border-slate-700 [.light-theme_&]:border-slate-100 last:border-0 hover:bg-slate-700/30 [.light-theme_&]:hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-5 font-medium text-white [.light-theme_&]:text-slate-900">{feature.name}</td>
                                <td className="px-6 py-5 text-center">
                                    {typeof feature.free === 'boolean' ? (
                                        feature.free ?
                                            <svg className="w-5 h-5 mx-auto text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> :
                                            <svg className="w-5 h-5 mx-auto text-slate-500 [.light-theme_&]:text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    ) : feature.free}
                                </td>
                                <td className="px-6 py-5 text-center font-medium text-emerald-400 [.light-theme_&]:text-emerald-600">
                                    {typeof feature.premium === 'boolean' ? (
                                        feature.premium ?
                                            <svg className="w-6 h-6 mx-auto text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> :
                                            <span className="text-slate-500 [.light-theme_&]:text-slate-300">-</span>
                                    ) : feature.premium}
                                </td>
                                <td className="px-6 py-5 text-center font-medium text-purple-400 [.light-theme_&]:text-purple-600">
                                    {typeof feature.pro === 'boolean' ? (
                                        feature.pro ?
                                            <svg className="w-6 h-6 mx-auto text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> :
                                            <span className="text-slate-500 [.light-theme_&]:text-slate-300">-</span>
                                    ) : feature.pro}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        { q: "Can I cancel anytime?", a: "Yes, absolutely. You can cancel your subscription at any time from your account settings. You'll keep access until the end of your billing period." },
        { q: "Is there a student discount?", a: "We offer special pricing for students and educational institutions. Contact our support team for more details." },
        { q: "How does the AI feedback work?", a: "Our AI analyzes your voice recording in real-time, comparing it to native speaker models to give you instant scores on pronunciation, intonation, and fluency." },
        { q: "What happens if I'm not satisfied?", a: "We have a 30-day money-back guarantee. If you're not happy, just let us know and we'll refund your payment immediately." },
    ];

    return (
        <div className="mt-32 max-w-3xl mx-auto px-4 pb-20">
            <h2 className="text-3xl md:text-3xl font-bold text-center text-white [.light-theme_&]:text-slate-900 mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
                {faqs.map((item, i) => (
                    <div key={i} className="bg-slate-800/50 [.light-theme_&]:bg-white p-6 rounded-2xl border border-slate-700 [.light-theme_&]:border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-white [.light-theme_&]:text-slate-900 mb-3">{item.q}</h3>
                        <p className="text-slate-400 [.light-theme_&]:text-slate-600 leading-relaxed font-medium">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const PremiumLandingPage = () => {
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

    const getPrice = (plan) => {
        if (plan.price === 0) return 'Free';
        const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
        return `$${price}`;
    };

    const plans = [
        {
            ...PREMIUM_PLANS.FREE,
            highlight: false,
            buttonText: 'Start Free',
            buttonStyle: 'bg-slate-700 text-white hover:bg-slate-600 [.light-theme_&]:bg-slate-100 [.light-theme_&]:text-slate-900 [.light-theme_&]:hover:bg-slate-200'
        },
        {
            ...PREMIUM_PLANS.PREMIUM,
            highlight: true,
            badge: 'Most Popular',
            buttonText: 'Get Premium',
            buttonStyle: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
        },
        {
            ...PREMIUM_PLANS.PRO,
            highlight: false,
            badge: 'Best Value',
            buttonText: 'Go Pro',
            buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20'
        }
    ];

    return (
        <div className="relative isolate px-4 sm:px-6 lg:px-8 py-16">

            {/* Minimalist Background Blobs */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-30 [.light-theme_&]:opacity-100 mix-blend-multiply translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl opacity-30 [.light-theme_&]:opacity-100 mix-blend-multiply -translate-x-1/3 translate-y-1/4"></div>

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    className="text-center mb-24"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white [.light-theme_&]:text-slate-900 mb-8 tracking-tight leading-tighter">
                        Invest in Your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 [.light-theme_&]:from-emerald-600 [.light-theme_&]:to-teal-500">
                            English Future
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 [.light-theme_&]:text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-normal">
                        Unlock unlimited practice, advanced AI feedback, and personalized coaching. Join <span className="font-bold text-white [.light-theme_&]:text-slate-900">10,000+</span> learners upgrading their skills.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-slate-800 [.light-theme_&]:bg-slate-100 rounded-full p-2 shadow-sm border border-slate-700 [.light-theme_&]:border-slate-200">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly'
                                ? 'bg-slate-600 text-white [.light-theme_&]:bg-white [.light-theme_&]:text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 [.light-theme_&]:text-slate-500 [.light-theme_&]:hover:text-slate-700'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly'
                                ? 'bg-slate-600 text-white [.light-theme_&]:bg-white [.light-theme_&]:text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 [.light-theme_&]:text-slate-500 [.light-theme_&]:hover:text-slate-700'
                                }`}
                        >
                            Yearly
                            <span className="bg-amber-900/50 text-amber-400 [.light-theme_&]:bg-amber-100 [.light-theme_&]:text-amber-700 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-bold">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start relative z-10 mb-32">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`relative rounded-[2rem] transition-all duration-300 flex flex-col h-full ${plan.highlight
                                ? 'bg-slate-800 [.light-theme_&]:bg-white ring-2 ring-emerald-500 shadow-2xl scale-105 z-10'
                                : 'bg-slate-800/50 [.light-theme_&]:bg-white border border-slate-700 [.light-theme_&]:border-slate-200 shadow-xl hover:shadow-2xl hover:-translate-y-1'
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                                    <span className={`px-4 py-1 text-xs font-bold rounded-full uppercase tracking-widest ${plan.highlight
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-slate-700 text-white'
                                        }`}>
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="p-10 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-white [.light-theme_&]:text-slate-900 mb-2 text-center">
                                    {plan.name}
                                </h3>
                                <p className="text-slate-400 [.light-theme_&]:text-slate-500 text-sm text-center mb-8 font-medium">
                                    {plan.id === 'pro' ? 'For serious learners' : plan.id === 'premium' ? 'Most popular choice' : 'Perfect for starters'}
                                </p>

                                <div className="flex items-baseline justify-center gap-1 mb-10">
                                    <span className={`text-6xl font-extrabold tracking-inighter ${plan.highlight ? 'text-emerald-400 [.light-theme_&]:text-emerald-600' : 'text-white [.light-theme_&]:text-slate-900'}`}>
                                        {getPrice(plan)}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-slate-400 [.light-theme_&]:text-slate-500 font-semibold text-lg">
                                            /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-transform transform hover:scale-[1.02] active:scale-[0.98] mb-10 ${plan.buttonStyle}`}
                                >
                                    {plan.buttonText}
                                </button>

                                <div className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 [.light-theme_&]:text-slate-600 font-medium">
                                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-emerald-500/20 text-emerald-400 [.light-theme_&]:bg-emerald-100 [.light-theme_&]:text-emerald-600' : 'bg-slate-700 text-slate-400 [.light-theme_&]:bg-slate-100 [.light-theme_&]:text-slate-500'}`}>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Minimalist Satisfaction Guarantee */}
                <div className="max-w-2xl mx-auto mb-32">
                    <div className="bg-slate-800/30 [.light-theme_&]:bg-white rounded-2xl p-8 border border-slate-700 [.light-theme_&]:border-slate-200 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-colors">
                        <div className="w-16 h-16 rounded-full bg-slate-800 [.light-theme_&]:bg-slate-50 flex items-center justify-center shrink-0 border border-slate-700 [.light-theme_&]:border-slate-100">
                            <svg className="w-8 h-8 text-emerald-400 [.light-theme_&]:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white [.light-theme_&]:text-slate-900 mb-1">
                                30-Day Money-Back Guarantee
                            </h3>
                            <p className="text-slate-400 [.light-theme_&]:text-slate-600 text-sm leading-relaxed">
                                Not satisfied? Refund within 30 days, no questions asked. We're confident you'll love it.
                            </p>
                        </div>
                    </div>
                </div>

                <ComparisonTable />
                <FAQSection />
            </div>
        </div>
    );
};

export default PremiumLandingPage;
