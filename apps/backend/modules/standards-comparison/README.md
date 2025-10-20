# Standards Comparison Module

Module สำหรับเปรียบเทียบฟาร์มกับมาตรฐาน GACP/GAP และวิเคราะห์ช่องว่างที่ต้องปรับปรุง

## Overview

Standards Comparison Module ให้บริการเปรียบเทียบข้อมูลฟาร์มกับมาตรฐานต่างๆ เช่น GACP Thailand และ GLOBALG.A.P. เพื่อประเมินความพร้อมในการขอรับรอง พร้อมทั้งวิเคราะห์ช่องว่างและให้คำแนะนำในการปรับปรุง

## Features

### 1. Standards Management

- รองรับมาตรฐานหลายประเภท (GACP, GAP, ฯลฯ)
- ข้อมูลมาตรฐานแบบ modular และ extensible
- จัดเก็บและจัดการมาตรฐานใน MongoDB

### 2. Farm Comparison

- เปรียบเทียบฟาร์มกับมาตรฐานหลายมาตรฐานพร้อมกัน
- คำนวณคะแนนตามหมวดหมู่และข้อกำหนด
- ระบุสถานะการรับรอง (certified/not certified)

### 3. Gap Analysis

- วิเคราะห์ช่องว่างระหว่างสถานะปัจจุบันกับข้อกำหนด
- จัดระดับความสำคัญ (Critical, Important, Optional)
- นับจำนวนช่องว่างตามระดับความสำคัญ

### 4. Recommendations Engine

- สร้างคำแนะนำเฉพาะสำหรับแต่ละช่องว่าง
- ประมาณการค่าใช้จ่ายและระยะเวลาดำเนินการ
- จัดกลุ่มคำแนะนำตามความสำคัญ

### 5. Comparison History

- บันทึกประวัติการเปรียบเทียบทั้งหมด
- ติดตามความก้าวหน้าตามช่วงเวลา
- ดูการเปรียบเทียบย้อนหลังได้

### 6. Detailed Scoring

- คะแนนแยกตามหมวดหมู่
- คะแนนแยกตามข้อกำหนด
- คำนวณเปอร์เซ็นต์ความสอดคล้อง

## API Endpoints

### Public Endpoints

#### 1. Health Check

```http
GET /api/standards-comparison/health
```

**Response:**

