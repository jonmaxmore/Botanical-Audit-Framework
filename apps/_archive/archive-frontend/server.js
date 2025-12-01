/**
 * Frontend Development Server
 */
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const { createLogger } = require('../backend/shared/logger');

const app = express();
const PORT = process.env.PORT || 3000; // Frontend runs on port 3000

const logger = createLogger('frontend-server');

// Check if we're in development or production
const isDev = process.env.NODE_ENV !== 'production';

// Define the path to the build directory
const buildPath = path.join(__dirname, 'build');

// Check if build directory exists for production mode
const hasBuildFolder = fs.existsSync(buildPath);

// For development mode - proxy API requests to backend
if (isDev) {
  logger.info('🚀 Starting frontend development server with API proxy...');

  // Proxy API requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api' // No rewrite needed in this case
      }
    })
  );

  // Serve static assets from public folder for development
  app.use(express.static(path.join(__dirname, 'public')));

  // Fallback for SPA - Send index.html for any other requests
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.send(`
        <html>
          <head><title>Botanical Audit - Development</title></head>
          <body>
            <h1>Botanical Audit Framework</h1>
            <p>Development server running, but index.html not found in public folder.</p>
            <p>API status: <span id="status">Checking...</span></p>
            <script>
              fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                  document.getElementById('status').textContent = 
                    data.status === 'ok' ? 'Connected ✅' : 'Issue detected ⚠️';
                })
                .catch(err => {
                  document.getElementById('status').textContent = 'Backend not reachable ❌';
                });
            </script>
          </body>
        </html>
      `);
    }
  });
}
// For production mode - serve static files from build folder
else if (hasBuildFolder) {
  logger.info('🚀 Starting frontend server in production mode...');

  // Serve static files from the build folder
  app.use(express.static(buildPath));

  // Serve index.html for any request that doesn't match a static file
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}
// No build folder found
else {
  logger.error('❌ Error: Build folder not found for production mode');
  app.get('*', (req, res) => {
    res.status(500).send('Error: Production build not found. Run "npm run build" first.');
  });
}

// Start server
app.listen(PORT, () => {
  logger.info(`Frontend server running on http://localhost:${PORT}`);
});
