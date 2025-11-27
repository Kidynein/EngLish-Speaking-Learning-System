import { NavLink, Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 no-underline">
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
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-green-600 font-bold"
                : "text-gray-500 hover:text-green-600 transition-colors"
            }
          >
            Home
          </NavLink>

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
        </nav>
        {/* User Avatar */}
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold cursor-pointer hover:bg-green-200 transition-colors">
          S
        </div>
      </div>
    </header>
  );
};
export default Header;
