import React from 'react';

const features = [
    {
        title: "AI Voice Recognition",
        description: "Our proprietary AI technology analyzes your speech with 95% accuracy, detecting even the smallest pronunciation errors.",
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        ),
        colorClass: "bg-brand-primary/20 text-brand-primary"
    },
    {
        title: "Instant Feedback",
        description: "Get real-time feedback on your pronunciation, intonation, and stress. Correct your mistakes instantly.",
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        colorClass: "bg-brand-secondary/20 text-brand-secondary"
    },
    {
        title: "Personalized Learning",
        description: "Tailored lesson plans based on your proficiency level and learning goals. Improve faster with a customized path.",
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        colorClass: "bg-brand-tertiary/20 text-brand-tertiary"
    },
    {
        title: "200+ Topics",
        description: "Practice English for travel, business, daily life, and more. Learn vocabulary that is relevant to you.",
        icon: (
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        colorClass: "bg-brand-primary/20 text-brand-primary"
    }
];

const FeatureSection = () => {
    return (
        <section className="py-20 bg-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-brand-primary font-semibold tracking-wide uppercase">Why Choose Us</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                        The World's Best English Pronunciation Coach
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-slate-400 mx-auto">
                        Powered by advanced Artificial Intelligence to help you speak confidently.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="relative p-8 bg-slate-700/50 border border-slate-600 rounded-2xl shadow-sm hover:shadow-lg hover:border-brand-primary/50 transition-all duration-300 flex flex-col items-center text-center">
                            <div className={`flex items-center justify-center w-20 h-20 rounded-full ${feature.colorClass} mb-6`}>
                                {typeof feature.icon === 'string' ? (
                                    <img src={feature.icon} alt={feature.title} className="w-12 h-12 object-contain" />
                                ) : (
                                    feature.icon
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
