import { useState } from "react";
import { toast } from "react-toastify";

import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
    // Lazy initialization to validly set initial state from sessionStorage
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");
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
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setUser(null);
        toast.success("You have been logged out!");
    };

    const updateUser = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        sessionStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};