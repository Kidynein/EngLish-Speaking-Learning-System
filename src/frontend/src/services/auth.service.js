import api from "./api";

const authService = {
    login: async (email, password) => {
        // The endpoint might be /auth/login or similar. Adjust based on backend.
        // For now assuming /auth/login based on common practices.
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    },

    register: async (fullName, email, password) => {
        // Similarly assuming /auth/register or /auth/signup
        const response = await api.post("/auth/register", {
            fullName,
            email,
            password,
        });
        return response.data;
    },
};

export default authService;
