# คำแนะนำการตั้งชื่อไฟล์ (File Naming Convention)

**วันที่:** 20 ตุลาคม 2568  
**เวอร์ชัน:** 1.0

---

## 🎯 ปัญหาปัจจุบัน (Current Issues)

### ตัวอย่างชื่อไฟล์ที่อ่านยาก:

```
❌ LoginUserUseCase.js
❌ GetDTAMDashboardUseCase.js
❌ SubmitFinalAssessmentUseCase.js
❌ GetUserNotificationsUseCase.js
❌ MarkNotificationAsReadUseCase.js
```

**ปัญหา:**

- ยาวเกินไป (มากกว่า 30 ตัวอักษร)
- ใช้ PascalCase ทำให้อ่านยาก
- คำซ้ำซ้อน (UseCase ปรากฏในทุกไฟล์)
- ไม่เป็นมิตรกับ command line และ autocomplete

---

## ✅ มาตรฐานที่แนะนำ (Recommended Standards)

### 1. **Apple / iOS Style** (kebab-case)

Apple และ modern frameworks ใช้ `kebab-case` (lowercase with dashes):

```swift
// Swift/iOS Examples
user-login.swift
dashboard-dtam.swift
notification-mark-read.swift
course-complete.swift
```

### 2. **Google Style Guide** (kebab-case)

Google JavaScript Style Guide แนะนำ kebab-case:

```javascript
// Recommended by Google
user - login.js;
dashboard - dtam.js;
notification - mark - read.js;
course - complete.js;
```

### 3. **Node.js / NPM Convention** (kebab-case)

NPM packages และ Node.js modules ใช้ kebab-case:

```
express
body-parser
mongoose-paginate
passport-local
```

---

## 📋 แนวทางการตั้งชื่อใหม่

### หลักการ:

1. **ใช้ kebab-case** (lowercase-with-dashes)
2. **ลบคำซ้ำซ้อน** (ไม่ต้องใส่ UseCase, Service, Controller ซ้ำ)
3. **ใช้คำสั้น กระชับ ชัดเจน**
4. **เรียงลำดับ: verb-noun** (กริยา-คำนาม)

### การแปลงชื่อไฟล์:

#### **Use Cases**

| ❌ ชื่อเดิม                        | ✅ ชื่อใหม่                 | หมายเหตุ    |
| ---------------------------------- | --------------------------- | ----------- |
| `LoginUserUseCase.js`              | `login.js`                  | กระชับ      |
| `RegisterUserUseCase.js`           | `register.js`               | สั้น ชัดเจน |
| `GetDTAMDashboardUseCase.js`       | `get-dtam-dashboard.js`     | อ่านง่าย    |
| `GetFarmerDashboardUseCase.js`     | `get-farmer-dashboard.js`   | สม่ำเสมอ    |
| `SubmitFinalAssessmentUseCase.js`  | `submit-assessment.js`      | ลดคำซ้ำ     |
| `GetUserNotificationsUseCase.js`   | `get-notifications.js`      | เข้าใจง่าย  |
| `MarkNotificationAsReadUseCase.js` | `mark-as-read.js`           | กระชับ      |
| `MarkAllAsReadUseCase.js`          | `mark-all-read.js`          | สั้น        |
| `CreateCourseUseCase.js`           | `create-course.js`          | ชัดเจน      |
| `UpdateCourseUseCase.js`           | `update-course.js`          | สม่ำเสมอ    |
| `CompleteCourseUseCase.js`         | `complete-course.js`        | อ่านง่าย    |
| `EnrollInCourseUseCase.js`         | `enroll-course.js`          | กระชับ      |
| `GenerateCertificateUseCase.js`    | `generate-certificate.js`   | ชัดเจน      |
| `RevokeCertificateUseCase.js`      | `revoke-certificate.js`     | สม่ำเสมอ    |
| `VerifyCertificateUseCase.js`      | `verify-certificate.js`     | อ่านง่าย    |
| `UploadDocumentUseCase.js`         | `upload-document.js`        | กระชับ      |
| `ApproveDocumentUseCase.js`        | `approve-document.js`       | ชัดเจน      |
| `DownloadDocumentUseCase.js`       | `download-document.js`      | สม่ำเสมอ    |
| `RegisterFarmUseCase.js`           | `register-farm.js`          | กระชับ      |
| `ApproveFarmUseCase.js`            | `approve-farm.js`           | สั้น        |
| `CreateSurveyUseCase.js`           | `create-survey.js`          | ชัดเจน      |
| `SubmitSurveyUseCase.js`           | `submit-survey.js`          | อ่านง่าย    |
| `ApproveSurveyUseCase.js`          | `approve-survey.js`         | สม่ำเสมอ    |
| `CreateAuditLogUseCase.js`         | `create-audit-log.js`       | กระชับ      |
| `GetAuditStatisticsUseCase.js`     | `get-audit-stats.js`        | สั้นกว่า    |
| `RequestPasswordResetUseCase.js`   | `request-password-reset.js` | ชัดเจน      |
| `ResetPasswordUseCase.js`          | `reset-password.js`         | กระชับ      |
| `VerifyEmailUseCase.js`            | `verify-email.js`           | สั้น        |
| `UpdateUserProfileUseCase.js`      | `update-profile.js`         | กระชับ      |

