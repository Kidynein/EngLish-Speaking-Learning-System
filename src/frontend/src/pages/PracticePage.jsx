import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PracticeSessionLayout from "../components/practice/PracticeSessionLayout";
import ProgressBar from "../components/practice/ProgressBar";
import HeroText from "../components/practice/HeroText";
import RecordButton from "../components/practice/RecordButton";
import FeedbackSheet from "../components/practice/FeedbackSheet";
import exerciseService from "../services/exercise.service"; // Add import

import practiceSessionService from "../services/practiceSession.service";
import { toast } from "react-toastify";

function PracticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { exercises, sessionId } = location.state || {}; // topicId, lessonId also available

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ score: 0, feedback: "" });
    const [accumulatedScore, setAccumulatedScore] = useState(0);

    // Validate state on mount
    useEffect(() => {
        if (!exercises || exercises.length === 0) {
            toast.error("No exercises found. Returning to dashboard.");
            navigate("/dashboard");
        }
    }, [exercises, navigate]);

    const currentExercise = exercises && exercises.length > 0 ? exercises[currentIndex] : null;

    const handleToggleRecording = () => {
        if (!isRecording) {
            // Start recording
            setIsRecording(true);

            // Simulate recording duration then show feedback automatically for demo
            // In real app: Stop recording -> Upload Audio -> Get API Response
            setTimeout(async () => {
                setIsRecording(false);
                const randomScore = Math.floor(Math.random() * 20) + 80; // 80-99

                // Accumulate score
                setAccumulatedScore(prev => prev + randomScore);

                // Save attempt to Backend if session is active
                if (sessionId && currentExercise) {
                    try {
                        await exerciseService.submitAttempt({
                            sessionId,
                            exerciseId: currentExercise.id || currentExercise.exercise_id, // ensure ID is correct
                            userAudioUrl: "https://example.com/audio.mp3", // Mock URL
                            scoreOverall: randomScore,
                            scorePronunciation: randomScore,
                            scoreFluency: randomScore,
                            scoreConfidence: randomScore,
                            aiFeedbackJson: JSON.stringify({ feedback: "Great work!" })
                        });
                        console.log("Attempt saved successfully");
                    } catch (err) {
                        console.error("Failed to save attempt:", err);
                        // Don't block UI on attempt save failure for now
                    }
                }

                setFeedbackData({
                    score: randomScore,
                    feedback: randomScore > 90
                        ? "Excellent pronunciation! Your intonation was very natural."
                        : "Great job! Try to enunciate the vowels a bit more clearly next time."
                });
                setShowFeedback(true);
            }, 3000);
        } else {
            // Stop manually
            setIsRecording(false);
        }
    };

    const handleNext = async () => {
        // Reset state for next sentence
        setShowFeedback(false);
        setIsRecording(false);

        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished all sentences
            await finishSession();
        }
    };

    const finishSession = async () => {
        try {
            // Calculate final score
            const finalScore = Math.round(accumulatedScore / exercises.length);

            if (sessionId) {
                await practiceSessionService.endSession(sessionId, finalScore);
                toast.success(`Practice completed! Score: ${finalScore}`);
            } else {
                toast.success("Practice completed! (Session not tracked)");
            }
            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to end session:", error);
            toast.error("Failed to save session results.");
            navigate("/dashboard");
        }
    }

    const handleRetry = () => {
        setShowFeedback(false);
    };

    if (!currentExercise) return null; // Or loading spinner

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
                    <ProgressBar current={currentIndex + 1} total={exercises.length} />
                </div>
                <div className="w-10" /> {/* Spacer for balance */}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-12 sm:gap-16 w-full mt-10">
                <HeroText text={currentExercise.contentText || currentExercise.content_text} />

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
