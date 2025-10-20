# 📦 Track & Trace Module

Product tracking, QR code generation, and supply chain visibility system for GACP certification.

## 🎯 Overview

The Track & Trace module provides comprehensive product tracking throughout the supply chain, from planting to distribution. It includes QR code generation for product verification, timeline tracking, and certification management.

## 🗂️ Module Structure

```
track-trace/
├── controllers/           # HTTP request handlers
├── routes/               # API endpoint definitions
├── services/             # Business logic layer
├── models/               # MongoDB schemas
├── validators/           # Input validation (pending)
├── tests/                # Unit and integration tests (pending)
├── index.js              # Module entry point
└── README.md             # This file
```

## 🚀 Features

### 1. **Product Batch Management**

- Create product batches with auto-generated batch codes
- Track quantity, variety, and origin information
- Update product details throughout lifecycle
- Delete pending products

### 2. **Supply Chain Tracking**

- **7-stage progression**: PLANTING → GROWING → HARVESTING → PROCESSING → PACKAGING → DISTRIBUTION → COMPLETED
- Real-time stage updates
- Timeline event logging
- Location and verifier tracking

### 3. **QR Code Generation**

- Automatic QR code generation for each batch
- Base64 PNG format (300x300px)
- High error correction level
- Public verification URLs

### 4. **Certification Management**

- Track certification status (PENDING, IN_REVIEW, CERTIFIED, REJECTED, EXPIRED)
- Admin-controlled certification updates
- Expiry date tracking
- Auto-expiry detection

### 5. **Timeline & Audit Trail**

- Complete history of product journey
- Stage transitions with timestamps
- Verified by user attribution
- Location tracking

### 6. **Analytics & Statistics**

- User product statistics
- Stage distribution analysis
- Certification status breakdown
- Progress tracking

## 📡 API Endpoints

### Public Endpoints (No Authentication)

```http
GET    /api/track-trace/lookup/:batchCode     # Lookup product (for QR scanning)
GET    /api/track-trace/health                # Health check
```

### Private Endpoints (Farmer Authentication Required)

```http
GET    /api/track-trace/products              # Get user's products
POST   /api/track-trace/products              # Create product batch
GET    /api/track-trace/products/:id          # Get product details
PUT    /api/track-trace/products/:id          # Update product
DELETE /api/track-trace/products/:id          # Delete product (pending only)
PUT    /api/track-trace/products/:id/stage    # Update stage
GET    /api/track-trace/products/:id/qrcode   # Get/generate QR code
POST   /api/track-trace/products/:id/timeline # Add timeline event
GET    /api/track-trace/statistics            # Get user statistics
```

### Admin Endpoints

```http
PUT    /api/track-trace/products/:id/certification  # Update certification
```

**Total Endpoints**: 12 (2 public + 9 private + 1 admin)

## 💻 Usage Examples

### 1. Create Product Batch

```javascript
POST /api/track-trace/products
Authorization: Bearer <token>

{
  "productName": "Organic Rice",
  "variety": "Jasmine Rice",
  "quantity": 1000,
  "unit": "kg",
  "farmId": "farm123"
}

Response:
{
  "success": true,
  "message": "Product batch created",
  "data": {
    "batchCode": "OR2025-001",
    "productName": "Organic Rice",
    "quantity": 1000,
    "unit": "kg",
    "stage": "PLANTING",
    "certificationStatus": "PENDING",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "_id": "67..."
  }
}
```

### 2. Update Product Stage

```javascript
PUT /api/track-trace/products/67.../stage
Authorization: Bearer <token>

{
  "stage": "HARVESTING",
  "description": "Rice harvested at optimal maturity",
  "location": "Farm Field A1"
}

Response:
{
  "success": true,
  "message": "Product stage updated"
}
```

### 3. Lookup Product (Public - QR Scan)

```javascript
GET /api/track-trace/lookup/OR2025-001

Response:
{
  "success": true,
  "message": "Product found",
  "data": {
    "batchCode": "OR2025-001",
    "productName": "Organic Rice",
    "variety": "Jasmine Rice",
    "quantity": 1000,
    "unit": "kg",
    "stage": "HARVESTING",
    "certificationStatus": "CERTIFIED",
    "timeline": [
      {
        "stage": "PLANTING",
        "description": "Product batch created",
        "location": "Farm",
        "verifiedBy": "user123",
        "metadata": {
          "createdAt": "2025-01-15T08:00:00Z"
        }
      },
      {
        "stage": "HARVESTING",
        "description": "Rice harvested at optimal maturity",
        "location": "Farm Field A1",
        "verifiedBy": "user123",
        "metadata": {
          "createdAt": "2025-04-15T10:00:00Z"
        }
      }
    ],
    "qrData": {
      "url": "https://gacp-platform.com/verify/OR2025-001",
      "qrCode": "data:image/png;base64,..."
    }
  }
}
```

### 4. Get User Statistics

```javascript
GET /api/track-trace/statistics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalProducts": 15,
    "certified": 8,
    "pending": 5,
    "inProgress": 7,
    "byStage": {
      "PLANTING": 2,
      "GROWING": 3,
      "HARVESTING": 2,
      "PROCESSING": 4,
      "DISTRIBUTION": 3,
      "COMPLETED": 1
    }
  }
}
```

### 5. Generate/Get QR Code

```javascript
GET /api/track-trace/products/67.../qrcode
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "batchCode": "OR2025-001",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

### 6. Update Certification (Admin)

```javascript
PUT /api/track-trace/products/67.../certification
Authorization: Bearer <admin_token>

