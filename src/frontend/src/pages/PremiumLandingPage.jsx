import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePremium, PREMIUM_PLANS } from '../context/PremiumContext';

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
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelScheduledLoading, setCancelScheduledLoading] = useState(false);
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showCancelScheduledModal, setShowCancelScheduledModal] = useState(false);
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
    const [selectedDowngradePlan, setSelectedDowngradePlan] = useState(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isPremium, isPro, subscription, currentPlan, cancelSubscription, cancelScheduledChange, hasScheduledChange, scheduledPlanInfo, refreshSubscription, upgradePlan } = usePremium();

    const hasActiveSubscription = isPremium || isPro;

    const handleSelectPlan = (planId) => {
        // Nếu chưa login
        if (!isAuthenticated) {
            navigate('/signup', { state: { selectedPlan: planId } });
            return;
        }

        // Nếu bấm Free -> redirect về trang chính
        if (planId === 'free') {
            navigate('/dashboard');
            return;
        }

        // Kiểm tra đã đăng ký gói này rồi
        if (currentPlan?.id === planId && (isPremium || isPro)) {
            toast.info(`Bạn đang sử dụng gói ${currentPlan?.name} rồi!`);
            return;
        }

        // Nếu đang ở Pro mà bấm Premium -> hiện modal xác nhận downgrade
        if (isPro && planId === 'premium') {
            setSelectedDowngradePlan(planId);
            setShowDowngradeModal(true);
            return;
        }

        // Nếu đang ở Premium mà bấm Pro -> upgrade ngay
        if (isPremium && planId === 'pro') {
            navigate('/premium/checkout', { state: { planId, billingCycle } });
            return;
        }

        // Trường hợp còn lại -> đi đến checkout
        navigate('/premium/checkout', { state: { planId, billingCycle } });
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

    const handleCancelSubscription = async () => {
        setShowCancelSubscriptionModal(true);
    };

    const confirmCancelSubscription = async () => {
        setCancelLoading(true);
        try {
            await cancelSubscription();
            await refreshSubscription();
            toast.success('Đã hủy gói đăng ký thành công!');
            setShowCancelSubscriptionModal(false);
        } catch (error) {
            toast.error(error.message || 'Không thể hủy gói đăng ký');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleCancelScheduledChange = async () => {
        setShowCancelScheduledModal(true);
    };

    const confirmCancelScheduledChange = async () => {
        setCancelScheduledLoading(true);
        try {
            await cancelScheduledChange();
            await refreshSubscription();
            toast.success('Đã hủy lịch chuyển đổi gói thành công!');
            setShowCancelScheduledModal(false);
        } catch (error) {
            toast.error(error.message || 'Không thể hủy lịch chuyển đổi');
        } finally {
            setCancelScheduledLoading(false);
        }
    };

    const handleDowngrade = async (planId) => {
        setSelectedDowngradePlan(planId);
        setShowDowngradeModal(true);
    };

    const confirmDowngrade = async () => {
        try {
            await upgradePlan(selectedDowngradePlan, billingCycle);
            await refreshSubscription();
            const planName = selectedDowngradePlan === 'premium' ? 'Premium' : 'Free';
            toast.success(`Đã lên lịch chuyển sang gói ${planName}!`);
            setShowDowngradeModal(false);
        } catch (error) {
            toast.error(error.message || 'Không thể chuyển đổi gói');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="relative isolate px-4 sm:px-6 lg:px-8 py-16">

            {/* Cancel Subscription Confirmation Modal */}
            {showCancelSubscriptionModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowCancelSubscriptionModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-slate-300 text-center leading-relaxed mb-6">
                                Bạn có chắc muốn hủy gói đăng ký? Bạn vẫn có thể sử dụng đến hết kỳ thanh toán.
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmCancelSubscription}
                                    disabled={cancelLoading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelLoading ? 'Đang xử lý...' : 'OK'}
                                </button>
                                <button
                                    onClick={() => setShowCancelSubscriptionModal(false)}
                                    disabled={cancelLoading}
                                    className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Cancel Scheduled Change Confirmation Modal */}
            {showCancelScheduledModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowCancelScheduledModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-slate-300 text-center leading-relaxed mb-6">
                                Bạn có chắc muốn hủy gói đăng ký? Bạn vẫn có thể sử dụng đến hết kỳ thanh toán.
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmCancelScheduledChange}
                                    disabled={cancelScheduledLoading}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelScheduledLoading ? 'Đang xử lý...' : 'OK'}
                                </button>
                                <button
                                    onClick={() => setShowCancelScheduledModal(false)}
                                    disabled={cancelScheduledLoading}
                                    className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Downgrade Confirmation Modal */}
            {showDowngradeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowDowngradeModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-slate-300 text-center leading-relaxed mb-6">
                                Bạn đang sử dụng gói <span className="font-bold text-white">{currentPlan?.name}</span> (hết hạn ngày <span className="font-semibold">{formatDate(subscription?.endDate)}</span>). 
                                Việc chuyển sang gói <span className="font-bold text-white capitalize">{selectedDowngradePlan}</span> sẽ có hiệu lực vào chu kỳ thanh toán tiếp theo. 
                                Từ nay đến đó, bạn vẫn sử dụng quyền lợi <span className="font-bold text-white">{currentPlan?.name}</span> bình thường. 
                                <br /><br />
                                Bạn có xác nhận thay đổi không?
                            </p>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmDowngrade}
                                    className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg"
                                >
                                    Đồng ý
                                </button>
                                <button
                                    onClick={() => setShowDowngradeModal(false)}
                                    className="flex-1 px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-all"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Minimalist Background Blobs */}
            <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl opacity-30 [.light-theme_&]:opacity-100 mix-blend-multiply translate-x-1/3 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl opacity-30 [.light-theme_&]:opacity-100 mix-blend-multiply -translate-x-1/3 translate-y-1/4"></div>

            {/* Subscription Management Section for Active Subscribers */}
            {hasActiveSubscription && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <div className={`rounded-2xl border overflow-hidden ${
                        isPro 
                            ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/50' 
                            : 'bg-gradient-to-br from-emerald-900/50 to-green-900/50 border-emerald-500/50'
                    }`}>
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                        isPro ? 'bg-purple-500' : 'bg-emerald-500/30'
                                    }`}>
                                        {isPro ? (
                                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                                <path d="M2.5 19h19v2h-19v-2z" fill="#F59E0B"/>
                                                <path d="M22 7l-5 4-5-6-5 6-5-4 2 11h16l2-11z" fill="#FBBF24"/>
                                                <circle cx="12" cy="5" r="2" fill="#F59E0B"/>
                                                <circle cx="4" cy="9" r="1.5" fill="#F59E0B"/>
                                                <circle cx="20" cy="9" r="1.5" fill="#F59E0B"/>
                                            </svg>
                                        ) : (
                                            <svg className="w-7 h-7 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {currentPlan?.name} Plan
                                        </h2>
                                        <p className="text-slate-300">
                                            Quản lý gói đăng ký của bạn
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    subscription?.cancelAtPeriodEnd 
                                        ? 'bg-yellow-400 text-yellow-900'
                                        : 'bg-green-400 text-green-900'
                                }`}>
                                    {subscription?.cancelAtPeriodEnd ? 'Sẽ hết hạn' : 'Đang hoạt động'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <p className="text-sm text-slate-300 mb-1">Gói hiện tại</p>
                                    <p className="text-xl font-bold text-white">{currentPlan?.name}</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <p className="text-sm text-slate-300 mb-1">Giá</p>
                                    <p className="text-xl font-bold text-white">
                                        ${subscription?.billingCycle === 'yearly' ? currentPlan?.priceYearly : currentPlan?.price}
                                        <span className="text-sm text-slate-300">/{subscription?.billingCycle === 'yearly' ? 'năm' : 'tháng'}</span>
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4">
                                    <p className="text-sm text-slate-300 mb-1">
                                        {subscription?.cancelAtPeriodEnd ? 'Hết hạn vào' : 'Gia hạn vào'}
                                    </p>
                                    <p className="text-xl font-bold text-white">
                                        {formatDate(subscription?.endDate)}
                                    </p>
                                </div>
                            </div>

                            {subscription?.cancelAtPeriodEnd ? (
                                <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="text-yellow-100 font-semibold">Gói đăng ký đã được hủy</p>
                                            <p className="text-yellow-200 text-sm">
                                                Bạn vẫn có thể sử dụng tất cả tính năng {currentPlan?.name} đến ngày {formatDate(subscription?.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : hasScheduledChange ? (
                                <div className="bg-blue-400/20 border border-blue-400/50 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-blue-100 font-semibold">Đã lên lịch chuyển đổi gói</p>
                                            <p className="text-blue-200 text-sm">
                                                Bạn sẽ chuyển sang gói <span className="font-bold capitalize">{scheduledPlanInfo?.plan}</span> vào ngày {formatDate(scheduledPlanInfo?.changeDate)}. 
                                                Đến lúc đó, bạn vẫn được sử dụng đầy đủ tính năng {currentPlan?.name}.
                                            </p>
                                            <button
                                                onClick={handleCancelScheduledChange}
                                                disabled={cancelScheduledLoading}
                                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-blue-100 text-sm font-semibold rounded-lg hover:bg-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {cancelScheduledLoading ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Đang hủy...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Hủy lịch chuyển đổi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    {isPremium && !isPro && (
                                        <button
                                            onClick={() => handleSelectPlan('pro')}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                            Nâng cấp lên Pro
                                        </button>
                                    )}
                                    {isPro && (
                                        <button
                                            onClick={() => handleDowngrade('premium')}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                            Chuyển sang Premium
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={cancelLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cancelLoading ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang hủy...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Hủy gói đăng ký
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
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
