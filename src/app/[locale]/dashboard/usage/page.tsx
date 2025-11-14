'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface UsageSummary {
    totalRequests: number;
    last30DaysRequests: number;
    averageResponseTime: number;
    successRate: number;
}

interface DailyUsage {
    date: string;
    requests: number;
    averageResponseTime: number;
    errors: number;
}

interface EndpointUsage {
    endpoint: string;
    requests: number;
    averageResponseTime: number;
    errors: number;
}

interface MethodUsage {
    method: string;
    requests: number;
}

interface StatusCode {
    statusCode: number;
    count: number;
}

export default function UsagePage() {
    const { user, isAuthenticated, isLoading, getAccessToken } = useAuth();
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [summary, setSummary] = useState<UsageSummary | null>(null);
    const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
    const [endpointUsage, setEndpointUsage] = useState<EndpointUsage[]>([]);
    const [methodUsage, setMethodUsage] = useState<MethodUsage[]>([]);
    const [statusCodes, setStatusCodes] = useState<StatusCode[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedDays, setSelectedDays] = useState(30);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(`/${locale}/login?returnUrl=/dashboard/usage`);
        }
    }, [isAuthenticated, isLoading, router, locale]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
        }
    }, [isAuthenticated, selectedDays]);

    const fetchAllData = async () => {
        setIsLoadingData(true);
        await Promise.all([
            fetchSummary(),
            fetchDailyUsage(),
            fetchEndpointUsage(),
            fetchMethodUsage(),
            fetchStatusCodes(),
        ]);
        setIsLoadingData(false);
    };

    const fetchSummary = async () => {
        try {
            const token = getAccessToken?.();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1.0/users/me/usage/summary', { headers });
            if (response.ok) {
                const data = await response.json();
                console.log('Usage summary received:', data);
                setSummary(data);
            } else {
                console.error('Failed to fetch summary, status:', response.status);
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        }
    };

    const fetchDailyUsage = async () => {
        try {
            const token = getAccessToken?.();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `/api/v1.0/users/me/usage/daily?days=${selectedDays}`,
                { headers }
            );
            if (response.ok) {
                const data = await response.json();
                setDailyUsage(data);
            }
        } catch (err) {
            console.error('Failed to fetch daily usage:', err);
        }
    };

    const fetchEndpointUsage = async () => {
        try {
            const token = getAccessToken?.();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1.0/users/me/usage/endpoints', { headers });
            if (response.ok) {
                const data = await response.json();
                setEndpointUsage(data);
            }
        } catch (err) {
            console.error('Failed to fetch endpoint usage:', err);
        }
    };

    const fetchMethodUsage = async () => {
        try {
            const token = getAccessToken?.();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1.0/users/me/usage/methods', { headers });
            if (response.ok) {
                const data = await response.json();
                setMethodUsage(data);
            }
        } catch (err) {
            console.error('Failed to fetch method usage:', err);
        }
    };

    const fetchStatusCodes = async () => {
        try {
            const token = getAccessToken?.();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1.0/users/me/usage/status-codes', { headers });
            if (response.ok) {
                const data = await response.json();
                setStatusCodes(data);
            }
        } catch (err) {
            console.error('Failed to fetch status codes:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const getStatusCodeColor = (code: number) => {
        if (code >= 200 && code < 300) return 'text-green-400';
        if (code >= 300 && code < 400) return 'text-blue-400';
        if (code >= 400 && code < 500) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getMethodColor = (method: string) => {
        const colors: Record<string, string> = {
            Get: 'bg-blue-500',
            Post: 'bg-green-500',
            Put: 'bg-yellow-500',
            Delete: 'bg-red-500',
            Patch: 'bg-purple-500',
        };
        return colors[method] || 'bg-slate-500';
    };

    if (isLoading || !isAuthenticated || !user) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
                <div className='text-center'>
                    <div className='inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4'></div>
                    <p className='text-slate-300 text-lg'>Loading...</p>
                </div>
            </div>
        );
    }

    const maxDailyRequests = Math.max(...dailyUsage.map(d => d.requests), 1);

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
            <Navigation />

            <div className='max-w-7xl mx-auto px-6 py-12'>
                <div className='mb-8'>
                    <Link
                        href={`/${locale}/dashboard`}
                        className='text-purple-400 hover:text-purple-300 mb-2 inline-block'
                    >
                        ← Back to Dashboard
                    </Link>
                    <h1 className='text-4xl font-bold'>API Usage & Analytics</h1>
                    <p className='text-slate-400 mt-2'>
                        Monitor your API key usage and performance metrics
                    </p>
                </div>

                {isLoadingData ? (
                    <div className='text-center py-12'>
                        <div className='inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500 mb-4'></div>
                        <p className='text-slate-300'>Loading analytics...</p>
                    </div>
                ) : summary && summary.totalRequests === 0 ? (
                    <div className='bg-slate-800/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-12 text-center'>
                        <div className='max-w-2xl mx-auto'>
                            <div className='w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6'>
                                <svg
                                    className='w-10 h-10 text-purple-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                                    />
                                </svg>
                            </div>

                            <h2 className='text-2xl font-bold text-white mb-4'>No API Usage Yet</h2>

                            <p className='text-slate-300 mb-6 text-lg'>
                                This page tracks{' '}
                                <span className='text-purple-400 font-semibold'>API key usage</span>{' '}
                                only. Uploading files through the website doesn't count as API
                                usage.
                            </p>

                            <div className='bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8 text-left'>
                                <h3 className='text-lg font-semibold text-white mb-3'>
                                    What you'll see here:
                                </h3>
                                <ul className='space-y-2 text-slate-300'>
                                    <li className='flex items-start'>
                                        <span className='text-purple-400 mr-2'>•</span>
                                        <span>
                                            API request statistics when you use your API keys
                                        </span>
                                    </li>
                                    <li className='flex items-start'>
                                        <span className='text-purple-400 mr-2'>•</span>
                                        <span>Endpoint usage and performance metrics</span>
                                    </li>
                                    <li className='flex items-start'>
                                        <span className='text-purple-400 mr-2'>•</span>
                                        <span>Success rates and error tracking</span>
                                    </li>
                                    <li className='flex items-start'>
                                        <span className='text-purple-400 mr-2'>•</span>
                                        <span>Daily usage trends and patterns</span>
                                    </li>
                                </ul>
                            </div>

                            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                                <Link
                                    href={`/${locale}/dashboard/api-keys`}
                                    className='bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2'
                                >
                                    <svg
                                        className='w-5 h-5'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                                        />
                                    </svg>
                                    Create API Key
                                </Link>

                                <Link
                                    href={`/${locale}/dashboard/scans`}
                                    className='bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2'
                                >
                                    <svg
                                        className='w-5 h-5'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                        />
                                    </svg>
                                    View Scan History
                                </Link>
                            </div>

                            <p className='text-slate-500 text-sm mt-8'>
                                Note: Website uploads appear in your{' '}
                                <Link
                                    href={`/${locale}/dashboard/scans`}
                                    className='text-purple-400 hover:text-purple-300 underline'
                                >
                                    Scan History
                                </Link>
                                , not here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {summary && (
                            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                                <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                    <div className='text-slate-400 text-sm mb-1'>
                                        Total Requests
                                    </div>
                                    <div className='text-3xl font-bold text-white'>
                                        {summary.totalRequests.toLocaleString()}
                                    </div>
                                </div>
                                <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                    <div className='text-slate-400 text-sm mb-1'>Last 30 Days</div>
                                    <div className='text-3xl font-bold text-purple-400'>
                                        {summary.last30DaysRequests.toLocaleString()}
                                    </div>
                                </div>
                                <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                    <div className='text-slate-400 text-sm mb-1'>
                                        Avg Response Time
                                    </div>
                                    <div className='text-3xl font-bold text-white'>
                                        {summary.averageResponseTime.toFixed(0)}ms
                                    </div>
                                </div>
                                <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                    <div className='text-slate-400 text-sm mb-1'>Success Rate</div>
                                    <div className='text-3xl font-bold text-green-400'>
                                        {summary.successRate.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8'>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-bold'>Daily Requests</h2>
                                <select
                                    value={selectedDays}
                                    onChange={e => setSelectedDays(Number(e.target.value))}
                                    className='bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                                >
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                    <option value={90}>Last 90 days</option>
                                </select>
                            </div>
                            <div className='h-64 overflow-x-auto'>
                                <div
                                    className='h-full flex items-end justify-between gap-1'
                                    style={{
                                        minWidth: `${Math.max(dailyUsage.length * 12, 100)}px`,
                                    }}
                                >
                                    {dailyUsage.map((day, index) => (
                                        <div
                                            key={index}
                                            className='flex-1 flex flex-col items-center group'
                                            style={{ minWidth: '8px' }}
                                        >
                                            <div className='relative w-full'>
                                                <div
                                                    className='w-full bg-purple-600 hover:bg-purple-500 transition-all rounded-t cursor-pointer'
                                                    style={{
                                                        height: `${(day.requests / maxDailyRequests) * 200}px`,
                                                    }}
                                                    title={`${day.requests} requests`}
                                                ></div>
                                                {day.errors > 0 && (
                                                    <div
                                                        className='w-full bg-red-600 rounded-t'
                                                        style={{
                                                            height: `${(day.errors / maxDailyRequests) * 200}px`,
                                                        }}
                                                        title={`${day.errors} errors`}
                                                    ></div>
                                                )}
                                            </div>
                                            <div className='text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                {formatDate(day.date)}
                                            </div>
                                            <div className='text-xs text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity'>
                                                {day.requests}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='text-center text-slate-500 text-sm mt-4'>
                                {dailyUsage.length > 0 && (
                                    <span>
                                        {formatDate(dailyUsage[0].date)} -{' '}
                                        {formatDate(dailyUsage[dailyUsage.length - 1].date)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                            <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                <h2 className='text-2xl font-bold mb-6'>Top Endpoints</h2>
                                {endpointUsage.length === 0 ? (
                                    <p className='text-slate-400 text-center py-8'>
                                        No endpoint data available
                                    </p>
                                ) : (
                                    <div className='space-y-3'>
                                        {endpointUsage.map((endpoint, index) => (
                                            <div
                                                key={index}
                                                className='bg-slate-900/50 rounded-lg p-4'
                                            >
                                                <div className='flex items-center justify-between mb-2'>
                                                    <span className='text-white font-mono text-sm truncate flex-1'>
                                                        {endpoint.endpoint}
                                                    </span>
                                                    <span className='text-purple-400 font-bold ml-4'>
                                                        {endpoint.requests}
                                                    </span>
                                                </div>
                                                <div className='flex items-center justify-between text-xs text-slate-400'>
                                                    <span>
                                                        Avg:{' '}
                                                        {endpoint.averageResponseTime.toFixed(0)}ms
                                                    </span>
                                                    {endpoint.errors > 0 && (
                                                        <span className='text-red-400'>
                                                            {endpoint.errors} errors
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                                <h2 className='text-2xl font-bold mb-6'>HTTP Methods</h2>
                                {methodUsage.length === 0 ? (
                                    <p className='text-slate-400 text-center py-8'>
                                        No method data available
                                    </p>
                                ) : (
                                    <div className='space-y-4'>
                                        {methodUsage.map((method, index) => {
                                            const maxRequests = Math.max(
                                                ...methodUsage.map(m => m.requests),
                                                1
                                            );
                                            const percentage =
                                                (method.requests / maxRequests) * 100;
                                            return (
                                                <div key={index}>
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <span className='text-white font-semibold'>
                                                            {method.method}
                                                        </span>
                                                        <span className='text-slate-400'>
                                                            {method.requests} requests
                                                        </span>
                                                    </div>
                                                    <div className='w-full bg-slate-900/50 rounded-full h-3'>
                                                        <div
                                                            className={`${getMethodColor(method.method)} h-3 rounded-full transition-all`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6'>
                            <h2 className='text-2xl font-bold mb-6'>Status Code Distribution</h2>
                            {statusCodes.length === 0 ? (
                                <p className='text-slate-400 text-center py-8'>
                                    No status code data available
                                </p>
                            ) : (
                                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                                    {statusCodes.map((status, index) => (
                                        <div
                                            key={index}
                                            className='bg-slate-900/50 rounded-lg p-4 text-center'
                                        >
                                            <div
                                                className={`text-3xl font-bold ${getStatusCodeColor(status.statusCode)}`}
                                            >
                                                {status.statusCode}
                                            </div>
                                            <div className='text-slate-400 text-sm mt-1'>
                                                {status.count} requests
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}
