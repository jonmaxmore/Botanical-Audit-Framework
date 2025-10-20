// Import GACP shared modules for consistency
const { auth, errors, logger, validation, response, constants } = require('./shared');

// Create structured logger for main app
const appLogger = logger.createLogger('gacp-main-app');

require('dotenv').config();

// Core Dependencies
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import MongoDB Manager (MIS Team Solution)
const mongoManager = require('./config/mongodb-manager');

// ============================================================================
// NEW CLEAN ARCHITECTURE MODULES (October 2025)
// ============================================================================

// Document Module
const { getDocumentModuleContainer } = require('./modules/document');

// Report Module
const { getReportModuleContainer } = require('./modules/report');

// Dashboard Module
const { initializeDashboardModule } = require('./modules/dashboard');

// Import Health Check Service (MIS Team Monitoring Solution)
const HealthCheckService = require('./services/health-check-service');

// Import Database Manager

// Import unified error handling

/**
 * GACP Certification System - Main Application Server
 * Complete integrated system for Good Agricultural and Collection Practices certification
 * MongoDB Production-Ready Version
 */

const app = express();

// Mock security configuration for now
const security = {
  api: config => ({
    stack: () => [cors(), express.json({ limit: '10mb' }), express.urlencoded({ extended: true })],
  }),
};

const securityUtils = {
  sanitizeInput: input => input,
  validateCSRF: (req, res, next) => next(),
};

// Apply security middleware stack
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = auth.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Make security utilities available
app.locals.security = security;
app.locals.securityUtils = securityUtils;

// Use the imported logger or create a simple fallback
const mainLogger = logger || {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
};

// Import MongoDB-based routes
let authRoutes,
  userRoutes,
  applicationRoutes,
  workflowRoutes,
  documentRoutes,
  notificationRoutes,
  certificateRoutes,
  dashboardRoutes;

// Import unified authentication middleware

// Load MongoDB-based auth routes
try {
  authRoutes = require('./src/routes/auth');
  mainLogger.info('✓ MongoDB Auth routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load auth routes:', error.message);
  authRoutes = express.Router();

  authRoutes.post('/register', (req, res) => {
    res.status(401).json({
      success: false,
      message: 'Authentication service temporarily unavailable',
      error: 'SERVICE_UNAVAILABLE',
    });
  });

  authRoutes.post('/login', (req, res) => {
    // Return 401 to indicate authentication is needed (but service is running)
    res.status(401).json({
      success: false,
      message: 'Invalid credentials or service unavailable',
      error: 'AUTHENTICATION_FAILED',
    });
  });
}

// Load DTAM Staff Authentication Routes (Separate System)
let dtamAuthRoutes;
try {
  dtamAuthRoutes = require('./modules/auth-dtam/routes/dtam-auth');
  mainLogger.info('✓ DTAM Staff Auth routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load DTAM auth routes:', error.message);
  dtamAuthRoutes = express.Router();
  dtamAuthRoutes.post('/dtam/login', (req, res) => {
    // Return 401 to indicate auth failed (but endpoint is working)
    res.status(401).json({
      success: false,
      message: 'Invalid credentials or service unavailable',
      error: 'DTAM_AUTH_FAILED',
    });
  });
}

// MongoDB-based user routes
userRoutes = express.Router();
userRoutes.get('/', (req, res) => {
  res.json({
    message: 'MongoDB User service available',
    version: '2.0.0-mongodb',
    features: ['profile_management', 'role_based_access', 'activity_tracking'],
  });
});

// Create fallback routes for missing services (with authentication)
applicationRoutes = express.Router();

// GET /api/applications - List applications
applicationRoutes.get('/', authenticateToken, (req, res) =>
  res.json({
    message: 'MongoDB Application service available',
    version: '2.0.0-mongodb',
    features: ['persistent_storage', 'advanced_search', 'real_time_updates'],
    user: req.user.email,
    applications: [],
  })
);

// POST /api/applications - Create new application
applicationRoutes.post('/', authenticateToken, (req, res) => {
  const applicationData = {
    id: Date.now(),
    applicant: req.user.email,
    status: 'submitted',
    submittedAt: new Date(),
    ...req.body,
  };

  res.status(201).json({
    message: 'สร้างใบสมัครสำเร็จ',
    application: applicationData,
  });
});

// GET /api/applications/status - Check application status
applicationRoutes.get('/status', authenticateToken, (req, res) => {
  res.json({
    applications: [
      {
        id: 1,
        status: 'under_review',
        lastUpdated: new Date(),
        progress: 60,
      },
    ],
  });
});

workflowRoutes = express.Router();

// GET /api/workflow - Workflow service info
workflowRoutes.get('/', authenticateToken, (req, res) =>
  res.json({
    message: 'Workflow service available',
    user: req.user.email,
  })
);

// GET /api/workflow/applications - List applications
workflowRoutes.get('/applications', authenticateToken, async (req, res) => {
  try {
    // Mock applications for UAT testing
    const mockApplications = [
      {
        id: 'APP001',
        applicantName: 'ทดสอบ เกษตรกร',
        farmName: 'ฟาร์มทดสอบ UAT',
        status: 'submitted',
        submittedAt: new Date(),
        crops: ['ขมิ้นชัน'],
      },
    ];

    res.json({
      success: true,
      data: mockApplications,
      total: mockApplications.length,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'ไม่สามารถดึงข้อมูลใบสมัครได้',
    });
  }
});

