import { useState } from "react";
import { toast } from "react-toastify";

import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
    // Lazy initialization to validly set initial state from localStorage
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                console.error("Failed to parse user data", e);
                return null;
            }
        }
        return null;
    });

    const [loading, setLoading] = useState(false);

    const login = (userData, token) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        toast.success("You have been logged out!");
    };

    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
