# 📊 Survey System Module

4-region GACP Cannabis Cultivation Survey Wizard System

## 🎯 Overview

The Survey System module manages a comprehensive **7-step wizard** for collecting farm data across **4 regions** of Thailand (Central, Southern, Northern, Northeastern). It includes scoring algorithms, personalized recommendations, and regional analytics.

## 🗂️ Module Structure

```
survey-system/
├── controllers/        # HTTP request handlers
├── routes/            # API endpoint definitions
├── services/          # Business logic layer
├── models/            # MongoDB schemas
├── validators/        # Input validation rules
├── templates/         # Regional survey templates
├── tests/            # Unit and integration tests
├── index.js          # Module entry point
└── README.md         # This file
```

## 🚀 Features

### 1. **7-Step Survey Wizard**

- **Step 1**: Region Selection (Central, Southern, Northern, Northeastern)
- **Step 2**: Personal Information (name, contact, address)
- **Step 3**: Farm Information (area, production, location)
- **Step 4**: Management & Production (GACP, practices, quality)
- **Step 5**: Cost & Revenue (expenses, income, profit)
- **Step 6**: Market & Sales (channels, access, strategy)
- **Step 7**: Problems & Needs (challenges, support needed)

### 2. **Scoring System**

- **GACP Compliance Score** (0-100)
  - GACP Certification: +25
  - Organic Practices: +15
  - Standard Operating Procedures: +20
  - Quality Control: +15

- **Sustainability Score** (0-100)
  - Water Conservation: +20
  - Organic Fertilizer: +15
  - Environmental Concern: +15

- **Market Access Score** (0-100)
  - Market Access: +20
  - Direct to Consumer: +15
  - Export Market: +10

- **Overall Score** = Average(GACP, Sustainability, Market) + Regional Bonus

### 3. **Regional Bonus System**

Each region gets +10 bonus points for excellence:

- **Northern**: Sustainability ≥60 (mountain sustainability)
- **Central**: Market ≥60 (market access)
- **Southern**: GACP ≥60 (GACP compliance)
- **Northeastern**: Sustainability ≥60 (organic practices)

### 4. **Personalized Recommendations**

Based on scores, system generates:

- **HIGH Priority**: Scores <60 (urgent improvement)
- **MEDIUM Priority**: Scores 60-79 (good, needs enhancement)
- **LOW Priority**: Scores ≥80 (excellent, maintain)

### 5. **Regional Analytics**

- Score distribution by region
- Common challenges identification
- Regional comparison insights
- Best performing region analysis

## 📡 API Endpoints

### Survey Templates

```
GET    /api/surveys/templates              # Get all templates (4 regions)
GET    /api/surveys/templates/:region      # Get region-specific template
```

### Survey Wizard

```
POST   /api/surveys/wizard/start           # Start new survey
GET    /api/surveys/wizard/:id/current     # Get current step
PUT    /api/surveys/wizard/:id/step/:stepId  # Update step data
POST   /api/surveys/wizard/:id/submit      # Submit completed survey
GET    /api/surveys/wizard/:id/progress    # Get progress overview
```

### Survey Management

```
GET    /api/surveys/my-surveys             # Get user's surveys
GET    /api/surveys/:id                    # Get specific survey
DELETE /api/surveys/:id                    # Delete draft survey
```

### Analytics

```
GET    /api/surveys/analytics/regional/:region  # Regional analytics
POST   /api/surveys/analytics/compare           # Compare regions
GET    /api/surveys/statistics                  # Admin statistics
```

## 💻 Usage Examples

### 1. Start New Survey

```javascript
POST /api/surveys/wizard/start
{
  "region": "central",
  "farmId": "farm123"
}

Response:
{
  "success": true,
  "data": {
    "surveyId": "64abc123...",
    "region": "central",
    "currentStep": 1,
    "progress": 0,
    "totalSteps": 7
  }
}
```

### 2. Update Step Data