{
  "status": "CERTIFIED",
  "certificationNumber": "GACP-TH-2025-001",
  "issuedDate": "2025-04-25",
  "expiryDate": "2026-04-25",
  "authority": "GACP Thailand Authority"
}

Response:
{
  "success": true,
  "message": "Certification updated"
}
```

## 🔧 Integration

### Initialize Module

```javascript
const { initializeTrackTrace } = require('./modules/track-trace');

// Initialize with dependencies
const { router, service } = await initializeTrackTrace({
  db: mongoDbInstance,
  authenticateToken: authMiddleware,
});

// Mount in Express app
app.use('/api/track-trace', router);
```

### Use Service Directly

```javascript
const TrackTraceService = require('./modules/track-trace/services/track-trace.service');

const trackTraceService = new TrackTraceService(db);

// Create product
const result = await trackTraceService.createProductBatch({
  userId: 'user123',
  productName: 'Organic Rice',
  quantity: 1000,
  unit: 'kg',
});

// Generate QR code
const qrCode = await trackTraceService.generateQRCode('OR2025-001');
```

## 🗃️ Data Models

### Product Schema

```javascript
{
  userId: String,              // Owner
  farmId: String,              // Associated farm
  batchCode: String,           // Unique batch code
  productName: String,         // Product name
  variety: String,             // Product variety
  quantity: Number,            // Amount
  unit: String,                // kg, ton, gram, piece, liter
  stage: String,               // Current stage (7 stages)
  certificationStatus: String, // PENDING, CERTIFIED, etc.

  certification: {
    status: String,
    number: String,
    issuedDate: Date,
    expiryDate: Date,
    authority: String
  },

  origin: {
    farm: String,
    farmer: String,
    location: String,
    coordinates: { lat, lng }
  },

  grade: String,               // Quality grade
  description: String,

  metadata: {
    createdAt: Date,
    lastUpdated: Date,
    createdBy: String,
    updatedBy: String
  }
}
```

### Timeline Event Schema

```javascript
{
  productId: String,           // Reference to product
  stage: String,               // Stage name
  description: String,         // Event description
  location: String,            // Event location
  verifiedBy: String,          // User who verified
  metadata: {
    createdAt: Date
  }
}
```

### QR Code Schema

```javascript
{
  batchCode: String,           // Batch code
  url: String,                 // Verification URL
  qrCode: String,              // Base64 PNG image
  generatedAt: Date
}
```

## 📊 Supply Chain Stages

| Stage        | Description            | Order |
| ------------ | ---------------------- | ----- |
| PLANTING     | Seed/plant cultivation | 1     |
| GROWING      | Growth phase           | 2     |
| HARVESTING   | Harvest time           | 3     |
| PROCESSING   | Product processing     | 4     |
| PACKAGING    | Product packaging      | 5     |
| DISTRIBUTION | Ready for distribution | 6     |
| COMPLETED    | Journey completed      | 7     |

**Progress Calculation**: `(currentStage / 7) * 100%`

## 🔐 Security

- All endpoints require authentication except public lookup and health
- Users can only access their own products
- Admin role required for certification updates
- Only pending products can be deleted
- QR codes are publicly accessible for verification

## 📦 Batch Code Format

**Format**: `{PREFIX}{YEAR}-{SEQUENCE}`

**Examples**:

- `OR2025-001` - Organic Rice, year 2025, sequence 001
- `TM2025-042` - Turmeric, year 2025, sequence 042
- `GB2025-123` - Ginger, year 2025, sequence 123

**Prefix**: First 2 letters of product name (uppercase)
**Sequence**: 3-digit zero-padded counter per user

## 🎨 QR Code Specifications

- **Format**: PNG (Base64 encoded)
- **Size**: 300x300 pixels
- **Error Correction**: High (Level H)
- **Quality**: 0.92
- **Margin**: 1 unit
- **Content**: Verification URL (https://gacp-platform.com/verify/{batchCode})

## 📈 Statistics & Analytics

### User Statistics

- Total products count
- Certified products count
- Pending certification count
- In-progress products (stages 1-4)
- Products by stage distribution

### Timeline Analytics

- Complete product journey
- Stage progression history
- Verification audit trail
- Location tracking

## 🔄 Migration Notes

**Migrated from:**

- `routes/api/track-trace.js` (374 lines)
- Mock data converted to MongoDB collections

**Improvements:**

- ✅ Modular DDD architecture
- ✅ Real QR code generation (vs mock URLs)
- ✅ MongoDB integration
- ✅ Timeline event tracking
- ✅ Certification management
- ✅ User statistics
- ✅ Auto-expiry detection
- ✅ Progress calculation

## 📝 Testing

```bash
# Run unit tests (pending)
npm test modules/track-trace/tests

# Run integration tests (pending)
npm test modules/track-trace/tests/integration
```

## 🤝 Dependencies

- `express` - Web framework
- `mongodb` - Database driver
- `qrcode` - QR code generation library
- `mongoose` - MongoDB ODM (optional)
- `../shared/utils/logger` - Logging utility
- `../shared/utils/response` - Response formatting
- `../shared/utils/errors` - Error handling

## 📌 TODO

- [ ] Add validators for input validation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add bulk import/export
- [ ] Add PDF report generation
- [ ] Add email notifications on stage change
- [ ] Add SMS alerts for certification status
- [ ] Add product images/photos
- [ ] Add blockchain integration for immutability
- [ ] Add multi-language support

## 👨‍💻 Module Info

- **Version**: 1.0.0
- **Author**: GACP Platform Team
- **Created**: Phase 6 - Feature Modules
- **Status**: ✅ Complete
- **Lines of Code**: ~1,206 lines (5 files)

---

**End of Track & Trace Documentation**
