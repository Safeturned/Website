'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createJsonAuthHeaders } from './authHelpers';

export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    tier: number;
    isAdmin: boolean;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface AuthContextType {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (returnUrl?: string) => void;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'safeturned_auth_tokens';
const USER_STORAGE_KEY = 'safeturned_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadStoredAuth = () => {
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);

                if (storedUser && storedTokens) {
                    setUser(JSON.parse(storedUser));
                    setTokens(JSON.parse(storedTokens));
                }
            } catch (error) {
                console.error('Failed to load stored auth:', error);
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    useEffect(() => {
        if (tokens) {
            localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    }, [tokens]);

    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, [user]);

    useEffect(() => {
        if (!tokens) return;

        const refreshTime = (tokens.expiresIn - 300) * 1000;
        const timeout = setTimeout(() => {
            refreshAccessToken();
        }, refreshTime);

        return () => clearTimeout(timeout);
    }, [tokens]);

    const login = useCallback((returnUrl?: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const callbackUrl = `${window.location.origin}/auth/callback`;
        const finalReturnUrl = returnUrl || window.location.pathname;

        sessionStorage.setItem('auth_return_url', finalReturnUrl);

        window.location.href = `${apiUrl}/v1.0/auth/discord?returnUrl=${encodeURIComponent(callbackUrl)}`;
    }, []);

    const logout = useCallback(async () => {
        try {
            if (tokens?.refreshToken) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                await fetch(`${apiUrl}/v1.0/auth/logout`, {
                    method: 'POST',
                    headers: createJsonAuthHeaders(tokens.accessToken),
                    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setUser(null);
            setTokens(null);
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            router.push('/');
        }
    }, [tokens, router]);

    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        if (!tokens?.refreshToken) {
            return false;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/v1.0/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
            });

            return true;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            setUser(null);
            setTokens(null);
            return false;
        }
    }, [tokens]);

    const getAccessToken = useCallback(() => {
        return tokens?.accessToken || null;
    }, [tokens]);

    const value: AuthContextType = {
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshAccessToken,
        getAccessToken,
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

export function setAuthData(user: User, tokens: AuthTokens) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}
