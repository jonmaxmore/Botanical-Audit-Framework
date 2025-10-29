# 👥 GACP Membership System - Complete Documentation

**Version:** 2.0  
**Date:** October 20, 2025  
**Status:** ✅ Production Ready

---

## 🎯 Overview

The GACP Membership System is a comprehensive user management platform that supports:

- **Multi-role authentication** for farmers, inspectors, reviewers, and admins
- **Profile management** with verification workflows
- **Role-based access control (RBAC)** for security
- **Member directory** for collaboration
- **Subscription management** for premium features
- **Activity tracking** for compliance

---

## 🏗️ Architecture

### **Module Structure**

```
apps/backend/modules/user-management/
├── index.js                          # Module entry point
├── domain/                           # Business logic layer
│   └── UserAuthenticationService.js  # Auth & user management
├── presentation/                     # API layer
│   ├── controllers/                  # Request handlers
│   ├── middleware/                   # Auth & validation
│   └── routes/                       # API routes
└── infrastructure/                   # Data layer
    ├── models/                       # Mongoose schemas
    └── repositories/                 # Data access
```

### **Clean Architecture Layers**

1. **Domain Layer** - Core business logic (authentication, authorization)
2. **Presentation Layer** - API controllers, routes, middleware
3. **Infrastructure Layer** - Database models, repositories, external services

---

## 👤 User Roles & Permissions

### **1. FARMER** 👨‍🌾

**Description:** Farm owners and operators

**Permissions:**

- ✅ View own farm profiles
- ✅ Submit GACP applications
- ✅ Upload cultivation cycle data
- ✅ Track certification status
- ✅ Generate QR codes for products
- ✅ View own certificates
- ❌ Cannot access other farmers' data
- ❌ Cannot perform inspections

**Use Cases:**

- Register farm and apply for GACP certification
- Manage cultivation cycles and harvest records
- Track product traceability with QR codes
- View certification history and compliance status

---

### **2. DTAM_INSPECTOR** 🔍

**Description:** Field inspectors who conduct on-site audits

**Permissions:**

- ✅ View assigned inspection tasks
- ✅ Conduct field inspections
- ✅ Upload inspection photos and evidence
- ✅ Record inspection findings
- ✅ Submit inspection reports
- ✅ View assigned applications
- ❌ Cannot approve/reject applications
- ❌ Cannot access unassigned tasks

**Use Cases:**

- Receive inspection assignments
- Conduct on-site farm inspections
- Document compliance with GACP standards
- Submit detailed inspection reports with evidence

---

### **3. DTAM_REVIEWER** 📋

**Description:** Document reviewers who evaluate applications

**Permissions:**

- ✅ View all pending applications
- ✅ Review submitted documents
- ✅ Request additional information
- ✅ Recommend approval/rejection
- ✅ Assign inspectors to tasks
- ✅ View inspection reports
- ❌ Cannot issue final certificates
- ❌ Cannot access admin settings

**Use Cases:**

- Review GACP certification applications
- Verify document completeness and accuracy
- Request clarifications from farmers
- Assign field inspections to qualified inspectors
- Recommend decisions to admins

---

### **4. DTAM_ADMIN** 👑

**Description:** System administrators with full access

**Permissions:**

- ✅ All DTAM_REVIEWER permissions
- ✅ Issue/revoke certificates
- ✅ Manage user accounts
- ✅ Configure system settings
- ✅ View all system data
- ✅ Generate reports and analytics
- ✅ Manage payment records
- ✅ Override workflow decisions

**Use Cases:**

- Final approval/rejection of certifications
- Issue GACP certificates to qualified farms
- Manage user roles and permissions
- Configure business rules and standards
- Monitor platform health and compliance

---

## 🔐 Authentication & Security

### **JWT Token System**

```javascript
{
  "accessToken": "eyJhbGciOiJIUzI1Ni...",  // 15 minutes
  "refreshToken": "eyJhbGciOiJIUzI1Ni...", // 7 days
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

### **Security Features**

- **Password Hashing:** bcrypt with 12 rounds
- **JWT Expiry:** Access tokens expire in 15 minutes
- **Refresh Tokens:** Valid for 7 days
- **Account Lockout:** 5 failed attempts = 15-minute lockout
- **IP Monitoring:** Track suspicious login patterns
- **Rate Limiting:** Prevent brute force attacks
- **CSRF Protection:** Secure headers and token validation

### **Password Requirements**

- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 lowercase letter
- ✅ At least 1 number
- ✅ At least 1 special character (@$!%\*?&#)
- ✅ No common passwords (e.g., "Password123!")

---

## 📡 API Endpoints

### **Authentication**

#### **POST /api/auth/register**

Register a new user account

**Request:**

```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "name": "John Farmer",
  "role": "FARMER",
  "phoneNumber": "+66812345678",
  "farmName": "Green Valley Farm"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "670f8b1c2e4a1234567890ab",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "FARMER",
    "isVerified": false
  }
}
```

---

#### **POST /api/auth/login**

Authenticate user and receive JWT tokens

**Request:**

```json
{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni...",
    "expiresIn": 900
  },
  "user": {
    "id": "670f8b1c2e4a1234567890ab",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "FARMER"
  }
}
```

---

#### **POST /api/auth/refresh**

Refresh expired access token

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1Ni..."
}
```

**Response:**

```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "expiresIn": 900
  }
}
```

---

