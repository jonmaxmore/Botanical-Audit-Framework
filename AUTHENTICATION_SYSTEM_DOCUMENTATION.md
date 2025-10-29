# Authentication System Documentation

**Platform:** GACP Botanical Audit Framework  
**Type:** Real Authentication Implementation (Not Mock/Simulation)  
**Last Updated:** 2025-01-15

---

## 🔐 Overview

The platform uses a **fully functional authentication system** — not a mockup or simulation. All login and session flows are implemented with real authentication logic, JWT-based security, and user data stored in the production database.

---

## ✅ Key Characteristics

| Feature | Implementation |
|---------|----------------|
| 🔐 **Real Authentication Logic** | Implemented via Node.js/Express backend |
| 🧩 **Role-Based Access Control (RBAC)** | Separate roles for Farmer, Inspector, Reviewer, Approver, Admin |
| 🪪 **Credential-Based Login** | Username/password validated against hashed credentials in MongoDB |
| 💾 **Persistent User Profiles** | All users stored as real database records |
| 🧠 **Realistic Test Data** | Generated data stored exactly like real registrations |
| 🧾 **Session Management** | JWT tokens with separate secrets for Farmer and DTAM staff |
| 🧰 **Security Integration** | AWS Secrets Manager for auth keys and environment variables |

---

## 🏗️ System Architecture

### Authentication Components

| Component | Description | Endpoint |
|-----------|-------------|----------|
| **Farmer Auth Service** | Registration, login, JWT creation for farmers | `/api/auth/farmer/*` |
| **DTAM Auth Service** | Login, JWT creation for internal staff | `/api/auth/dtam/*` |
| **User Data Storage** | MongoDB collections: users, roles, farms | `users` collection |
| **Session Validation** | Middleware checks JWT in Authorization header | All protected routes |
| **Password Security** | bcrypt hashing with salt rounds | Backend service |
| **Token Management** | JWT with expiration and refresh tokens | Redis cache |

---

## 🔑 Authentication Flows

### 1. Farmer Registration & Login

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Farmer    │      │   Frontend   │      │   Backend    │
│   Portal    │      │   (Next.js)  │      │  (Express)   │
└──────┬──────┘      └──────┬───────┘      └──────┬───────┘
       │                    │                      │
       │  1. Register Form  │                      │
       ├───────────────────>│                      │
       │                    │  2. POST /api/auth/  │
       │                    │     farmer/register  │
       │                    ├─────────────────────>│
       │                    │                      │ 3. Hash password
       │                    │                      │    (bcrypt)
       │                    │                      │
       │                    │                      │ 4. Save to MongoDB
       │                    │                      │    users collection
       │                    │                      │
       │                    │  5. Return success   │
       │                    │<─────────────────────┤
       │  6. Show success   │                      │
       │<───────────────────┤                      │
       │                    │                      │
       │  7. Login Form     │                      │
       ├───────────────────>│                      │
       │                    │  8. POST /api/auth/  │
       │                    │     farmer/login     │
       │                    ├─────────────────────>│
       │                    │                      │ 9. Verify password
       │                    │                      │    (bcrypt.compare)
       │                    │                      │
       │                    │                      │ 10. Generate JWT
       │                    │                      │     (jsonwebtoken)
       │                    │                      │
       │                    │  11. Return JWT +    │
       │                    │      user data       │
       │                    │<─────────────────────┤
       │                    │ 12. Store in         │
       │                    │     localStorage     │
       │  13. Redirect to   │                      │
       │      Dashboard     │                      │
       │<───────────────────┤                      │
```

### 2. DTAM Staff Login

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│    Admin    │      │   Frontend   │      │   Backend    │
│   Portal    │      │   (Next.js)  │      │  (Express)   │
└──────┬──────┘      └──────┬───────┘      └──────┬───────┘
       │                    │                      │
       │  1. Login Form     │                      │
       ├───────────────────>│                      │
       │                    │  2. POST /api/auth/  │
       │                    │     dtam/login       │
       │                    ├─────────────────────>│
       │                    │                      │ 3. Verify credentials
       │                    │                      │    + role check
       │                    │                      │
       │                    │                      │ 4. Generate JWT
       │                    │                      │    (separate secret)
       │                    │                      │
       │                    │  5. Return JWT +     │
       │                    │     user + role      │
       │                    │<─────────────────────┤
       │                    │ 6. Store tokens      │
       │  7. Redirect based │                      │
       │     on role        │                      │
       │<───────────────────┤                      │
```

