# Certificate System Testing Guide

## ภาพรวม

เอกสารนี้อธิบายการทดสอบระบบใบรับรอง GACP ที่ครอบคลุม:

- Model Testing (Certificate.js)
- API Route Testing (certificate.js routes)
- Service Testing (gacp-certificate.js)

## โครงสร้าง Test Files

```
apps/backend/
├── __tests__/
│   ├── setup.js                    # การตั้งค่า environment สำหรับ tests
│   ├── models/
│   │   └── Certificate.test.js     # ทดสอบ Certificate model
│   └── routes/
│       └── certificate.test.js     # ทดสอบ API endpoints
└── jest.config.js                   # การตั้งค่า Jest
```

## การติดตั้ง Test Dependencies

### Dependencies ที่จำเป็น

```bash
npm install --save-dev jest supertest @types/jest @types/supertest mongodb-memory-server
```

**หมายเหตุ**: หากเกิดข้อผิดพลาด csv-writer compilation ให้ใช้คำสั่ง:

```bash
npm install --legacy-peer-deps --save-dev supertest @types/supertest mongodb-memory-server @types/jest
```

### Package เสริม

- `jest`: Test framework หลัก
- `supertest`: ทดสอบ HTTP endpoints
- `mongodb-memory-server`: In-memory MongoDB สำหรับ testing
- `@types/jest`, `@types/supertest`: TypeScript type definitions

## Test Suites

### 1. Certificate Model Tests (`__tests__/models/Certificate.test.js`)

ทดสอบ Certificate model ครอบคลุม:

#### A. Certificate Creation

- ✅ สร้าง certificate ที่ valid
- ✅ ตรวจสอบ required fields
- ✅ ตรวจสอบ unique constraint ของ certificateNumber

#### B. Instance Methods

- ✅ `isValid()` - ตรวจสอบสถานะ active และไม่หมดอายุ
- ✅ `isExpiringSoon(days)` - ตรวจสอบใกล้หมดอายุ
- ✅ `getDaysUntilExpiry()` - คำนวณวันที่เหลือ
- ✅ `suspend(userId, reason)` - ระงับใบรับรอง
- ✅ `reinstate(userId)` - คืนสถานะใบรับรอง
- ✅ `revoke(userId, reason)` - เพิกถอนใบรับรอง

#### C. Static Methods

- ✅ `generateCertificateNumber(province)` - สร้างเลขใบรับรองแบบ GACP-YY-PRV-#####
- ✅ `findValid()` - ค้นหาใบรับรองที่ active
- ✅ `findExpiring(days)` - ค้นหาใบรับรองใกล้หมดอายุ

### 2. Certificate API Tests (`__tests__/routes/certificate.test.js`)

ทดสอบ REST API endpoints:

#### A. Public Endpoints

1. **GET /api/certificates/search**
   - ✅ ค้นหาด้วย certificate number
   - ✅ ค้นหาด้วย national ID
   - ✅ ค้นหาด้วย tax ID
   - ✅ Validation errors (missing query)

2. **GET /api/certificates/:certificateNumber**
   - ✅ ดูรายละเอียดใบรับรอง
   - ✅ 404 สำหรับใบรับรองที่ไม่พบ

3. **GET /api/certificates/verify/:certificateNumber**
   - ✅ Verify ใบรับรอง active (valid)
   - ✅ Verify ใบรับรอง suspended (invalid)
   - ✅ Verify ใบรับรอง expired (invalid)
   - ✅ Warning สำหรับใบรับรองใกล้หมดอายุ (≤30 วัน)

4. **GET /api/certificates/pdf/:certificateNumber**
   - ⏳ ดาวน์โหลด PDF (ต้องทดสอบกับ service)

#### B. Admin Endpoints (ต้อง Authentication)

1. **POST /api/certificates/admin/issue/:applicationId**
   - ⏳ ออกใบรับรองใหม่ (ต้องทดสอบกับ service)

2. **GET /api/certificates/admin**
   - ✅ แสดงรายการทั้งหมด
   - ✅ กรองตาม status
   - ✅ ค้นหาใบรับรอง
   - ✅ Pagination

3. **PUT /api/certificates/admin/:certificateNumber/suspend**
   - ✅ ระงับใบรับรอง
   - ✅ ต้องระบุ reason

4. **PUT /api/certificates/admin/:certificateNumber/reinstate**
   - ✅ คืนสถานะใบรับรอง
   - ✅ ตรวจสอบต้องเป็นสถานะ suspended

