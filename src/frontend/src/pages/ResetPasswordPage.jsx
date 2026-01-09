import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing reset token.");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/reset-password", {
                token,
                newPassword: formData.newPassword,
            });
            toast.success("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-lg">
                {/* Lock Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-brand-primary"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title & Description */}
                <h1 className="text-2xl font-bold text-white text-center">
                    Set new password
                </h1>
                <p className="mt-2 text-sm text-slate-400 text-center">
                    Please enter your new password below.
                </p>

                {/* Form */}
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label
                            htmlFor="newPassword"
                            className="text-sm font-semibold text-slate-200"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 disabled:bg-slate-800 transition-all duration-300"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="confirmPassword"
                            className="text-sm font-semibold text-slate-200"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 disabled:bg-slate-800 transition-all duration-300"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-primary-dark transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Resetting...
                            </>
                        ) : (
                            "Reset password"
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-brand-primary hover:text-brand-primary-light transition-colors duration-300"
                    >
                        ← Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
