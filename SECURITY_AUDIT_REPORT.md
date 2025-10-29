# 🔒 Security Audit Report - GACP Platform

**วันที่:** 26 ตุลาคม 2025  
**ผู้ตรวจสอบ:** Security Audit Team  
**เวอร์ชัน:** 2.0.0  
**สถานะ:** ⚠️ พบปัญหาความปลอดภัยที่ต้องแก้ไข

---

## 📊 สรุปผลการตรวจสอบ

| หมวดหมู่                           | สถานะ           | ความเสี่ยง   | จำนวนปัญหา |
| ---------------------------------- | --------------- | ------------ | ---------- |
| **Authentication & Authorization** | ⚠️ ต้องปรับปรุง | Medium-High  | 5          |
| **Data Protection**                | ✅ ดี           | Low          | 2          |
| **API Security**                   | ⚠️ ต้องปรับปรุง | Medium       | 4          |
| **Input Validation**               | ✅ ดีมาก        | Low          | 1          |
| **Session Management**             | ✅ ดี           | Low          | 1          |
| **Secrets Management**             | 🔴 วิกฤต        | **Critical** | **3**      |
| **CORS & Headers**                 | ✅ ดี           | Low          | 1          |
| **File Upload Security**           | ✅ ดี           | Low          | 0          |
| **Dependency Security**            | ⚠️ ต้องตรวจสอบ  | Medium       | TBD        |

**คะแนนรวม:** 72/100 (ผ่านแต่ต้องปรับปรุง)

---

## 🔴 ปัญหาวิกฤต (Critical Issues)

### 1. **JWT Secrets ที่ไม่ปลอดภัยใน Production**

**ระดับความเสี่ยง:** 🔴 **CRITICAL**

**ปัญหา:**

```bash
# พบ JWT secrets ใน .env.production (ไม่ควร commit!)
JWT_SECRET=gacpSecretKey2025ThailandSecure123456789abcdefghijklmnop
```

**ผลกระทบ:**

- ใครก็ตามที่เข้าถึง GitHub repository สามารถ decode JWT tokens ทั้งหมด
- Attacker สามารถสร้าง fake tokens และปลอมตัวเป็น user ใดก็ได้
- ข้อมูล session ของทุกคนถูกเปิดเผย

**แนวทางแก้ไข:**

```bash
# 1. ลบ .env.production ออกจาก Git ทันที
git rm --cached .env.production
echo ".env.production" >> .gitignore

# 2. สร้าง secret ใหม่ทันที
openssl rand -base64 64

# 3. อัปเดต production secrets บน server
# 4. Force logout ผู้ใช้ทั้งหมดและ revoke tokens เก่า
```

**Priority:** 🚨 **แก้ไขทันที (ภายใน 24 ชม.)**

---

### 2. **Weak JWT Secret ใน Development**

**ระดับความเสี่ยง:** 🔴 **CRITICAL** (ถ้านำไป production)

**ปัญหา:**

```javascript
// apps/backend/.env
JWT_SECRET=development-jwt-secret-key-not-for-production

// Fallback ในโค้ด (security.js)
secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex')
```

**ผลกระทบ:**

- Secret สั้นและคาดเดาง่าย
- มี fallback ที่สร้าง random secret = ทุก restart server จะเปลี่ยน secret = logout users ทั้งหมด

**แนวทางแก้ไข:**

```javascript
// ✅ แก้ไข: ห้าม fallback และ validate length
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

if (jwtSecret.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters');
}

// ห้ามใช้ weak secrets
const WEAK_SECRETS = [
  'development-jwt-secret-key-not-for-production',
  'sprint1-jwt-secret-key-min-32-characters-change-in-prod-2025',
  'gacpSecretKey2025ThailandSecure123456789abcdefghijklmnop'
];

if (WEAK_SECRETS.includes(jwtSecret)) {
  throw new Error('Weak or default JWT_SECRET detected. Generate a strong secret.');
}
```

**Priority:** 🚨 **แก้ไขทันที**

---

### 3. **ไม่มี Secret Rotation Policy**

**ระดับความเสี่ยง:** 🟠 **HIGH**

**ปัญหา:**

