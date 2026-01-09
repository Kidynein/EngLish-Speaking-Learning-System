import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePremium } from "../context/PremiumContext";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const { user } = useAuth();
  const { isPremium, isPro, subscription } = usePremium();

  // Show upgrade button only for free users
  const showUpgradeButton = user && !isPremium && !isPro;

  return (
    <header className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
            E
          </div>
          <span className="font-bold text-gray-800 text-lg hidden sm:block">
            English Learning Speaking System
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex gap-8 font-medium">
          {/* NavLink giúp tự động highlight menu đang active */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-green-600 font-bold"
                : "text-gray-500 hover:text-green-600 transition-colors"
            }
          >
            Home
          </NavLink>

          {user?.role !== 'admin' && (
            <>
              <NavLink
                to="/my-progress"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-600 font-bold"
                    : "text-gray-500 hover:text-green-600 transition-colors"
                }
              >
                My Progress
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-600 font-bold"
                    : "text-gray-500 hover:text-green-600 transition-colors"
                }
              >
                History
              </NavLink>
            </>
          )}
        </nav>

        {/* User Action Area */}
        <div className="flex items-center gap-4">
          {/* Premium Badge or Upgrade Button */}
          {user && (isPremium || isPro) ? (
            <span className={`hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              isPro 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
            }`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {isPro ? 'Pro' : 'Premium'}
            </span>
          ) : showUpgradeButton && (
            <UpgradeButton />
          )}

          {user ? (
            <UserDropdown />
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

// Separate component for upgrade button to use context properly
const UpgradeButton = () => {
  const { openPremiumModal } = usePremium();
  
  const handleUpgradeClick = () => {
    openPremiumModal();
  };

  return (
    <button
      onClick={handleUpgradeClick}
      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white text-xs font-semibold rounded-full transition-all shadow-sm hover:shadow-md"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Nâng cấp
    </button>
  );
};

export default Header;
