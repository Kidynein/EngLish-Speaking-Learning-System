import api from "./api";

const chatService = {
    /**
     * Check if user has access to AI tutor (Pro subscription)
     */
    checkAccess: async () => {
        try {
            const response = await api.get("/chat/access");
            return response.data.data;
        } catch (error) {
            console.error("Check access error:", error);
            return { hasAccess: false, plan: 'free' };
        }
    },

    /**
     * Send a message to the AI tutor
     * @param {string} message - The user's message
     * @param {string} context - Optional context (current topic, etc.)
     */
    sendMessage: async (message, context = null) => {
        const response = await api.post("/chat/message", { message, context });
        return response.data.data;
    },

    /**
     * Get conversation history
     */
    getHistory: async () => {
        const response = await api.get("/chat/history");
        return response.data.data;
    },

    /**
     * Clear conversation history
     */
    clearHistory: async () => {
        const response = await api.delete("/chat/history");
        return response.data;
    },

    /**
     * Execute a quick action
     * @param {string} action - Action type: explain_grammar, translate, vocabulary, correct_writing, practice_conversation, ielts_tip
     * @param {string} data - Data for the action
     */
    quickAction: async (action, data) => {
        const response = await api.post("/chat/quick-action", { action, data });
        return response.data.data;
    }
};

export default chatService;
