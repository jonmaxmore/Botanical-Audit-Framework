# QUICK CLEANUP CHECKLIST & FILE MANIFEST

**Status:** Ready for cleanup
**Last Updated:** October 26, 2025
**Estimated Time:** 3-4 days

---

## CRITICAL: DECISION POINTS (CHOOSE ONE FROM EACH PAIR)

### Decision 1: Notification System
```
OPTION A: Keep /apps/backend/modules/notification/ (simpler, farmer/dtam separated)
         - notification.farmer.routes.js
         - notification.dtam.routes.js
         - notification.routes.js
         
OPTION B: Keep /apps/backend/modules/notification-service/ (comprehensive, 676-line routes)
         - More complete implementation
         - Better structured
         
RECOMMENDATION: OPTION B (notification-service)
```

### Decision 2: Document System
```
OPTION A: Keep /apps/backend/modules/document/ (has farmer/dtam routes)
OPTION B: Keep /apps/backend/modules/document-management/ (cleaner structure)

RECOMMENDATION: OPTION B (document-management)
```

### Decision 3: Application System  
```
OPTION A: Keep /apps/backend/modules/application/ (1382 line service file!)
OPTION B: Keep /apps/backend/modules/application-workflow/ (more modular)

RECOMMENDATION: OPTION B (application-workflow)
```

### Decision 4: Report System
```
OPTION A: Keep /apps/backend/modules/report/ (has farmer/dtam routes)
OPTION B: Keep /apps/backend/modules/reporting-analytics/ (more analytical)

RECOMMENDATION: OPTION B (reporting-analytics)
```

---

## TIER 1: DELETE IMMEDIATELY (Safe - No Active Dependencies)

### Empty Model Files (11 files)
```bash
# These are 0 bytes - completely empty
rm /apps/backend/src/models/Application.js
rm /apps/backend/src/models/Certificate.js
rm /apps/backend/src/models/User.js
rm /apps/backend/src/models/Audit.js
rm /apps/backend/src/models/BaseModel.js
rm /apps/backend/src/models/Farmer.js
rm /apps/backend/src/models/Payment.js
rm /apps/backend/src/models/Survey.js
rm /apps/backend/src/models/SurveyResponse.js
```

### Other Empty Files (10 files)
```bash
rm /apps/backend/src/controllers/CertificateController.js
rm /apps/backend/src/migrations/20241219103000_create_indexes.js
rm /apps/backend/src/migrations/20241219103500_seed_initial_data.js
rm /apps/backend/src/utils/database.js
rm /apps/backend/src/utils/config.js
rm /apps/backend/src/utils/migrations.js
rm /apps/backend/src/models/index.js
# (and 3 more small empty files)
```

### Legacy Package Files (2 files)
```bash
# These are not used - /apps/backend/package.json is the real one
rm /apps/backend/src/package.json
rm /backend/services/application/package.json
rm /backend/services/auth/package.json
```

**Total Tier 1: ~23 files, 100% safe**

---

## TIER 2: DELETE AFTER VERIFICATION (Check dependencies first)

### Delete Old Backend Folder (682KB)
```bash
# Archive it first for safety
mv /backend/ /backend-ARCHIVED-2025-10-26

# Then delete if no references found
rm -rf /backend-ARCHIVED-2025-10-26
```

**Before deleting, search for references:**
```bash
grep -r "/backend/" /apps/backend/ --include="*.js" | head -20
grep -r "require.*backend" /apps/backend/ --include="*.js" | head -20
grep -r "from.*backend" /apps/backend/ --include="*.js" | head -20
```

### Delete Incomplete /src/ Folder
```bash
# This folder has empty files and outdated structure
# Verify no files are being imported from it:
grep -r "apps/backend/src" /apps/backend/ --include="*.js"
grep -r "./src/" /apps/backend/ --include="*.js"

# If no references, delete:
rm -rf /apps/backend/src/
```

### Delete Old Middleware Versions
```bash
# Compare first
diff /apps/backend/middleware/auth.js /apps/backend/src/middleware/auth.js

# Then delete old versions
rm -rf /apps/backend/src/middleware/
rm -rf /apps/backend/modules/shared/middleware/
```

### Delete Old Config Versions
```bash
# Verify nothing imports from /src/config/
grep -r "apps/backend/src/config" /apps/backend/ --include="*.js"

# Delete
rm -rf /apps/backend/src/config/
```

