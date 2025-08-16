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
    
    // Ensure fresh builds
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
    
    // Disable static optimization for pages with dynamic content
    trailingSlash: false,
};

export default nextConfig;