5. **PUT /api/certificates/admin/:certificateNumber/revoke**
   - ✅ เพิกถอนใบรับรอง
   - ✅ ต้องระบุ reason

6. **GET /api/certificates/admin/stats/summary**
   - ✅ แสดงสถิติใบรับรอง (total, active, expired, expiring, suspended, revoked)

### 3. Certificate Service Tests (ยังไม่ได้สร้าง)

ทดสอบ gacp-certificate.js service:

#### A. Certificate Generation

- ⏳ `generateCertificate()` - สร้างใบรับรองพร้อม PDF
- ⏳ QR Code generation
- ⏳ Digital signature creation
- ⏳ PDF file creation

#### B. Certificate Verification

- ⏳ `verifyCertificate()` - ตรวจสอบความถูกต้อง
- ⏳ Digital signature verification

#### C. Certificate Lifecycle

- ⏳ `renewCertificate()` - ต่ออายุใบรับรอง
- ⏳ `revokeCertificate()` - เพิกถอนใบรับรอง

## การรัน Tests

### รัน Test ทั้งหมด

```bash
cd apps/backend
npm test
```

### รัน Test เฉพาะ File

```bash
npm test -- Certificate.test.js
npm test -- certificate.test.js
```

### รัน Test แบบ Watch Mode

```bash
npm test -- --watch
```

### รัน Test พร้อม Coverage Report

```bash
npm test -- --coverage
```

### รัน Test เฉพาะ Suite

```bash
npm test -- --testNamePattern="Certificate Model"
npm test -- --testNamePattern="Certificate API"
```

## Test Database Setup

### ใช้ mongodb-memory-server (แนะนำ)

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

### ใช้ Test Database แยก

ตั้งค่าใน `.env.test`:

```
MONGODB_TEST_URI=mongodb://localhost:27017/gacp-test
```

## Coverage Goals

เป้าหมาย code coverage สำหรับ Certificate System:

| Metric     | Target | Current |
| ---------- | ------ | ------- |
| Statements | ≥ 70%  | ⏳ TBD  |
| Branches   | ≥ 70%  | ⏳ TBD  |
| Functions  | ≥ 70%  | ⏳ TBD  |
| Lines      | ≥ 70%  | ⏳ TBD  |

## Next Steps

### ลำดับความสำคัญ (Priority Order)

1. **ติดตั้ง Test Dependencies** ✅

   ```bash
   npm install --save-dev supertest @types/supertest mongodb-memory-server @types/jest
   ```

2. **รัน Model Tests**

   ```bash
   npm test -- Certificate.test.js
   ```

3. **รัน API Tests**

   ```bash
   npm test -- certificate.test.js
   ```

4. **สร้าง Service Tests** (ต่อไป)
   - `__tests__/services/gacp-certificate.service.test.js`
   - ทดสอบ PDF generation
   - ทดสอบ QR code generation
   - ทดสอบ digital signature

5. **รัน Coverage Report**

   ```bash
   npm test -- --coverage
   ```

6. **แก้ไข Failing Tests**
   - อ่าน error messages
   - แก้ไข implementation ถ้าจำเป็น
   - Re-run tests

7. **Integration Testing**
   - ทดสอบ flow ทั้งหมด: Application → Certificate issuance → Verification
   - ทดสอบการเชื่อมต่อระหว่าง services

## คำแนะนำเพิ่มเติม

### Best Practices

- ใช้ `beforeEach` และ `afterEach` เพื่อ cleanup test data
- Mock external dependencies (file system, email, etc.)
- ใช้ descriptive test names
- จัดกลุ่ม tests ด้วย `describe` blocks
- Test edge cases และ error conditions

### Debugging Tests

```bash
# รัน test เดียวโดยใช้ it.only
it.only('should do something', async () => {
  // test code
});

# รัน test suite เดียวโดยใช้ describe.only
describe.only('Certificate Model', () => {
  // tests
});

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Mocking Examples

#### Mock Authentication

```javascript
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  }
}));
```

#### Mock File System

```javascript
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('test'))
}));
```

## Status Summary

### ✅ Completed

- Test file structure created
- Certificate Model tests (30+ test cases)
- Certificate API tests (25+ test cases)
- Jest configuration
- Test setup file

### ⏳ In Progress

- Installing test dependencies (pending npm install issues)
- Running initial tests

### 📋 TODO

- Create Service tests (gacp-certificate.js)
- Run tests and fix failures
- Achieve 70%+ coverage
- Document test results

---

**หมายเหตุ**: เอกสารนี้จะได้รับการอัปเดตเมื่อมีการทดสอบและพัฒนาเพิ่มเติม
