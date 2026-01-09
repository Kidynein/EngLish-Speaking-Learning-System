import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import HeroSection from '../components/landing/HeroSection';
import FeatureSection from '../components/landing/FeatureSection';
import TestimonialSection from '../components/landing/TestimonialSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
    const { setOverrideTheme } = useTheme();

    // Scroll to top on mount && Force Dark Theme
    useEffect(() => {
        window.scrollTo(0, 0);

        // Force dark theme for Landing Page
        setOverrideTheme('dark');

        // Cleanup: remove override when unmounting (leaving page)
        return () => {
            setOverrideTheme(null);
        };
    }, [setOverrideTheme]);

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
