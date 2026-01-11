import api from "./api";

const practiceSessionService = {
    startSession: async (topicId) => {
        // API endpoint based on practiceSessionController.js: router.post('/', ...)
        // which maps to startSession controller
        const response = await api.post("/practice-sessions", { topicId });
        return response.data;
    },

    endSession: async (sessionId, sessionScore, durationSeconds = 0) => {
        // API endpoint: POST /practice-sessions/:id/end
        const response = await api.post(`/practice-sessions/${sessionId}/end`, {
            sessionScore,
            durationSeconds
        });
        return response.data;
    },

    getHistory: async (page = 1, limit = 10) => {
        const response = await api.get(`/practice-sessions/user/history?page=${page}&limit=${limit}`);
        return response.data;
    }
};

export default practiceSessionService;
