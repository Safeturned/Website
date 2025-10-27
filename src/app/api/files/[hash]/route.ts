import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult, storeAnalysisResult } from '../../storage';

export async function GET(request: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    try {
        const { hash } = await params;

        if (!hash || typeof hash !== 'string' || hash.length < 10) {
            return NextResponse.json({ error: 'Invalid hash parameter' }, { status: 400 });
        }

        let result = getAnalysisResult(hash);

        if (result) {
            return NextResponse.json(result);
        }

        try {
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
            const realIP =
                request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');

            if (realIP) {
                const newForwardedFor = existingForwardedFor
                    ? `${existingForwardedFor}, ${realIP}`
                    : realIP;
                headers['X-Forwarded-For'] = newForwardedFor;
            } else if (existingForwardedFor) {
                headers['X-Forwarded-For'] = existingForwardedFor;
            }

            const hashFormats = [
                hash,
                hash.replace(/-/g, '+').replace(/_/g, '/'),
                hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''),
            ];

            for (const hashFormat of hashFormats) {
                const apiUrlWithHash = `${apiUrl}/v1.0/files/${hashFormat}`;

                const response = await fetch(apiUrlWithHash, {
                    headers,
                });

                if (response.ok) {
                    const upstreamResult = await response.json();

                    storeAnalysisResult(hash, upstreamResult);

                    return NextResponse.json(upstreamResult);
                }
            }
        } catch (upstreamError) {
            console.error('Error fetching from API:', upstreamError);
        }

        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    } catch (error) {
        console.error('Internal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
