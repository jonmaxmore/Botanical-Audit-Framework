/**
 * 🤖 Automated UI Screenshot Testing Script
 * Uses Puppeteer to capture screenshots of all 18 pages
 *
 * Installation:
 *   npm install -D puppeteer
 *
 * Run:
 *   node scripts/automated-screenshot-test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  screenshotDir: path.join(__dirname, '../test-screenshots'),
  viewport: { width: 1920, height: 1080 },
  delay: 1000 // Wait 1s between actions
};

// Test scenarios with pages
const SCENARIOS = [
  {
    name: 'Scenario 1 - Farmer Flow',
    user: { email: 'farmer@example.com', password: 'test123', role: 'Farmer' },
    pages: [
      { name: '1-Login', url: '/login', action: 'login' },
      { name: '2-Dashboard', url: '/farmer/dashboard', waitFor: 'h4' },
      { name: '3-Application-Form-Step1', url: '/farmer/applications/new', waitFor: 'form' },
      {
        name: '4-Application-View',
        url: '/farmer/applications/app-001',
        waitFor: '.MuiStepper-root'
      },
      { name: '5-Upload-Documents', url: '/farmer/applications/app-001/upload', waitFor: 'h5' },
      { name: '6-Payment', url: '/farmer/applications/app-001/payment', waitFor: 'img' }
    ]
  },
  {
    name: 'Scenario 2 - Officer Review',
    user: { email: 'officer@example.com', password: 'test123', role: 'Officer' },
    pages: [
      { name: '1-Officer-Login', url: '/login', action: 'login' },
      { name: '2-Officer-Dashboard', url: '/officer/dashboard', waitFor: 'h4' },
      { name: '3-Applications-List', url: '/officer/applications', waitFor: 'table' },
      { name: '4-Review-Page', url: '/officer/applications/app-001/review', waitFor: 'form' }
    ]
  },
  {
    name: 'Scenario 3 - Inspector Inspection',
    user: { email: 'inspector@example.com', password: 'test123', role: 'Inspector' },
    pages: [
      { name: '1-Inspector-Login', url: '/login', action: 'login' },
      { name: '2-Inspector-Dashboard', url: '/inspector/dashboard', waitFor: 'h4' },
      { name: '3-Schedule', url: '/inspector/schedule', waitFor: '.MuiCard-root' },
      { name: '4-VDO-Call', url: '/inspector/inspections/ins-001/vdo-call', waitFor: 'form' },
      {
        name: '5-On-Site-Inspection',
        url: '/inspector/inspections/ins-002/on-site',
        waitFor: '.MuiAccordion-root'
      }
    ]
  },
  {
    name: 'Scenario 4 - Admin Approval',
    user: { email: 'admin@example.com', password: 'test123', role: 'Admin' },
    pages: [
      { name: '1-Admin-Login', url: '/login', action: 'login' },
      { name: '2-Admin-Dashboard', url: '/admin/dashboard', waitFor: 'h4' },
      {
        name: '3-Approval-Page',
        url: '/admin/applications/app-001/approve',
        waitFor: '.MuiStepper-root'
      },
      { name: '4-Management-Certificates', url: '/admin/management', waitFor: 'table' }
    ]
  }
];

/**
 * Create screenshot directory
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Login helper
 */
async function login(page, user) {
  console.log(`  🔐 Logging in as ${user.role}...`);

  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  await page.type('input[name="email"]', user.email);
  await page.type('input[name="password"]', user.password);

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log(`  ✅ Logged in successfully`);
}

/**
 * Take screenshot of a page
 */
