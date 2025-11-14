import { NextRequest, NextResponse } from 'next/server';
import { storeAnalysisResult, storeFile } from '../storage';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_FILE_TYPES = ['.dll'];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        const fileName = file.name.toLowerCase();
        const isValidFileType = ALLOWED_FILE_TYPES.some(ext => fileName.endsWith(ext));
        if (!isValidFileType) {
            return NextResponse.json(
                {
                    error: `Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} files are allowed`,
                },
                { status: 400 }
            );
        }

        if (!fileName || fileName.length > 255) {
            return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
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

        const authHeader = request.headers.get('authorization');
        const hasUserAuth = authHeader && authHeader.startsWith('Bearer ');

        const headers: Record<string, string> = {};

        if (hasUserAuth) {
            headers['Authorization'] = authHeader;
        } else {
            headers['X-API-Key'] = apiKey;
        }

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

        const analysisId = result.fileHash
            ? result.fileHash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
            : Date.now().toString();

        storeAnalysisResult(analysisId, result);

        const fileArrayBuffer = await file.arrayBuffer();
        storeFile(analysisId, fileArrayBuffer, file.name, file.type);

        return NextResponse.json({
            ...result,
            id: analysisId,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
