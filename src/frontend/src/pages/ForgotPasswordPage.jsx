import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3 3v1h6V9a3 3 0 00-3-3z"
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-gray-600 text-center">
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </p>

        {/* Form */}
        <form className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="reset-email"
              className="text-sm font-semibold text-gray-900"
            >
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Send reset link
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;