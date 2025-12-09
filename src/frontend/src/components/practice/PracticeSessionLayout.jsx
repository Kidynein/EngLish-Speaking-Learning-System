import { motion } from 'framer-motion';

const PracticeSessionLayout = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-emerald-50 flex flex-col items-center justify-center p-6">
            {/* Animated Ambient Background - The "Breathing" Effect */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-green-200/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Content Container */}
            <main className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-16">
                {children}
            </main>
        </div>
    );
};

export default PracticeSessionLayout;
