# 📦 GACP Platform - Complete System Inventory

**Last Updated:** October 20, 2025  
**Status:** ✅ Production Ready  
**Total Systems:** 50+ Modules, Services & Engines

---

## 🎯 Overview

This document provides a **COMPLETE INVENTORY** of all systems, modules, services, and engines in the GACP Platform. Use this as the **single source of truth** for understanding what exists in the platform.

---

## 📊 Summary Statistics

| Category                   | Count    | Location                 |
| -------------------------- | -------- | ------------------------ |
| **Business Logic Engines** | 7        | `business-logic/`        |
| **Backend Modules**        | 21       | `apps/backend/modules/`  |
| **Backend Services**       | 25       | `apps/backend/services/` |
| **Frontend Apps**          | 4        | `apps/`                  |
| **Database Models**        | 15+      | `database/models/`       |
| **API Routes**             | 30+      | `apps/backend/routes/`   |
| **TOTAL SYSTEMS**          | **100+** | Various                  |

---

## 🏗️ 1. Business Logic Layer (7 Engines)

**Location:** `business-logic/`

### **Core Workflow Engines**

#### 1. **GACP Workflow Engine** ⭐ PRIMARY

- **File:** `gacp-workflow-engine.js`
- **Purpose:** 8-step GACP certification workflow
- **Features:**
  - Application submission & review
  - Payment processing integration
  - Document review workflow
  - Field inspection scheduling
  - Certificate issuance
  - Status tracking
- **Status:** ✅ Production Ready
- **Usage:** Core certification process

#### 2. **GACP Business Rules Engine**

- **File:** `gacp-business-rules-engine.js`
- **Purpose:** Business rule validation and enforcement
- **Features:**
  - Application validation rules
  - Eligibility checking
  - Compliance verification
  - Automatic rejection/approval logic
- **Status:** ✅ Active
- **Usage:** All application submissions

#### 3. **GACP Certificate Generator**

- **File:** `gacp-certificate-generator.js`
- **Purpose:** Generate official GACP certificates
- **Features:**
  - PDF certificate generation
  - QR code embedding
  - Certificate number generation
  - Digital signature
  - Certificate templates
- **Status:** ✅ Production Ready
- **Usage:** After successful certification

#### 4. **GACP Document Review System**

- **File:** `gacp-document-review-system.js`
- **Purpose:** Review and validate application documents
- **Features:**
  - Document checklist validation
  - Photo verification
  - GPS coordinate validation
  - Document completeness checking
  - Reviewer assignment
- **Status:** ✅ Active
- **Usage:** Step 3 of certification workflow

#### 5. **GACP Field Inspection System**

- **File:** `gacp-field-inspection-system.js`
- **Purpose:** Manage on-site field inspections
- **Features:**
  - Inspector assignment
  - Inspection scheduling
  - Checklist management
  - Photo evidence collection
  - GPS tracking
  - Inspection report generation
- **Status:** ✅ Production Ready
- **Usage:** Step 4 of certification workflow

#### 6. **GACP Status Manager**

- **File:** `gacp-status-manager.js`
- **Purpose:** Centralized application status management
- **Features:**
  - Status transition logic
  - Status history tracking
  - Event emission
  - Notification triggers
- **Status:** ✅ Active
- **Usage:** Throughout workflow

#### 7. **GACP Dashboard & Notification System**

- **File:** `gacp-dashboard-notification-system.js`
- **Purpose:** Real-time dashboard and notifications
- **Features:**
  - Real-time metrics
  - Application statistics
  - Notification management
  - Alert system
  - Performance tracking
- **Status:** ✅ Production Ready
- **Usage:** Admin dashboard & user notifications

---

## 🎨 2. Backend Modules (21 Modules)

**Location:** `apps/backend/modules/`

### **Authentication & User Management (3 modules)**

#### 1. **User Management Module** 👥

