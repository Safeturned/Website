import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest, ServerApiError } from '@/lib/api-client-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { data: result } = await serverApiRequest(request, 'files/upload/complete', {
            method: 'POST',
            body,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Complete error:', error);
        if (error instanceof ServerApiError) {
            return NextResponse.json(
                { error: `Complete failed: ${error.message}` },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
