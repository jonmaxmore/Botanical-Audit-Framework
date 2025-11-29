/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@mui/material',
    '@mui/icons-material',
    '@gacp/ui',
    '@gacp/utils',
    '@gacp/types',
    '@gacp/constants',
  ],
  turbopack: {},
  // Enable standalone output for Docker deployment (requires STANDALONE_BUILD=true environment variable)
  output: process.env.STANDALONE_BUILD === 'true' ? 'standalone' : undefined,
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
