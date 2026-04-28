'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'user' | 'admin';
    status: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, callbackUrl?: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On mount, restore session
    useEffect(() => {
        const restore = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) { setLoading(false); return; }
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.user);
            } catch {
                localStorage.removeItem('accessToken');
            } finally {
                setLoading(false);
            }
        };
        restore();
    }, []);

    const setToken = (token: string) => {
        localStorage.setItem('accessToken', token);
        document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
    };

    const clearToken = () => {
        localStorage.removeItem('accessToken');
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
    };

    const login = async (email: string, password: string, callbackUrl?: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.accessToken);
        setUser(data.user);
        if (callbackUrl) {
            router.push(callbackUrl);
        } else {
            router.push(data.user.role === 'admin' ? '/admin/overview' : '/dashboard/chat');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setToken(data.accessToken);
        setUser(data.user);
        router.push('/dashboard/chat');
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        clearToken();
        setUser(null);
        router.push('/signin');
    };

    const updateUser = (data: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...data } : prev);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