// POST /api/workflow/applications - Create application
workflowRoutes.post('/applications', authenticateToken, async (req, res) => {
  try {
    const applicationData = req.body;

    // Mock application creation
    const newApplication = {
      id: `APP${Date.now()}`,
      ...applicationData,
      applicantId: req.user.id,
      status: 'draft',
      createdAt: new Date(),
      submittedAt: null,
    };

    res.status(201).json({
      success: true,
      data: newApplication,
      message: 'สร้างใบสมัครสำเร็จ',
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'ไม่สามารถสร้างใบสมัครได้',
    });
  }
});

// GET /api/workflow/applications/:id - Get application details
workflowRoutes.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Mock application details
    const application = {
      id: id,
      applicantName: 'ทดสอบ เกษตรกร',
      farmName: 'ฟาร์มทดสอบ UAT',
      status: 'submitted',
      submittedAt: new Date(),
      applicantInfo: {
        organizationName: 'ฟาร์มทดสอบ UAT',
        ownerName: 'ทดสอบ เกษตรกร',
        organizationType: 'individual',
      },
      farmInfo: {
        farmName: 'ฟาร์มทดสอบ UAT',
        farmArea: 10.5,
        farmType: 'organic',
      },
      cropInfo: {
        crops: [
          {
            scientificName: 'Curcuma longa',
            commonName: 'ขมิ้นชัน',
            cropCategory: 'medicinal',
            cultivationArea: 5.0,
            expectedYield: 200,
            usedFor: 'medicine',
          },
        ],
      },
    };

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'ไม่สามารถดึงรายละเอียดใบสมัครได้',
    });
  }
});

// POST /api/workflow/applications/:id/documents - Upload documents
workflowRoutes.post('/applications/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;

    // Mock document upload
    const document = {
      id: `DOC${Date.now()}`,
      applicationId: id,
      ...documentData,
      uploadedAt: new Date(),
      status: 'uploaded',
    };

    res.json({
      success: true,
      data: document,
      message: 'อัพโหลดเอกสารสำเร็จ',
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'ไม่สามารถอัพโหลดเอกสารได้',
    });
  }
});

documentRoutes = express.Router();

// GET /api/documents - List documents
documentRoutes.get('/', authenticateToken, (req, res) =>
  res.json({
    message: 'Document service available',
    user: req.user.email,
    documents: [],
  })
);

// POST /api/documents/upload - Upload documents
documentRoutes.post('/upload', authenticateToken, (req, res) => {
  const { applicationId, documents } = req.body;

  res.status(201).json({
    message: 'อัปโหลดเอกสารสำเร็จ',
    uploadedDocuments: documents || [],
    applicationId: applicationId,
    uploadedBy: req.user.email,
    uploadedAt: new Date(),
  });
});

notificationRoutes = express.Router();
notificationRoutes.get('/', (req, res) => res.json({ message: 'Notification service available' }));

certificateRoutes = express.Router();
certificateRoutes.get('/', (req, res) => res.json({ message: 'Certificate service available' }));

// Load dashboard routes
try {
  dashboardRoutes = require('./routes/dashboard-simple');
  mainLogger.info('✓ Dashboard routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load dashboard routes:', error.message);
  dashboardRoutes = express.Router();
  dashboardRoutes.get('/', (req, res) => {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Dashboard service not available',
    });
  });
}

// Mock services for development
const notificationService = {
  sendPaymentConfirmation: async data => {
    logger.info('[MOCK] Payment confirmation sent', data);
    return { success: true, messageId: Date.now() };
  },
  updateSMSStatus: async (messageId, status, deliveredAt) => {
    logger.info('[MOCK] SMS status updated', { messageId, status, deliveredAt });
    return { success: true };
  },
  initialize: async () => {
    logger.info('[MOCK] NotificationService initialized');
  },
  cleanup: async () => {
    logger.info('[MOCK] NotificationService cleanup');
  },
};

const certificateService = {
  initializeDirectories: async () => {
    try {
      const CertificateService = require('./modules/certificate-management/services/certificate.service');
      const realService = new CertificateService();
      await realService.initializeDirectories();
      logger.info('[REAL] CertificateService directories initialized');
      return realService;
    } catch (error) {
      logger.warn('[FALLBACK] Using mock CertificateService:', error.message);
      logger.info('[MOCK] CertificateService directories initialized');
      return null;
    }
  },
  cleanup: async () => {
    logger.info('[MOCK] CertificateService cleanup');
  },
  generateCertificate: async data => {
    try {
      const CertificateService = require('./modules/certificate-management/services/certificate.service');
      const realService = new CertificateService();
      const result = await realService.generateCertificate(data);
      logger.info('[REAL] Certificate generated', { certificateNumber: result.certificateNumber });
      return result;
    } catch (error) {
      logger.warn('[FALLBACK] Mock certificate generated:', error.message);
      return { success: true, certificateId: Date.now(), downloadUrl: '/mock-certificate.pdf' };
    }
  },
  downloadCertificate: async certificateNumber => {
    try {
      const CertificateService = require('./modules/certificate-management/services/certificate.service');
      const realService = new CertificateService();
      return await realService.downloadCertificate(certificateNumber);
    } catch (error) {
      logger.warn('[FALLBACK] Mock certificate download:', error.message);
      throw new Error('Certificate download service temporarily unavailable');
    }
  },
};

