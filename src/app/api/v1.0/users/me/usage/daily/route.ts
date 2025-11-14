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

        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `${apiUrl}/v1.0/users/me/usage/daily${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API request failed:', response.status, errorText);
            return NextResponse.json(
                { error: `Request failed: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
