import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

const PublicRoute = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user && !loading) {
            toast.info("You have been logged in!", {
                toastId: "already-logged-in" // Prevent duplicate toasts
            });
        }
    }, [user, loading]);

    if (loading) return <div>Loading...</div>; // Or a spinner

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise, render the child route (Login, Register, etc.)
    return <Outlet />;
};

export default PublicRoute;
