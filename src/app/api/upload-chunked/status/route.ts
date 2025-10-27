import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'SessionId is required' }, { status: 400 });
        }

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
        const realIP = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');

        if (realIP) {
            const newForwardedFor = existingForwardedFor
                ? `${existingForwardedFor}, ${realIP}`
                : realIP;
            headers['X-Forwarded-For'] = newForwardedFor;
        } else if (existingForwardedFor) {
            headers['X-Forwarded-For'] = existingForwardedFor;
        }

        const response = await fetch(`${apiUrl}/v1.0/files/upload/status/${sessionId}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API status failed:', response.status, errorText);
            return NextResponse.json(
                { error: `Status check failed: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
