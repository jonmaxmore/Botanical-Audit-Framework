/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gacp/ui', '@gacp/types', '@gacp/utils'],
  turbopack: {},
};

module.exports = nextConfig;
