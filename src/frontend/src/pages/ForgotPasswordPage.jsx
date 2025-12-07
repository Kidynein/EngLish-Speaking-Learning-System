import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-emerald-50 p-8 shadow-sm">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
            to="/login"
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