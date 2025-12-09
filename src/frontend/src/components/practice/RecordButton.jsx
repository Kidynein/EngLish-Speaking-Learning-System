import { motion, AnimatePresence } from 'framer-motion';

const RecordButton = ({ isRecording, onToggle }) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* Ripple Waves - Only active when recording */}
            <AnimatePresence>
                {isRecording && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-24 h-24 rounded-full border border-emerald-400/50"
                                initial={{ scale: 1, opacity: 1 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.6,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main Interactive Button */}
            <button
                onClick={onToggle}
                className={`
          relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 outline-none
          ${isRecording
                        ? 'bg-red-500 shadow-inner'
                        : 'bg-white shadow-[8px_8px_16px_#d1fae5,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1fae5,-4px_-4px_8px_#ffffff] hover:scale-105'
                    }
        `}
            >
                <div className={`transition-all duration-300 ${isRecording ? 'text-white' : 'text-emerald-600'}`}>
                    {/* Icon: Mic or Stop Square */}
                    {isRecording ? (
                        <div className="w-8 h-8 bg-white rounded-md" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </div>
            </button>
        </div>
    );
};

export default RecordButton;
