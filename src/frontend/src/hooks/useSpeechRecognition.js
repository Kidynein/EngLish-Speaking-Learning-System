import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API integration
 * Handles browser compatibility (webkit prefix)
 * Distinguishes between interim and final results for real-time display
 * 
 * @returns {Object} { isRecording, transcript, interimTranscript, startRecording, stopRecording, resetTranscript, error, isSupported }
 */
const useSpeechRecognition = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState(''); // Final transcript
    const [interimTranscript, setInterimTranscript] = useState(''); // Interim (real-time) transcript
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;

    // Initialize Speech Recognition on mount (only once)
    useEffect(() => {
        if (!isSupported) {
            setError('Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        const recognition = new SpeechRecognition();

        // Configuration
        recognition.continuous = true; // Keep listening until explicitly stopped
        recognition.interimResults = true; // Get interim results for real-time display
        recognition.lang = 'en-US'; // Set language (can be made configurable)
        recognition.maxAlternatives = 1; // Only get the best match

        // Event: Result received
        recognition.onresult = (event) => {
            let interimText = '';
            let finalText = '';

            // Loop through results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcriptPart = result[0].transcript;

                if (result.isFinal) {
                    finalText += transcriptPart + ' ';
                } else {
                    interimText += transcriptPart;
                }
            }

            // Update state
            if (finalText) {
                setTranscript((prev) => prev + finalText);
            }
            setInterimTranscript(interimText);
        };

        // Event: Error occurred
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            // Map error types to user-friendly messages
            const errorMessages = {
                'no-speech': 'No speech detected. Please try again.',
                'audio-capture': 'Microphone not accessible. Please check permissions.',
                'not-allowed': 'Microphone access denied. Please enable microphone permissions.',
                'network': 'Network error. Please check your connection.',
                'aborted': 'Speech recognition aborted.',
                'language-not-supported': 'Language not supported.'
            };

            setError(errorMessages[event.error] || `Error: ${event.error}`);
            setIsRecording(false);
        };

        // Event: Recognition ended (e.g., user stopped talking)
        recognition.onend = () => {
            // If we're still supposed to be recording, restart it
            // This handles auto-stop when user pauses for too long
            if (isRecording) {
                try {
                    recognition.start();
                } catch (err) {
                    console.log('Recognition already started or stopped intentionally');
                }
            }
        };

        // Store reference
        recognitionRef.current = recognition;

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, [isSupported]); // Only recreate if support changes (which it won't)

    // Start recording
    const startRecording = useCallback(() => {
        if (!isSupported) {
            setError('Speech Recognition not supported');
            return;
        }

        setError(null);
        setTranscript('');
        setInterimTranscript('');

        try {
            recognitionRef.current?.start();
            setIsRecording(true);
        } catch (err) {
            if (err.name === 'InvalidStateError') {
                // Already started, ignore
                setIsRecording(true);
            } else {
                setError('Failed to start recording: ' + err.message);
            }
        }
    }, [isSupported]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setInterimTranscript(''); // Clear interim text when stopping
        }
    }, []);

    // Reset transcript (useful for retrying)
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    return {
        isRecording,
        transcript: transcript.trim(), // Remove trailing spaces
        interimTranscript: interimTranscript.trim(),
        startRecording,
        stopRecording,
        resetTranscript,
        error,
        isSupported
    };
};

export default useSpeechRecognition;
