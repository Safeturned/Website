import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult } from '../../storage';
import { createRateLimiter, getClientIP } from '../../../../lib/rateLimit';

// Rate limiting: 100 requests per minute per IP
const filesRateLimit = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        // Apply rate limiting
        const clientIP = getClientIP(request);
        const rateLimitResult = filesRateLimit(clientIP);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '100',
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const { hash } = await params;
        
        // Validate hash parameter
        if (!hash || typeof hash !== 'string' || hash.length < 10) {
            return NextResponse.json(
                { error: 'Invalid hash parameter' },
                { status: 400 }
            );
        }

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

            for (const hashFormat of hashFormats) {
                const apiUrlWithHash = `${apiUrl}/v1.0/files/${hashFormat}`;
                
                const response = await fetch(apiUrlWithHash, {
                    headers
                });
                
                if (response.ok) {
                    const upstreamResult = await response.json();
                    
                    // Store the result locally for future requests (use original hash)
                    storeAnalysisResult(hash, upstreamResult);
                    
                    return NextResponse.json(upstreamResult);
                }
            }
        } catch (upstreamError) {
            console.error('Error fetching from API:', upstreamError);
            // Silently fail and continue to return 404
        }

        return NextResponse.json(
            { error: 'Analysis not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 