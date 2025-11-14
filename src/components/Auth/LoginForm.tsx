'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { DiscordIcon, SteamIcon } from '@/components/Icons';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const locale = pathname?.split('/')[1] || 'en';
    const returnUrl = searchParams.get('returnUrl') || `/${locale}/dashboard`;

    const handleDiscordLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const callbackUrl = `${window.location.origin}/auth/callback`;

        sessionStorage.setItem('auth_return_url', returnUrl);

        window.location.href = `${apiUrl}/v1.0/auth/discord?returnUrl=${encodeURIComponent(callbackUrl)}`;
    };

    const handleSteamLogin = () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const callbackUrl = `${window.location.origin}/auth/callback`;

        sessionStorage.setItem('auth_return_url', returnUrl);

        window.location.href = `${apiUrl}/v1.0/auth/steam?returnUrl=${encodeURIComponent(callbackUrl)}`;
    };

    return (
        <div className='w-full max-w-md'>
            <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50'>
                <div className='text-center mb-8'>
                    <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2'>
                        Safeturned
                    </h1>
                    <p className='text-slate-400 text-sm'>
                        Login to manage your API keys and scans
                    </p>
                </div>

                <div className='space-y-3'>
                    <button
                        onClick={handleDiscordLogin}
                        className='w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105'
                    >
                        <DiscordIcon />
                        Login with Discord
                    </button>

                    <button
                        onClick={handleSteamLogin}
                        className='w-full bg-gradient-to-r from-[#1b2838] to-[#2a475e] hover:from-[#171f2b] hover:to-[#1e3447] text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105'
                    >
                        <SteamIcon />
                        Login with Steam
                    </button>
                </div>

                <div className='relative my-8'>
                    <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-slate-700'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                        <span className='px-4 bg-slate-800 text-slate-400'>or</span>
                    </div>
                </div>

                <a
                    href={`/${locale}`}
                    className='block w-full text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-lg transition-colors duration-200'
                >
                    Continue as Guest
                </a>

                <div className='mt-8 text-center'>
                    <p className='text-slate-500 text-xs'>
                        By logging in, you agree to our{' '}
                        <a
                            href={`/${locale}/terms`}
                            className='text-purple-400 hover:text-purple-300 underline'
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href={`/${locale}/privacy`}
                            className='text-purple-400 hover:text-purple-300 underline'
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>

                <div className='mt-8 space-y-3'>
                    <p className='text-slate-400 text-sm font-medium text-center mb-4'>
                        Why create an account?
                    </p>
                    <div className='flex items-start gap-3 text-sm text-slate-400'>
                        <svg
                            className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M5 13l4 4L19 7'
                            />
                        </svg>
                        <span>Generate and manage API keys</span>
                    </div>
                    <div className='flex items-start gap-3 text-sm text-slate-400'>
                        <svg
                            className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M5 13l4 4L19 7'
                            />
                        </svg>
                        <span>View scan history and usage analytics</span>
                    </div>
                    <div className='flex items-start gap-3 text-sm text-slate-400'>
                        <svg
                            className='w-5 h-5 text-green-400 flex-shrink-0 mt-0.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M5 13l4 4L19 7'
                            />
                        </svg>
                        <span>Higher rate limits (60 requests/hour)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
