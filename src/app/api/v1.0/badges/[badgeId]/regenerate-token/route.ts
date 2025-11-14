import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ badgeId: string }> }
) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL environment variable is not set');
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        const authHeader = request.headers.get('authorization');
        const hasBearerToken = authHeader && authHeader.startsWith('Bearer ');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (hasBearerToken) {
            headers['Authorization'] = authHeader;
        } else {
            const cookieStore = await cookies();
            const authToken = cookieStore.get('auth_token');

            if (!authToken) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            headers['Cookie'] = `auth_token=${authToken.value}`;
        }

        const { badgeId } = await params;

        const response = await fetch(`${apiUrl}/v1.0/badges/${badgeId}/regenerate-token`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: response.status });
            } catch {
                return NextResponse.json({ error: errorText || 'Failed to regenerate token' }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error regenerating token:', error);
        return NextResponse.json({ error: 'Failed to regenerate token' }, { status: 500 });
    }
}

