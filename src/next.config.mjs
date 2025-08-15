import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Custom i18n implementation for app directory
    experimental: {
        appDir: true,
    },
    // Enable standalone output for Docker deployment
    output: 'standalone',
};

export default nextConfig;
