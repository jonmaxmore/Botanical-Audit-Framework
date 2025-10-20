# 📝 GACP Application Service

**Version:** 1.0.0  
**Status:** ✅ Development Complete  
**Date:** October 16, 2025

## 🎯 Overview

Application Service manages GACP certification applications with a 12-state Finite State Machine (FSM) workflow. This service handles the complete application lifecycle from draft creation to final approval and certificate issuance.

## ✨ Features

### Core Features (Phase 1) - ✅ Complete

- ✅ **CRUD Operations**: Create, Read, Update, Delete applications
- ✅ **12-State FSM**: Complete application lifecycle management
- ✅ **Authentication & Authorization**: Integration with Auth Service
- ✅ **Validation**: Comprehensive request validation with Joi
- ✅ **Audit Logging**: Full audit trail for compliance
- ✅ **Pagination & Filtering**: Efficient data retrieval
- ✅ **GPS Validation**: Thailand boundary checks
- ✅ **Timeline Tracking**: State history with duration tracking

### Coming in Phase 2

- 🚧 **Document Management**: Upload, version, and validate documents
- 🚧 **DTAM Review Workflow**: Approval, rejection, revision requests
- 🚧 **Inspection Scheduling**: Farm inspection coordination
- 🚧 **Payment Integration**: Phase 1 & Phase 2 payment tracking
- 🚧 **Notification System**: Email/SMS alerts for state changes

## 🏗️ Architecture

### 12-State FSM Workflow

```
DRAFT → SUBMITTED → UNDER_REVIEW
         ↓              ↓
    REVISION_REQUIRED   PAYMENT_PENDING → PAYMENT_VERIFIED
                                           ↓
                                    INSPECTION_SCHEDULED
                                           ↓
                                    INSPECTION_COMPLETED
                                           ↓
                                    PHASE2_PAYMENT_PENDING → PHASE2_PAYMENT_VERIFIED
                                                              ↓
                                                          APPROVED
                                                              ↓
                                                      CERTIFICATE_ISSUED

                        ↓ (any stage)
                      REJECTED / EXPIRED
```

### State Transitions

- **DRAFT**: Farmer creating application
- **SUBMITTED**: Application submitted for review
- **UNDER_REVIEW**: DTAM reviewing documents
- **REVISION_REQUIRED**: Changes requested by DTAM
- **PAYMENT_PENDING**: Awaiting Phase 1 payment (฿5,000)
- **PAYMENT_VERIFIED**: Payment confirmed
- **INSPECTION_SCHEDULED**: Farm inspection scheduled
- **INSPECTION_COMPLETED**: Inspection completed successfully
- **PHASE2_PAYMENT_PENDING**: Awaiting Phase 2 payment (฿10,000)
- **PHASE2_PAYMENT_VERIFIED**: Final payment confirmed
- **APPROVED**: Application approved by DTAM
- **CERTIFICATE_ISSUED**: Certificate generated and issued
- **REJECTED**: Application rejected (with reason)
- **EXPIRED**: Application expired (180 days timeout)

## 📁 Project Structure

```
backend/services/application/
├── controllers/
│   └── application.controller.js    # Business logic
├── routes/
│   └── application.routes.js        # API routes
├── middleware/
│   └── validation.middleware.js     # Request validation
├── tests/
│   ├── setup.js                     # Test configuration
│   └── integration/
│       └── application.test.js      # Integration tests
├── app.js                           # Express app
├── server.js                        # Server entry point
├── package.json                     # Dependencies
├── jest.config.js                   # Test configuration
├── .env                             # Environment variables
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20.x LTS
- MongoDB v7.x
- Auth Service running on port 3001

### Installation

```bash
# 1. Navigate to service directory
cd backend/services/application

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Update .env with your configuration
# Edit JWT secrets to match Auth Service

# 5. Start MongoDB (if not running)
mongod --dbpath /path/to/data

# 6. Start service
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

## 📡 API Endpoints

### Application Management

#### Create Application

```http
POST /api/applications
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "farmName": "ฟาร์มกัญชาทดสอบ",
  "farmAddress": {
    "houseNo": "123",
    "moo": "5",
    "tambon": "บางกะปิ",
    "amphoe": "ห้วยขวาง",
    "province": "กรุงเทพมหานคร",
    "postalCode": "10310",
    "gpsCoordinates": {
      "type": "Point",
      "coordinates": [100.5693, 13.7563]
    }
  },
  "farmSize": 5.5,
  "farmSizeUnit": "rai",
  "cultivationType": "OUTDOOR",
  "cannabisVariety": "CBD"
}
```

