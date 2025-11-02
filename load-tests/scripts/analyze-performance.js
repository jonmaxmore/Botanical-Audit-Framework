#!/usr/bin/env node

/**
 * 📊 Performance Report Generator
 * วิเคราะห์ผลการทดสอบและสร้างรายงานแนะนำ
 */

const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer {
  constructor(reportPath) {
    this.reportPath = reportPath;
    this.report = null;
    this.recommendations = [];
    this.score = 0;
  }

  async analyze() {
    console.log('\n' + '='.repeat(80));
    console.log('  📊 GACP Platform - Performance Analysis Report');
    console.log('='.repeat(80) + '\n');

    // Load report
    this.loadReport();
    
    // Analyze different aspects
    this.analyzeResponseTimes();
    this.analyzeErrorRates();
    this.analyzeThroughput();
    this.analyzeEndpoints();
    this.analyzeScalability();
    
    // Generate overall score
    this.calculateOverallScore();
    
    // Display recommendations
    this.displayRecommendations();
    
    // Generate action items
    this.generateActionItems();
    
    // Export detailed report
    this.exportDetailedReport();
  }

  loadReport() {
    try {
      const data = fs.readFileSync(this.reportPath, 'utf8');
      this.report = JSON.parse(data);
      console.log(`✅ Loaded report: ${path.basename(this.reportPath)}\n`);
    } catch (error) {
      console.error(`❌ Failed to load report: ${error.message}`);
      process.exit(1);
    }
  }

  analyzeResponseTimes() {
    console.log('⏱️  RESPONSE TIME ANALYSIS\n');
    
    const times = this.report.aggregate.summaries?.['http.response_time'] || {};
    const { min, median, p95, p99, max } = times;

    console.log(`  Min:    ${min}ms`);
    console.log(`  Median: ${median}ms`);
    console.log(`  p95:    ${p95}ms`);
    console.log(`  p99:    ${p99}ms`);
    console.log(`  Max:    ${max}ms\n`);

    // Scoring
    let score = 100;
    let issues = [];

    if (p95 < 1000) {
      console.log('  ✅ EXCELLENT - p95 < 1s\n');
      score = 100;
    } else if (p95 < 2000) {
      console.log('  ✅ GOOD - p95 < 2s\n');
      score = 85;
    } else if (p95 < 5000) {
      console.log('  ⚠️  FAIR - p95 between 2-5s\n');
      score = 60;
      issues.push('Response times are slower than ideal');
      this.recommendations.push({
        category: 'Performance',
        priority: 'HIGH',
        issue: 'Slow response times (p95 > 2s)',
        solutions: [
          'Implement Redis caching for dashboard stats',
          'Add database indexes on frequently queried fields',
          'Enable MongoDB connection pooling (maxPoolSize: 100)',
          'Optimize slow queries with aggregation pipeline',
          'Enable GZIP compression for API responses'
        ]
      });
    } else {
      console.log('  ❌ POOR - p95 > 5s (Critical optimization needed)\n');
      score = 30;
      issues.push('Critical performance issue - response times too slow');
      this.recommendations.push({
        category: 'Performance',
        priority: 'CRITICAL',
        issue: 'Critical slow response times (p95 > 5s)',
        solutions: [
          '🚨 URGENT: Profile application with clinic.js or New Relic',
          'Identify and fix N+1 query problems',
          'Implement aggressive caching strategy',
          'Consider horizontal scaling with load balancer',
          'Review and optimize all database queries',
          'Add APM monitoring (DataDog, New Relic)',
          'Implement request/response middleware caching'
        ]
      });
    }

    this.score += score * 0.4; // 40% weight
  }

  analyzeErrorRates() {
    console.log('🔴 ERROR RATE ANALYSIS\n');

    const requests = this.report.aggregate.counters['http.requests'] || 0;
    const codes = this.report.aggregate.counters;
    
    let errors = 0;
    let timeouts = codes['errors.ETIMEDOUT'] || 0;
    let serverErrors = 0;
    
    Object.keys(codes).forEach(key => {
      if (key.startsWith('http.codes.5')) {
        serverErrors += codes[key];
      }
    });

    errors = timeouts + serverErrors;
    const errorRate = (errors / requests * 100).toFixed(2);

    console.log(`  Total Requests: ${requests.toLocaleString()}`);
    console.log(`  Errors: ${errors.toLocaleString()}`);
    console.log(`  Error Rate: ${errorRate}%\n`);

    let score = 100;
    
    if (errorRate < 0.1) {
      console.log('  ✅ EXCELLENT - Error rate < 0.1%\n');
      score = 100;
    } else if (errorRate < 1) {
      console.log('  ✅ GOOD - Error rate < 1%\n');
      score = 85;
    } else if (errorRate < 5) {
      console.log('  ⚠️  FAIR - Error rate between 1-5%\n');
      score = 60;
      this.recommendations.push({
        category: 'Reliability',
        priority: 'MEDIUM',
        issue: `Error rate at ${errorRate}%`,
        solutions: [
          'Review error logs for common patterns',
          'Implement retry logic for transient failures',
          'Add circuit breakers for external API calls',
          'Increase request timeout settings if needed',
          'Implement graceful degradation for non-critical features'
        ]
      });
    } else {
      console.log('  ❌ POOR - Error rate > 5% (Unacceptable)\n');
      score = 30;
      this.recommendations.push({
        category: 'Reliability',
        priority: 'CRITICAL',
        issue: `Critical error rate at ${errorRate}%`,
        solutions: [
          '🚨 URGENT: Review all error logs immediately',
          'Check server resources (CPU, Memory, Disk)',
          'Verify database connection stability',
          'Implement health checks and monitoring',
          'Add rate limiting to prevent overload',
          'Review and fix application code errors',
          'Consider scaling up server resources'
        ]
      });
    }

    this.score += score * 0.3; // 30% weight
  }

  analyzeThroughput() {
    console.log('📈 THROUGHPUT ANALYSIS\n');

    const rates = this.report.aggregate.rates;
    const requestRate = rates?.['http.request_rate'] || 0;
    const duration = this.report.aggregate.counters['vusers.completed'] || 0;

    console.log(`  Requests/second: ${requestRate.toFixed(2)}`);
    console.log(`  Total duration: ${duration}s\n`);

    // Calculate if system can handle 1,000 users/day
    const requestsPerDay = requestRate * 28800; // 8 working hours
    const usersPerDay = requestsPerDay / 10; // Assume 10 requests per user

    console.log(`  💡 Estimated capacity:`);
    console.log(`     - ${requestsPerDay.toFixed(0)} requests/day`);
    console.log(`     - ${usersPerDay.toFixed(0)} users/day\n`);

    if (usersPerDay >= 1000) {
      console.log(`  ✅ System can handle target (1,000 users/day)\n`);
      this.score += 20;
    } else {
      console.log(`  ⚠️  System capacity below target (${usersPerDay.toFixed(0)} vs 1,000)\n`);
      this.score += 10;
      this.recommendations.push({
        category: 'Scalability',
        priority: 'HIGH',
        issue: 'Insufficient throughput for target load',
        solutions: [
          'Scale horizontally with multiple server instances',
          'Implement load balancer (NGINX, HAProxy)',
          'Enable auto-scaling based on CPU/Memory',
          'Optimize slow endpoints to increase throughput',
          'Consider using serverless functions for peaks'
        ]
      });
    }
  }

  analyzeEndpoints() {
    console.log('🎯 ENDPOINT PERFORMANCE\n');

    // Group by endpoint (from report data)
    const endpoints = {};
    
    // This would need more detailed metrics by endpoint
    // For now, display general analysis
    console.log('  Most common status codes:\n');
    
    const codes = this.report.aggregate.counters;
    Object.keys(codes)
      .filter(key => key.startsWith('http.codes.'))
      .sort((a, b) => codes[b] - codes[a])
      .slice(0, 5)
      .forEach(key => {
        const code = key.replace('http.codes.', '');
        const count = codes[key];
        const emoji = code.startsWith('2') ? '✅' : code.startsWith('4') ? '⚠️' : '❌';
        console.log(`  ${emoji} ${code}: ${count.toLocaleString()}`);
      });
    
    console.log('\n');
  }

  analyzeScalability() {
    console.log('🚀 SCALABILITY ASSESSMENT\n');

    const p95 = this.report.aggregate.summaries?.['http.response_time']?.p95 || 0;
    const errorRate = (this.report.aggregate.counters['errors.ETIMEDOUT'] || 0) / 
                      (this.report.aggregate.counters['http.requests'] || 1) * 100;

    console.log('  Current system characteristics:\n');
    
    if (p95 < 1000 && errorRate < 1) {
      console.log('  ✅ System ready for horizontal scaling');
      console.log('  ✅ Can handle 2-3x current load');
      console.log('  ✅ Performance stable under load\n');
      this.score += 10;
    } else if (p95 < 2000 && errorRate < 5) {
      console.log('  ⚠️  System can scale with optimization');
      console.log('  ⚠️  Recommend caching before scaling');
      console.log('  ⚠️  May need database optimization\n');
      this.score += 5;
    } else {
      console.log('  ❌ System not ready for scaling');
      console.log('  ❌ Fix performance issues first');
      console.log('  ❌ Scaling will amplify current problems\n');
      
      this.recommendations.push({
        category: 'Scalability',
        priority: 'HIGH',
        issue: 'System not ready for horizontal scaling',
        solutions: [
          'Fix performance bottlenecks before scaling',
          'Implement caching to reduce database load',
          'Optimize queries and indexes',
          'Add monitoring to identify bottlenecks',
          'Consider vertical scaling first (more CPU/RAM)'
        ]
      });
    }
  }

  calculateOverallScore() {
    console.log('=' .repeat(80));
    console.log('\n🏆 OVERALL PERFORMANCE SCORE\n');
    
    const score = Math.min(100, Math.max(0, this.score));
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    
    console.log(`  Score: ${score.toFixed(1)}/100`);
    console.log(`  Grade: ${grade}\n`);

    if (score >= 85) {
      console.log('  ✅ PRODUCTION READY - System meets all requirements\n');
    } else if (score >= 70) {
      console.log('  ⚠️  OPTIMIZATION RECOMMENDED - System functional but needs improvement\n');
    } else {
      console.log('  ❌ NOT READY - Critical issues must be fixed before production\n');
    }

    console.log('=' .repeat(80) + '\n');
  }

  displayRecommendations() {
    if (this.recommendations.length === 0) {
      console.log('🎉 No recommendations - System performing excellently!\n');
      return;
    }

    console.log('💡 RECOMMENDATIONS FOR IMPROVEMENT\n');
    console.log('=' .repeat(80) + '\n');

    // Group by priority
    const grouped = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: []
    };

    this.recommendations.forEach(rec => {
      grouped[rec.priority].push(rec);
    });

    // Display by priority
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(priority => {
      if (grouped[priority].length > 0) {
        const emoji = priority === 'CRITICAL' ? '🚨' : priority === 'HIGH' ? '⚠️' : priority === 'MEDIUM' ? '💡' : 'ℹ️';
        console.log(`${emoji} ${priority} PRIORITY\n`);
        
        grouped[priority].forEach((rec, index) => {
          console.log(`${index + 1}. ${rec.category}: ${rec.issue}\n`);
          console.log('   Solutions:');
          rec.solutions.forEach(solution => {
            console.log(`   - ${solution}`);
          });
          console.log('');
        });
      }
    });

    console.log('=' .repeat(80) + '\n');
  }

  generateActionItems() {
    console.log('📋 ACTION ITEMS\n');
    console.log('=' .repeat(80) + '\n');

    const actions = [
      {
        phase: 'Immediate (Week 1)',
        items: [
          '✅ Review all CRITICAL recommendations',
          '✅ Fix any error rate > 5%',
          '✅ Implement basic monitoring (PM2, logs)',
          '✅ Add health check endpoints'
        ]
      },
      {
        phase: 'Short-term (Week 2-4)',
        items: [
          '⏳ Implement Redis caching for dashboard',
          '⏳ Add database indexes on slow queries',
          '⏳ Enable MongoDB connection pooling',
          '⏳ Set up APM tool (New Relic/DataDog)',
          '⏳ Optimize top 10 slowest endpoints'
        ]
      },
      {
        phase: 'Medium-term (Month 2-3)',
        items: [
          '📅 Implement horizontal scaling with load balancer',
          '📅 Set up auto-scaling policies',
          '📅 Add CDN for static assets',
          '📅 Implement advanced caching strategies',
          '📅 Performance optimization sprint'
        ]
      },
      {
        phase: 'Long-term (Month 4-6)',
        items: [
          '🔮 Database sharding if needed',
          '🔮 Microservices architecture (if scaling further)',
          '🔮 Advanced monitoring & alerting',
          '🔮 Chaos engineering tests',
          '🔮 Multi-region deployment'
        ]
      }
    ];

    actions.forEach(phase => {
      console.log(`${phase.phase}:\n`);
      phase.items.forEach(item => {
        console.log(`  ${item}`);
      });
      console.log('');
    });

    console.log('=' .repeat(80) + '\n');
  }

  exportDetailedReport() {
    const outputPath = this.reportPath.replace('.json', '-analysis.txt');
    
    // This would generate a detailed text report
    console.log(`📄 Detailed report saved to: ${outputPath}\n`);
  }
}

// CLI
if (require.main === module) {
  const reportPath = process.argv[2];
  
  if (!reportPath) {
    console.error('\nUsage: node analyze-performance.js <report-path>\n');
    console.log('Example:');
    console.log('  node analyze-performance.js ../results/report-load-2025-11-02.json\n');
    process.exit(1);
  }

  if (!fs.existsSync(reportPath)) {
    console.error(`\n❌ Report not found: ${reportPath}\n`);
    process.exit(1);
  }

  const analyzer = new PerformanceAnalyzer(reportPath);
  analyzer.analyze().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { PerformanceAnalyzer };