```javascript
PUT /api/surveys/wizard/64abc123.../step/2
{
  "stepData": {
    "fullName": "สมชาย ใจดี",
    "phone": "0812345678",
    "email": "somchai@example.com",
    "address": {
      "province": "Bangkok"
    }
  }
}

Response:
{
  "success": true,
  "data": {
    "surveyId": "64abc123...",
    "stepId": 2,
    "currentStep": 3,
    "progress": 28.57,
    "isComplete": false
  }
}
```

### 3. Submit Completed Survey

```javascript
POST /api/surveys/wizard/64abc123.../submit

Response:
{
  "success": true,
  "data": {
    "surveyId": "64abc123...",
    "status": "SUBMITTED",
    "scores": {
      "gacp": 75,
      "sustainability": 82,
      "market": 68,
      "overall": 85
    },
    "regionalBonus": 10,
    "totalScore": 85,
    "recommendations": [
      {
        "priority": "MEDIUM",
        "category": "Market Development",
        "title": "Expand market channels",
        "description": "...",
        "actionItems": [...]
      }
    ],
    "submittedAt": "2025-10-07T10:30:00.000Z"
  }
}
```

### 4. Get Regional Analytics

```javascript
GET /api/surveys/analytics/regional/central

Response:
{
  "success": true,
  "data": {
    "region": "central",
    "totalSurveys": 156,
    "completionRate": 87.5,
    "averageScores": {
      "gacp": 72.3,
      "sustainability": 68.9,
      "market": 75.1,
      "overall": 72.1
    },
    "scoreDistribution": {...},
    "commonIssues": [
      "Certification costs too high",
      "Market access limited",
      "Need technical training"
    ],
    "recommendations": [...]
  }
}
```

### 5. Compare Regions

```javascript
POST /api/surveys/analytics/compare
{
  "regions": ["central", "northern", "southern"]
}

Response:
{
  "success": true,
  "data": {
    "comparison": [
      {
        "region": "central",
        "totalSurveys": 156,
        "averageScores": {...}
      },
      {
        "region": "northern",
        "totalSurveys": 142,
        "averageScores": {...}
      },
      {
        "region": "southern",
        "totalSurveys": 198,
        "averageScores": {...}
      }
    ],
    "insights": {
      "bestPerformer": "southern",
      "mostActive": "southern",
      "highestGACP": "southern"
    }
  }
}
```

## 🔧 Integration

### Initialize Module

```javascript
const { initializeSurveySystem } = require('./modules/survey-system');

// Initialize with dependencies
const { router, service } = await initializeSurveySystem({
  db: mongoDbInstance,
  authenticateToken: authMiddleware,
});

// Mount in Express app
app.use('/api', router);
```

### Use Service Directly

```javascript
const SurveySystemService = require('./modules/survey-system/services/survey-system.service');

const surveyService = new SurveySystemService(db);

// Create survey response
const result = await surveyService.createSurveyResponse({
  surveyId: 'template-central',
  userId: 'user123',
  region: 'central',
});

// Get regional analytics
const analytics = await surveyService.getRegionalAnalytics('central');
```

## 🗃️ Data Models

### SurveyResponse Schema

```javascript
{
  surveyId: String,           // Template ID
  userId: String,             // User who started survey
  farmId: String,             // Associated farm
  region: String,             // central|southern|northern|northeastern
  currentStep: Number,        // 1-7
  progress: Number,           // 0-100%
  state: String,              // DRAFT|COMPLETE|SUBMITTED

  // Step data (7 steps)
  regionSelection: {...},
  personalInfo: {...},
  farmInfo: {...},
  managementProduction: {...},
  costRevenue: {...},
  marketSales: {...},
  problemsNeeds: {...},

  // Results
  scores: {
    gacp: Number,
    sustainability: Number,
    market: Number,
    overall: Number,
    regionalBonus: Number
  },
  recommendations: [...],

  metadata: {
    createdAt: Date,
    lastSavedAt: Date,
    submittedAt: Date
  }
}
```

