import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="bg-slate-900 py-20 relative overflow-hidden">
            {/* Background decoration - using brand colors */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                    Ready to Master English Speaking?
                </h2>
                <p className="text-xl text-slate-300 mb-10">
                    Start your journey today with our AI-powered coach. Join for free and see the difference.
                </p>
                <Link
                    to="/signup"
                    className="inline-block px-10 py-4 bg-brand-primary text-slate-900 font-bold rounded-full shadow-lg hover:bg-brand-primary-dark hover:scale-105 transition-all duration-300 ease-in-out text-lg"
                >
                    Get Started Now
                </Link>
                <p className="mt-4 text-sm text-slate-400">
                    No credit card required for free trial.
                </p>
            </div>
        </section>
    );
};

export default CTASection;
