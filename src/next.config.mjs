import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable standalone output for Docker deployment
    output: 'standalone',
    
    // Disable static optimization for dynamic content
    experimental: {
        // Force dynamic rendering for better cache busting
        forceSwcTransforms: true,
    },
    
    // Ensure fresh builds with timestamp
    generateBuildId: async () => {
        const timestamp = Date.now();
        console.log(`Generating build ID: build-${timestamp}`);
        return `build-${timestamp}`;
    },
    
    // Disable static optimization for pages with dynamic content
    trailingSlash: false,
    
    // Force cache busting
    env: {
        BUILD_TIME: Date.now().toString(),
    },
    
    // Disable static generation completely
    staticPageGenerationTimeout: 0,
    
    // Add cache control headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
