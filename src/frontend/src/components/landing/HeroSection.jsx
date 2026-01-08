import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
    return (
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:pt-32 lg:pb-48 flex flex-col-reverse lg:flex-row items-center">

                {/* Text Content */}
                <div className="w-full lg:w-5/12 z-10 text-center lg:text-left mt-12 lg:mt-0">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                        <span className="block">Speak English</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                            Like a Native
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                        Your personal AI English coach. Get instant feedback on your pronunciation, intonation, and fluency. Practice anytime, anywhere.
                    </p>
                    <div className="flex flex-col gap-4 justify-center lg:justify-start items-center lg:items-start">
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto px-8 py-4 bg-brand-primary text-slate-900 font-bold rounded-full shadow-lg hover:bg-brand-primary-dark hover:scale-105 transition-all duration-300 ease-in-out text-lg text-center"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="text-brand-tertiary hover:text-brand-tertiary-light font-medium transition-all duration-300 ease-in-out text-base underline decoration-brand-tertiary/50 hover:decoration-brand-tertiary underline-offset-4"
                        >
                            Already have an account? Let's start learning!
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center lg:justify-start space-x-4 text-sm text-slate-400">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-brand-secondary mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>4.8/5 Rating</span>
                        </div>
                        <span>•</span>
                        <span>10M+ Downloads</span>
                    </div>
                </div>

                {/* Image Content */}
                <div className="w-full lg:w-7/12 relative z-10 lg:pl-12">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
                        <img
                            src="/assets/app_screenshot.png"
                            alt="App Screenshot"
                            className="w-full h-auto object-cover"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                    </div>
                    {/* Decorative Elements - Using brand colors */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-brand-secondary rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>

            {/* Wave Separator */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#1e293b" fillOpacity="1" d="M0,224L48,234.7C96,245,192,267,288,266.7C384,267,480,245,576,234.7C672,224,768,224,864,234.7C960,245,1056,267,1152,261.3C1248,256,1344,224,1392,208L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