### Delete Legacy Database Folder
```bash
# Archive first
mv /database/ /database-ARCHIVED-2025-10-26

# Verify migrations aren't being run from here:
grep -r "database.*migrations" /apps/backend/ --include="*.js"
grep -r "database/migrate" . --include="*.js"

# If safe, delete
rm -rf /database-ARCHIVED-2025-10-26/
```

**Total Tier 2: ~1.5MB, medium risk - verify carefully**

---

## TIER 3: CONSOLIDATE DUPLICATE MODELS

### Application Model

**Current Locations:**
1. `/apps/backend/models/Application.js` (502 lines)
2. `/apps/backend/modules/application-workflow/infrastructure/models/Application.js` (833 lines) ← PREFERRED
3. `/apps/backend/src/models/Application.js` (0 lines - EMPTY)
4. `/database/models/Application.model.js` (legacy)

**Step 1: Verify which imports which**
```bash
grep -r "require.*Application\|from.*Application" /apps/backend/ --include="*.js" | grep models
```

**Step 2: Update imports**
```bash
# Find all imports
grep -r "models/Application" /apps/backend/ --include="*.js"
grep -r "application-workflow.*Application" /apps/backend/ --include="*.js"

# If using /models/Application.js, change to:
# /apps/backend/modules/application-workflow/infrastructure/models/Application
```

**Step 3: Delete old version**
```bash
rm /apps/backend/models/Application.js
```

---

### User Model

**Current Locations:**
1. `/apps/backend/models/User.js` (557 lines)
2. `/apps/backend/modules/user-management/infrastructure/models/User.js` (478 lines) ← PREFERRED
3. `/apps/backend/modules/auth-farmer/models/User.js` (?)
4. `/database/models/User.model.js` (legacy)

**Action:**
```bash
# Verify which is being imported
grep -r "require.*User\|from.*User" /apps/backend/ --include="*.js" | grep models

# Consolidate to user-management version
# Update imports from /models/User.js to modules/user-management/infrastructure/models/User.js
# Delete /apps/backend/models/User.js
```

---

### Certificate Model

**Current Locations:**
1. `/apps/backend/modules/certificate-management/models/Certificate.js` (487 lines) ← PREFERRED
2. `/apps/backend/src/models/Certificate.js` (0 lines - EMPTY)
3. `/database/models/Certificate.model.js` (legacy)

**Action:**
```bash
# Already in correct location, just delete empty version
rm /apps/backend/src/models/Certificate.js
```

---

## TIER 4: CONSOLIDATE DUPLICATE ROUTES

### Application Routes
```bash
# DELETE: /apps/backend/modules/application-workflow/routes/application.routes.js (114 lines - OLD)
# KEEP:   /apps/backend/modules/application-workflow/presentation/routes/application-routes.js (435 lines - NEW)

# Update server.js and other imports
grep -r "application-workflow/routes" /apps/backend/ --include="*.js"
grep -r "application-workflow/presentation/routes" /apps/backend/ --include="*.js"
```

### Certificate Routes
```bash
# DELETE: /apps/backend/modules/certificate-management/routes/certificate.routes.js (121 lines)
# KEEP:   /apps/backend/modules/certificate-management/presentation/routes/certificate.routes.js (173 lines)
```

### Farm Routes
```bash
# DELETE: /apps/backend/modules/farm-management/routes/farm.routes.js (132 lines - OLD)
# KEEP:   /apps/backend/modules/farm-management/presentation/routes/farm.routes.js (132 lines - appears same)

# Verify they're identical:
diff /apps/backend/modules/farm-management/routes/farm.routes.js \
     /apps/backend/modules/farm-management/presentation/routes/farm.routes.js
```

### Dashboard Routes
```bash
# DELETE: /apps/backend/modules/dashboard/routes/dashboard.routes.js (130 lines - OLD)
# KEEP:   /apps/backend/modules/dashboard/presentation/routes/dashboard.farmer.routes.js
# KEEP:   /apps/backend/modules/dashboard/presentation/routes/dashboard.dtam.routes.js

# Or consolidate both farmer/dtam into dashboard.routes.js
```

---

## CONSOLIDATED CLEANUP SCRIPT (Run Carefully!)

