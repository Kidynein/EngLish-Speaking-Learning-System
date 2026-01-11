import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
    );

    // If user is NOT logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in, render the child route (Dashboard, etc.)
    return <Outlet />;
};

export default ProtectedRoute;