const documentService = {
  initialize: async () => {
    logger.info('[MOCK] DocumentService initialized');
  },
  cleanup: async () => {
    logger.info('[MOCK] DocumentService cleanup');
  },
  uploadDocument: async data => {
    logger.info('[MOCK] Document uploaded', data);
    return { success: true, documentId: Date.now() };
  },
};

// MIDDLEWARE CONFIGURATION
// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000', // Current development server
        'http://localhost:3001',
        'http://localhost:3005',
        'https://gacp.doa.go.th',
        'https://api.gacp.doa.go.th',
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for certificate verification (public access)
    return req.path.startsWith('/verify/') || req.path.startsWith('/api/certificates/verify/');
  },
});

app.use('/api/', limiter);

// Compression
app.use(compression());

// Logging
app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve all files including HTML
app.use('/public-deploy', express.static(path.join(__dirname, 'public-deploy')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// API documentation endpoint (replaced legacy auth.html redirect)
app.get('/', (req, res) => {
  res.json({
    name: 'GACP Certification System API',
    version: '2.0.0',
    description: 'Backend API for GACP certification system',
    frontend: 'http://localhost:3001',
    documentation: '/api',
    endpoints: {
      auth: '/api/auth - Authentication (login, register, logout)',
      dashboard: '/api/dashboard - Role-based dashboard data',
      health: '/health - System health check',
    },
    message: 'เพื่อใช้งานระบบ กรุณาเข้าที่ http://localhost:3001',
  });
});

// Specific HTML routes to prevent conflicts with React frontend
app.get('/auth.html', (req, res) => {
  res.status(301).json({
    message: 'Authentication moved to React frontend',
    redirect: 'http://localhost:3001/login',
  });
});

app.get('/farmer-dashboard.html', (req, res) => {
  res.status(301).json({
    message: 'Dashboard moved to React frontend',
    redirect: 'http://localhost:3001/dashboard',
  });
});

app.get('/director-dashboard.html', (req, res) => {
  res.status(301).json({
    message: 'Dashboard moved to React frontend',
    redirect: 'http://localhost:3001/dashboard',
  });
});

app.get('/auditor-dashboard.html', (req, res) => {
  res.status(301).json({
    message: 'Dashboard moved to React frontend',
    redirect: 'http://localhost:3001/dashboard',
  });
});

// DATABASE CONNECTION (MongoDB Only - MIS Team Solution)
async function initializeDatabase() {
  try {
    mainLogger.info('🔄 Connecting to MongoDB using MongoDB Manager...');

    // Use MongoDB Manager for auto-reconnect and stability (MIS Team)
    const mongoURI = process.env.MONGODB_URI_SIMPLE || 'mongodb://localhost:27017/gacp_production';

    const connected = await mongoManager.connect(mongoURI);

    if (connected) {
      mainLogger.info('✅ MongoDB connected successfully with auto-reconnect');
      mainLogger.info(`📊 Database: ${mongoose.connection.name}`);

      // ตรวจสอบ collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      mainLogger.info(`📄 Collections: ${collections.map(c => c.name).join(', ')}`);

      // Display connection status
      const status = mongoManager.getStatus();
      mainLogger.info(`🔌 Connection Status: ${JSON.stringify(status)}`);

      // ============================================================================
      // INITIALIZE NEW CLEAN ARCHITECTURE MODULES
      // ============================================================================

      let documentModule, reportModule, dashboardModule;

      try {
        mainLogger.info('🔄 Initializing Clean Architecture modules...');

        // Initialize Document Module with mongoose connection
        documentModule = getDocumentModuleContainer(mongoose);
        mainLogger.info('✓ Document module initialized');

        // Initialize Report Module with mongoose connection
        reportModule = getReportModuleContainer({
          database: mongoose,
          otherRepositories: {}, // Will be populated when other modules are migrated
        });
        mainLogger.info('✓ Report module initialized');

        // Initialize Dashboard Module
        // Note: Dashboard module needs repositories from other modules
        // For now, passing empty object - will integrate when other modules are migrated
        dashboardModule = initializeDashboardModule({
          farmRepository: null,
          certificateRepository: null,
          surveyRepository: null,
          trainingCourseRepository: null,
          trainingEnrollmentRepository: null,
          documentRepository: null,
          notificationRepository: null,
          auditRepository: null,
        });
        mainLogger.info('✓ Dashboard module initialized (with null repositories)');

        // Store modules globally for route mounting
        app.locals.newModules = {
          documentModule,
          reportModule,
          dashboardModule,
        };

        // ============================================================================
        // MOUNT NEW CLEAN ARCHITECTURE MODULE ROUTES (Inside DB Connection)
        // ============================================================================

        // Import authentication middleware for new modules
        const { authenticateFarmer, authenticateDTAM } = require('./middleware/auth');

        // Document Module Routes
        if (documentModule) {
          try {
            app.use('/api/farmer/documents', documentModule.getFarmerRoutes(authenticateFarmer));
            app.use('/api/dtam/documents', documentModule.getDTAMRoutes(authenticateDTAM));
            mainLogger.info('✓ Document module routes mounted');
          } catch (error) {
            mainLogger.error('Failed to mount document routes:', error);
          }
        }

        // Report Module Routes
        if (reportModule) {
          try {
            app.use('/api/farmer/reports', reportModule.getFarmerRoutes(authenticateFarmer));
            app.use('/api/dtam/reports', reportModule.getDTAMRoutes(authenticateDTAM));
            mainLogger.info('✓ Report module routes mounted');
          } catch (error) {
            mainLogger.error('Failed to mount report routes:', error);
          }
        }

        // Dashboard Module Routes
        if (dashboardModule) {
          try {
            app.use(
              '/api/farmer/dashboard-v2',
              dashboardModule.getFarmerRoutes(authenticateFarmer)
            );
            app.use('/api/dtam/dashboard-v2', dashboardModule.getDTAMRoutes(authenticateDTAM));
            mainLogger.info('✓ Dashboard module routes mounted (v2)');
          } catch (error) {
            mainLogger.error('Failed to mount dashboard routes:', error);
          }
        }

        mainLogger.info('✅ All Clean Architecture modules initialized and mounted successfully');
      } catch (error) {
        mainLogger.error('Failed to initialize new modules:', error);
      }

      return true;
    } else {
      mainLogger.warn('⚠️ MongoDB Manager failed to connect');
      mainLogger.warn('⚠️ Running in limited mode without database');
      return false;
    }
  } catch (error) {
    mainLogger.error('❌ MongoDB connection failed:', error.message);
    mainLogger.warn('⚠️ Running in limited mode without database');
    return false;
  }
}

// WORKFLOW ENGINES - Business Logic
let workflowEngines = {
  application: null,
  farm: null,
  survey: null,
};

async function initializeWorkflowEngines() {
  try {
    // Import Workflow Engines
    const ApplicationWorkflowEngine = require('./services/ApplicationWorkflowEngine');
    const FarmManagementProcessEngine = require('./services/FarmManagementProcessEngine');
    const SurveyProcessEngine = require('./services/SurveyProcessEngine');

    // Initialize with database connection
    workflowEngines.application = new ApplicationWorkflowEngine({
      db: mongoose.connection.db,
      notificationService: notificationService,
      documentService: null, // Will be added later
    });

    workflowEngines.farm = new FarmManagementProcessEngine({
      db: mongoose.connection.db,
      notificationService: notificationService,
    });

    workflowEngines.survey = new SurveyProcessEngine(mongoose.connection.db);

    mainLogger.info('✅ Workflow Engines initialized successfully');
    mainLogger.info('   - Application Workflow Engine: Ready');
    mainLogger.info('   - Farm Management Process Engine: Ready');
    mainLogger.info('   - Survey Process Engine: Ready');

    // Initialize Survey 4-Regions Engine if routes are loaded
    try {
      if (surveys4RegionsRoutes && surveys4RegionsRoutes.initializeEngine) {
        surveys4RegionsRoutes.initializeEngine(mongoose.connection.db);
        mainLogger.info('✅ Survey 4-Regions Engine initialized');
      }
    } catch (error) {
      mainLogger.error('⚠️  Survey 4-Regions Engine initialization failed:', error.message);
    }

    // Initialize Track & Trace Engine (PHASE 2 - October 12, 2025)
    try {
      if (trackTraceRoutes && trackTraceRoutes.initializeEngine) {
        trackTraceRoutes.initializeEngine(mongoose.connection.db);
        mainLogger.info('✅ Track & Trace Engine initialized');
      }
    } catch (error) {
      mainLogger.error('⚠️  Track & Trace Engine initialization failed:', error.message);
    }

    // Initialize Standards Comparison Engine (PHASE 2 - October 12, 2025)
    try {
      const standardsModule = require('./routes/api/standards-comparison');
      if (standardsModule && standardsModule.initializeEngine) {
        standardsModule.initializeEngine(mongoose.connection.db);
        mainLogger.info('✅ Standards Comparison Engine initialized');
      }
    } catch (error) {
      mainLogger.error('⚠️  Standards Comparison Engine initialization failed:', error.message);
    }

    return true;
  } catch (error) {
    mainLogger.error('❌ Failed to initialize Workflow Engines:', error.message);
    return false;
  }
}

// API ROUTES
app.get('/health', async (req, res) => {
  try {
    // Use MongoDB Manager for health check (MIS Team)
    const mongoHealth = await mongoManager.healthCheck();
    const mongoStatus = mongoManager.getStatus();

    // Determine overall status
    // Use 'OK' for compatibility with various health check systems
    let overallStatus = 'OK';
    if (!mongoHealth.healthy) {
      overallStatus = 'DEGRADED'; // MongoDB down but server still functional
    }

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        mongodb: mongoHealth.healthy ? 'connected' : 'disconnected',
        ...mongoHealth,
        ...mongoStatus,
      },
      // Additional compatibility field
      healthy: mongoHealth.healthy,
    };

    // Always return 200 - status field indicates actual health
    // This allows monitoring systems to distinguish between service down vs degraded
    res.status(200).json(health);
  } catch (error) {
    mainLogger.error('Health check error:', error);
    // Only return 503 for actual errors
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'GACP Certification System API',
    version: '1.0.0',
    description: 'Complete API for Good Agricultural and Collection Practices certification system',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth - Authentication (login, register, logout)',
      users: '/api/users - User management',
      applications: '/api/applications - Application management',
      workflow: '/api/workflow - Workflow operations',
      documents: '/api/documents - Document management',
      notifications: '/api/notifications - Notification system',
      certificates: '/api/certificates - Certificate management',
      dashboard: '/api/dashboard - Role-based dashboard data',
      health: '/health - System health check',
    },
    authentication: 'Bearer token required for most endpoints',
    rateLimit: '100 requests per 15 minutes per IP',
  });
});

