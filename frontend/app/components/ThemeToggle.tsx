'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300 group"
            aria-label="Toggle Theme"
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <div className={`absolute inset-0 transition-transform duration-500 ease-spring ${theme === 'dark' ? 'translate-y-0 rotate-0' : 'translate-y-full rotate-90'}`}>
                    <Moon className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div className={`absolute inset-0 transition-transform duration-500 ease-spring ${theme === 'light' ? 'translate-y-0 rotate-0' : '-translate-y-full -rotate-90'}`}>
                    <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                </div>
            </div>

            {/* Tooltip */}
            <span className="absolute top-full right-0 mt-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </span>
        </button>
    );
}
