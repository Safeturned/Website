'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '../../../../hooks/useTranslation';
import LanguageSwitcher from '../../../../components/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';

interface AnalyticsData {
    fileName: string;
    score: number;
    checked: string[];
    message: string;
    processedAt: string;
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


    useEffect(() => {
        if (hash) {
            // First check if we have a fresh upload result in sessionStorage
            const uploadResult = sessionStorage.getItem('uploadResult');
            if (uploadResult) {
                try {
                    const data = JSON.parse(uploadResult);
                    setAnalyticsData(data);
                    setLoading(false);
                    // Clear the sessionStorage after using it
                    sessionStorage.removeItem('uploadResult');
                    return;
                } catch (err) {
                    sessionStorage.removeItem('uploadResult');
                }
            }
            
            // If no upload result, fetch from API
            fetchAnalysisResult(hash);
        }
    }, [hash]);

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setDragEnterCount(prev => prev + 1);
        setIsDragOver(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragEnterCount(prev => {
            const newCount = prev - 1;
            // Only hide overlay when we've completely left the drop zone
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
                if (file.size > 1024 * 1024 * 1024) {
                    alert(t('errors.fileTooLarge'));
                    return;
                }
                setDragFile(file);
                setShowDragUpload(true);
            } else {
                alert('Please select a .dll file');
            }
        }
    };

    // File upload functions
    async function computeFileHash(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const bytes = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        // Use standard base64 to match the API's Convert.ToBase64String
        return base64;
    }

    const handleDragUpload = async () => {
        if (!dragFile) return;
        
        setIsUploading(true);
        
        try {
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
            
            // The upload response contains the analysis results directly
            // Store the result in sessionStorage so the results page can access it
            sessionStorage.setItem('uploadResult', JSON.stringify(result));
            
            // Use the ID from the API response
            let hash;
            if (result.id) {
                hash = result.id;
            } else if (result.fileHash) {
                hash = result.fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            } else if (result.hash) {
                hash = result.hash;
            } else {
                hash = await computeFileHash(dragFile);
                // Convert to URL-safe base64 for the URL
                hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            }
            
            // Check if we're already on the correct page
            if (hash === params.hash) {
                // Store the result and refresh the page data
                sessionStorage.setItem('uploadResult', JSON.stringify(result));
                // Force a page refresh to show the new data
                window.location.reload();
            } else {
                // Redirect to results page
                router.push(`/${params.locale}/result/${hash}`);
            }
            return;
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelDragUpload = () => {
        setDragFile(null);
        setShowDragUpload(false);
    };

    const fetchAnalysisResult = async (fileHash: string) => {
        setLoading(true);
        setError(null);
        
        try {
            // The hash from URL is already URL-safe base64, pass it directly to our API
            const response = await fetch(`/api/files/${fileHash}`);
            
            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data);
            } else {
                setError('Analysis not found');
            }
        } catch (err) {
            setError('Failed to load analysis');
        } finally {
            setLoading(false);
        }
    };

