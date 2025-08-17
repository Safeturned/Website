import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult, getStoredFile } from '../storage';

export async function POST(request: NextRequest) {
    try {
        const { fileHash, forceAnalyze } = await request.json();

        if (!fileHash) {
            return NextResponse.json(
                { error: 'File hash is required' },
                { status: 400 }
            );
        }

        // Get the existing analysis result - try both the original hash and URL-safe version
        let existingResult = getAnalysisResult(fileHash);
        
        // If not found, try converting from URL-safe to original format
        if (!existingResult) {
            const originalHash = fileHash.replace(/-/g, '+').replace(/_/g, '/');
            existingResult = getAnalysisResult(originalHash);
        }
        
        // If still not found, try converting from original to URL-safe format
        if (!existingResult) {
            const urlSafeHash = fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            existingResult = getAnalysisResult(urlSafeHash);
        }
        
        if (!existingResult) {
            return NextResponse.json(
                { error: 'Analysis not found' },
                { status: 404 }
            );
        }

        // Get the stored original file - try the same hash variations
        let storedFile = getStoredFile(fileHash);
        
        if (!storedFile) {
            const originalHash = fileHash.replace(/-/g, '+').replace(/_/g, '/');
            storedFile = getStoredFile(originalHash);
        }
        
        if (!storedFile) {
            const urlSafeHash = fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
            storedFile = getStoredFile(urlSafeHash);
        }
        
        if (!storedFile) {
            return NextResponse.json(
                { error: 'Original file not available for reanalysis' },
                { status: 400 }
            );
        }

        // Get API key and URL from environment variables
        const apiKey = process.env.SAFETURNED_API_KEY;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        if (!apiKey) {
            console.error('SAFETURNED_API_KEY environment variable is not set');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL environment variable is not set');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        // Create FormData with the original file and forceAnalyze=true
        const formData = new FormData();
        formData.append('forceAnalyze', 'true');
        
        // Recreate the File from stored ArrayBuffer
        const fileBlob = new Blob([storedFile.fileData], { type: storedFile.mimeType });
        const recreatedFile = new File([fileBlob], storedFile.fileName, { type: storedFile.mimeType });
        formData.append('file', recreatedFile);

        // Try sending forceAnalyze as a query parameter instead
        const url = new URL(`${apiUrl}/v1.0/files`);
        url.searchParams.append('forceAnalyze', 'true');

        // Forward the original headers from the client
        const headers: Record<string, string> = {
            'X-API-Key': apiKey
        };

        // Forward origin and referer if they exist
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        
        if (origin) {
            headers['Origin'] = origin;
        }
        if (referer) {
            headers['Referer'] = referer;
        }

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Reanalysis failed: ${response.status} ${response.statusText} - ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();

        // Update the stored result with the new analysis - store with the same hash format that was found
        const hashToUse = existingResult.id || fileHash;
        storeAnalysisResult(hashToUse, result);

        // Return the updated result
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
