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

        // Create FormData with the original file and forceAnalyze=true
        const formData = new FormData();
        formData.append('forceAnalyze', 'true');
        
        // Recreate the File from stored ArrayBuffer
        const fileBlob = new Blob([storedFile.fileData], { type: storedFile.mimeType });
        const recreatedFile = new File([fileBlob], storedFile.fileName, { type: storedFile.mimeType });
        formData.append('file', recreatedFile);

        // Try sending forceAnalyze as a query parameter instead
        const url = new URL('https://safeturnedapi.unturnedguard.com/v1.0/files');
        url.searchParams.append('forceAnalyze', 'true');

        const response = await fetch(url.toString(), {
            method: 'POST',
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