    const handleHashSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchHash.trim()) {
            // Convert standard base64 to URL-safe base64 for the URL
            const urlSafeHash = searchHash.trim().replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            router.push(`/${params.locale}/result/${urlSafeHash}`);
        }
    };

    const getRiskColor = (score: number) => {
        if (score <= 70) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getRiskLevel = (score: number) => {
        if (score <= 70) return t('results.safe');
        if (score >= 50) return t('results.suspicious');
        return t('results.unsafe');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                        <p className="text-gray-300">{t('results.loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analyticsData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold mb-2">{t('results.notFound')}</h1>
                        <p className="text-gray-300 mb-6">{t('results.notFoundDescription')}</p>
                        <Link 
                            href={`/${params.locale}`}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300"
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
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
        >
            {/* Header */}
            <nav className="px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href={`/${params.locale}`} className="flex items-center space-x-3">
                        <div className="w-10 h-10">
                            <Image
                                src="/favicon.jpg"
                                alt="Safeturned Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>
                        <span className="text-xl font-bold">{t('hero.title')}</span>
                    </Link>
                    <LanguageSwitcher />
                </div>
            </nav>

            {/* Hash Search Bar */}
            <div className="px-6 py-6 bg-slate-800/20 border-b border-purple-800/30">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleHashSearch} className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchHash}
                                onChange={(e) => setSearchHash(e.target.value)}
                                placeholder={t('results.searchPlaceholder')}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                        >
                            {t('results.search')}
                        </button>
                    </form>
                    <div className="mt-3 text-center">
                        <p className="text-sm text-gray-400">
                            {t('dragDrop.tip')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* File Info Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{analyticsData.fileName}</h1>
                            <p className="text-gray-400">SHA-256: {hash}</p>
                        </div>
                        <div className={`text-right ${getRiskColor(analyticsData.score)}`}>
                            <div className="text-3xl font-bold">{analyticsData.score}</div>
                            <div className="text-sm">{getRiskLevel(analyticsData.score)}</div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-gray-400">{t('results.fileSize')}:</span>
                            <span className="ml-2 text-white">{formatFileSize(analyticsData.fileSizeBytes)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">{t('results.analysisDate')}:</span>
                            <span className="ml-2 text-white">
                                {new Date(analyticsData.processedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400">{t('results.analysisTime')}:</span>
                            <span className="ml-2 text-white">
                                {new Date(analyticsData.processedAt).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Analysis Results */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">{t('results.analysisResults')}</h2>
                    
                    {analyticsData.checked && analyticsData.checked.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-white">{t('results.checkedItemsTitle')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {analyticsData.checked.map((item, index) => (
                                    <div key={index} className="flex items-center text-sm">
                                        <span className="text-yellow-400 mr-2">•</span>
                                        <span className="text-gray-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-gray-400">
                        {analyticsData.message}
                    </div>
                </div>

                {/* Share Section - Mobile Only */}
                <div className="mt-8 text-center md:hidden">
                    <p className="text-gray-400 mb-4">{t('results.shareDescription')}</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => {
                                const shareUrl = `${window.location.origin}/${params.locale}/result/${hash}`;
                                
                                // Only use native share API on mobile devices
                                if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                                    navigator.share({
                                        title: `${t('results.shareTitle')} - ${analyticsData.fileName}`,
                                        text: `${t('results.shareText')} ${analyticsData.fileName} (${getRiskLevel(analyticsData.score)})`,
                                        url: shareUrl,
                                    }).catch((error) => {
                                        // Only fall back to clipboard if share was cancelled by user
                                        if (error.name !== 'AbortError') {
                                            navigator.clipboard.writeText(shareUrl);
                                            alert(t('results.linkCopied'));
                                        }
                                    });
                                } else {
                                    // Fallback for devices without native share
                                    navigator.clipboard.writeText(shareUrl);
                                    alert(t('results.linkCopied'));
                                }
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                            </svg>
                            <span>{t('results.shareButton')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Drag Overlay */}
            {isDragOver && (
                <div className="fixed inset-0 bg-purple-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">📁</div>
                        <h2 className="text-2xl font-bold text-white mb-2">{t('dragDrop.overlayTitle')}</h2>
                        <p className="text-gray-300">{t('dragDrop.overlayDescription')}</p>
                    </div>
                </div>
            )}

            {/* Drag Upload Modal */}
            {showDragUpload && dragFile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-slate-800/95 border border-purple-500/50 rounded-xl p-8 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-4">📄</div>
                            <h3 className="text-xl font-semibold mb-2">{t('hero.fileSelected')}</h3>
                            <p className="text-gray-400">{dragFile.name}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatFileSize(dragFile.size)}
                            </p>
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleDragUpload}
                                disabled={isUploading}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                            >
                                                                                                 {isUploading ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                                    t('hero.confirmUpload')
                                )}
                            </button>
                            <button
                                onClick={handleCancelDragUpload}
                                disabled={isUploading}
                                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                            >
                                Cancel
                            </button>
                                                 </div>
                         
                         
                     </div>
                 </div>
             )}
        </div>
    );
}
