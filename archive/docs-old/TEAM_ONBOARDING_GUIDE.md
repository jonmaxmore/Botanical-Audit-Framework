# 📚 Team Onboarding Resources
## Botanical Audit Framework - Developer Guide

**Created:** November 3, 2025  
**For:** New team members joining the project

---

## 🎯 Project Overview

### **What We're Building:**
Cannabis farm management platform with:
- Digital traceability (Digital Signature + Audit Log)
- IoT Integration Platform (support multiple providers)
- GACP certification automation
- Real-time monitoring & analytics

### **Market Opportunity:**
- 300+ community enterprises (now) → 2,000+ (2030)
- 120+ hospitals needing traceable cannabis
- 6.75M บาท/year revenue per 300 plants
- Zero competitors with full compliance + IoT

### **Tech Stack:**
```
Frontend:  Next.js 14 + TypeScript + Tailwind CSS
Backend:   Node.js 20 + Express + TypeScript
Database:  MongoDB Atlas (M10)
Real-time: WebSocket + MQTT
Crypto:    RSA-2048 + SHA-256 + RFC 3161
Cloud:     AWS / Azure
CI/CD:     GitHub Actions
```

---

## 📖 Required Reading (First Week)

### **Day 1: Business Context**
1. [STRATEGIC_BUSINESS_TECHNOLOGY_ANALYSIS_2025-2035.md](./STRATEGIC_BUSINESS_TECHNOLOGY_ANALYSIS_2025-2035.md)
   - Read: Part 1 (Business Logic & Market)
   - Read: Part 2 (Technology Trends)
   - Understand: Why we don't use blockchain
   - Understand: 80/20 IoT strategy

2. [ARCHITECTURE_UPDATE_MONGODB_IOT_SUMMARY.md](./ARCHITECTURE_UPDATE_MONGODB_IOT_SUMMARY.md)
   - Why MongoDB (not PostgreSQL)
   - Why Integration Platform (not Manufacturer)

### **Day 2: Technical Architecture**
3. [DIGITAL_SIGNATURE_MONGODB_IOT_ARCHITECTURE.md](./DIGITAL_SIGNATURE_MONGODB_IOT_ARCHITECTURE.md)
   - MongoDB schema design (5 collections)
   - Digital Signature implementation
   - IoT Integration Platform architecture
   - Code examples (JavaScript/TypeScript)

### **Day 3: Cannabis Regulations**
4. GACP Guidelines (Good Agricultural and Collection Practices)
   - Download: https://www.fda.moph.go.th (search "กัญชา GACP")
   - Key requirements:
     * Traceability (ต้นทาง → ปลายทาง)
     * Record retention (7+ years)
     * Chain of custody
     * GPS tracking + CCTV

5. FDA 21 CFR Part 11 (Electronic Records)
   - Digital signatures requirements
   - Audit trail requirements

### **Day 4-5: Codebase Familiarization**
6. Clone repository:
```bash
git clone https://github.com/jonmaxmore/Botanical-Audit-Framework.git
cd Botanical-Audit-Framework
pnpm install
```

7. Run development server:
```bash
# Terminal 1: Backend
cd backend
pnpm dev

# Terminal 2: Frontend
cd frontend
pnpm dev

# Terminal 3: MongoDB (local)
docker-compose up -d mongodb
```

8. Explore codebase:
```
backend/
├── src/
│   ├── models/       # MongoDB models (Mongoose)
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   │   ├── crypto/   # Digital Signature service
│   │   ├── iot/      # IoT Integration service
│   │   └── audit/    # Audit log service
│   └── middleware/   # Auth, validation, error handling

frontend/
├── app/              # Next.js 14 app router
│   ├── (auth)/       # Login/Register pages
│   ├── dashboard/    # Main dashboard
│   ├── farms/        # Farm management
│   └── api/          # API routes (Next.js)
├── components/       # React components
└── lib/              # Utilities
```

---

## 🔧 Development Setup

### **Prerequisites:**
```bash
# Check versions
node -v    # v20.x required
pnpm -v    # v8.x required
docker -v  # v24.x required

# If not installed:
# Node.js: https://nodejs.org
# pnpm: npm install -g pnpm
# Docker: https://www.docker.com/get-started
```

