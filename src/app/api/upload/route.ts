import { NextRequest, NextResponse } from 'next/server';
import { storeAnalysisResult, storeFile } from '../storage';
import { createRateLimiter, getClientIP } from '../../../lib/rateLimit';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_FILE_TYPES = ['.dll'];

// Rate limiting: 10 uploads per minute per IP
const uploadRateLimit = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
});

export async function POST(request: NextRequest) {
    try {
        // Apply rate limiting
        const clientIP = getClientIP(request);
        const rateLimitResult = uploadRateLimit(clientIP);
        
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { 
                    error: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                { 
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '10',
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        const formData = await request.formData();
        const forceAnalyze = formData.get('forceAnalyze') === 'true';
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        const fileName = file.name.toLowerCase();
        const isValidFileType = ALLOWED_FILE_TYPES.some(ext => fileName.endsWith(ext));
        if (!isValidFileType) {
            return NextResponse.json(
                { error: `Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} files are allowed` },
                { status: 400 }
            );
        }

        // Validate file name
        if (!fileName || fileName.length > 255) {
            return NextResponse.json(
                { error: 'Invalid file name' },
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

        const response = await fetch(`${apiUrl}/v1.0/files`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API upload failed:', response.status, errorText);
            return NextResponse.json(
                { error: `Upload failed: ${response.status} ${response.statusText}` },
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

 