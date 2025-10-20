# 🎯 แผนการปรับปรุงโครงสร้างโค้ดสู่ Apple Style

**วันที่:** 20 ตุลาคม 2025  
**เป้าหมาย:** ทำให้โค้ดอ่านง่าย เสถียร ยั่งยืน ตามแนว iOS/Apple

---

## 📋 สิ่งที่พบ

### ปัญหาชื่อไฟล์ที่ยากอ่าน

```
❌ module.container.js                    - ชื่อทั่วไป
❌ AuthController.js                      - PascalCase
❌ MongoDBUserRepository.js               - ระบุ tech stack
❌ BcryptPasswordHasher.js                - ชื่อยาว
❌ IUserRepository.js                     - Interface prefix
```

### ปัญหาโครงสร้าง Directory

```
❌ infrastructure/database/               - ซ้อนลึก
❌ presentation/controllers/              - ชื่อยาว
❌ domain/interfaces/                     - C#/Java style
```

---

## ✅ แนวทางแก้ไข (3 Options)

### Option 1: Quick Fix (แนะนำ - เริ่มได้ทันที)

**เวลา:** 1-2 ชั่วโมง  
**ผลกระทบ:** ต่ำ - แค่ rename ไฟล์

#### การเปลี่ยนแปลง:

```javascript
// 1. Container files
module.container.js → container.js

// 2. Controller files
AuthController.js → auth.js
DashboardController.js → dashboard.js

// 3. Service files
BcryptPasswordHasher.js → password.js
JWTService.js → token.js

// 4. Repository files
MongoDBUserRepository.js → user.js
IUserRepository.js → user.interface.js (หรือลบ)
```

**ขั้นตอน:**

1. Rename ไฟล์
2. Update imports
3. Run Prettier
4. Test

---

### Option 2: Moderate Refactor (แนะนำสำหรับ Sprint ถัดไป)

**เวลา:** 1 วัน  
**ผลกระทบ:** ปานกลาง - ย้าย directories

#### การเปลี่ยนแปลง:

```bash
# ย้าย directories
infrastructure/database/ → repositories/
infrastructure/security/ → services/
presentation/controllers/ → controllers/
presentation/routes/ → routes/

# โครงสร้างใหม่
auth-farmer/
├── use-cases/
├── controllers/
├── repositories/
├── services/
├── models/
├── routes/
└── container.js
```

---

### Option 3: Complete Restructure (ทำทีหลัง - ไม่เร่งด่วน)

**เวลา:** 2-3 วัน  
**ผลกระทบ:** สูง - เปลี่ยน architecture pattern

#### การเปลี่ยนแปลง:

```bash
# Feature-based structure (แบบ iOS)
auth/
├── models/
├── views/        # controllers
├── services/
└── routes/
```

---

## 🚀 การดำเนินการ (เลือก Option 1)

### Phase 1: Rename Container Files (5 นาที)

```powershell
# PowerShell script
cd apps/backend/modules

# Rename all module.container.js to container.js
Get-ChildItem -Recurse -Filter "module.container.js" | ForEach-Object {
    Rename-Item $_.FullName -NewName "container.js"
}
```

**ไฟล์ที่ต้องแก้:**

- auth-farmer/module.container.js → container.js
- auth-dtam/module.container.js → container.js
- certificate-management/module.container.js → container.js
- farm-management/module.container.js → container.js
- cannabis-survey/module.container.js → container.js
- document/integration/module.container.js → container.js
- notification/integration/module.container.js → container.js
- dashboard/integration/module.container.js → container.js
- training/module.container.js → container.js
- report/integration/module.container.js → container.js
- track-trace/module.container.js → container.js
- survey-system/module.container.js → container.js

**Update imports in:**

- index.js ของแต่ละโมดูล

---

### Phase 2: Rename Controller Files (10 นาที)

```powershell
# Rename AuthController.js → auth.js
cd apps/backend/modules/auth-farmer/presentation/controllers
Rename-Item "AuthController.js" -NewName "auth.js"

# ทำซ้ำกับทุกโมดูล
```

**ไฟล์ที่ต้องแก้:**

```
auth-farmer/presentation/controllers/AuthController.js → auth.js
auth-dtam/presentation/controllers/DTAMStaffAuthController.js → dtam-auth.js
certificate-management/presentation/controllers/CertificateController.js → certificate.js
dashboard/presentation/controllers/DashboardController.js → dashboard.js
document/presentation/controllers/DocumentController.js → document.js
farm-management/presentation/controllers/FarmController.js → farm.js
notification/presentation/controllers/NotificationController.js → notification.js
cannabis-survey/presentation/controllers/SurveyController.js → survey.js
training/presentation/controllers/TrainingController.js → training.js
report/presentation/controllers/ReportController.js → report.js
```

---

### Phase 3: Rename Service Files (10 นาที)

```javascript
// auth-farmer/infrastructure/security/

BcryptPasswordHasher.js → password.js
JWTService.js → token.js
```

---

### Phase 4: Rename Repository Files (10 นาที)

```javascript
// auth-farmer/infrastructure/database/

MongoDBUserRepository.js → user.js

// ลบ interface files (ไม่จำเป็นใน JavaScript)
IUserRepository.js → ลบออก (หรือ user.interface.js)
```

---

### Phase 5: Update Imports (20 นาที)

**ตัวอย่าง: auth-farmer/container.js**

