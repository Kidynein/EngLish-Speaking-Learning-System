import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../services/auth.service";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        formData.fullName,
        formData.email,
        formData.password
      );
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left: Illustration Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-tertiary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="w-full max-w-lg relative z-10">
          <img
            src="/assets/auth_illustration.png"
            alt="Start Learning"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
        <div className="mt-12 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey</h2>
          <p className="text-slate-400 text-lg">Create an account to access personalized lessons and AI feedback.</p>
        </div>
      </div>

      {/* Right: Signup Card Section */}
      <div className="w-full lg:w-1/2 bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-700">
          {/* Signup Card */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create account
              </h2>
              <p className="mt-1 text-sm text-brand-primary font-medium">
                Join us to start learning English speaking
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-slate-200"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="Pham Phat Loc"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-200"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-500">At least 8 characters</p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-slate-200"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-primary-dark transition-all duration-300 disabled:bg-brand-primary/50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="uppercase tracking-wide">Or sign up with</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Sign-Up Button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-all duration-300"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5"
                >
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook Sign-Up Button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-all duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-primary hover:text-brand-primary-light transition-colors duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignupPage;