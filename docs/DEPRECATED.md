# Deprecated Files and Features

**Last Updated:** January 2025 (Code Deduplication Audit)
**Platform Version:** 2.0.0

---

## Purpose

This document tracks all deprecated files, directories, features, and APIs in the GACP Platform. It helps developers avoid using outdated code and provides migration paths to current implementations.

---

## 🗑️ Archived Directories

### 1. Legacy Backend Directory

**Path:** `backend.archived.2025-10-26/backend/`

**Original Path:** `backend/` (root level)

**Archived Date:** October 26, 2025

**Reason:** Replaced by `apps/backend/` with Clean Architecture

**Size:** 121 MB (including node_modules)

**Contents:**

- Legacy backend code structure
- Old service implementations
- Duplicate authentication system
- Standards comparison module
- Survey system module

**Migration:** All functionality migrated to `apps/backend/modules/`

**Status:** ❌ DO NOT USE

**Safe to Delete:** Yes (after verifying no external references)

---

### 2. Root-Level Unused Files

**Path:** `backend.archived.2025-10-26/root-unused-files/`

**Archived Date:** October 26, 2025

**Files Archived:**

#### `app.js` (55 KB, 1,705 lines)

- **Original Purpose:** Main application entry point
- **Replaced By:** `apps/backend/atlas-server.js`
- **Reason:** Superseded by modular atlas-server with better structure
- **Last Modified:** October 21, 2025

#### `robust-server.js` (4.3 KB)

- **Original Purpose:** Robust server with error handling
- **Replaced By:** `apps/backend/atlas-server.js` (includes robustness)
- **Reason:** Functionality merged into main server
- **Last Modified:** October 21, 2025

#### `.prettierrc.json` (172 bytes)

- **Original Purpose:** Prettier configuration (basic)
- **Replaced By:** `.prettierrc` (864 bytes, more complete)
- **Reason:** Consolidated to single, comprehensive config
- **Settings:** printWidth: 80 (too narrow)

#### `.prettierrc.js` (450 bytes)

- **Original Purpose:** Prettier configuration (with overrides)
- **Replaced By:** `.prettierrc` (864 bytes, most complete)
- **Reason:** Consolidated to single, comprehensive config
- **Settings:** printWidth: 100, basic overrides

**Migration:** Use `.prettierrc` for all formatting

**Status:** ❌ DO NOT USE

---

## 📂 Deprecated Files (In Active Codebase)

### Legacy Routes (Being Migrated)

**Path:** `apps/backend/routes/`

**Status:** 🟡 LEGACY - Still active but being replaced

**Files:**

| File                         | Status     | Replacement                                      | Migration Priority |
| ---------------------------- | ---------- | ------------------------------------------------ | ------------------ |
| `routes/auth.js`             | 🔄 Migrate | `modules/auth-farmer/` + `modules/auth-dtam/`    | HIGH               |
| `routes/applications.js`     | 🔄 Migrate | `modules/application/`                           | HIGH               |
| `routes/farm-management.js`  | 🔄 Migrate | `modules/farm-management/`                       | MEDIUM             |
| `routes/cannabis-surveys.js` | 🔄 Migrate | `modules/cannabis-survey/`                       | MEDIUM             |
| `routes/compliance.js`       | 🔄 Migrate | `modules/application-workflow/`                  | MEDIUM             |
| `routes/dashboard.js`        | 🔄 Migrate | `modules/notification/` + `modules/application/` | LOW                |

**Migration Guide:**

1. Review route handler logic
2. Extract business logic to domain services
3. Move to appropriate module's `presentation/routes/`
4. Update API client to use new endpoints
5. Test thoroughly
6. Deprecate old route
7. Remove after 1-2 releases

---

### Legacy Models (Centralized)

**Path:** `apps/backend/models/`

**Status:** 🟡 ACTIVE - But should be moved to module infrastructure

**Issue:** Models are centralized instead of being in module's `infrastructure/models/`

**Affected Files:**

| Model            | Current Location | Should Be In                                                                              | Priority |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------- | -------- |
| `Application.js` | `models/`        | `modules/application/infrastructure/models/`                                              | HIGH     |
| `Farm.js`        | `models/`        | `modules/farm-management/infrastructure/models/`                                          | MEDIUM   |
| `User.js`        | `models/`        | `modules/auth-farmer/infrastructure/models/` + `modules/auth-dtam/infrastructure/models/` | HIGH     |
| `Certificate.js` | `models/`        | `modules/certificate/infrastructure/models/`                                              | MEDIUM   |
| `Survey.js`      | `models/`        | `modules/cannabis-survey/infrastructure/models/`                                          | MEDIUM   |
| `Payment.js`     | `models/`        | `modules/payment/infrastructure/models/`                                                  | LOW      |

**Note:** Some modules already have duplicate models in their infrastructure layer. Need to consolidate.

---

### Duplicate Validators

**Status:** 🔴 CRITICAL - Multiple validators doing same job

**Issue:** Validators scattered across:

- `apps/backend/middleware/validation.js`
- `apps/backend/shared/validation.js`
- `apps/backend/modules/*/validators/`
- `apps/backend/modules/*/presentation/validators/`

**Duplicates Found:**

| Validator              | Locations                                                           | Should Be                                    |
| ---------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| Auth validators        | `auth-validators.js`, `auth.validator.js` (2 files in same module!) | `shared/validators/auth.validator.js`        |
| Farm validators        | `farm-management.validators.js`, `farm.validator.js`                | `shared/validators/farm.validator.js`        |
| Survey validators      | `survey.validators.js`, `survey.validator.js`                       | `shared/validators/survey.validator.js`      |
| Application validators | Multiple files                                                      | `shared/validators/application.validator.js` |

**Target Structure:**

```
apps/backend/shared/validators/
├── auth.validator.js        # All auth validation
├── application.validator.js # All application validation
├── farm.validator.js        # All farm validation
├── survey.validator.js      # All survey validation
└── index.js                 # Export all validators
```

**Migration:** Phase 2 of cleanup (Week 2-3)

---

## 📦 Business Logic Files (Transition State)

**Path:** `business-logic/` (root level)

**Status:** 🟡 ACTIVE - But should be in modules

**Migration Target:** `apps/backend/modules/{module}/domain/services/`

### Currently Used Files

#### `gacp-workflow-engine.js` (1,040 lines)

- **Status:** ✅ ACTIVE (Imported by 3 files)
- **Used By:**
  - `apps/backend/atlas-server.js:39`
  - `apps/backend/routes/gacp-business-logic.js:27`
  - `apps/backend/services/gacp-enhanced-inspection.js:24`
- **Should Move To:** `modules/application-workflow/domain/services/WorkflowEngine.js`
- **Priority:** HIGH
- **Complexity:** High (split into smaller services)

### Prepared But Not Yet Used

#### `gacp-ai-assistant-system.js` (1,481 lines)

- **Status:** 🔄 PREPARED (Not yet integrated)
- **Purpose:** AI-powered assistant for farmers and staff
- **Should Move To:** `modules/ai-assistant/domain/services/`
- **Priority:** LOW (not critical for v2.0)

#### `gacp-standards-comparison-system.js` (1,451 lines)

- **Status:** 🔄 PREPARED (Module exists in archived backend)
- **Purpose:** Compare farm practices with GACP standards
- **Should Move To:** `modules/standards-comparison/domain/services/`
- **Priority:** MEDIUM

#### `gacp-visual-remote-support-system.js` (1,234 lines)

- **Status:** 🔄 PREPARED (Not yet integrated)
- **Purpose:** Video call support for inspections
- **Should Move To:** `modules/inspection/domain/services/`
- **Priority:** MEDIUM

#### `gacp-survey-system.js` (1,137 lines)

- **Status:** 🔄 PREPARED (Partially used by cannabis-survey module)
- **Purpose:** Survey template and response management
- **Should Move To:** `modules/cannabis-survey/domain/services/`
- **Priority:** HIGH

#### Other Business Logic Files:

- `gacp-certificate-generator.js` → `modules/certificate/domain/services/`
- `gacp-document-review-system.js` → `modules/document/domain/services/`
- `gacp-field-inspection-system.js` → `modules/inspection/domain/services/`
- `gacp-dashboard-notification-system.js` → `modules/notification/domain/services/`
- `gacp-business-rules-engine.js` → `modules/application/domain/services/`
- `gacp-status-manager.js` → `modules/application-workflow/domain/services/`
- `gacp-digital-logbook-system.js` → `modules/farm-management/domain/services/`
- `gacp-sop-wizard-system.js` → `modules/farm-management/domain/services/`
- `system-integration-hub.js` → `shared/services/`

**Total:** 14 files, ~15,000 lines of code

**Migration Priority:** Phase 3 (Week 4+)

---

## 🔧 Deprecated Configuration Files

### Environment Files

**Deprecated:**

- `.env.sprint1` - Only for Sprint 1 development
- `.env.cloud-example` - Redundant with `.env.production.template`

**Current:**

- `.env.example` - For frontend development
- `.env.production.template` - For backend production (8.4 KB, comprehensive)

**Action:** Keep only example and production.template

---

### Prettier Configuration

**Deprecated:**

- ✅ `.prettierrc.json` (archived) - Basic config, printWidth: 80
- ✅ `.prettierrc.js` (archived) - Intermediate config

**Current:**

- `.prettierrc` - Complete config with markdown support, printWidth: 100

**Action:** ✅ Completed (archived on Oct 26, 2025)

---

### ESLint Configuration

**Status:** ⚠️ Multiple configs but all in use

**Files:**

- `.eslintrc.json` (root) - For monorepo-level linting
- `apps/backend/.eslintrc.js` - Backend-specific rules

**Action:** Keep both (different scopes)

---

## 📡 Deprecated API Endpoints

### Authentication Endpoints (Legacy)

**Path:** `/api/auth/*` (from `routes/auth.js`)

**Status:** 🟡 DEPRECATED - Use new endpoints

**Deprecated Endpoints:**

| Old Endpoint                 | New Endpoint                     | Module      |
| ---------------------------- | -------------------------------- | ----------- |
| `POST /api/auth/register`    | `POST /api/auth/farmer/register` | auth-farmer |
| `POST /api/auth/login`       | `POST /api/auth/farmer/login`    | auth-farmer |
| `POST /api/auth/admin/login` | `POST /api/auth/dtam/login`      | auth-dtam   |
| `GET /api/auth/profile`      | `GET /api/auth/farmer/profile`   | auth-farmer |

**Migration Deadline:** v2.1.0 (Q1 2026)

**Breaking Change:** Yes (different response format)

---

### Application Endpoints (Legacy)

**Path:** `/api/applications/*` (from `routes/applications.js`)

**Status:** 🟡 ACTIVE - But prefer module endpoints

**Prefer:**

- `/api/v2/applications/*` (from `modules/application/`)

**Difference:**

- Legacy returns flat objects
- New returns structured objects with metadata

---

## 🎯 Migration Roadmap

### Phase 1: Cleanup (✅ COMPLETED - Oct 26, 2025)

- ✅ Archive legacy `backend/` directory
- ✅ Archive unused entry points (app.js, robust-server.js)
- ✅ Consolidate prettier config
- ✅ Create ARCHITECTURE.md
- ✅ Create DEPRECATED.md
- ✅ Update .gitignore

### Phase 2: Consolidation (🔄 In Progress)

- 🔄 Consolidate validators to `shared/validators/`
- 🔄 Consolidate logger implementations
- 🔄 Consolidate models (decide: centralized vs in modules)
- 🔄 Set up path aliases (@shared, @models, @modules)

### Phase 3: Refactoring (⏳ Planned)

- ⏳ Refactor files >1,000 lines
- ⏳ Move business logic from `business-logic/` to modules
- ⏳ Migrate legacy routes to modules
- ⏳ Split workflow-engine.js into smaller services

### Phase 4: Feature Completion (⏳ Planned)

