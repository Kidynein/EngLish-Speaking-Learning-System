import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PracticeSessionLayout from "../components/practice/PracticeSessionLayout";
import ProgressBar from "../components/practice/ProgressBar";
import RecordButton from "../components/practice/RecordButton";
import FeedbackSheet from "../components/practice/FeedbackSheet";
import exerciseService from "../services/exercise.service";
import practiceSessionService from "../services/practiceSession.service";
import { toast } from "react-toastify";

// Import hooks and utilities
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useAudioRecorder from "../hooks/useAudioRecorder";
import { calculateScore, generateFeedback } from "../utils/scoringUtils";
import { analyzePronunciation } from "../services/assessment.service";

// Feature flag for AI assessment (set to true to use Gemini API)
// Set to false if Gemini API quota is exceeded
const USE_AI_ASSESSMENT = true;

function PracticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { exercises, sessionId } = location.state || {};

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ score: 0, feedback: "", wordFeedback: [] });
    const [accumulatedScore, setAccumulatedScore] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // ========== PREVENT DOUBLE SUBMISSIONS ==========
    // Ref to track if AI request is in flight (persists across renders)
    const isAnalyzingRef = useRef(false);
    // Ref to prevent React Strict Mode double-invocation
    const hasProcessedBlobRef = useRef(false);

    // Use the speech recognition hook (for real-time transcript display)
    const {
        isRecording: isSpeechRecording,
        transcript,
        interimTranscript,
        startRecording: startSpeechRecording,
        stopRecording: stopSpeechRecording,
        resetTranscript,
        error: speechError,
        isSupported: isSpeechSupported
    } = useSpeechRecognition();

    // Use the audio recorder hook (for AI assessment)
    const {
        isRecording: isAudioRecording,
        audioBlob,
        startRecording: startAudioRecording,
        stopRecording: stopAudioRecording,
        resetRecording: resetAudioRecording,
        error: audioError,
        isSupported: isAudioSupported
    } = useAudioRecorder();

    // Combined recording state
    const isRecording = USE_AI_ASSESSMENT ? isAudioRecording : isSpeechRecording;
    const isSupported = USE_AI_ASSESSMENT ? isAudioSupported : isSpeechSupported;

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

    // Show errors to user
    useEffect(() => {
        const error = speechError || audioError;
        if (error) {
            toast.error(error);
        }
    }, [speechError, audioError]);

    const currentExercise = exercises && exercises.length > 0 ? exercises[currentIndex] : null;
    const targetText = currentExercise?.contentText || currentExercise?.content_text || "";

    const handleToggleRecording = () => {
        // ========== PREVENT INTERACTION WHILE PROCESSING ==========
        if (isProcessing || isAnalyzingRef.current) {
            console.log('[Recording] ⚠️ Cannot toggle - still processing previous recording');
            toast.info("Please wait, processing your recording...");
            return;
        }
        
        if (!isRecording) {
            // Start recording
            console.log('[Recording] 🎤 Starting new recording...');
            resetTranscript();
            hasProcessedBlobRef.current = false; // Reset for new recording
            if (USE_AI_ASSESSMENT) {
                resetAudioRecording();
                startAudioRecording();
                // Also start speech recognition for real-time feedback
                startSpeechRecording();
            } else {
                startSpeechRecording();
            }
        } else {
            // Stop recording
            console.log('[Recording] 🛑 Stopping recording...');
            if (USE_AI_ASSESSMENT) {
                stopAudioRecording();
                stopSpeechRecording();
            } else {
                stopSpeechRecording();
            }
        }
    };

    // Process recording when audio blob is ready (AI mode)
    // Uses refs to prevent double-invocation from React Strict Mode
    useEffect(() => {
        // Guard: Only process if we have a new blob and not already processing
        if (USE_AI_ASSESSMENT && audioBlob && !isRecording && !hasProcessedBlobRef.current && !isAnalyzingRef.current) {
            hasProcessedBlobRef.current = true; // Mark as processed
            processAIAssessment();
        }
    }, [audioBlob, isRecording]);

    // Reset the processed flag when recording starts
    useEffect(() => {
        if (isRecording) {
            hasProcessedBlobRef.current = false;
        }
    }, [isRecording]);

    // Process recording when speech recognition stops (fallback mode)
    useEffect(() => {
        if (!USE_AI_ASSESSMENT && !isSpeechRecording && transcript && !showFeedback) {
            processLocalScoring();
        }
    }, [isSpeechRecording, transcript]);

    // AI-powered assessment using Gemini
    const processAIAssessment = async () => {
        // ========== DOUBLE SUBMISSION GUARD ==========
        if (!audioBlob) {
            console.log('[AI] No audio blob, skipping...');
            return;
        }
        
        if (isAnalyzingRef.current) {
            console.log('[AI] ⚠️ Request already in flight, preventing double submission');
            return;
        }
        
        // Lock the request
        isAnalyzingRef.current = true;
        setIsProcessing(true);
        
        console.log('[AI] 🎯 Starting AI assessment (locked)...');
        
        try {
            console.log(`[AI] Sending audio to Gemini: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            const response = await analyzePronunciation(audioBlob, targetText);
            
            if (response.success && response.data?.assessment) {
                const assessment = response.data.assessment;
                
                // Map Gemini response to our format
                const scoreData = {
                    overallScore: assessment.overall_score,
                    pronunciationScore: assessment.scores.pronunciation,
                    fluencyScore: assessment.scores.fluency,
                    confidenceScore: assessment.scores.confidence,
                    feedback: assessment.word_analysis.map(w => ({
                        word: w.word,
                        status: w.is_correct ? 'correct' : 'incorrect',
                        expected: w.word,
                        spoken: w.heard_as,
                        ipa: w.ipa_target,
                        errorType: w.error_type
                    }))
                };

                // Use AI-generated feedback message
                const feedbackMessage = assessment.feedback_message;

                // Accumulate score
                setAccumulatedScore(prev => prev + scoreData.overallScore);

                // Save attempt to backend
                await saveAttempt(scoreData, feedbackMessage, transcript);

                // Update UI
                setFeedbackData({
                    score: scoreData.overallScore,
                    feedback: feedbackMessage,
                    wordFeedback: scoreData.feedback,
                    transcript: transcript || "(Transcribed by AI)",
                    scoreDetails: {
                        pronunciation: scoreData.pronunciationScore,
                        fluency: scoreData.fluencyScore,
                        confidence: scoreData.confidenceScore
                    }
                });
                setShowFeedback(true);
            } else {
                throw new Error("Invalid response from AI");
            }
        } catch (error) {
            console.error("[AI] ❌ Assessment failed:", error.message);
            
            // Show specific error messages based on error type
            if (error.message?.includes('quota') || error.message?.includes('429')) {
                toast.error("AI service quota exceeded. Please try again later.");
            } else if (error.message?.includes('API key')) {
                toast.error("AI service configuration error.");
            } else {
                toast.warning("AI assessment unavailable, using local scoring.");
            }
            
            processLocalScoring();
        } finally {
            // ========== UNLOCK REQUEST ==========
            isAnalyzingRef.current = false;
            setIsProcessing(false);
            console.log('[AI] 🔓 Request completed (unlocked)');
        }
    };

    // Local scoring fallback (Web Speech API only)
    const processLocalScoring = async () => {
        setIsProcessing(true);

        const finalTranscript = transcript || interimTranscript;

        // Calculate scores using local utility
        const scoreData = calculateScore(targetText, finalTranscript);

        // Generate feedback message (local)
        const feedbackMessage = generateFeedback(scoreData);

        // Accumulate score
        setAccumulatedScore(prev => prev + scoreData.overallScore);

        // Save attempt
        await saveAttempt(scoreData, feedbackMessage, finalTranscript);

        // Update UI
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
    };

    // Helper to save attempt to backend
    const saveAttempt = async (scoreData, feedbackMessage, userTranscript) => {
        if (!sessionId || !currentExercise) return;

        const attemptData = {
            sessionId,
            exerciseId: currentExercise.exercise_id || currentExercise.id,
            userAudioUrl: null,
            scoreOverall: scoreData.overallScore,
            scorePronunciation: scoreData.pronunciationScore,
            scoreFluency: scoreData.fluencyScore,
            scoreConfidence: scoreData.confidenceScore,
            aiFeedbackJson: JSON.stringify({
                transcript: userTranscript,
                targetText: targetText,
                wordFeedback: scoreData.feedback,
                feedbackMessage: feedbackMessage
            })
        };

        try {
            await exerciseService.submitAttempt(attemptData);
            console.log("Attempt saved successfully");
        } catch (err) {
            console.error("Failed to save attempt:", err);
            toast.warning("Failed to save attempt to server");
        }
    };

    const handleNext = async () => {
        // Reset state for next sentence
        setShowFeedback(false);
        resetTranscript();
        // Reset refs to allow new recording
        hasProcessedBlobRef.current = false;
        isAnalyzingRef.current = false;
        if (USE_AI_ASSESSMENT) {
            resetAudioRecording();
        }

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
        if (USE_AI_ASSESSMENT) {
            resetAudioRecording();
        }
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
