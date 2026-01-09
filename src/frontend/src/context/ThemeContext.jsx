import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark';
    });

    // Theme override state (for specific pages like Landing Page)
    const [overrideTheme, setOverrideTheme] = useState(null);

    // Apply theme class to document root - considers override
    useEffect(() => {
        const root = document.documentElement;
        // Determine the effective theme: override takes precedence
        const effectiveTheme = overrideTheme || theme;

        if (effectiveTheme === 'light') {
            root.classList.add('light-theme');
        } else {
            root.classList.remove('light-theme');
        }
    }, [theme, overrideTheme]);

    // Persist user preference to localStorage (ignore override)
    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Handle system theme changes (for 'auto' mode)
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e) => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'auto' || !savedTheme) {
                setTheme(e.matches ? 'light' : 'dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setThemeMode = (mode) => {
        if (mode === 'auto') {
            const isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            setTheme(isLight ? 'light' : 'dark');
            localStorage.setItem('theme', 'auto');
        } else {
            setTheme(mode);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, setOverrideTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