- ⏳ Complete TODO items (email, notifications, analytics)
- ⏳ Deprecate old API endpoints
- ⏳ Remove archived directories (after 6 months)

---

## 📋 Developer Guidelines

### Before Using Any File

1. **Check this document** - Is it deprecated?
2. **Check ARCHITECTURE.md** - What's the recommended approach?
3. **Search for duplicates** - Are there multiple versions?
4. **Ask team** - When in doubt, ask!

### When Deprecating Code

1. **Update this document** with:
   - File/feature being deprecated
   - Replacement/migration path
   - Timeline and priority
2. **Add deprecation notice** in code:
   ```javascript
   /**
    * @deprecated Since v2.0.0. Use modules/auth-farmer/ instead.
    * Will be removed in v2.2.0.
    */
   ```
3. **Log warnings** when deprecated code is used
4. **Update documentation** (README, API docs)
5. **Notify team** in pull request

### When Removing Deprecated Code

**Safety Checklist:**

- [ ] Deprecated for at least 2 releases (or 3 months)
- [ ] No references in active codebase (grep/search)
- [ ] Migration guide provided
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Changelog entry added
- [ ] Team notified

---

## 🔍 How to Find Deprecated Code

### Search for Deprecated Functions

```bash
# Search for @deprecated tags
grep -r "@deprecated" apps/backend/

# Search for references to archived files
grep -r "backend/" apps/backend/
grep -r "business-logic/" apps/backend/
```

### Check Imports

```bash
# Find imports from deprecated locations
grep -r "require('.*business-logic/" apps/backend/
grep -r "require('../../../../" apps/backend/  # Deep relative imports
```

### Validate No Archived References

```bash
# Should return empty (no references to archived code)
grep -r "backend.archived" apps/
```

---

## 📞 Questions?

If you're unsure whether code is deprecated:

1. **Check this document first**
2. **Check ARCHITECTURE.md** for current patterns
3. **Search the codebase** for usage examples
4. **Ask in team chat** or create an issue

**Remember:** When in doubt, use the module structure in `apps/backend/modules/` with Clean Architecture.

---

**Document Maintained By:** GACP Platform Team
**Review Frequency:** Monthly
**Last Review:** January 2025 (Code Deduplication Audit)

---

## Changelog

### January 2025 - Code Deduplication Cleanup

- ✅ **Deleted:** `modules/shared/utils/date.js` (100% duplicate of `shared/utilities.js`)
- ✅ **Deleted:** `src/middleware/validation.js` (stub only, no real implementation)
- ✅ **Deleted:** `modules/shared/utils/validation.js` (merged into `shared/validation.js`)
- ✅ **Deleted:** `src/controllers/applicationController.js` (stub returning 501 errors)
- ✅ **Enhanced:** `shared/validation.js` - consolidated validation functions from multiple files
- 📝 **Clarified:** `modules/shared/` is NOT duplicate - it's a re-export layer (architecture pattern)
- 📝 **Documented:** Application routes need consolidation (deferred to Phase 2)
- 🔍 **Audit:** Completed comprehensive code deduplication audit (see CODE_DEDUPLICATION_AUDIT.md)

**Files Deleted (4 total):**
1. `apps/backend/modules/shared/utils/date.js` - Duplicate date utilities
2. `apps/backend/modules/shared/utils/validation.js` - Duplicate validation
3. `apps/backend/src/middleware/validation.js` - Stub middleware
4. `apps/backend/src/controllers/applicationController.js` - Stub controller

**Files Enhanced (1 total):**
1. `apps/backend/shared/validation.js` - Consolidated validation utilities

**Impact:** Removed 100% duplicate code, established single source of truth for utilities

### October 26, 2025

- ✅ Archived `backend/` directory → `backend.archived.2025-10-26/`
- ✅ Archived `app.js`, `robust-server.js`
- ✅ Consolidated prettier configs
- 📝 Created this DEPRECATED.md document
- 📝 Created ARCHITECTURE.md document

### October 21, 2025

- 🗑️ Marked `backend/` as legacy
- 🔄 Started migration to Clean Architecture

---

**Next Review:** February 2025
