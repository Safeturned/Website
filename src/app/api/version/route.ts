import { NextResponse } from 'next/server';

export async function GET() {
    const buildTime = process.env.BUILD_TIME || Date.now().toString();
    const version = process.env.npm_package_version || '1.0.0';
    
    return NextResponse.json({
        version,
        buildTime: parseInt(buildTime),
        buildDate: new Date(parseInt(buildTime)).toISOString(),
        deployedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
    });
}
