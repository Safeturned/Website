'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            } else if (requireAdmin && !user?.isAdmin) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, requireAdmin, user, router, pathname]);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800'>
                <div className='text-center'>
                    <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4'></div>
                    <p className='text-slate-300 text-lg'>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || (requireAdmin && !user?.isAdmin)) {
        return null;
    }

    return <>{children}</>;
}
