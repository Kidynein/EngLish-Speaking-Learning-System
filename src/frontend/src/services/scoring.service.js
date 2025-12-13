import api from './api';

const SCORING_URL = '/scoring';

const scoringService = {
    /**
     * Submit data for scoring
     * @param {FormData | object} data - Data to submit (can be file upload or JSON)
     * @returns {Promise<object>} Response data
     */
    submitScoring: async (data) => {
        // Determine Content-Type based on data type (FormData handles multi-part automatically)
        const isFormData = data instanceof FormData;

        const config = isFormData
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};

        const response = await api.post(`${SCORING_URL}/submit`, data, config);
        return response.data;
    },

    // Add other scoring-related endpoints here
};

export default scoringService;
