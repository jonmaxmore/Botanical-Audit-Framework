# 📋 Naming Standardization Plan

**Date:** October 20, 2025  
**Status:** Phase 4 - Cleanup & Standardization

---

## 🎯 Objective

Standardize file naming conventions across the GACP platform to improve:

- **Developer Experience:** Clear, predictable naming patterns
- **Code Maintainability:** Easy to locate and understand files
- **Team Collaboration:** Consistent conventions across the codebase

---

## 📐 Naming Standards

### 1. **Modules & Folders**

- **Convention:** `kebab-case`
- **Pattern:** `module-name/`
- **Examples:**
  - ✅ `farm-management/`
  - ✅ `track-trace/`
  - ✅ `standards-comparison/`
  - ❌ `FarmManagement/`
  - ❌ `trackTrace/`

### 2. **Service Files**

- **Convention:** `camelCase.service.js`
- **Pattern:** `serviceName.service.js`
- **Examples:**
  - ✅ `farmManagement.service.js`
  - ✅ `gacpInspection.service.js`
  - ✅ `payment.service.js`
  - ❌ `FarmManagementService.js`
  - ❌ `GACP_Inspection_Service.js`

### 3. **Controller Files**

- **Convention:** `camelCase.controller.js`
- **Pattern:** `controllerName.controller.js`
- **Examples:**
  - ✅ `application.controller.js`
  - ✅ `certificate.controller.js`
  - ❌ `ApplicationController.js`

### 4. **Route Files**

- **Convention:** `kebab-case.js` or `kebab-case.routes.js`
- **Pattern:** `route-name.routes.js`
- **Examples:**
  - ✅ `farm-management.routes.js`
  - ✅ `applications.js`
  - ❌ `FarmManagement.routes.js`

### 5. **Model Files**

- **Convention:** `PascalCase.js` (matches class name)
- **Pattern:** `ModelName.js`
- **Examples:**
  - ✅ `Application.js` (class Application)
  - ✅ `Certificate.js` (class Certificate)
  - ✅ `FarmProfile.js` (class FarmProfile)

### 6. **Utility/Helper Files**

- **Convention:** `camelCase.utils.js` or `camelCase.helpers.js`
- **Pattern:** `utilityName.utils.js`
- **Examples:**
  - ✅ `dateTime.utils.js`
  - ✅ `validation.helpers.js`

### 7. **Classes Inside Files**

- **Convention:** `PascalCase`
- **Pattern:** `class ClassName`
- **Examples:**
  - ✅ `class FarmManagementService`
  - ✅ `class PaymentService`
  - ❌ `class farmManagementService`

### 8. **Functions & Variables**

- **Convention:** `camelCase`
- **Pattern:** `functionName()`, `variableName`
- **Examples:**
  - ✅ `const farmManagementService = new FarmManagementService();`
  - ✅ `async function processPayment() {}`
  - ❌ `const FarmManagementService = ...`
  - ❌ `function ProcessPayment() {}`

---

## 🚨 Current Issues Found

### **Duplicate Files (High Priority - Delete)**

1. ✅ **Workflow Engines** (COMPLETED - Priority 1)
   - Removed: `GACPWorkflowEngine.js`, `ApplicationWorkflowEngine.js`
   - Kept: `gacp-workflow-engine.js`

2. ✅ **Survey Systems** (COMPLETED - Priority 2)
   - Removed: `SurveyProcessEngine.js`, `SurveyProcessEngine-4Regions.js`
   - Kept: `modules/survey-system/`

3. ✅ **Farm Management** (COMPLETED - Priority 3.1)
   - Removed: `FarmManagementProcessEngine.js`, `enhancedFarmManagementService.js`
   - Kept: `modules/farm-management/`

4. ✅ **Track & Trace** (COMPLETED - Priority 3.2)
   - Removed: `TrackTraceEngine.js`
   - Kept: `modules/track-trace/`

5. ✅ **Standards** (COMPLETED - Priority 3.3)
   - Removed: `StandardsEngine.js`
   - Kept: `modules/standards-comparison/`

6. **Application Service** (NEW - Found duplicate)
   - Files: `GACPApplicationService.js` (670 lines) vs `gacp-application-service.js` (456 lines)
   - Status: `GACPApplicationService.js` is used in `server.js` and `routes/applications.js`
   - Action: Delete `gacp-application-service.js` (unused)

7. **Health Monitoring** (NEW - Found triple duplication)
   - Files: `HealthMonitoringService.js`, `healthMonitor.js`, `healthCheck.js`, `health-check-service.js`
   - Action: Audit and consolidate into one service

8. **Notification Service** (NEW - Found duplicate)
   - Files: `NotificationService.js`, `enhancedNotificationService.js`
   - Status: Check which one is actively used
   - Action: Keep one, delete other

---

## 📦 Files Requiring Name Changes

### **Services Directory** (`apps/backend/services/`)

