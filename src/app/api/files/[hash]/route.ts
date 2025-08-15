import { NextRequest, NextResponse } from 'next/server';

function base64UrlToBase64(input: string): string {
    let output = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = output.length % 4;
    if (pad) {
        output += '='.repeat(4 - pad);
    }
    return output;
}

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
    try {
        const base64UrlHash = params.hash;
        const base64Hash = base64UrlToBase64(base64UrlHash);

        const upstreamUrl = `https://safeturnedapi.unturnedguard.com/v1.0/files/${encodeURIComponent(base64Hash)}`;
        const response = await fetch(upstreamUrl, { method: 'GET' });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Fetch failed: ${response.status} ${response.statusText} - ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Proxy GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 