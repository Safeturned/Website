'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTypingEffect } from '@/hooks/useTypingEffect';

const PROCESSING_MESSAGES = [
    'Checking your identity...',
    'Setting up your account...',
    'Getting you ready to go...',
];

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshAuth } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [finalReturnUrl, setFinalReturnUrl] = useState('');
    const { displayedText: typedMessage, isComplete } = useTypingEffect(
        PROCESSING_MESSAGES[currentMessageIndex],
        15
    );

    useEffect(() => {
        const processCallback = async () => {
            try {
                setCurrentMessageIndex(0);
                const params = new URLSearchParams(searchParams.toString());
                const state = params.get('state');
                const code = params.get('code');
                const openidMode = params.get('openid.mode');

                if (!state) {
                    setError('Invalid callback: missing state parameter');
                    setIsProcessing(false);
                    return;
                }

                const [stateValue, returnUrl] = state.split('|');
                const computedReturnUrl = decodeURIComponent(returnUrl || '/dashboard');
                setFinalReturnUrl(computedReturnUrl);

                const callbackData: Record<string, unknown> = {
                    state: stateValue,
                };

                if (code) {
                    callbackData.code = code;
                    callbackData.provider = 'discord';
                } else if (openidMode) {
                    Object.entries(Object.fromEntries(params)).forEach(([key, value]) => {
                        callbackData[key] = value;
                    });
                    callbackData.provider = 'steam';
                }

                await new Promise(resolve => setTimeout(resolve, 600));
                setCurrentMessageIndex(1);

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/v1.0/auth/callback`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(callbackData),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || `Authentication failed: ${response.status}`
                    );
                }

                await new Promise(resolve => setTimeout(resolve, 600));
                setCurrentMessageIndex(2);
            } catch (err) {
                console.error('Auth callback error:', err);
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Authentication failed. Please ensure the backend is running and has the auth/callback endpoint implemented.'
                );
                setIsProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, router, refreshAuth]);

    useEffect(() => {
        if (currentMessageIndex === 2 && isComplete && finalReturnUrl) {
            const completeAuth = async () => {
                try {
                    await refreshAuth();
                    router.push(finalReturnUrl);
                } catch (err) {
                    console.error('Failed to refresh auth:', err);
                    router.push(finalReturnUrl);
                }
            };
            completeAuth();
        }
    }, [currentMessageIndex, isComplete, finalReturnUrl, refreshAuth, router]);

    return (
        <div className='min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800'>
            <Navigation />
            <div className='flex-1 flex items-center justify-center px-4'>
                <div className='w-full max-w-md'>
                    <div className='bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50 text-center'>
                        {isProcessing && !error ? (
                            <div>
                                <div className='flex gap-1 justify-center mb-4'>
                                    <div
                                        className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                                        style={{ animationDelay: '0s' }}
                                    ></div>
                                    <div
                                        className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                                        style={{ animationDelay: '0.2s' }}
                                    ></div>
                                    <div
                                        className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                                        style={{ animationDelay: '0.4s' }}
                                    ></div>
                                </div>
                                <p className='text-sm text-slate-300 font-medium'>
                                    {typedMessage}
                                    <span className='animate-pulse ml-1'>▌</span>
                                </p>
                            </div>
                        ) : error ? (
                            <>
                                <h2 className='text-xl font-semibold text-red-400 mb-4'>
                                    Authentication Error
                                </h2>
                                <p className='text-slate-400 mb-6'>{error}</p>
                                <button
                                    onClick={() => router.push('/login')}
                                    className='w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
                                >
                                    Back to Login
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
