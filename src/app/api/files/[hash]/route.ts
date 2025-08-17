import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult } from '../../storage';

export async function GET(request: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        const { hash } = await params;
        
        console.log(`[Files API] Looking for hash: ${hash}`);
        
        // First try to get from local storage
        let result = getAnalysisResult(hash);

        if (result) {
            console.log(`[Files API] Found in local storage: ${hash}`);
            return NextResponse.json(result);
        }

        console.log(`[Files API] Not found in local storage, trying API: ${hash}`);

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

            // Forward the real user IP for rate limiting
            const existingForwardedFor = request.headers.get('x-forwarded-for');
            const realIP = request.headers.get('x-real-ip') || 
                          request.headers.get('cf-connecting-ip');
            
            if (realIP) {
                // Append to existing X-Forwarded-For or create new one
                const newForwardedFor = existingForwardedFor ? 
                    `${existingForwardedFor}, ${realIP}` : 
                    realIP;
                headers['X-Forwarded-For'] = newForwardedFor;
            } else if (existingForwardedFor) {
                // Keep existing if no real IP found
                headers['X-Forwarded-For'] = existingForwardedFor;
            }

            // Try different hash formats when fetching from API
            const hashFormats = [
                hash, // Original hash
                hash.replace(/-/g, '+').replace(/_/g, '/'), // URL-safe to standard
                hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '') // Standard to URL-safe
            ];

            console.log(`[Files API] Trying hash formats:`, hashFormats);

            for (const hashFormat of hashFormats) {
                const apiUrlWithHash = `${apiUrl}/v1.0/files/${hashFormat}`;
                console.log(`[Files API] Trying API URL: ${apiUrlWithHash}`);
                
                const response = await fetch(apiUrlWithHash, {
                    headers
                });
                
                console.log(`[Files API] API response status: ${response.status} for ${hashFormat}`);
                
                if (response.ok) {
                    const upstreamResult = await response.json();
                    console.log(`[Files API] Found in API, storing locally: ${hash}`);
                    
                    // Store the result locally for future requests (use original hash)
                    storeAnalysisResult(hash, upstreamResult);
                    
                    return NextResponse.json(upstreamResult);
                }
            }
            
            console.log(`[Files API] Not found in API for any hash format`);
        } catch (upstreamError) {
            console.error(`[Files API] Error fetching from API:`, upstreamError);
            // Silently fail and continue to return 404
        }

        console.log(`[Files API] Returning 404 for hash: ${hash}`);
        return NextResponse.json(
            { error: 'Analysis not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error(`[Files API] Internal error:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 