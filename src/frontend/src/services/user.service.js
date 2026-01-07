import api from "./api";

const userService = {
    // Get current user profile
    getProfile: async () => {
        const response = await api.get("/users/profile");
        return response.data;
    },

    // Update current user profile
    updateProfile: async (profileData) => {
        const response = await api.put("/users/profile", profileData);
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.put("/users/change-password", passwordData);
        return response.data;
    },

    // Get user stats
    getUserStats: async () => {
        const response = await api.get("/user-stats");
        return response.data;
    },

    updateUserStats: async (statsData) => {
        const response = await api.put("/user-stats", statsData);
        return response.data;
    },

    getTopUsers: async (limit = 10) => {
        const response = await api.get(`/user-stats/top-users?limit=${limit}`);
        return response.data;
    },

    getUserProgress: async () => {
        const response = await api.get("/progress");
        return response.data;
    },

    // Get user history (for counting completed exercises)
    getUserHistory: async (userId, params = {}) => {
        const response = await api.get(`/users/${userId}/history`, { params });
        return response.data;
    }
};

export default userService;
