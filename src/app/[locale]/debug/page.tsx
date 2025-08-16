'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VersionInfo {
    version: string;
    buildTime: number;
    buildDate: string;
    deployedAt: string;
    environment: string;
}

export default function DebugPage() {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch('/api/version');
                if (response.ok) {
                    const data = await response.json();
                    setVersionInfo(data);
                } else {
                    setError('Failed to fetch version info');
                }
            } catch (err) {
                setError('Error fetching version info');
            } finally {
                setLoading(false);
            }
        };

        fetchVersion();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p>Loading debug information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Debug Information</h1>
                
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Build Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm">Version:</label>
                            <p className="text-white font-mono">{versionInfo?.version}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Environment:</label>
                            <p className="text-white font-mono">{versionInfo?.environment}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Build Time:</label>
                            <p className="text-white font-mono">{versionInfo?.buildTime}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Build Date:</label>
                            <p className="text-white font-mono">{versionInfo?.buildDate}</p>
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm">Deployed At:</label>
                            <p className="text-white font-mono">{versionInfo?.deployedAt}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Cache Status</h2>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span>Page Cache:</span>
                            <span className="text-green-400">Disabled (Dynamic)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Browser Cache:</span>
                            <span className="text-yellow-400">Check Headers</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Docker Cache:</span>
                            <span className="text-green-400">Cleared on Deploy</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
                        >
                            Hard Refresh Page
                        </button>
                        <button 
                            onClick={() => {
                                if ('caches' in window) {
                                    caches.keys().then(names => {
                                        names.forEach(name => {
                                            caches.delete(name);
                                        });
                                        alert('Browser cache cleared!');
                                    });
                                } else {
                                    alert('Cache API not available');
                                }
                            }} 
                            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                        >
                            Clear Browser Cache
                        </button>
                        <Link 
                            href="/" 
                            className="block w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors text-center"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
