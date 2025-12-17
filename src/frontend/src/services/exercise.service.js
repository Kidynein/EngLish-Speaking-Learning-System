import api from './api';

const EXERCISE_URL = '/exercises';

const exerciseService = {
    /**
     * Get exercises for a specific lesson
     * @param {number|string} lessonId
     * @returns {Promise<Array>} List of exercises
     */
    getExercisesByLesson: async (lessonId) => {
        const response = await api.get(`${EXERCISE_URL}/lesson/${lessonId}`);
        return response.data?.data?.exercises || [];
    },

    /**
     * Get random exercises
     * @returns {Promise<Array>} List of random exercises
     */
    getRandomExercises: async () => {
        const response = await api.get(`${EXERCISE_URL}/random`);
        return response.data?.data || [];
    },

    /**
     * Submit an exercise attempt
     * @param {object} attemptData - { sessionId, exerciseId, scoreOverall, ... }
     * @returns {Promise<object>} Created attempt
     */
    submitAttempt: async (attemptData) => {
        // API endpoint based on server.js/exerciseAttemptRoutes
        const response = await api.post('/exercise-attempts', attemptData);
        return response.data;
    }
};

export default exerciseService;
