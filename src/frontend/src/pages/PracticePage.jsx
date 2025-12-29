import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PracticeSessionLayout from "../components/practice/PracticeSessionLayout";
import ProgressBar from "../components/practice/ProgressBar";
import RecordButton from "../components/practice/RecordButton";
import FeedbackSheet from "../components/practice/FeedbackSheet";
import exerciseService from "../services/exercise.service";
import practiceSessionService from "../services/practiceSession.service";
import { toast } from "react-toastify";

// Import the new hook and utilities
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import { calculateScore, generateFeedback } from "../utils/scoringUtils";

function PracticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { exercises, sessionId } = location.state || {};

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ score: 0, feedback: "", wordFeedback: [] });
    const [accumulatedScore, setAccumulatedScore] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Use the speech recognition hook
    const {
        isRecording,
        transcript,
        interimTranscript,
        startRecording,
        stopRecording,
        resetTranscript,
        error: speechError,
        isSupported
    } = useSpeechRecognition();

    // Validate state on mount
    useEffect(() => {
        if (!exercises || exercises.length === 0) {
            toast.error("No exercises found. Returning to dashboard.");
            navigate("/dashboard");
        }

        if (!isSupported) {
            toast.error("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
        }
    }, [exercises, navigate, isSupported]);

    // Show speech errors to user
    useEffect(() => {
        if (speechError) {
            toast.error(speechError);
        }
    }, [speechError]);

    const currentExercise = exercises && exercises.length > 0 ? exercises[currentIndex] : null;
    const targetText = currentExercise?.contentText || currentExercise?.content_text || "";

    const handleToggleRecording = () => {
        if (!isRecording) {
            // Start recording
            resetTranscript();
            startRecording();
        } else {
            // Stop recording and process result
            stopRecording();
            processRecording();
        }
    };

    const processRecording = async () => {
        setIsProcessing(true);

        // Wait a moment for final transcript to be set
        setTimeout(async () => {
            const finalTranscript = transcript || interimTranscript;

            // Calculate scores using the utility function
            const scoreData = calculateScore(targetText, finalTranscript);

            // Generate feedback message
            const feedbackMessage = generateFeedback(scoreData);

            // Accumulate score
            setAccumulatedScore(prev => prev + scoreData.overallScore);

            // Prepare data for backend (map to ERD columns)
            const attemptData = {
                sessionId,
                exerciseId: currentExercise.exercise_id || currentExercise.id,
                userAudioUrl: null, // We're using Web Speech API, no audio file
                scoreOverall: scoreData.overallScore,
                scorePronunciation: scoreData.pronunciationScore,
                scoreFluency: scoreData.fluencyScore,
                scoreConfidence: scoreData.confidenceScore,
                aiFeedbackJson: JSON.stringify({
                    transcript: finalTranscript,
                    targetText: targetText,
                    wordFeedback: scoreData.feedback,
                    correctWords: scoreData.correctWords,
                    totalWords: scoreData.wordCount
                })
            };

            // Save attempt to Backend if session is active
            if (sessionId && currentExercise) {
                try {
                    await exerciseService.submitAttempt(attemptData);
                    console.log("Attempt saved successfully");
                } catch (err) {
                    console.error("Failed to save attempt:", err);
                    toast.warning("Failed to save attempt to server");
                }
            }

            // Update UI with feedback
            setFeedbackData({
                score: scoreData.overallScore,
                feedback: feedbackMessage,
                wordFeedback: scoreData.feedback,
                transcript: finalTranscript,
                scoreDetails: {
                    pronunciation: scoreData.pronunciationScore,
                    fluency: scoreData.fluencyScore,
                    confidence: scoreData.confidenceScore
                }
            });
            setShowFeedback(true);
            setIsProcessing(false);
        }, 500);
    };

    const handleNext = async () => {
        // Reset state for next sentence
        setShowFeedback(false);
        resetTranscript();

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
    };

    const handleRetry = () => {
        setShowFeedback(false);
        resetTranscript();
    };

    if (!currentExercise) return null;

    // Combine final and interim transcripts for display
    const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

    return (
        <PracticeSessionLayout>
            {/* Top Bar: Back Button & Progress */}
            <div className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between w-full max-w-4xl mx-auto z-20">
                <Link to="/dashboard" className="text-emerald-700 hover:bg-emerald-100 p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Link>
                <div className="flex-1 max-w-xs mx-4">
                    <ProgressBar current={currentIndex + 1} total={exercises.length} />
                </div>
                <div className="w-10" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-12 w-full mt-24 px-6">
                {/* Target Sentence Display */}
                <div className="text-center max-w-3xl">
                    <h2 className="text-4xl uppercase tracking-wider text-emerald-600 font-semibold mb-4">
                        Read this sentence
                    </h2>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                        {targetText}
                    </p>
                    {currentExercise.ipaTranscription && (
                        <p className="text-lg text-gray-500 mt-4 font-mono">
                            /{currentExercise.ipaTranscription}/
                        </p>
                    )}
                </div>

                {/* Real-time Transcript Display */}
                {(isRecording || displayTranscript) && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-3xl w-full">
                        <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-2">
                            You said:
                        </p>
                        <p className="text-2xl text-gray-800 min-h-[60px]">
                            <span className="font-medium">{transcript}</span>
                            {interimTranscript && (
                                <span className="text-gray-400 italic"> {interimTranscript}</span>
                            )}
                            {isRecording && !displayTranscript && (
                                <span className="text-gray-400 animate-pulse">Listening...</span>
                            )}
                        </p>
                    </div>
                )}

                {/* Record Button */}
                <div className="flex flex-col items-center gap-4">
                    <RecordButton
                        isRecording={isRecording}
                        onToggle={handleToggleRecording}
                        disabled={isProcessing || !isSupported}
                    />
                    <p className="text-gray-500 font-medium">
                        {isProcessing ? (
                            <span className="animate-pulse">Processing...</span>
                        ) : isRecording ? (
                            "Tap to stop recording"
                        ) : (
                            "Tap microphone to start"
                        )}
                    </p>
                </div>
            </div>

            {/* Feedback Overlay with Word-Level Details */}
            <FeedbackSheet
                isOpen={showFeedback}
                score={feedbackData.score}
                feedback={feedbackData.feedback}
                onNext={handleNext}
                onRetry={handleRetry}
                wordFeedback={feedbackData.wordFeedback}
                scoreDetails={feedbackData.scoreDetails}
                transcript={feedbackData.transcript}
                targetText={targetText}
            />
        </PracticeSessionLayout>
    );
}

export default PracticePage;