- ไม่มีระบบหมุนเวียน JWT secrets
- ถ้า secret รั่ว ไม่สามารถ revoke ได้ง่าย
- Token ไม่ได้ถูก invalidate เมื่อ secret เปลี่ยน

**แนวทางแก้ไข:**

```javascript
// JWT Versioning Strategy
const JWT_VERSIONS = {
  v1: process.env.JWT_SECRET_V1, // Current
  v2: process.env.JWT_SECRET_V2 // Next (optional)
};

function signToken(payload) {
  return jwt.sign({ ...payload, version: 'v1' }, JWT_VERSIONS.v1, { expiresIn: '15m' });
}

function verifyToken(token) {
  const decoded = jwt.decode(token);
  const version = decoded?.version || 'v1';

  return jwt.verify(token, JWT_VERSIONS[version]);
}

// Migration: ค่อยๆ ย้ายจาก v1 → v2 ภายใน grace period
```

**Priority:** 🟡 **แก้ไขภายใน 1 สัปดาห์**

---

## 🟠 ปัญหาสำคัญ (High Priority Issues)

### 4. **ไม่มี Rate Limiting บน Critical Endpoints**

**ระดับความเสี่ยง:** 🟠 **HIGH**

**ปัญหา:**

```javascript
// พบ rate limiting configuration แต่ไม่แน่ใจว่าถูก apply ทั้งหมด
authRateLimiting: {
  windowMs: 15 * 60 * 1000,
  max: 5, // ✅ ดี - จำกัด 5 attempts
}

// แต่ต้องตรวจสอบว่า apply บน:
// - /api/auth/login ✅
// - /api/auth/register ✅
// - /api/auth/forgot-password ❓
// - /api/auth/reset-password ❓
```

**แนวทางแก้ไข:**

```javascript
// ต้อง apply rate limiting บน AAALLLL auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to ALL auth routes
router.post('/auth/login', authLimiter, authController.login);
router.post('/auth/register', authLimiter, authController.register);
router.post('/auth/forgot-password', authLimiter, authController.forgotPassword);
router.post('/auth/reset-password', authLimiter, authController.resetPassword);
router.post('/auth/refresh', authLimiter, authController.refreshToken);
```

**Priority:** 🟠 **แก้ไขภายใน 3 วัน**

---

### 5. **Password Complexity ไม่เพียงพอ**

**ระดับความเสี่ยง:** 🟠 **HIGH**

**ปัญหา:**

```javascript
// Regex pattern มีแต่ไม่มีความยาวขั้นต่ำที่ชัดเจน
password: {
  validator: value => {
    return (
      value.length >= 8 &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)
    );
  },
}
```

**ปัญหาเพิ่มเติม:**

- ไม่มีการตรวจสอบ common passwords
- ไม่มีการตรวจสอบ password history (ห้ามใช้ password เดิม)
- ไม่มี password expiry (60-90 วันควรเปลี่ยน)

**แนวทางแก้ไข:**

```javascript
const commonPasswords = require('common-passwords-list');

function validatePassword(password, user) {
  // 1. Length requirement
  if (password.length < 12) { // เพิ่มจาก 8 → 12
    return { valid: false, error: 'Password must be at least 12 characters' };
  }

  // 2. Complexity requirement
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return {
      valid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character'
    };
  }

  // 3. Common password check
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common' };
  }

  // 4. Personal info check
  if (password.toLowerCase().includes(user.name.toLowerCase()) ||
      password.toLowerCase().includes(user.email.split('@')[0].toLowerCase())) {
    return { valid: false, error: 'Password cannot contain personal information' };
  }

  // 5. Password history check (last 5 passwords)
  const hashedPasswords = user.passwordHistory || [];
  for (const hash of hashedPasswords) {
    if (await bcrypt.compare(password, hash)) {
      return { valid: false, error: 'Cannot reuse recent passwords' };
    }
  }

  return { valid: true };
}
```

**Priority:** 🟠 **แก้ไขภายใน 1 สัปดาห์**

---

### 6. **ไม่มี Account Lockout หลัง Failed Attempts**

**ระดับความเสี่ยง:** 🟠 **HIGH**

**ปัญหา:**

```javascript
// พบโค้ดที่ตรวจสอบ account locked
if (user.accountLocked && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
  // Handle locked account
}

// แต่ไม่เห็นโค้ดที่ INCREMENT failed login attempts
```

