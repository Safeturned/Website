import { NextRequest, NextResponse } from 'next/server';
import { storeAnalysisResult, storeFile } from '../storage';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const forceAnalyze = formData.get('forceAnalyze') === 'true';
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
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

        const response = await fetch(`${apiUrl}/v1.0/files`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API upload failed:', response.status, errorText);
            return NextResponse.json(
                { error: `Upload failed: ${response.status} ${response.statusText} - ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        
        // Generate a unique ID for this analysis
        const analysisId = result.fileHash ? 
            result.fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') : 
            Date.now().toString();
        
        // Store the analysis result with the ID
        storeAnalysisResult(analysisId, result);
        
        // Store the original file for potential reanalysis - convert File to ArrayBuffer
        const fileArrayBuffer = await file.arrayBuffer();
        storeFile(analysisId, fileArrayBuffer, file.name, file.type);
        
        // Return the result with the ID
        return NextResponse.json({
            ...result,
            id: analysisId
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

 