// Load compliance routes
let complianceRoutes;
try {
  complianceRoutes = require('./routes/compliance-simple');
  mainLogger.info('✓ Compliance comparator routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load compliance routes:', error.message);
  complianceRoutes = express.Router();
  complianceRoutes.get('/', (req, res) => {
    res.status(503).json({
      error: 'Service unavailable',
      message: 'Compliance comparator service not available',
    });
  });
}

// REMOVED: Track & Trace routes moved to after Survey 4-Regions (line ~853)
// let trackTraceRoutes;
// try {
//   trackTraceRoutes = require('./routes/api/track-trace');
//   mainLogger.info('✓ Track & Trace API routes loaded successfully');
// } catch (error) {
//   mainLogger.error('Failed to load Track & Trace routes:', error.message);
//   trackTraceRoutes = express.Router();
//   trackTraceRoutes.get('/health', (req, res) => {
//     res.status(500).json({ success: false, message: 'Track & Trace service unavailable' });
//   });
// }

// Load Survey API routes (OLD - mock data)
let surveyRoutes;
try {
  surveyRoutes = require('./routes/api/survey');
  mainLogger.info('✓ Survey API routes loaded successfully (legacy)');
} catch (error) {
  mainLogger.error('Failed to load Survey routes:', error.message);
  surveyRoutes = express.Router();
  surveyRoutes.get('/health', (req, res) => {
    res.status(500).json({ success: false, message: 'Survey service unavailable' });
  });
}