**แนวทางแก้ไข:**

```javascript
// ใน UserSchema
const UserSchema = new mongoose.Schema({
  loginAttempts: { type: Number, default: 0 },
  accountLocked: { type: Boolean, default: false },
  accountLockedUntil: Date,
  accountLockedReason: String,
});

// Login Controller
async login(email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Check if account is locked
  if (user.accountLocked && user.accountLockedUntil > new Date()) {
    const remaining = Math.ceil((user.accountLockedUntil - new Date()) / 1000 / 60);
    return {
      success: false,
      error: `Account locked. Try again in ${remaining} minutes`,
      code: 'ACCOUNT_LOCKED'
    };
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    // Increment failed attempts
    user.loginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.accountLocked = true;
      user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
      user.accountLockedReason = 'Too many failed login attempts';

      await user.save();

      // Send email alert
      await sendEmail({
        to: user.email,
        subject: 'Account Locked - Security Alert',
        template: 'account-locked',
        data: { user, unlockTime: user.accountLockedUntil }
      });

      return {
        success: false,
        error: 'Account locked due to too many failed attempts',
        code: 'ACCOUNT_LOCKED'
      };
    }

    await user.save();

    return {
      success: false,
      error: `Invalid credentials. ${5 - user.loginAttempts} attempts remaining`,
      attemptsRemaining: 5 - user.loginAttempts
    };
  }

  // Success - reset login attempts
  user.loginAttempts = 0;
  user.accountLocked = false;
  user.accountLockedUntil = null;
  user.lastLogin = new Date();
  await user.save();

  return { success: true, user, token: generateToken(user) };
}
```

**Priority:** 🟠 **แก้ไขภายใน 3 วัน**

---

### 7. **Missing HTTPS Enforcement**

**ระดับความเสี่ยง:** 🟠 **HIGH**

**ปัญหา:**

- ไม่มีโค้ดบังคับให้ใช้ HTTPS ใน production
- Cookie ไม่ได้ตั้ง `secure: true`
- ไม่มี HSTS header

**แนวทางแก้ไข:**

```javascript
// 1. Force HTTPS redirect
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    !req.secure &&
    req.get('x-forwarded-proto') !== 'https'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// 2. Secure cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // ✅ HTTPS only
      httpOnly: true, // ✅ ป้องกัน XSS
      sameSite: 'strict', // ✅ ป้องกัน CSRF
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// 3. HSTS Header
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  })
);
```

**Priority:** 🟠 **แก้ไขก่อน deploy production**

---

## 🟡 ปัญหาปานกลาง (Medium Priority Issues)

### 8. **SQL Injection ในระบบ MongoDB**

**ระดับความเสี่ยง:** 🟡 **MEDIUM**

**ปัญหา:**
แม้จะใช้ MongoDB (NoSQL) แต่ก็ยังมีความเสี่ยง NoSQL Injection

```javascript
// ⚠️ ไม่ปลอดภัย
const user = await User.findOne({ email: req.body.email });

// ถ้า attacker ส่ง: { "email": { "$ne": null } }
// จะ return user คนแรกที่เจอ!
```

**ตรวจสอบพบ:**
✅ มี `express-mongo-sanitize` middleware แล้ว

```javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize()); // ✅ ดี - removes $ and . from input
```

**แนวทางปรับปรุง:**

```javascript
// เพิ่ม validation ให้เข้มงวดขึ้น
const mongoSanitize = require('express-mongo-sanitize');

app.use(
  mongoSanitize({
    replaceWith: '_', // Replace $ and . with _
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized key: ${key} in request from ${req.ip}`);
      // Log suspicious activity
    }
  })
);

// Validate input types explicitly
function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  return validator.isEmail(email);
}
```

**Priority:** 🟡 **แก้ไขภายใน 2 สัปดาห์**

---

### 9. **XSS Protection**

**ระดับความเสี่ยง:** 🟡 **MEDIUM**

**ตรวจสอบพบ:**
✅ มี `xss-clean` middleware แล้ว

```javascript
const xss = require('xss-clean');
app.use(xss()); // ✅ ดี - sanitizes user input
```

**แนวทางปรับปรุง:**

```javascript
// เพิ่ม Content-Security-Policy header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // ⚠️ ลด unsafe-inline ให้ได้
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.yourdomain.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  })
);