---

## 💾 Database Structure

### Users Collection

```javascript
{
  "_id": ObjectId("..."),
  "username": "farmer001",
  "email": "farmer001@example.com",
  "passwordHash": "$2b$10$T3...", // bcrypt hashed
  "role": "farmer", // farmer | reviewer | inspector | approver | admin
  "fullName": "นายสมชาย ใจดี",
  "nationalId": "1234567890123",
  "phoneNumber": "0812345678",
  "address": {
    "province": "เชียงใหม่",
    "district": "เมือง",
    "subdistrict": "ช้างเผือก",
    "postalCode": "50300"
  },
  "status": "active", // active | inactive | suspended
  "createdAt": ISODate("2025-01-15T00:00:00Z"),
  "updatedAt": ISODate("2025-01-15T00:00:00Z"),
  "lastLogin": ISODate("2025-01-15T10:30:00Z"),
  "emailVerified": true,
  "phoneVerified": true
}
```

### Roles Collection

```javascript
{
  "_id": ObjectId("..."),
  "name": "farmer",
  "displayName": "เกษตรกร",
  "permissions": [
    "application:create",
    "application:read:own",
    "application:update:own",
    "farm:create",
    "farm:read:own",
    "certificate:read:own"
  ],
  "description": "Farmer role with basic permissions"
}
```

---

## 🔒 Security Implementation

### 1. Password Hashing

```javascript
// Backend: apps/backend/modules/auth-farmer/services/auth.service.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### 2. JWT Token Generation

```javascript
// Backend: apps/backend/middleware/jwt-token-manager.js
const jwt = require('jsonwebtoken');

