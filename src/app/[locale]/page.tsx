'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useParams } from 'next/navigation';

interface AnalyticsData {
    fileName: string;
    score: number;
    checked: string[];
    message: string;
    processedAt: string;
    fileSizeBytes: number;
}

interface SystemAnalytics {
    totalFilesScanned: number;
    totalThreatsDetected: number;
    detectionAccuracy: number;
    averageScanTimeMs: number;
    lastUpdated: string;
    totalSafeFiles: number;
    averageScore: number;
    firstScanDate: string;
    lastScanDate: string;
    totalScanTimeMs: number;
    threatDetectionRate: number;
}

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';

export default function Page() {
    const { t } = useTranslation();
    const params = useParams();
    const locale = params.locale as string;
    const [isScanning, setIsScanning] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [fileHash, setFileHash] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSystemAnalytics = async () => {
        try {
            console.log('Fetching system analytics...');
            const response = await fetch('/api/analytics');
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Analytics data received:', data);
                setSystemAnalytics(data);
            } else {
                console.warn('Failed to fetch system analytics:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching system analytics:', error);
        }
    };

    useEffect(() => {
        setIsLoaded(true);

        // Smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Fetch system analytics
        fetchSystemAnalytics();

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    async function computeFileHash(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const bytes = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        // Convert to URL-safe base64 (to align with our API proxy param format)
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    }

    const handleFileUpload = async (file: File) => {
        setIsScanning(true);
        setError(null);
        setAnalyticsData(null);

        try {
            const formData = new FormData();
            formData.append('file', file, file.name);

            // Pre-compute hash for shareable link
            const hash = await computeFileHash(file);
            setFileHash(hash);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Upload failed: ${response.status}`);
            }

            const result = await response.json();
            setAnalyticsData(result);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsScanning(false);
        }
    };

    const handleScan = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const getRiskColor = (score: string) => {
        const scoreNum = parseInt(score);
        if (scoreNum <= 70) {
            return 'text-green-400';
        } else if (scoreNum >= 50) {
            return 'text-yellow-400';
        } else {
            return 'text-red-400';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <nav
                className={`px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm transition-all duration-1000 ${
                    isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            >
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div
                        className={`flex items-center space-x-3 transition-all duration-1000 delay-200 ${
                            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                        }`}
                    >
                        <div className="w-10 h-10 transform hover:scale-110 hover:rotate-12 transition-all duration-300">
                            <img
                                src="/favicon.jpg"
                                alt="Safeturned Logo"
                                className="w-full h-full object-contain rounded-lg"
                                onLoad={() => console.log('Logo loaded successfully')}
                                onError={(e) => {
                                    console.error('Failed to load logo image:', e.currentTarget.src);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                        <span className="text-xl font-bold animate-pulse">{t('hero.title')}</span>
                    </div>
                    <div
                        className={`hidden md:flex space-x-6 transition-all duration-1000 delay-300 ${
                            isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                        }`}
                    >
                        <a
                            href="#features"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group flex items-center"
                        >
                            {t('nav.features')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <a
                            href="#how-it-works"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group flex items-center"
                        >
                            {t('nav.howItWorks')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <a
                            href="#contact"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group flex items-center"
                        >
                            {t('nav.contacts')}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="px-6 py-20">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-8">
                        <h1
                            className={`text-5xl md:text-7xl font-bold mb-6 text-white transition-all duration-1000 delay-500 ${
                                isLoaded
                                    ? 'translate-y-0 opacity-100 scale-100'
                                    : 'translate-y-20 opacity-0 scale-95'
                            }`}
                        >
                            {t('hero.title')
                                .split('')
                                .map((char: string, index: number) => (
                                    <span
                                        key={index}
                                        className={`inline-block transition-all duration-500 hover:scale-125 hover:-translate-y-2 hover:text-pink-300`}
                                        style={{
                                            animationDelay: `${600 + index * 100}ms`,
                                            animation: isLoaded
                                                ? 'slideInUp 0.8s ease-out forwards'
                                                : 'none',
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
                        </h1>
                        <p
                            className={`text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${
                                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                        >
                            {t('hero.subtitle')}
                        </p>
                    </div>

                    {/* Upload Section */}
                    <div
                        className={`max-w-2xl mx-auto mb-12 transition-all duration-1000 delay-900 ${
                            isLoaded
                                ? 'translate-y-0 opacity-100 scale-100'
                                : 'translate-y-20 opacity-0 scale-95'
                        }`}
                    >
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                            <div
                                className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 hover:border-purple-400/70 transition-all duration-300 cursor-pointer hover:bg-purple-500/5 group"
                                onClick={handleScan}
                            >
                                                                 <input
                                     ref={fileInputRef}
                                     type="file"
                                     accept=".dll"
                                     onChange={handleFileChange}
                                     className="hidden"
                                 />

                                <svg
                                    className="w-12 h-12 text-purple-400 mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:text-pink-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <p className="text-lg mb-2">{t('hero.uploadTitle')}</p>
                                <p className="text-gray-400 text-sm mb-4">
                                    {t('hero.uploadSubtitle')}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleScan();
                                    }}
                                    disabled={isScanning}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 disabled:hover:scale-100"
                                >
                                    {isScanning ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            {t('hero.scanning')}
                                        </span>
                                    ) : (
                                        t('hero.scanButton')
                                    )}
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-5 h-5 text-red-400 mr-2"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-red-300">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Results Display */}
                            {analyticsData && (
                                <div className="mt-6 p-6 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                                    <h3 className="text-xl font-semibold mb-4 text-white">
                                        {t('results.title')}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-400">
                                                {analyticsData.fileName}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {t('results.fileName')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-400">
                                                {analyticsData.score}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {t('results.score')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className={`text-2xl font-bold ${getRiskColor(analyticsData.score.toString())}`}
                                            >
                                                {analyticsData.score <= 70
                                                    ? t('results.safe')
                                                    : t('results.unsafe')}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {t('results.riskLevel')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-blue-400">
                                                {formatFileSize(analyticsData.fileSizeBytes)}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {t('results.fileSize')}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-semibold text-gray-400">
                                                {new Date(analyticsData.processedAt).toLocaleString(
                                                    locale === 'ru' ? 'ru-RU' : 'en-US',
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {t('results.processingTime')}
                                            </div>
                                        </div>
                                    </div>

                                    {analyticsData.checked && analyticsData.checked.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2 text-white">
                                                {t('results.checkedItemsTitle')}
                                            </h4>
                                            <ul className="space-y-1">
                                                {analyticsData.checked.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="text-gray-300 text-sm flex items-start"
                                                    >
                                                        <span className="text-yellow-400 mr-2">
                                                            •
                                                        </span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-4 text-xs text-gray-500">
                                        {analyticsData.message}
                                    </div>
                                    <div className="mt-4 flex gap-3 justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!fileHash) {
                                                    alert('Хеш ещё не готов');
                                                    return;
                                                }
                                                const shareUrl = `${window.location.origin}/${locale}/result/${encodeURIComponent(fileHash)}`;
                                                navigator.clipboard
                                                    .writeText(shareUrl)
                                                    .then(() => {
                                                        alert('Ссылка скопирована в буфер обмена');
                                                    })
                                                    .catch(() => {
                                                        console.warn('Clipboard copy failed');
                                                    });
                                            }}
                                            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
                                        >
                                            Поделиться
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div
                        className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1100 ${
                            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                        }`}
                    >
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-slate-800/50 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group cursor-pointer">
                            <div className="text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                                {systemAnalytics ? systemAnalytics.totalFilesScanned.toLocaleString() : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                                {t('stats.checkedPlugins')}
                            </div>
                        </div>
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-slate-800/50 hover:border-red-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group cursor-pointer">
                            <div className="text-3xl font-bold text-red-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                                {systemAnalytics ? systemAnalytics.totalThreatsDetected.toLocaleString() : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                                {t('stats.threatsDetected')}
                            </div>
                        </div>
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:bg-slate-800/50 hover:border-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 group cursor-pointer">
                            <div
                                className={`text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 ${systemAnalytics ? (systemAnalytics.detectionAccuracy >= 95 ? 'text-green-400' : systemAnalytics.detectionAccuracy >= 80 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-400'}`}
                            >
                                {systemAnalytics ? `${systemAnalytics.detectionAccuracy.toFixed(1)}%` : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                                {t('stats.detectionAccuracy')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-20 bg-slate-800/20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16 opacity-0 animate-fadeInUp">
                        {t('features.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 opacity-0 animate-slideInLeft group cursor-pointer"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors duration-300">
                                {t('features.codeAnalysis')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                {t('features.codeAnalysisDescription')}
                            </p>
                        </div>
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:bg-slate-800/70 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 opacity-0 animate-slideInUp group cursor-pointer"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-pink-300 transition-colors duration-300">
                                {t('features.threatDetection')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                {t('features.threatDetectionDescription')}
                            </p>
                        </div>
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:bg-slate-800/70 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 opacity-0 animate-slideInRight group cursor-pointer"
                            style={{ animationDelay: '0.6s' }}
                        >
                            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 group-hover:text-green-300 transition-colors duration-300">
                                {t('features.fastCheck')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                {t('features.fastCheckDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-16 opacity-0 animate-fadeInUp">
                        {t('howItWorks.title')}
                    </h2>
                    <div className="space-y-12">
                        <div
                            className="flex flex-col md:flex-row items-center gap-8 opacity-0 animate-slideInLeft group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-purple-500/50">
                                1
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition-colors duration-300">
                                    {t('howItWorks.step1.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                    {t('howItWorks.step1.description')}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col md:flex-row items-center gap-8 opacity-0 animate-slideInRight group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-pink-500/50">
                                2
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-300 transition-colors duration-300">
                                    {t('howItWorks.step2.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                    {t('howItWorks.step2.description')}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col md:flex-row items-center gap-8 opacity-0 animate-slideInLeft group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.6s' }}
                        >
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-green-500/50">
                                3
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-green-300 transition-colors duration-300">
                                    {t('howItWorks.step3.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300">
                                    {t('howItWorks.step3.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="px-6 py-12 border-t border-purple-800/30">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-8 opacity-0 animate-fadeInUp">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center hover:scale-110 hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold hover:text-purple-300 transition-colors duration-300">
                                {t('hero.title')}
                            </span>
                        </div>
                        <p className="text-gray-400 mb-6 hover:text-gray-300 transition-colors duration-300">
                            {t('footer.protectionMessage')}
                        </p>
                    </div>
                    <div className="text-gray-500 text-sm hover:text-gray-400 transition-colors duration-300">
                        © {new Date().getFullYear()} Safeturned. {t('footer.allRightsReserved')}.
                    </div>
                </div>
            </footer>
        </div>
    );
}