#### **Controllers**

| ❌ ชื่อเดิม                                  | ✅ ชื่อใหม่                 |
| -------------------------------------------- | --------------------------- |
| `EnhancedApplicationProcessingController.js` | `application-processing.js` |
| `EnhancedTrainingController.js`              | `training-enhanced.js`      |
| `NotificationController.js`                  | `notification.js`           |
| `CertificateController.js`                   | `certificate.js`            |
| `DocumentController.js`                      | `document.js`               |
| `FarmController.js`                          | `farm.js`                   |
| `SurveyController.js`                        | `survey.js`                 |
| `AuditController.js`                         | `audit.js`                  |
| `AuthController.js`                          | `auth.js`                   |
| `DTAMStaffAuthController.js`                 | `dtam-auth.js`              |
| `UserAuthenticationController.js`            | `user-auth.js`              |

#### **Services**

| ❌ ชื่อเดิม                                   | ✅ ชื่อใหม่                          |
| --------------------------------------------- | ------------------------------------ |
| `AdvancedApplicationProcessingService.js`     | `application-processing-advanced.js` |
| `DocumentManagementIntegrationSystem.js`      | `document-integration.js`            |
| `GovernmentApiIntegrationService.js`          | `government-api.js`                  |
| `EnhancedTrainingServiceIntegration.js`       | `training-integration.js`            |
| `CertificateGenerationService.js`             | `certificate-generation.js`          |
| `PerformanceAssessmentToolsSystem.js`         | `performance-assessment.js`          |
| `AdvancedTrainingAnalyticsSystem.js`          | `training-analytics.js`              |
| `TrainingWorkflowIntegrationManager.js`       | `training-workflow.js`               |
| `EnrollmentCompletionCertificationService.js` | `enrollment-certification.js`        |
| `ComplianceMonitoringSystem.js`               | `compliance-monitoring.js`           |
| `SecurityComplianceService.js`                | `security-compliance.js`             |

#### **Models**

| ❌ ชื่อเดิม       | ✅ ชื่อใหม่       | หมายเหตุ          |
| ----------------- | ----------------- | ----------------- |
| `User.js`         | `user.js`         | lowercase (แนะนำ) |
| `Application.js`  | `application.js`  | สม่ำเสมอ          |
| `Certificate.js`  | `certificate.js`  | อ่านง่าย          |
| `Document.js`     | `document.js`     | กระชับ            |
| `Farm.js`         | `farm.js`         | สั้น              |
| `Survey.js`       | `survey.js`       | ชัดเจน            |
| `Notification.js` | `notification.js` | สม่ำเสมอ          |

**หมายเหตุ:** Models อาจเก็บ PascalCase ได้ (เป็น convention ของ Mongoose) แต่ควรพิจารณาให้สอดคล้องกับโครงสร้างทั้งหมด

---

## 🏗️ โครงสร้างโฟลเดอร์ที่แนะนำ

### ก่อน (Before):

```
modules/
  auth-farmer/
    application/
      use-cases/
        LoginUserUseCase.js
        RegisterUserUseCase.js
        RequestPasswordResetUseCase.js
        ResetPasswordUseCase.js
        VerifyEmailUseCase.js
        UpdateUserProfileUseCase.js
```

### หลัง (After):

```
modules/
  auth-farmer/
    application/
      use-cases/
        login.js
        register.js
        request-password-reset.js
        reset-password.js
        verify-email.js
        update-profile.js
```

---

## 📚 ตัวอย่างการใช้งาน (Examples)

### Import ก่อนและหลัง:

#### ❌ ก่อน (Before):

```javascript
const LoginUserUseCase = require('./use-cases/LoginUserUseCase');
const RegisterUserUseCase = require('./use-cases/RegisterUserUseCase');
const GetDTAMDashboardUseCase = require('./use-cases/GetDTAMDashboardUseCase');
```

#### ✅ หลัง (After):

```javascript
const LoginUseCase = require('./use-cases/login');
const RegisterUseCase = require('./use-cases/register');
const GetDTAMDashboard = require('./use-cases/get-dtam-dashboard');
```

**ข้อดี:**

- สั้นกว่า 40%
- อ่านง่ายกว่า
- autocomplete เร็วกว่า
- เป็นมาตรฐานสากล

---

## 🎨 สไตล์ที่นิยมในอุตสาหกรรม

### 1. **Apple / Swift**

```
kebab-case สำหรับไฟล์ทั้งหมด
user-login.swift
dashboard-view.swift
network-manager.swift
```

### 2. **Google Angular**

```
kebab-case + type suffix
user-login.component.ts
auth.service.ts
user.model.ts
```

