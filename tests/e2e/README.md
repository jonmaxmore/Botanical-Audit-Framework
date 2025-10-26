# End-to-End (E2E) Test Suite

## Overview

This directory contains comprehensive end-to-end tests for the GACP Botanical Audit Framework system. These tests validate the complete workflows across all three portals:

- **Farmer Portal** (localhost:3001)
- **Admin/DTAM Portal** (localhost:3002)  
- **Certificate Verification Portal** (localhost:3003)

## Test Structure

```
tests/e2e/
├── auth.setup.ts                    # Authentication setup for all portals
├── application-workflow.spec.ts     # Complete application lifecycle tests
├── cross-portal-integration.spec.ts # Integration between portals
└── __snapshots__/                   # Visual regression snapshots
```

## Prerequisites

1. **Install Dependencies**
   ```bash
   pnpm install
   npx playwright install chromium
   ```

2. **Start All Services**
   ```bash
   # Terminal 1: Start all portals
   pnpm run start:all

   # Or start individually:
   pnpm --filter farmer-portal dev
   pnpm --filter admin-portal dev
   pnpm --filter certificate-portal dev
   ```

3. **Database Setup**
   Ensure MongoDB is running and seeded with test data:
   ```bash
   mongod --dbpath ./data
   pnpm run db:seed
   ```

## Running Tests

### Run All E2E Tests
```bash
pnpm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test application-workflow
npx playwright test cross-portal-integration
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Debug Tests
```bash
npx playwright test --debug
```

## Test Scenarios

### 1. Complete Application Workflow (`application-workflow.spec.ts`)

Tests the entire application lifecycle:

1. **Farmer submits application**
   - Fill out farm details
   - Upload required documents
   - Submit application

2. **Farmer completes payment**
   - Generate QR code
   - Simulate payment
   - Verify payment confirmation

3. **DTAM reviews application**
   - Review documents
   - Schedule field inspection
   - Approve or request changes

4. **Inspector completes field inspection**
   - Complete inspection checklist
   - Upload photos
   - Submit inspection report
   - Recommend approval

5. **Admin approves and issues certificate**
   - Review inspection report
   - Approve application
   - Generate certificate

6. **Farmer views certificate**
   - Access certificate from portal
   - Download PDF
   - View details

7. **Public certificate verification**
   - Verify certificate on public portal
   - Check QR code generation
   - Validate certificate details

8. **Admin monitors audit logs**
   - Review all activities
   - Filter by application
   - Verify audit trail

### 2. Cross-Portal Integration (`cross-portal-integration.spec.ts`)

Tests integration and data synchronization:

- **Data Synchronization**: Application data appears across portals
- **Real-time Updates**: Status changes reflect immediately
- **Certificate Verification**: Public verification after issuance
- **Payment Integration**: QR code generation and payment flow
- **Document Management**: Upload and review workflow
- **Notification System**: Cross-portal notifications
- **Search & Filter**: Global search functionality
- **Performance Tests**: Load times and concurrent users

### 3. Error Handling

Tests edge cases and error scenarios:

- Incomplete document submission
- Invalid certificate verification
- Duplicate application prevention
- Network failure handling
- Invalid input validation

## Authentication

The test suite uses pre-configured authentication states:

- **Farmer**: `tests/e2e/.auth/farmer.json`
- **DTAM**: `tests/e2e/.auth/dtam.json`
- **Admin**: `tests/e2e/.auth/admin.json`

These are created by `auth.setup.ts` before tests run.

## Test Reports

After running tests, view reports:

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
Located at: `test-results/e2e-results.json`

### JUnit Report (for CI/CD)
Located at: `test-results/e2e-junit.xml`

## Screenshots and Videos

On test failure:
- Screenshots: `test-results/e2e-artifacts/`
- Videos: `test-results/e2e-artifacts/`
- Traces: `test-results/e2e-artifacts/`

## Debugging Tips

1. **Use UI Mode**
   ```bash
   npx playwright test --ui
   ```

2. **Slow Motion**
   ```bash
   npx playwright test --headed --slow-mo=1000
   ```

3. **Pause Execution**
   Add `await page.pause()` in your test

4. **View Trace**
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

5. **Console Logs**
   Check terminal output for `console.log()` statements

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Start services
        run: |
          pnpm run start:all &
          sleep 30
      
      - name: Run E2E tests
        run: pnpm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Serial Execution**: Use `test.describe.configure({ mode: 'serial' })` for workflow tests
3. **Proper Cleanup**: Close contexts and pages after tests
4. **Meaningful Selectors**: Use data-testid attributes
5. **Wait Strategies**: Use `waitForSelector`, `waitForURL`, not arbitrary timeouts
6. **Error Messages**: Add descriptive expect messages
7. **Test Data**: Use unique identifiers (timestamps) to avoid conflicts

## Troubleshooting

### Tests Fail with Timeout

- Increase timeout in `playwright.config.ts`
- Check if services are running
- Verify network connectivity

### Authentication Fails

- Delete `.auth/` directory and re-run setup
- Check login credentials
- Verify authentication endpoints

### Element Not Found

- Check if selector is correct
- Add wait conditions
- Verify element is visible in headed mode

### Database Issues

- Reset test database: `pnpm run db:reset`
- Check MongoDB connection
- Verify test data seeding

## Contributing

When adding new E2E tests:

1. Follow existing test structure
2. Add descriptive test names
3. Include error scenarios
4. Update this README
5. Test in CI environment

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Testing API](https://playwright.dev/docs/api/class-test)
- [Assertions](https://playwright.dev/docs/test-assertions)
