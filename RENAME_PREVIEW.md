# 📋 File Rename Preview - Responsibility-Based Naming

**Total Files**: 139 files across 8 categories

---

## 📁 Middleware (23 files)

| # | Before | After | Path |
|---|--------|-------|------|
| 1 | `admin-auth.js` | `admin-auth-middleware.js` | shared/middleware/ |
| 2 | `asyncHandler.js` | `async-handler-middleware.js` | shared/middleware/ |
| 3 | `audit.js` | `audit-middleware.js` | shared/middleware/ |
| 4 | `auth-clean.js` | `auth-clean-middleware.js` | shared/middleware/ |
| 5 | `auth-rate-limiters.js` | `auth-rate-limiters-middleware.js` | shared/middleware/ |
| 6 | `auth.js` | `auth-middleware.js` | shared/middleware/ |
| 7 | `cache.js` | `cache-middleware.js` | shared/middleware/ |
| 8 | `cors-config.js` | `cors-config-middleware.js` | shared/middleware/ |
| 9 | `error-handler.js` | `error-handler-middleware.js` | shared/middleware/ |
| 10 | `file-upload-validator.js` | `file-upload-validator-middleware.js` | shared/middleware/ |
| 11 | `inspector-auth.js` | `inspector-auth-middleware.js` | shared/middleware/ |
| 12 | `jwt-token-manager.js` | `jwt-token-manager-middleware.js` | shared/middleware/ |
| 13 | `performance.js` | `performance-middleware.js` | shared/middleware/ |
| 14 | `rbac.js` | `rbac-middleware.js` | shared/middleware/ |
| 15 | `request-validator.js` | `request-validator-middleware.js` | shared/middleware/ |
| 16 | `secure-cookies.js` | `secure-cookies-middleware.js` | shared/middleware/ |
| 17 | `security.js` | `security-middleware.js` | shared/middleware/ |
| 18 | `validation.js` | `validation-middleware.js` | shared/middleware/ |
| 19 | `dtam-auth.js` | `dtam-auth-middleware.js` | modules/auth-dtam/infrastructure/middleware/ |
| 20 | `auth.js` | `auth-middleware.js` | modules/auth-farmer/infrastructure/middleware/ |
| 21 | `error-handler.js` | `error-handler-middleware.js` | modules/auth-farmer/infrastructure/middleware/ |
| 22 | `security.js` | `security-middleware.js` | modules/auth-farmer/infrastructure/middleware/ |
| 23 | `auth.js` | `auth-middleware.js` | modules/auth-inspector/infrastructure/middleware/ |

---

## 🎯 Controllers (13 files)

| # | Before | After | Path |
|---|--------|-------|------|
| 1 | `enhanced-application-processing.js` | `enhanced-application-processing-controller.js` | modules/application-workflow/presentation/controllers/ |
| 2 | `audit.js` | `audit-controller.js` | modules/audit-trail/presentation/controllers/ |
| 3 | `dtam-auth.js` | `dtam-auth-controller.js` | modules/auth-dtam/presentation/controllers/ |
| 4 | `auth.js` | `auth-controller.js` | modules/auth-farmer/presentation/controllers/ |
| 5 | `survey.js` | `survey-controller.js` | modules/certification-survey/presentation/controllers/ |
| 6 | `certificate.js` | `certificate-controller.js` | modules/certificate/presentation/controllers/ |
| 7 | `dashboard.js` | `dashboard-controller.js` | modules/dashboard/presentation/controllers/ |
| 8 | `document.js` | `document-controller.js` | modules/document-management/presentation/controllers/ |
| 9 | `farm.js` | `farm-controller.js` | modules/farm-registry/presentation/controllers/ |
| 10 | `notification.js` | `notification-controller.js` | modules/notification-service/presentation/controllers/ |
| 11 | `report.js` | `report-controller.js` | modules/reporting/presentation/controllers/ |
| 12 | `track-trace.js` | `track-trace-controller.js` | modules/traceability/presentation/controllers/ |
| 13 | `training.js` | `training-controller.js` | modules/training/presentation/controllers/ |

