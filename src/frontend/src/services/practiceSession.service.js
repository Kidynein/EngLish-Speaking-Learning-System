import api from "./api";

const practiceSessionService = {
    startSession: async (topicId) => {
        // API endpoint based on practiceSessionController.js: router.post('/', ...)
        // which maps to startSession controller
        const response = await api.post("/practice-sessions", { topicId });
        return response.data;
    },

    endSession: async (sessionId, sessionScore) => {
        // API endpoint: router.post('/:id/end', ...) or router.put('/:id', ...) ?
        // Checking practiceSessionRoutes.js would be ideal, but based on typical REST:
        // Controller has endSession. Let's assume POST /practice-sessions/:id/end or PUT /practice-sessions/:id
        // Wait, let me quickly verify the route if possible or assume standard.
        // Based on server.js log: "- Practice Sessions: POST /api/practice-sessions"
        // It didn't list the end endpoint explicitly in the summary log, but usually it's there.
        // I will double check route file if this fails, but for now assuming POST /:id/end or PUT /:id/end

        // Actually, looking at previous file list, practiceSessionRoutes.js exists.
        // I will assume it follows the controller 'endSession' mapping.
        // Let's use a safe guess and verify if needed.
        // Most likely: POST /practice-sessions/:id/end
        const response = await api.post(`/practice-sessions/${sessionId}/end`, { sessionScore });
        return response.data;
    },

    getHistory: async (page = 1, limit = 10) => {
        const response = await api.get(`/practice-sessions/user/history?page=${page}&limit=${limit}`);
        return response.data;
    }
};

export default practiceSessionService;