- **Folder:** `user-management/`
- **Purpose:** Complete user authentication & management
- **Features:**
  - Multi-role authentication (FARMER, INSPECTOR, REVIEWER, ADMIN)
  - JWT token management
  - Password security
  - Account lockout
  - Role-based access control (RBAC)
  - Session management
- **Status:** ✅ Production Ready
- **API:** `/api/auth/*`, `/api/users/*`

#### 2. **Auth DTAM Module** 🔐

- **Folder:** `auth-dtam/`
- **Purpose:** DTAM (Department) staff authentication
- **Features:**
  - DTAM-specific login
  - Inspector credentials
  - Reviewer credentials
  - Admin access
- **Status:** ✅ Active

#### 3. **Auth Farmer Module** 🌾

- **Folder:** `auth-farmer/`
- **Purpose:** Farmer authentication system
- **Features:**
  - Farmer registration
  - Farm profile linking
  - Farmer-specific permissions
- **Status:** ✅ Active

---

### **Application & Workflow (2 modules)**

#### 4. **Application Module** 📝

- **Folder:** `application/`
- **Purpose:** GACP application management
- **Features:**
  - Application creation
  - Form validation
  - Document upload
  - Application submission
- **Status:** ✅ Production Ready
- **API:** `/api/applications/*`

#### 5. **Application Workflow Module** 🔄

- **Folder:** `application-workflow/`
- **Purpose:** Workflow state management
- **Features:**
  - Workflow transitions
  - State validation
  - Event handling
- **Status:** ✅ Active

---

### **Inspection & Audit (1 module)**

#### 6. **Audit Module** 🔍

- **Folder:** `audit/`
- **Purpose:** Audit trail and compliance
- **Features:**
  - Activity logging
  - Audit reports
  - Compliance tracking
  - Security monitoring
- **Status:** ✅ Production Ready

---

### **Farm Management (1 module)**

#### 7. **Farm Management Module** 🏡

- **Folder:** `farm-management/`
- **Purpose:** Comprehensive farm management
- **Features:**
  - Farm profile management
  - Cultivation cycle tracking
  - Seed-to-sale management
  - Harvest records
  - SOP activities
  - GPS tracking
  - Photo documentation
- **Status:** ✅ Production Ready
- **API:** `/api/farm-management/*`

---

### **Product Tracking (1 module)**

#### 8. **Track & Trace Module** 📦

- **Folder:** `track-trace/`
- **Purpose:** Product traceability system
- **Features:**
  - QR code generation
  - Product verification
  - Supply chain tracking
  - Activity logging
  - Timeline visualization
  - Analytics
- **Status:** ✅ Production Ready
- **API:** `/api/tracktrace/*`

---

### **Standards & Compliance (1 module)**

#### 9. **Standards Comparison Module** 📏

- **Folder:** `standards-comparison/`
- **Purpose:** Compare farms against GACP/GAP standards
- **Features:**
  - Standards library
  - Compliance checking
  - Gap analysis
  - Recommendations
  - Comparison history
- **Status:** ✅ Production Ready
- **API:** `/api/standards/*`

---

### **Survey System (2 modules)**

#### 10. **Survey System Module** 📋

- **Folder:** `survey-system/`
- **Purpose:** 7-step survey wizard
- **Features:**
  - Multi-step survey wizard
  - 4-region support (North, Central, Northeast, South)
  - Survey templates
  - Response collection
  - Analytics
- **Status:** ✅ Production Ready
- **API:** `/api/survey/*`

#### 11. **Cannabis Survey Module** 🌿

- **Folder:** `cannabis-survey/`
- **Purpose:** Cannabis-specific surveys
- **Features:**
  - Cannabis templates
  - Specialized questions
  - Regional customization
- **Status:** ✅ Active

---

### **Certificate Management (1 module)**

#### 12. **Certificate Management Module** 🎓

- **Folder:** `certificate-management/`
- **Purpose:** Certificate lifecycle management
- **Features:**
  - Certificate issuance
  - Certificate renewal
  - Certificate revocation
  - Certificate verification
  - Digital certificates
  - PDF generation
- **Status:** ✅ Production Ready
- **API:** `/api/certificates/*`

