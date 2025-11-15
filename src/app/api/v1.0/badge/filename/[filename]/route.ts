import { NextRequest, NextResponse } from 'next/server';
import { makeBadge } from 'badge-maker';

interface FileData {
    hash: string;
    score: number;
    fileName: string;
    sizeBytes: number;
    detectedType: string;
    addDateTime: string;
    lastScanned: string;
    timesScanned: number;
}

function getScoreColor(score: number): string {
    if (score >= 75) return 'red';
    if (score >= 50) return 'orange';
    if (score >= 25) return 'yellow';
    return 'brightgreen';
}

function getScoreLabel(score: number): string {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Moderate Risk';
    if (score >= 25) return 'Low Risk';
    return 'Safe';
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL environment variable is not set');
            return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
        }

        const { filename: filenameParam } = await params;
        const filename = decodeURIComponent(filenameParam);

        const response = await fetch(
            `${apiUrl}/v1.0/files/filename/${encodeURIComponent(filename)}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorBadge = makeBadge({
                label: 'Safeturned',
                message: 'Not Found',
                color: 'lightgrey',
                style: 'flat',
            });

            return new NextResponse(errorBadge, {
                status: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=300',
                },
            });
        }

        const fileData: FileData = await response.json();

        const badge = makeBadge({
            label: 'Safeturned',
            message: `${getScoreLabel(fileData.score)} (${fileData.score}/100)`,
            color: getScoreColor(fileData.score),
            style: 'flat',
        });

        return new NextResponse(badge, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300',
            },
        });
    } catch (error) {
        console.error('Error generating badge:', error);

        const errorBadge = makeBadge({
            label: 'Safeturned',
            message: 'Error',
            color: 'lightgrey',
            style: 'flat',
        });

        return new NextResponse(errorBadge, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=60',
            },
        });
    }
}
