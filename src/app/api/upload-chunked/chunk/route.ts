import { NextRequest, NextResponse } from 'next/server';
import { serverApiRequest, ServerApiError } from '@/lib/api-client-server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const { data: result } = await serverApiRequest(request, 'files/upload/chunk', {
            method: 'POST',
            body: formData,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Chunk upload error:', error);
        if (error instanceof ServerApiError) {
            return NextResponse.json(
                { error: `Chunk upload failed: ${error.message}` },
                { status: error.status }
            );
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
