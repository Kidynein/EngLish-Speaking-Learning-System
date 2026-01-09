import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const linkClass =
    "text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-800 transition-all duration-300";
  const activeClass = "bg-slate-800 text-brand-primary";

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-brand-primary flex items-center justify-center font-bold text-slate-900">
            E
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-50">
            English Speaking Learning System
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : "text-slate-300"}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/dashboard#progress"
            className={linkClass + " text-slate-300"}
          >
            My Progress
          </NavLink>
          <NavLink
            to="/dashboard#history"
            className={linkClass + " text-slate-300"}
          >
            History
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
export default Navbar;
