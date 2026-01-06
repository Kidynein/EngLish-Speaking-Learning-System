import api from './api';

/**
 * Pronunciation Assessment Service
 * Handles AI-powered pronunciation analysis using Google Gemini
 */

/**
 * Analyze pronunciation from audio recording
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {string} targetSentence - The sentence user should have read
 * @returns {Promise<Object>} Assessment result with scores and word analysis
 */
export const analyzePronunciation = async (audioBlob, targetSentence) => {
    const formData = new FormData();
    
    // Append audio file with proper filename
    const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type || 'audio/webm' 
    });
    formData.append('audio', audioFile);
    formData.append('targetSentence', targetSentence);

    try {
        const response = await api.post('/assessment/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 seconds timeout for AI processing
        });

        return response.data;
    } catch (error) {
        console.error('Pronunciation analysis error:', error);
        throw error;
    }
};

/**
 * Transcribe audio to text
 * @param {Blob} audioBlob - The recorded audio blob
 * @returns {Promise<Object>} Transcription result
 */
export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    
    const audioFile = new File([audioBlob], 'recording.webm', { 
        type: audioBlob.type || 'audio/webm' 
    });
    formData.append('audio', audioFile);

    try {
        const response = await api.post('/assessment/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
        });

        return response.data;
    } catch (error) {
        console.error('Transcription error:', error);
        throw error;
    }
};

/**
 * Check assessment service health
 * @returns {Promise<Object>} Service status
 */
export const checkAssessmentHealth = async () => {
    try {
        const response = await api.get('/assessment/health');
        return response.data;
    } catch (error) {
        console.error('Assessment health check error:', error);
        throw error;
    }
};

export default {
    analyzePronunciation,
    transcribeAudio,
    checkAssessmentHealth
};