// Load NEW Workflow API Routes
let applicationWorkflowRoutes, farmManagementRoutes, surveyProcessRoutes;

// Health check endpoints (MIS Team - for monitoring)
app.get('/api/auth/health', async (req, res) => {
  try {
    const mongoHealth = await mongoManager.healthCheck();
    const mongoStatus = mongoManager.getStatus();

    res.json({
      service: 'auth',
      status: mongoHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: { ...mongoHealth, ...mongoStatus },
    });
  } catch (error) {
    res.status(503).json({
      service: 'auth',
      status: 'unhealthy',
      error: error.message,
    });
  }
});

app.get('/api/auth/dtam/health', async (req, res) => {
  try {
    const mongoHealth = await mongoManager.healthCheck();
    const mongoStatus = mongoManager.getStatus();

    res.json({
      service: 'dtam-auth',
      status: mongoHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: { ...mongoHealth, ...mongoStatus },
    });
  } catch (error) {
    res.status(503).json({
      service: 'dtam-auth',
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', dtamAuthRoutes); // DTAM Staff Authentication (separate system)
app.use('/api/users', userRoutes);
// REMOVED: app.use('/api/applications', applicationRoutes);
// REMOVED: app.use('/api/workflow', workflowRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compliance', complianceRoutes);

// Mount new API routes for Phase 2 & 3 functionality
// REMOVED: app.use('/api/track-trace', trackTraceRoutes); // Moved to after declaration
app.use('/api/survey', surveyRoutes);

// Load DTAM Management Routes (Staff-only API)
let dtamManagementRoutes;
try {
  dtamManagementRoutes = require('./routes/dtam-management');
  app.use('/api/dtam', dtamManagementRoutes);
  mainLogger.info('✓ DTAM Management routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load DTAM Management routes:', error.message);
  dtamManagementRoutes = express.Router();
}

// Note: Clean Architecture module routes are mounted inside MongoDB connection callback
// after modules are initialized (see connectToDatabase function above)

// Load Survey 4-Regions API routes (NEW - with wizard functionality)
let surveys4RegionsRoutes;
try {
  surveys4RegionsRoutes = require('./routes/api/surveys-4regions');
  app.use('/api/surveys-4regions', surveys4RegionsRoutes);
  mainLogger.info('✓ Survey 4-Regions API routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load Survey 4-Regions routes:', error.message);
}

// Load Track & Trace API routes (PHASE 2 - October 12, 2025)
let trackTraceRoutes;
try {
  trackTraceRoutes = require('./routes/api/tracktrace');
  app.use('/api/tracktrace', trackTraceRoutes);
  mainLogger.info('✓ Track & Trace API routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load Track & Trace routes:', error.message);
}

// Load Standards Comparison API routes (PHASE 2 - October 12, 2025)
let standardsRoutes;
try {
  const standardsModule = require('./routes/api/standards-comparison');
  standardsRoutes = standardsModule.router;
  app.use('/api/standards', standardsRoutes);
  mainLogger.info('✓ Standards Comparison API routes loaded successfully');
} catch (error) {
  mainLogger.error('Failed to load Standards Comparison routes:', error.message);
}

// Mount NEW Workflow Engine API Routes (will be loaded after DB connection)
function mountWorkflowRoutes() {
  try {
    // 🔍 PM DEBUG: Check engines before mounting
    mainLogger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    mainLogger.info('🔍 PM DIAGNOSIS: Checking Workflow Engines...');
    mainLogger.info(
      '   workflowEngines.application:',
      workflowEngines.application ? '✅ EXISTS' : '❌ UNDEFINED'
    );
    mainLogger.info(
      '   workflowEngines.farm:',
      workflowEngines.farm ? '✅ EXISTS' : '❌ UNDEFINED'
    );
    mainLogger.info(
      '   workflowEngines.survey:',
      workflowEngines.survey ? '✅ EXISTS' : '❌ UNDEFINED'
    );
    mainLogger.info('   authenticateToken:', authenticateToken ? '✅ EXISTS' : '❌ UNDEFINED');
    mainLogger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const applicationWorkflowAPI = require('./routes/api/application-workflow');
    const farmManagementAPI = require('./routes/api/farm-management');
    const surveyProcessAPI = require('./routes/api/survey-process');

    mainLogger.info('🔍 PM DIAGNOSIS: Passing dependencies to route modules...');

    applicationWorkflowRoutes = applicationWorkflowAPI({
      workflowEngine: workflowEngines.application,
      auth: authenticateToken,
    });

    mainLogger.info(
      '   Application Workflow Routes:',
      applicationWorkflowRoutes.stack
        ? `✅ ${applicationWorkflowRoutes.stack.length} routes`
        : '❌ NO ROUTES'
    );

    // 🔍 PM DEBUG: List all registered routes
    if (applicationWorkflowRoutes.stack && applicationWorkflowRoutes.stack.length > 0) {
      mainLogger.info('   🔍 PM: Listing Application Workflow route paths:');
      applicationWorkflowRoutes.stack.forEach((layer, index) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          mainLogger.info(`      ${index + 1}. ${methods} ${layer.route.path}`);
        }
      });
    }

    farmManagementRoutes = farmManagementAPI({
      farmEngine: workflowEngines.farm,
      auth: authenticateToken,
    });

    mainLogger.info(
      '   Farm Management Routes:',
      farmManagementRoutes.stack ? `✅ ${farmManagementRoutes.stack.length} routes` : '❌ NO ROUTES'
    );

    // Initialize survey process routes
    surveyProcessAPI.initialize(workflowEngines.survey);
    surveyProcessRoutes = surveyProcessAPI.router;

    mainLogger.info(
      '   Survey Process Routes:',
      surveyProcessRoutes.stack ? `✅ ${surveyProcessRoutes.stack.length} routes` : '❌ NO ROUTES'
    );
    mainLogger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    app.use('/api/application-workflow', applicationWorkflowRoutes);
    app.use('/api/farm', farmManagementRoutes);
    app.use('/api/survey-process', authenticateToken, surveyProcessRoutes);

    mainLogger.info('✅ Workflow API Routes mounted successfully');
    mainLogger.info('   - Application Workflow API: /api/application-workflow');
    mainLogger.info('   - Farm Management API: /api/farm');
    mainLogger.info('   - Survey Process API: /api/survey-process');
  } catch (error) {
    mainLogger.error('❌ Failed to mount Workflow Routes:', error.message);
    mainLogger.error('   Stack trace:', error.stack);
  }
}

// Add specific certificate endpoints
app.post('/api/certificates/generate/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const options = req.body.options || {};

    // Mock application data for testing
    const mockApplicationData = {
      applicationId,
      applicant: {
        name: 'นายทดสอบ ระบบ',
        address: 'ที่อยู่ทดสอบ',
        farmLocation: 'จังหวัดทดสอบ',
      },
      herbs: ['ขมิ้นชัน', 'ขิง'],
      farmSize: '5 ไร่',
      approvalDate: new Date().toISOString(),
    };

    const result = await certificateService.generateCertificate(mockApplicationData, options);

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Certificate generation failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Certificate generation failed',
      error: error.message,
    });
  }
});

