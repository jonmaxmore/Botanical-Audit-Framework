/**
 * Express Configuration
 * Centralized middleware and server configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

class ExpressConfig {
  constructor(app) {
    this.app = app;
  }

  /**
   * Initialize all middleware
   */
  initialize() {
    this.configureSecurity();
    this.configureCORS();
    this.configureBodyParser();
    this.configureCompression();
    this.configureLogging();
    this.configureRateLimiting();
    this.configureStaticFiles();
  }

  configureSecurity() {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })
    );
  }

  configureCORS() {
    this.app.use(
      cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3005'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      })
    );
  }

  configureBodyParser() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  configureCompression() {
    this.app.use(compression());
  }

  configureLogging() {
    this.app.use(morgan('combined'));
  }

  configureRateLimiting() {
    // General auth limiter
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Strict auth limiter for login
    const strictAuthLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20,
      message: 'Too many authentication attempts, please try again later',
    });

    this.app.use('/api/auth', authLimiter);
    this.app.use(/^\/api\/auth\/[^/]+\/login$/, strictAuthLimiter);
    this.app.use(/^\/api\/auth\/[^/]+\/register$/, authLimiter);
  }

  configureStaticFiles() {
    this.app.use(express.static('public'));
  }
}

module.exports = ExpressConfig;
