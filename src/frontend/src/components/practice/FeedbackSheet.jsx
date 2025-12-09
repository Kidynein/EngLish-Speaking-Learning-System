import { motion, AnimatePresence } from 'framer-motion';

const FeedbackSheet = ({ isOpen, score, feedback, onNext, onRetry }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none"
                >
                    <div
                        className="
              pointer-events-auto w-full max-w-2xl 
              backdrop-blur-xl bg-white/80 
              border border-white/60 
              shadow-2xl rounded-3xl 
              p-8 flex flex-col items-center gap-6
            "
                    >
                        {/* Drag Handle for visual affordance */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />

                        <div className="text-center">
                            <div className="text-6xl font-bold text-emerald-600 mb-2">
                                {score}%
                            </div>
                            <div className="text-sm font-medium text-emerald-800/60 uppercase tracking-widest">Accuracy Score</div>
                        </div>

                        <p className="text-gray-700 text-lg text-center font-medium leading-relaxed">
                            {feedback}
                        </p>

                        <div className="flex gap-4 w-full mt-2">
                            <button
                                onClick={onRetry}
                                className="flex-1 py-3.5 bg-white border border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
                            >
                                Retry
                            </button>
                            <button
                                onClick={onNext}
                                className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                            >
                                Next Sentence
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackSheet;
