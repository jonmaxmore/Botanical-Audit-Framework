# GACP Platform Architecture Documentation

**Version:** 2.0.0
**Last Updated:** October 26, 2025
**Status:** Production Ready (95%)

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Entry Points](#entry-points)
4. [Architecture Pattern](#architecture-pattern)
5. [Authentication Systems](#authentication-systems)
6. [Business Logic Organization](#business-logic-organization)
7. [Module Structure](#module-structure)
8. [Technology Stack](#technology-stack)
9. [Dependencies](#dependencies)
10. [Data Flow](#data-flow)

---

## Overview

The **GACP Platform (Good Agricultural and Collection Practices Certification Platform)** is a comprehensive digital platform for managing cannabis farm certification in Thailand. The platform serves two main user groups:

- **Farmers (Public Portal)**: Apply for GACP certification, manage farm data, track application status
- **DTAM Staff (Admin Portal)**: Review applications, conduct inspections, issue certificates

### Architecture Type

- **Monorepo Structure** using pnpm workspaces
- **Microservices-ready** backend with modular architecture
- **Clean Architecture** principles in newer modules
- **Event-Driven** workflow engine for certification process

---

## Project Structure

```
Botanical-Audit-Framework/
├── apps/                           # Monorepo applications
│   ├── backend/                    # Node.js/Express backend (PRIMARY)
│   │   ├── atlas-server.js         # 🔴 PRODUCTION SERVER (Main Entry Point)
│   │   ├── server.js               # Development server
│   │   ├── dev-server.js           # Development server (alternative)
│   │   ├── simple-server.js        # Simple testing server
│   │   ├── config/                 # Backend configurations
│   │   ├── models/                 # Mongoose models (centralized)
│   │   ├── routes/                 # Legacy routes (being migrated)
│   │   ├── modules/                # Clean Architecture modules
│   │   │   ├── auth-farmer/        # Farmer authentication module
│   │   │   ├── auth-dtam/          # DTAM staff authentication module
│   │   │   ├── application/        # Application management
│   │   │   ├── application-workflow/ # Workflow engine
│   │   │   ├── certificate/        # Certificate generation
│   │   │   ├── cannabis-survey/    # Survey system
│   │   │   ├── document/           # Document management
│   │   │   ├── farm-management/    # Farm data management
│   │   │   ├── notification/       # Notification system
│   │   │   └── payment/            # Payment processing
│   │   ├── services/               # Business services
│   │   ├── middleware/             # Express middleware
│   │   └── shared/                 # Shared utilities
│   │       ├── logger/             # Winston logger
│   │       ├── utils/              # Utility functions
│   │       └── validators/         # Validation schemas
│   │
│   ├── admin-portal/               # Next.js admin dashboard
│   ├── certificate-portal/         # Next.js certificate portal
│   ├── farmer-portal/              # Next.js farmer portal
│   └── frontend/                   # Legacy frontend (Next.js 15)
│
├── frontend-nextjs/                # Main Next.js frontend (Next.js 16)
├── business-logic/                 # 🟡 Business logic files (being migrated)
│   ├── gacp-workflow-engine.js     # Main workflow engine (ACTIVE)
│   ├── gacp-certificate-generator.js
│   ├── gacp-document-review-system.js
│   ├── gacp-field-inspection-system.js
│   ├── gacp-survey-system.js
│   ├── gacp-standards-comparison-system.js
│   └── ... (14 files total)
│
├── config/                         # Global configuration
├── database/                       # Database schemas and migrations
├── scripts/                        # Utility scripts
├── docs/                           # Documentation (132+ files)
├── test/                           # Test suites
│
└── backend.archived.2025-10-26/    # 🗑️ ARCHIVED: Legacy backend code
    ├── backend/                    # Old backend structure (DO NOT USE)
    └── root-unused-files/          # Archived root-level files
        ├── app.js                  # Old entry point (replaced by atlas-server.js)
        ├── robust-server.js        # Old server file
        ├── .prettierrc.json        # Old prettier config
        └── .prettierrc.js          # Old prettier config
```

---

## Entry Points

### Production Server (Main Entry Point)

**File:** `apps/backend/atlas-server.js`

This is the **PRIMARY PRODUCTION SERVER** for the GACP Platform.

**Features:**

- MongoDB Atlas connection
- Business logic services integration
- Authentication & authorization
- File upload support
- Health monitoring
- Model caching fix

**How to Start:**

```bash
cd apps/backend
node atlas-server.js
```

**Port:** 3004 (default)
**URL:** http://localhost:3004

---

### Development Servers

**1. Standard Development Server**

**File:** `apps/backend/server.js`

Basic development server with hot reload support.

```bash
cd apps/backend
npm run dev
# or
node server.js
```

**2. Alternative Development Server**

**File:** `apps/backend/dev-server.js`

Alternative development server with additional debugging features.

```bash
node dev-server.js
```

**3. Simple Testing Server**

**File:** `apps/backend/simple-server.js`

Minimal server for testing basic functionality.

```bash
node simple-server.js
```

---

### Frontend Entry Points

**1. Main Frontend (Next.js 16)**

**Directory:** `frontend-nextjs/`

```bash
cd frontend-nextjs
npm run dev
```

**Port:** 3000
**URLs:**

- Farmer Portal: http://localhost:3000/farmer
- DTAM Portal: http://localhost:3000/dtam

**2. Separate Portals (Monorepo Apps)**

```bash
# Admin Portal
cd apps/admin-portal
npm run dev

# Certificate Portal
cd apps/certificate-portal
npm run dev

# Farmer Portal
cd apps/farmer-portal
npm run dev
```

---

## Architecture Pattern

### Clean Architecture (New Modules)

New modules follow **Clean Architecture** principles with clear layer separation:

```
apps/backend/modules/{module-name}/
├── domain/                  # Business logic layer (pure)
│   ├── entities/            # Business entities
│   ├── services/            # Domain services
│   └── repositories/        # Repository interfaces
│
├── application/             # Use cases layer
│   └── use-cases/           # Application use cases
│
├── infrastructure/          # External concerns layer
│   ├── models/              # Mongoose models
│   ├── repositories/        # Repository implementations
│   └── services/            # External services (email, SMS, etc.)
│
├── presentation/            # Interface layer
│   ├── controllers/         # Express controllers
│   ├── routes/              # API routes
│   ├── middleware/          # Route middleware
│   └── validators/          # Request validators
│
└── container.js             # Dependency injection container
```

**Benefits:**

- Clear separation of concerns
- Testable business logic (independent of frameworks)
- Easy to replace infrastructure components
- Scalable and maintainable

**Modules using Clean Architecture:**

- ✅ `auth-farmer/` - Farmer authentication
- ✅ `auth-dtam/` - DTAM staff authentication
- ✅ `application-workflow/` - Workflow engine
- ✅ `cannabis-survey/` - Survey system
- ✅ `certificate/` - Certificate generation
- 🔄 Others being migrated...

---

### Legacy Monolithic Structure

Older code uses traditional Express structure:

```
apps/backend/
├── routes/              # Direct route handlers (legacy)
├── models/              # Mongoose models (centralized)
├── middleware/          # Express middleware
└── services/            # Business services (mixed concerns)
```

**Status:** Being gradually migrated to Clean Architecture

---

## Authentication Systems

The platform has **TWO SEPARATE AUTHENTICATION SYSTEMS** by design:

### 1. Farmer Authentication (`auth-farmer`)

**Module:** `apps/backend/modules/auth-farmer/`

**Purpose:** Authentication for farmers (customers) who apply for GACP certification

**Features:**

- JWT-based authentication
- Phone number verification (OTP)
- Password reset via SMS
- Session management
- Farm profile integration

**Endpoints:**

- `POST /api/auth/farmer/register` - Register new farmer
- `POST /api/auth/farmer/login` - Farmer login
- `POST /api/auth/farmer/verify-otp` - Verify phone OTP
- `POST /api/auth/farmer/reset-password` - Reset password

**Token Storage:** HTTP-only cookies + LocalStorage (client-side)

---

### 2. DTAM Staff Authentication (`auth-dtam`)

**Module:** `apps/backend/modules/auth-dtam/`

**Purpose:** Authentication for DTAM staff (government officials) who review applications

**Features:**

- JWT-based authentication
- Email-based login
- Role-based access control (RBAC)
- Staff ID verification
- Audit logging

**Roles:**

- `admin` - Full system access
- `reviewer` - Review applications and documents
- `inspector` - Conduct field inspections
- `approver` - Final approval authority

**Endpoints:**

- `POST /api/auth/dtam/login` - Staff login
- `POST /api/auth/dtam/verify-token` - Verify JWT token
- `GET /api/auth/dtam/profile` - Get staff profile

**Token Storage:** HTTP-only cookies only (more secure)

---

### Why Two Separate Systems?

**Reasons for Separation:**

1. **Different User Types**: Farmers vs Government Staff
2. **Different Authentication Methods**: Phone (farmers) vs Email (staff)
3. **Different Security Requirements**: Staff requires stricter audit logging
4. **Different Authorization Logic**: Farmers access own data, staff access all data
5. **Compliance**: Separation required by Thai FDA regulations

**Shared Components:**

- JWT utilities (in `shared/utils/jwt.js`)
- Password hashing (bcrypt)
- Token blacklist (Redis)
- Rate limiting

---

## Business Logic Organization

### Current State (Transition Period)

Business logic is currently organized in **TWO LOCATIONS**:

#### 1. `business-logic/` Directory (Root Level)

**Status:** 🟡 ACTIVE but being migrated to modules

**Files:** 14 standalone business logic files

**Currently Used:**

- ✅ `gacp-workflow-engine.js` - **ACTIVE** (imported by 3 files)
  - `apps/backend/atlas-server.js:39`
  - `apps/backend/routes/gacp-business-logic.js:27`
  - `apps/backend/services/gacp-enhanced-inspection.js:24`

**Not Yet Used (Prepared for Future):**

- `gacp-ai-assistant-system.js` (1,481 lines)
- `gacp-standards-comparison-system.js` (1,451 lines)
- `gacp-visual-remote-support-system.js` (1,234 lines)
- `gacp-survey-system.js` (1,137 lines)
- `gacp-certificate-generator.js`
- `gacp-document-review-system.js`
- `gacp-field-inspection-system.js`
- `gacp-dashboard-notification-system.js`
- And 6 more...

**Migration Plan:**

- Move to `apps/backend/modules/{module}/domain/services/`
- Split large files (>1,000 lines) into smaller services
- Update imports in consuming files

---

#### 2. `apps/backend/modules/` (Clean Architecture)

**Status:** ✅ RECOMMENDED - New business logic goes here

**Structure:**

```
modules/{module-name}/domain/services/
├── {Feature}Service.js       # Business service
└── {Feature}Validator.js     # Domain validation
```

**Examples:**

- `modules/application/domain/services/ApplicationService.js`
- `modules/certificate/domain/services/CertificateGenerator.js`
- `modules/workflow/domain/services/WorkflowOrchestrator.js`

---

## Module Structure

### Complete Module List

| Module                 | Status        | Purpose                   | Lines of Code        |
| ---------------------- | ------------- | ------------------------- | -------------------- |
| `auth-farmer`          | ✅ Production | Farmer authentication     | ~2,500               |
| `auth-dtam`            | ✅ Production | DTAM staff authentication | ~2,500               |
| `application`          | ✅ Production | Application management    | ~5,000               |
| `application-workflow` | ✅ Production | Workflow state machine    | ~3,500               |
| `certificate`          | ✅ Production | Certificate generation    | ~2,000               |
| `cannabis-survey`      | ✅ Production | Survey system             | ~3,000               |
| `document`             | ✅ Production | Document management       | ~1,500               |
| `farm-management`      | ✅ Production | Farm data management      | ~2,500               |
| `notification`         | ✅ Production | Notification system       | ~1,800               |
| `payment`              | ✅ Production | Payment processing        | ~2,200               |
| `standards-comparison` | 🔄 Migration  | Standards comparison      | (in business-logic/) |
| `survey-system`        | 🔄 Migration  | Survey templates          | (in business-logic/) |

**Total Backend Code:** ~45,000+ lines

---

## Technology Stack

### Backend Stack

**Runtime & Framework:**

- Node.js 24.9.0+ (recommended >= 18.0.0)
- Express.js 5.1.0

**Database:**

- MongoDB 6+ (Atlas or Self-hosted)
- Mongoose 8.x (ODM)

**Authentication:**

- JSON Web Tokens (JWT) - `jsonwebtoken` 9.0.2
- bcrypt 5.1.1 (password hashing)
- Redis 5.8.3 (token blacklist, sessions)

**Security:**

- Helmet.js 7.2.0 (HTTP security headers)
- express-mongo-sanitize 2.2.0 (NoSQL injection prevention)
- express-rate-limit 8.1.0 (Rate limiting)
- xss-clean 0.1.4 (XSS protection)
- hpp 0.2.3 (HTTP parameter pollution)

**Validation:**

- express-validator 7.2.1
- Joi 18.0.1

**File Processing:**

- Multer 1.4.5 (file uploads)
- Sharp 0.34.4 (image processing)
- PDFKit 0.13.0 (PDF generation)

**Communication:**

- Socket.io 4.8.1 (real-time updates)
- Nodemailer 7.0.10 (email)

**Logging:**

- Winston 3.11.0 (structured logging)
- Morgan 1.10.1 (HTTP request logging)

**Utilities:**

- Moment.js 2.30.1 (date manipulation)
- uuid 9.0.1 (unique IDs)
- crypto-js 4.2.0 (encryption)

---

### Frontend Stack

**Framework:**

- Next.js 16.0.0
- React 18.2.0

**UI Libraries:**

- Material-UI (MUI)
- TailwindCSS 3.4.0

**State Management:**

- React Context API
- Zustand (planned)

**HTTP Client:**

- Axios 1.12.2

---

### DevOps Stack

**Process Management:**

- PM2 6.0.13 (process manager)
- Nodemon 3.1.10 (development)

**Containerization:**

- Docker
- Docker Compose

**Code Quality:**

- ESLint 8.57.1
- Prettier 3.6.2

**Testing:**

- Jest 29.7.0
- Supertest 7.1.4
- MongoDB Memory Server 10.2.3
- Playwright 1.43.1 (E2E)

**Package Manager:**

- pnpm 8.15.0+

---

## Dependencies

### Key Dependencies Graph

```
Frontend (Next.js)
    ↓ HTTP/REST
Backend API (Express)
    ↓
├─→ Authentication Modules
│   ├─→ auth-farmer → JWT + Phone OTP
│   └─→ auth-dtam → JWT + RBAC
│
├─→ Application Modules
│   ├─→ application → Application CRUD
│   ├─→ application-workflow → State Machine
│   └─→ certificate → PDF Generation
│
├─→ Data Modules
│   ├─→ farm-management → Farm Data
│   ├─→ document → File Storage
│   └─→ cannabis-survey → Survey Templates
│
├─→ Communication Modules
│   ├─→ notification → Email/SMS/Push
│   └─→ payment → Payment Gateway
│
└─→ External Services
    ├─→ MongoDB Atlas (Database)
    ├─→ Redis (Cache + Sessions)
    ├─→ Email Service (SMTP)
    └─→ SMS Gateway (Optional)
```

---

## Data Flow

### Application Workflow (8 Steps)

```
Step 1: สมัครและส่งคำขอ (Application Submission)
   ↓
Step 2: จ่ายเงินรอบแรก 5,000 บาท (First Payment)
   ↓
Step 3: ตรวจเอกสาร (Document Review by DTAM)
   ↓
Step 4: เอกสารผ่าน (Document Approved)
   ↓
Step 5: จ่ายเงินรอบสอง 25,000 บาท (Second Payment)
   ↓
Step 6: ตรวจฟาร์ม (Field Inspection - VDO Call + On-site)
   ↓
Step 7: อนุมัติรับรอง (Final Approval)
   ↓
Step 8: รับใบรับรอง (Certificate Issuance)
```

**Workflow Engine:** `business-logic/gacp-workflow-engine.js` (1,040 lines)

**State Transitions:** 18 states total

**Events:** EventEmitter-based for state change notifications

---

## Design Decisions

### Key Architectural Decisions

**1. Why Monorepo?**

- Shared code between frontend and backend
- Easier dependency management
- Unified build and deployment

**2. Why Clean Architecture for modules?**

- Testability (business logic independent of frameworks)
- Maintainability (clear boundaries)
- Scalability (easy to extract to microservices)

**3. Why Two Auth Systems?**

- Different user types require different authentication flows
- Compliance with Thai FDA requirements
- Security isolation between farmer and staff data

**4. Why Business Logic in Root `business-logic/`?**

- Transition period from monolithic to modular architecture
- Allows gradual migration without breaking existing code
- Can be shared between multiple modules

**5. Why MongoDB Atlas?**

- Fully managed database service
- Built-in replication and backup
- Easy scaling for production
- Free tier for development

---

## Performance Considerations

### Backend Optimizations

- **Connection Pooling:** MongoDB connection pool (10-50 connections)
- **Rate Limiting:** 100 requests/15min per IP
- **Compression:** Gzip compression for API responses
- **Caching:** Redis caching for frequently accessed data
- **Pagination:** All list endpoints support pagination (limit/offset)

### Frontend Optimizations

- **Static Site Generation (SSG):** Next.js pre-renders pages
- **Image Optimization:** Sharp image processing + lazy loading
- **Code Splitting:** Automatic code splitting by Next.js
- **Bundle Size:** Tree shaking to reduce bundle size

---

## Security

### Security Measures

**1. Authentication:**

- JWT tokens with short expiration (1 hour)
- Refresh tokens for long-lived sessions
- Token blacklist in Redis

**2. Authorization:**

- Role-based access control (RBAC)
- Resource-level permissions
- Audit logging for sensitive operations

**3. Data Protection:**

- HTTPS only in production
- HTTP-only cookies for tokens
- CORS whitelist for allowed origins
- NoSQL injection prevention
- XSS protection
- CSRF protection

**4. Rate Limiting:**

- Global rate limit: 100 req/15min
- Auth endpoints: 5 attempts/15min
- Payment endpoints: 10 req/hour

**5. Input Validation:**

- express-validator for all inputs
- Joi schemas for complex validations
- Sanitization of user inputs

---

## Deployment Architecture

### Production Environment

```
Internet
    ↓
Nginx (Reverse Proxy + SSL)
    ↓
├─→ Frontend (Next.js) :3000
│   ├─→ Farmer Portal (/farmer)
│   ├─→ DTAM Portal (/dtam)
│   └─→ Certificate Portal (/certificate)
│
└─→ Backend API (Express) :3004
    ├─→ REST API (/api/*)
    ├─→ WebSocket (Socket.io)
    └─→ Health Check (/health)
        ↓
    MongoDB Atlas (Cloud)
    Redis (Cache/Sessions)
```

**Process Manager:** PM2 with cluster mode (4 instances)

**Monitoring:** PM2 monitoring + Winston logs

**Backup:** MongoDB Atlas automatic backups (every 6 hours)

---

## Future Roadmap

### Planned Improvements

**Phase 2 (Current):**

- ✅ Consolidate validators into shared module
- ✅ Consolidate logger implementation
- 🔄 Implement path aliases for cleaner imports
- 🔄 Move business logic from root to modules

**Phase 3:**

- 🔄 Refactor large files (>1,000 lines)
- 🔄 Complete migration to Clean Architecture
- 🔄 Add comprehensive unit tests (target: 80% coverage)

**Phase 4:**

- ⏳ Implement missing TODOs (email notifications, analytics)
- ⏳ Add GraphQL API layer
- ⏳ Extract modules to microservices (if needed)
- ⏳ Implement event sourcing for audit trail

---

## Resources

### Documentation

- [README.md](../README.md) - Project overview and quick start
- [QUICK_START.md](../QUICK_START.md) - Get started in 2 minutes
- [SERVER_MANAGEMENT_GUIDE.md](../SERVER_MANAGEMENT_GUIDE.md) - Server management
- [PM2_GUIDE.md](../PM2_GUIDE.md) - Process management
- [DEPRECATED.md](./DEPRECATED.md) - Deprecated files and features

### API Documentation

- [BACKEND_API_STATUS.md](./BACKEND_API_STATUS.md) - API status report
- [MAIN_SERVICES_CATALOG.md](./MAIN_SERVICES_CATALOG.md) - Services catalog

---

## Contact

**Project:** GACP Certification Flow Platform
**Version:** 2.0.0
**Team:** GACP Platform Team
**Repository:** https://github.com/jonmaxmore/gacp-certify-flow-main

---

**Last Updated:** October 26, 2025 by Claude Code
