'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';

interface RateLimitData {
    current: number;
    max: number;
    remaining: number;
    usagePercent: number;
    resetTime: string;
    minutesUntilReset: number;
    secondsUntilReset: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
    tier: string;
}

export default function RateLimitUsage() {
    const { isAuthenticated } = useAuth();
    const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeUntilReset, setTimeUntilReset] = useState<string>('');

    const fetchRateLimitData = async () => {
        try {
            const data = await api.get<RateLimitData>('users/me/usage/rate-limit');
            setRateLimitData(data);
        } catch (err) {
            console.error('Failed to fetch rate limit data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchRateLimitData();
            const interval = setInterval(fetchRateLimitData, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!rateLimitData) return;

        const updateCountdown = () => {
            const resetDate = new Date(rateLimitData.resetTime);
            const now = new Date();
            const diff = resetDate.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeUntilReset('Resetting...');
                fetchRateLimitData(); // Refresh data when reset
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeUntilReset(`${minutes}m ${seconds}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [rateLimitData]);

    if (loading) {
        return (
            <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 animate-pulse'>
                <div className='h-4 bg-slate-700 rounded w-1/3 mb-4'></div>
                <div className='h-2 bg-slate-700 rounded w-full mb-2'></div>
                <div className='h-3 bg-slate-700 rounded w-1/4'></div>
            </div>
        );
    }

    if (!rateLimitData) {
        return null;
    }

    const { current, max, remaining, usagePercent, isNearLimit, isOverLimit } = rateLimitData;

    let progressColor = 'bg-green-500';
    let textColor = 'text-green-400';
    let borderColor = 'border-green-500/50';
    let bgColor = 'bg-green-500/10';

    if (isOverLimit) {
        progressColor = 'bg-red-500';
        textColor = 'text-red-400';
        borderColor = 'border-red-500/50';
        bgColor = 'bg-red-500/10';
    } else if (isNearLimit) {
        progressColor = 'bg-orange-500';
        textColor = 'text-orange-400';
        borderColor = 'border-orange-500/50';
        bgColor = 'bg-orange-500/10';
    } else if (usagePercent >= 50) {
        progressColor = 'bg-yellow-500';
        textColor = 'text-yellow-400';
        borderColor = 'border-yellow-500/50';
        bgColor = 'bg-yellow-500/10';
    }

    const isAdmin = max === 99999;

    return (
        <div className={`border ${borderColor} ${bgColor} rounded-xl p-6`}>
            <div className='flex items-center justify-between mb-4'>
                <div>
                    <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                        <svg
                            className='w-5 h-5 text-purple-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 10V3L4 14h7v7l9-11h-7z'
                            />
                        </svg>
                        API Rate Limit
                    </h3>
                    <p className='text-sm text-slate-400 mt-1'>Hourly request usage</p>
                </div>
                <div className='text-right'>
                    <div className={`text-2xl font-bold ${textColor}`}>
                        {isAdmin ? '∞' : `${current}/${max}`}
                    </div>
                    <div className='text-xs text-slate-500'>
                        {isAdmin ? 'Unlimited' : `${remaining} remaining`}
                    </div>
                </div>
            </div>

            {!isAdmin && (
                <>
                    <div className='mb-4'>
                        <div className='w-full bg-slate-700 rounded-full h-3 overflow-hidden'>
                            <div
                                className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                            <p className='text-slate-500'>Usage</p>
                            <p className={`font-semibold ${textColor}`}>
                                {usagePercent.toFixed(1)}%
                            </p>
                        </div>
                        <div>
                            <p className='text-slate-500'>Resets in</p>
                            <p className='font-semibold text-white'>{timeUntilReset}</p>
                        </div>
                    </div>

                    {isOverLimit && (
                        <div className='mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg'>
                            <p className='text-red-300 text-sm font-medium'>
                                ⚠️ Rate limit exceeded
                            </p>
                            <p className='text-red-400 text-xs mt-1'>
                                Your requests will be throttled until the limit resets.
                            </p>
                        </div>
                    )}
                    {isNearLimit && !isOverLimit && (
                        <div className='mt-4 p-3 bg-orange-900/30 border border-orange-500/50 rounded-lg'>
                            <p className='text-orange-300 text-sm font-medium'>
                                ⚡ Approaching rate limit
                            </p>
                            <p className='text-orange-400 text-xs mt-1'>
                                You've used {usagePercent.toFixed(0)}% of your hourly quota.
                            </p>
                        </div>
                    )}
                </>
            )}

            {isAdmin && (
                <div className='mt-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg'>
                    <p className='text-purple-300 text-sm font-medium flex items-center gap-2'>
                        <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                            <path
                                fillRule='evenodd'
                                d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
                                clipRule='evenodd'
                            />
                        </svg>
                        Admin - Unlimited Requests
                    </p>
                    <p className='text-purple-400 text-xs mt-1'>
                        As an administrator, you have no rate limits.
                    </p>
                </div>
            )}
        </div>
    );
}
