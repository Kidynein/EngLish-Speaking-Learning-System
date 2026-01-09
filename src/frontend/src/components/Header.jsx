import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 [.light-theme_&]:bg-white py-4 px-6 shadow-lg [.light-theme_&]:shadow-md border-b border-slate-800 [.light-theme_&]:border-slate-200 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <Link to="/dashboard" className="flex items-center gap-3 no-underline group">
          <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-bold group-hover:bg-brand-primary/30 transition-colors">
            E
          </div>
          <span className="font-bold text-white [.light-theme_&]:text-slate-800 text-lg hidden sm:block group-hover:text-brand-primary transition-colors">
            English Learning Speaking System
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex gap-8 font-medium">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-brand-primary font-bold transition-colors duration-300"
                : "text-slate-400 [.light-theme_&]:text-slate-600 hover:text-brand-primary transition-colors duration-300"
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
                    ? "text-brand-primary font-bold transition-colors duration-300"
                    : "text-slate-400 [.light-theme_&]:text-slate-600 hover:text-brand-primary transition-colors duration-300"
                }
              >
                My Progress
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-primary font-bold transition-colors duration-300"
                    : "text-slate-400 [.light-theme_&]:text-slate-600 hover:text-brand-primary transition-colors duration-300"
                }
              >
                History
              </NavLink>

              <NavLink
                to="/premium"
                className={({ isActive }) =>
                  isActive
                    ? "text-amber-400 [.light-theme_&]:text-amber-600 font-bold transition-colors duration-300 flex items-center gap-1"
                    : "text-amber-200 [.light-theme_&]:text-amber-500 hover:text-amber-400 [.light-theme_&]:hover:text-amber-700 transition-colors duration-300 flex items-center gap-1"
                }
              >
                <svg className="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Premium
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
              className="px-4 py-2 text-sm font-medium text-slate-900 [.light-theme_&]:text-white bg-brand-primary rounded-lg hover:bg-brand-primary-dark transition-all duration-300"
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
