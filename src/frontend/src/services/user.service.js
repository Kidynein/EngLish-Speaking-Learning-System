import api from "./api";

const userService = {
    getUserStats: async () => {
        // Calls GET /api/user-stats which uses the token to identify the user
        const response = await api.get("/user-stats");
        return response.data; // response.data.data contains the stats object based on controller
    },

    updateUserStats: async (statsData) => {
        const response = await api.put("/user-stats", statsData);
        return response.data;
    },

    getTopUsers: async (limit = 10) => {
        const response = await api.get(`/user-stats/top-users?limit=${limit}`);
        return response.data;
    }
};

export default userService;
