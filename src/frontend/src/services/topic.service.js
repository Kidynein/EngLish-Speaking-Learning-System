import api from './api';

const TOPIC_URL = '/topics';
const LESSON_URL = '/lessons';

const topicService = {
    /**
     * Get all available topics
     * @returns {Promise<Array>} List of topics
     */
    getAllTopics: async (page = 1, limit = 9) => {
        const response = await api.get(`${TOPIC_URL}?page=${page}&limit=${limit}`);
        // The backend returns a paginated structure: { topics: [...], total: ... }
        // We need to extract the topics array.
        return response.data?.data?.topics || [];
    },

    /**
     * Get lessons by topic ID
     * @param {number|string} topicId
     * @returns {Promise<Array>} List of lessons
     */
    getLessonsByTopic: async (topicId) => {
        const response = await api.get(`${LESSON_URL}/topic/${topicId}`);
        return response.data?.data?.lessons || [];
    }
};

export default topicService;
