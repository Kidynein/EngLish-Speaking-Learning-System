import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-slate-900 py-4 px-6 shadow-lg border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-bold">
            E
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">
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
                ? "text-brand-primary font-bold transition-colors duration-300"
                : "text-slate-400 hover:text-brand-primary transition-colors duration-300"
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
                    : "text-slate-400 hover:text-brand-primary transition-colors duration-300"
                }
              >
                My Progress
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-primary font-bold transition-colors duration-300"
                    : "text-slate-400 hover:text-brand-primary transition-colors duration-300"
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
              className="px-4 py-2 text-sm font-medium text-slate-900 bg-brand-primary rounded-lg hover:bg-brand-primary-dark transition-all duration-300"
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
