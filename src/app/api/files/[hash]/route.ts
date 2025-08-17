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

            const response = await fetch(`${apiUrl}/v1.0/files/${hash}`, {
                headers
            });
            
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