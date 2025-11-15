'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiUrl } from './api-client';

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
        const finalReturnUrl = returnUrl || window.location.pathname;

        sessionStorage.setItem('auth_return_url', finalReturnUrl);

        window.location.href = `${getApiUrl('auth/discord')}?returnUrl=${encodeURIComponent(finalReturnUrl)}`;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('auth/logout');
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
            return await api.get<LinkedIdentity[]>('auth/linked-identities');
        } catch (error) {
            console.error('Failed to get linked identities:', error);
            return null;
        }
    }, []);

    const unlinkIdentity = useCallback(
        async (providerName: string): Promise<boolean> => {
            try {
                await api.post('auth/unlink', { providerName });

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
        },
        [user, getLinkedIdentities]
    );

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
