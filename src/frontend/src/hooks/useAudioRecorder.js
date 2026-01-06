import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for audio recording using MediaRecorder API
 * Records audio and returns a Blob that can be sent to the backend for AI analysis
 * 
 * @returns {Object} { isRecording, audioBlob, startRecording, stopRecording, resetRecording, error, isSupported }
 */
const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(true);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

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
    }, [checkSupport]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
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
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    }, []);

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