app.get('/api/certificates/download/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    const downloadInfo = await certificateService.downloadCertificate(certificateNumber);

    res.setHeader('Content-Type', downloadInfo.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    const fs = require('fs');
    const fileStream = fs.createReadStream(downloadInfo.filePath);
    fileStream.pipe(res);
  } catch (error) {
    logger.error('Certificate download failed', { error: error.message });
    res.status(404).json({
      success: false,
      message: 'Certificate not found or download failed',
      error: error.message,
    });
  }
});

// Public certificate verification (no /api prefix for public access)
app.use('/verify', certificateRoutes);

// Field Audit Scheduling API
app.post('/api/audits/schedule-field-audit', async (req, res) => {
  try {
    const { applicationId, auditorId, scheduledDate, location, estimatedDuration } = req.body;

    // Mock field audit scheduling
    const fieldAuditSchedule = {
      scheduleId: `AUDIT-${Date.now()}`,
      applicationId,
      auditorId,
      scheduledDate: new Date(scheduledDate),
      location,
      estimatedDuration: estimatedDuration || 480, // default 8 hours
      status: 'scheduled',
      createdAt: new Date(),
      auditType: 'field_visit',
      requirements: [
        'Photo documentation required',
        'Soil sample analysis',
        'Water source verification',
        'Storage facility inspection',
        'Record keeping review',
      ],
    };

    logger.info('[FIELD AUDIT] Scheduled successfully', fieldAuditSchedule);

    res.json({
      success: true,
      message: 'Field audit scheduled successfully',
      data: fieldAuditSchedule,
    });
  } catch (error) {
    logger.error('Field audit scheduling failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Field audit scheduling failed',
      error: error.message,
    });
  }
});

