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
    

};

export default nextConfig;
