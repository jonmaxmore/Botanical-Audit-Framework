#!/usr/bin/env node

/**
 * 📊 Load Test Runner
 * รันการทดสอบแบบจำลองสถานการณ์จริง
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configurations
const TESTS = {
  'smoke': {
    name: '💨 Smoke Test',
    description: 'ทดสอบพื้นฐานว่าระบบทำงานได้',
    duration: 60,
    users: 10,
    file: 'smoke-test.yml'
  },
  'load': {
    name: '📈 Load Test',
    description: 'ทดสอบภาระงานปกติ (1,000 users/day)',
    duration: 300,
    users: 50,
    file: 'test-scenarios.yml'
  },
  'stress': {
    name: '💪 Stress Test',
    description: 'ทดสอบความทนทาน (Peak hours)',
    duration: 600,
    users: 200,
    file: 'stress-test.yml'
  },
  'spike': {
    name: '⚡ Spike Test',
    description: 'ทดสอบการเพิ่มขึ้นกะทันหัน',
    duration: 300,
    users: 500,
    file: 'spike-test.yml'
  },
  'soak': {
    name: '🕐 Soak Test',
    description: 'ทดสอบระยะยาว (8 hours)',
    duration: 28800,
    users: 30,
    file: 'soak-test.yml'
  },
  'full-day': {
    name: '🌅 Full Day Simulation',
    description: 'จำลองการใช้งานวันจันทร์-ศุกร์ เต็มวัน (09:00-17:00)',
    duration: 28800, // 8 hours
    users: 'variable',
    file: 'test-scenarios.yml'
  }
};

class LoadTestRunner {
  constructor(testType = 'load') {
    this.testType = testType;
    this.config = TESTS[testType];
    this.resultsDir = path.join(__dirname, '../results');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  printBanner() {
    console.log('\n' + '='.repeat(70));
    console.log(`  🎯 GACP Platform - Load Testing`);
    console.log('='.repeat(70));
    console.log(`\n  Test Type: ${this.config.name}`);
    console.log(`  Description: ${this.config.description}`);
    console.log(`  Duration: ${this.config.duration}s (${Math.floor(this.config.duration / 60)} minutes)`);
    console.log(`  Concurrent Users: ${this.config.users}`);
    console.log('\n' + '='.repeat(70) + '\n');
  }

  checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');

    // Check if Artillery is installed
    try {
      execSync('artillery --version', { stdio: 'ignore' });
      console.log('✅ Artillery installed');
    } catch {
      console.error('❌ Artillery not found. Install with: npm install -g artillery');
      process.exit(1);
    }

    // Check if backend is running
    try {
      const { execSync: exec } = require('child_process');
      exec('curl -s http://localhost:5000/health', { stdio: 'ignore' });
      console.log('✅ Backend server running');
    } catch {
      console.warn('⚠️  Backend server not detected. Make sure it\'s running on port 5000');
    }

    // Create results directory
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
      console.log('✅ Results directory created');
    }

    console.log('');
  }

  runTest() {
    console.log('🚀 Starting load test...\n');

    const configPath = path.join(__dirname, '../config', this.config.file);
    const reportPath = path.join(this.resultsDir, `report-${this.testType}-${this.timestamp}.json`);
    const htmlReportPath = path.join(this.resultsDir, `report-${this.testType}-${this.timestamp}.html`);

    try {
      // Run Artillery with JSON output
      console.log('📊 Running Artillery...\n');
      
      const command = `artillery run ${configPath} --output ${reportPath}`;
      
      execSync(command, { 
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' }
      });

      // Generate HTML report
      console.log('\n📄 Generating HTML report...\n');
      execSync(`artillery report ${reportPath} --output ${htmlReportPath}`, {
        stdio: 'inherit'
      });

      console.log('\n✅ Test completed successfully!\n');
      console.log(`📊 JSON Report: ${reportPath}`);
      console.log(`📄 HTML Report: ${htmlReportPath}\n`);

      // Parse and display summary
      this.displaySummary(reportPath);

    } catch (error) {
      console.error('\n❌ Load test failed:', error.message);
      process.exit(1);
    }
  }

  displaySummary(reportPath) {
    try {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const summary = report.aggregate;

      console.log('\n' + '='.repeat(70));
      console.log('  📊 TEST SUMMARY');
      console.log('='.repeat(70));
      console.log('\n📈 Request Statistics:');
      console.log(`  Total Requests: ${summary.counters['http.requests']?.toLocaleString() || 0}`);
      console.log(`  Successful: ${summary.counters['http.responses']?.toLocaleString() || 0}`);
      console.log(`  Failed: ${summary.counters['http.request_rate']?.toLocaleString() || 0}`);
      
      if (summary.rates) {
        console.log(`  Requests/sec: ${summary.rates['http.request_rate']?.toFixed(2) || 0}`);
      }

      console.log('\n⏱️  Response Times:');
      console.log(`  Min: ${summary.summaries?.['http.response_time']?.min || 0}ms`);
      console.log(`  Median: ${summary.summaries?.['http.response_time']?.median || 0}ms`);
      console.log(`  p95: ${summary.summaries?.['http.response_time']?.p95 || 0}ms`);
      console.log(`  p99: ${summary.summaries?.['http.response_time']?.p99 || 0}ms`);
      console.log(`  Max: ${summary.summaries?.['http.response_time']?.max || 0}ms`);

      console.log('\n🎯 Status Codes:');
      Object.entries(summary.counters || {}).forEach(([key, value]) => {
        if (key.startsWith('http.codes.')) {
          const code = key.replace('http.codes.', '');
          const emoji = code.startsWith('2') ? '✅' : code.startsWith('4') ? '⚠️' : '❌';
          console.log(`  ${emoji} ${code}: ${value.toLocaleString()}`);
        }
      });

      // Performance assessment
      console.log('\n🏆 Performance Assessment:');
      const p95 = summary.summaries?.['http.response_time']?.p95 || 0;
      const errorRate = (summary.counters['errors.ETIMEDOUT'] || 0) / 
                        (summary.counters['http.requests'] || 1) * 100;

      if (p95 < 1000 && errorRate < 1) {
        console.log('  ✅ EXCELLENT - System performing well!');
      } else if (p95 < 2000 && errorRate < 5) {
        console.log('  ⚠️  GOOD - Minor optimization recommended');
      } else if (p95 < 5000 && errorRate < 10) {
        console.log('  ⚠️  FAIR - Performance tuning needed');
      } else {
        console.log('  ❌ POOR - Critical optimization required!');
      }

      console.log('\n' + '='.repeat(70) + '\n');

    } catch (error) {
      console.warn('⚠️  Could not parse summary:', error.message);
    }
  }

  generateRecommendations(report) {
    console.log('\n💡 RECOMMENDATIONS:\n');

    const p95 = report.aggregate.summaries?.['http.response_time']?.p95 || 0;
    const errorRate = (report.aggregate.counters['errors.ETIMEDOUT'] || 0) / 
                      (report.aggregate.counters['http.requests'] || 1) * 100;

    if (p95 > 2000) {
      console.log('  🔧 Response Time > 2s:');
      console.log('     - Add Redis caching for frequently accessed data');
      console.log('     - Optimize database queries with indexes');
      console.log('     - Implement CDN for static assets');
      console.log('     - Enable database connection pooling\n');
    }

    if (errorRate > 5) {
      console.log('  🔧 High Error Rate (>5%):');
      console.log('     - Increase server resources (CPU/RAM)');
      console.log('     - Implement rate limiting');
      console.log('     - Add circuit breakers for external APIs');
      console.log('     - Scale horizontally with load balancer\n');
    }

    console.log('  📚 General Best Practices:');
    console.log('     - Enable GZIP compression');
    console.log('     - Implement request/response caching');
    console.log('     - Use async/await for I/O operations');
    console.log('     - Monitor with APM tools (New Relic, DataDog)');
    console.log('     - Set up auto-scaling based on load\n');
  }
}

// CLI
const testType = process.argv[2] || 'load';

if (!TESTS[testType]) {
  console.error(`\n❌ Invalid test type: ${testType}\n`);
  console.log('Available tests:');
  Object.entries(TESTS).forEach(([key, config]) => {
    console.log(`  - ${key}: ${config.description}`);
  });
  console.log('\nUsage: node run-load-test.js [test-type]\n');
  process.exit(1);
}

const runner = new LoadTestRunner(testType);
runner.printBanner();
runner.checkPrerequisites();
runner.runTest();