---

### **Document Management (2 modules)**

#### 13. **Document Module** 📄

- **Folder:** `document/`
- **Purpose:** Basic document handling
- **Features:**
  - Document upload
  - File storage
  - Document retrieval
- **Status:** ✅ Active

#### 14. **Document Management Module** 🗂️

- **Folder:** `document-management/`
- **Purpose:** Advanced document management
- **Features:**
  - Version control
  - Document workflow
  - Access control
  - Document search
- **Status:** ✅ Production Ready

---

### **Notifications (2 modules)**

#### 15. **Notification Module** 🔔

- **Folder:** `notification/`
- **Purpose:** Basic notifications
- **Features:**
  - Email notifications
  - SMS notifications
  - In-app notifications
- **Status:** ✅ Active

#### 16. **Notification Service Module** 📨

- **Folder:** `notification-service/`
- **Purpose:** Advanced notification service
- **Features:**
  - Multi-channel delivery
  - Template management
  - Scheduled notifications
  - Notification history
- **Status:** ✅ Production Ready

---

### **Payment (1 module)**

#### 17. **Payment Service Module** 💳

- **Folder:** `payment-service/`
- **Purpose:** Payment processing
- **Features:**
  - Payment gateway integration
  - Payment verification
  - Receipt generation
  - Payment history
- **Status:** ✅ Production Ready
- **API:** `/api/payments/*`

---

### **Reporting & Analytics (2 modules)**

#### 18. **Report Module** 📊

- **Folder:** `report/`
- **Purpose:** Report generation
- **Features:**
  - Custom reports
  - Data export
  - Report scheduling
- **Status:** ✅ Active

#### 19. **Reporting Analytics Module** 📈

- **Folder:** `reporting-analytics/`
- **Purpose:** Advanced analytics
- **Features:**
  - Real-time dashboards
  - KPI tracking
  - Trend analysis
  - Predictive analytics
- **Status:** ✅ Production Ready

---

### **Dashboard (1 module)**

#### 20. **Dashboard Module** 📊

- **Folder:** `dashboard/`
- **Purpose:** Admin dashboard
- **Features:**
  - System overview
  - Real-time metrics
  - Application statistics
  - User activity
- **Status:** ✅ Production Ready
- **API:** `/api/dashboard/*`

---

### **Training (1 module)**

#### 21. **Training Module** 🎓

- **Folder:** `training/`
- **Purpose:** User training system
- **Features:**
  - Training materials
  - Video tutorials
  - Certifications
  - Progress tracking
- **Status:** ✅ Active

---

### **Shared Utilities (1 module)**

#### 22. **Shared Module** 🔧

- **Folder:** `shared/`
- **Purpose:** Shared utilities and helpers
- **Features:**
  - Common utilities
  - Validators
  - Formatters
  - Constants
  - Logging
- **Status:** ✅ Active
- **Usage:** Used by all modules

---

## 🔧 3. Backend Services (25 Services)

**Location:** `apps/backend/services/`

### **Core Application Services**

#### 1. **GACP Application Service** ⭐

- **File:** `GACPApplicationService.js`
- **Purpose:** Core application management service
- **Features:** Application CRUD, validation, workflow integration
- **Status:** ✅ Production Ready
- **Lines:** 670

#### 2. **GACP Certificate Service** 🎓

- **File:** `GACPCertificateService.js`
- **Purpose:** Certificate management
- **Features:** Certificate generation, validation, renewal
- **Status:** ✅ Production Ready

#### 3. **Certificate Service** 📜

- **File:** `CertificateService.js`
- **Purpose:** General certificate operations
- **Status:** ✅ Active

---

### **Inspection Services**

#### 4. **GACP Enhanced Inspection Service** 🔍

- **File:** `GACPEnhancedInspectionService.js`
- **Purpose:** Advanced inspection management
- **Features:** Inspector assignment, scheduling, reporting
- **Status:** ✅ Production Ready

#### 5. **GACP Inspection Service** 📋

