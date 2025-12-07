import React, { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeatureSection from '../components/landing/FeatureSection';
import TestimonialSection from '../components/landing/TestimonialSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <main className="grow">
                <HeroSection />
                <FeatureSection />
                <TestimonialSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
