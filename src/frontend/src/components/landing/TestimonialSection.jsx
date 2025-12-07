import React from 'react';

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Marketing Director",
        content: "I've tried many apps, but this one is the best. My pronunciation has improved significantly in just 3 weeks!",
        avatar: "/assets/avatar_sarah.png"
    },
    {
        name: "Michael Chen",
        role: "Software Engineer",
        content: "The AI feedback is incredible. It's like having a personal tutor available 24/7. Highly recommended!",
        avatar: "/assets/avatar_michael.png"
    },
    {
        name: "Elena Rodriguez",
        role: "Student",
        content: "I used to be afraid of speaking English. Now I feel confident and can hold conversations easily.",
        avatar: "/assets/avatar_elena.png"
    }
];

const TestimonialSection = () => {
    return (
        <section className="py-20 bg-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-green-900 sm:text-4xl">
                        Loved by English Learners Worldwide
                    </h2>
                    <p className="mt-4 text-xl text-green-700">
                        Join thousands of users who have transformed their English speaking skills.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center mb-6">
                                <img
                                    className="h-12 w-12 rounded-full object-cover mr-4"
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                />
                                <div>
                                    <h4 className="text-lg font-bold text-green-900">{testimonial.name}</h4>
                                    <p className="text-sm text-green-600">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">"{testimonial.content}"</p>
                            <div className="mt-4 flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
