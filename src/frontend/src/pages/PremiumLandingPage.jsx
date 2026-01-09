import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PREMIUM_PLANS } from '../context/PremiumContext';

// Hero Section Component
const HeroSection = () => {
    return (
        <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:pt-32 lg:pb-48">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
                    {/* Text Content */}
                    <motion.div 
                        className="w-full lg:w-5/12 z-10 text-center lg:text-left"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                            <span className="block">Speak English</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">
                                Like a Native
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                            Your personal AI English coach. Get instant feedback on your pronunciation, intonation, and fluency. Practice anytime, anywhere.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                            <Link
                                to="/signup"
                                className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 text-lg text-center"
                            >
                                Get Started Free
                            </Link>
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-emerald-400 font-medium transition duration-300 text-base"
                            >
                                Already have an account? Let's start learning!
                            </Link>
                        </div>

                        <div className="mt-10 flex items-center justify-center lg:justify-start space-x-6 text-sm">
                            <div className="flex items-center text-yellow-400">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-gray-300">4.8/5 Rating</span>
                            </div>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-300">10M+ Downloads</span>
                        </div>
                    </motion.div>

                    {/* App Screenshot */}
                    <motion.div 
                        className="w-full lg:w-7/12 relative z-10"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 border border-slate-700/50">
                                <img
                                    src="/assets/app_screenshot.png"
                                    alt="App Screenshot"
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div 
                                className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 shadow-xl"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                <div className="flex items-center gap-2 text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">95% Accuracy</span>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Instant Feedback</p>
                                        <p className="text-xs text-gray-500">Real-time corrections</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Wave Separator */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-white">
                    <path d="M0,224L48,234.7C96,245,192,267,288,266.7C384,267,480,245,576,234.7C672,224,768,224,864,234.7C960,245,1056,267,1152,261.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </section>
    );
};

// Feature Section Component
const FeatureSection = () => {
    const features = [
        {
            title: "AI Voice Recognition",
            description: "Our proprietary AI technology analyzes your speech with 95% accuracy, detecting even the smallest pronunciation errors.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            ),
            gradient: "from-emerald-400 to-green-500"
        },
        {
            title: "Instant Feedback",
            description: "Get real-time feedback on your pronunciation, intonation, and stress. Correct your mistakes instantly.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            gradient: "from-yellow-400 to-orange-500"
        },
        {
            title: "Personalized Learning",
            description: "Tailored lesson plans based on your proficiency level and learning goals. Improve faster with a customized path.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            gradient: "from-purple-400 to-pink-500"
        },
        {
            title: "200+ Topics",
            description: "Practice English for travel, business, daily life, and more. Learn vocabulary that is relevant to you.",
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: "from-cyan-400 to-blue-500"
        }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm font-semibold rounded-full mb-4">
                        WHY CHOOSE US
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        The World's Best English
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                            Pronunciation Coach
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Powered by advanced Artificial Intelligence to help you speak confidently.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="relative p-8 bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center h-full">
                                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Testimonial Section Component
const TestimonialSection = () => {
    const testimonials = [
        {
            name: "Sarah Jenkins",
            role: "Marketing Director",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            content: "I've tried many apps, but this one is the best. My pronunciation has improved significantly in just 3 weeks!",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Software Engineer",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            content: "The AI feedback is incredible. It's like having a personal tutor available 24/7. Highly recommended!",
            rating: 5
        },
        {
            name: "Elena Rodriguez",
            role: "Student",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            content: "I used to be afraid of speaking English. Now I feel confident and can hold conversations easily.",
            rating: 5
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Loved by English Learners
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                            Worldwide
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join thousands of users who have transformed their English speaking skills.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative bg-slate-800 p-8 rounded-3xl shadow-lg"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                                />
                                <div>
                                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                </div>
                            </div>

                            <p className="text-gray-300 italic mb-4">
                                "{testimonial.content}"
                            </p>

                            <div className="flex gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Pricing Section Component
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
            buttonStyle: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/30'
        },
        {
            ...PREMIUM_PLANS.PRO,
            highlight: false,
            badge: 'Best Value',
            buttonText: 'Go Pro',
            buttonStyle: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
        }
    ];

    const getPrice = (plan) => {
        if (plan.price === 0) return 'Free';
        const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
        return `$${price}`;
    };

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Choose Your
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400"> Learning Path</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Start for free and upgrade anytime. No credit card required.
                    </p>

                    <div className="inline-flex items-center bg-slate-700/50 rounded-full p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                billingCycle === 'monthly' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                billingCycle === 'yearly' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
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
                                    <span className={`px-4 py-1 text-sm font-bold rounded-full ${
                                        plan.highlight ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    }`}>
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className={`h-full p-8 rounded-3xl border ${
                                plan.highlight ? 'bg-white border-emerald-500/50 shadow-2xl' : 'bg-slate-800/50 border-slate-700'
                            }`}>
                                <div className="text-center mb-8">
                                    <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-gray-900' : 'text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className={`text-5xl font-extrabold ${plan.highlight ? 'text-gray-900' : 'text-white'}`}>
                                            {getPrice(plan)}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className={plan.highlight ? 'text-gray-500' : 'text-gray-400'}>
                                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-emerald-500' : 'text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className={`text-sm ${plan.highlight ? 'text-gray-600' : 'text-gray-300'}`}>
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
                    <div className="flex items-center justify-center gap-8 text-gray-400 text-sm">
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

// CTA Section Component
const CTASection = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Ready to Master
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                            English Speaking?
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Start your journey today with our AI-powered coach. Join for free and see the difference.
                    </p>

                    <Link
                        to="/signup"
                        className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-full shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-105 transition-all"
                    >
                        Get Started Now
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>

                    <p className="mt-6 text-gray-500 text-sm">
                        No credit card required for free trial.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// Footer Component
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">ELS System</span>
                        </div>
                        <p className="text-gray-400 mb-6 max-w-md">
                            The #1 AI-powered English speaking coach. Improve your pronunciation and fluency with instant feedback.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">For Business</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">For Schools</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Community</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Help Center</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 text-center">
                    <p className="text-sm">© {currentYear} ELS System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// Main Premium Landing Page
const PremiumLandingPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <main className="grow">
                <HeroSection />
                <FeatureSection />
                <TestimonialSection />
                <PricingSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default PremiumLandingPage;
