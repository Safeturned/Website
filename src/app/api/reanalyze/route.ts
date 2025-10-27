import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult, getStoredFile } from '../storage';

export async function POST(request: NextRequest) {
    try {
        const { fileHash } = await request.json();

        if (!fileHash) {
            return NextResponse.json({ error: 'File hash is required' }, { status: 400 });
        }

        let existingResult = getAnalysisResult(fileHash);

        if (!existingResult) {
            const originalHash = fileHash.replace(/-/g, '+').replace(/_/g, '/');
            existingResult = getAnalysisResult(originalHash);
        }

        if (!existingResult) {
            const urlSafeHash = fileHash
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/g, '');
            existingResult = getAnalysisResult(urlSafeHash);
        }

        if (!existingResult) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }

        let storedFile = getStoredFile(fileHash);

        if (!storedFile) {
            const originalHash = fileHash.replace(/-/g, '+').replace(/_/g, '/');
            storedFile = getStoredFile(originalHash);
        }

        if (!storedFile) {
            const urlSafeHash = fileHash
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/g, '');
            storedFile = getStoredFile(urlSafeHash);
        }

        if (!storedFile) {
            return NextResponse.json(
                { error: 'Original file not available for reanalysis' },
                { status: 400 }
            );
        }

        const apiKey = process.env.SAFETURNED_API_KEY;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiKey) {
            console.error('SAFETURNED_API_KEY environment variable is not set');
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL environment variable is not set');
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        const formData = new FormData();
        formData.append('forceAnalyze', 'true');
        const fileBlob = new Blob([storedFile.fileData], { type: storedFile.mimeType });
        const recreatedFile = new File([fileBlob], storedFile.fileName, {
            type: storedFile.mimeType,
        });
        formData.append('file', recreatedFile);

        const url = new URL(`${apiUrl}/v1.0/files`);
        url.searchParams.append('forceAnalyze', 'true');
        const headers: Record<string, string> = {
            'X-API-Key': apiKey,
        };

        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');

        if (origin) {
            headers['Origin'] = origin;
        }
        if (referer) {
            headers['Referer'] = referer;
        }

        const existingForwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');

        if (realIP) {
            const newForwardedFor = existingForwardedFor
                ? `${existingForwardedFor}, ${realIP}`
                : realIP;
            headers['X-Forwarded-For'] = newForwardedFor;
        } else if (existingForwardedFor) {
            headers['X-Forwarded-For'] = existingForwardedFor;
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                {
                    error: `Reanalysis failed: ${response.status} ${response.statusText} - ${errorText}`,
                },
                { status: response.status }
            );
        }

        const result = await response.json();

        const hashToUse = existingResult.id || fileHash;
        storeAnalysisResult(hashToUse, result);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Reanalysis error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
