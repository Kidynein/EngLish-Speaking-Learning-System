import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PremiumPromoBanner = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-800 to-indigo-900 [.light-theme_&]:from-purple-300 [.light-theme_&]:to-pink-300 shadow-xl mb-8"
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 [.light-theme_&]:bg-white/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 px-8 py-8 md:px-12 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        Premium Access
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                        Unlock Your Full Potential
                    </h2>
                    <p className="text-indigo-100 max-w-md text-base md:text-lg font-semibold [.light-theme_&]:text-purple-900">
                        Get unlimited AI feedback, advanced topics, and personalized coaching to master English faster.
                    </p>
                </div>

                <div className="flex-shrink-0">
                    <Link
                        to="/premium"
                        className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-indigo-900 bg-white rounded-full overflow-hidden transition-transform transform hover:scale-105 shadow-lg hover:shadow-white/20"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                        <span className="relative flex items-center gap-2">
                            Upgrade Now
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default PremiumPromoBanner;