| Current Name                       | Should Be                           | Used In | Priority |
| ---------------------------------- | ----------------------------------- | ------- | -------- |
| `AuditService.js`                  | `audit.service.js`                  | TBD     | Medium   |
| `CertificateService.js`            | `certificate.service.js`            | TBD     | Medium   |
| `ComplianceAuditService.js`        | `complianceAudit.service.js`        | TBD     | Low      |
| `ComplianceSeeder.js`              | `compliance.seeder.js`              | TBD     | Low      |
| `DatabaseHealthMonitor.js`         | `databaseHealth.monitor.js`         | TBD     | Low      |
| `EventBusService.js`               | `eventBus.service.js`               | TBD     | Medium   |
| `GACPCertificateService.js`        | `gacpCertificate.service.js`        | TBD     | High     |
| `GACPEnhancedInspectionService.js` | `gacpEnhancedInspection.service.js` | TBD     | High     |
| `GACPInspectionService.js`         | `gacpInspection.service.js`         | TBD     | High     |
| `JobAssignmentService.js`          | `jobAssignment.service.js`          | TBD     | Low      |
| `KPIService.js`                    | `kpi.service.js`                    | TBD     | Low      |
| `MockDatabaseService.js`           | `mockDatabase.service.js`           | TBD     | Low      |
| `PaymentService.js`                | `payment.service.js`                | TBD     | High     |
| `SecurityComplianceService.js`     | `securityCompliance.service.js`     | TBD     | Low      |
| `TransactionManager.js`            | `transaction.manager.js`            | TBD     | Medium   |

---

## 🎯 Phase 4 Action Plan

### **Step 1: Remove Duplicate Files** ⏳ (15 minutes)

- [x] Remove workflow engine duplicates (Priority 1)
- [x] Remove survey system duplicates (Priority 2)
- [x] Remove farm management duplicates (Priority 3.1)
- [x] Remove track & trace duplicates (Priority 3.2)
- [x] Remove standards duplicates (Priority 3.3)
- [ ] Remove `gacp-application-service.js` (unused duplicate)
- [ ] Consolidate health monitoring services
- [ ] Consolidate notification services

### **Step 2: Document Current State** ⏳ (10 minutes)

- [ ] List all services with their import usage
- [ ] Identify breaking change risk level
- [ ] Create migration checklist

### **Step 3: Create Naming Guide** ⏳ (15 minutes)

- [x] Document naming conventions
- [ ] Create code examples
- [ ] Add to developer onboarding docs

### **Step 4: Gradual Refactoring** (Future - Not Now)

- [ ] Rename low-risk files first
- [ ] Update all imports
- [ ] Run comprehensive tests
- [ ] Commit with clear migration notes

---

## ✅ Completed Work

### **Lines of Code Removed:**

- Priority 1 (Workflow): ~1,066 lines
- Priority 2 (Survey): ~1,400 lines
- Priority 3.1 (Farm): ~800 lines
- Priority 3.2 (Track): ~400 lines
- Priority 3.3 (Standards): ~550 lines
- **Total: ~4,216 lines removed!** 🎉

### **Files Deleted:**

1. `GACPWorkflowEngine.js`
2. `ApplicationWorkflowEngine.js`
3. `SurveyProcessEngine.js`
4. `SurveyProcessEngine-4Regions.js`
5. `FarmManagementProcessEngine.js`
6. `enhancedFarmManagementService.js`
7. `TrackTraceEngine.js`
8. `StandardsEngine.js`

---

## 🎓 Developer Guidelines

### **When Creating New Files:**

1. **Always use kebab-case for folders:**

   ```
   apps/backend/modules/user-authentication/
   ```

2. **Use descriptive service names with .service.js extension:**

   ```javascript
   // ✅ Good
   userAuthentication.service.js;

   // ❌ Bad
   UserAuthenticationService.js;
   user_auth_svc.js;
   ```

3. **Class names should be PascalCase:**

   ```javascript
   // ✅ Good
   class UserAuthenticationService {
     constructor() { ... }
   }

   // ❌ Bad
   class userAuthenticationService { ... }
   ```

4. **Instance variables should be camelCase:**

   ```javascript
   // ✅ Good
   const userAuthService = new UserAuthenticationService();

   // ❌ Bad
   const UserAuthService = new UserAuthenticationService();
   ```

5. **Use consistent patterns:**
   - Services: `*.service.js`
   - Controllers: `*.controller.js`
   - Routes: `*.routes.js`
   - Utils: `*.utils.js`
   - Helpers: `*.helpers.js`

---

## 📊 Summary Statistics

| Category               | Before Cleanup   | After Cleanup | Reduction |
| ---------------------- | ---------------- | ------------- | --------- |
| Duplicate Engines      | 8 files          | 0 files       | 100%      |
| Lines of Code          | ~4,216 duplicate | 0 duplicate   | 100%      |
| Naming Inconsistencies | ~30 files        | TBD           | TBD       |

---

## 🚀 Next Steps

1. **Immediate (Priority 4):**
   - Remove remaining duplicate files
   - Document current naming state
   - Create developer guidelines

2. **Near Future (Priority 5):**
   - Build unified membership system
   - Implement authentication consolidation

3. **Long Term:**
   - Gradually rename files to match standards
   - Add automated linting for naming conventions
   - Create pre-commit hooks for validation

---

**Last Updated:** October 20, 2025  
**Maintained By:** GACP Development Team
