import { motion, AnimatePresence } from 'framer-motion';

const FeedbackSheet = ({
    isOpen,
    score,
    feedback,
    onNext,
    onRetry,
    wordFeedback = [],
    scoreDetails = {},
    transcript = '',
    targetText = ''
}) => {
    // Determine color based on score
    const getScoreColor = (scoreValue) => {
        if (scoreValue >= 90) return 'text-emerald-600';
        if (scoreValue >= 70) return 'text-blue-600';
        if (scoreValue >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Get word styling based on status
    const getWordStyle = (status) => {
        switch (status) {
            case 'correct':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'incorrect':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'missing':
                return 'bg-gray-100 text-gray-500 border-gray-300 line-through';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none max-h-[90vh] overflow-y-auto"
                >
                    <div
                        className="
                            pointer-events-auto w-full max-w-3xl 
                            backdrop-blur-xl bg-white/95 
                            border border-white/60 
                            shadow-2xl rounded-3xl 
                            p-6 sm:p-8 flex flex-col items-center gap-6
                        "
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />

                        {/* Score Display */}
                        <div className="text-center">
                            <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                                {score}%
                            </div>
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                                Overall Score
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        {scoreDetails && Object.keys(scoreDetails).length > 0 && (
                            <div className="grid grid-cols-3 gap-3 w-full">
                                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {scoreDetails.pronunciation || 0}%
                                    </div>
                                    <div className="text-xs text-blue-700 font-medium mt-1">
                                        Pronunciation
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-200">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {scoreDetails.fluency || 0}%
                                    </div>
                                    <div className="text-xs text-purple-700 font-medium mt-1">
                                        Fluency
                                    </div>
                                </div>
                                <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-200">
                                    <div className="text-2xl font-bold text-pink-600">
                                        {scoreDetails.confidence || 0}%
                                    </div>
                                    <div className="text-xs text-pink-700 font-medium mt-1">
                                        Confidence
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Feedback Message */}
                        <p className="text-gray-700 text-lg text-center font-medium leading-relaxed">
                            {feedback}
                        </p>

                        {/* Word-Level Feedback */}
                        {wordFeedback && wordFeedback.length > 0 && (
                            <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Word Analysis
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {wordFeedback.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`
                                                px-3 py-2 rounded-lg border-2 font-medium text-sm
                                                ${getWordStyle(item.status)}
                                                transition-all duration-200
                                            `}
                                            title={
                                                item.status === 'incorrect' || item.status === 'partial'
                                                    ? `Expected: ${item.expected}, You said: ${item.spoken || 'nothing'}`
                                                    : item.status === 'missing'
                                                        ? `Missing word: ${item.expected}`
                                                        : 'Correct!'
                                            }
                                        >
                                            {item.word}
                                            {item.status === 'incorrect' && item.spoken && (
                                                <span className="text-xs ml-1">
                                                    (said: {item.spoken})
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap gap-4 mt-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                                        <span className="text-gray-600">Correct</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                                        <span className="text-gray-600">Partial</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
                                        <span className="text-gray-600">Incorrect</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded"></div>
                                        <span className="text-gray-600">Missing</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Transcript Comparison */}
                        {transcript && (
                            <div className="w-full space-y-3">
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                                        You Said:
                                    </h4>
                                    <p className="text-gray-800 font-medium">
                                        {transcript || '(No speech detected)'}
                                    </p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                                        Target Sentence:
                                    </h4>
                                    <p className="text-gray-800 font-medium">
                                        {targetText}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 w-full mt-2">
                            <button
                                onClick={onRetry}
                                className="flex-1 py-3.5 bg-white border-2 border-emerald-300 text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                            >
                                🔄 Retry
                            </button>
                            <button
                                onClick={onNext}
                                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700 transition-all"
                            >
                                Next Sentence →
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackSheet;

