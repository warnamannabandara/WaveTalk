'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
    className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const isDark = theme !== 'light';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`group relative flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-amber-200 hover:bg-amber-300'
            } ${className}`}
        >
            {/* Ghost icon shown on the non-active side */}
            <span
                className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isDark ? 'right-1.5 opacity-35' : 'left-1.5 opacity-35'
                }`}
            >
                {isDark ? (
                    <Sun className="h-3 w-3 text-amber-300" />
                ) : (
                    <Moon className="h-3 w-3 text-slate-600" />
                )}
            </span>

            {/* Sliding thumb */}
            <span
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md transition-all duration-500 ease-in-out ${
                    isDark
                        ? 'translate-x-0 bg-slate-900 shadow-slate-900/50'
                        : 'translate-x-6 bg-white shadow-amber-200/50'
                }`}
            >
                {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-indigo-300 transition-transform duration-500 group-hover:-rotate-12" />
                ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500 transition-transform duration-500 group-hover:rotate-45" />
                )}
            </span>
        </button>
    );
}
