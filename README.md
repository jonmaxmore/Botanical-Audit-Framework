# 🏆 GACP Certification Flow Platform (Botanical Audit Framework)

**Version**: 2.0.0
**Status**: ✅ Production Ready → 🚀 **National Platform in Development**
**Last Updated**: October 26, 2025
**Production Readiness**: 95% (Core) | 40% (National Features)

A comprehensive digital platform for managing **GACP (Good Agricultural and Collection Practices)** certification process for cannabis farms in Thailand, serving farmers and DTAM (Department of Thai Traditional and Alternative Medicine) staff.

## 🎯 **Vision: Thailand's National Agricultural Platform**

We are evolving into a **National Platform for Smart Cannabis Farming** with:

- 🌱 **IoT-enabled Farm Monitoring** (Soil, Water, Environmental Sensors)
- 🧬 **Seed Genetics Management** (Complete Traceability, Thai FDA Integration)
- 🤖 **AI-Powered Recommendations** (Fertilizer, Irrigation, Pest Management)
- 📊 **Research & Analytics** (National Agricultural Database)
- 📱 **Mobile Apps** (Farmer & Inspector Apps)

**Target**: 5,000-10,000 farms nationwide by 2027 (18-month development roadmap)

**See**: [National Platform Roadmap](./docs/NATIONAL_PLATFORM_ROADMAP.md) for full development plan

---

## 🎯 New to the Project?

**Start here**: [QUICK_START.md](./QUICK_START.md) - Get up and running in 2 minutes!

### Important Guides

#### 🚀 National Platform Development

🗺️ **[National Platform Roadmap](./docs/NATIONAL_PLATFORM_ROADMAP.md)** - 18-month development plan (5 phases)
🔬 **[Research Findings Summary](./docs/RESEARCH_FINDINGS_SUMMARY.md)** - Current capabilities analysis
📋 **[Linting Guide](./docs/LINTING_GUIDE.md)** - Auto-lint on every commit (NEW!)

#### 📖 System Documentation

📖 **[Server Management Guide](./SERVER_MANAGEMENT_GUIDE.md)** - Complete guide for dev and production
📊 **[Production Final Report](./PRODUCTION_FINAL_REPORT.md)** - Latest production readiness report
🔧 **[PM2 Guide](./PM2_GUIDE.md)** - Process management for production
🏗️ **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System architecture, modules, and design decisions
🗑️ **[Deprecated Files](./docs/DEPRECATED.md)** - List of deprecated code and migration guides
🏢 **[Main Services Catalog](./docs/MAIN_SERVICES_CATALOG.md)** - Complete list of all 6 main services
📇 **[Quick Reference Services](./docs/QUICK_REFERENCE_SERVICES.md)** - Quick reference card for services

---

## 🏢 Main Services (6 Core Services)

GACP Platform provides **6 main services** with 4 supporting services:

| #   | Service                     | Type                 | Status        |
| --- | --------------------------- | -------------------- | ------------- |
| 1   | **Authentication & SSO**    | Infrastructure       | ✅ Production |
| 2   | **GACP Application System** | Business             | ✅ Production |
| 3   | **Farm Management**         | Standalone + Control | ✅ Production |
| 4   | **Track & Trace**           | Business             | ✅ Production |
| 5   | **Survey System**           | Standalone           | ✅ Production |
| 6   | **Standards Comparison**    | Standalone           | ✅ Production |

**Quick Command**: `node config/services-catalog.js` to see complete catalog

