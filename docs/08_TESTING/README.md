# 🧪 08 - Testing

**Category**: Testing & Quality Assurance  
**Last Updated**: October 15, 2025

---

## 📋 Overview

This folder contains testing documentation, test cases, QA processes, and load testing reports.

---

## 📚 Documents in this Folder

### 1. ⭐ [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md)

Complete test cases for all modules

**Contents:**

- Test strategy
- Test cases (200+ cases)
- Test scenarios
- Acceptance criteria
- Test data
- Expected results

**Who should read:** QA team, Developers

---

## 🎯 Testing Strategy

### Testing Pyramid:

```
       /\
      /E2E\         10% - End-to-end tests
     /------\
    /  Inte  \      20% - Integration tests
   /----------\
  /    Unit    \    70% - Unit tests
 /--------------\
```

### Test Coverage Targets:

```
Unit Tests:        80% coverage
Integration Tests: 70% coverage
E2E Tests:         60% coverage
Overall:           75% coverage
```

---

## 🧪 Test Types

### 1. Unit Testing

**Framework:** Jest + React Testing Library

**Scope:**

- Individual functions
- React components
- Utility functions
- Services
- Models

**Example:**

```typescript
// Test a utility function
test('formatCurrency formats THB correctly', () => {
  expect(formatCurrency(5000)).toBe('฿5,000.00');
});

// Test a React component
test('Button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

### 2. Integration Testing

**Framework:** Jest + Supertest (API) / Testing Library (UI)

**Scope:**

- API endpoints
- Database operations
- Service integrations
- Component interactions

**Example:**

```typescript
// Test API endpoint
test('POST /api/applications creates new application', async () => {
  const response = await request(app)
    .post('/api/applications')
    .send({ farmerId: '123', ... })
    .expect(201);

  expect(response.body.id).toBeDefined();
});
```

---

### 3. E2E Testing

**Framework:** Playwright

**Scope:**

- Critical user flows
- Cross-browser testing
- Mobile responsive
- Performance testing

**Example:**

```typescript
// Test farmer application flow
test('Farmer can submit application', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await page.click('text=New Application');
  await page.fill('[name="fullName"]', 'Test Farmer');
  // ... fill form
  await page.click('text=Submit');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

---

### 4. Load Testing

**Framework:** k6

**Scope:**

- API performance
- Concurrent users
- Stress testing
- Spike testing

**Target Metrics:**

```
Concurrent Users: 10,000
API Response Time: < 500ms (p95)
Error Rate: < 1%
Uptime: 99.9%
```

**Test Location:** `tests/load-testing/`

---

### 5. Security Testing

**Tools:** OWASP ZAP, Snyk

**Scope:**

- SQL injection
- XSS attacks
- CSRF protection
- Authentication bypass
- Data exposure

---

## 📋 Test Cases Summary

### Farmer Portal (80+ cases):

**Authentication Module:**

- Registration (10 cases)
- Login (8 cases)
- OTP verification (5 cases)
- Password reset (7 cases)

**Application Module:**

- Create application (15 cases)
- Upload documents (10 cases)
- Payment flow (12 cases)
- Status tracking (6 cases)

**Farm Management Module:**

- Create farm (8 cases)
- SOP tracking (20 cases)
- Chemical registry (8 cases)
- QR code (4 cases)

---

### DTAM Portal (90+ cases):

**Reviewer Module:**

- Application review (15 cases)
- Document verification (12 cases)
- Job ticket creation (8 cases)

**Inspector Module:**

- Document review (10 cases)
- Farm inspection (25 cases)
- Report submission (10 cases)

**Approver Module:**

- Final review (12 cases)
- Certificate generation (8 cases)
- Rejection handling (6 cases)

**Admin Module:**

- User management (15 cases)
- Reports (10 cases)
- System config (5 cases)

---

### Public Services (30+ cases):

**Survey System:**

- Submit survey (10 cases)
- View results (5 cases)

**Standards Comparison:**

- Compare standards (8 cases)
- Export PDF (4 cases)

**Track & Trace:**

- Scan QR (7 cases)
- View history (6 cases)

---

## 🚀 Running Tests

### Unit Tests:

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/utils/format.test.ts
```

### Integration Tests:

```bash
# Run integration tests
pnpm test:integration

# Run API tests only
pnpm test:api

# Run database tests only
pnpm test:db
```

### E2E Tests:

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests in headed mode
pnpm test:e2e:headed

# Run specific test
pnpm test:e2e tests/farmer-application.spec.ts

# Run E2E tests on multiple browsers
pnpm test:e2e:all-browsers
```

### Load Tests:

```bash
# Navigate to load testing folder
cd tests/load-testing

# Run load test
k6 run multi-user-qa-simulation.js

# Run with more users
k6 run --vus 100 --duration 5m multi-user-qa-simulation.js
```

---

## 📊 Test Reports

### Coverage Report:

```bash
# Generate coverage report
pnpm test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Test Results:

```
Tests located in: tests/
Reports located in: reports/
Coverage: coverage/lcov-report/
```

---

## ✅ QA Process

### Pre-Development:

```
1. Review requirements
2. Create test plan
3. Write test cases
4. Review with team
```

### During Development:

```
1. Unit tests (by developers)
2. Code review
3. Integration tests
4. Manual testing
```

### Pre-Release:

```
1. Full regression testing
2. E2E testing
3. Load testing
4. Security audit
5. UAT (User Acceptance Testing)
6. Sign-off
```

---

## 🐛 Bug Reporting

### Bug Report Template:

```
Title: [Module] Brief description

Severity: Critical / High / Medium / Low

Steps to Reproduce:
1. Go to...
2. Click on...
3. Fill...
4. See error

Expected Result:
What should happen

Actual Result:
What actually happens

Environment:
- Browser: Chrome 120
- OS: Windows 11
- Version: 1.0.0

Screenshots:
[Attach screenshots]

Additional Info:
[Any other relevant information]
```

### Bug Tracking:

- **Tool:** Jira
- **Status:** New → In Progress → Testing → Closed
- **Priority:** P1 (Critical), P2 (High), P3 (Medium), P4 (Low)

---

## 🔗 Related Documentation

- **System Architecture**: [../01_SYSTEM_ARCHITECTURE/](../01_SYSTEM_ARCHITECTURE/)
- **API Documentation**: [../../docs/API_DOCUMENTATION.md](../../docs/API_DOCUMENTATION.md)
- **Deployment Guide**: [../05_DEPLOYMENT/](../05_DEPLOYMENT/)

---

## 📞 Contact

**QA Team:**

- QA Lead: คุณสมควร - somkuan@gacp.go.th

**Slack Channels:**

- #gacp-qa
- #gacp-bugs
- #gacp-testing

---

**Navigation:**

- 🏠 [Back to Main README](../../README.md)
- 📚 [All Documentation](../)
- ⬅️ [Previous: User Guides](../07_USER_GUIDES/)