function generateToken(user, type = 'farmer') {
  const secret = type === 'farmer' 
    ? process.env.JWT_SECRET_FARMER 
    : process.env.JWT_SECRET_DTAM;
  
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: type
    },
    secret,
    { expiresIn: '24h' }
  );
}
```

### 3. Token Validation Middleware

```javascript
// Backend: apps/backend/middleware/auth.js
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, getSecret(req), (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

### 4. Role-Based Access Control

```javascript
// Backend: apps/backend/middleware/auth.js
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

// Usage:
router.get('/applications', 
  authenticateToken, 
  requireRole('reviewer', 'inspector', 'approver'),
  getApplications
);
```

---

## 🔐 API Endpoints

### Farmer Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/farmer/register` | Register new farmer | No |
| POST | `/api/auth/farmer/login` | Farmer login | No |
| POST | `/api/auth/farmer/logout` | Farmer logout | Yes |
| POST | `/api/auth/farmer/refresh` | Refresh JWT token | Yes |
| GET | `/api/auth/farmer/profile` | Get farmer profile | Yes |
| PUT | `/api/auth/farmer/profile` | Update farmer profile | Yes |
| POST | `/api/auth/farmer/change-password` | Change password | Yes |
| POST | `/api/auth/farmer/forgot-password` | Request password reset | No |
| POST | `/api/auth/farmer/reset-password` | Reset password with token | No |

### DTAM Staff Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/dtam/login` | DTAM staff login | No |
| POST | `/api/auth/dtam/logout` | DTAM staff logout | Yes |
| POST | `/api/auth/dtam/refresh` | Refresh JWT token | Yes |
| GET | `/api/auth/dtam/profile` | Get staff profile | Yes |
| POST | `/api/auth/dtam/change-password` | Change password | Yes |

---

## 🎭 User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────┐
│              Admin                      │
│  (Full system access)                   │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│   Approver   │  │   Inspector   │
│ (Final cert) │  │ (Field check) │
└───────┬──────┘  └──────┬────────┘
        │                │
        └────────┬───────┘
                 │
        ┌────────▼────────┐
        │    Reviewer     │
        │ (Doc review)    │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │     Farmer      │
        │ (Application)   │
        └─────────────────┘
```

### Permission Matrix

| Permission | Farmer | Reviewer | Inspector | Approver | Admin |
|------------|--------|----------|-----------|----------|-------|
| Create Application | ✅ | ❌ | ❌ | ❌ | ✅ |
| View Own Application | ✅ | ❌ | ❌ | ❌ | ✅ |
| View All Applications | ❌ | ✅ | ✅ | ✅ | ✅ |
| Review Documents | ❌ | ✅ | ❌ | ❌ | ✅ |
| Schedule Inspection | ❌ | ❌ | ✅ | ❌ | ✅ |
| Conduct Inspection | ❌ | ❌ | ✅ | ❌ | ✅ |
| Approve Certificate | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 Test Accounts

### Farmer Accounts

```javascript
// Username: farmer001@test.com
// Password: Farmer123!
// Role: farmer
// Status: active

// Username: farmer002@test.com
// Password: Farmer123!
// Role: farmer
// Status: active
```

### DTAM Staff Accounts

```javascript
// Admin
// Username: admin@gacp.th
// Password: admin123
// Role: admin

// Reviewer
// Username: reviewer@gacp.th
// Password: reviewer123
// Role: reviewer

// Inspector
// Username: inspector@gacp.th
// Password: inspector123
// Role: inspector

// Approver
// Username: approver@gacp.th
// Password: approver123
// Role: approver
```

---

## 🔄 Session Management

### Token Storage

**Frontend (Farmer Portal):**
```javascript
// Store in localStorage
localStorage.setItem('farmer_token', token);
localStorage.setItem('farmer_user', JSON.stringify(user));

// Retrieve
const token = localStorage.getItem('farmer_token');
const user = JSON.parse(localStorage.getItem('farmer_user'));
```

**Frontend (Admin Portal):**
```javascript
// Store in localStorage
localStorage.setItem('admin_token', token);
localStorage.setItem('dtam_token', token);
localStorage.setItem('admin_user', JSON.stringify(user));
```

### Token Expiration

- **Access Token:** 24 hours
- **Refresh Token:** 7 days
- **Auto-refresh:** 1 hour before expiration

### Logout Flow

```javascript
// Frontend
async function logout() {
  const token = localStorage.getItem('farmer_token');
  
  // Call backend logout endpoint
  await fetch('/api/auth/farmer/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Clear local storage
  localStorage.removeItem('farmer_token');
  localStorage.removeItem('farmer_user');
  
  // Redirect to login
  router.push('/login');
}
```

---

## 🛡️ Security Features

### 1. Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 2. Rate Limiting

```javascript
// Login attempts: 5 per 15 minutes per IP
// Registration: 3 per hour per IP
// Password reset: 3 per hour per email
```

### 3. Account Lockout

- After 5 failed login attempts
- Locked for 30 minutes
- Email notification sent

### 4. Two-Factor Authentication (2FA)

- Optional for farmers
- Required for DTAM staff
- TOTP-based (Google Authenticator compatible)

### 5. Audit Logging

All authentication events logged:
- Login attempts (success/failure)
- Logout events
- Password changes
- Role changes
- Permission changes

---

## 📊 Monitoring & Analytics

### Authentication Metrics

- Total users by role
- Active sessions
- Login success rate
- Failed login attempts
- Average session duration
- Password reset requests

### Security Alerts

- Multiple failed login attempts
- Suspicious login patterns
- Unauthorized access attempts
- Token tampering detected

---

## 🔧 Configuration

### Environment Variables

```bash
# JWT Secrets (separate for isolation)
JWT_SECRET_FARMER=<secret-key-farmer>
JWT_SECRET_DTAM=<secret-key-dtam>

# Token Expiration
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_LOGIN=5
RATE_LIMIT_WINDOW=15m

# Session
SESSION_SECRET=<session-secret>
SESSION_TIMEOUT=24h
```

---

## ✅ Verification

### How to Verify Real Authentication

1. **Check Database Records**
   ```bash
   # Connect to MongoDB
   mongo
   use gacp_platform
   db.users.find({ email: "farmer001@test.com" })
   ```

2. **Test Login Flow**
   ```bash
   curl -X POST http://localhost:3000/api/auth/farmer/login \
     -H "Content-Type: application/json" \
     -d '{"email":"farmer001@test.com","password":"Farmer123!"}'
   ```

3. **Verify JWT Token**
   ```bash
   # Decode JWT at jwt.io
   # Check payload contains: userId, email, role, exp
   ```

4. **Test Protected Route**
   ```bash
   curl -X GET http://localhost:3000/api/applications \
     -H "Authorization: Bearer <token>"
   ```

---

## 📚 Related Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Security Compliance](./docs/SECURITY_COMPLIANCE.md)
- [User Management Guide](./docs/USER_MANAGEMENT.md)
- [Testing Guide](./TESTING_PLAN_2025.md)

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-01-15  
**Status:** ✅ Production-Ready Real Authentication