```bash
#!/bin/bash

echo "=== BOTANICAL AUDIT FRAMEWORK - CLEANUP SCRIPT ==="
echo "This script performs deep cleanup - review before running!"
echo ""

# STEP 1: Backup (ALWAYS DO THIS FIRST)
echo "Step 1: Creating backup..."
tar -czf /tmp/botanical-backup-$(date +%Y%m%d-%H%M%S).tar.gz /home/user/Botanical-Audit-Framework/

# STEP 2: Delete empty files (Safe)
echo "Step 2: Deleting empty files..."
find /apps/backend/src/models -type f -size 0 -delete
find /apps/backend/src -type f -size 0 -delete

# STEP 3: Archive old backend (Medium risk - verify no imports)
echo "Step 3: Archiving /backend/ folder..."
mv /backend /backend-ARCHIVED-$(date +%Y%m%d-%H%M%S)

# STEP 4: Delete old src folder
echo "Step 4: Deleting /apps/backend/src/ folder..."
rm -rf /apps/backend/src/

# STEP 5: Delete legacy routes
echo "Step 5: Deleting legacy route files..."
rm /apps/backend/modules/application-workflow/routes/application.routes.js
rm /apps/backend/modules/certificate-management/routes/certificate.routes.js
rm /apps/backend/modules/farm-management/routes/farm.routes.js
rm /apps/backend/modules/dashboard/routes/dashboard.routes.js

# STEP 6: Consolidate models
echo "Step 6: Consolidating duplicate models..."
rm /apps/backend/models/Application.js
rm /apps/backend/models/User.js

# STEP 7: Archive database folder
echo "Step 7: Archiving /database/ folder..."
mv /database /database-ARCHIVED-$(date +%Y%m%d-%H%M%S)

echo ""
echo "=== CLEANUP COMPLETE ==="
echo "Backup created in /tmp/"
echo "Manual verification needed for:"
echo "  1. Verify all routes still register correctly"
echo "  2. Check all imports resolved"
echo "  3. Run full test suite"
echo "  4. Test all API endpoints"
```

---

## VERIFICATION CHECKLIST

After each deletion, run:

```bash
# Check for broken imports
grep -r "require.*deleted-file\|from.*deleted-file" /apps/backend/ 2>/dev/null | wc -l
# Should return 0

# Verify server still starts
cd /apps/backend && npm install && npm start

# Check routes are registered
curl http://localhost:5000/api/health
curl http://localhost:5000/api/auth/health
curl http://localhost:5000/api/applications/health

# Run tests
npm test

# Check file count before/after
find /apps/backend -type f -name "*.js" | wc -l
```

---

## EXPECTED RESULTS AFTER CLEANUP

### Size Reduction
- Before: /apps/backend = 6.1MB
- After: /apps/backend ≈ 5.0MB (estimated 1MB reduction)
- Deleted: /backend = 682KB
- Deleted: /database/ models (partial, ≈ 200KB)
- **Total cleanup: ≈ 1.9MB**

### File Count Reduction
- Before: 500+ model/route files in multiple locations
- After: Single location for each
- Removed: 40-50 duplicate/dead files

### Structure Clarity
- ✓ Single backend server (/apps/backend/server.js)
- ✓ Single models location (modules/*/models/)
- ✓ Single routes location (modules/*/presentation/routes/)
- ✓ Single middleware location (/apps/backend/middleware/)
- ✓ Single config location (/apps/backend/config/)

---

## ROLLBACK PROCEDURE

If something breaks:

```bash
# Restore from archived folders
cp -r /backend-ARCHIVED-* /backend
cp -r /database-ARCHIVED-* /database

# Or restore from backup
tar -xzf /tmp/botanical-backup-*.tar.gz
```

---

## ESTIMATED EFFORT

| Phase | Duration | Risk | Notes |
|-------|----------|------|-------|
| Backup & Setup | 15 min | Low | Create backups, setup script |
| Delete Empty Files | 5 min | Low | No dependencies |
| Delete /backend/ | 30 min | Medium | Verify no imports first |
| Delete /apps/backend/src/ | 15 min | Medium | Verify empty |
| Consolidate Models | 1 hour | High | Update imports carefully |
| Consolidate Routes | 1 hour | High | Verify all routes load |
| Test & Verify | 2-3 hours | High | Full integration testing |
| **TOTAL** | **4-5 hours** | **Medium** | Can be done in 1 day |

