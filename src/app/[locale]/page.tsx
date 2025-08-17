'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface AnalyticsData {
    fileName: string;
    score: number;
    checked: string[];
    message: string;
    lastScanned: string;
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
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showConfirmUpload, setShowConfirmUpload] = useState(false);
    const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragEnterCount, setDragEnterCount] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSystemAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics');
            
            if (response.ok) {
                const data = await response.json();
                setSystemAnalytics(data);
            }
        } catch (error) {
            // Silently handle analytics fetch errors
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
        // Use standard base64 to match the API's Convert.ToBase64String
        return base64;
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check file size (500MB limit)
            if (file.size > 500 * 1024 * 1024) {
                setError(t('errors.fileTooLarge'));
                return;
            }
            
            setSelectedFile(file);
            setShowConfirmUpload(true);
            setError(null);
        }
    };

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
                if (file.size > 500 * 1024 * 1024) {
                    setError(t('errors.fileTooLarge'));
                    return;
                }
                setSelectedFile(file);
                setShowConfirmUpload(true);
                setError(null);
            } else {
                setError('Please select a .dll file');
            }
        }
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        
        setIsScanning(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile, selectedFile.name);

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
                hash = await computeFileHash(selectedFile);
                // Convert to URL-safe base64 for the URL
                hash = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            }
            
                         // Redirect to results page immediately
             router.push(`/${locale}/result/${hash}`);
            return;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsScanning(false);
        }
    };

    const handleScan = () => {
        fileInputRef.current?.click();
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
        <div 
            className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
        >
            {/* Header */}
            <nav
                className={`px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm transition-all duration-1000 ${
                    isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            >
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div
                        className={`flex items-center space-x-3 md:space-x-3 space-x-4 transition-all duration-1000 delay-200 ${
                            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                        }`}
                    >
                        <div 
                            className="w-10 h-10 transform hover:scale-110 hover:rotate-12 transition-all duration-300 select-none"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                        >
                            <Image
                                src="/favicon.jpg"
                                alt="Safeturned Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain rounded-lg pointer-events-none"
                                                                 onError={(e) => {
                                     e.currentTarget.style.display = 'none';
                                 }}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
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
                                                     <a
                               href="https://github.com/Safeturned/Website"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group flex items-center"
                               title={t('github.tooltip')}
                           >
                               <svg
                                   className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                   fill="currentColor"
                                   viewBox="0 0 24 24"
                               >
                                   <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                               </svg>
                           </a>
                           <a
                               href="https://discord.gg/JAKWGEabhc"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group flex items-center"
                               title="Join our Discord Community"
                           >
                               <svg
                                   className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                   fill="currentColor"
                                   viewBox="0 0 24 24"
                               >
                                   <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                               </svg>
                           </a>
                           <LanguageSwitcher />
                     </div>
                     
                                                                  {/* Mobile Navigation */}
                       <div className="md:hidden flex items-center space-x-6">
                           <a
                               href="https://github.com/Safeturned/Website"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                               title={t('github.tooltip')}
                           >
                               <svg
                                   className="w-5 h-5 group-hover:rotate-12 transition-all duration-300"
                                   fill="currentColor"
                                   viewBox="0 0 24 24"
                               >
                                   <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                               </svg>
                           </a>
                           <a
                               href="https://discord.gg/JAKWGEabhc"
                               target="_blank"
                               rel="noopener noreferrer"
                               className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                               title="Join our Discord Community"
                           >
                               <svg
                                   className="w-5 h-5 group-hover:rotate-12 transition-all duration-300"
                                   fill="currentColor"
                                   viewBox="0 0 24 24"
                               >
                                   <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                               </svg>
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
                            className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-white transition-all duration-1000 delay-500 ${
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
                            className={`text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-700 ${
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
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 md:p-8 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105">
                                                        {!showConfirmUpload ? (
                                <div
                                    className="border-2 border-dashed border-purple-500/50 rounded-xl p-4 md:p-8 hover:border-purple-400/70 transition-all duration-300 cursor-pointer hover:bg-purple-500/5 group relative"
                                    onClick={handleScan}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".dll"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <svg
                                        className="w-8 h-8 md:w-12 md:h-12 text-purple-400 mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:text-pink-400"
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
                                    <p className="text-base md:text-lg mb-2">{t('hero.uploadTitle')}</p>
                                    <p className="text-gray-400 text-xs md:text-sm mb-4">
                                        {t('hero.uploadSubtitle')}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleScan();
                                        }}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 text-sm md:text-base"
                                    >
                                        {t('hero.scanButton')}
                                    </button>
                                    
                                                                         {/* Hover tooltip for file size limit */}
                                     <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                         <div className="bg-slate-800/95 backdrop-blur-sm border border-purple-500/50 rounded-lg px-2 py-1 text-xs text-gray-300 whitespace-nowrap shadow-lg">
                                             {t('hero.maxFileSize')}
                                         </div>
                                     </div>
                                </div>
                            ) : (
                                <div className="border-2 border-solid border-purple-500/50 rounded-xl p-8 bg-purple-500/5">
                                    <div className="text-center mb-6">
                                        <svg
                                            className="w-12 h-12 text-purple-400 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                                                                 <h3 className="text-lg md:text-xl font-semibold mb-2">{t('hero.fileSelected')}</h3>
                                         <p className="text-gray-400 truncate max-w-full text-sm md:text-base" title={selectedFile?.name}>{selectedFile?.name}</p>
                                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                                            {selectedFile ? formatFileSize(selectedFile.size) : '0 Bytes'}
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleConfirmUpload}
                                            disabled={isScanning}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95 disabled:hover:scale-100 text-sm md:text-base"
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
                                                    {t('hero.scanning')}...
                                                </span>
                                            ) : (
                                                t('hero.confirmUpload')
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

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

                             
                        </div>
                    </div>

                    {/* Consent Notice */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {t('consent.prefix')}
                                                                 <Link href={`/${locale}/terms`} className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200">
                                     {t('consent.termsOfService')}
                                 </Link>
                                 {t('consent.and')}
                                 <Link href={`/${locale}/privacy`} className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200">
                                     {t('consent.privacyNotice')}
                                 </Link>
                                 {t('consent.suffix')}
                                 <Link href={`/${locale}/privacy`} className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200">
                                     {t('consent.learnMore')}
                                 </Link>
                                {t('consent.suffix2')}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div
                        className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto transition-all duration-1000 delay-1100 ${
                            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                        }`}
                    >
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 md:p-6 hover:bg-slate-800/50 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group cursor-pointer">
                            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                                {systemAnalytics ? systemAnalytics.totalFilesScanned.toLocaleString() : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300 text-sm md:text-base">
                                {t('stats.checkedPlugins')}
                            </div>
                        </div>
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 md:p-6 hover:bg-slate-800/50 hover:border-red-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group cursor-pointer">
                            <div className="text-2xl md:text-3xl font-bold text-red-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                                {systemAnalytics ? systemAnalytics.totalThreatsDetected.toLocaleString() : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300 text-sm md:text-base">
                                {t('stats.threatsDetected')}
                            </div>
                        </div>
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 md:p-6 hover:bg-slate-800/50 hover:border-green-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 group cursor-pointer">
                            <div
                                className={`text-2xl md:text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 ${systemAnalytics ? (systemAnalytics.detectionAccuracy >= 95 ? 'text-green-400' : systemAnalytics.detectionAccuracy >= 80 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-400'}`}
                            >
                                {systemAnalytics ? `${systemAnalytics.detectionAccuracy.toFixed(1)}%` : '...'}
                            </div>
                            <div className="text-gray-300 group-hover:text-white transition-colors duration-300 text-sm md:text-base">
                                {t('stats.detectionAccuracy')}
                            </div>
                        </div>
                    </div>
                    
                    {/* Last Updated Info */}
                    {systemAnalytics && systemAnalytics.lastUpdated && (
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">
                                {t('analytics.lastUpdated')}: {new Date(systemAnalytics.lastUpdated).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-12 md:py-20 bg-slate-800/20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16 opacity-0 animate-fadeInUp">
                        {t('features.title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 opacity-0 animate-slideInLeft group cursor-pointer"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-5 h-5 md:w-6 md:h-6 text-white"
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
                            <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors duration-300">
                                {t('features.codeAnalysis')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                {t('features.codeAnalysisDescription')}
                            </p>
                        </div>
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20 opacity-0 animate-slideInUp group cursor-pointer"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-5 h-5 md:w-6 md:h-6 text-white"
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
                            <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-pink-300 transition-colors duration-300">
                                {t('features.threatDetection')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                {t('features.threatDetectionDescription')}
                            </p>
                        </div>
                        <div
                            className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 md:p-6 hover:bg-slate-800/70 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 opacity-0 animate-slideInRight group cursor-pointer"
                            style={{ animationDelay: '0.6s' }}
                        >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                <svg
                                    className="w-5 h-5 md:w-6 md:h-6 text-white"
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
                            <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-green-300 transition-colors duration-300">
                                {t('features.fastCheck')}
                            </h3>
                            <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                {t('features.fastCheckDescription')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="px-6 py-12 md:py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-16 opacity-0 animate-fadeInUp">
                        {t('howItWorks.title')}
                    </h2>
                    <div className="space-y-8 md:space-y-12">
                        <div
                            className="flex flex-col md:flex-row items-center gap-6 md:gap-8 opacity-0 animate-slideInLeft group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.2s' }}
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-purple-500/50">
                                1
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-purple-300 transition-colors duration-300">
                                    {t('howItWorks.step1.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                    {t('howItWorks.step1.description')}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col md:flex-row items-center gap-6 md:gap-8 opacity-0 animate-slideInRight group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.4s' }}
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-pink-500/50">
                                2
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-pink-300 transition-colors duration-300">
                                    {t('howItWorks.step2.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                    {t('howItWorks.step2.description')}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex flex-col md:flex-row items-center gap-6 md:gap-8 opacity-0 animate-slideInLeft group hover:scale-105 transition-all duration-300"
                            style={{ animationDelay: '0.6s' }}
                        >
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-green-500/50">
                                3
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-green-300 transition-colors duration-300">
                                    {t('howItWorks.step3.title')}
                                </h3>
                                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-sm md:text-base">
                                    {t('howItWorks.step3.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="px-6 py-8 md:py-12 border-t border-purple-800/30">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-6 md:mb-8 opacity-0 animate-fadeInUp">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div 
                                className="w-8 h-8 transform hover:scale-110 hover:rotate-12 transition-all duration-300 select-none"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                            >
                                <Image
                                    src="/favicon.jpg"
                                    alt="Safeturned Logo"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain rounded-lg pointer-events-none"
                                    draggable={false}
                                    onContextMenu={(e) => e.preventDefault()}
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            </div>
                            <span className="text-lg md:text-xl font-bold hover:text-purple-300 transition-colors duration-300">
                                {t('hero.title')}
                            </span>
                        </div>
                        <p className="text-gray-400 mb-4 md:mb-6 hover:text-gray-300 transition-colors duration-300 text-sm md:text-base">
                            {t('footer.protectionMessage')}
                        </p>
                    </div>
                    <div className="text-gray-500 text-xs md:text-sm hover:text-gray-400 transition-colors duration-300 mb-3 md:mb-4">
                        © {new Date().getFullYear()} Safeturned. {t('footer.allRightsReserved')}.
                    </div>
                                         <div className="text-gray-600 text-xs max-w-2xl mx-auto leading-relaxed mb-6">
                         {t('footer.disclaimer')}
                     </div>
                     
                     {/* Social Links */}
                     <div className="flex justify-center space-x-6">
                         <a
                             href="https://github.com/Safeturned/Website"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                             title={t('github.tooltip')}
                         >
                             <svg
                                 className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                 fill="currentColor"
                                 viewBox="0 0 24 24"
                             >
                                 <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                             </svg>
                         </a>
                         <a
                             href="https://discord.gg/JAKWGEabhc"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                             title="Join our Discord Community"
                         >
                             <svg
                                 className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                 fill="currentColor"
                                 viewBox="0 0 24 24"
                             >
                                 <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                             </svg>
                         </a>
                     </div>
                 </div>
             </footer>

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
        </div>
    );
}
