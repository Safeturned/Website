import { NextRequest, NextResponse } from 'next/server';
import { makeBadge } from 'badge-maker';

interface Badge {
    id: string;
    name: string;
    description: string | null;
    linkedFileHash: string;
    createdAt: string;
    updatedAt: string;
    requireTokenForUpdate: boolean;
    versionUpdateCount: number;
}

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
    { params }: { params: Promise<{ badgeId: string }> }
) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            console.error('NEXT_PUBLIC_API_URL environment variable is not set');
            const errorBadge = makeBadge({
                label: 'Safeturned',
                message: 'Configuration Error',
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

        const { badgeId } = await params;

        const badgeResponse = await fetch(`${apiUrl}/v1.0/badges/${badgeId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!badgeResponse.ok) {
            const errorBadge = makeBadge({
                label: 'Safeturned',
                message: 'Badge Not Found',
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

        const badge: Badge = await badgeResponse.json();

        const fileResponse = await fetch(`${apiUrl}/v1.0/files/${badge.linkedFileHash}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!fileResponse.ok) {
            const errorBadge = makeBadge({
                label: badge.name || 'Safeturned',
                message: 'File Not Found',
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

        const fileData: FileData = await fileResponse.json();

        const badgeSvg = makeBadge({
            label: badge.name || 'Safeturned',
            message: `${getScoreLabel(fileData.score)} (${fileData.score}/100)`,
            color: getScoreColor(fileData.score),
            style: 'flat',
        });

        return new NextResponse(badgeSvg, {
            status: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300',
                'X-Badge-Version': badge.versionUpdateCount.toString(),
                'X-Last-Updated': badge.updatedAt,
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


