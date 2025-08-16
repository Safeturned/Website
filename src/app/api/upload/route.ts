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

        const response = await fetch('https://safeturnedapi.unturnedguard.com/v1.0/files', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
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
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

 