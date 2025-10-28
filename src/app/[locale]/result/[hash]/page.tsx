'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useChunkedUpload } from '@/hooks/useChunkedUpload';
import Image from 'next/image';
import Link from 'next/link';
import { formatFileSize, formatScanTime, computeFileHash, getRiskLevel, getRiskColor } from '@/lib/utils';

interface AnalyticsData {
    fileName: string;
    score: number;
    checked: string[];
    message: string;
    lastScanned: string;
    fileSizeBytes: number;
}

export default function ResultPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const hash = params.hash as string;
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchHash, setSearchHash] = useState(hash);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragEnterCount, setDragEnterCount] = useState(0);
    const [dragFile, setDragFile] = useState<File | null>(null);
    const [showDragUpload, setShowDragUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isReanalyzing, setIsReanalyzing] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    const [useChunkedUploadForFile, setUseChunkedUploadForFile] = useState(false);

    const MAX_FILE_SIZE = 500 * 1024 * 1024;
    const CHUNKED_UPLOAD_THRESHOLD = 100 * 1024 * 1024;

    const chunkedUpload = useChunkedUpload({
        onComplete: (result: Record<string, unknown>) => {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('uploadResult', JSON.stringify(result));
            }

            let hash;
            if (result.id) {
                hash = result.id;
            } else if (result.fileHash && typeof result.fileHash === 'string') {
                hash = result.fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            } else if (result.hash && typeof result.hash === 'string') {
                hash = result.hash;
            } else {
                hash = Date.now().toString();
            }

            if (hash === params.hash) {
                if (typeof window !== 'undefined') {
                    window.location.reload();
                }
            } else {
                router.push(`/${params.locale}/result/${hash}`);
            }
        },
        onError: (error: string) => {
            setNotification({ message: error, type: 'error' });
        },
    });

    useEffect(() => {
        if (hash) {
            if (typeof window !== 'undefined') {
                const uploadResult = sessionStorage.getItem('uploadResult');
                if (uploadResult) {
                    try {
                        const data = JSON.parse(uploadResult);
                        setAnalyticsData(data);
                        setLoading(false);
                        sessionStorage.removeItem('uploadResult');
                        return;
                    } catch (err) {
                        console.error('Failed to parse upload result:', err);
                        sessionStorage.removeItem('uploadResult');
                    }
                }
            }

            fetchAnalysisResult(hash);
        }
    }, [hash]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const cleanup = () => {
            setIsDragOver(false);
            setDragEnterCount(0);
        };

        const handleGlobalDragEnd = () => {
            cleanup();
        };

        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('dragend', handleGlobalDragEnd);
        document.addEventListener('dragend', handleGlobalDragEnd);
        const timeout = setTimeout(cleanup, 10000);

        return () => {
            window.removeEventListener('beforeunload', cleanup);
            window.removeEventListener('dragend', handleGlobalDragEnd);
            document.removeEventListener('dragend', handleGlobalDragEnd);
            clearTimeout(timeout);
        };
    }, []);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setDragEnterCount(prev => prev + 1);
        if (dragEnterCount === 0) {
            setIsDragOver(true);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragEnterCount(prev => {
            const newCount = prev - 1;
            if (newCount <= 0) {
                setIsDragOver(false);
            }
            return newCount;
        });
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setDragEnterCount(0);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setDragEnterCount(0);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.dll')) {
                if (file.size > MAX_FILE_SIZE) {
                    setNotification({ message: t('errors.fileTooLarge'), type: 'error' });
                    return;
                }
                setDragFile(file);
                setUseChunkedUploadForFile(file.size > CHUNKED_UPLOAD_THRESHOLD);
                setShowDragUpload(true);
                setError(null);
            } else {
                setNotification({ message: 'Please select a .dll file', type: 'error' });
            }
        }
    };

    async function computeFileHash(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const bytes = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        return base64;
    }

    const handleDragUpload = async () => {
        if (!dragFile) return;

        setIsUploading(true);
        setError(null);

        try {
            if (useChunkedUploadForFile) {
                await chunkedUpload.uploadFile(dragFile);
            } else {
                const formData = new FormData();
                formData.append('file', dragFile, dragFile.name);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Upload failed: ${response.status}`);
                }

                const result = await response.json();

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('uploadResult', JSON.stringify(result));
                }

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
                    hash = await computeFileHash(dragFile);
                    hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
                }

                if (hash === params.hash) {
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('uploadResult', JSON.stringify(result));
                    }
                    if (typeof window !== 'undefined') {
                        window.location.reload();
                    }
                } else {
                    router.push(`/${params.locale}/result/${hash}`);
                }
            }
            return;
        } catch (err) {
            console.error('Upload failed:', err);
            setNotification({
                message: err instanceof Error ? err.message : 'Unknown error occurred',
                type: 'error',
            });
        } finally {
            setIsUploading(false);
            setShowDragUpload(false);
            setDragFile(null);
        }
    };

    const handleCancelDragUpload = () => {
        setDragFile(null);
        setShowDragUpload(false);
    };

    const handleShare = async () => {
        try {
            if (typeof window !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: t('results.shareTitle'),
                    text: t('results.shareText'),
                    url: window.location.href,
                });
            } else {
                await handleCopyLink();
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setNotification({ message: 'Failed to share', type: 'error' });
            }
        }
    };

    const handleCopyLink = async () => {
        try {
            if (typeof window !== 'undefined') {
                await navigator.clipboard.writeText(window.location.href);
                setNotification({ message: t('results.linkCopied'), type: 'success' });
            }
        } catch (err) {
            console.error('Failed to copy link:', err);
            setNotification({ message: 'Failed to copy link', type: 'error' });
        }
    };

    const handleReanalyze = async () => {
        if (!analyticsData) return;

        setIsReanalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/reanalyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileHash: hash,
                    forceAnalyze: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Reanalysis failed: ${response.status}`);
            }

            const result = await response.json();

            setAnalyticsData(result);
        } catch (err) {
            setNotification({
                message: err instanceof Error ? err.message : 'Reanalysis failed',
                type: 'error',
            });
        } finally {
            setIsReanalyzing(false);
        }
    };

    const fetchAnalysisResult = async (fileHash: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/files/${fileHash}`);

            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data);
            } else {
                setError('Analysis not found');
            }
        } catch (err) {
            console.error('Failed to load analysis:', err);
            setError('Failed to load analysis');
        } finally {
            setLoading(false);
        }
    };

    const handleHashSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchHash.trim()) {
            const urlSafeHash = searchHash
                .trim()
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/g, '');
            router.push(`/${params.locale}/result/${urlSafeHash}`);
        }
    };


    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
                        <p className='text-gray-300'>{t('results.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analyticsData) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white'>
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='text-center'>
                        <div className='text-red-400 text-6xl mb-4'>⚠️</div>
                        <h1 className='text-2xl font-bold mb-2'>{t('results.notFound')}</h1>
                        <p className='text-gray-300 mb-6'>{t('results.notFoundDescription')}</p>
                        <Link
                            href={`/${params.locale}`}
                            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300'
                        >
                            {t('results.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative'
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
        >
            <nav className='px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm'>
                <div className='max-w-6xl mx-auto flex justify-between items-center'>
                    <Link href={`/${params.locale}`} className='flex items-center space-x-3'>
                        <div className='w-10 h-10'>
                            <Image
                                src='/favicon.jpg'
                                alt='Safeturned Logo'
                                width={40}
                                height={40}
                                className='w-full h-full object-contain rounded-lg'
                            />
                        </div>
                        <span className='text-xl font-bold'>{t('hero.title')}</span>
                    </Link>
                    <LanguageSwitcher />
                </div>
            </nav>

            <div className='px-6 py-6 bg-slate-800/20 border-b border-purple-800/30'>
                <div className='max-w-4xl mx-auto'>
                    <div className='hidden md:block'>
                        <form onSubmit={handleHashSearch} className='flex gap-4'>
                            <div className='flex-1'>
                                <input
                                    type='text'
                                    value={searchHash}
                                    onChange={e => setSearchHash(e.target.value)}
                                    placeholder={t('results.searchPlaceholder')}
                                    className='w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors'
                                />
                            </div>
                            <button
                                type='submit'
                                className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300'
                            >
                                {t('results.search')}
                            </button>
                        </form>
                    </div>

                    <div className='md:hidden'>
                        {!showSearchBar && (
                            <div className='flex justify-center'>
                                <button
                                    onClick={() => setShowSearchBar(true)}
                                    className='flex items-center space-x-2 bg-slate-800/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white hover:bg-slate-800/70 transition-all duration-300'
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
                                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                        />
                                    </svg>
                                    <span>{t('results.search')}</span>
                                </button>
                            </div>
                        )}

                        {showSearchBar && (
                            <div className='space-y-3'>
                                <form onSubmit={handleHashSearch} className='flex gap-2'>
                                    <div className='flex-1'>
                                        <input
                                            type='text'
                                            value={searchHash}
                                            onChange={e => setSearchHash(e.target.value)}
                                            placeholder={t('results.searchPlaceholder')}
                                            className='w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors'
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type='submit'
                                        className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 rounded-lg font-medium transition-all duration-300'
                                    >
                                        {t('results.search')}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setShowSearchBar(false)}
                                        className='bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-medium transition-all duration-300'
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
                                                d='M6 18L18 6M6 6l12 12'
                                            />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='max-w-4xl mx-auto px-6 py-8'>
                <div className='bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-4 md:space-y-0'>
                        <div className='flex-1'>
                            <h1 className='text-xl md:text-2xl font-bold text-white mb-2 break-words'>
                                {analyticsData.fileName}
                            </h1>
                            <p className='text-gray-400 text-sm md:text-base break-all'>
                                SHA-256: {hash}
                            </p>
                        </div>
                        <div className={`text-center ${getRiskColor(analyticsData.score)}`}>
                            <div className='relative w-20 h-20 md:w-24 md:h-24 mx-auto'>
                                <svg
                                    className='w-20 h-20 md:w-24 md:h-24 transform -rotate-90'
                                    viewBox='0 0 100 100'
                                >
                                    <circle
                                        cx='50'
                                        cy='50'
                                        r='40'
                                        stroke='currentColor'
                                        strokeWidth='8'
                                        fill='none'
                                        opacity='0.2'
                                    />
                                    <circle
                                        cx='50'
                                        cy='50'
                                        r='40'
                                        stroke='currentColor'
                                        strokeWidth='8'
                                        fill='none'
                                        strokeDasharray={`${((100 - analyticsData.score) / 100) * 251.2} 251.2`}
                                        strokeLinecap='round'
                                        className='transition-all duration-1000 ease-out'
                                    />
                                </svg>
                                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                    <div className='text-base md:text-lg font-bold'>
                                        {analyticsData.score}
                                    </div>
                                    <div className='text-xs opacity-75'>/100</div>
                                </div>
                            </div>
                            <div className='text-xs md:text-sm break-words max-w-20 md:max-w-24 mt-2'>
                                {getRiskLevel(analyticsData.score, t)}
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                        <div>
                            <span className='text-gray-400'>{t('results.fileSize')}:</span>
                            <span className='ml-2 text-white'>
                                {formatFileSize(analyticsData.fileSizeBytes, t)}
                            </span>
                        </div>
                        <div>
                            <span className='text-gray-400'>{t('results.lastAnalysisDate')}:</span>
                            <span className='ml-2 text-white'>
                                {new Date(analyticsData.lastScanned).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6'>
                    <h2 className='text-xl font-bold mb-6'>{t('results.analysisResults')}</h2>

                    {analyticsData.checked && analyticsData.checked.length > 0 && (
                        <div className='mb-6'>
                            <h3 className='font-semibold mb-3 text-white'>
                                {t('results.checkedItemsTitle')}
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                                {analyticsData.checked.map((item, index) => (
                                    <div key={index} className='flex items-start text-sm'>
                                        <span className='text-yellow-400 mr-2 mt-0.5 flex-shrink-0'>
                                            •
                                        </span>
                                        <span className='text-gray-300 break-words'>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='text-sm text-gray-400'>{analyticsData.message}</div>

                    <div className='mt-6 pt-6 border-t border-purple-500/30'>
                        <div className='text-center'>
                            <p className='text-gray-400 mb-4 text-sm md:text-base'>
                                {t('results.reanalyzeDescription')}
                            </p>
                            <button
                                onClick={handleReanalyze}
                                disabled={isReanalyzing}
                                className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 mx-auto text-sm md:text-base'
                            >
                                {isReanalyzing ? (
                                    <svg
                                        className='animate-spin -ml-1 mr-2 md:mr-3 h-4 w-4 text-white'
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                    >
                                        <circle
                                            className='opacity-25'
                                            cx='12'
                                            cy='12'
                                            r='10'
                                            stroke='currentColor'
                                            strokeWidth='4'
                                        ></circle>
                                        <path
                                            className='opacity-75'
                                            fill='currentColor'
                                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                        ></path>
                                    </svg>
                                ) : (
                                    <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                        />
                                    </svg>
                                )}
                                <span>
                                    {isReanalyzing
                                        ? t('hero.scanning')
                                        : t('results.reanalyzeButton')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className='mt-6 md:mt-8 text-center md:hidden'>
                    <p className='text-gray-400 mb-3 md:mb-4 text-sm md:text-base'>
                        {t('results.shareDescription')}
                    </p>
                    <div className='flex justify-center gap-3 md:gap-4'>
                        <button
                            onClick={handleShare}
                            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 text-sm md:text-base'
                        >
                            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                                <path d='M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z' />
                            </svg>
                            <span>{t('results.shareButton')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {isDragOver && (
                <div className='fixed inset-0 bg-purple-900/80 backdrop-blur-sm z-50 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='text-6xl mb-4'>📁</div>
                        <h2 className='text-2xl font-bold text-white mb-2'>
                            {t('dragDrop.overlayTitle')}
                        </h2>
                        <p className='text-gray-300'>{t('dragDrop.overlayDescription')}</p>
                    </div>
                </div>
            )}

            {showDragUpload && dragFile && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
                    <div className='bg-slate-800/95 border border-purple-500/50 rounded-xl p-8 max-w-md w-full mx-4'>
                        <div className='text-center mb-6'>
                            <div className='text-4xl mb-4'>📄</div>
                            <h3 className='text-xl font-semibold mb-2'>{t('hero.fileSelected')}</h3>
                            <p className='text-gray-400 truncate max-w-full' title={dragFile.name}>
                                {dragFile.name}
                            </p>
                            <p className='text-sm text-gray-500 mt-1'>
                                {formatFileSize(dragFile.size, t)}
                            </p>
                        </div>

                        <div className='flex gap-4 justify-center'>
                            <button
                                onClick={() => handleDragUpload()}
                                disabled={isUploading}
                                className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-all duration-300'
                            >
                                {isUploading ? (
                                    <span className='flex items-center'>
                                        <svg
                                            className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        {t('hero.scanning')}
                                    </span>
                                ) : (
                                    t('hero.confirmUpload')
                                )}
                            </button>
                            <button
                                onClick={handleCancelDragUpload}
                                disabled={isUploading}
                                className='bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-all duration-300'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isUploading && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'>
                    <div className='bg-slate-800/95 border border-purple-500/50 rounded-xl p-8 max-w-lg w-full mx-4'>
                        <div className='text-center'>
                            <div className='w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <svg
                                    className='w-8 h-8 text-purple-400'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                    />
                                </svg>
                            </div>

                            <h3 className='text-xl font-semibold mb-4 text-white'>
                                {useChunkedUploadForFile && chunkedUpload.status
                                    ? chunkedUpload.status
                                    : 'Uploading...'}
                            </h3>

                            <div className='w-full bg-gray-700 rounded-full h-2 mb-4'>
                                <div
                                    className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300'
                                    style={{
                                        width: useChunkedUploadForFile
                                            ? `${chunkedUpload.progress}%`
                                            : '100%',
                                    }}
                                />
                            </div>

                            <div className='text-center'>
                                <div className='text-sm text-gray-300 mb-2'>
                                    {useChunkedUploadForFile && chunkedUpload.status
                                        ? chunkedUpload.status
                                        : 'Processing your file...'}
                                </div>
                                {useChunkedUploadForFile && (
                                    <div className='text-xs text-gray-400'>
                                        {Math.round(chunkedUpload.progress)}% complete
                                    </div>
                                )}
                                {chunkedUpload.isPreparing && (
                                    <div className='flex items-center justify-center mt-2'>
                                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400'></div>
                                    </div>
                                )}
                            </div>

                            {useChunkedUploadForFile && (
                                <button
                                    onClick={chunkedUpload.cancelUpload}
                                    className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
                                >
                                    Cancel Upload
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <div
                    className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-50 ${
                        notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                    }`}
                >
                    {notification.message}
                </div>
            )}
        </div>
    );
}
