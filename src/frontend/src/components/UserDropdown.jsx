import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserDropdown = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate("/"); // Redirect to home/landing after logout
    };

    if (!user) return null;

    const firstInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 focus:outline-none hover:bg-slate-800 p-2 rounded-lg transition-all duration-300 cursor-pointer"
            >
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-bold border border-brand-primary/30">
                    {firstInitial}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-200">{user.fullName || "User"}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">{user.email}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-lg border border-slate-700 py-2 z-50 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-slate-700 mb-2">
                        <p className="text-sm font-semibold text-slate-200">Signed in as</p>
                        <p className="text-sm text-slate-400 truncate" title={user.email}>{user.email}</p>
                    </div>

                    <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-brand-primary/20 hover:text-brand-primary transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                    >
                        <User size={18} />
                        <span>Profile</span>
                    </Link>

                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-brand-primary/20 hover:text-brand-primary transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </Link>

                    <div className="h-px bg-slate-700 my-2"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/20 transition-all duration-300 text-left"
                    >
                        <LogOut size={18} />
                        <span>Sign out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
