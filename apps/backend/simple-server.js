const http = require('http');
const fs = require('fs');
const path = require('path');

// GACP Platform Basic Server
// สำหรับการแสดงผลหน้า Demo เมื่อไม่มี Node.js ecosystem

const PORT = 3004;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Mock API responses for demo
const mockResponses = {
  '/api/gacp/workflow': {
    success: true,
    data: {
      workflowStates: 17,
      currentWorkflow: 'WHO-GACP-2024',
      totalApplications: 156,
      activeApplications: 23,
      completedApplications: 133,
      states: [
        {
          id: 1,
          name: 'การสมัครเริ่มต้น',
          status: 'active',
          description: 'ยื่นใบสมัครและเอกสารเบื้องต้น',
          requirements: ['ใบทะเบียนฟาร์ม', 'รายงานการประเมินดิน', 'แผนปลูก'],
          estimatedDuration: '5-7 วันทำการ',
        },
        {
          id: 2,
          name: 'การตรวจสอบเอกสาร',
          status: 'pending',
          description: 'ตรวจสอบความถูกต้องของเอกสาร',
          requirements: ['เอกสารครบถ้วน', 'ผ่านการตรวจสอบเบื้องต้น'],
          estimatedDuration: '3-5 วันทำการ',
        },
        {
          id: 3,
          name: 'การประเมินพื้นที่',
          status: 'pending',
          description: 'ประเมินความเหมาะสมของพื้นที่ปลูก',
          requirements: ['การตรวจสอบดิน', 'การตรวจสอบน้ำ', 'การประเมินสภาพอากาศ'],
          estimatedDuration: '7-14 วันทำการ',
        },
      ],
    },
  },

  '/api/gacp/ccps': {
    success: true,
    data: {
      totalCCPs: 8,
      methodology: 'HACCP-based',
      complianceStandard: 'WHO-GACP 2024.1',
      ccps: [
        {
          id: 'CCP01',
          name: 'การจัดการคุณภาพดิน',
          weight: 15,
          description: 'ควบคุมคุณภาพและปุ่ยที่ใช้',
          compliance: 'WHO-GACP Section 4.2',
          criticalLimits: 'pH 6.0-7.5, EC < 2.0 dS/m',
          monitoringProcedure: 'ตรวจสอบทุก 2 สัปดาห์',
          status: 'Active',
        },
        {
          id: 'CCP02',
          name: 'การควบคุมคุณภาพน้ำ',
          weight: 12,
          description: 'ตรวจสอบแหล่งน้ำและคุณภาพน้ำที่ใช้',
          compliance: 'WHO-GACP Section 4.3',
          criticalLimits: 'pH 6.5-8.5, ไม่มีสารปนเปื้อน',
          monitoringProcedure: 'ตรวจสอบรายสัปดาห์',
          status: 'Active',
        },
        {
          id: 'CCP03',
          name: 'วัสดุขยายพันธุ์',
          weight: 10,
          description: 'ควบคุมคุณภาพเมล็ดและต้นกล้า',
          compliance: 'WHO-GACP Section 4.4',
          criticalLimits: 'อัตราการงอก > 85%',
          monitoringProcedure: 'ตรวจสอบทุกแบทช์',
          status: 'Active',
        },
        {
          id: 'CCP04',
          name: 'การปฏิบัติการปลูก',
          weight: 18,
          description: 'ขั้นตอนการปลูกและการดูแล',
          compliance: 'WHO-GACP Section 5.1',
          criticalLimits: 'ตามแผนการปลูกที่อนุมัติ',
          monitoringProcedure: 'ตรวจสอบรายวัน',
          status: 'Active',
        },
        {
          id: 'CCP05',
          name: 'ขั้นตอนการเก็บเกี่ยว',
          weight: 14,
          description: 'เวลาและวิธีการเก็บเกี่ยว',
          compliance: 'WHO-GACP Section 5.2',
          criticalLimits: 'ในช่วงเวลาที่กำหนด',
          monitoringProcedure: 'ตรวจสอบขณะเก็บเกี่ยว',
          status: 'Active',
        },
        {
          id: 'CCP06',
          name: 'การจัดการหลังการเก็บเกี่ยว',
          weight: 11,
          description: 'การทำแห้งและการเก็บรักษาเบื้องต้น',
          compliance: 'WHO-GACP Section 5.3',
          criticalLimits: 'ความชื้น < 12%, อุณหภูมิ < 25°C',
          monitoringProcedure: 'ตรวจสอบรายวัน',
          status: 'Active',
        },
        {
          id: 'CCP07',
          name: 'การเก็บรักษาและบรรจุ',
          weight: 13,
          description: 'การเก็บรักษาระยะยาวและการบรรจุ',
          compliance: 'WHO-GACP Section 6.1',
          criticalLimits: 'สภาพแวดล้อมควบคุม',
          monitoringProcedure: 'ตรวจสอบรายวัน',
          status: 'Active',
        },
        {
          id: 'CCP08',
          name: 'การจัดทำเอกสารและการติดตาม',
          weight: 7,
          description: 'การบันทึกและการติดตามย้อนกลับ',
          compliance: 'WHO-GACP Section 7.1',
          criticalLimits: 'เอกสารครบถ้วน 100%',
          monitoringProcedure: 'ตรวจสอบรายสัปดาห์',
          status: 'Active',
        },
      ],
    },
  },

  '/api/gacp/compliance': {
    success: true,
    data: {
      standards: ['WHO-GACP', 'Thai-FDA', 'ASEAN-TM'],
      version: '2024.1',
      effectiveDate: '2024-01-01',
      totalRequirements: 156,
      implementationStatus: 'Active',
      categories: [
        {
          name: 'การปฏิบัติการปลูก',
          requirements: 45,
          compliance: 'WHO-GACP Section 4',
          status: 'Compliant',
        },
        {
          name: 'การควบคุมคุณภาพ',
          requirements: 38,
          compliance: 'WHO-GACP Section 5',
          status: 'Compliant',
        },
        {
          name: 'การจัดการหลังการเก็บเกี่ยว',
          requirements: 29,
          compliance: 'WHO-GACP Section 6',
          status: 'Compliant',
        },
        {
          name: 'การจัดทำเอกสาร',
          requirements: 44,
          compliance: 'WHO-GACP Section 7',
          status: 'Compliant',
        },
      ],
      certificationLevel: 'GACP-Premium',
      validUntil: '2025-12-31',
      lastAudit: '2024-10-01',
      nextAudit: '2025-04-01',
    },
  },

  '/api/monitoring/health': {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    data: {
      database: {
        status: 'connected',
        isHealthy: true,
        responseTime: 45,
        successRate: '99.8',
      },
      api: {
        uptime: 3600,
        version: '1.0.0',
        environment: 'demo',
      },
      system: {
        memory: {
          heapUsed: 25165824,
          heapTotal: 33554432,
        },
        platform: 'win32',
        nodeVersion: 'v18.17.0',
      },
    },
  },
};

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = req.url;

  // Handle API endpoints
  if (filePath.startsWith('/api/')) {
    handleAPIRequest(req, res);
    return;
  }

  // Handle static files
  if (filePath === '/') {
    filePath = '/demo.html';
  }

  // Remove query parameters
  filePath = filePath.split('?')[0];

  const fullPath = path.join(__dirname, 'public', filePath);
  const extname = path.extname(fullPath);
  const contentType = mimeTypes[extname] || 'text/plain';

  fs.readFile(fullPath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>404 - Page Not Found</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>🚫 หน้าที่คุณกำลังมองหาไม่พบ</h1>
              <p>ไฟล์: ${filePath}</p>
              <p><a href="/demo.html">🎮 ไปหน้า Demo</a></p>
              <p><a href="/monitoring-dashboard.html">📊 ไปหน้า Monitoring</a></p>
            </body>
          </html>
        `);
      } else {
        // Server error
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      // Success
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.end(content);
    }
  });
});

function handleAPIRequest(req, res) {
  const url = req.url.split('?')[0];

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle POST requests (like score calculation)
  if (req.method === 'POST' && url === '/api/gacp/test/score-calculation') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const scores = data.scores;

        // Calculate weighted score
        let totalWeighted = 0;
        let totalWeight = 0;
        const breakdown = {};

        const weights = {
          CCP01: 15,
          CCP02: 12,
          CCP03: 10,
          CCP04: 18,
          CCP05: 14,
          CCP06: 11,
          CCP07: 13,
          CCP08: 7,
        };

        for (const [ccp, score] of Object.entries(scores)) {
          const weight = weights[ccp] || 10;
          const weighted = (score * weight) / 100;
          totalWeighted += weighted;
          totalWeight += weight;
          breakdown[ccp] = { score, weight, weighted };
        }

        const totalScore = (totalWeighted / totalWeight) * 100;
        let certificateLevel = 'GACP-Basic';
        let weightedScore = 'Poor';

        if (totalScore >= 90) {
          certificateLevel = 'GACP-Premium';
          weightedScore = 'Excellent';
        } else if (totalScore >= 80) {
          certificateLevel = 'GACP-Standard';
          weightedScore = 'Good';
        } else if (totalScore >= 70) {
          certificateLevel = 'GACP-Basic';
          weightedScore = 'Fair';
        }

        const response = {
          success: true,
          data: {
            totalScore: Math.round(totalScore * 100) / 100,
            weightedScore,
            certificateLevel,
            breakdown,
            compliance: totalScore >= 75 ? 'Passed' : 'Failed',
            recommendations:
              totalScore < 75
                ? ['ปรับปรุงการควบคุมคุณภาพ', 'เพิ่มการติดตามผล']
                : ['ดำเนินการได้ดี', 'รักษามาตรฐานปัจจุบัน'],
          },
        };

        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON data' }));
      }
    });
    return;
  }

  // Handle GET requests
  if (mockResponses[url]) {
    res.writeHead(200);
    res.end(JSON.stringify(mockResponses[url], null, 2));
  } else {
    res.writeHead(404);
    res.end(
      JSON.stringify({
        success: false,
        error: 'API endpoint not found',
        available_endpoints: Object.keys(mockResponses),
      })
    );
  }
}

// Start server
server.listen(PORT, () => {
  console.log('🌿 GACP Platform Demo Server เริ่มต้นแล้ว!');
  console.log('='.repeat(50));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🎮 Demo Page: http://localhost:${PORT}/demo.html`);
  console.log(`📊 Monitoring: http://localhost:${PORT}/monitoring-dashboard.html`);
  console.log('='.repeat(50));
  console.log('📋 Available API Endpoints:');
  Object.keys(mockResponses).forEach(endpoint => {
    console.log(`   - ${endpoint}`);
  });
  console.log('='.repeat(50));
  console.log('✅ พร้อมใช้งาน! เปิด browser และไปที่ URL ด้านบน');
});

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('🛑 GACP Platform Demo Server หยุดทำงาน');
  server.close();
});

process.on('SIGINT', () => {
  console.log('\n🛑 GACP Platform Demo Server หยุดทำงาน');
  server.close();
  process.exit(0);
});
