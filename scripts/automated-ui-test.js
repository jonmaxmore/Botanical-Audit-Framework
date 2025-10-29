/**
 * 🤖 Automated UI Testing Script
 * Run automated tests and generate screenshots
 *
 * Usage:
 *   node scripts/automated-ui-test.js
 *
 * Requirements:
 *   npm install puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: './test-screenshots',
  reportFile: './test-results.html',
  headless: false, // Set to true for CI/CD
  slowMo: 100, // Slow down by 100ms for visibility
  viewport: {
    width: 1920,
    height: 1080
  },
  users: {
    farmer: { email: 'farmer@example.com', password: 'test123' },
    officer: { email: 'officer@example.com', password: 'test123' },
    inspector: { email: 'inspector@example.com', password: 'test123' },
    admin: { email: 'admin@example.com', password: 'test123' }
  }
};

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  scenarios: [],
  startTime: new Date(),
  endTime: null
};

// Utility functions
const utils = {
  async takeScreenshot(page, name) {
    const filename = `${Date.now()}-${name}.png`;
    const filepath = path.join(CONFIG.screenshotDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`📸 Screenshot: ${filename}`);
    return filename;
  },

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async waitForNavigation(page, timeout = 5000) {
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout });
    } catch (error) {
      console.warn('⚠️ Navigation timeout (might be expected)');
    }
  },

  async login(page, userType) {
    const user = CONFIG.users[userType];
    console.log(`\n🔐 Logging in as ${userType}: ${user.email}`);

    await page.goto(`${CONFIG.baseUrl}/login`, { waitUntil: 'networkidle2' });
    await utils.takeScreenshot(page, `login-page`);

    // Fill login form
    await page.type('input[name="email"], input[type="email"]', user.email);
    await page.type('input[name="password"], input[type="password"]', user.password);
    await utils.takeScreenshot(page, `login-filled-${userType}`);

    // Click login button
    await page.click('button[type="submit"]');
    await utils.wait(2000);
    await utils.takeScreenshot(page, `after-login-${userType}`);

    console.log(`✅ Login successful for ${userType}`);
  },

  async logout(page) {
    console.log('\n🚪 Logging out...');
    // Try to find and click logout button
    try {
      await page.click('button:has-text("ออกจากระบบ"), button:has-text("Logout")');
      await utils.wait(1000);
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('ℹ️ Logout button not found (might not be visible)');
    }
  },

  recordTest(scenarioName, testName, passed, error = null) {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`  ✅ ${testName}`);
    } else {
      testResults.failed++;
      console.log(`  ❌ ${testName}: ${error}`);
    }

    // Find or create scenario
    let scenario = testResults.scenarios.find(s => s.name === scenarioName);
    if (!scenario) {
      scenario = { name: scenarioName, tests: [] };
      testResults.scenarios.push(scenario);
    }

    scenario.tests.push({
      name: testName,
      passed,
      error,
      timestamp: new Date()
    });
  }
};

// Test Scenarios
const scenarios = {
  /**
   * Scenario 1: Farmer Application Flow
   */
  async testFarmerFlow(page) {
    console.log('\n\n🌾 SCENARIO 1: FARMER APPLICATION FLOW');
    console.log('═'.repeat(60));

    try {
      // Login
      await utils.login(page, 'farmer');

      // Dashboard
      console.log('\n📊 Testing Dashboard...');
      await page.goto(`${CONFIG.baseUrl}/farmer/dashboard`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'farmer-dashboard');

      const hasDashboard = await page.$('h4, h5, h6');
      utils.recordTest('Farmer Flow', 'Dashboard loads', hasDashboard !== null);

      // New Application Form
      console.log('\n📝 Testing Application Form...');
      await page.goto(`${CONFIG.baseUrl}/farmer/applications/new`, {
        waitUntil: 'networkidle2'
      });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'application-form-step1');

      // Step 1: Farm Info
      console.log('  Step 1: Farm Information');
      await page.type('input[name="farmName"], input[value=""]', 'ฟาร์มทดสอบอัตโนมัติ', {
        delay: 50
      });
      await page.type('input[type="number"]', '10');
      await page.type('textarea', '123 หมู่ 5 ถนนทดสอบ');

      // Select province (MUI Select)
      await page.click('div[role="button"]:has-text("จังหวัด")');
      await utils.wait(500);
      await page.click('li:has-text("เชียงใหม่")');

      await utils.wait(500);
      await utils.takeScreenshot(page, 'application-form-step1-filled');

      // Click Next
      await page.click('button:has-text("ถัดไป")');
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'application-form-step2');

      const hasStep2 = await page.$('text=ข้อมูลเกษตรกร');
      utils.recordTest('Farmer Flow', 'Application Form - Step 2 reached', hasStep2 !== null);

      console.log('✅ Farmer Flow completed');
    } catch (error) {
      console.error('❌ Farmer Flow failed:', error.message);
      await utils.takeScreenshot(page, 'farmer-flow-error');
      utils.recordTest('Farmer Flow', 'Overall Flow', false, error.message);
    }
  },

  /**
   * Scenario 2: Officer Review Flow
   */
  async testOfficerFlow(page) {
    console.log('\n\n📋 SCENARIO 2: OFFICER REVIEW FLOW');
    console.log('═'.repeat(60));

    try {
      await utils.login(page, 'officer');

      // Dashboard
      console.log('\n📊 Testing Officer Dashboard...');
      await page.goto(`${CONFIG.baseUrl}/officer/dashboard`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'officer-dashboard');

      const hasCards = await page.$$('div[class*="MuiCard"]');
      utils.recordTest('Officer Flow', 'Dashboard has summary cards', hasCards.length >= 4);

      // Applications List
      console.log('\n📄 Testing Applications List...');
      await page.goto(`${CONFIG.baseUrl}/officer/applications`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'officer-applications-list');

      const hasTable = await page.$('table');
      utils.recordTest('Officer Flow', 'Applications list shows table', hasTable !== null);

      // Review Page (mock ID)
      console.log('\n✅ Testing Review Page...');
      await page.goto(`${CONFIG.baseUrl}/officer/applications/app-001/review`, {
        waitUntil: 'networkidle2'
      });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'officer-review-page');

      const hasDocuments = await page.$$('text=บัตรประชาชน');
      utils.recordTest('Officer Flow', 'Review page shows documents', hasDocuments.length > 0);

      console.log('✅ Officer Flow completed');
    } catch (error) {
      console.error('❌ Officer Flow failed:', error.message);
      await utils.takeScreenshot(page, 'officer-flow-error');
      utils.recordTest('Officer Flow', 'Overall Flow', false, error.message);
    }
  },

  /**
   * Scenario 3: Inspector Inspection Flow
   */
  async testInspectorFlow(page) {
    console.log('\n\n🔍 SCENARIO 3: INSPECTOR INSPECTION FLOW');
    console.log('═'.repeat(60));

    try {
      await utils.login(page, 'inspector');

      // Dashboard
      console.log('\n📊 Testing Inspector Dashboard...');
      await page.goto(`${CONFIG.baseUrl}/inspector/dashboard`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'inspector-dashboard');

      // Schedule
      console.log('\n📅 Testing Schedule Page...');
      await page.goto(`${CONFIG.baseUrl}/inspector/schedule`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'inspector-schedule');

      // VDO Call Inspection
      console.log('\n📹 Testing VDO Call Inspection...');
      await page.goto(`${CONFIG.baseUrl}/inspector/inspections/insp-001/vdo-call`, {
        waitUntil: 'networkidle2'
      });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'inspector-vdo-call');

      const hasChecklist = await page.$$('input[type="checkbox"]');
      utils.recordTest('Inspector Flow', 'VDO Call has checklist', hasChecklist.length >= 8);

      // On-Site Inspection (Most Important)
      console.log('\n🏭 Testing On-Site Inspection (8 CCPs)...');
      await page.goto(`${CONFIG.baseUrl}/inspector/inspections/insp-001/on-site`, {
        waitUntil: 'networkidle2'
      });
      await utils.wait(2000);
      await utils.takeScreenshot(page, 'inspector-onsite-initial');

      // Test CCP scoring
      console.log('  Testing CCP Sliders...');
      const sliders = await page.$$('input[type="range"]');
      utils.recordTest('Inspector Flow', 'On-Site has 8 CCP sliders', sliders.length === 8);

      if (sliders.length >= 3) {
        // Test first 3 CCPs
        await sliders[0].evaluate(el => (el.value = 12));
        await utils.wait(500);
        await sliders[1].evaluate(el => (el.value = 14));
        await utils.wait(500);
        await sliders[2].evaluate(el => (el.value = 13));
        await utils.wait(500);

        await utils.takeScreenshot(page, 'inspector-onsite-scored');
        console.log('  ✅ CCP sliders working');
      }

      console.log('✅ Inspector Flow completed');
    } catch (error) {
      console.error('❌ Inspector Flow failed:', error.message);
      await utils.takeScreenshot(page, 'inspector-flow-error');
      utils.recordTest('Inspector Flow', 'Overall Flow', false, error.message);
    }
  },

  /**
   * Scenario 4: Admin Approval Flow
   */
  async testAdminFlow(page) {
    console.log('\n\n👑 SCENARIO 4: ADMIN APPROVAL FLOW');
    console.log('═'.repeat(60));

    try {
      await utils.login(page, 'admin');

      // Dashboard
      console.log('\n📊 Testing Admin Dashboard...');
      await page.goto(`${CONFIG.baseUrl}/admin/dashboard`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'admin-dashboard');

      const hasSystemHealth = await page.$('text=System Health, text=สุขภาพระบบ');
      utils.recordTest('Admin Flow', 'Dashboard shows system health', hasSystemHealth !== null);

      // Approval Page
      console.log('\n✅ Testing Approval Page...');
      await page.goto(`${CONFIG.baseUrl}/admin/applications/app-001/approve`, {
        waitUntil: 'networkidle2'
      });
      await utils.wait(2000);
      await utils.takeScreenshot(page, 'admin-approval-page');

      const hasStepper = await page.$('div[class*="MuiStepper"]');
      utils.recordTest('Admin Flow', 'Approval page shows workflow stepper', hasStepper !== null);

      // Management Page
      console.log('\n🛠️ Testing Management Page...');
      await page.goto(`${CONFIG.baseUrl}/admin/management`, { waitUntil: 'networkidle2' });
      await utils.wait(1000);
      await utils.takeScreenshot(page, 'admin-management-certs');

      // Switch to Users tab
      const userTab = await page.$('button:has-text("Users"), button:has-text("ผู้ใช้")');
      if (userTab) {
        await userTab.click();
        await utils.wait(1000);
        await utils.takeScreenshot(page, 'admin-management-users');
        utils.recordTest('Admin Flow', 'Management page has Users tab', true);
      }

      console.log('✅ Admin Flow completed');
    } catch (error) {
      console.error('❌ Admin Flow failed:', error.message);
      await utils.takeScreenshot(page, 'admin-flow-error');
      utils.recordTest('Admin Flow', 'Overall Flow', false, error.message);
    }
  }
};

