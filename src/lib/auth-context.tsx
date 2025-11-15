'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createJsonAuthHeaders } from './authHelpers';

export interface LinkedIdentity {
    providerName: string;
    providerId: number;
    providerUserId: string;
    providerUsername?: string;
    connectedAt: string;
    lastAuthenticatedAt?: string;
}

export interface User {
    id: string;
    email?: string;
    username?: string;
    avatarUrl?: string;
    tier: number;
    isAdmin: boolean;
    linkedIdentities?: LinkedIdentity[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (returnUrl?: string) => void;
    logout: () => Promise<void>;
    getLinkedIdentities: () => Promise<LinkedIdentity[] | null>;
    unlinkIdentity: (providerName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'safeturned_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadStoredAuth = () => {
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to load stored auth:', error);
                localStorage.removeItem(USER_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, [user]);

    const login = useCallback((returnUrl?: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const callbackUrl = `${window.location.origin}/auth/callback`;
        const finalReturnUrl = returnUrl || window.location.pathname;

        sessionStorage.setItem('auth_return_url', finalReturnUrl);

        window.location.href = `${apiUrl}/v1.0/auth/discord?returnUrl=${encodeURIComponent(callbackUrl)}`;
    }, []);

    const logout = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await fetch(`${apiUrl}/v1.0/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setUser(null);
            localStorage.removeItem(USER_STORAGE_KEY);
            router.push('/');
        }
    }, [router]);

    const getLinkedIdentities = useCallback(async (): Promise<LinkedIdentity[] | null> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/v1.0/auth/linked-identities`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch linked identities');
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get linked identities:', error);
            return null;
        }
    }, []);

    const unlinkIdentity = useCallback(async (providerName: string): Promise<boolean> => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/v1.0/auth/unlink`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerName }),
            });

            if (!response.ok) {
                throw new Error('Failed to unlink identity');
            }

            if (user) {
                const identities = await getLinkedIdentities();
                setUser({
                    ...user,
                    linkedIdentities: identities || undefined,
                });
            }

            return true;
        } catch (error) {
            console.error('Failed to unlink identity:', error);
            return false;
        }
    }, [user, getLinkedIdentities]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getLinkedIdentities,
        unlinkIdentity,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function setAuthData(user: User) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}
