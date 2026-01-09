import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);


      const responseData = data.data || data;

      const token = responseData.token || responseData.accessToken;
      const user = responseData.user;

      if (token && user) {
        login(user, token); // Update global AuthContext state
        // Navigation is handled here explicitly to ensure timing
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed. Please check your account information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left: Illustration Section - Dark with brand accent */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="w-full max-w-lg relative z-10">
          <img
            src="/assets/auth_illustration.png"
            alt="Learning English"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
        <div className="mt-12 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Master English with AI</h2>
          <p className="text-slate-400 text-lg">Join thousands of learners improving their pronunciation every day.</p>
        </div>
      </div>

      {/* Right: Login Card Section */}
      <div className="w-full lg:w-1/2 bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-700">
          {/* Login Card */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-brand-primary font-medium">
                Sign in to continue learning
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-tertiary hover:text-brand-tertiary-light font-medium transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-tertiary focus:outline-none focus:ring-2 focus:ring-brand-tertiary/30 transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-brand-primary-dark transition-all duration-300 disabled:bg-brand-primary/50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="uppercase tracking-wide">Or continue with</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Sign-In Button */}
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-all duration-300">
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

              {/* Facebook Sign-In Button */}
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 transition-all duration-300">
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
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-brand-primary hover:text-brand-primary-light transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