---

## 💾 Models (10 files)

| # | Before | After | Path |
|---|--------|-------|------|
| 1 | `audit-log.js` | `audit-log-model.js` | modules/audit-trail/infrastructure/database/ |
| 2 | `dtam-staff.js` | `dtam-staff-model.js` | modules/auth-dtam/infrastructure/database/ |
| 3 | `user.js` | `user-model.js` | modules/auth-farmer/infrastructure/database/ |
| 4 | `survey.js` | `survey-model.js` | modules/certification-survey/infrastructure/database/ |
| 5 | `certificate.js` | `certificate-model.js` | modules/certificate/infrastructure/database/ |
| 6 | `document.js` | `document-model.js` | modules/document-management/infrastructure/database/ |
| 7 | `farm.js` | `farm-model.js` | modules/farm-registry/infrastructure/database/ |
| 8 | `notification.js` | `notification-model.js` | modules/notification-service/infrastructure/database/ |
| 9 | `course.js` | `course-model.js` | modules/training/infrastructure/database/ |
| 10 | `enrollment.js` | `enrollment-model.js` | modules/training/infrastructure/database/ |

---

## 🔧 Use Cases (72 files)

| # | Before | After | Module |
|---|--------|-------|--------|
| 1 | `create-dtam-staff.js` | `create-dtam-staff-usecase.js` | auth-dtam |
| 2 | `get-dtam-staff-profile.js` | `get-dtam-staff-profile-usecase.js` | auth-dtam |
| 3 | `list-dtam-staff.js` | `list-dtam-staff-usecase.js` | auth-dtam |
| 4 | `login-dtam-staff.js` | `login-dtam-staff-usecase.js` | auth-dtam |
| 5 | `request-dtam-staff-password-reset.js` | `request-dtam-staff-password-reset-usecase.js` | auth-dtam |
| 6 | `reset-dtam-staff-password.js` | `reset-dtam-staff-password-usecase.js` | auth-dtam |
| 7 | `update-dtam-staff-profile.js` | `update-dtam-staff-profile-usecase.js` | auth-dtam |
| 8 | `update-dtam-staff-role.js` | `update-dtam-staff-role-usecase.js` | auth-dtam |
| 9 | `get-profile.js` | `get-profile-usecase.js` | auth-farmer |
| 10 | `login.js` | `login-usecase.js` | auth-farmer |
| 11 | `register.js` | `register-usecase.js` | auth-farmer |
| 12 | `request-password-reset.js` | `request-password-reset-usecase.js` | auth-farmer |
| 13 | `reset-password.js` | `reset-password-usecase.js` | auth-farmer |
| 14 | `update-profile.js` | `update-profile-usecase.js` | auth-farmer |
| 15 | `verify-email.js` | `verify-email-usecase.js` | auth-farmer |
| 16 | `approve-survey.js` | `approve-survey-usecase.js` | certification-survey |
| 17 | `create-survey.js` | `create-survey-usecase.js` | certification-survey |
| 18 | `get-survey-details.js` | `get-survey-details-usecase.js` | certification-survey |
| 19 | `list-surveys.js` | `list-surveys-usecase.js` | certification-survey |
| 20 | `reject-survey.js` | `reject-survey-usecase.js` | certification-survey |
| 21 | `request-survey-revision.js` | `request-survey-revision-usecase.js` | certification-survey |
| 22 | `start-survey-review.js` | `start-survey-review-usecase.js` | certification-survey |
| 23 | `submit-survey.js` | `submit-survey-usecase.js` | certification-survey |
| 24 | `update-survey.js` | `update-survey-usecase.js` | certification-survey |
| 25 | `generate-certificate.js` | `generate-certificate-usecase.js` | certificate |
| 26 | `list-certificates.js` | `list-certificates-usecase.js` | certificate |
| 27 | `renew-certificate.js` | `renew-certificate-usecase.js` | certificate |
| 28 | `revoke-certificate.js` | `revoke-certificate-usecase.js` | certificate |
| 29 | `verify-certificate.js` | `verify-certificate-usecase.js` | certificate |
| 30 | `get-dtam-dashboard.js` | `get-dtam-dashboard-usecase.js` | dashboard |
| 31 | `get-farmer-dashboard.js` | `get-farmer-dashboard-usecase.js` | dashboard |
| 32 | `get-system-stats.js` | `get-system-stats-usecase.js` | dashboard |
| 33 | `approve-document.js` | `approve-document-usecase.js` | document-management |
| 34 | `delete-document.js` | `delete-document-usecase.js` | document-management |
| 35 | `download-document.js` | `download-document-usecase.js` | document-management |
| 36 | `get-document-stats.js` | `get-document-stats-usecase.js` | document-management |
| 37 | `get-document.js` | `get-document-usecase.js` | document-management |
| 38 | `get-documents-by-entity.js` | `get-documents-by-entity-usecase.js` | document-management |
| 39 | `get-pending-documents.js` | `get-pending-documents-usecase.js` | document-management |
| 40 | `list-documents.js` | `list-documents-usecase.js` | document-management |
| 41 | `reject-document.js` | `reject-document-usecase.js` | document-management |
| 42 | `update-document-metadata.js` | `update-document-metadata-usecase.js` | document-management |
| 43 | `upload-document.js` | `upload-document-usecase.js` | document-management |
| 44 | `approve-farm.js` | `approve-farm-usecase.js` | farm-registry |
| 45 | `get-farm-details.js` | `get-farm-details-usecase.js` | farm-registry |
| 46 | `list-farms.js` | `list-farms-usecase.js` | farm-registry |
| 47 | `register-farm.js` | `register-farm-usecase.js` | farm-registry |
| 48 | `reject-farm.js` | `reject-farm-usecase.js` | farm-registry |
| 49 | `start-farm-review.js` | `start-farm-review-usecase.js` | farm-registry |
| 50 | `submit-farm-for-review.js` | `submit-farm-for-review-usecase.js` | farm-registry |
| 51 | `update-farm.js` | `update-farm-usecase.js` | farm-registry |
| 52 | `delete-notification.js` | `delete-notification-usecase.js` | notification-service |
| 53 | `get-notification-stats.js` | `get-notification-stats-usecase.js` | notification-service |
| 54 | `get-unread-count.js` | `get-unread-count-usecase.js` | notification-service |
| 55 | `get-user-notifications.js` | `get-user-notifications-usecase.js` | notification-service |
| 56 | `mark-all-read.js` | `mark-all-read-usecase.js` | notification-service |
| 57 | `mark-as-read.js` | `mark-as-read-usecase.js` | notification-service |
| 58 | `send-broadcast.js` | `send-broadcast-usecase.js` | notification-service |
| 59 | `send-notification.js` | `send-notification-usecase.js` | notification-service |
| 60 | `delete-report.js` | `delete-report-usecase.js` | reporting |
| 61 | `download-report.js` | `download-report-usecase.js` | reporting |
| 62 | `generate-report.js` | `generate-report-usecase.js` | reporting |
| 63 | `get-report-statistics.js` | `get-report-statistics-usecase.js` | reporting |
| 64 | `get-report.js` | `get-report-usecase.js` | reporting |
| 65 | `list-reports.js` | `list-reports-usecase.js` | reporting |
| 66 | `process-scheduled-reports.js` | `process-scheduled-reports-usecase.js` | reporting |
| 67 | `request-report.js` | `request-report-usecase.js` | reporting |
| 68 | `retry-failed-report.js` | `retry-failed-report-usecase.js` | reporting |
| 69 | `survey-management.js` | `survey-management-usecase.js` | traceability |
| 70 | `track-harvest.js` | `track-harvest-usecase.js` | traceability |
| 71 | `track-plant.js` | `track-plant-usecase.js` | traceability |
| 72 | `track-seed.js` | `track-seed-usecase.js` | traceability |