async function captureScreenshot(page, scenario, pageInfo, screenshotPath) {
  try {
    console.log(`  📸 Capturing: ${pageInfo.name}`);

    // Navigate to page
    if (pageInfo.url) {
      await page.goto(`${CONFIG.baseUrl}${pageInfo.url}`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
    }

    // Wait for specific element if specified
    if (pageInfo.waitFor) {
      await page.waitForSelector(pageInfo.waitFor, { timeout: 5000 });
    }

    // Wait for delay
    await page.waitForTimeout(CONFIG.delay);

    // Take screenshot
    const filename = `${scenario.name.replace(/\s+/g, '-')}_${pageInfo.name}.png`;
    const fullPath = path.join(screenshotPath, filename);

    await page.screenshot({
      path: fullPath,
      fullPage: true
    });

    console.log(`  ✅ Saved: ${filename}`);
    return { success: true, filename };
  } catch (error) {
    console.log(`  ❌ Failed: ${pageInfo.name} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Run all scenarios
 */
async function runTests() {
  console.log('🚀 Starting Automated UI Screenshot Testing...\n');

  // Create screenshot directory
  ensureDirectoryExists(CONFIG.screenshotDir);

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true, // Set to false to see browser
    defaultViewport: CONFIG.viewport,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  try {
    for (const scenario of SCENARIOS) {
      console.log(`\n📋 ${scenario.name}`);
      console.log('─'.repeat(50));

      const page = await browser.newPage();
      const scenarioResults = {
        scenario: scenario.name,
        user: scenario.user.role,
        pages: []
      };

      try {
        // Navigate to login page
        await page.goto(`${CONFIG.baseUrl}/login`, {
          waitUntil: 'networkidle2'
        });

        // Login
        await login(page, scenario.user);

        // Capture each page
        for (const pageInfo of scenario.pages) {
          if (pageInfo.action === 'login') continue; // Skip login screenshot

          const result = await captureScreenshot(page, scenario, pageInfo, CONFIG.screenshotDir);

          scenarioResults.pages.push({
            name: pageInfo.name,
            ...result
          });
        }

        console.log(`\n✅ ${scenario.name} completed`);
      } catch (error) {
        console.log(`\n❌ ${scenario.name} failed: ${error.message}`);
        scenarioResults.error = error.message;
      } finally {
        await page.close();
      }

      results.push(scenarioResults);
    }
  } finally {
    await browser.close();
  }

  // Generate summary report
  generateReport(results);
}

/**
 * Generate HTML report
 */
function generateReport(results) {
  console.log('\n📊 Generating Test Report...\n');

  const totalPages = results.reduce((sum, r) => sum + r.pages.length, 0);
  const successPages = results.reduce((sum, r) => sum + r.pages.filter(p => p.success).length, 0);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Screenshot Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #1976d2; margin-bottom: 10px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .summary-card {
      background: #f0f4ff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #1976d2; }
    .scenario {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .scenario h2 { color: #333; margin-bottom: 20px; }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .screenshot {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
    }
    .screenshot:hover { transform: scale(1.02); }
    .screenshot img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      object-position: top;
      cursor: pointer;
    }
    .screenshot .info {
      padding: 15px;
      background: #f9f9f9;
    }
    .screenshot .name { font-weight: bold; color: #333; margin-bottom: 5px; }
    .screenshot .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .status.success { background: #4caf50; color: white; }
    .status.failed { background: #f44336; color: white; }
    .error { color: #f44336; margin-top: 5px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 UI Screenshot Test Report</h1>
      <p>Generated: ${new Date().toLocaleString('th-TH')}</p>
      <div class="summary">
        <div class="summary-card">
          <h3>Total Scenarios</h3>
          <div class="value">${results.length}</div>
        </div>
        <div class="summary-card">
          <h3>Total Pages</h3>
          <div class="value">${totalPages}</div>
        </div>
        <div class="summary-card">
          <h3>Success</h3>
          <div class="value" style="color: #4caf50;">${successPages}</div>
        </div>
        <div class="summary-card">
          <h3>Pass Rate</h3>
          <div class="value">${((successPages / totalPages) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
    
    ${results
      .map(
        scenario => `
      <div class="scenario">
        <h2>${scenario.scenario}</h2>
        <p><strong>User:</strong> ${scenario.user}</p>
        ${scenario.error ? `<p class="error">Error: ${scenario.error}</p>` : ''}
        <div class="screenshots">
          ${scenario.pages
            .map(
              page => `
            <div class="screenshot">
              ${
                page.success
                  ? `
                <img src="${page.filename}" alt="${page.name}" onclick="window.open(this.src)">
              `
                  : `
                <div style="height: 200px; background: #f44336; display: flex; align-items: center; justify-content: center; color: white;">
                  ❌ Failed
                </div>
              `
              }
              <div class="info">
                <div class="name">${page.name}</div>
                <span class="status ${page.success ? 'success' : 'failed'}">
                  ${page.success ? '✅ Success' : '❌ Failed'}
                </span>
                ${page.error ? `<div class="error">${page.error}</div>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>
  `;

  const reportPath = path.join(CONFIG.screenshotDir, 'test-report.html');
  fs.writeFileSync(reportPath, html);

  console.log('─'.repeat(50));
  console.log(`\n✅ Testing Complete!`);
  console.log(`\n📊 Results:`);
  console.log(`   Total Scenarios: ${results.length}`);
  console.log(`   Total Pages: ${totalPages}`);
  console.log(`   Success: ${successPages}`);
  console.log(`   Failed: ${totalPages - successPages}`);
  console.log(`   Pass Rate: ${((successPages / totalPages) * 100).toFixed(1)}%`);
  console.log(`\n📁 Screenshots: ${CONFIG.screenshotDir}`);
  console.log(`📄 Report: ${reportPath}`);
  console.log(`\nOpen report in browser to view results.\n`);
}

// Run tests
runTests().catch(console.error);