// Sanitize output เมื่อแสดง user content
const DOMPurify = require('isomorphic-dompurify');

function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
}
```

**Priority:** 🟡 **แก้ไขภายใน 2 สัปดาห์**

---

### 10. **CORS Configuration**

**ระดับความเสี่ยง:** 🟡 **MEDIUM**

**ตรวจสอบพบ:**

```javascript
cors: {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173']; // ⚠️ Fallback ไม่ดี

    if (!origin) return callback(null, true); // ⚠️ Allow no-origin
    // ...
  }
}
```

**ปัญหา:**

- มี fallback เป็น localhost (ไม่ควรมีใน production)
- Allow requests without origin (ไม่ปลอดภัย)

**แนวทางแก้ไข:**

```javascript
cors: {
  origin: function (origin, callback) {
    // ✅ ห้าม fallback
    if (!process.env.ALLOWED_ORIGINS) {
      throw new Error('ALLOWED_ORIGINS must be set in production');
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

    // ✅ Strict origin checking
    if (!origin) {
      // Only allow no-origin in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Origin required'));
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Log suspicious access
      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}
```

**Priority:** 🟡 **แก้ไขภายใน 1 สัปดาห์**

---

### 11. **File Upload Validation**

**ระดับความเสี่ยง:** 🟡 **MEDIUM**

**ตรวจสอบพบ:**

```javascript
fileUpload: {
  maxFileSize: 10 * 1024 * 1024, // 10MB ✅ ดี
  allowedMimeTypes: [...], // ✅ ดี
  virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true', // ⚠️ Optional
}
```

**แนวทางปรับปรุง:**

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// 1. Secure filename
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Generate random filename (ป้องกัน path traversal)
    const uniqueName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueName}${ext}`);
  }
});

// 2. File type validation (magic bytes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }

  // TODO: Validate magic bytes (not just MIME type)
  // ไม่ควรเชื่อ MIME type อย่างเดียว

  cb(null, true);
};

// 3. Virus scanning (ClamAV)
const NodeClam = require('clamscan');
const clamscan = new NodeClam().init();