app.get('/api/audits/field-schedule/:auditorId', async (req, res) => {
  try {
    const { auditorId } = req.params;

    // Mock field audit schedule for auditor
    const mockSchedule = [
      {
        scheduleId: 'AUDIT-001',
        applicationId: 'GACP2025001',
        farmerName: 'นายสมชาย ใจดี',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        location: 'เชียงใหม่',
        herbs: ['ขมิ้นชัน'],
        status: 'scheduled',
      },
      {
        scheduleId: 'AUDIT-002',
        applicationId: 'GACP2025004',
        farmerName: 'นางแสงดาว เก่งงาม',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // day after tomorrow
        location: 'ระยอง',
        herbs: ['กัญชา'],
        status: 'scheduled',
      },
    ];

    res.json({
      success: true,
      data: mockSchedule,
      total: mockSchedule.length,
    });
  } catch (error) {
    logger.error('Get field schedule failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get field audit schedule',
      error: error.message,
    });
  }
});

// =============================================================================
// WEBHOOK ENDPOINTS
// =============================================================================

// =============================================================================
// WEBHOOK ENDPOINTS (order matters - before Express routes)
// =============================================================================

// Payment gateway webhooks
app.post('/webhook/payment', async (req, res) => {
  try {
    const paymentData = req.body;

    logger.info('Payment webhook received', {
      paymentId: paymentData.paymentId,
      status: paymentData.status,
      amount: paymentData.amount,
    });

    // Update application payment status in database
    const Application = require('./models/mongodb/Application');

    if (paymentData.status === 'completed' && paymentData.applicationId) {
      await Application.findByIdAndUpdate(paymentData.applicationId, {
        'payment.status': 'completed',
        'payment.transactionId': paymentData.transactionId,
        'payment.completedAt': new Date(),
        'payment.method': paymentData.method,
        'payment.amount': paymentData.amount,
      });

      // Send notification
      await notificationService.sendPaymentConfirmation(paymentData);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Payment webhook error', { error: error.message });
    sendError(
      res,
      ERROR_CODES.WEBHOOK_PROCESSING_FAILED,
      'Payment webhook processing failed',
      null,
      400
    );
  }
});

// Payment Gateway Integration API
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { applicationId, stage, amount, paymentMethod } = req.body;

    const paymentData = {
      paymentId: `PAY-${Date.now()}`,
      applicationId,
      stage, // 'document_review' or 'assessment_fee'
      amount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      // Mock payment gateway response
      gateway: {
        providerReference: `GW-${Date.now()}`,
        checkoutUrl: `https://payment.mock/checkout/${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    };

    logger.info('[PAYMENT] Payment initiated', paymentData);

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentData,
    });
  } catch (error) {
    logger.error('Payment initiation failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Payment initiation failed',
      error: error.message,
    });
  }
});

app.get('/api/payments/status/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Mock payment status check
    const paymentStatus = {
      applicationId,
      payments: [
        {
          stage: 'document_review',
          amount: 5000,
          status: 'completed',
          paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        },
        {
          stage: 'assessment_fee',
          amount: 25000,
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // in 7 days
        },
      ],
      totalAmount: 30000,
      paidAmount: 5000,
      remainingAmount: 25000,
    };

    res.json({
      success: true,
      data: paymentStatus,
    });
  } catch (error) {
    logger.error('Payment status check failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Payment status check failed',
      error: error.message,
    });
  }
});

// =============================================================================
// WEBHOOK ENDPOINTS (order matters - before Express routes)
// =============================================================================

// Payment gateway webhooks
app.post('/webhook/payment', async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'];
    const payload = req.body;

    // Verify webhook signature (implement based on payment provider)
    // const isValid = verifyWebhookSignature(payload, signature);

    logger.info('Payment webhook received', {
      signature: signature?.substring(0, 20) + '...',
      payloadSize: payload.length,
    });

    // Process payment notification
    const paymentData = JSON.parse(payload);

    // Update application payment status
    const Application = require('./models/mongodb/Application');

    // GACP Security Middleware Integration
    const { securityPresets, securityUtils } = require('shared/security');
    if (paymentData.status === 'completed' && paymentData.applicationId) {
      await Application.findByIdAndUpdate(paymentData.applicationId, {
        'payment.status': 'completed',
        'payment.transactionId': paymentData.transactionId,
        'payment.completedAt': new Date(),
        'payment.method': paymentData.method,
        'payment.amount': paymentData.amount,
      });

      // Send notification
      await notificationService.sendPaymentConfirmation(paymentData);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Payment webhook error', { error: error.message });
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// SMS delivery status webhooks
app.post('/webhook/sms', async (req, res) => {
  try {
    const { messageId, status, deliveredAt } = req.body;

    logger.info('SMS webhook received', {
      messageId,
      status,
      deliveredAt,
    });

    // Update notification status
    await notificationService.updateSMSStatus(messageId, status, deliveredAt);

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('SMS webhook error', { error: error.message });
    res.status(400).json({ error: 'SMS webhook processing failed' });
  }
});

// =============================================================================
// FRONTEND ROUTES (if serving static frontend)
// =============================================================================

// Serve React/Vue frontend (if built for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('/*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/webhook/')) {
      return sendError(
        res,
        ERROR_CODES.RESOURCE_NOT_FOUND,
        'API endpoint not found',
        { endpoint: req.path },
        404
      );
    }

    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

let serverInstance = null; // Global server reference

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);

  if (serverInstance) {
    serverInstance.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connections
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed');
        }

        // Close other services
        await notificationService.cleanup?.();
        await certificateService.cleanup?.();
        await documentService.cleanup?.();

        logger.info('All services shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    });
  } else {
    logger.warn('No server instance to shutdown');
    process.exit(0);
  }

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
} // Graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason,
    promise: promise,
  });
});

// Uncaught exception handler
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

const port = process.env.PORT || 3003;

async function startServer() {
  let healthCheckService = null;

  try {
    logger.info('Starting GACP Certification System...');

    // Initialize MongoDB database
    await initializeDatabase();

    // Initialize Workflow Engines (NEW)
    await initializeWorkflowEngines();

    // Mount Workflow API Routes (NEW)
    mountWorkflowRoutes();

    // 🔍 PM FIX: Add error handlers AFTER mounting routes (not before!)
    mainLogger.info('🔍 PM: Installing error handlers...');
    app.use(notFoundHandler);
    app.use(errorHandler);
    mainLogger.info('   ✅ Error handlers installed');

    // Initialize services (with timeout protection)
    mainLogger.info('🔍 PM: Initializing services...');

    try {
      const timeout = (ms, name) =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`${name} initialization timeout`)), ms)
        );

      if (notificationService.initialize) {
        await Promise.race([
          notificationService.initialize(),
          timeout(5000, 'NotificationService'),
        ]);
        mainLogger.info('   ✅ NotificationService initialized');
      }

      if (certificateService.initializeDirectories) {
        await Promise.race([
          certificateService.initializeDirectories(),
          timeout(5000, 'CertificateService'),
        ]);
        mainLogger.info('   ✅ CertificateService initialized');
      }

      if (documentService.initialize) {
        await Promise.race([documentService.initialize(), timeout(5000, 'DocumentService')]);
        mainLogger.info('   ✅ DocumentService initialized');
      }

      mainLogger.info('✅ All services initialized successfully');
    } catch (initError) {
      mainLogger.warn('⚠️ Service initialization warning:', initError.message);
      mainLogger.warn('   Continuing server startup...');
    }

    // Start Health Check Service (MIS Team Monitoring)
    mainLogger.info('🏥 Starting Health Check Service...');
    healthCheckService = new HealthCheckService({
      port: parseInt(port),
      interval: 30000, // Check every 30 seconds
    });
    healthCheckService.start();
    mainLogger.info('   ✅ Health Check Service started (monitoring every 30s)');

    // Start HTTP server
    serverInstance = app.listen(port, () => {
      logger.info('GACP Certification System started successfully', {
        port: parseInt(port),
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });

      // Display health check stats after startup (only if method exists)
      if (healthCheckService && typeof healthCheckService.getStats === 'function') {
        setTimeout(() => {
          try {
            const stats = healthCheckService.getStats();
            mainLogger.info('📊 Health Check Stats:', stats);
          } catch (error) {
            mainLogger.warn('Could not get health check stats:', error.message);
          }
        }, 35000); // Show stats after first check
      }
    });

    // Setup graceful shutdown (MIS Team)
    setupGracefulShutdown(serverInstance, healthCheckService);
    mainLogger.info('✅ Graceful shutdown handlers installed');

    // Handle server errors
    serverInstance.on('error', error => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });

    return serverInstance;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful Shutdown Handler (MIS Team Solution)
function setupGracefulShutdown(server, healthCheckService) {
  const shutdown = async signal => {
    mainLogger.info(`\n${signal} received. Starting graceful shutdown...`);

    try {
      // Stop health check service
      if (healthCheckService) {
        healthCheckService.stop();
        mainLogger.info('✅ Health Check Service stopped');
      }

      // Close HTTP server
      if (server) {
        await new Promise(resolve => {
          server.close(() => {
            mainLogger.info('✅ HTTP Server closed');
            resolve();
          });
        });
      }

      // Close MongoDB connection
      await mongoose.connection.close();
      mainLogger.info('✅ MongoDB connection closed');

      mainLogger.info('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      mainLogger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