#### List Applications

```http
GET /api/applications?page=1&limit=10&state=DRAFT
Authorization: Bearer {token}
```

#### Get Application Details

```http
GET /api/applications/{applicationId}
Authorization: Bearer {token}
```

#### Update Application

```http
PUT /api/applications/{applicationId}
Authorization: Bearer {farmer_token}
Content-Type: application/json

{
  "farmName": "Updated Farm Name",
  "farmSize": 10.5
}
```

#### Delete Application

```http
DELETE /api/applications/{applicationId}
Authorization: Bearer {farmer_token}
```

#### Submit Application

```http
POST /api/applications/{applicationId}/submit
Authorization: Bearer {farmer_token}
```

#### Get Timeline

```http
GET /api/applications/{applicationId}/timeline
Authorization: Bearer {token}
```

## 🔐 Authorization

### Role-Based Access Control (RBAC)

| Endpoint                       | FARMER   | DTAM     | ADMIN    |
| ------------------------------ | -------- | -------- | -------- |
| POST /applications             | ✅       | ❌       | ❌       |
| GET /applications              | ✅ (own) | ✅ (all) | ✅ (all) |
| GET /applications/:id          | ✅ (own) | ✅ (any) | ✅ (any) |
| PUT /applications/:id          | ✅ (own) | ❌       | ❌       |
| DELETE /applications/:id       | ✅ (own) | ❌       | ❌       |
| POST /applications/:id/submit  | ✅ (own) | ❌       | ❌       |
| GET /applications/:id/timeline | ✅ (own) | ✅ (any) | ✅ (any) |

## 📊 Test Coverage

### Current Status

```
Target: 80% coverage minimum
Status: ✅ Integration tests complete

Coverage:
- Controllers: Target 80%
- Routes: Target 100%
- Middleware: Target 90%
- Utils: Target 80%
```

### Test Suites

1. **Integration Tests**: 29 tests covering all endpoints
2. **Unit Tests**: Coming in Phase 2
3. **E2E Tests**: Coming in Phase 2

## 🔧 Development

### Code Style

- **ESLint**: Follows Airbnb JavaScript Style Guide
- **Prettier**: Automatic code formatting
- **JSDoc**: Comprehensive documentation

### Best Practices

- ✅ RESTful API design
- ✅ SOLID principles
- ✅ DRY (Don't Repeat Yourself)
- ✅ Separation of concerns
- ✅ Error handling with proper HTTP status codes
- ✅ Input validation with Joi
- ✅ Security best practices (Helmet, CORS, sanitization)

### Git Workflow

```bash
# Feature branch
git checkout -b feature/application-service

# Commit with conventional commits
git commit -m "feat(application): Add CRUD operations for applications"

# Push to remote
git push origin feature/application-service

# Create pull request
```

## 📝 Environment Variables

```env
# Service Configuration
NODE_ENV=development
APPLICATION_SERVICE_PORT=3002
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/gacp-dev

# JWT (Must match Auth Service)
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: MongoDB connection error

```bash
# Solution: Ensure MongoDB is running
mongod --dbpath /path/to/data
```

**Issue**: JWT token invalid

```bash
# Solution: Ensure JWT secrets match Auth Service
# Check backend/services/auth/.env
```

**Issue**: Tests failing

```bash
# Solution: Clear test database
npm test -- --clearCache
```

## 📚 Related Documentation

- [Auth Service README](../auth/README.md)
- [Application Model Schema](../../../database/models/Application.model.js)
- [PM Development Plan](../../../DEVELOPMENT_STRATEGY_ANALYSIS_PM_SA.md)
- [Technical Specifications](../../../PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md)

## 👥 Team

- **Project Manager**: คุณสมชาย
- **System Analyst**: คุณสมศักดิ์
- **Backend Developer**: GACP Platform Team
- **Date**: October 16, 2025

## 📄 License

MIT License - GACP Platform

---

**Status**: ✅ Ready for Phase 1 MVP  
**Next Phase**: Document Management & DTAM Review Workflow  
**Timeline**: 2 weeks for Phase 2 completion
