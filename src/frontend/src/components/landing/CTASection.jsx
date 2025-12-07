import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="bg-green-900 py-20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
                    Ready to Master English Speaking?
                </h2>
                <p className="text-xl text-green-100 mb-10">
                    Start your journey today with our AI-powered coach. Join for free and see the difference.
                </p>
                <Link
                    to="/signup"
                    className="inline-block px-10 py-4 bg-white text-green-900 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition duration-300 ease-in-out text-lg"
                >
                    Get Started Now
                </Link>
                <p className="mt-4 text-sm text-green-200">
                    No credit card required for free trial.
                </p>
            </div>
        </section>
    );
};

export default CTASection;
