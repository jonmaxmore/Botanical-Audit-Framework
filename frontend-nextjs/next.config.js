/**
 * Next.js Configuration - Performance Optimized
 * Week 4 Day 2-3: Performance Optimization
 *
 * Optimizations:
 * 1. Output: Standalone for smaller Docker images
 * 2. Image optimization with custom sizes
 * 3. Minification enabled
 * 4. SWC compiler for faster builds
 * 5. Bundle analyzer for monitoring
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance: Standalone output for production
  output: 'standalone',
  turbopack: {},

  // Compiler optimizations
  compiler: {
    // Remove console in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Material-UI chunk (large library)
            mui: {
              name: 'mui',
              test: /@mui/,
              chunks: 'all',
              priority: 30,
            },
            // Chart.js chunk (large library)
            charts: {
              name: 'charts',
              test: /chart\.js|react-chartjs-2/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }

    return config;
  },

  // Production optimizations
  productionBrowserSourceMaps: false, // Faster builds
  poweredByHeader: false, // Security
  compress: true, // Gzip compression

  // React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;
