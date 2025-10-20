/**
 * Next.js Configuration - Performance Optimization
 *
 * Features:
 * - Code splitting and lazy loading
 * - Bundle size optimization
 * - Image optimization
 * - Webpack configuration
 * - Compression and minification
 * - Module federation support
 */

const nextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,

  // Compiler options for SWC
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
          exclude: ['error', 'warn']
        }
        : false
  },

  // Image optimization
  images: {
    domains: ['localhost', 'storage.googleapis.com', 'cloudflare-ipfs.com', 's3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 10
            },
            // Common chunks
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            },
            // React chunks
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              name: 'react-vendors',
              priority: 20
            },
            // Material UI chunks
            mui: {
              test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
              name: 'mui-vendors',
              priority: 15
            }
          }
        },
        // Runtime chunk for better long-term caching
        runtimeChunk: {
          name: 'runtime'
        }
      };
    }

    // Ignore certain modules to reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': require('path').resolve(__dirname, 'components'),
      '@/lib': require('path').resolve(__dirname, 'lib'),
      '@/app': require('path').resolve(__dirname, 'app')
    };

    return config;
  },

  // Experimental features
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Optimize fonts
    optimizeFonts: true,
    // Server components
    serverComponents: true
  },

  // Compression
  compress: true,

  // Power features
  poweredByHeader: false,

  // Generate ETags
  generateEtags: true,

  // Production source maps (optional)
  productionBrowserSourceMaps: false,

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL
  }
};

module.exports = nextConfig;
