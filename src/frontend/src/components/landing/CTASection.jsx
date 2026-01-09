import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASection = () => {
    return (
        <section className="bg-slate-900 py-20 relative overflow-hidden">
            {/* Background decoration - using brand colors */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20"
                />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                        Ready to Master English Speaking?
                    </h2>
                    <p className="text-xl text-slate-300 mb-10">
                        Start your journey today with our AI-powered coach. Join for free and see the difference.
                    </p>
                    <Link
                        to="/signup"
                        component={motion.a}
                    >
                        <motion.span
                            className="inline-block px-10 py-4 bg-brand-primary text-slate-900 font-bold rounded-full shadow-lg hover:bg-brand-primary-dark transition-colors duration-300 ease-in-out text-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                boxShadow: ["0 10px 15px -3px rgba(16, 185, 129, 0.3)", "0 10px 15px -3px rgba(16, 185, 129, 0.6)", "0 10px 15px -3px rgba(16, 185, 129, 0.3)"]
                            }}
                            transition={{
                                boxShadow: { duration: 2, repeat: Infinity }
                            }}
                        >
                            Get Started Now
                        </motion.span>
                    </Link>
                    <p className="mt-4 text-sm text-slate-400">
                        No credit card required for free trial.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