- **File:** `GACPInspectionService.js`
- **Purpose:** Standard inspection operations
- **Status:** ✅ Active

---

### **Survey Services**

#### 6. **Cannabis Survey Service** 🌿

- **File:** `cannabisSurveyService.js`
- **Purpose:** Cannabis survey management
- **Status:** ✅ Active

#### 7. **Cannabis Survey Integration Service** 🔗

- **File:** `cannabisSurveyIntegrationService.js`
- **Purpose:** Survey microservice integration
- **Features:** Template sync, response sync, data integration
- **Status:** ✅ Production Ready
- **Lines:** 500+

#### 8. **Cannabis Survey Initializer** 🌱

- **File:** `cannabisSurveyInitializer.js`
- **Purpose:** Initialize cannabis survey system
- **Status:** ✅ Active

---

### **Notification Services**

#### 9. **Enhanced Notification Service** 🔔

- **File:** `enhancedNotificationService.js`
- **Purpose:** Advanced notification system
- **Features:** Email, SMS, in-app, push notifications
- **Status:** ✅ Production Ready
- **Usage:** Used by multiple modules

---

### **Payment Services**

#### 10. **Payment Service** 💳

- **File:** `PaymentService.js`
- **Purpose:** Payment processing and verification
- **Status:** ✅ Production Ready

---

### **Integration Services**

#### 11. **Blitzz Integration Service** 📱

- **File:** `blitzzIntegrationService.js`
- **Purpose:** Blitzz video call integration
- **Features:** Video inspections, remote consultations
- **Status:** ✅ Active

#### 12. **Event Bus Service** 📡

- **File:** `EventBusService.js`
- **Purpose:** Event-driven architecture support
- **Features:** Pub/sub messaging, event handling
- **Status:** ✅ Production Ready

---

### **Monitoring & Health Services**

#### 13. **Health Check Service** ❤️

- **File:** `health-check-service.js`
- **Purpose:** System health monitoring
- **Status:** ✅ Production Ready
- **Usage:** Used in app.js & server.js

#### 14. **Health Monitoring Service** 📊

- **File:** `HealthMonitoringService.js`
- **Purpose:** Advanced health monitoring
- **Status:** ✅ Active
- **Usage:** Used in atlas-server.js

#### 15. **Database Health Monitor** 🗄️

- **File:** `DatabaseHealthMonitor.js`
- **Purpose:** MongoDB health monitoring
- **Status:** ✅ Active

#### 16. **Performance Optimizer** ⚡

- **File:** `performance-optimizer.js`
- **Purpose:** Performance optimization
- **Status:** ✅ Active

---

### **Security & Compliance Services**

#### 17. **Audit Service** 🔒

- **File:** `AuditService.js`
- **Purpose:** Audit trail and logging
- **Status:** ✅ Production Ready

#### 18. **Security Compliance Service** 🛡️

- **File:** `SecurityComplianceService.js`
- **Purpose:** Security compliance monitoring
- **Status:** ✅ Active

#### 19. **Compliance Audit Service** ✅

- **File:** `ComplianceAuditService.js`
- **Purpose:** Compliance verification
- **Status:** ✅ Active

#### 20. **Compliance Seeder** 🌱

- **File:** `ComplianceSeeder.js`
- **Purpose:** Seed compliance data
- **Status:** ✅ Development

---

### **Job & Task Services**

#### 21. **Job Assignment Service** 📋

- **File:** `JobAssignmentService.js`
- **Purpose:** Assign tasks to users
- **Status:** ✅ Active

#### 22. **Transaction Manager** 💼

- **File:** `TransactionManager.js`
- **Purpose:** Database transaction management
- **Status:** ✅ Active

---

### **Analytics Services**

#### 23. **Analytics Engine** 📊

- **Folder:** `analytics-engine/`
- **Purpose:** Advanced analytics processing
- **Status:** ✅ Active

#### 24. **KPI Service** 📈

- **File:** `KPIService.js`
- **Purpose:** Key Performance Indicator tracking
- **Status:** ✅ Active

