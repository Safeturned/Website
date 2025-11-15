'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useChunkedUpload } from '@/hooks/useChunkedUpload';
import StandardFileUpload from '@/components/StandardFileUpload';
import { formatScanTime, computeFileHash } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface SystemAnalytics {
    totalFilesScanned: number;
    totalThreatsDetected: number;
    averageScanTimeMs: number;
    lastUpdated: string;
    totalSafeFiles: number;
    averageScore: number;
    firstScanDate: string;
    lastScanDate: string;
    totalScanTimeMs: number;
    threatDetectionRate: number;
}

export const dynamic = 'force-dynamic';

export default function Page() {
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [useChunkedUploadForFile, setUseChunkedUploadForFile] = useState(false);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    const CHUNKED_UPLOAD_THRESHOLD = 100 * 1024 * 1024;

    const chunkedUpload = useChunkedUpload({
        onComplete: (result: Record<string, unknown>) => {
            sessionStorage.setItem('uploadResult', JSON.stringify(result));
            let hash;
            if (result.id) {
                hash = result.id;
            } else if (result.fileHash && typeof result.fileHash === 'string') {
                hash = result.fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            } else if (result.hash && typeof result.hash === 'string') {
                hash = result.hash;
            } else {
                hash =
                    typeof result.fileHash === 'string' ? result.fileHash : Date.now().toString();
                hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            }

            router.push(`/${locale}/result/${hash}`);
        },
        onError: (error: string) => {
            setError(error);
            setIsScanning(false);
        },
    });

    const fetchSystemAnalytics = async () => {
        try {
            setIsLoadingAnalytics(true);
            const response = await fetch('/api/analytics');

            if (response.ok) {
                const data = await response.json();
                setSystemAnalytics(data);
            }
        } catch (error) {
            console.error('Failed to fetch system analytics:', error);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    useEffect(() => {
        setIsLoaded(true);
        document.documentElement.style.scrollBehavior = 'smooth';
        fetchSystemAnalytics();

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    const handleFileSelect = (file: File) => {
        setUseChunkedUploadForFile(file.size > CHUNKED_UPLOAD_THRESHOLD);
        setError(null);
    };

    const handleUpload = async (file: File) => {
        if (!file) return;

        setIsScanning(true);
        setError(null);

        try {
            if (useChunkedUploadForFile) {
                await chunkedUpload.uploadFile(file);
            } else {
                const formData = new FormData();
                formData.append('file', file, file.name);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMsg =
                        errorData.error || `Upload failed with status ${response.status}`;

                    if (
                        response.status === 413 ||
                        errorMsg.includes('size') ||
                        errorMsg.includes('large')
                    ) {
                        throw new Error(
                            `File too large: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`
                        );
                    } else if (
                        response.status === 415 ||
                        errorMsg.includes('type') ||
                        errorMsg.includes('format')
                    ) {
                        throw new Error(
                            `Invalid file type: ${file.name}. Only .dll files are supported.`
                        );
                    } else if (response.status === 429) {
                        throw new Error(
                            'Rate limit exceeded. Please wait a moment before uploading again.'
                        );
                    } else if (response.status === 401 || response.status === 403) {
                        throw new Error(
                            'Authentication error. Please try logging out and back in.'
                        );
                    } else if (response.status >= 500) {
                        throw new Error(
                            `Server error (${response.status}). Our servers are experiencing issues. Please try again in a few moments.`
                        );
                    } else {
                        throw new Error(errorMsg);
                    }
                }

                const result = await response.json();

                sessionStorage.setItem('uploadResult', JSON.stringify(result));
                let hash;
                if (result.id) {
                    hash = result.id;
                } else if (result.fileHash) {
                    hash = result.fileHash
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/g, '');
                } else if (result.hash) {
                    hash = result.hash;
                } else {
                    hash = await computeFileHash(file);
                    hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
                }

                router.push(`/${locale}/result/${hash}`);
            }
        } catch (err) {
            if (err instanceof Error) {
                if (
                    err.message.includes('Failed to fetch') ||
                    err.message.includes('NetworkError')
                ) {
                    setError(
                        'Network error: Unable to connect to the server. Please check your internet connection.'
                    );
                } else {
                    setError(err.message);
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            if (!useChunkedUploadForFile) {
                setIsScanning(false);
            }
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative'>
            <Navigation />

            <section className='px-6 py-20'>
                <div className='max-w-6xl mx-auto text-center'>
                    <div className='mb-8'>
                        <h1
                            className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white transition-all duration-700 ${
                                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            {t('hero.title')}
                        </h1>
                        <p
                            className={`text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            {t('hero.subtitle')}
                        </p>
                    </div>

                    <div className='max-w-2xl mx-auto mb-4'>
                        <p className='text-xs text-gray-500 text-center leading-relaxed'>
                            {t('consent.prefix')}
                            <Link
                                href={`/${locale}/terms`}
                                className='text-purple-400 hover:text-purple-300 underline transition-colors duration-200'
                            >
                                {t('consent.termsOfService')}
                            </Link>
                            {t('consent.and')}
                            <Link
                                href={`/${locale}/privacy`}
                                className='text-purple-400 hover:text-purple-300 underline transition-colors duration-200'
                            >
                                {t('consent.privacyNotice')}
                            </Link>
                            {t('consent.suffix')}
                            <Link
                                href={`/${locale}/privacy`}
                                className='text-purple-400 hover:text-purple-300 underline transition-colors duration-200'
                            >
                                {t('consent.learnMore')}
                            </Link>
                            {t('consent.suffix2')}
                        </p>
                    </div>

                    <div
                        className={`max-w-2xl mx-auto mb-16 transition-all duration-700 delay-300 ${
                            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}
                    >
                        <div className='bg-slate-800/60 backdrop-blur-sm border border-purple-500/40 rounded-xl p-6 md:p-10 hover:border-purple-400/60 transition-all duration-300'>
                            <StandardFileUpload
                                onFileSelect={handleFileSelect}
                                onUpload={handleUpload}
                                isUploading={isScanning}
                                uploadProgress={chunkedUpload.progress}
                                useChunkedUpload={useChunkedUploadForFile}
                                maxFileSize={MAX_FILE_SIZE}
                                acceptedFileTypes={['.dll']}
                                disabled={isScanning}
                                className='text-white'
                                uploadStatus={chunkedUpload.status}
                                isPreparing={chunkedUpload.isPreparing}
                            />

                            {error && (
                                <div className='mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg'>
                                    <div className='flex items-center'>
                                        <svg
                                            className='w-5 h-5 text-red-400 mr-2'
                                            fill='currentColor'
                                            viewBox='0 0 20 20'
                                        >
                                            <path
                                                fillRule='evenodd'
                                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                        <span className='text-red-300'>{error}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isLoadingAnalytics ? (
                        <div
                            className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto transition-all duration-700 delay-400 ${
                                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className='bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-lg p-5 md:p-6 animate-pulse'
                                >
                                    <div className='h-10 bg-slate-700/50 rounded mb-2 w-3/4'></div>
                                    <div className='h-5 bg-slate-700/50 rounded w-full'></div>
                                </div>
                            ))}
                        </div>
                    ) : systemAnalytics && systemAnalytics.totalFilesScanned > 0 ? (
                        <>
                            <div
                                className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto transition-all duration-700 delay-400 ${
                                    isLoaded
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-10 opacity-0'
                                }`}
                            >
                                <div className='bg-slate-800/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-5 md:p-6 hover:bg-slate-800/60 hover:border-purple-400/50 transition-all duration-200'>
                                    <div className='text-3xl md:text-4xl font-bold text-purple-400 mb-2'>
                                        {systemAnalytics.totalFilesScanned.toLocaleString()}
                                    </div>
                                    <div className='text-gray-300 text-sm md:text-base'>
                                        {t('stats.checkedPlugins')}
                                    </div>
                                </div>
                                <div className='bg-slate-800/40 backdrop-blur-sm border border-red-500/30 rounded-lg p-5 md:p-6 hover:bg-slate-800/60 hover:border-red-400/50 transition-all duration-200'>
                                    <div className='text-3xl md:text-4xl font-bold text-red-400 mb-2'>
                                        {systemAnalytics.totalThreatsDetected.toLocaleString()}
                                    </div>
                                    <div className='text-gray-300 text-sm md:text-base'>
                                        {t('stats.threatsDetected')}
                                    </div>
                                </div>
                                <div className='bg-slate-800/40 backdrop-blur-sm border border-blue-500/30 rounded-lg p-5 md:p-6 hover:bg-slate-800/60 hover:border-blue-400/50 transition-all duration-200'>
                                    <div className='text-3xl md:text-4xl font-bold text-blue-400 mb-2'>
                                        {formatScanTime(systemAnalytics.averageScanTimeMs, t)}
                                    </div>
                                    <div className='text-gray-300 text-sm md:text-base'>
                                        {t('stats.averageScanTime')}
                                    </div>
                                </div>
                            </div>

                            {systemAnalytics.lastUpdated && (
                                <div className='mt-4 text-center'>
                                    <p className='text-xs text-gray-400'>
                                        {t('analytics.lastUpdated')}:{' '}
                                        {new Date(systemAnalytics.lastUpdated).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </section>

            <section id='features' className='px-6 py-16 md:py-24 bg-slate-800/10'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16'>
                        {t('features.title')}
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
                        <div className='bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 md:p-8 hover:bg-slate-800/70 hover:border-purple-400/50 transition-all duration-200'>
                            <div className='w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4'>
                                <svg
                                    className='w-5 h-5 md:w-6 md:h-6 text-white'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg md:text-xl font-semibold mb-3 text-white'>
                                {t('features.codeAnalysis')}
                            </h3>
                            <p className='text-gray-300 text-sm md:text-base leading-relaxed'>
                                {t('features.codeAnalysisDescription')}
                            </p>
                        </div>
                        <div className='bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 md:p-8 hover:bg-slate-800/70 hover:border-pink-400/50 transition-all duration-200'>
                            <div className='w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4'>
                                <svg
                                    className='w-5 h-5 md:w-6 md:h-6 text-white'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg md:text-xl font-semibold mb-3 text-white'>
                                {t('features.threatDetection')}
                            </h3>
                            <p className='text-gray-300 text-sm md:text-base leading-relaxed'>
                                {t('features.threatDetectionDescription')}
                            </p>
                        </div>
                        <div className='bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 md:p-8 hover:bg-slate-800/70 hover:border-green-400/50 transition-all duration-200'>
                            <div className='w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4'>
                                <svg
                                    className='w-5 h-5 md:w-6 md:h-6 text-white'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg md:text-xl font-semibold mb-3 text-white'>
                                {t('features.fastCheck')}
                            </h3>
                            <p className='text-gray-300 text-sm md:text-base leading-relaxed'>
                                {t('features.fastCheckDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id='how-it-works' className='px-6 py-16 md:py-24'>
                <div className='max-w-4xl mx-auto'>
                    <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16'>
                        {t('howItWorks.title')}
                    </h2>
                    <div className='space-y-8 md:space-y-10'>
                        <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8'>
                            <div className='w-14 h-14 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white flex-shrink-0'>
                                1
                            </div>
                            <div className='flex-1 text-center md:text-left'>
                                <h3 className='text-xl md:text-2xl font-semibold mb-2 text-white'>
                                    {t('howItWorks.step1.title')}
                                </h3>
                                <p className='text-gray-300 text-base md:text-lg leading-relaxed'>
                                    {t('howItWorks.step1.description')}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8'>
                            <div className='w-14 h-14 md:w-16 md:h-16 bg-pink-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white flex-shrink-0'>
                                2
                            </div>
                            <div className='flex-1 text-center md:text-left'>
                                <h3 className='text-xl md:text-2xl font-semibold mb-2 text-white'>
                                    {t('howItWorks.step2.title')}
                                </h3>
                                <p className='text-gray-300 text-base md:text-lg leading-relaxed'>
                                    {t('howItWorks.step2.description')}
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col md:flex-row items-center gap-6 md:gap-8'>
                            <div className='w-14 h-14 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white flex-shrink-0'>
                                3
                            </div>
                            <div className='flex-1 text-center md:text-left'>
                                <h3 className='text-xl md:text-2xl font-semibold mb-2 text-white'>
                                    {t('howItWorks.step3.title')}
                                </h3>
                                <p className='text-gray-300 text-base md:text-lg leading-relaxed'>
                                    {t('howItWorks.step3.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
