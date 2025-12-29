import api from './api';

const TOPIC_URL = '/topics';
const LESSON_URL = '/lessons';

const topicService = {
    /**
     * Get all available topics
     * @returns {Promise<Array>} List of topics
     */
    getAllTopics: async (page = 1, limit = 9, filters = {}) => {
        const { search = '', level = 'all' } = filters;
        const queryParams = new URLSearchParams({
            page,
            limit,
            ...(search && { search }),
            ...(level && level !== 'all' && { level })
        });

        const response = await api.get(`${TOPIC_URL}?${queryParams.toString()}`);
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
