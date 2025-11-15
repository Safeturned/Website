'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthData } from '@/lib/auth-context';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${apiUrl}/v1.0/auth/me`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                setAuthData(userData);

                let returnUrl = sessionStorage.getItem('auth_return_url') || '/en';
                sessionStorage.removeItem('auth_return_url');

                if (!returnUrl.startsWith('/en/') && !returnUrl.startsWith('/ru/')) {
                    if (returnUrl.startsWith('/')) {
                        returnUrl = `/en${returnUrl}`;
                    } else {
                        returnUrl = `/en/${returnUrl}`;
                    }
                }

                router.push(returnUrl);
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [router]);

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 px-4'>
                <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-red-500/50 max-w-md w-full'>
                    <div className='text-center'>
                        <svg
                            className='w-16 h-16 text-red-400 mx-auto mb-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                        <h2 className='text-2xl font-bold text-white mb-2'>
                            Authentication Failed
                        </h2>
                        <p className='text-slate-400 mb-6'>{error}</p>
                        <a
                            href='/login'
                            className='inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors'
                        >
                            Try Again
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 px-4'>
            <div className='text-center'>
                <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4'></div>
                <p className='text-slate-300 text-lg'>Completing authentication...</p>
            </div>
        </div>
    );
}
