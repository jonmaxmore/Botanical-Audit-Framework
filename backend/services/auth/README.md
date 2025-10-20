# 🔐 Authentication Service

GACP Platform Authentication Service - User registration, login, JWT token management.

## 📋 Overview

**Port:** 3001  
**Technology:** Express.js + MongoDB + JWT  
**Security:** bcrypt, rate limiting, account lockout, token rotation  
**Status:** ✅ Production Ready

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- MongoDB v7+
- npm or pnpm

### Installation

```bash
# Install dependencies
cd backend/services/auth
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

**Required Environment Variables:**

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/gacp_development

# JWT Secrets (MUST CHANGE!)
JWT_ACCESS_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Generate Secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Run Development Server

```bash
npm run dev
```

Server will start at: http://localhost:3001

### Run Production Server

```bash
npm start
```

## 📚 API Endpoints

### Health Check

```http
GET /health
```

### Authentication Endpoints

#### 1. Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "idCard": "1234567890123",
  "phone": "0812345678",
  "address": {
    "houseNo": "123",
    "moo": "5",
    "tambon": "บางเขน",
    "amphoe": "เมือง",
    "province": "นนทบุรี",
    "postalCode": "11000"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
  "data": {
    "userId": "USR-2025-00001",
    "email": "farmer@example.com",
    "fullName": "สมชาย ใจดี",
    "role": "FARMER",
    "emailVerified": false
  }
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "userId": "USR-2025-00001",
      "email": "farmer@example.com",
      "fullName": "สมชาย ใจดี",
      "role": "FARMER",
      "emailVerified": true
    }
  }
}
```

**Note:** Refresh token is set as httpOnly cookie automatically.

#### 3. Refresh Token

```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh-token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token refresh สำเร็จ",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

#### 4. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "USR-2025-00001",
    "email": "farmer@example.com",
    "fullName": "สมชาย ใจดี",
    "role": "FARMER",
    "permissions": ["application:create", "application:read:own"],
    "emailVerified": true
  }
}
```

#### 5. Logout

```http
POST /api/auth/logout
Cookie: refreshToken=<refresh-token>
```

#### 6. Verify Email

```http
GET /api/auth/verify-email?token=<verification-token>
```

#### 7. Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "farmer@example.com"
}
```

#### 8. Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<reset-token>",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### 9. Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

## 🔒 Security Features

### Password Security

- **Hashing:** bcrypt (cost factor 12)
- **Complexity:** Min 8 chars, uppercase, lowercase, number, special char
- **Validation:** Real-time password strength checking

### Account Security

- **Account Lockout:** 5 failed attempts → 30 min lock
- **Rate Limiting:**
  - Login: 5 attempts per 15 minutes
  - Register: 10 attempts per hour
  - Password Reset: 3 attempts per hour
- **Session Management:** Automatic token expiration

### Token Security

- **Access Token:** 15 minutes (short-lived)
- **Refresh Token:** 7 days (long-lived)
- **Token Rotation:** New refresh token on every use
- **Reuse Detection:** Invalidate all tokens if reuse detected
- **Storage:** Access token in memory, Refresh token in httpOnly cookie

### Thai ID Validation

- **Algorithm:** Mod 11 checksum
- **Format:** 13 digits
- **Uniqueness:** Enforced at database level

### Audit Logging

- All authentication events logged
- Failed login attempts tracked
- Security events monitored

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Unit Tests

```bash
npm run test:unit
```

### Run Integration Tests

```bash
npm run test:integration
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Coverage Report

```bash
npm test -- --coverage
```

**Target Coverage:** 80%+

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

**Response:**

```json
{
  "success": true,
  "service": "auth-service",
  "status": "healthy",
  "timestamp": "2025-10-16T10:30:00.000Z",
  "uptime": 3600
}
```

### Metrics to Monitor

- Response times (p95 < 200ms)
- Failed login attempts
- Account lockouts
- Token refresh rate
- API error rate

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running:

```bash
# macOS/Linux
sudo service mongodb start

# Docker
docker-compose up -d mongodb
```

**2. Invalid JWT Secret**

```
Error: JWT_ACCESS_SECRET must be at least 32 characters
```

**Solution:** Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**3. Email Not Sent**

```
Warning: SendGrid not configured
```

**Solution:** Set SENDGRID_ENABLED=false for development, or configure SendGrid API key.

**4. CORS Error**

```
Access to fetch at 'http://localhost:3001' has been blocked by CORS
```

**Solution:** Add your frontend URL to FRONTEND_URL in .env

## 📈 Performance

**Benchmarks (Target):**

- Login: < 200ms (p95)
- Register: < 300ms (p95)
- Token Refresh: < 100ms (p95)
- Throughput: 100 req/s sustained, 500 req/s peak

**Optimization Tips:**

- Use connection pooling (maxPoolSize: 100)
- Index frequently queried fields
- Cache user sessions (Redis in Phase 2)
- Enable MongoDB TTL indexes

## 🔧 Development

### Project Structure

```
backend/services/auth/
├── controllers/        # Request handlers
│   ├── register.controller.js
│   ├── login.controller.js
│   ├── token.controller.js
│   └── password.controller.js
├── routes/            # API routes
│   └── auth.routes.js
├── middleware/        # Express middleware
│   ├── auth.middleware.js
│   └── rateLimiter.middleware.js
├── validators/        # Request validation (Joi)
│   └── auth.validator.js
├── utils/             # Utilities
│   └── jwt.util.js
├── server.js          # Express app
└── package.json
```

### Adding New Endpoint

1. Create controller in `controllers/`
2. Add validation schema in `validators/`
3. Register route in `routes/auth.routes.js`
4. Add tests
5. Update documentation

## 📚 References

- [AUTHENTICATION_RESEARCH.md](../../../AUTHENTICATION_RESEARCH.md) - Research findings
- [PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md](../../../PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md) - Technical specs
- [DATABASE_SCHEMA_DESIGN.md](../../../DATABASE_SCHEMA_DESIGN.md) - Database design

## 📞 Support

For issues or questions:

- See main project README
- Check [AUTHENTICATION_RESEARCH.md](../../../AUTHENTICATION_RESEARCH.md) for design decisions
- Review [PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md](../../../PHASE1_CORE_SERVICES_TECHNICAL_SPECS.md)

---

**Authentication Service Version:** 1.0.0  
**Last Updated:** October 16, 2025  
**Status:** ✅ Production Ready
