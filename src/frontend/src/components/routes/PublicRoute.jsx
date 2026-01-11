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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
    );

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Otherwise, render the child route (Login, Register, etc.)
    return <Outlet />;
};

export default PublicRoute;