📖 **Full Documentation**: [Main Services Catalog](./docs/MAIN_SERVICES_CATALOG.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0 (recommended: 24.9.0)
- MongoDB >= 6.0
- npm or pnpm package manager
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/jonmaxmore/gacp-certify-flow-main.git
cd gacp-certify-flow-main

# 2. Install backend dependencies
pnpm install

# 3. Install frontend dependencies
cd frontend-nextjs
npm install
cd ..

# 4. Setup environment variables
cp .env.example .env
# Edit .env with your configuration (see Configuration section)

# 5. Start MongoDB
docker-compose up -d mongodb
# Or start local MongoDB instance

# 6. Start backend server (port 3004)
cd apps/backend
node atlas-server.js

# 7. Start frontend (port 3000) - in another terminal
cd frontend-nextjs
npm run dev
```

### Access Application

- **Farmer Portal**: http://localhost:3000/farmer
- **DTAM Portal**: http://localhost:3000/dtam
- **API**: http://localhost:3004
- **Health Check**: http://localhost:3004/health

---

## 📋 Overview

The GACP Certification Flow Platform streamlines the entire certification process for cannabis cultivation, from initial application through final certificate issuance.

### 👨‍🌾 Farmers (Public Portal)

- Submit certification applications
- Upload required documentation
- Track application status
- Receive certificates upon approval
- Generate reports

### 🏛️ DTAM Staff (Department Portal)

- Review and approve applications
- Conduct farm inspections
- Manage farmer accounts
- Generate system reports
- Monitor certification standards

---

## ✨ Features

### Core Functionality

- ✅ **Two-Portal System**: Separate interfaces for farmers and DTAM staff
- ✅ **Application Workflow**: Multi-step certification process with review stages
- ✅ **Document Management**: Upload, verify, and store required documents
- ✅ **Authentication & Authorization**: JWT-based security with RBAC
- ✅ **Dashboard Analytics**: Real-time statistics and insights
- ✅ **Certificate Generation**: Automated certificate issuance
- ✅ **Report Generation**: Comprehensive reporting tools

### Security Features

- 🔒 **Separate Authentication**: Distinct login systems for farmers and DTAM
- 🔒 **Role-Based Access Control (RBAC)**: Admin, Reviewer, Manager roles
- 🔒 **JWT Token Security**: Secure token-based authentication
- 🔒 **Password Hashing**: bcrypt password encryption
- 🔒 **Input Validation**: Comprehensive request validation

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14.2 (React 18)
- **Language**: TypeScript
- **UI Library**: Material-UI (MUI) 5.x
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup validation

### Backend

- **Runtime**: Node.js 24.9.0
- **Framework**: Express 5.1.0
- **Database**: MongoDB 6+
- **ODM**: Mongoose 8.x
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Validation**: Custom validation middleware

### DevOps

- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2
- **Version Control**: Git + GitHub
- **Environment**: dotenv for configuration

---

## ⚙️ Configuration

### Environment Variables (.env)

```bash
# ═══════════════════════════════════════════════════════════════
# GACP Platform Environment Configuration
# ═══════════════════════════════════════════════════════════════

# Server Configuration
PORT=3004
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gacp_development
DB_NAME=gacp_development

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# DTAM JWT (separate system)
DTAM_JWT_SECRET=your-dtam-jwt-secret-key-change-this
DTAM_JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Government API Configuration
DOA_API_URL=https://api.doa.go.th/v1
FDA_API_URL=https://api.fda.moph.go.th/v1
DGA_API_URL=https://api.dga.or.th/v1
DTAM_API_URL=https://api.dtam.go.th/v1

# Payment Configuration (PromptPay)
PROMPTPAY_API_URL=https://api.promptpay.io/v1
PROMPTPAY_MERCHANT_ID=your-merchant-id

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Notification Configuration
LINE_NOTIFY_TOKEN=your-line-notify-token
SMS_API_URL=https://api.sms.co.th/v1
SMS_API_KEY=your-sms-api-key

# File Storage Configuration
STORAGE_TYPE=local
AWS_S3_BUCKET=gacp-documents
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## � Running the Application

### Development Mode

**Backend**:

```bash
# Start backend server with auto-reload
cd apps/backend
npm run dev

# Or manually
node atlas-server.js
```

**Frontend**:

```bash
cd frontend-nextjs
npm run dev
```

├── apps/ # Applications (Monorepo)- Node.js >= 18.0.0 (recommended: 24.9.0)

│ ├── farmer-portal/ # Farmer portal (Next.js 15)

│ ├── dtam-portal/ # DTAM portal (Next.js 15)- MongoDB >= 6.0### 🏛️ **DTAM Staff** (Department of Thai Traditional and Alternative Medicine)

│ ├── public-services/ # Public services (Next.js 15)

│ └── backend/ # Backend services (Node.js 20)- npm or yarn- Review and approve applications

│

├── packages/ # Shared packages- Git- Conduct farm inspections

│ ├── ui/ # Shared UI components

│ ├── config/ # Shared configuration- Manage farmer accounts

│ ├── types/ # TypeScript types

│ └── utils/ # Shared utilities### Installation- Generate system reports

│

├── docs/ # 📚 Documentation (NEW!)- Monitor certification standards

│ ├── 00_PROJECT_OVERVIEW/ # Project planning

│ ├── 01_SYSTEM_ARCHITECTURE/ # System design```bash

│ ├── 02_TEAM_DISCUSSIONS/ # Team decisions

│ ├── 03_WORKFLOWS/ # Business workflows# 1. Clone repository---

│ ├── 04_DATABASE/ # Database docs

│ ├── 05_DEPLOYMENT/ # Deployment guidesgit clone https://github.com/jonmaxmore/gacp-certify-flow-main.git

│ ├── 06_FRONTEND/ # Frontend docs

│ ├── 07_USER_GUIDES/ # User manualscd gacp-certify-flow-main## ✨ Features

│ └── 08_TESTING/ # Testing docs

│

├── scripts/ # Utility scripts

├── tests/ # Test suites# 2. Install backend dependencies### Core Functionality

├── k8s/ # Kubernetes configs

└── archive/ # 📦 Old reports (NEW!)npm install- ✅ **Two-Portal System**: Separate interfaces for farmers and DTAM staff

```

- ✅ **Application Workflow**: Multi-step application process with review stages

---

# 3. Install frontend dependencies- ✅ **Document Management**: Upload, verify, and store required documents

## 🎯 System Overview

cd frontend-nextjs- ✅ **Authentication & Authorization**: Separate JWT-based authentication systems

### Architecture: 2 Builds

npm install- ✅ **Dashboard Analytics**: Real-time statistics and insights

#### 1. Farmer Portal (Port 3001)

- **Login 1**: Application Submissioncd ..- ✅ **Certificate Generation**: Automated certificate issuance

  - Submit GACP application

  - Upload documents- ✅ **Report Generation**: Comprehensive reporting tools

  - Payment (PromptPay)

  - Track status# 4. Configure environment

  - Download certificate

cp .env.example .env### Security Features

- **Login 2**: Farm Management

  - Create/manage farms# Edit .env with your settings- 🔒 **Separate Authentication**: Distinct login systems for farmers and DTAM

  - SOP Tracking (5 steps: Seed to Sale)

  - Chemical registry- 🔒 **Role-Based Access Control (RBAC)**: Admin, Reviewer, Manager roles

  - QR Code generation

  - Compliance checking# 5. Start MongoDB- 🔒 **JWT Token Security**: Secure token-based authentication



#### 2. DTAM Portal (Port 3002)docker-compose up -d mongodb- 🔒 **Password Hashing**: bcrypt password encryption

- **4 Roles** (Single portal):

  - **Reviewer**: Review applications# Or start local MongoDB instance- 🔒 **Input Validation**: Comprehensive request validation

  - **Inspector**: Farm inspection (30+ checklist)

  - **Approver**: Final approval

  - **Admin**: System management, reports

# 6. Start backend server (port 3004)### Technical Features

#### 3. Free Services (Public)

- Survey systemnode app.js- ⚡ **Modern Stack**: Next.js 14 + Express 5 + MongoDB 6

- Standards comparison (GACP vs others)

- Track & Trace (QR scanner)- ⚡ **Clean Architecture**: Modular, maintainable codebase



---# 7. Start frontend (port 3000) - in another terminal- ⚡ **TypeScript**: Type-safe frontend development



## 💻 Tech Stackcd frontend-nextjs- ⚡ **Material-UI**: Professional, responsive design



### Frontend:npm run dev- ⚡ **Docker Support**: Containerized deployment

```

Framework: Next.js 15 (React 18)```- ⚡ **PM2 Process Management**: Production-ready process management

Styling: TailwindCSS + Material-UI

Language: TypeScript

State: Zustand

Forms: React Hook Form + Zod### Access Application---

HTTP: Axios + React Query

```



### Backend:- **Farmer Portal**: http://localhost:3000/farmer## 🛠️ Technology Stack

```

Runtime: Node.js 20 LTS- **DTAM Portal**: http://localhost:3000/dtam

Framework: Express.js

Database: MongoDB 7.0- **API**: http://localhost:3004### Frontend

Cache: Redis 7.2

Queue: RabbitMQ 3.12- **Health Check**: http://localhost:3004/health- **Framework**: Next.js 14.2 (React 18)

ORM: Mongoose

Testing: Jest + Supertest- **Language**: TypeScript

````

---- **UI Library**: Material-UI (MUI) 5.x

### Infrastructure:

```- **State Management**: React Context API

Container: Docker + Kubernetes

CI/CD: GitHub Actions## ⚙️ Configuration- **HTTP Client**: Axios

Monitoring: Prometheus + Grafana

Logging: ELK Stack- **Form Handling**: React Hook Form + Yup validation

API Gateway: Kong

```### Environment Variables (.env)



---### Backend



## 👥 Team Structure```bash- **Runtime**: Node.js 24.9.0



- **Project Manager (PM)**: 2 คน# Server- **Framework**: Express 5.1.0

- **System Analyst (SA)**: 3 คน

- **Software Engineer (SE)**: 8 คน (4 Backend + 4 Frontend)PORT=3004- **Database**: MongoDB 6+

- **MIS**: 2 คน

- **UX/UI Designer**: 3 คนNODE_ENV=production- **ODM**: Mongoose 8.x

- **QA Engineer**: 3 คน

- **Authentication**: JWT (jsonwebtoken)

**Total Team**: 21 members

# Database- **Password**: bcrypt

---

MONGODB_URI=mongodb://localhost:27017/gacp_production- **Validation**: Custom validation middleware

## 📅 Project Timeline

DB_NAME=gacp_production

**Duration**: 6 months (October 2025 - March 2026)

### DevOps

````

Phase 0: Setup (Week 1-2) ✅ Completed# JWT Authentication- **Containerization**: Docker + Docker Compose

Phase 1: MVP (Week 3-10) ⏳ In Progress

Phase 2: Farm Management (Week 11-16) 📋 PlannedJWT_SECRET=your-secret-key-change-this- **Process Manager**: PM2

Phase 3: Free Services (Week 17-18) 📋 Planned

Phase 4: Polish & Testing (Week 19-22) 📋 PlannedJWT_EXPIRES_IN=7d- **Version Control**: Git + GitHub

Phase 5: Launch (Week 23-24) 📋 Planned

````- **Environment**: dotenv for configuration



---# DTAM JWT (separate system)



## 💰 BudgetDTAM_JWT_SECRET=your-dtam-secret-key---



```DTAM_JWT_EXPIRES_IN=24h

Team Salaries:         5,670,000 THB

Infrastructure:          490,000 THB## 🚀 Quick Start

Software Licenses:        20,650 THB

External Services:       180,000 THB# CORS

Miscellaneous:           721,000 THB

──────────────────────────────────ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com### Prerequisites

Total:                 7,081,650 THB

```- Node.js >= 18.0.0 (recommended: 24.9.0)



---# File Upload- MongoDB >= 6.0



## 🚀 Development CommandsMAX_FILE_SIZE=10485760- npm or yarn package manager



```bashUPLOAD_PATH=./uploads- Git

# Development

pnpm dev              # Start all apps in dev mode```

pnpm dev:farmer       # Start farmer portal only

pnpm dev:dtam         # Start DTAM portal only### 1. Clone Repository

pnpm dev:backend      # Start backend only

---```bash

# Build

pnpm build            # Build all appsgit clone https://github.com/jonmaxmore/gacp-certify-flow-main.git

pnpm build:farmer     # Build farmer portal

pnpm build:dtam       # Build DTAM portal## 📁 Project Structurecd gacp-certify-flow-main



# Testing```

pnpm test             # Run all tests

pnpm test:unit        # Unit tests only```

pnpm test:e2e         # E2E tests only

pnpm test:load        # Load testinggacp-certify-flow-main/### 2. Install Dependencies



# Database├── app.js                      # Main Express application```bash

pnpm db:seed          # Seed database

pnpm db:migrate       # Run migrations├── package.json                # Backend dependencies# Install backend dependencies

pnpm db:backup        # Backup database

├── ecosystem.config.js         # PM2 configurationnpm install

# Linting

pnpm lint             # Lint all code├── docker-compose.yml          # Docker services

pnpm format           # Format with Prettier

```├── Dockerfile.backend          # Backend container# Install frontend dependencies



---│cd frontend-nextjs



## 📖 API Documentation├── src/                        # Backend sourcenpm install



- **Swagger UI**: http://localhost:3000/api-docs│   ├── controllers/            # Request handlerscd ..

- **Postman Collection**: [docs/api-postman.json](./docs/api-postman.json)

- **OpenAPI Spec**: [docs/openapi.yaml](./docs/openapi.yaml)│   ├── models/                 # MongoDB models```



---│   ├── routes/                 # API routes



## 🔒 Security│   ├── middleware/             # Custom middleware### 3. Configure Environment



### Authentication:│   └── utils/                  # Utilities```bash

- JWT tokens (15 min access + 7 day refresh)

- OTP verification (SMS)│# Copy environment template

- Role-based access control (RBAC)

├── modules/                    # Clean architecture modulescp .env.example .env

### Data Protection:

- SSL/TLS encryption│   ├── auth-dtam/              # DTAM authentication

- Data encryption at rest

- PDPA compliance│   ├── document/               # Document management# Edit .env with your configuration

- ISO 27001 standards

│   ├── dashboard/              # Dashboard module# (See Configuration section below)

---

│   └── shared/                 # Shared utilities```

## 🧪 Testing

│

### Test Coverage:

```├── frontend-nextjs/            # Next.js frontend### 4. Start MongoDB

Unit Tests:        80% coverage

Integration Tests: 70% coverage│   ├── src/app/```bash

E2E Tests:         60% coverage

Overall:           75% coverage│   │   ├── farmer/             # Farmer portal# Using Docker

````

│ │ └── dtam/ # DTAM portaldocker-compose up -d mongodb

### Load Testing:

- Target: 10,000 concurrent users│ ├── components/ # Shared components

- API Response: < 500ms (p95)

- Page Load: < 3s│ └── public/ # Static assets# Or start local MongoDB

---│mongod --dbpath /path/to/data

## 📊 Monitoring└── docs/```

### Metrics: ├── DEPLOYMENT_GUIDE.md # Deployment instructions

- Prometheus + Grafana dashboards

- Real-time alerts (Slack/PagerDuty) └── USER_MANUAL.md # User documentation### 5. Start Application

- Application metrics

- Infrastructure metrics``````bash

### Logging:# Start backend (port 3004)

- ELK Stack (Elasticsearch, Logstash, Kibana)

- Centralized logging---node app.js

- Log retention: 90 days

---

## 🎮 Running the Application# In another terminal, start frontend (port 3000)

## 🔧 Troubleshooting

cd frontend-nextjs

### Common Issues:

### Development Modenpm run dev

**1. MongoDB connection failed:**

`bash`

# Check if MongoDB is running

docker ps | grep mongodb```bash

# Restart MongoDB# Backend### 6. Access Application

docker-compose restart mongodb

````node app.js- **Farmer Portal**: http://localhost:3000/farmer



**2. Port already in use:**- **DTAM Portal**: http://localhost:3000/dtam

```bash

# Check what's using the port# Frontend (separate terminal)- **API**: http://localhost:3004

netstat -ano | findstr :3000

cd frontend-nextjs- **Health Check**: http://localhost:3004/health

# Kill the process (replace PID)

taskkill /PID <PID> /Fnpm run dev

````

````---

**3. Dependencies not installing:**

```bash

# Clear cache and reinstall

rm -rf node_modules### Production Mode## 📦 Installation

rm pnpm-lock.yaml

pnpm install

````

**Using PM2** (Recommended):### Development Setup

---

## 📞 Support

`bash`bash

### Documentation:

- **Project Plan**: [docs/00_PROJECT_OVERVIEW/](./docs/00_PROJECT_OVERVIEW/)# Install PM2# 1. Install backend dependencies

- **Technical Docs**: [docs/01_SYSTEM_ARCHITECTURE/](./docs/01_SYSTEM_ARCHITECTURE/)

- **User Guides**: [docs/07_USER_GUIDES/](./docs/07_USER_GUIDES/)npm install -g pm2npm install

### Contact:

- **PM Lead**: คุณสมชาย - somchai@gacp.go.th

- **SE Lead**: คุณสมบูรณ์ - somboon@gacp.go.th# Start application# 2. Install frontend dependencies

- **UX Lead**: คุณสมนิด - somnit@gacp.go.th

pm2 start ecosystem.config.jscd frontend-nextjs

### Communication:

- Slack: #gacp-devnpm install

- Jira: https://gacp.atlassian.net

- Wiki: https://wiki.gacp.go.th# View logscd ..

---pm2 logs gacp-backend

## 📜 License# 3. Setup environment variables

Copyright © 2025 DTAM (กรมการปกครอง) # Monitorcp .env.example .env

All rights reserved.

pm2 monit

---

````# 4. Initialize database (optional - auto-created on first run)

## 🔗 Quick Links

# The application will create collections automatically

- [Complete Project Plan](./docs/00_PROJECT_OVERVIEW/COMPLETE_TEAM_PROJECT_PLAN.md) ⭐

- [System Architecture](./docs/01_SYSTEM_ARCHITECTURE/SA_SE_SYSTEM_ARCHITECTURE.md)**Using Docker**:

- [Microservices Guide](./docs/01_SYSTEM_ARCHITECTURE/MICROSERVICES_ARCHITECTURE_GUIDE.md)

- [Quick Start Guide](./QUICK_START_GUIDE.md)# 5. Create initial DTAM admin user (if needed)

- [User Manual](./docs/07_USER_GUIDES/USER_MANUAL.md)

- [API Documentation](./docs/API_DOCUMENTATION.md)```bash# Use the user creation API or MongoDB directly

- [Deployment Guide](./docs/05_DEPLOYMENT/DEPLOYMENT_GUIDE.md)

# Start all services```

---

docker-compose up -d

**🎉 Ready to build something amazing!** 🚀

### Production Setup

Last updated: October 15, 2025

# View logs

docker-compose logs -f```bash

# 1. Clone and install

# Stop servicesgit clone https://github.com/jonmaxmore/gacp-certify-flow-main.git

docker-compose downcd gacp-certify-flow-main

```npm install



---# 2. Build frontend for production

cd frontend-nextjs

## 📚 API Documentationnpm run build

cd ..

### Key Endpoints

# 3. Configure environment

**Authentication**:cp .env.example .env

- `POST /api/auth/register` - Register new farmer# Edit .env for production

- `POST /api/auth/login` - Farmer login

- `POST /api/auth/dtam/login` - DTAM staff login# 4. Start with PM2

npm install -g pm2

**Applications**:pm2 start ecosystem.config.js

- `GET /api/applications` - List applications```

- `POST /api/applications` - Create application

- `PUT /api/applications/:id` - Update application---



**Documents**:## ⚙️ Configuration

- `POST /api/documents/upload` - Upload document

- `GET /api/documents` - List documents### Environment Variables (.env)



**Dashboard**:```bash

- `GET /api/dashboard/stats` - Get statistics# ═══════════════════════════════════════════════════════════════

# APPLICATION CONFIGURATION

**DTAM Management**:# ═══════════════════════════════════════════════════════════════

- `GET /api/dtam/applications` - Review applications

- `PUT /api/dtam/applications/:id/review` - Review application# Server Configuration

PORT=3004

---NODE_ENV=production



## 🚢 Deployment# Database Configuration

MONGODB_URI=mongodb://localhost:27017/gacp_production

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.DB_NAME=gacp_production



### Quick Deploy with Docker# JWT Authentication

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

```bashJWT_EXPIRES_IN=7d

# 1. Configure environment

cp .env.example .env# DTAM JWT (separate system)

# Edit .env for productionDTAM_JWT_SECRET=your-dtam-jwt-secret-key-change-this

DTAM_JWT_EXPIRES_IN=24h

# 2. Build and start

docker-compose up -d# CORS Configuration

ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# 3. Check status

docker-compose ps# File Upload

docker-compose logs -fMAX_FILE_SIZE=10485760

```UPLOAD_PATH=./uploads



---# Logging

LOG_LEVEL=info

## 🔧 TroubleshootingLOG_FILE=./logs/app.log



### MongoDB Connection Failed# Email Configuration (optional)

SMTP_HOST=smtp.gmail.com

```bashSMTP_PORT=587

# Check MongoDB is runningSMTP_USER=your-email@gmail.com

mongod --versionSMTP_PASS=your-app-password



# Start MongoDB# Redis (optional - for caching)

sudo systemctl start mongodREDIS_HOST=localhost

REDIS_PORT=6379

# Or with Docker```

docker-compose up -d mongodb

```### Database Configuration



### Port Already in UseMongoDB will automatically create the database and collections on first run. The default database name is `gacp_production`.



```bash**Collections**:

# Windows: Find process using port 3004- `users` - Farmer accounts

netstat -ano | findstr :3004- `farmers` - Farmer profile data

taskkill /PID <PID> /F- `applications` - Certification applications

- `certificates` - Issued certificates

# Linux/Mac- `documents` - Uploaded documents

lsof -i :3004- `surveys` - Survey responses

kill -9 <PID>- `auditlogs` - System audit trail

````

---

### Application Won't Start

## 🎮 Running the Application

````bash

# Check Node version### Development Mode

node --version  # Should be >= 18

**Backend**:

# Reinstall dependencies```bash

rm -rf node_modules package-lock.json# Start backend server with auto-reload

npm installnpm run dev



# Check MongoDB connection# Or manually

# Verify MONGODB_URI in .envnode app.js

````

---**Frontend**:

````bash

## 📞 Supportcd frontend-nextjs

npm run dev

### Getting Help```



- **Documentation**: Check `DEPLOYMENT_GUIDE.md` and `USER_MANUAL.md`### Production Mode

- **Issues**: Report bugs via GitHub Issues

- **Email**: Contact development team**Using PM2** (Recommended):

```bash

### System Requirements# Start with PM2

pm2 start ecosystem.config.js

**Minimum**:

- Node.js 18+# View logs

- MongoDB 6+pm2 logs gacp-backend

- 2GB RAM

- 10GB disk space# Monitor

pm2 monit

**Recommended**:

- Node.js 24+# Stop

- MongoDB 6+pm2 stop gacp-backend

- 4GB RAM```

- 20GB disk space

- SSD storage**Using Docker**:

```bash

---# Start all services

docker-compose up -d

## 📄 License

# View logs

Proprietary software developed for the Department of Thai Traditional and Alternative Medicine (DTAM).docker-compose logs -f



---# Stop

docker-compose down

## 🎯 User Portals```



### 👨‍🌾 Farmer Portal (`/farmer`)---



- Submit certification applications## 📁 Project Structure

- Upload required documents

- Track application status```

- View certificatesgacp-certify-flow-main/

- Generate reports│

├── app.js                          # Main Express application

### 🏛️ DTAM Staff Portal (`/dtam`)├── ecosystem.config.js             # PM2 configuration

├── package.json                    # Backend dependencies

- Review applications├── .env.example                    # Environment template

- Conduct farm inspections├── docker-compose.yml              # Docker services

- Manage farmer accounts├── Dockerfile.backend              # Backend container

- Issue certificates│

- Generate system reports├── src/                            # Backend source code

│   ├── controllers/                # Request handlers

---│   │   ├── AuthController.js

│   │   ├── FarmerController.js

**Status**: ✅ **Production Ready**  │   │   └── ...

**Version**: 2.0.0  │   │

**Maintained by**: Development Team  │   ├── models/                     # MongoDB models

**Last Updated**: October 13, 2025│   │   ├── User.js

│   │   ├── Farmer.js
│   │   ├── Application.js
│   │   └── ...
│   │
│   ├── routes/                     # API routes
│   │   ├── auth.js
│   │   ├── farmers.js
│   │   └── ...
│   │
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── ...
│   │
│   └── utils/                      # Utility functions
│       ├── logger.js
│       ├── validation.js
│       └── ...
│
├── modules/                        # Clean architecture modules
│   ├── auth-dtam/                  # DTAM authentication
│   ├── document/                   # Document management
│   ├── dashboard/                  # Dashboard module
│   ├── report/                     # Report generation
│   └── shared/                     # Shared utilities
│
├── frontend-nextjs/                # Next.js frontend
│   ├── src/
│   │   ├── app/                    # App router pages
│   │   │   ├── farmer/             # Farmer portal
│   │   │   └── dtam/               # DTAM portal
│   │   │
│   │   ├── components/             # Shared components
│   │   ├── contexts/               # React contexts
│   │   └── utils/                  # Frontend utilities
│   │
│   ├── public/                     # Static assets
│   ├── package.json                # Frontend dependencies
│   └── next.config.js              # Next.js configuration
│
└── docs/                           # Documentation
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    └── USER_MANUAL.md
````

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Key Endpoints

**Authentication**:

- `POST /api/auth/register` - Register new farmer
- `POST /api/auth/login` - Farmer login
- `POST /api/auth/dtam/login` - DTAM staff login

**Applications**:

- `GET /api/applications` - List applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `GET /api/applications/:id` - Get application details

**Documents**:

- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `DELETE /api/documents/:id` - Delete document

**Dashboard**:

- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/farmer` - Farmer dashboard data

**DTAM Management**:

- `GET /api/dtam/applications` - Review applications
- `PUT /api/dtam/applications/:id/review` - Review application
- `POST /api/dtam/staff/create` - Create DTAM staff

---

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment

**Docker Deployment**:

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env for production

# 2. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose ps
docker-compose logs -f
```

**PM2 Deployment**:

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Start application
pm2 start ecosystem.config.js

# 3. Save PM2 process list
pm2 save

# 4. Setup PM2 startup script
pm2 startup
```

---

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**

```bash
# Check MongoDB is running
mongod --version

# Start MongoDB
sudo systemctl start mongod

# Or with Docker
docker-compose up -d mongodb
```

**2. Port Already in Use**

```bash
# Find process using port 3004
netstat -ano | findstr :3004

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>
```

**3. JWT Token Issues**

- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration time
- Verify CORS settings for frontend

**4. File Upload Errors**

- Check `UPLOAD_PATH` directory exists
- Verify file permissions
- Check `MAX_FILE_SIZE` setting

---

## 📞 Support

### Getting Help

- **Documentation**: Check this README and other docs
- **Issues**: Report bugs via GitHub Issues
- **Email**: Contact development team

### System Requirements

**Minimum**:

- Node.js 18+
- MongoDB 6+
- 2GB RAM
- 10GB disk space

**Recommended**:

- Node.js 24+
- MongoDB 6+
- 4GB RAM
- 20GB disk space
- SSD storage

---

## 📄 License

This project is proprietary software developed for GACP certification management.

---

## 👥 Credits

Developed for the Department of Thai Traditional and Alternative Medicine (DTAM)

---

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: October 13, 2025
