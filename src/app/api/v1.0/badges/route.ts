import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

        const response = await fetch(`${apiUrl}/v1.0/badges`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: response.status });
            } catch {
                return NextResponse.json({ error: errorText || 'Failed to fetch badges' }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching badges:', error);
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        console.log('Creating badge with data:', { name: body.name, fileHash: body.fileHash?.substring(0, 20) + '...' });

        const response = await fetch(`${apiUrl}/v1.0/badges`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            try {
                const errorData = JSON.parse(errorText);
                return NextResponse.json(errorData, { status: response.status });
            } catch {
                return NextResponse.json({ error: errorText || 'Failed to create badge' }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error creating badge:', error);
        return NextResponse.json({ error: 'Failed to create badge' }, { status: 500 });
    }
}