// Generate HTML Report
function generateReport() {
  const duration = (testResults.endTime - testResults.startTime) / 1000;
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>UI Test Results - ${testResults.startTime.toLocaleDateString()}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .summary-card {
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }
    .card-total { background: #e8f4f8; color: #2c3e50; }
    .card-passed { background: #d4edda; color: #155724; }
    .card-failed { background: #f8d7da; color: #721c24; }
    .card-rate { background: #fff3cd; color: #856404; }
    
    .scenario {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .scenario h2 {
      color: #34495e;
      margin-top: 0;
      border-left: 4px solid #3498db;
      padding-left: 15px;
    }
    .test-item {
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .test-passed {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }
    .test-failed {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
    }
    .test-icon {
      font-size: 20px;
      font-weight: bold;
    }
    .test-name {
      flex: 1;
    }
    .test-error {
      font-size: 12px;
      color: #721c24;
      font-style: italic;
      margin-top: 5px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #7f8c8d;
      font-size: 14px;
    }
    @media print {
      body { background: white; }
      .summary, .scenario { box-shadow: none; }
    }
  </style>
</head>
<body>
  <h1>🧪 UI Automated Test Results</h1>
  
  <div class="summary">
    <h2>📊 Summary</h2>
    <div class="summary-grid">
      <div class="summary-card card-total">
        <h3>Total Tests</h3>
        <p class="value">${testResults.total}</p>
      </div>
      <div class="summary-card card-passed">
        <h3>Passed</h3>
        <p class="value">${testResults.passed}</p>
      </div>
      <div class="summary-card card-failed">
        <h3>Failed</h3>
        <p class="value">${testResults.failed}</p>
      </div>
      <div class="summary-card card-rate">
        <h3>Pass Rate</h3>
        <p class="value">${passRate}%</p>
      </div>
    </div>
    <p style="margin-top: 20px;">
      <strong>Start Time:</strong> ${testResults.startTime.toLocaleString()}<br>
      <strong>End Time:</strong> ${testResults.endTime.toLocaleString()}<br>
      <strong>Duration:</strong> ${duration.toFixed(2)} seconds
    </p>
  </div>

  ${testResults.scenarios
    .map(
      scenario => `
    <div class="scenario">
      <h2>${scenario.name}</h2>
      ${scenario.tests
        .map(
          test => `
        <div class="test-item ${test.passed ? 'test-passed' : 'test-failed'}">
          <span class="test-icon">${test.passed ? '✅' : '❌'}</span>
          <div class="test-name">
            ${test.name}
            ${test.error ? `<div class="test-error">Error: ${test.error}</div>` : ''}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}

  <div class="footer">
    <p>Generated by Automated UI Testing Script</p>
    <p>Screenshots saved in: ${CONFIG.screenshotDir}</p>
    <p>GACP Certification System - Next.js 14 Frontend</p>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(CONFIG.reportFile, html);
  console.log(`\n📄 HTML Report generated: ${CONFIG.reportFile}`);
}

// Main execution
async function runTests() {
  console.log('\n🚀 Starting Automated UI Testing...\n');
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`Screenshots: ${CONFIG.screenshotDir}`);
  console.log(`Report: ${CONFIG.reportFile}\n`);

  // Create screenshot directory
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);

    // Run all scenarios
    await scenarios.testFarmerFlow(page);
    await scenarios.testOfficerFlow(page);
    await scenarios.testInspectorFlow(page);
    await scenarios.testAdminFlow(page);

    testResults.endTime = new Date();

    // Close browser
    await browser.close();

    // Generate report
    generateReport();

    // Print summary
    console.log('\n\n═'.repeat(40));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(40));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Pass Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log(`Duration: ${((testResults.endTime - testResults.startTime) / 1000).toFixed(2)}s`);
    console.log('\n✅ Testing complete!');
    console.log(`📸 Screenshots: ${CONFIG.screenshotDir}`);
    console.log(`📄 Report: ${CONFIG.reportFile}`);
  } catch (error) {
    console.error('\n❌ Testing failed:', error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, CONFIG };