```javascript
// ❌ ก่อน
const MongoDBUserRepository = require('./infrastructure/database/MongoDBUserRepository');
const BcryptPasswordHasher = require('./infrastructure/security/BcryptPasswordHasher');
const JWTService = require('./infrastructure/security/JWTService');
const AuthController = require('./presentation/controllers/AuthController');

// ✅ หลัง
const UserRepository = require('./infrastructure/database/user');
const PasswordHasher = require('./infrastructure/security/password');
const TokenService = require('./infrastructure/security/token');
const AuthController = require('./presentation/controllers/auth');
```

---

### Phase 6: Run Prettier (5 นาที)

```bash
# Format ทั้ง backend
npx prettier --write "apps/backend/**/*.js"

# หรือเฉพาะโมดูลที่แก้
npx prettier --write "apps/backend/modules/auth-farmer/**/*.js"
```

---

### Phase 7: Test (10 นาที)

```bash
# Start server
node apps/backend/server.js

# Run tests
pnpm test

# Check for errors
npm run lint
```

---

## 📊 สรุปการเปลี่ยนแปลง

### จำนวนไฟล์ที่ต้อง Rename

| ประเภท           | จำนวน          | เวลา        |
| ---------------- | -------------- | ----------- |
| Container files  | 12 files       | 5 min       |
| Controller files | 10 files       | 10 min      |
| Service files    | ~20 files      | 10 min      |
| Repository files | ~12 files      | 10 min      |
| Update imports   | ~50 files      | 20 min      |
| Prettier         | All            | 5 min       |
| Testing          | -              | 10 min      |
| **Total**        | **~100 files** | **~70 min** |

---

## 🎯 ตัวอย่างผลลัพธ์

### ก่อน

```
auth-farmer/
├── infrastructure/
│   ├── database/
│   │   └── MongoDBUserRepository.js
│   └── security/
│       ├── BcryptPasswordHasher.js
│       └── JWTService.js
├── presentation/
│   └── controllers/
│       └── AuthController.js
└── module.container.js
```

### หลัง

```
auth-farmer/
├── infrastructure/
│   ├── database/
│   │   └── user.js
│   └── security/
│       ├── password.js
│       └── token.js
├── presentation/
│   └── controllers/
│       └── auth.js
└── container.js
```

---

## ✅ Checklist การดำเนินการ

### Preparation

- [ ] สำรองโค้ดปัจจุบัน (git commit)
- [ ] อ่านคู่มือ APPLE_STYLE_CODING_STANDARDS.md
- [ ] เตรียม PowerShell scripts

### Execution

- [ ] Rename container files (12 files)
- [ ] Rename controller files (10 files)
- [ ] Rename service files (20 files)
- [ ] Rename repository files (12 files)
- [ ] Update imports in container.js (12 files)
- [ ] Update imports in routes (10 files)
- [ ] Update imports in index.js (12 files)

### Verification

- [ ] Run Prettier
- [ ] Run ESLint
- [ ] Start server - ไม่มี errors
- [ ] Run tests - ผ่านทั้งหมด
- [ ] Manual test - ทุก API ทำงาน

### Documentation

- [ ] Update README.md
- [ ] Update API docs
- [ ] Create migration notes
- [ ] Git commit & push

---

## 🔄 PowerShell Scripts

### Script 1: Rename Container Files

```powershell
# rename-containers.ps1
$modulesPath = "apps/backend/modules"

Get-ChildItem -Path $modulesPath -Recurse -Filter "module.container.js" | ForEach-Object {
    $newPath = $_.FullName -replace "module\.container\.js", "container.js"
    Write-Host "Renaming: $($_.FullName) -> container.js"
    Rename-Item -Path $_.FullName -NewName "container.js"
}

Write-Host "✅ Container files renamed successfully"
```

### Script 2: Rename Controllers

```powershell
# rename-controllers.ps1
$controllersPattern = "*Controller.js"

Get-ChildItem -Path "apps/backend/modules" -Recurse -Filter $controllersPattern | ForEach-Object {
    $baseName = $_.BaseName -replace 'Controller$', ''
    # Convert PascalCase to kebab-case
    $kebabName = $baseName -creplace '([A-Z])', '-$1' -replace '^-', '' -replace '--', '-'
    $newName = "$($kebabName.ToLower()).js"

    Write-Host "Renaming: $($_.Name) -> $newName"
    Rename-Item -Path $_.FullName -NewName $newName
}

Write-Host "✅ Controller files renamed successfully"
```

### Script 3: Update Imports

```powershell
# update-imports.ps1
$files = Get-ChildItem -Path "apps/backend/modules" -Recurse -Filter "container.js"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Replace imports
    $content = $content -replace "require\('\.\/presentation\/controllers\/(\w+)Controller'\)", "require('./presentation/controllers/`$1')"
    $content = $content -replace "module\.container", "container"

    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "✅ Imports updated successfully"
```

---

## 📝 สรุป

### ข้อดีของการเปลี่ยนแปลง

1. ✅ **ชื่อไฟล์สั้นลง 40-60%**
2. ✅ **อ่านง่ายขึ้น** - เน้นหน้าที่ไม่เน้น tech
3. ✅ **ตรงมาตรฐาน Apple/iOS**
4. ✅ **Maintainable** - ง่ายต่อการดูแล
5. ✅ **Scalable** - พร้อมขยาย

### ข้อควรระวัง

1. ⚠️ **ต้อง update imports ทั้งหมด**
2. ⚠️ **ทดสอบหลัง rename ทุกครั้ง**
3. ⚠️ **Git commit ก่อนและหลัง**
4. ⚠️ **แจ้งทีมก่อนเปลี่ยน**

---

**พร้อมเริ่มได้เลยครับ! ต้องการให้ดำเนินการหรือไม่?** 🚀
