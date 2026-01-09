import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePremium, PREMIUM_PLANS } from '../../context/PremiumContext';
import { toast } from 'react-toastify';

const PremiumUpgradeModal = ({ isOpen, onClose, onSkip }) => {
    const navigate = useNavigate();
    const { upgradePlan, refreshSubscription } = usePremium();
    const [selectedPlan, setSelectedPlan] = useState('premium');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('select'); // 'select' | 'checkout'

    const plan = PREMIUM_PLANS[selectedPlan.toUpperCase()];
    const price = billingCycle === 'yearly' ? plan?.priceYearly : plan?.price;

    const handleSelectPlan = (planId) => {
        if (planId === 'free') {
            onSkip();
            return;
        }
        setSelectedPlan(planId);
        setStep('checkout');
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            await upgradePlan(selectedPlan, billingCycle);
            await refreshSubscription();
            toast.success('Chào mừng bạn đến với Premium! 🎉');
            onClose(true); // true = upgraded successfully
        } catch (error) {
            toast.error('Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'checkout') {
            setStep('select');
        } else {
            onSkip();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => e.target === e.currentTarget && onSkip()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl"
                >
                    {/* Close Button */}
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {step === 'select' ? (
                        <PlanSelectionStep
                            onSelectPlan={handleSelectPlan}
                            onSkip={onSkip}
                        />
                    ) : (
                        <CheckoutStep
                            plan={plan}
                            selectedPlan={selectedPlan}
                            billingCycle={billingCycle}
                            setBillingCycle={setBillingCycle}
                            price={price}
                            loading={loading}
                            onCheckout={handleCheckout}
                            onBack={handleBack}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Plan Selection Step
const PlanSelectionStep = ({ onSelectPlan, onSkip }) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            description: 'Bắt đầu học miễn phí',
            features: [
                'AI nhận diện giọng nói cơ bản',
                'Giới hạn 10 chủ đề',
                'Phản hồi cơ bản',
                '5 buổi luyện tập/ngày'
            ],
            buttonText: 'Tiếp tục miễn phí',
            buttonClass: 'bg-slate-600 hover:bg-slate-500',
            badge: null
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 9.99,
            priceYearly: 99.99,
            description: 'Cho người học nghiêm túc',
            features: [
                'AI nhận diện giọng nói nâng cao (95%)',
                'Không giới hạn chủ đề (200+)',
                'Phản hồi chi tiết tức thì',
                'Lộ trình học cá nhân hóa',
                'Không giới hạn luyện tập',
                'Bảng phân tích tiến độ'
            ],
            buttonText: 'Chọn Premium',
            buttonClass: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600',
            badge: 'Phổ biến',
            badgeClass: 'bg-emerald-500'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 19.99,
            priceYearly: 199.99,
            description: 'Trải nghiệm đầy đủ nhất',
            features: [
                'Tất cả tính năng Premium',
                'Gia sư AI cá nhân',
                'Luyện hội thoại thực tế',
                'Truy cập offline',
                'Hỗ trợ 24/7',
                'Chứng chỉ hoàn thành'
            ],
            buttonText: 'Chọn Pro',
            buttonClass: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
            badge: 'Tốt nhất',
            badgeClass: 'bg-purple-500'
        }
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-200 mb-2">
                    Nâng cấp trải nghiệm học tập
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Mở khóa tất cả tính năng để học tiếng Anh hiệu quả hơn với AI
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                            plan.id === 'premium'
                                ? 'bg-gradient-to-b from-emerald-500/10 to-green-500/10 border-emerald-500/50 scale-105'
                                : plan.id === 'pro'
                                ? 'bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-purple-500/50'
                                : 'bg-slate-800/50 border-slate-700'
                        }`}
                    >
                        {plan.badge && (
                            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white rounded-full ${plan.badgeClass}`}>
                                {plan.badge}
                            </span>
                        )}

                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-gray-200 mb-1">{plan.name}</h3>
                            <p className="text-sm text-gray-400">{plan.description}</p>
                        </div>

                        <div className="text-center mb-6">
                            <span className="text-4xl font-bold text-gray-200">
                                {plan.price === 0 ? 'Miễn phí' : `$${plan.price}`}
                            </span>
                            {plan.price > 0 && (
                                <span className="text-gray-400 text-sm">/tháng</span>
                            )}
                        </div>

                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <svg className={`w-5 h-5 flex-shrink-0 ${plan.id === 'free' ? 'text-gray-500' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onSelectPlan(plan.id)}
                            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${plan.buttonClass}`}
                        >
                            {plan.buttonText}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Skip Link */}
            <div className="text-center">
                <button
                    onClick={onSkip}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                    Bỏ qua, tôi sẽ quyết định sau
                </button>
            </div>
        </div>
    );
};

// Checkout Step
const CheckoutStep = ({ plan, selectedPlan, billingCycle, setBillingCycle, price, loading, onCheckout, onBack }) => {
    return (
        <div className="p-8">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-200 mb-6">Tóm tắt đơn hàng</h2>

                    <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-200">{plan?.name} Plan</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedPlan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                                {selectedPlan === 'pro' ? 'Tốt nhất' : 'Phổ biến'}
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {plan?.features?.slice(0, 5).map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Billing Cycle */}
                    <div className="mb-6">
                        <label className="text-gray-400 text-sm mb-2 block">Chu kỳ thanh toán</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                                    billingCycle === 'monthly' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                }`}
                            >
                                Hàng tháng
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`flex-1 py-3 rounded-xl font-medium transition-all relative ${
                                    billingCycle === 'yearly' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                }`}
                            >
                                Hàng năm
                                <span className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">
                                    -17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-slate-700 pt-6">
                        <div className="flex justify-between text-gray-200 text-xl font-bold">
                            <span>Tổng cộng</span>
                            <span>${price?.toFixed(2)}/{billingCycle === 'yearly' ? 'năm' : 'tháng'}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin thanh toán</h2>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-800">Chế độ Demo</p>
                                <p className="text-sm text-yellow-700">Đây là demo. Không có thanh toán thực sự.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); onCheckout(); }}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-600 text-sm mb-2 block">Số thẻ</label>
                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-600 text-sm mb-2 block">Ngày hết hạn</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-600 text-sm mb-2 block">CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                `Thanh toán $${price?.toFixed(2)}`
                            )}
                        </button>

                        <p className="text-center text-gray-500 text-sm mt-4">
                            🔒 Thanh toán được bảo mật bởi SSL
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgradeModal;