### **MongoDB Setup:**

**Option 1: MongoDB Atlas (Recommended for dev)**
```bash
1. Go to https://cloud.mongodb.com
2. Create free M0 cluster (or M10 for production-like)
3. Setup IP whitelist: 0.0.0.0/0 (dev only!)
4. Create database user: botanical_dev / strong_password
5. Get connection string:
   mongodb+srv://botanical_dev:password@cluster0.xxxxx.mongodb.net/botanical_audit

6. Create .env file:
   MONGODB_URI=mongodb+srv://botanical_dev:password@cluster0.xxxxx.mongodb.net/botanical_audit
   JWT_SECRET=your-secret-key-here
   AWS_KMS_KEY_ID=arn:aws:kms:...  (optional for dev)
```

**Option 2: Docker (Local)**
```bash
docker-compose up -d mongodb
# MongoDB will be available at: mongodb://localhost:27017/botanical_audit
```

### **First Run:**
```bash
# 1. Install dependencies
pnpm install

# 2. Setup database (create indexes, seed data)
pnpm run db:setup

# 3. Run development servers
pnpm run dev

# 4. Open browser:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api-docs
```

---

## 📝 Coding Standards

### **TypeScript:**
```typescript
// ✅ DO: Use TypeScript for type safety
interface Farm {
  id: string;
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  owner: string;
  createdAt: Date;
}

// ✅ DO: Use async/await (not callbacks)
const farm = await Farm.findById(farmId);

// ❌ DON'T: Use 'any' type
const data: any = await fetchData(); // Bad!
const data: Farm = await fetchData(); // Good!
```

### **Naming Conventions:**
```typescript
// Files: kebab-case
farm-service.ts
digital-signature-service.ts

// Classes: PascalCase
class FarmService {}
class DigitalSignatureService {}

// Functions/Variables: camelCase
const getFarmById = async (id: string) => {};
const farmData = await getFarmById('123');

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SIGNATURE_ALGORITHM = 'RSA-SHA256';

// MongoDB Collections: snake_case (lowercase)
db.collection('records')
db.collection('audit_log')
db.collection('iot_readings')
```

### **Git Commit Messages:**
```bash
# Format: <type>(<scope>): <subject>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation
refactor: Code refactoring
test:     Adding tests
chore:    Build/tooling changes

# Examples:
git commit -m "feat(farm): add farm registration API"
git commit -m "fix(iot): handle MQTT connection errors"
git commit -m "docs(readme): update setup instructions"
git commit -m "refactor(crypto): extract signature service"
```

### **API Design:**
```typescript
// ✅ DO: RESTful conventions
GET    /api/farms           // List farms
GET    /api/farms/:id       // Get farm
POST   /api/farms           // Create farm
PUT    /api/farms/:id       // Update farm
DELETE /api/farms/:id       // Delete farm

// ✅ DO: Use proper HTTP status codes
200 OK              // Success
201 Created         // Resource created
400 Bad Request     // Validation error
401 Unauthorized    // Not authenticated
403 Forbidden       // Not authorized
404 Not Found       // Resource not found
500 Internal Error  // Server error

// ✅ DO: Consistent response format
{
  "success": true,
  "data": { ... },
  "message": "Farm created successfully"
}

{
  "success": false,
  "error": "Validation error",
  "details": [
    { "field": "name", "message": "Name is required" }
  ]
}
```

---

## 🧪 Testing

### **Unit Tests:**
```typescript
// Use Jest + Supertest
describe('FarmService', () => {
  describe('createFarm', () => {
    it('should create farm with valid data', async () => {
      const farmData = {
        name: 'Test Farm',
        location: { type: 'Point', coordinates: [100.5, 13.7] }
      };
      
      const farm = await farmService.createFarm(farmData);
      
      expect(farm).toBeDefined();
      expect(farm.name).toBe('Test Farm');
    });
    
    it('should throw error if name is missing', async () => {
      const farmData = { location: { ... } };
      
      await expect(farmService.createFarm(farmData))
        .rejects.toThrow('Name is required');
    });
  });
});

// Run tests:
pnpm test                    // All tests
pnpm test farm-service      // Specific test
pnpm test:coverage          // Coverage report
```