```json
{
  "status": "healthy",
  "service": "Standards Comparison",
  "initialized": true,
  "standardsLoaded": 2,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### 2. Get Available Standards

```http
GET /api/standards-comparison
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "standards": [
    {
      "id": "gacp-thailand-2023",
      "name": "GACP Thailand 2023",
      "version": "2.0",
      "description": "Good Agricultural and Collection Practices for Medicinal Plants",
      "categoryCount": 6,
      "criteriaCount": 25
    },
    {
      "id": "globalgap-v5",
      "name": "GLOBALG.A.P. v5.4",
      "version": "5.4",
      "description": "Global Good Agricultural Practices",
      "categoryCount": 3,
      "criteriaCount": 9
    }
  ]
}
```

#### 3. Get Standard Details

```http
GET /api/standards-comparison/:id
```

**Parameters:**

- `id` - Standard ID (e.g., `gacp-thailand-2023`)

**Response:**

```json
{
  "success": true,
  "standard": {
    "id": "gacp-thailand-2023",
    "name": "GACP Thailand 2023",
    "version": "2.0",
    "description": "Good Agricultural and Collection Practices",
    "requirements": [
      {
        "category": "site_selection",
        "title": "Site Selection and Management",
        "criteria": [
          {
            "id": "site_01",
            "requirement": "Appropriate soil conditions",
            "priority": "critical",
            "weight": 10
          }
        ]
      }
    ]
  }
}
```

### Private Endpoints (Require Authentication)

#### 4. Compare Farm Against Standards

```http
POST /api/standards-comparison/compare
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "farmId": "farm123",
  "standardIds": ["gacp-thailand-2023", "globalgap-v5"],
  "farmData": {
    "farmName": "Green Valley Farm",
    "location": {
      "province": "Chiang Mai",
      "district": "Mae Rim",
      "coordinates": {
        "latitude": 18.92,
        "longitude": 98.94
      }
    },
    "cropType": "Cannabis",
    "farmSize": 50,
    "practices": {
      "organicFarming": true,
      "pestManagement": true,
      "soilManagement": true,
      "waterManagement": true,
      "postHarvest": true,
      "workerSafety": true,
      "foodSafety": false,
      "environmental": true,
      "wasteManagement": true,
      "traceability": false
    },
    "documents": [
      {
        "type": "lab_test",
        "name": "soil_test_2025.pdf",
        "uploadedAt": "2025-01-10T00:00:00.000Z"
      },
      {
        "type": "quality_certificate",
        "name": "quality_cert.pdf",
        "uploadedAt": "2025-01-12T00:00:00.000Z"
      }
    ],
    "certifications": ["Organic Thailand"],
    "records": {
      "complete": true,
      "cultivation": true,
      "harvesting": true,
      "batchTracking": false
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comparison completed successfully",
  "comparisonId": "65a1b2c3d4e5f6789abcdef0",
  "results": [
    {
      "standardId": "gacp-thailand-2023",
      "standardName": "GACP Thailand 2023",
      "version": "2.0",
      "score": 82.5,
      "certified": true,
      "totalScore": 181,
      "maxScore": 219,
      "categoryResults": [
        {
          "category": "site_selection",
          "title": "Site Selection and Management",
          "score": 28,
          "maxScore": 35,
          "percentage": 80,
          "criteria": [
            {
              "id": "site_01",
              "requirement": "Appropriate soil conditions",
              "priority": "critical",
              "weight": 10,
              "met": true,
              "score": 10
            }
          ]
        }
      ]
    }
  ],
  "summary": {
    "standardsCompared": 2,
    "certified": 1,
    "notCertified": 1,
    "averageScore": 78.3
  }
}
```

#### 5. Get Comparison Results

```http
GET /api/standards-comparison/comparison/:id
Authorization: Bearer <token>
```

**Parameters:**

- `id` - Comparison ID

**Response:**

```json
{
  "success": true,
  "comparison": {
    "comparisonId": "65a1b2c3d4e5f6789abcdef0",
    "farmId": "farm123",
    "farmData": { ... },
    "comparisons": [ ... ],
    "summary": { ... },
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

#### 6. Analyze Gaps

```http
GET /api/standards-comparison/gaps/:comparisonId
Authorization: Bearer <token>
```

**Parameters:**

- `comparisonId` - Comparison ID

**Response:**

```json
{
  "success": true,
  "comparisonId": "65a1b2c3d4e5f6789abcdef0",
  "totalGaps": 8,
  "gapsByPriority": {
    "critical": 3,
    "important": 4,
    "optional": 1
  },
  "gaps": [
    {
      "standardId": "gacp-thailand-2023",
      "standardName": "GACP Thailand 2023",
      "category": "quality_control",
      "categoryTitle": "Quality Control",
      "requirement": "Heavy metal testing",
      "priority": "critical",
      "weight": 10
    }
  ],
  "recommendations": [
    {
      "standardId": "gacp-thailand-2023",
      "standardName": "GACP Thailand 2023",
      "category": "quality_control",
      "categoryTitle": "Quality Control",
      "requirement": "Heavy metal testing",
      "priority": "critical",
      "action": "Set up quality testing procedures. Partner with certified laboratories for testing.",
      "estimatedCost": "High (฿50,000 - ฿200,000)",
      "timeframe": "1-3 months"
    }
  ]
}
```

#### 7. Get Comparison History

```http
GET /api/standards-comparison/history/:farmId?limit=10
Authorization: Bearer <token>
```

**Parameters:**

- `farmId` - Farm ID
- `limit` (optional) - Number of results (default: 10)

**Response:**

```json
{
  "success": true,
  "farmId": "farm123",
  "count": 3,
  "history": [
    {
      "comparisonId": "65a1b2c3d4e5f6789abcdef0",
      "farmId": "farm123",
      "standardsCompared": [
        {
          "standardId": "gacp-thailand-2023",
          "standardName": "GACP Thailand 2023",
          "score": 82.5,
          "certified": true
        }
      ],
      "summary": {
        "standardsCompared": 2,
        "certified": 1,
        "notCertified": 1,
        "averageScore": 78.3
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### 8. Get Recommendations

```http
GET /api/standards-comparison/recommendations/:comparisonId
Authorization: Bearer <token>
```

**Parameters:**

- `comparisonId` - Comparison ID

**Response:**

```json
{
  "success": true,
  "comparisonId": "65a1b2c3d4e5f6789abcdef0",
  "totalRecommendations": 8,
  "breakdown": {
    "critical": 3,
    "important": 4,
    "optional": 1
  },
  "recommendations": {
    "critical": [
      {
        "standardId": "gacp-thailand-2023",
        "standardName": "GACP Thailand 2023",
        "category": "quality_control",
        "categoryTitle": "Quality Control",
        "requirement": "Heavy metal testing",
        "priority": "critical",
        "action": "Set up quality testing procedures. Partner with certified laboratories for testing.",
        "estimatedCost": "High (฿50,000 - ฿200,000)",
        "timeframe": "1-3 months"
      }
    ],
    "important": [ ... ],
    "optional": [ ... ]
  }
}
```

## Data Models

### Comparison Model

```javascript
{
  farmId: String,              // Farm identifier
  farmData: {
    farmName: String,          // Required
    location: {
      province: String,
      district: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    cropType: String,
    farmSize: Number,
    practices: {
      organicFarming: Boolean,
      pestManagement: Boolean,
      // ... other practices
    },
    documents: [{
      type: String,
      name: String,
      uploadedAt: Date
    }],
    certifications: [String],
    records: {
      complete: Boolean,
      cultivation: Boolean,
      harvesting: Boolean,
      batchTracking: Boolean
    }
  },
  comparisons: [{
    standardId: String,
    standardName: String,
    version: String,
    score: Number,
    certified: Boolean,
    categoryResults: [ ... ]
  }],
  summary: {
    standardsCompared: Number,
    certified: Number,
    notCertified: Number,
    averageScore: Number
  },
  createdAt: Date
}
```

### Standard Model

```javascript
{
  id: String,                  // Unique identifier
  name: String,                // Standard name
  version: String,             // Version number
  description: String,
  active: Boolean,
  requirements: [{
    category: String,
    title: String,
    criteria: [{
      id: String,
      requirement: String,
      priority: String,        // 'critical', 'important', 'optional'
      weight: Number,          // 1-10
      description: String
    }]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Initialize Module

```javascript
const { initializeStandardsComparison } = require('./modules/standards-comparison');

// In app.js
const standardsComparison = await initializeStandardsComparison(db, authMiddleware);

app.use('/api/standards-comparison', standardsComparison.router);
```

### Compare Farm

```javascript
const axios = require('axios');

const response = await axios.post(
  'http://localhost:3004/api/standards-comparison/compare',
  {
    farmId: 'farm123',
    standardIds: ['gacp-thailand-2023'],
    farmData: {
      farmName: 'My Farm',
      practices: {
        organicFarming: true,
        pestManagement: true,
      },
      documents: [{ type: 'lab_test', name: 'soil_test.pdf' }],
    },
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

console.log('Comparison ID:', response.data.comparisonId);
console.log('Score:', response.data.results[0].score);
console.log('Certified:', response.data.results[0].certified);
```

### Get Gap Analysis

```javascript
const gapResponse = await axios.get(
  `http://localhost:3004/api/standards-comparison/gaps/${comparisonId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

console.log('Total Gaps:', gapResponse.data.totalGaps);
console.log('Critical Gaps:', gapResponse.data.gapsByPriority.critical);
console.log('Recommendations:', gapResponse.data.recommendations);
```

## Standards Supported

### GACP Thailand 2023 (v2.0)

มาตรฐาน GAP สำหรับสมุนไพร ครอบคลุม 6 หมวดหมู่:

1. **Site Selection** - การเลือกและจัดการพื้นที่
2. **Cultivation** - วิธีการเพาะปลูก
3. **Harvesting** - การเก็บเกี่ยวและหลังการเก็บเกี่ยว
4. **Quality Control** - การควบคุมคุณภาพ
5. **Documentation** - เอกสารและการติดตามย้อนกลับ
6. **Safety** - ความปลอดภัยและสวัสดิการพนักงาน

**Certification Threshold:** 80% score
**Total Criteria:** 25 criteria

### GLOBALG.A.P. v5.4

มาตรฐาน GAP สากล ครอบคลุม 3 หมวดหมู่:

1. **Food Safety** - ความปลอดภัยและคุณภาพอาหาร
2. **Environmental** - การจัดการสิ่งแวดล้อม
3. **Traceability** - การติดตามย้อนกลับ

**Certification Threshold:** 80% score
**Total Criteria:** 9 criteria

## Scoring System

### Priority Levels

- **Critical** (Weight: 9-10) - ข้อกำหนดสำคัญที่จำเป็นสำหรับการรับรอง
- **Important** (Weight: 7-8) - ข้อกำหนดสำคัญ แต่ไม่ใช่ข้อบังคับ
- **Optional** (Weight: 1-5) - ข้อกำหนดเสริมสำหรับการปรับปรุง

### Score Calculation

1. แต่ละ criterion มี weight (1-10)
2. ถ้าเป็นไปตามข้อกำหนด จะได้คะแนนเท่ากับ weight
3. รวมคะแนนทั้งหมดในแต่ละหมวดหมู่
4. คำนวณเปอร์เซ็นต์: (คะแนนที่ได้ / คะแนนเต็ม) × 100
5. ผ่านการรับรองถ้าได้ ≥ 80%

### Gap Priority Estimation

| Priority  | Cost Range         | Timeframe   |
| --------- | ------------------ | ----------- |
| Critical  | ฿50,000 - ฿200,000 | 1-3 months  |
| Important | ฿20,000 - ฿50,000  | 2-6 months  |
| Optional  | ฿5,000 - ฿20,000   | 3-12 months |

## Business Logic

### Comparison Process

1. **Input Validation**
   - Validate farmId, standardIds, farmData
   - Check if standards exist

2. **Standard Loading**
   - Load requested standards from database
   - Get all requirements and criteria

3. **Evaluation**
   - Evaluate each criterion against farm data
   - Calculate scores by category
   - Determine certification status

4. **Storage**
   - Store comparison results in MongoDB
   - Generate comparison ID
   - Link to farm

5. **Gap Analysis**
   - Identify unmet criteria
   - Categorize by priority
   - Generate recommendations

### Criterion Evaluation Logic

ระบบประเมินตามประเภทของข้อกำหนด:

- **Site criteria** - ตรวจสอบ practices.soilManagement, practices.waterManagement
- **Cultivation criteria** - ตรวจสอบ practices.organicFarming, practices.pestManagement, records.cultivation
- **Harvesting criteria** - ตรวจสอบ practices.postHarvest, records.harvesting
- **Quality Control criteria** - ตรวจสอบเอกสาร lab_test, quality_certificate
- **Documentation criteria** - ตรวจสอบจำนวนเอกสารและความสมบูรณ์
- **Safety criteria** - ตรวจสอบ practices.workerSafety และการฝึกอบรม
- **Food Safety criteria** - ตรวจสอบ practices.foodSafety และใบรับรอง HACCP
- **Environmental criteria** - ตรวจสอบ practices.environmental, practices.wasteManagement
- **Traceability criteria** - ตรวจสอบ practices.traceability, records.batchTracking

## Integration

### With Farm Management

```javascript
// Get farm data for comparison
const farmData = await FarmService.getFarmDetails(farmId);

// Format for comparison
const comparisonInput = {
  farmId: farm._id,
  standardIds: ['gacp-thailand-2023'],
  farmData: {
    farmName: farm.farmName,
    location: farm.location,
    practices: farm.practices,
    documents: farm.documents,
    certifications: farm.certifications,
  },
};

// Run comparison
const result = await standardsComparison.service.compareAgainstStandards(comparisonInput);
```

### With Application Workflow

```javascript
// When farmer submits application
const comparison = await standardsComparison.service.compareAgainstStandards({
  farmId: application.farmId,
  standardIds: application.requestedStandards,
  farmData: application.farmData,
});

// Attach comparison to application
application.comparisonId = comparison.comparisonId;
application.readinessScore = comparison.results[0].score;
```

## Error Handling

### Common Errors

```javascript
// Standard not found
{
  "success": false,
  "message": "Standard not found",
  "error": "Standard not found: invalid-standard-id"
}

// Comparison not found
{
  "success": false,
  "message": "Comparison not found",
  "error": "Comparison not found"
}

// Service not initialized
{
  "success": false,
  "message": "Standards Comparison service is not initialized yet"
}

// Validation error
{
  "success": false,
  "message": "farmData.farmName is required"
}
```

## Testing

### Unit Tests (Planned)

```bash
npm test -- standards-comparison
```

Test coverage:

- Service initialization
- Standard loading
- Farm comparison
- Gap analysis
- Recommendation generation
- History tracking

## Migration Notes

### Source Files

Original implementation:

- `routes/api/standards-comparison.js` - Original API routes (403 lines)
- `services/StandardsEngine.js` - Original service (if exists)

### Changes Made

1. **Architecture**: Moved to modular DDD structure
2. **Service**: Refactored StandardsEngine into StandardsComparisonService
3. **Routes**: Separated routes into dedicated file
4. **Controller**: Created controller layer for HTTP handling
5. **Models**: Added Mongoose models for Comparison and Standard
6. **Standards**: Embedded default GACP and GAP standards
7. **Database**: MongoDB collections for comparisons and standards

### Breaking Changes

None - API endpoints remain the same

## Future Enhancements

1. **Advanced Evaluation**
   - Machine learning for criterion evaluation
   - Document content analysis
   - Image recognition for practices

2. **More Standards**
   - Add more international standards
   - Industry-specific standards
   - Regional variations

3. **Reporting**
   - PDF report generation
   - Visual charts and graphs
   - Progress tracking over time

4. **Recommendations**
   - More detailed action plans
   - Cost-benefit analysis
   - Priority optimization

5. **Collaboration**
   - Share comparisons with consultants
   - Get expert reviews
   - Track improvement progress

## Dependencies

- express - Web framework
- mongodb - Database (native driver)
- mongoose - ODM for models

## License

Internal use only - Part of GACP Certify Flow platform

---

**Module Version:** 1.0.0  
**Last Updated:** January 2025  
**Maintainer:** GACP Platform Team
