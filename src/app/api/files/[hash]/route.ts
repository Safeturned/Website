import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult } from '../../storage';

export async function GET(request: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        const { hash } = await params;
        
        // First try to get from local storage
        let result = getAnalysisResult(hash);

        if (result) {
            return NextResponse.json(result);
        }

        // If not found locally, try to fetch from upstream API
        try {
            const response = await fetch(`https://safeturnedapi.unturnedguard.com/v1.0/files/${hash}`);
            
            if (response.ok) {
                const upstreamResult = await response.json();
                
                // Store the result locally for future requests
                storeAnalysisResult(hash, upstreamResult);
                
                return NextResponse.json(upstreamResult);
            }
        } catch (upstreamError) {
            // Silently fail and continue to return 404
        }

        return NextResponse.json(
            { error: 'Analysis not found' },
            { status: 404 }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 