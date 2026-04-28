'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
    theme: Theme;
    fontSize: FontSize;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function resolveTheme(theme: Theme): 'dark' | 'light' {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [fontSize, setFontSizeState] = useState<FontSize>('medium');

    useEffect(() => {
        const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
        const savedFontSize = (localStorage.getItem('fontSize') as FontSize) || 'medium';
        setThemeState(savedTheme);
        setFontSizeState(savedFontSize);
        document.documentElement.setAttribute('data-theme', resolveTheme(savedTheme));
        document.documentElement.setAttribute('data-font-size', savedFontSize);

        if (savedTheme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, []);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem('theme', t);
        document.documentElement.setAttribute('data-theme', resolveTheme(t));
    };

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem('fontSize', size);
        document.documentElement.setAttribute('data-font-size', size);
    };

    return (
        <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
