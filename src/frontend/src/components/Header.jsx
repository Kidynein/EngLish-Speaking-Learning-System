import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const { user } = useAuth();

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
        <div>
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
export default Header;
