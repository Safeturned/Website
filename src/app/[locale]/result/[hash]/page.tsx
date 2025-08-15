'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '../../../../hooks/useTranslation';

interface AnalyticsData {
    fileName: string;
    score: number;
    checked: string[] | boolean;
    message: string;
    processedAt: string;
    fileSizeBytes: number;
}

export default function ResultByHashPage() {
    const { t } = useTranslation();
    const params = useParams();
    const hash = params.hash as string;
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/files/${encodeURIComponent(hash)}`);
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt || `Failed: ${res.status}`);
                }
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        if (hash) load();
    }, [hash]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{t('results.title')}</h1>
                {loading && <div className="text-gray-400">Loading...</div>}
                {error && (
                    <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300">
                        {error}
                    </div>
                )}
                {data && (
                    <div className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="text-purple-300">
                            {t('results.fileName')}:{' '}
                            <span className="text-white">{data.fileName}</span>
                        </div>
                        <div className="text-red-300">
                            {t('results.score')}: <span className="text-white">{data.score}</span>
                        </div>
                        <div className="text-gray-300">
                            {t('results.fileSize')}:{' '}
                            <span className="text-white">
                                {(data.fileSizeBytes / 1024).toFixed(2)} KB
                            </span>
                        </div>
                        <div className="text-gray-300">
                            {t('results.processingTime')}:{' '}
                            <span className="text-white">
                                {new Date(data.processedAt).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-gray-400 text-sm">{data.message}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
