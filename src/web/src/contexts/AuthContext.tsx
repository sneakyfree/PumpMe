/**
 * Auth Context — manages user state across the app
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

export interface User {
    id: string;
    email: string;
    name: string | null;
    tier: string;
    avatarUrl: string | null;
    emailVerified: boolean;
    creditBalance: number;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check auth on mount
    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, []);

    async function refreshUser() {
        try {
            const res = await api.get<{ user: User | null }>('/auth/me');
            if (res.success && res.data?.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }

    async function login(email: string, password: string) {
        const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
        if (res.success && res.data) {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return { success: true };
        }
        return { success: false, error: res.error?.message || 'Login failed' };
    }

    async function register(email: string, password: string, name?: string) {
        const res = await api.post<{ token: string; user: User }>('/auth/register', { email, password, name });
        if (res.success && res.data) {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            return { success: true };
        }
        return { success: false, error: res.error?.message || 'Registration failed' };
    }

    async function logout() {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