async function scanFile(filePath) {
  const { isInfected, viruses } = await clamscan.isInfected(filePath);

  if (isInfected) {
    fs.unlinkSync(filePath); // Delete infected file
    throw new Error(`Virus detected: ${viruses.join(', ')}`);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
```

**Priority:** 🟡 **แก้ไขภายใน 2 สัปดาห์**

---

## ✅ จุดเด่นด้านความปลอดภัย (Security Strengths)

### 1. **Password Hashing**

✅ ใช้ bcrypt with 12 rounds (ดีมาก)

```javascript
const saltRounds = 12; // ✅ ตามมาตรฐาน OWASP
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 2. **JWT Token Expiry**

✅ Access token: 15 นาที (ดี)
✅ Refresh token: 7 วัน (ยอมรับได้)

### 3. **Helmet Security Headers**

✅ มีการใช้ helmet middleware ครบถ้วน

### 4. **Input Sanitization**

✅ มี express-mongo-sanitize
✅ มี xss-clean
✅ มี hpp (HTTP Parameter Pollution protection)

### 5. **Rate Limiting**

✅ มีการกำหนด rate limits หลายระดับ

- General: 100 req/15min
- API: 50 req/15min
- Auth: 5 req/15min

---

## 📋 แผนการแก้ไข (Action Plan)

### Phase 1: Critical Fixes (ภายใน 24 ชม.)

- [ ] ลบ `.env.production` ออกจาก Git
- [ ] สร้าง JWT secrets ใหม่ทั้งหมด
- [ ] Force logout users ทั้งหมด
- [ ] Deploy secrets ใหม่บน production server

### Phase 2: High Priority (ภายใน 1 สัปดาห์)

- [ ] เพิ่ม JWT secret validation (length + weak check)
- [ ] เพิ่ม account lockout mechanism
- [ ] ปรับปรุง password complexity requirements
- [ ] เพิ่ม password history check
- [ ] Enforce HTTPS และ secure cookies
- [ ] ปรับปรุง CORS configuration

### Phase 3: Medium Priority (ภายใน 2 สัปดาห์)

- [ ] เพิ่ม rate limiting บน endpoints ที่ขาด
- [ ] ปรับปรุง file upload validation (magic bytes)
- [ ] เพิ่ม virus scanning (ClamAV)
- [ ] Implement JWT rotation policy
- [ ] เพิ่ม security logging และ alerting

### Phase 4: Monitoring & Testing (ภายใน 1 เดือน)

- [ ] ตั้งค่า security monitoring (Sentry/DataDog)
- [ ] เพิ่ม automated security tests
- [ ] Penetration testing
- [ ] Dependency audit (npm audit, Snyk)
- [ ] Security training สำหรับทีม

---

## 🔍 เครื่องมือแนะนำ

### 1. **Dependency Scanning**

```bash
# npm audit
npm audit --production

# Snyk
npm install -g snyk
snyk test
snyk monitor

# OWASP Dependency Check
dependency-check --project gacp-platform --scan ./
```

### 2. **Static Code Analysis**

```bash
# ESLint Security Plugin
npm install --save-dev eslint-plugin-security

# Semgrep
semgrep --config=p/security-audit ./apps/backend
```

### 3. **Runtime Protection**

```bash
# Helmet (already using ✅)
# express-rate-limit (already using ✅)
# express-mongo-sanitize (already using ✅)

# เพิ่ม:
npm install express-validator
npm install hpp
npm install cors
```

### 4. **Secret Management**

```bash
# Vault (Hashicorp)
# AWS Secrets Manager
# Azure Key Vault

# สำหรับ development: dotenv-vault
npm install dotenv-vault
```

---

## 📊 Security Checklist

### Authentication & Authorization

- [x] Password hashing (bcrypt 12 rounds)
- [⚠️] JWT secret management (ต้องแก้ไข)
- [x] Token expiry (15m/7d)
- [⚠️] Account lockout (ต้องเพิ่ม)
- [⚠️] Password complexity (ต้องปรับปรุง)
- [ ] Multi-factor authentication (MFA)
- [x] Role-based access control (RBAC)

### Data Protection

- [x] Data encryption at rest (MongoDB)
- [⚠️] HTTPS enforcement (ต้องเพิ่ม)
- [x] Secure cookie settings (ใช้ได้ดี)
- [x] Input sanitization (XSS, NoSQL injection)

### API Security

- [x] Rate limiting (implemented)
- [⚠️] CORS configuration (ต้องปรับปรุง)
- [x] Helmet headers (implemented)
- [⚠️] API versioning (ควรเพิ่ม)
- [ ] GraphQL security (if applicable)

### Infrastructure

- [⚠️] Secrets management (critical issue)
- [ ] Container security (Docker)
- [ ] Network segmentation
- [ ] Firewall rules (in progress)
- [ ] DDoS protection

### Monitoring & Logging

- [ ] Security event logging
- [ ] Real-time alerting
- [ ] Audit trail
- [ ] Intrusion detection
- [ ] Performance monitoring

---

## 📈 คะแนนรวมและข้อเสนอแนะ

**คะแนนปัจจุบัน:** 72/100

**ระดับความปลอดภัย:** ⚠️ **ผ่านแต่ต้องปรับปรุงเร่งด่วน**

**ข้อเสนอแนะสำคัญ:**

1. 🔴 **ไม่ควร deploy production จนกว่าจะแก้ critical issues**
2. 🟠 **ควรมี security audit เป็นประจำทุก 3-6 เดือน**
3. 🟡 **ทีม dev ควรได้รับ security training**
4. ✅ **ระบบมี foundation ที่ดี แค่ต้องปรับแต่งให้เข้มงวดขึ้น**

**Timeline แนะนำ:**

- Critical fixes: 1-2 วัน
- High priority: 1 สัปดาห์
- Medium priority: 2-3 สัปดาห์
- **รวม: 3-4 สัปดาห์จนถึง production-ready**

---

**หมายเหตุ:** รายงานนี้อิงจาก static code analysis และ configuration review ณ วันที่ 26 ตุลาคม 2025  
**ขั้นตอนถัดไป:** Penetration testing และ dynamic analysis หลังแก้ไข critical issues