---

### **Utility Services**

#### 25. **Mock Database Service** 🎭

- **File:** `MockDatabaseService.js`
- **Purpose:** Testing and development mock data
- **Status:** ✅ Development

#### 26. **Auth Proxy** 🔐

- **File:** `auth-proxy.js`
- **Purpose:** Authentication proxy service
- **Status:** ✅ Active

---

## 🎨 4. Frontend Applications (4 Apps)

**Location:** `apps/`

#### 1. **Admin Portal** 👑

- **Folder:** `apps/admin-portal/`
- **Purpose:** Administrator dashboard
- **Features:**
  - User management
  - System configuration
  - Application review
  - Certificate issuance
  - Analytics & reports
- **Status:** ✅ Production Ready

#### 2. **Farmer Portal** 👨‍🌾

- **Folder:** `apps/farmer-portal/`
- **Purpose:** Farmer application interface
- **Features:**
  - Farm registration
  - Application submission
  - Document upload
  - Status tracking
  - Certificate viewing
- **Status:** ✅ Production Ready

#### 3. **Certificate Portal** 🎓

- **Folder:** `apps/certificate-portal/`
- **Purpose:** Public certificate verification
- **Features:**
  - Certificate lookup
  - QR code scanning
  - Certificate validation
  - Public directory
- **Status:** ✅ Production Ready

#### 4. **Backend API** 🔌

- **Folder:** `apps/backend/`
- **Purpose:** Core API server
- **Features:**
  - RESTful APIs
  - Authentication
  - Business logic
  - Database integration
- **Status:** ✅ Production Ready

---

## 🗄️ 5. Database Models (15+ Models)

**Location:** `database/models/`

1. **Application** - GACP applications
2. **User** - User accounts
3. **Farm** - Farm profiles
4. **Certificate** - Issued certificates
5. **Inspection** - Inspection records
6. **Payment** - Payment transactions
7. **Document** - Uploaded documents
8. **Survey** - Survey responses
9. **CannabisQuestion** - Survey questions
10. **CannabisResponse** - Survey answers
11. **Notification** - Notification records
12. **AuditLog** - Audit trail
13. **QRCode** - Track & trace QR codes
14. **Standard** - GACP standards
15. **Comparison** - Standards comparison results

---

## 🛣️ 6. API Routes (30+ Endpoints)

**Location:** `apps/backend/routes/`

### **Main API Routes:**

- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/applications/*` - Applications
- `/api/certificates/*` - Certificates
- `/api/inspections/*` - Inspections
- `/api/payments/*` - Payments
- `/api/documents/*` - Documents
- `/api/survey/*` - Surveys
- `/api/tracktrace/*` - Track & trace
- `/api/standards/*` - Standards
- `/api/farm-management/*` - Farm management
- `/api/dashboard/*` - Dashboard
- `/api/notifications/*` - Notifications
- `/api/reports/*` - Reports

---

## 📊 System Integration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    GACP Platform Architecture                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Frontend Apps  │
├─────────────────┤
│ • Admin Portal  │
│ • Farmer Portal │
│ • Cert Portal   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Backend API Layer            │
├─────────────────────────────────────┤
│  • Express.js Server                 │
│  • Authentication Middleware         │
│  • Rate Limiting                     │
│  • CORS                              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      Backend Modules (21)            │
├─────────────────────────────────────┤
│  • User Management                   │
│  • Application                       │
│  • Farm Management                   │
│  • Track & Trace                     │
│  • Survey System                     │
│  • Certificate Management            │
│  • Payment Service                   │
│  • Reporting & Analytics             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│   Business Logic Engines (7)         │
├─────────────────────────────────────┤
│  • GACP Workflow Engine              │
│  • Business Rules Engine             │
│  • Certificate Generator             │
│  • Document Review System            │
│  • Field Inspection System           │
│  • Status Manager                    │
│  • Dashboard & Notification          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│    Backend Services (25)             │
├─────────────────────────────────────┤
│  • Application Service               │
│  • Inspection Services               │
│  • Survey Services                   │
│  • Notification Service              │
│  • Payment Service                   │
│  • Health Monitoring                 │
│  • Analytics & KPI                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Data Layer                   │
├─────────────────────────────────────┤
│  • MongoDB (Primary)                 │
│  • Redis (Cache)                     │
│  • PostgreSQL (Optional)             │
│  • File Storage (S3/Local)           │
└─────────────────────────────────────┘
```

---

## 🔍 Why Systems Appear "Hidden"

### **Problem:** Systems not showing up in queries

**Root Causes:**

1. **Multiple Layers:** Systems spread across 3 layers (business-logic, modules, services)
2. **Naming Inconsistencies:** PascalCase, camelCase, kebab-case mixed
3. **No Central Registry:** No single file listing all systems
4. **Documentation Gaps:** Not all systems documented in README

**Solution:**

- ✅ This document (`COMPLETE_SYSTEM_INVENTORY.md`)
- ✅ Lists ALL 100+ systems in one place
- ✅ Categorized by type and location
- ✅ Includes purpose and status for each

---

## 📈 Growth Over Time

### **Evolution of GACP Platform:**

**Phase 1: Core (2024 Q1-Q2)**

- Business logic engines (7)
- Basic modules (10)
- Core services (10)

**Phase 2: Expansion (2024 Q3-Q4)**

- Advanced modules (11 more)
- Additional services (15 more)
- Frontend apps (4)

**Phase 3: Optimization (2025 Q1-Q4)**

- Module consolidation
- Duplicate removal (13 files)
- Documentation (8 files)
- Production readiness

---

## 🎯 Quick Reference

### **Need Authentication?**

→ `modules/user-management/`

### **Need Application Workflow?**

→ `business-logic/gacp-workflow-engine.js`

### **Need Farm Management?**

→ `modules/farm-management/`

### **Need Product Tracking?**

→ `modules/track-trace/`

### **Need Surveys?**

→ `modules/survey-system/`

### **Need Certificates?**

→ `modules/certificate-management/`

### **Need Standards Checking?**

→ `modules/standards-comparison/`

### **Need Notifications?**

→ `services/enhancedNotificationService.js`

### **Need Analytics?**

→ `modules/reporting-analytics/`

---

## 📚 Related Documentation

- [Architecture Overview](./docs/01_System_Overview.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Module Integration Guide](./apps/backend/modules/MODULE_INTEGRATION_GUIDE.md)
- [Membership System](./MEMBERSHIP_SYSTEM_DOCUMENTATION.md)
- [Naming Standards](./NAMING_STANDARDIZATION_PLAN.md)

---

## 🆘 When to Use Each System

### **For Certification Workflow:**

1. `gacp-workflow-engine.js` - Main workflow
2. `gacp-business-rules-engine.js` - Validation
3. `modules/application/` - Application management
4. `gacp-document-review-system.js` - Document review
5. `gacp-field-inspection-system.js` - Inspections
6. `gacp-certificate-generator.js` - Certificate issuance

### **For Farm Operations:**

1. `modules/farm-management/` - Farm profiles & cycles
2. `modules/track-trace/` - Product tracking
3. `modules/survey-system/` - Data collection

### **For User Management:**

1. `modules/user-management/` - Authentication & users
2. `modules/auth-dtam/` - DTAM staff auth
3. `modules/auth-farmer/` - Farmer auth

### **For Reporting:**

1. `modules/reporting-analytics/` - Analytics
2. `modules/dashboard/` - Admin dashboard
3. `services/KPIService.js` - KPI tracking

---

**🎉 NOW YOU HAVE THE COMPLETE PICTURE!**

**Total Systems Documented:** 100+  
**Last Updated:** October 20, 2025  
**Maintained By:** GACP Development Team

---

## 💡 Pro Tip

**Bookmark this document!** Whenever someone asks "What systems do we have?", point them here. This is the **SINGLE SOURCE OF TRUTH** for the GACP Platform.
