import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisResult } from '../../storage';

export async function GET(request: NextRequest, { params }: { params: { hash: string } }) {
    try {
        // Try to find the analysis result in our storage
        const result = getAnalysisResult(params.hash);
        
        if (result) {
            return NextResponse.json(result);
        }
        
        // If not found, return 404
        return NextResponse.json(
            { error: 'Analysis not found' },
            { status: 404 }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 