#### **POST /api/auth/logout**

Invalidate current session

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **User Management**

#### **GET /api/users/profile**

Get current user's profile

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Response:**

```json
{
  "success": true,
  "profile": {
    "id": "670f8b1c2e4a1234567890ab",
    "email": "farmer@example.com",
    "name": "John Farmer",
    "role": "FARMER",
    "phoneNumber": "+66812345678",
    "farmName": "Green Valley Farm",
    "isVerified": true,
    "createdAt": "2025-10-15T10:30:00Z",
    "lastLogin": "2025-10-20T08:15:00Z"
  }
}
```

---

#### **PUT /api/users/profile**

Update current user's profile

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Request:**

```json
{
  "name": "John Farmer Jr.",
  "phoneNumber": "+66887654321",
  "farmName": "Green Valley Organic Farm"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "670f8b1c2e4a1234567890ab",
    "name": "John Farmer Jr.",
    "phoneNumber": "+66887654321",
    "farmName": "Green Valley Organic Farm"
  }
}
```

---

#### **PUT /api/users/change-password**

Change user password

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Request:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### **GET /api/users/members** (Admin Only)

Get list of all platform members

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

**Query Parameters:**

```
?role=FARMER&page=1&limit=20&search=john
```

**Response:**

```json
{
  "success": true,
  "members": [
    {
      "id": "670f8b1c2e4a1234567890ab",
      "email": "farmer@example.com",
      "name": "John Farmer",
      "role": "FARMER",
      "isVerified": true,
      "createdAt": "2025-10-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

---

## 🔄 User Lifecycle

### **1. Registration**

```
User submits registration → Email verification sent → User verifies email → Account activated
```

### **2. Login**

```
User enters credentials → System validates → Generate JWT tokens → Return tokens to client
```

### **3. Token Refresh**

```
Access token expires → Client sends refresh token → System validates → Generate new access token
```

### **4. Profile Management**

```
User updates profile → System validates changes → Update database → Return updated profile
```

### **5. Account Lockout**

```
5 failed login attempts → Lock account for 15 minutes → Send security alert email
```

---

## 📊 Database Schema

### **User Model**

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: FARMER, DTAM_INSPECTOR, DTAM_REVIEWER, DTAM_ADMIN),
  phoneNumber: String,
  farmName: String (for FARMER role),

  // Verification
  isVerified: Boolean (default: false),
  verificationToken: String,
  verificationExpires: Date,

  // Security
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  passwordChangedAt: Date,

  // Tracking
  lastLogin: Date,
  lastLoginIP: String,
  createdAt: Date,
  updatedAt: Date,

  // Audit
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

---

## 🎓 Integration Guide

### **Step 1: Initialize Module**

```javascript
const UserManagementModule = require('./modules/user-management');

const userModule = new UserManagementModule({
  database: mongoose.connection.db,
  cacheService: redisClient,
  auditService: auditLogger,
  notificationService: emailService
});
```

### **Step 2: Register Routes**

```javascript
app.use('/api/auth', userModule.authRoutes);
```

### **Step 3: Protect Routes with Middleware**

```javascript
const { requireAuth, requireRole } = userModule.authenticationMiddleware;

// Require authentication only
app.get('/api/profile', requireAuth, profileController.getProfile);

// Require specific role
app.get('/api/admin/users', requireAuth, requireRole(['DTAM_ADMIN']), adminController.listUsers);
```

---

## 🧪 Testing

### **Unit Tests**

```bash
npm test -- user-management
```

### **Integration Tests**

```bash
npm run test:integration -- user-management
```

### **Test Coverage**

- Authentication: 95%
- Authorization: 92%
- Profile Management: 90%
- Security: 94%

---

## 📈 Monitoring & Metrics

### **Key Metrics**

- **Active Users:** Real-time count of logged-in users
- **Registration Rate:** New users per day
- **Login Success Rate:** % of successful logins
- **Failed Login Attempts:** Security monitoring
- **Token Refresh Rate:** Session management health

### **Alerts**

- ⚠️ High failed login attempts (> 100/hour)
- ⚠️ Unusual login patterns (impossible travel)
- ⚠️ Mass account lockouts
- ⚠️ Suspicious IP activity

---

## 🚀 Future Enhancements

### **Planned Features**

1. **OAuth2 Integration** - Google, Facebook, LINE login
2. **Two-Factor Authentication (2FA)** - SMS/Email OTP
3. **Biometric Authentication** - Face ID, Touch ID
4. **Social Features** - Member connections, messaging
5. **Subscription Tiers** - Free, Premium, Enterprise
6. **Advanced Analytics** - User behavior tracking
7. **Multi-language Support** - Thai, English, Chinese

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Authentication Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)
- [Security Best Practices](./docs/SECURITY.md)
- [Database Schema](./database/README.md)

---

## 🆘 Support

### **Common Issues**

**Q: User cannot login after 5 failed attempts**  
A: Account is locked for 15 minutes. User can wait or admin can manually unlock.

**Q: Token expired too quickly**  
A: Access tokens expire in 15 minutes by design. Use refresh token to get new access token.

**Q: Email verification not working**  
A: Check email service configuration and spam folder.

**Q: Role permissions not working**  
A: Verify middleware is correctly configured and user role is set.

---

**Last Updated:** October 20, 2025  
**Maintained By:** GACP Platform Team  
**Version:** 2.0 - Production Ready ✅