### **Integration Tests:**
```typescript
// Test API endpoints
describe('POST /api/farms', () => {
  it('should create farm and return 201', async () => {
    const response = await request(app)
      .post('/api/farms')
      .send({
        name: 'Test Farm',
        location: { type: 'Point', coordinates: [100.5, 13.7] }
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Farm');
  });
});
```

---

## 📊 Performance Requirements

### **API Response Time:**
```
- Simple queries (GET /api/farms/:id): < 100ms
- List queries (GET /api/farms): < 300ms
- Complex queries (analytics): < 1s
- Real-time updates (WebSocket): < 50ms
```

### **Database Queries:**
```typescript
// ✅ DO: Use indexes
db.records.createIndex({ farmId: 1, createdAt: -1 });

// ✅ DO: Use lean() for read-only queries
const farms = await Farm.find({}).lean();

// ✅ DO: Paginate large results
const farms = await Farm.find({})
  .skip(page * limit)
  .limit(limit);

// ❌ DON'T: Query all records without limit
const farms = await Farm.find({}); // Bad if 100K+ records!
```

---

## 🔒 Security Best Practices

### **Authentication:**
```typescript
// ✅ DO: Use JWT with expiration
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// ✅ DO: Hash passwords (bcrypt)
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ DO: Validate user input
const schema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email()
});
```

### **Digital Signature:**
```typescript
// ✅ DO: Use AWS KMS for production
const signature = await kms.sign({
  KeyId: process.env.AWS_KMS_KEY_ID,
  Message: Buffer.from(hash),
  MessageType: 'DIGEST',
  SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256'
});

// ⚠️ OK for development: Local keys
const signature = crypto.sign('RSA-SHA256', hash, privateKey);
```

---

## 📞 Communication

### **Daily Standup (9:30 AM):**
```
1. What did I do yesterday?
2. What will I do today?
3. Any blockers?

Duration: 15 minutes max
```

### **Weekly Sprint Planning (Monday 10:00 AM):**
```
1. Review last sprint
2. Plan this sprint (2 weeks)
3. Assign tasks
4. Estimate story points
```

### **Code Review:**
```
- All PRs require 1 approval (Tech Lead)
- Review within 24 hours
- Be respectful, constructive feedback
```

### **Tools:**
```
Slack/Discord: Daily communication
Jira/Linear: Task tracking
GitHub: Code + PR
Notion: Documentation
Figma: Design collaboration
```

---

## 🆘 Getting Help

### **Questions About:**
- **Architecture:** Ask Tech Lead
- **Design:** Ask UI/UX Designer
- **Business Logic:** Ask Product Owner
- **GACP/FDA:** Check documentation or ask Product Owner

### **Resources:**
- MongoDB Docs: https://www.mongodb.com/docs
- Next.js Docs: https://nextjs.org/docs
- MQTT Docs: https://mqtt.org/
- Our Wiki: (link to internal docs)

---

## ✅ First Sprint Goals (Week 1-2)

### **Tech Lead:**
```
□ Setup MongoDB Atlas (M10 cluster)
□ Implement Farm model + API (5 endpoints)
□ Implement Digital Signature service
□ Setup JWT authentication
□ Write API tests (80%+ coverage)
```

### **Frontend Developer:**
```
□ Setup Next.js project structure
□ Implement login/register pages
□ Implement farm list page
□ Implement farm details page
□ Implement create farm form
```

### **UI/UX Designer:**
```
□ User research (interview 3-5 farmers)
□ Create wireframes (10 pages)
□ Create design system (colors, typography, components)
□ Design dashboard mockups
```

---

## 🎉 Welcome to the Team!

We're building something that will help 2,000+ community enterprises and 40,000+ patients. This is a high-impact project with a clear path to profitability and scale.

**Let's build something amazing together! 🚀**

---

**Questions?** Ask on #general channel or DM @tech-lead
