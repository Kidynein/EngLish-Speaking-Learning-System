import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for audio recording using MediaRecorder API
 * Records audio and returns a Blob that can be sent to the backend for AI analysis
 * Includes silence detection - auto-stops after 4 seconds of silence
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.silenceTimeout - Timeout in ms before auto-stop (default: 4000)
 * @param {number} options.silenceThreshold - Audio level threshold for silence (default: 0.01)
 * @returns {Object} { isRecording, audioBlob, startRecording, stopRecording, resetRecording, error, isSupported }
 */
const useAudioRecorder = (options = {}) => {
    const {
        silenceTimeout = 4000,  // 4 seconds
        silenceThreshold = 0.08 // Audio level below this is considered silence (8%)
    } = options;

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // Silence detection refs
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const lastSoundTimeRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Check browser support
    const checkSupport = useCallback(() => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setIsSupported(false);
            setError('Audio recording is not supported in this browser.');
            return false;
        }
        if (!window.MediaRecorder) {
            setIsSupported(false);
            setError('MediaRecorder API is not supported in this browser.');
            return false;
        }
        return true;
    }, []);

    // Use ref to track recording state (avoids stale closure in animation frame)
    const isRecordingRef = useRef(false);

    // Update ref when state changes
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // Check if audio is above silence threshold
    // Using refs to avoid stale closure issues in requestAnimationFrame
    const checkAudioLevel = useCallback(() => {
        // Use ref for checking recording state (avoids stale closure)
        if (!analyserRef.current || !isRecordingRef.current) return;

        const now = Date.now();

        // Warm-up period: Skip first 1 second to let mic stabilize
        const recordingStartTime = checkAudioLevel.recordingStartTime || now;
        if (!checkAudioLevel.recordingStartTime) {
            checkAudioLevel.recordingStartTime = now;
        }
        const elapsed = now - recordingStartTime;
        if (elapsed < 1000) {
            // Still in warm-up, reset silence timer and continue
            lastSoundTimeRef.current = now;
            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
            return;
        }

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average audio level
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedLevel = average / 255;

        // Use moving average to smooth out spikes (keep last 10 readings)
        if (!checkAudioLevel.levelHistory) {
            checkAudioLevel.levelHistory = [];
        }
        checkAudioLevel.levelHistory.push(normalizedLevel);
        if (checkAudioLevel.levelHistory.length > 10) {
            checkAudioLevel.levelHistory.shift();
        }
        const smoothedLevel = checkAudioLevel.levelHistory.reduce((a, b) => a + b, 0) / checkAudioLevel.levelHistory.length;

        // Debug: Log audio level every second (reduce console spam)
        if (!checkAudioLevel.lastLogTime || now - checkAudioLevel.lastLogTime > 1000) {
            const silenceDuration = now - lastSoundTimeRef.current;
            console.log(`[AudioRecorder] Smoothed level: ${(smoothedLevel * 100).toFixed(1)}% (raw: ${(normalizedLevel * 100).toFixed(1)}%) | Silence: ${(silenceDuration / 1000).toFixed(1)}s / ${silenceTimeout / 1000}s`);
            checkAudioLevel.lastLogTime = now;
        }

        if (smoothedLevel > silenceThreshold) {
            // Sound detected - reset silence timer
            lastSoundTimeRef.current = Date.now();
        } else {
            // Silence - check if timeout exceeded
            const silenceDuration = Date.now() - lastSoundTimeRef.current;
            if (silenceDuration >= silenceTimeout) {
                console.log(`[AudioRecorder] ✅ Silence detected for ${silenceTimeout}ms, auto-stopping...`);

                // Clean up
                checkAudioLevel.levelHistory = [];
                checkAudioLevel.recordingStartTime = null;
                checkAudioLevel.lastLogTime = null;

                // Stop recording directly
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                    isRecordingRef.current = false;
                }
                return;
            }
        }

        // Continue monitoring (only if still recording)
        if (isRecordingRef.current) {
            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        }
    }, [silenceThreshold, silenceTimeout]); // No isRecording dependency - using ref instead

    // Start recording
    const startRecording = useCallback(async () => {
        if (!checkSupport()) return;

        try {
            setError(null);
            setAudioBlob(null);
            audioChunksRef.current = [];

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            streamRef.current = stream;

            // Set up audio analysis for silence detection
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256;

                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);

                // Initialize last sound time
                lastSoundTimeRef.current = Date.now();
            } catch (audioContextError) {
                console.warn('[AudioRecorder] Could not set up silence detection:', audioContextError);
            }

            // Determine the best supported MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/mp4')
                        ? 'audio/mp4'
                        : 'audio/wav';

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000
            });
            mediaRecorderRef.current = mediaRecorder;

            // Collect audio data
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(audioBlob);

                // Clean up stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                // Clean up audio context
                if (audioContextRef.current) {
                    audioContextRef.current.close().catch(() => { });
                    audioContextRef.current = null;
                }

                // Cancel animation frame
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            };

            // Handle errors
            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                setError('Recording error occurred. Please try again.');
                setIsRecording(false);
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            isRecordingRef.current = true; // Set ref for silence detection

            // Start silence detection
            if (analyserRef.current) {
                lastSoundTimeRef.current = Date.now();
                animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
            }

        } catch (err) {
            console.error('Error starting recording:', err);

            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please enable microphone permissions.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone found. Please connect a microphone.');
            } else {
                setError(`Failed to start recording: ${err.message}`);
            }
            setIsRecording(false);
        }
    }, [checkSupport, checkAudioLevel]);

    // Stop recording
    const stopRecording = useCallback(() => {
        // Cancel silence monitoring
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            isRecordingRef.current = false; // Update ref
        }
    }, []);

    // Reset recording state
    const resetRecording = useCallback(() => {
        setAudioBlob(null);
        setError(null);
        audioChunksRef.current = [];
    }, []);

    // Cleanup on unmount
    const cleanup = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        isRecording,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording,
        cleanup,
        error,
        isSupported
    };
};

export default useAudioRecorder;

