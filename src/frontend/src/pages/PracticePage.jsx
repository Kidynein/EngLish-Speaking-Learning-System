import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PracticeSessionLayout from "../components/practice/PracticeSessionLayout";
import ProgressBar from "../components/practice/ProgressBar";
import HeroText from "../components/practice/HeroText";
import RecordButton from "../components/practice/RecordButton";
import FeedbackSheet from "../components/practice/FeedbackSheet";

const SAMPLE_SENTENCES = [
    "The quick brown fox jumps over the lazy dog.",
    "She sells seashells by the seashore.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
    "Practice makes perfect when you are learning a new language.",
    "Good morning, how are you doing today?"
];

function PracticePage() {
    const navigate = useNavigate();
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ score: 0, feedback: "" });

    // Reset when sentence changes
    useEffect(() => {
        setShowFeedback(false);
        setIsRecording(false);
    }, [currentSentenceIndex]);

    const handleToggleRecording = () => {
        if (!isRecording) {
            // Start recording
            setIsRecording(true);

            // Simulate recording duration then show feedback automatically for demo
            setTimeout(() => {
                setIsRecording(false);
                const randomScore = Math.floor(Math.random() * 20) + 80; // 80-99
                setFeedbackData({
                    score: randomScore,
                    feedback: randomScore > 90
                        ? "Excellent pronunciation! Your intonation was very natural."
                        : "Great job! Try to enunciate the vowels a bit more clearly next time."
                });
                setShowFeedback(true);
            }, 3000);
        } else {
            // Stop manually (though logic above handles auto-stop for demo)
            setIsRecording(false);
        }
    };

    const handleNext = () => {
        if (currentSentenceIndex < SAMPLE_SENTENCES.length - 1) {
            setCurrentSentenceIndex(prev => prev + 1);
        } else {
            // Finished all sentences, go back to dashboard
            navigate("/dashboard");
        }
    };

    const handleRetry = () => {
        setShowFeedback(false);
    };

    return (
        <PracticeSessionLayout>
            {/* Top Bar: Back Button & Progress (Absolute or Flex) */}
            <div className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between w-full max-w-4xl mx-auto z-20">
                <Link to="/dashboard" className="text-emerald-700 hover:bg-emerald-100 p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>
                <div className="flex-1 max-w-xs mx-4">
                    <ProgressBar current={currentSentenceIndex + 1} total={SAMPLE_SENTENCES.length} />
                </div>
                <div className="w-10" /> {/* Spacer for balance */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-12 sm:gap-16 w-full mt-10">
                <HeroText text={SAMPLE_SENTENCES[currentSentenceIndex]} />

                <RecordButton
                    isRecording={isRecording}
                    onToggle={handleToggleRecording}
                />

                <p className="text-gray-500 font-medium animate-pulse">
                    {isRecording ? "Listening..." : "Tap microphone to start"}
                </p>
            </div>

            {/* Feedback Overlay */}
            <FeedbackSheet
                isOpen={showFeedback}
                score={feedbackData.score}
                feedback={feedbackData.feedback}
                onNext={handleNext}
                onRetry={handleRetry}
            />
        </PracticeSessionLayout>
    );
}

export default PracticePage;
