# GACP Platform - Cannabis & Medicinal Plants Certification System

**Thailand's National Platform for Smart Cannabis Farming & GACP Compliance**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/jonmaxmore/Botanical-Audit-Framework)
[![Status](https://img.shields.io/badge/status-Phase%203%20Development-green.svg)](https://github.com/jonmaxmore/Botanical-Audit-Framework)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](https://github.com/jonmaxmore/Botanical-Audit-Framework)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Supported Plants](#-supported-plants)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Development Roadmap](#-development-roadmap)
- [License](#-license)

---

## 🎯 Overview

The **GACP Platform** is a comprehensive digital ecosystem for managing **GACP (Good Agricultural and Collection Practices)** certification for **cannabis** and **medicinal plants** in Thailand. The platform serves farmers, regulatory authorities (DTAM), and agricultural stakeholders with intelligent farm management tools, IoT integration, and AI-powered recommendations.

### Mission

To modernize Thailand's cannabis and medicinal plant industry by providing farmers with world-class digital tools for:

- **GACP Compliance**: Streamlined certification process aligned with DTAM standards
- **Smart Farming**: IoT sensor integration and real-time monitoring
- **AI Recommendations**: Data-driven insights for fertilizer, irrigation, and crop management
- **Traceability**: Complete seed-to-sale tracking for regulatory compliance
- **Market Access**: Quality assurance and certification for domestic and export markets

### Platform Positioning

Unlike government portals that provide **regulations and information** (DTAM, HerbCtrl, PanThai), we provide **operational farm management tools** that help farmers actually implement GACP standards in daily operations. See [Competitive Analysis](./docs/COMPETITIVE_ANALYSIS.md) for detailed comparison.

---

## ✨ Key Features

### Phase 1: GACP Certification Management ✅ Complete

- **Dual-Portal System**
  - Farmer Portal: Application submission, document upload, status tracking
  - DTAM Portal: Application review, farm inspection, certificate issuance
- **Role-Based Access Control**: Admin, Reviewer, Inspector, Approver roles
- **Document Management**: Upload, verify, and store GACP-required documents
- **Certificate Generation**: Automated certificate issuance upon approval
- **Payment Integration**: PromptPay integration for application fees
- **Audit Trail**: Complete seed-to-sale tracking for regulatory compliance

### Phase 2: IoT & Smart Farming ✅ Complete

- **IoT Integration**: Real-time monitoring of soil, water, and environmental conditions
- **Sensor Dashboard**: Live data visualization and alerts
- **Farm Management**: Multi-farm management with crop rotation tracking
- **SOP Tracking**: 5-step Standard Operating Procedures (Seed → Cultivation → Harvest → Processing → Sale)
- **Chemical Registry**: Track and manage pesticide, fertilizer usage (GACP compliant)
- **QR Code Generation**: Traceability labels for products

### Phase 3: AI Recommendations & Analytics 🚀 In Development

- **Fertilizer Recommendation Engine**: AI-powered NPK recommendations based on:
  - Growth stage (seedling, vegetative, flowering)
  - Soil conditions (pH, existing nutrients, soil type)
  - Environmental factors (temperature, humidity, moisture)
  - Regional data (77 Thai provinces)
  - Historical yield data (machine learning)
- **Irrigation Optimization**: Smart water management recommendations
- **Disease Prediction**: Early warning system based on environmental conditions
- **Yield Forecasting**: ML-based predictions for harvest planning
- **Thai NLP Assistant**: Natural language Q&A for farmers (Thai language)
- **Central Plant Database**: Knowledge base for cannabis and 5 medicinal plants

**Current Status**: Fertilizer recommendation engine functional (rule-based + ML-ready architecture). See [Phase 3 Guide](./docs/PHASE3_SMART_RECOMMENDATIONS_AI_GUIDE.md) and [Research](./docs/FERTILIZER_RECOMMENDATION_RESEARCH.md).

---

## 🌿 Supported Plants

The platform focuses on **cannabis** as the primary crop, with support for 5 additional economically important medicinal plants:

### 1. 🥇 Cannabis (กัญชา) - **PRIMARY FOCUS**

- **Medical cannabis** (high CBD, low THC < 0.2%)
- **Hemp** (industrial, fiber, seed)
- **GACP certification required** by DTAM (กรมแพทย์แผนไทยและการแพทย์ทางเลือก)
- **Complete traceability** from seed to sale
- **40+ cultivars** supported with detailed growing profiles

**Platform Mission**: Bring cannabis producers into Thailand's legal system through simplified GACP compliance and smart farming tools.

### 2-6. Secondary Economic Crops (Future Phases)

| Plant           | Thai Name | Development Phase |
| --------------- | --------- | ----------------- |
| Turmeric        | ขมิ้นชัน  | Future            |
| Ginger          | ขิง       | Future            |
| Black Galingale | กระชายดำ  | Future            |
| Plai            | ไพล       | Future            |
| Kratom          | กระท่อม   | Research          |

**Note**: Cannabis is **always prioritized** as the first option in all menus, forms, and displays across the platform.

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14.2 (React 18) with TypeScript
- **UI Library**: Material-UI (MUI) 5.x + TailwindCSS
- **State Management**: React Context API + Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios + React Query

### Backend

- **Runtime**: Node.js 24.9.0 LTS
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB 6+ with Mongoose ODM
- **Authentication**: JWT (separate systems for Farmers and DTAM)
- **Real-time**: WebSocket support for live updates
- **Cache**: Redis (optional)

### AI & Data Science

- **ML Framework**: (Planned) XGBoost, Random Forest for predictions
- **NLP**: Thai language processing for farmer Q&A
- **Data Storage**: Historical yield data, regional conditions, plant database

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2 for production
- **CI/CD**: GitHub Actions
- **Monitoring**: Application logs with rotation

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (recommended: 24.9.0)
- **MongoDB** >= 6.0
- **npm** or **pnpm** package manager
- **Git**

### Quick Installation

```bash
# 1. Clone repository
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend-nextjs
npm install
cd ..

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 5. Start MongoDB (Docker)
docker-compose up -d mongodb

# 6. Start backend (port 3004)
cd apps/backend
node atlas-server.js

# 7. Start frontend (port 3000) - new terminal
cd frontend-nextjs
npm run dev
```

### Access Application

- **Farmer Portal**: [http://localhost:3000/farmer](http://localhost:3000/farmer)
- **DTAM Portal**: [http://localhost:3000/dtam](http://localhost:3000/dtam)
- **API Health**: [http://localhost:3004/health](http://localhost:3004/health)

### Environment Configuration

Key environment variables (`.env`):

```bash
# Server
PORT=3004
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gacp_development
DB_NAME=gacp_development

# Authentication
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
DTAM_JWT_SECRET=your-dtam-secret-key
DTAM_JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

For complete configuration guide, see [Environment Config](./docs/ENVIRONMENT_CONFIG.md).

---

## 📚 Documentation

### 🚀 Getting Started

- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)** - Get running in 2 minutes
- **[Development Setup](./docs/DEVELOPER_SETUP.md)** - Full development environment setup
- **[Deployment Guide](./docs/05_DEPLOYMENT/DEPLOYMENT_GUIDE.md)** - Production deployment instructions

### 🎯 System Architecture

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - System design and component architecture
- **[Competitive Analysis](./docs/COMPETITIVE_ANALYSIS.md)** - Market positioning vs government platforms
- **[Central Database Design](./docs/CENTRAL_DATABASE_DESIGN.md)** - 6-plant knowledge base with ML integration

### 📖 Phase-Specific Guides

| Phase   | Guide                                                                             | Status            |
| ------- | --------------------------------------------------------------------------------- | ----------------- |
| Phase 1 | [GACP Certification & Admin Portal](./docs/PHASE1_IMPLEMENTATION_GUIDE.md)        | ✅ Complete       |
| Phase 2 | [IoT & Smart Farming](./docs/PHASE2_IOT_SMART_FARMING_GUIDE.md)                   | ✅ Complete       |
| Phase 3 | [AI Recommendations & Analytics](./docs/PHASE3_SMART_RECOMMENDATIONS_AI_GUIDE.md) | 🚀 In Development |

### 🔬 Research & Analysis

- **[Fertilizer Recommendation Research](./docs/FERTILIZER_RECOMMENDATION_RESEARCH.md)** - DTAM standards, competitors, ML approaches
- **[Codebase Inventory](./docs/CODEBASE_INVENTORY_PHASE3.md)** - What exists vs what to build
- **[Subscription Features](./docs/SUBSCRIPTION_FEATURE_ACCESS.md)** - Future monetization strategy

### 🔧 Technical Documentation

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Database Schema](./docs/04_DATABASE/README.md)** - MongoDB collections and relationships
- **[Linting Guide](./docs/LINTING_GUIDE.md)** - Code quality and auto-formatting

### 👥 User Guides

- **[User Manual](./docs/07_USER_GUIDES/USER_MANUAL.md)** - For farmers and DTAM staff
- **[Testing Guide](./docs/08_TESTING/README.md)** - UAT and QA procedures

---

## 🗺️ Development Roadmap

### Phase 1: GACP Certification Management ✅ Complete (Oct 2025)

- Dual-portal architecture (Farmer + DTAM)
- Application workflow with multi-stage approval
- Document upload and verification
- Certificate generation
- Payment integration (PromptPay)
- Audit trail and compliance tracking

### Phase 2: IoT & Smart Farming ✅ Complete (Oct 2025)

- Real-time sensor integration (soil, water, environmental)
- Farm dashboard with live data visualization
- SOP tracking (5-step seed-to-sale process)
- Chemical registry for GACP compliance
- QR code traceability
- Multi-farm management

### Phase 3: AI Recommendations & Analytics 🚀 In Development (Current)

**Completed:**

- ✅ Central plant database (6 plants: PlantCatalog, PlantCultivar, RegionalConditions, DiseasePest, HistoricalYield)
- ✅ Fertilizer recommendation engine (rule-based + ML-ready)
- ✅ GACP compliance integration (DTAM standards)
- ✅ Regional data (77 Thai provinces)
- ✅ NPK calculation algorithms

**In Progress:**

- 🔄 ML model training (XGBoost, Random Forest)
- 🔄 Irrigation optimization engine
- 🔄 Disease prediction system
- 🔄 Thai NLP assistant

**Planned:**

- ⏳ Yield forecasting
- ⏳ Market price predictions
- ⏳ Resource optimization (water, fertilizer)

### Phase 4: National Expansion (2026)

- Mobile apps (iOS, Android) for farmers and inspectors
- Government API integration (DOA, FDA, DGA)
- Export certification support
- Research collaboration platform
- Advanced traceability and audit trail features

### Phase 5: Advanced Features (2027+)

- Drone integration for farm monitoring
- Satellite imagery analysis
- Supply chain management
- Marketplace integration
- Cooperative management tools

**Detailed Roadmap**: See [National Platform Roadmap](./docs/NATIONAL_PLATFORM_ROADMAP.md) for 18-month development plan.

---

## 🏗️ System Architecture

### Service-Based Architecture

The platform is built using a **modular service-based architecture** with clearly separated concerns:

```
Botanical-Audit-Framework/
│
├── apps/
│   └── backend/                      # Node.js/Express Backend
│       │
│       ├── services/                 # 🔧 Business Logic Services (Separable)
│       │   ├── ai/                   # AI/ML Services
│       │   │   ├── fertilizer-recommendation.service.js
│       │   │   ├── irrigation-optimization.service.js (planned)
│       │   │   ├── disease-prediction.service.js (planned)
│       │   │   └── yield-forecasting.service.js (planned)
│       │   │
│       │   ├── iot/                  # IoT Integration Services
│       │   │   ├── sensor-data.service.js
│       │   │   └── alert-notification.service.js
│       │   │
│       │   └── payment/              # Payment Services
│       │       └── promptpay.service.js
│       │
│       ├── modules/                  # 📦 Feature Modules (Separable)
│       │   ├── auth-dtam/            # DTAM Authentication Module
│       │   │   ├── auth.routes.js
│       │   │   ├── auth.controller.js
│       │   │   └── auth.service.js
│       │   │
│       │   ├── farm-management/      # Farm Management Module
│       │   │   ├── farm.routes.js
│       │   │   ├── farm.controller.js
│       │   │   └── farm.service.js
│       │   │
│       │   ├── document/             # Document Management Module
│       │   │   ├── document.routes.js
│       │   │   ├── document.controller.js
│       │   │   └── document.service.js
│       │   │
│       │   └── certification/        # GACP Certification Module
│       │       ├── application.routes.js
│       │       ├── application.controller.js
│       │       └── application.service.js
│       │
│       ├── routes/                   # 🌐 API Route Handlers
│       │   ├── ai/                   # AI service routes
│       │   │   ├── fertilizer.routes.js
│       │   │   └── fertilizer-products.routes.js
│       │   └── [other route files]
│       │
│       ├── controllers/              # 🎮 Request Controllers
│       │   ├── ai/                   # AI controllers
│       │   │   └── fertilizer.controller.js
│       │   └── [other controllers]
│       │
│       ├── models/                   # 🗄️ Database Models
│       │   ├── PlantCatalog.js       # Central plant database
│       │   ├── PlantCultivar.js      # 40+ cultivar profiles
│       │   ├── RegionalConditions.js # 77 Thai provinces
│       │   ├── DiseasePest.js        # Disease database
│       │   ├── HistoricalYield.js    # ML training data
│       │   ├── FertilizerProduct.js  # GACP-approved products
│       │   ├── Farm.js               # Farm management
│       │   └── Crop.js               # Crop tracking
│       │
│       ├── middleware/               # ⚙️ Middleware
│       │   ├── auth.middleware.js
│       │   ├── validation.middleware.js
│       │   └── feature-access.middleware.js
│       │
│       └── atlas-server.js           # Main server entry point
│
├── frontend-nextjs/                  # 🎨 Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── farmer/               # Farmer Portal
│   │   │   └── dtam/                 # DTAM Portal
│   │   ├── components/               # Shared UI components
│   │   └── contexts/                 # React state contexts
│   └── public/                       # Static assets
│
├── docs/                             # 📚 Documentation
│   ├── PHASE1_IMPLEMENTATION_GUIDE.md
│   ├── PHASE2_IOT_SMART_FARMING_GUIDE.md
│   ├── PHASE3_SMART_RECOMMENDATIONS_AI_GUIDE.md
│   ├── API_FERTILIZER_ENDPOINTS.md
│   ├── FERTILIZER_RECOMMENDATION_RESEARCH.md
│   ├── COMPETITIVE_ANALYSIS.md
│   ├── CENTRAL_DATABASE_DESIGN.md
│   └── ARCHITECTURE.md
│
├── archive/                          # Old documentation (timestamped)
├── .env.example                      # Environment configuration template
├── docker-compose.yml                # Docker services
├── ecosystem.config.js               # PM2 process manager config
└── README.md                         # This file
```

### Key Architectural Principles

1. **Modular Services**: Each service (AI, IoT, Payment, etc.) is independently deployable and maintainable
2. **Separation of Concerns**: Clear boundaries between routes, controllers, services, and models
3. **Feature Modules**: Self-contained feature modules with their own routes, controllers, and services
4. **Scalability**: Services can be scaled independently based on load
5. **Database-Driven**: MongoDB with Mongoose ODM for flexible schema design
6. **API-First**: RESTful API design for easy frontend integration and future mobile apps

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Coverage Goals

- **Unit Tests**: > 80%
- **Integration Tests**: > 70%
- **E2E Tests**: > 60%

See [Testing Guide](./docs/08_TESTING/README.md) for complete testing procedures.

---

## 🚀 Deployment

### Production Deployment

**Using PM2** (Recommended):

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs gacp-backend
```

**Using Docker**:

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

See [Deployment Guide](./docs/05_DEPLOYMENT/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📊 Current Status

### Phase 1 & 2: Production Ready ✅

- **GACP Certification**: Fully functional with 95%+ uptime
- **IoT Integration**: Real-time monitoring operational
- **Farm Management**: Supporting multiple farms

### Phase 3: Active Development 🚀

- **Central Database**: 5 models created (PlantCatalog, PlantCultivar, RegionalConditions, DiseasePest, HistoricalYield)
- **Fertilizer Engine**: Rule-based system operational, ML integration in progress
- **GACP Compliance**: 100% compliant with DTAM standards
- **Research Complete**: Competitive analysis, algorithms, data sources identified

**Next Steps:**

1. ML model training with historical data
2. Irrigation optimization engine
3. Disease prediction system
4. API endpoints for AI services
5. Thai NLP assistant

---

## 🤝 Contributing

This is a proprietary platform developed for Thailand's Department of Thai Traditional and Alternative Medicine (DTAM). External contributions are not currently accepted.

For internal development team:

- Follow the [Development Setup](./docs/DEVELOPER_SETUP.md) guide
- Review [Linting Guide](./docs/LINTING_GUIDE.md) for code standards
- Check [Architecture Documentation](./docs/ARCHITECTURE.md) before major changes

---

## 📄 License

**Proprietary Software** - All rights reserved.

Developed for the Department of Thai Traditional and Alternative Medicine (DTAM), Ministry of Public Health, Thailand.

Unauthorized use, distribution, or reproduction is strictly prohibited.

---

## 📞 Support

### For Development Team

- **Documentation**: Check `docs/` folder for comprehensive guides
- **Issues**: Report via GitHub Issues (internal repository)
- **Architecture Questions**: See [Architecture Documentation](./docs/ARCHITECTURE.md)

### System Requirements

**Minimum:**

- Node.js 18+
- MongoDB 6+
- 2GB RAM
- 10GB disk space

**Recommended:**

- Node.js 24+
- MongoDB 6+
- 4GB RAM
- 20GB SSD storage

---

## 🎯 Vision

To become **Thailand's national platform** for smart cannabis and medicinal plant farming, combining:

- **Regulatory Compliance** (GACP standards)
- **Smart Agriculture** (IoT sensors, real-time monitoring)
- **Artificial Intelligence** (predictive analytics, recommendations)
- **Traceability** (complete seed-to-sale tracking for regulatory compliance)
- **Market Access** (quality assurance for export)

**Target**: 5,000-10,000 farms nationwide by 2027

---

**Version**: 3.0.0
**Last Updated**: October 28, 2025
**Status**: Phase 3 Development (AI Recommendations)
**Maintained by**: GACP Platform Development Team
