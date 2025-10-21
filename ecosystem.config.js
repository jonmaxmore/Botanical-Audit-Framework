// PM2 Ecosystem Configuration for Botanical Audit Framework
// Auto-restart และป้องกันเซิร์ฟเวอร์ล้ม
// Updated: October 21, 2025
module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'backend',
      cwd: './apps/backend',
      script: 'server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      restart_delay: 4000,

      // Logging
      log_file: './logs/backend-combined.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Watch (development only)
      watch: false,

      // Ignore watch
      ignore_watch: ['node_modules', 'logs', '.git'],
    },

    // Frontend Next.js Server
    // PRODUCTION MODE ONLY - Uses 'next start' (no subprocesses)
    // For development, use start-dev-simple.ps1 instead to avoid zombie processes
    {
      name: 'frontend',
      cwd: './apps/frontend',
      script: 'pnpm',
      args: 'start', // Production mode - 'next start'
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '800M',
      restart_delay: 4000,

      // Logging
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Watch (never in production)
      watch: false,

      // Ignore watch
      ignore_watch: ['node_modules', '.next', 'logs', '.git'],
    },
  ],
};
