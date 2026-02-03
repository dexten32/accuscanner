"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter, usePathname } from "next/navigation";

interface User {
    email: string;
    plan: string;
    userId?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/me`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error("Failed to fetch user:", e);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Skip fetching user state on the home page as requested
        if (pathname === '/') {
            setLoading(false);
            return;
        }
        fetchUser();
    }, [pathname]); // Depend on pathname to fetch when navigating away from home

    const login = (userData: User) => {
        setUser(userData);
        router.push('/scan');
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
            setUser(null);
            router.push('/login');
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const refetchUser = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