### 3. **React / Next.js**

```
kebab-case หรือ PascalCase (components)
user-login.tsx (preferred)
UserLogin.tsx (acceptable for components)
auth-service.ts
```

### 4. **Vue.js**

```
kebab-case ทั้งหมด
user-login.vue
auth-service.js
user-store.js
```

### 5. **Node.js / NPM**

```
kebab-case เสมอ
user-service.js
database-connection.js
email-sender.js
```

---

## ✅ ข้อแนะนำสำหรับโปรเจกต์นี้

### กฎการตั้งชื่อ:

1. **Use Cases:** `{verb}-{noun}.js`
   - `login.js`, `register.js`, `create-farm.js`

2. **Controllers:** `{domain}.js`
   - `auth.js`, `user.js`, `farm.js`

3. **Services:** `{domain}-{purpose}.js`
   - `auth-service.js`, `email-sender.js`, `payment-processor.js`

4. **Models:** `{entity}.js` (lowercase)
   - `user.js`, `farm.js`, `certificate.js`

5. **Routes:** `{domain}.routes.js`
   - `auth.routes.js`, `farm.routes.js`, `certificate.routes.js`

6. **Middleware:** `{purpose}.middleware.js` หรือ `{purpose}.js`
   - `auth.middleware.js`, `validation.js`, `error-handler.js`

7. **Utils/Helpers:** `{purpose}.js`
   - `date-formatter.js`, `string-utils.js`, `crypto.js`

---

## 🔄 ขั้นตอนการ Refactor

### Phase 1: Use Cases (ลำดับความสำคัญสูง)

```bash
# ตัวอย่าง
mv LoginUserUseCase.js login.js
mv RegisterUserUseCase.js register.js
mv GetDTAMDashboardUseCase.js get-dtam-dashboard.js
```

### Phase 2: Controllers (ลำดับความสำคัญกลาง)

```bash
mv EnhancedApplicationProcessingController.js application-processing.js
mv NotificationController.js notification.js
```

### Phase 3: Services (ลำดับความสำคัญกลาง)

```bash
mv AdvancedApplicationProcessingService.js application-processing-advanced.js
mv DocumentManagementIntegrationSystem.js document-integration.js
```

### Phase 4: Models (ลำดับความสำคัญต่ำ - optional)

```bash
# Optional: เก็บ PascalCase ตาม Mongoose convention
# หรือเปลี่ยนเป็น lowercase เพื่อความสม่ำเสมอ
mv User.js user.js
mv Farm.js farm.js
```

---

## 📊 สรุปประโยชน์

| ประเด็น        | ก่อน (PascalCase + UseCase) | หลัง (kebab-case)    |
| -------------- | --------------------------- | -------------------- |
| ความยาวเฉลี่ย  | 35-45 ตัวอักษร              | 15-25 ตัวอักษร       |
| การอ่าน        | ยาก ต้องแยกคำด้วยตัวเอง     | ง่าย มี dash คั่น    |
| Autocomplete   | ช้า ต้องพิมพ์หลายตัว        | เร็ว พิมพ์น้อย       |
| Cross-platform | ปัญหากับ case-sensitive FS  | ไม่มีปัญหา           |
| มาตรฐาน        | ไม่ตรงกับอุตสาหกรรม         | ตรงกับ Apple, Google |
| Git history    | ยุ่งเมื่อ rename            | ชัดเจน               |

---

## 🎯 ตัวอย่าง Module สมบูรณ์

### Before:

```
auth-farmer/
  application/
    use-cases/
      LoginUserUseCase.js
      RegisterUserUseCase.js
      RequestPasswordResetUseCase.js
  presentation/
    controllers/
      AuthController.js
  domain/
    services/
      AuthenticationService.js
  infrastructure/
    repositories/
      UserRepository.js
```

### After:

```
auth-farmer/
  application/
    use-cases/
      login.js
      register.js
      request-password-reset.js
  presentation/
    controllers/
      auth.js
  domain/
    services/
      authentication.js
  infrastructure/
    repositories/
      user.js
```

**ผลลัพธ์:**

- สั้นกว่า 50%
- อ่านง่ายกว่า 80%
- เป็นมาตรฐานสากล
- ทำงานได้ดีกับทุก OS

---

## 📝 Checklist การ Rename

- [ ] สำรวจไฟล์ทั้งหมดที่ต้อง rename
- [ ] สร้าง mapping table (เดิม → ใหม่)
- [ ] Rename ไฟล์ทีละ module
- [ ] อัพเดท imports ทั้งหมด
- [ ] รัน tests เพื่อตรวจสอบ
- [ ] อัพเดท documentation
- [ ] Commit changes

---

**สรุป:** แนะนำใช้ **kebab-case** (lowercase-with-dashes) เหมือน Apple, Google, และ NPM เพราะ:

- ✅ อ่านง่าย
- ✅ สั้นกระชับ
- ✅ เป็นมาตรฐานสากล
- ✅ ทำงานได้ดีกับทุก platform
