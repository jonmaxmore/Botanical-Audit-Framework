#!/usr/bin/env node
/**
 * Console Smoke Tests - ทดสอบระบบแบบรวดเร็วโดยไม่ต้องใช้ MongoDB/Redis
 * รันด้วย: node smoke-test-console.js
 */

console.log("=".repeat(70));
console.log("🧪 GACP Platform - Console Smoke Tests");
console.log("=".repeat(70));
console.log("");

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
}

// ========================================
// Test 1: Load Core Modules
// ========================================
test("Load business-logic/gacp-application", () => {
  const path = "./business-logic/gacp-application.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("class GACPApplication")) {
    throw new Error("GACPApplication class not found");
  }
});

test("Load business-logic/gacp-certificate-generator", () => {
  const path = "./business-logic/gacp-certificate-generator.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("class GACPCertificateGenerator")) {
    throw new Error("GACPCertificateGenerator class not found");
  }
});

test("Load business-logic/gacp-field-inspection-system", () => {
  const path = "./business-logic/gacp-field-inspection-system.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("class GACPFieldInspection")) {
    throw new Error("GACPFieldInspection class not found");
  }
});

test("Load apps/backend/services/notificationService", () => {
  const path = "./apps/backend/services/notificationService.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`File not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("notificationService")) {
    throw new Error("notificationService not found");
  }
});

// ========================================
// Test 2: Check Phase 2 Infrastructure Files
// ========================================
test("Check Phase 2 - Queue Service exists", () => {
  const path = "./apps/backend/services/queue/queueService.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`Queue service not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("Bull")) {
    throw new Error("Bull queue library not imported");
  }
});

test("Check Phase 2 - Cache Service exists", () => {
  const path = "./apps/backend/services/cache/cacheService.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`Cache service not found: ${path}`);
  }
  const content = fs.readFileSync(path, "utf-8");
  if (!content.includes("redis") && !content.includes("Redis")) {
    throw new Error("Redis library not imported");
  }
});

test("Check Phase 2 - Metrics Service exists", () => {
  const path = "./apps/backend/services/metrics/metricsService.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`Metrics service not found: ${path}`);
  }
});

test("Check Phase 2 - Alert Service exists", () => {
  const path = "./apps/backend/services/alerts/alertService.js";
  const fs = require("fs");
  if (!fs.existsSync(path)) {
    throw new Error(`Alert service not found: ${path}`);
  }
});

// ========================================
// Test 3: Verify Phase 2.5 Integration
// ========================================
test("Phase 2.5 - gacp-application integrated with Queue", () => {
  const path = "./business-logic/gacp-application.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("queueService")) {
    throw new Error("queueService not imported in gacp-application");
  }

  if (!content.includes("addEmailJob") && !content.includes("addJob")) {
    throw new Error("Queue methods not used in gacp-application");
  }
});

test("Phase 2.5 - gacp-application integrated with Cache", () => {
  const path = "./business-logic/gacp-application.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("cacheService")) {
    throw new Error("cacheService not imported in gacp-application");
  }

  if (
    !content.includes("cacheService.get") ||
    !content.includes("cacheService.set")
  ) {
    throw new Error("Cache methods not used in gacp-application");
  }
});

test("Phase 2.5 - gacp-certificate-generator integrated with Queue", () => {
  const path = "./business-logic/gacp-certificate-generator.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("queueService")) {
    throw new Error("queueService not imported in gacp-certificate-generator");
  }
});

test("Phase 2.5 - gacp-certificate-generator integrated with Cache", () => {
  const path = "./business-logic/gacp-certificate-generator.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("cacheService")) {
    throw new Error("cacheService not imported in gacp-certificate-generator");
  }
});

test("Phase 2.5 - gacp-field-inspection integrated with Queue", () => {
  const path = "./business-logic/gacp-field-inspection-system.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("queueService")) {
    throw new Error("queueService not imported in gacp-field-inspection");
  }
});

test("Phase 2.5 - notificationService integrated with Queue", () => {
  const path = "./apps/backend/services/notificationService.js";
  const fs = require("fs");
  const content = fs.readFileSync(path, "utf-8");

  if (!content.includes("queueService")) {
    throw new Error("queueService not imported in notificationService");
  }
});

// ========================================
// Test 4: Check Configuration Files
// ========================================
test("Environment template exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./.env.example")) {
    throw new Error(".env.example not found");
  }
});

test("Docker compose configuration exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./docker-compose.yml")) {
    throw new Error("docker-compose.yml not found");
  }
});

test("Package.json has required dependencies", () => {
  const pkg = require("./package.json");

  if (!pkg.dependencies.bull) {
    throw new Error("Bull not found in dependencies");
  }
});

// ========================================
// Test 5: Code Quality Checks
// ========================================
test("ESLint configuration exists", () => {
  const fs = require("fs");
  const backendEslint = fs.existsSync("./apps/backend/.eslintrc.js");
  const rootEslint =
    fs.existsSync("./.eslintrc.js") || fs.existsSync("./.eslintrc.json");

  if (!backendEslint && !rootEslint) {
    throw new Error("ESLint configuration not found");
  }
});

test("TypeScript configuration exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./tsconfig.json")) {
    throw new Error("tsconfig.json not found");
  }
});

test("Jest configuration exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./jest.config.js")) {
    throw new Error("jest.config.js not found");
  }
});

// ========================================
// Test 6: Documentation Check
// ========================================
test("README exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./README.md")) {
    throw new Error("README.md not found");
  }
});

test("Phase 2.5 integration documentation exists", () => {
  const fs = require("fs");
  if (!fs.existsSync("./PHASE2.5_INTEGRATION_COMPLETE.md")) {
    throw new Error("PHASE2.5_INTEGRATION_COMPLETE.md not found");
  }
});

// ========================================
// Test 7: Git Status Check
// ========================================
test("Git repository initialized", () => {
  const fs = require("fs");
  if (!fs.existsSync("./.git")) {
    throw new Error("Git repository not initialized");
  }
});

test(".gitignore properly configured", () => {
  const fs = require("fs");
  const gitignore = fs.readFileSync("./.gitignore", "utf-8");

  if (!gitignore.includes(".env")) {
    throw new Error(".env not in .gitignore");
  }

  if (!gitignore.includes("node_modules")) {
    throw new Error("node_modules not in .gitignore");
  }
});

// ========================================
// Run All Tests
// ========================================
(async () => {
  console.log(`Running ${tests.length} smoke tests...\n`);

  await runTests();

  console.log("");
  console.log("=".repeat(70));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(70));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${tests.length}`);
  console.log(
    `🎯 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`
  );
  console.log("=".repeat(70));

  if (failed > 0) {
    console.log("");
    console.log("⚠️  Some tests failed. Please review the errors above.");
    process.exit(1);
  } else {
    console.log("");
    console.log("🎉 All smoke tests passed! System is ready.");
    process.exit(0);
  }
})();
