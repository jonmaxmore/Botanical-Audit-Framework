/**
 * Simple Development Server - No Database Required
 * สำหรับการพัฒนาและทดสอบโดยไม่ต้องติดตั้ง MongoDB
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3004',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3004',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/monitoring/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GACP Platform Development Server',
    version: '1.0.0',
    database: {
      status: 'mock',
      message: 'Using mock data for development',
    },
  });
});

// GACP Workflow API (Mock Data)
app.get('/api/gacp/workflow', (req, res) => {
  res.json({
    success: true,
    data: {
      workflowStates: 17,
      currentWorkflow: 'WHO-GACP-2024',
      states: [
        {
          id: 1,
          name: 'Initial Application',
          status: 'active',
          requirements: ['Farm registration', 'Soil assessment'],
        },
        {
          id: 2,
          name: 'Site Inspection',
          status: 'pending',
          requirements: ['GPS coordinates', 'Site photos'],
        },
        {
          id: 3,
          name: 'Soil Testing',
          status: 'pending',
          requirements: ['Soil samples', 'Lab analysis'],
        },
        {
          id: 4,
          name: 'Seed Source Verification',
          status: 'pending',
          requirements: ['Seed certificate', 'Genetics verification'],
        },
        {
          id: 5,
          name: 'Growing Environment Setup',
          status: 'pending',
          requirements: ['Climate control', 'Security measures'],
        },
      ],
    },
  });
});

// GACP CCPs API (Mock Data)
app.get('/api/gacp/ccps', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCCPs: 8,
      methodology: 'HACCP-based',
      ccps: [
        {
          id: 'CCP01',
          name: 'Soil Quality Management',
          weight: 15,
          compliance: 'WHO-GACP Section 4.2',
        },
        {
          id: 'CCP02',
          name: 'Water Quality Control',
          weight: 12,
          compliance: 'WHO-GACP Section 4.3',
        },
        {
          id: 'CCP03',
          name: 'Seed/Planting Material',
          weight: 10,
          compliance: 'WHO-GACP Section 4.1',
        },
        {
          id: 'CCP04',
          name: 'Harvesting Operations',
          weight: 18,
          compliance: 'WHO-GACP Section 5.1',
        },
        {
          id: 'CCP05',
          name: 'Post-harvest Processing',
          weight: 15,
          compliance: 'WHO-GACP Section 5.2',
        },
        {
          id: 'CCP06',
          name: 'Storage Conditions',
          weight: 12,
          compliance: 'WHO-GACP Section 5.3',
        },
        {
          id: 'CCP07',
          name: 'Quality Control Testing',
          weight: 10,
          compliance: 'WHO-GACP Section 6.1',
        },
        {
          id: 'CCP08',
          name: 'Documentation & Traceability',
          weight: 8,
          compliance: 'WHO-GACP Section 7.1',
        },
      ],
    },
  });
});

// Score Calculation API
app.post('/api/gacp/test/score-calculation', (req, res) => {
  const { scores } = req.body;

  if (!scores) {
    return res.status(400).json({
      success: false,
      error: 'Scores object is required',
    });
  }

  // Mock calculation
  const ccpWeights = {
    CCP01: 15,
    CCP02: 12,
    CCP03: 10,
    CCP04: 18,
    CCP05: 15,
    CCP06: 12,
    CCP07: 10,
    CCP08: 8,
  };

  let totalScore = 0;
  let totalWeight = 0;
  const breakdown = {};

  Object.keys(scores).forEach(ccpId => {
    if (ccpWeights[ccpId]) {
      const score = scores[ccpId];
      const weight = ccpWeights[ccpId];
      const weighted = (score * weight) / 100;

      breakdown[ccpId] = {
        score: score,
        weight: weight,
        weighted: weighted,
      };

      totalScore += weighted;
      totalWeight += weight;
    }
  });

  const finalScore = (totalScore / totalWeight) * 100;

  let certificateLevel = 'Not Qualified';
  if (finalScore >= 90) certificateLevel = 'GACP-Excellent';
  else if (finalScore >= 75) certificateLevel = 'GACP-Standard';
  else if (finalScore >= 60) certificateLevel = 'GACP-Basic';

  res.json({
    success: true,
    data: {
      totalScore: Math.round(finalScore * 100) / 100,
      weightedScore: finalScore >= 75 ? 'Good' : finalScore >= 60 ? 'Fair' : 'Poor',
      certificateLevel: certificateLevel,
      breakdown: breakdown,
    },
  });
});

// Compliance API
app.get('/api/gacp/compliance', (req, res) => {
  res.json({
    success: true,
    data: {
      standards: ['WHO-GACP', 'Thai-FDA', 'ASEAN-TM'],
      version: '2024.1',
      compliance: {
        'WHO-GACP': {
          status: 'compliant',
          sections: 17,
          lastUpdated: '2024-01-15',
        },
        'Thai-FDA': {
          status: 'compliant',
          sections: 12,
          lastUpdated: '2024-02-01',
        },
        'ASEAN-TM': {
          status: 'compliant',
          sections: 8,
          lastUpdated: '2024-01-30',
        },
      },
    },
  });
});

// Demo page
app.get('/demo.html', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>GACP Platform - Demo</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c5530; text-align: center; }
        .api-section { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
        .endpoint { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; }
        button { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #218838; }
        .result { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28a745; white-space: pre-wrap; font-family: monospace; font-size: 12px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .status.healthy { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌿 GACP Platform - Development Demo</h1>
        
        <div class="status healthy">
            <strong>✅ Development Server Active</strong><br>
            Server is running in development mode with mock data
        </div>

        <div class="api-section">
            <h3>🏥 Health Check</h3>
            <div class="endpoint">GET /api/monitoring/health</div>
            <button onclick="testAPI('/api/monitoring/health')">Test Health Check</button>
        </div>

        <div class="api-section">
            <h3>📋 GACP Workflow</h3>
            <div class="endpoint">GET /api/gacp/workflow</div>
            <button onclick="testAPI('/api/gacp/workflow')">Get Workflow States</button>
        </div>

        <div class="api-section">
            <h3>🎯 Critical Control Points</h3>
            <div class="endpoint">GET /api/gacp/ccps</div>
            <button onclick="testAPI('/api/gacp/ccps')">Get CCPs</button>
        </div>

        <div class="api-section">
            <h3>📊 Score Calculation</h3>
            <div class="endpoint">POST /api/gacp/test/score-calculation</div>
            <button onclick="testScoreCalculation()">Test Score Calculation</button>
        </div>

        <div class="api-section">
            <h3>✅ Compliance Standards</h3>
            <div class="endpoint">GET /api/gacp/compliance</div>
            <button onclick="testAPI('/api/gacp/compliance')">Get Compliance Info</button>
        </div>

        <div id="results"></div>
    </div>

    <script>
        async function testAPI(endpoint) {
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                showResult(endpoint, data);
            } catch (error) {
                showResult(endpoint, { error: error.message });
            }
        }

        async function testScoreCalculation() {
            const testData = {
                scores: {
                    CCP01: 85, CCP02: 90, CCP03: 80, CCP04: 88,
                    CCP05: 92, CCP06: 78, CCP07: 85, CCP08: 87
                }
            };

            try {
                const response = await fetch('/api/gacp/test/score-calculation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });
                const data = await response.json();
                showResult('POST /api/gacp/test/score-calculation', data);
            } catch (error) {
                showResult('POST /api/gacp/test/score-calculation', { error: error.message });
            }
        }

        function showResult(endpoint, data) {
            const results = document.getElementById('results');
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result';
            resultDiv.innerHTML = \`<strong>\${endpoint}</strong>\\n\\n\${JSON.stringify(data, null, 2)}\`;
            results.appendChild(resultDiv);
            resultDiv.scrollIntoView({ behavior: 'smooth' });
        }
    </script>
</body>
</html>
  `);
});

// API Documentation
app.get('/api/docs/docs', (req, res) => {
  res.json({
    success: true,
    documentation: {
      title: 'GACP Platform API Documentation',
      version: '1.0.0',
      endpoints: [
        {
          method: 'GET',
          path: '/api/monitoring/health',
          description: 'Health check endpoint',
        },
        {
          method: 'GET',
          path: '/api/gacp/workflow',
          description: 'Get GACP workflow states',
        },
        {
          method: 'GET',
          path: '/api/gacp/ccps',
          description: 'Get Critical Control Points',
        },
        {
          method: 'POST',
          path: '/api/gacp/test/score-calculation',
          description: 'Calculate GACP scores',
        },
        {
          method: 'GET',
          path: '/api/gacp/compliance',
          description: 'Get compliance standards information',
        },
      ],
    },
  });
});

// Error handling
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/monitoring/health',
      'GET /api/gacp/workflow',
      'GET /api/gacp/ccps',
      'POST /api/gacp/test/score-calculation',
      'GET /api/gacp/compliance',
      'GET /demo.html',
      'GET /api/docs/docs',
    ],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GACP Development Server is running on port ${PORT}`);
  console.log(`📱 Demo: http://localhost:${PORT}/demo.html`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/monitoring/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs/docs`);
  console.log(`🌟 Mode: Development (Mock Data)`);
});

module.exports = app;