## 📊 Scoring Algorithm

### GACP Compliance Score

```
hasGACPCertification    → +25 points
useOrganicPractices     → +15 points
followsSOPs             → +20 points
hasQualityControl       → +15 points
hasPestManagement       → +10 points
----------------------------------------
Maximum                 → 85 points (normalized to 100)
```

### Sustainability Score

```
waterConservation       → +20 points
useOrganicFertilizer    → +15 points
environmentalConcern    → +15 points
----------------------------------------
Maximum                 → 50 points (normalized to 100)
```

### Market Access Score

```
hasMarketAccess         → +20 points
directToConsumer        → +15 points
exportMarket            → +10 points
----------------------------------------
Maximum                 → 45 points (normalized to 100)
```

### Overall Score

```
Overall = (GACP + Sustainability + Market) / 3 + Regional Bonus
Regional Bonus = +10 if region-specific condition met
```

## 🎓 Grading System

| Score Range | Grade | Description                    |
| ----------- | ----- | ------------------------------ |
| 85-100      | A     | Excellent - Best practices     |
| 75-84       | B     | Very Good - Strong performance |
| 65-74       | C     | Good - Meeting standards       |
| 50-64       | D     | Fair - Needs improvement       |
| 0-49        | F     | Poor - Urgent action needed    |

## 🔐 Security

- All endpoints require authentication (`authenticateToken` middleware)
- Users can only access their own surveys
- Admin role can view all surveys and statistics
- Draft surveys can be deleted by owner
- Submitted surveys cannot be deleted

## 🚦 Survey States

1. **DRAFT**: Survey in progress, can be edited and deleted
2. **COMPLETE**: All 7 steps filled, ready for submission
3. **SUBMITTED**: Survey submitted, scores calculated, cannot be edited

## 🌍 Regions

| Region       | Thai Name             | Bonus Condition    | Strength                |
| ------------ | --------------------- | ------------------ | ----------------------- |
| Central      | ภาคกลาง               | Market ≥60         | Market Access           |
| Southern     | ภาคใต้                | GACP ≥60           | GACP Compliance         |
| Northern     | ภาคเหนือ              | Sustainability ≥60 | Mountain Sustainability |
| Northeastern | ภาคตะวันออกเฉียงเหนือ | Sustainability ≥60 | Organic Practices       |

## 📈 Progress Tracking

- Progress calculated as: `(completedSteps / totalSteps) * 100`
- Auto-save functionality for draft surveys
- Real-time progress updates
- Step-by-step completion indicators

## 🔄 Migration Notes

**Migrated from:**

- `routes/api/surveys-4regions.js` (775 lines) - Primary source
- `routes/api/survey.js` (556 lines) - Reference implementation
- `services/survey-process.js` (454 lines) - Workflow engine

**Improvements:**

- ✅ Modular DDD architecture
- ✅ Separated concerns (routes, controllers, services)
- ✅ Comprehensive validation
- ✅ Enhanced scoring algorithm
- ✅ Better error handling
- ✅ Improved documentation

## 📝 Testing

```bash
# Run unit tests
npm test modules/survey-system/tests

# Run specific test
npm test modules/survey-system/tests/survey.service.test.js
```

## 🤝 Dependencies

- `express` - Web framework
- `mongodb` - Database driver
- `express-validator` - Input validation
- `mongoose` - MongoDB ODM
- `../shared/utils/logger` - Logging utility
- `../shared/utils/response` - Response formatting

## 📌 TODO

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Implement survey templates in templates/ folder
- [ ] Add email notifications for submitted surveys
- [ ] Add PDF report generation
- [ ] Add survey export functionality (Excel, CSV)
- [ ] Add multi-language support (Thai/English)

## 👨‍💻 Module Info

- **Version**: 1.0.0
- **Author**: GACP Platform Team
- **Created**: Phase 5 - Core Modules Migration
- **Status**: ✅ Complete

---

**End of Survey System Documentation**