---

## 🛣️ Routes (5 files)

| # | Before | After | Module |
|---|--------|-------|--------|
| 1 | `DocumentRoutes.js` | `document-routes.routes.js` | document-management |
| 2 | `NotificationRoutes.js` | `notification-routes.routes.js` | notification-service |
| 3 | `PaymentRoutes.js` | `payment-routes.routes.js` | payment |
| 4 | `ReportingRoutes.js` | `reporting-routes.routes.js` | reporting |
| 5 | `authRoutes.js` | `auth-routes.routes.js` | auth-farmer |

---

## 🔌 Services (3 files)

| # | Before | After | Module |
|---|--------|-------|--------|
| 1 | `email.js` | `email-service.js` | notification-service |
| 2 | `aggregator.js` | `aggregator-service.js` | reporting |
| 3 | `generator.js` | `generator-service.js` | reporting |

---

## 📦 Repositories (1 file)

| # | Before | After | Module |
|---|--------|-------|--------|
| 1 | `report.js` | `report-repository.js` | reporting |

---

## 🛠️ Utils (12 files)

| # | Before | After | Path |
|---|--------|-------|------|
| 1 | `crypto.js` | `crypto-utils.js` | shared/utils/ |
| 2 | `date.js` | `date-utils.js` | shared/utils/ |
| 3 | `response.js` | `response-utils.js` | shared/utils/ |
| 4 | `validateSecrets.js` | `validate-secrets-utils.js` | shared/utils/ |
| 5 | `validation.js` | `validation-utils.js` | shared/utils/ |
| 6 | `config.js` | `config-utils.js` | modules/application-workflow/utils/ |
| 7 | `errorHandler.js` | `error-handler-utils.js` | modules/application-workflow/utils/ |
| 8 | `migrations.js` | `migrations-utils.js` | modules/application-workflow/utils/ |
| 9 | `validation.js` | `validation-utils.js` | modules/application-workflow/utils/ |
| 10 | `connection-health-checker.js` | `connection-health-checker-utils.js` | modules/health-check/utils/ |
| 11 | `pagination.js` | `pagination-utils.js` | modules/payment/utils/ |
| 12 | `promptpay-qr.js` | `promptpay-qr-utils.js` | modules/payment/utils/ |

