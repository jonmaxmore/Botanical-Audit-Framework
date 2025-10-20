# 🍎 Apple-Style Coding Standards & File Naming Conventions

**วันที่:** 20 ตุลาคม 2025  
**เวอร์ชัน:** 1.0  
**วัตถุประสงค์:** สร้างมาตรฐานการเขียนโค้ดที่เสถียร ยั่งยืน และอ่านง่าย ตามแนวทาง Apple/iOS

---

## 📋 สารบัญ

1. [File Naming Conventions](#file-naming-conventions)
2. [Directory Structure](#directory-structure)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Schema & Model Conventions](#schema--model-conventions)
5. [Migration Plan](#migration-plan)

---

## 1. File Naming Conventions

### ✅ ปัญหาปัจจุบัน

```
❌ module.container.js           - ชื่อทั่วไป ไม่บอกว่า module ไหน
❌ AuthController.js             - PascalCase (ไม่ตรงกับ Apple style)
❌ IUserRepository.js            - Interface prefix (C# style, ไม่ใช่ JS)
❌ MongoDBUserRepository.js      - ชื่อยาว มี acronym ผสม
❌ BcryptPasswordHasher.js       - ชื่อยาว เน้น implementation
```

### ✅ แนวทางที่แนะนำ (Apple/iOS Style)

#### A. Container Files

```javascript
// ❌ เดิม
module.container.js;

// ✅ ใหม่ (แนวทาง 1: ชัดเจนกว่า)
auth - farmer.container.js;
certificate.container.js;
dashboard.container.js;

// ✅ ใหม่ (แนวทาง 2: สั้นกว่า - Apple style)
container.js; // ในโฟลเดอร์ auth-farmer/ จะรู้ว่าเป็น auth-farmer container
```

**คำแนะนำ:** ใช้ `container.js` เพราะ:

- อยู่ในโฟลเดอร์ที่ชื่อชัดเจนอยู่แล้ว (`auth-farmer/`, `dashboard/`)
- สั้น กระชับ ตามแนว Apple (เช่น `AppDelegate.swift`, `ViewController.swift`)
- Path จะเป็น `auth-farmer/container.js` ซึ่งชัดเจน

#### B. Controller Files

```javascript
// ❌ เดิม
AuthController.js
DashboardController.js
CertificateController.js

// ✅ ใหม่
auth-controller.js      // หรือ
controller.js           // (ถ้าอยู่ใน auth-farmer/presentation/controllers/)

// 🎯 Best Practice: ใช้ชื่อสั้น
controllers/
  ├── auth.js           // ✅ สั้นที่สุด
  ├── profile.js
  └── password.js
```

#### C. Repository Files

```javascript
// ❌ เดิม
MongoDBUserRepository.js
IUserRepository.js

// ✅ ใหม่
repositories/
  ├── user.js                    // ✅ implementation
  ├── user.interface.js          // ✅ interface (ถ้าจำเป็น)
  └── user.repository.js         // ✅ อีกทางเลือก
```

#### D. Service Files

```javascript
// ❌ เดิม
BcryptPasswordHasher.js
JWTService.js

// ✅ ใหม่
services/
  ├── password-hasher.js         // ✅ เน้นหน้าที่ ไม่เน้น tech
  ├── token.js                   // ✅ หรือสั้นกว่า
  └── jwt.js                     // ✅ ถ้าจำเป็นต้องระบุ tech
```

#### E. Use Case Files (✅ เสร็จแล้ว)

```javascript
// ✅ ทำเสร็จแล้ว
use-cases/
  ├── login.js
  ├── register.js
  ├── reset-password.js
  └── verify-email.js
```

---

## 2. Directory Structure

### ✅ โครงสร้างปัจจุบัน vs. Apple Style

#### ปัจจุบัน (Clean Architecture - Java/C# style)

```
auth-farmer/
├── application/
│   └── use-cases/
├── domain/
│   ├── entities/
│   └── interfaces/
├── infrastructure/
│   ├── database/
│   └── security/
├── presentation/
│   ├── controllers/
│   └── routes/
└── module.container.js
```

#### แนะนำ (Apple/iOS style - Swift-like)

```
auth-farmer/
├── models/              // ✅ เหมือน iOS Models
│   ├── user.js
│   └── user.schema.js
├── views/               // ✅ Controllers = Views ใน backend
│   ├── auth.js
│   └── profile.js
├── services/            // ✅ Business logic
│   ├── authentication.js
│   ├── password.js
│   └── token.js
├── repositories/        // ✅ Data access
│   └── user.js
├── routes/              // ✅ API routes
│   └── auth.js
└── container.js         // ✅ DI container
```

#### แนะนำ 2 (Hybrid - รักษา Clean Architecture + Apple naming)

```
auth-farmer/
├── use-cases/           // ✅ เก็บ Clean Architecture
│   ├── login.js
│   └── register.js
├── controllers/         // ✅ ไม่ต้องมี presentation/
│   └── auth.js
├── repositories/        // ✅ ไม่ต้องมี infrastructure/database/
│   └── user.js
├── services/            // ✅ ไม่ต้องมี infrastructure/security/
│   ├── password.js
│   └── token.js
├── models/              // ✅ domain entities
│   └── user.js
├── routes/
│   └── auth.js
└── container.js
```

---

## 3. Code Style Guidelines

### A. Import Statements (Apple/Swift-like)

```javascript
// ❌ เดิม - ยาว ซับซ้อน
const MongoDBUserRepository = require('./infrastructure/database/MongoDBUserRepository');
const BcryptPasswordHasher = require('./infrastructure/security/BcryptPasswordHasher');

// ✅ ใหม่ - สั้น ชัดเจน
const UserRepository = require('./repositories/user');
const PasswordHasher = require('./services/password');
const TokenService = require('./services/token');
```

### B. Class Names (ลดความซับซ้อน)

```javascript
// ❌ เดิม
class MongoDBUserRepository {
  constructor() {}
}

class BcryptPasswordHasher {
  constructor() {}
}

// ✅ ใหม่ - เน้นหน้าที่ ไม่เน้น implementation
class UserRepository {
  constructor(db) {
    this.db = db; // MongoDB, PostgreSQL, etc.
  }
}

class PasswordHasher {
  constructor() {
    // ใช้ bcrypt ภายใน แต่ไม่ต้องระบุในชื่อ class
  }
}
```

### C. Function Names (Apple/Swift-like)

```javascript
// ❌ เดิม
function getUserProfileUseCase() {}
function registerUserUseCase() {}

// ✅ ใหม่ - verb-first, สั้น
function getProfile() {}
function register() {}
function login() {}
function resetPassword() {}
```

### D. Variable Names

```javascript
// ❌ เดิม
const userRepositoryInstance = new MongoDBUserRepository();
const passwordHasherService = new BcryptPasswordHasher();

// ✅ ใหม่
const users = new UserRepository(); // ✅ collection/resource name
const passwords = new PasswordHasher(); // ✅ หรือ
const hasher = new PasswordHasher(); // ✅ สั้นกว่า
```

---

## 4. Schema & Model Conventions

### A. Schema Files

```javascript
// ❌ เดิม - ชื่อไฟล์
models/User.js                  // PascalCase
models/Application.js

// ✅ ใหม่ - Apple style
models/
  ├── user.js                   // ✅ lowercase
  ├── user.schema.js            // ✅ แยก schema
  ├── application.js
  └── application.schema.js
```

### B. Schema Definition Style

```javascript
// ❌ เดิม - C#/Java style
const UserSchema = new mongoose.Schema({
  userName: String,
  emailAddress: String,
  passwordHash: String,
});

// ✅ ใหม่ - Apple/Swift style (snake_case สำหรับ DB)
const UserSchema = new mongoose.Schema({
  username: String, // ✅ single word
  email: String, // ✅ ไม่ต้อง "address"
  password_hash: String, // ✅ snake_case (database convention)
  created_at: Date, // ✅ timestamp
  updated_at: Date,
});

// 🎯 Or use camelCase throughout (JS convention)
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String, // ✅ camelCase
  createdAt: Date,
  updatedAt: Date,
});
```

### C. Model Export

```javascript
// ❌ เดิม
module.exports = mongoose.model('User', UserSchema);

// ✅ ใหม่ - named export (modern JS)
const User = mongoose.model('User', UserSchema);
module.exports = { User, UserSchema };

// ✅ หรือ ES6
export const User = mongoose.model('User', UserSchema);
export { UserSchema };
```

---

## 5. Migration Plan

### Phase 1: Quick Wins (ไม่กระทบการทำงาน)

#### 1.1 Rename Container Files

```bash
# ก่อน
module.container.js

# หลัง (แนวทาง 1)
container.js

# หรือ (แนวทาง 2)
auth-farmer.container.js
```

**ผลกระทบ:** แก้ไข import ใน index.js เท่านั้น

#### 1.2 Rename Controller Files

```bash
# ก่อน
presentation/controllers/AuthController.js

# หลัง
controllers/auth.js
```

**ผลกระทบ:** แก้ไข import ใน routes และ container

#### 1.3 Simplify Service Names

```bash
# ก่อน
infrastructure/security/BcryptPasswordHasher.js
infrastructure/security/JWTService.js

# หลัง
services/password.js
services/token.js
```

### Phase 2: Directory Restructure (ค่อย ๆ ทำ)

```bash
# ย้ายไฟล์ระหว่าง directories
infrastructure/database/ → repositories/
infrastructure/security/ → services/
presentation/controllers/ → controllers/
```

### Phase 3: Schema Standardization

```bash
# แก้ไข schema ทั้งหมดให้ใช้รูปแบบเดียวกัน
# เลือกระหว่าง camelCase หรือ snake_case
# แนะนำ: camelCase (เพราะเป็น JS convention)
```

---

## 6. Prettier Configuration

### ✅ .prettierrc.json (Apple/Airbnb style)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### ✅ ESLint Configuration

```json
{
  "extends": ["airbnb-base", "prettier"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "prefer-const": "error",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "camelcase": ["error", { "properties": "never" }]
  }
}
```

---

## 7. ตัวอย่างการ Refactor

### ก่อน (Clean Architecture - Java style)

```javascript
// module.container.js
const MongoDBUserRepository = require('./infrastructure/database/MongoDBUserRepository');
const BcryptPasswordHasher = require('./infrastructure/security/BcryptPasswordHasher');
const JWTService = require('./infrastructure/security/JWTService');
const RegisterUserUseCase = require('./application/use-cases/RegisterUserUseCase');
const AuthController = require('./presentation/controllers/AuthController');

function createAuthModule() {
  const userRepository = new MongoDBUserRepository(mongoose.connection);
  const passwordHasher = new BcryptPasswordHasher();
  const jwtService = new JWTService(process.env.JWT_SECRET);

  const registerUser = new RegisterUserUseCase(userRepository, passwordHasher);
  const controller = new AuthController(registerUser);

  return { controller, router: createAuthRouter(controller) };
}
```

### หลัง (Apple/iOS style)

```javascript
// container.js
const UserRepository = require('./repositories/user');
const PasswordHasher = require('./services/password');
const TokenService = require('./services/token');
const { register, login } = require('./use-cases');
const createController = require('./controllers/auth');

function createModule(db) {
  // Services
  const users = new UserRepository(db);
  const hasher = new PasswordHasher();
  const tokens = new TokenService(process.env.JWT_SECRET);

  // Use cases
  const useCases = {
    register: register(users, hasher),
    login: login(users, hasher, tokens),
  };

  // Controller & Router
  const controller = createController(useCases);
  const router = require('./routes/auth')(controller);

  return { controller, router };
}

module.exports = createModule;
```

---

## 8. สรุป Best Practices

### ✅ DO (ทำ)

1. ✅ ใช้ `kebab-case` สำหรับชื่อไฟล์ทั้งหมด
2. ✅ ใช้ชื่อสั้น กระชับ ตรงประเด็น
3. ✅ เน้นหน้าที่ (what) ไม่เน้น implementation (how)
4. ✅ ใช้ camelCase สำหรับ variables และ functions
5. ✅ แยก schema ออกจาก model
6. ✅ ใช้ named exports แทน default
7. ✅ จัดกลุ่มไฟล์ตาม feature ไม่ใช่ layer
8. ✅ ใช้ Prettier + ESLint

### ❌ DON'T (ไม่ทำ)

1. ❌ ไม่ใช้ PascalCase สำหรับชื่อไฟล์
2. ❌ ไม่ใส่ชื่อ technology ในชื่อ class/file (MongoDB, Bcrypt, JWT)
3. ❌ ไม่ใช้ prefix เช่น I, Abstract, Base
4. ❌ ไม่ซ้อน folder ลึกเกิน 3 ชั้น
5. ❌ ไม่ใช้ชื่อทั่ว ๆ ไป เช่น module.container.js
6. ❌ ไม่ผสม naming conventions (camelCase + snake_case + PascalCase)

---

## 9. Checklist การ Migrate

### โมดูล auth-farmer

- [ ] เปลี่ยน `module.container.js` → `container.js`
- [ ] เปลี่ยน `AuthController.js` → `auth.js`
- [ ] เปลี่ยน `MongoDBUserRepository.js` → `user.js`
- [ ] เปลี่ยน `BcryptPasswordHasher.js` → `password.js`
- [ ] เปลี่ยน `JWTService.js` → `token.js`
- [ ] ย้าย `infrastructure/database/` → `repositories/`
- [ ] ย้าย `infrastructure/security/` → `services/`
- [ ] ย้าย `presentation/controllers/` → `controllers/`
- [ ] อัพเดท imports ทั้งหมด
- [ ] รัน Prettier
- [ ] ทดสอบ

### โมดูลอื่น ๆ (12 โมดูล)

- [ ] certificate-management
- [ ] farm-management
- [ ] cannabis-survey
- [ ] document
- [ ] notification
- [ ] dashboard
- [ ] training
- [ ] report
- [ ] track-trace
- [ ] survey-system
- [ ] auth-dtam
- [ ] audit

---

## 10. เครื่องมือช่วย

### Script สำหรับ Rename (PowerShell)

```powershell
# Rename module.container.js to container.js
Get-ChildItem -Recurse -Filter "module.container.js" | Rename-Item -NewName "container.js"

# Rename *Controller.js to lowercase
Get-ChildItem -Recurse -Filter "*Controller.js" | ForEach-Object {
    $newName = $_.Name -replace 'Controller\.js$', '.js' -replace '([A-Z])', '-$1' `
        -replace '^-', '' -replace '--', '-'
    Rename-Item $_.FullName -NewName $newName.ToLower()
}
```

### Prettier CLI

```bash
# Format ทั้ง project
npx prettier --write "apps/backend/**/*.js"

# Format เฉพาะ module
npx prettier --write "apps/backend/modules/auth-farmer/**/*.js"

# Check only
npx prettier --check "apps/backend/**/*.js"
```

---

**ผู้เขียน:** GitHub Copilot  
**อ้างอิง:**

- Apple Human Interface Guidelines
- Swift API Design Guidelines
- Airbnb JavaScript Style Guide
- Google JavaScript Style Guide
- Clean Code by Robert C. Martin

**สถานะ:** ✅ พร้อมใช้งาน - เริ่มได้ทันที
