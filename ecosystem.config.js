// PM2 Ecosystem Configuration for GACP Standards System
// Updated by MIS Team - October 11, 2025
module.exports = {
  apps: [
    // Main GACP Application (Primary Server)
    {
      name: 'gacp-main',
      script: 'app.js',
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        HOST: '0.0.0.0',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0',
      },

      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      restart_delay: 5000,

      // Logging
      log_file: './logs/pm2-main-combined.log',
      out_file: './logs/pm2-main-out.log',
      error_file: './logs/pm2-main-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Watch (development only)
      watch: false,

      // Cron restart (3 AM daily)
      cron_restart: '0 3 * * *',
    },

    // Standards API (Secondary Server)
    {
      name: 'gacp-standards-api',
      script: 'server-enhanced.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',

      // Environment
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
      },

      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        HOST: '0.0.0.0',
      },

      // Monitoring
      monitoring: false,

      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto-restart configuration
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',

      // Graceful shutdown
      kill_timeout: 5000,

      // Watch options (development only)
      watch:
        process.env.NODE_ENV === 'development'
          ? ['server-enhanced.js', 'middleware/', 'config/', 'services/']
          : false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'frontend', 'tests'],

      // Advanced options
      node_args: process.env.NODE_ENV === 'production' ? '--max-old-space-size=4096' : '',

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Cron restart (daily at 2 AM in production)
      cron_restart: process.env.NODE_ENV === 'production' ? '0 2 * * *' : undefined,

      // Merge logs
      merge_logs: true,

      // Source map support
      source_map_support: true,

      // Instance variables for load balancing
      instance_var: 'INSTANCE_ID',

      // Restart delay
      restart_delay: 4000,

      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,

      // Wait time before restart
      wait_ready: true,
      listen_timeout: 8000,

      // Shutdown timeout
      shutdown_with_message: true,

      // Advanced PM2 features
      pmx: true,
      automation: false,

      // Environment specific settings
      ...(process.env.NODE_ENV === 'production' && {
        // Production specific settings
        max_memory_restart: '1G',
        instances: 'max',
        exec_mode: 'cluster',

        // Performance monitoring
        monitoring: true,

        // Automatic restart on file changes disabled
        watch: false,

        // Enable cluster mode
        instance_var: 'INSTANCE_ID',
      }),
    },

    // Optional: Separate worker process for background tasks
    {
      name: 'gacp-worker',
      script: 'workers/background-worker.js',
      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'background',
      },

      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background',
      },

      // Worker specific settings
      max_restarts: 5,
      min_uptime: '30s',
      max_memory_restart: '256M',

      // Logging
      log_file: './logs/worker-combined.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',

      // Cron restart
      cron_restart: '0 3 * * *', // 3 AM daily

      // Only run in production
      enabled: process.env.NODE_ENV === 'production',
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/gacp-standards-comparison.git',
      path: '/var/www/gacp-standards',

      'pre-deploy-local': '',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',

      // SSH options
      ssh_options: 'StrictHostKeyChecking=no',

      // Environment variables for deployment
      env: {
        NODE_ENV: 'production',
      },
    },

    staging: {
      user: 'deploy',
      host: 'staging-server.com',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/gacp-standards-comparison.git',
      path: '/var/www/gacp-standards-staging',

      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',

      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