---

## 📊 Summary

- **Middleware**: 23 files → All get `-middleware.js` suffix
- **Controllers**: 13 files → All get `-controller.js` suffix
- **Models**: 10 files → All get `-model.js` suffix
- **Use Cases**: 72 files → All get `-usecase.js` suffix
- **Routes**: 5 files → All get `.routes.js` suffix
- **Services**: 3 files → All get `-service.js` suffix
- **Repositories**: 1 file → Gets `-repository.js` suffix
- **Utils**: 12 files → All get `-utils.js` suffix

**Total**: 139 files will be renamed

---

## ✅ Benefits

1. **Self-Documenting**: File names immediately convey their responsibility
2. **No Ambiguity**: `auth.js` vs `auth-controller.js` vs `auth-middleware.js` vs `auth-service.js`
3. **Easier Navigation**: Filter by suffix to find all controllers/services/etc.
4. **Senior Engineer Standard**: Names convey purpose, not just concept
5. **Cross-Platform Safe**: kebab-case works on Windows/Linux/Mac
6. **Import Clarity**: `require('./auth-controller')` vs `require('./auth')` - obvious what it is

---

## 🚀 Next Steps

1. Review this preview
2. Execute: `node scripts/rename-by-responsibility.js --execute`
3. Script will:
   - Rename all files using `git mv` (preserves history)
   - Update all import statements automatically
   - Generate detailed report
4. Run tests to verify nothing broke
5. Commit changes

---

**Generated**: November 8, 2025  
**Status**: Ready for execution (dry-run completed)
