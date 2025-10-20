/**
 * Botanical Audit Framework - Backend Server
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoManager = require('./config/mongodb-manager');
const logger = require('./shared').logger;
const appLogger = logger.createLogger('server');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000; // Use 5000 for backend

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json());
app.use(morgan('dev'));

// Basic route for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Botanical Audit Framework API is running',
    mongodb: mongoManager.getStatus()
  });
});

// Health check endpoint
app.get('/api/health', async(req, res) => {
  const health = await mongoManager.healthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// MongoDB reconnect endpoint
app.post('/api/mongodb/reconnect', async(req, res) => {
  const result = await mongoManager.forceReconnect();
  res.json({ success: result });
});

// Use routes
const statusRoutes = require('./routes/status');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');

app.use('/api', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// Start server
async function startServer() {
  try {
    // Try to connect to MongoDB but continue even if it fails
    await mongoManager.connect();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      console.log(`MongoDB status: ${mongoManager.getStatus().readyState}`);
    });
  } catch (error) {
    appLogger.error('Failed to start server:', error);
    // Continue anyway to allow server to run without database
    app.listen(PORT, () => {
      console.log(`⚠️ Backend server running in limited mode on http://localhost:${PORT}`);
      console.log(`MongoDB status: unavailable - ${error.message}`);
    });
  }
}

startServer();
