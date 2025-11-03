// gacp-simple-server.mjs
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    switch (url.pathname) {
      case '/':
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>GACP Simple Server</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>🌿 GACP Platform - Simple Server</h1>
              <p>✅ Node.js server is running!</p>
              <ul>
                <li><a href="/demo" target="_blank">📋 Demo Page</a></li>
                <li><a href="/api/health" target="_blank">💚 Health Check</a></li>
                <li><a href="/api/gacp/workflow" target="_blank">🔄 GACP Workflow</a></li>
                <li><a href="/api/gacp/ccps" target="_blank">🎯 Critical Control Points</a></li>
              </ul>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Install full dependencies: <code>cd apps/backend && npm install</code></li>
                <li>Run full GACP Platform: <code>node atlas-server.js</code></li>
                <li>Access complete demo at: <a href="http://localhost:3004/demo.html">http://localhost:3004/demo.html</a></li>
              </ol>
            </body>
          </html>
        `);
        break;

      case '/demo':
        try {
          const demoContent = readFileSync(join(__dirname, 'demo-standalone.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(demoContent);
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Demo file not found. Please ensure demo-standalone.html exists.');
        }
        break;

      case '/api/health':
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
              status: 'healthy',
              timestamp: new Date().toISOString(),
              server: 'gacp-simple-server',
              version: '1.0.0',
              message: 'Simple Node.js server is running',
            },
            null,
            2
          )
        );
        break;

      case '/api/gacp/workflow':
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
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
                  },
                  {
                    id: 2,
                    name: 'การตรวจสอบเอกสาร',
                    status: 'pending',
                    description: 'ตรวจสอบความถูกต้องของเอกสาร',
                  },
                ],
              },
            },
            null,
            2
          )
        );
        break;

      case '/api/gacp/ccps':
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
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
                  },
                  {
                    id: 'CCP02',
                    name: 'การควบคุมคุณภาพน้ำ',
                    weight: 12,
                    description: 'ตรวจสอบแหล่งน้ำและคุณภาพน้ำที่ใช้',
                    compliance: 'WHO-GACP Section 4.3',
                  },
                ],
              },
            },
            null,
            2
          )
        );
        break;

      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
      })
    );
  }
});

// starts a simple http server locally on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('🌿 GACP Simple Server');
  console.log('🚀 Listening on http://127.0.0.1:3000');
  console.log('📋 Demo available at http://127.0.0.1:3000/demo');
  console.log('💚 Health check at http://127.0.0.1:3000/api/health');
  console.log('');
  console.log('For full GACP Platform:');
  console.log('  cd apps/backend');
  console.log('  npm install');
  console.log('  node atlas-server.js');
});

// run with `node gacp-simple-server.mjs`
