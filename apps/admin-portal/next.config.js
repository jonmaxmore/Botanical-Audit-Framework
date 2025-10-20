/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
