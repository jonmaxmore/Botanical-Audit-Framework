# Dashboard Module

Module สำหรับจัดการ Dashboard แบบ role-based พร้อมข้อมูลสถิติและการวิเคราะห์แบบ real-time

## Overview

Dashboard Module ให้บริการข้อมูล dashboard ที่ปรับให้เหมาะกับแต่ละบทบาทผู้ใช้ (farmer, DTAM staff, admin) พร้อมทั้งสถิติ, กิจกรรมล่าสุด, การแจ้งเตือน และข้อมูลสุขภาพของระบบ

## Features

### 1. Role-Based Dashboards

- Dashboard เฉพาะสำหรับเกษตรกร
- Dashboard สำหรับเจ้าหน้าที่ DTAM (Reviewer, Auditor)
- Dashboard สำหรับผู้ดูแลระบบ (Admin)

### 2. Real-Time Statistics

- สถิติแบบเรียลไทม์
- การอัปเดตข้อมูลอัตโนมัติ
- System health monitoring

### 3. Recent Activities

- ติดตามกิจกรรมล่าสุด
- Activity timeline
- User action logging

### 4. Notifications

- การแจ้งเตือนตามบทบาท
- แจ้งเตือนสถานะคำขอ
- System announcements

### 5. Application Management

- รายการคำขอรอตรวจสอบ
- สถิติการอนุมัติ
- ข้อมูลการประมวลผล

### 6. Farm & Product Tracking

- สถิติฟาร์ม
- ติดตามผลิตภัณฑ์
- สถานะการรับรอง

## API Endpoints

### Public Endpoints

#### 1. System Health Check

```http
GET /api/dashboard/health
```

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "connected": true,
    "collections": 12,
    "dataSize": 1048576,
    "storageSize": 2097152
  },
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

### Private Endpoints (Require Authentication)

#### 2. Get Dashboard by Role

```http
GET /api/dashboard/:role
Authorization: Bearer <token>
```

**Parameters:**

- `role` - User role (farmer, reviewer, auditor, admin)

**Response (Farmer):**

```json
{
  "success": true,
  "role": "farmer",
  "stats": {
    "totalApplications": 3,
    "pendingApplications": 1,
    "approvedApplications": 2,
    "rejectedApplications": 0,
    "todayApplications": 0,
    "totalFarms": 1,
    "totalProducts": 5,
    "certifiedProducts": 2,
    "averageProcessingTime": 15,
    "certificationRate": 40
  },
  "recentActivities": [
    {
      "id": "act1",
      "userId": "user123",
      "action": "ส่งคำขอรับรอง",
      "description": "ส่งคำขอรับรอง GACP-2025-003",
      "type": "application",
      "timestamp": "2025-10-12T08:30:00.000Z"
    }
  ],
  "applications": [
    {
      "id": "app1",
      "applicationNumber": "GACP-2025-003",
      "farmName": "ฟาร์มกัญชาอินทรีย์",
      "status": "pending",
      "submittedAt": "2025-10-10T10:00:00.000Z",
      "type": "กัญชาทางการแพทย์"
    }
  ],
  "farms": [
    {
      "id": "farm1",
      "farmName": "ฟาร์มกัญชาอินทรีย์",
      "location": {
        "province": "เชียงใหม่",
        "district": "แม่ริม"
      },
      "size": 50,
      "cropType": "กัญชา",
      "status": "active"
    }
  ],
  "products": [
    {
      "id": "prod1",
      "batchCode": "CM2025-001",
      "productName": "กัญชาทางการแพทย์",
      "stage": "PROCESSING",
      "certificationStatus": "CERTIFIED",
      "quantity": 100,
      "unit": "kg"
    }
  ],
  "notifications": [
    {
      "id": "n1",
      "title": "อัปเดตสถานะคำขอ",
      "message": "คำขอของคุณอยู่ในระหว่างการตรวจสอบ",
      "type": "info",
      "read": false,
      "timestamp": "2025-10-12T09:00:00.000Z"
    }
  ],
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

**Response (DTAM Staff - Reviewer/Auditor):**

```json
{
  "success": true,
  "role": "reviewer",
  "stats": {
    "totalApplications": 128,
    "pendingReviews": 15,
    "approvedApplications": 98,
    "rejectedApplications": 15,
    "todayApplications": 7,
    "weekApplications": 23,
    "activeUsers": 45,
    "averageProcessingTime": 14,
    "approvalRate": 76
  },
  "recentActivities": [
    {
      "id": "act2",
      "userId": "reviewer1",
      "action": "ตรวจสอบเอกสาร",
      "description": "ตรวจสอบคำขอ GACP-2025-005",
      "type": "review",
      "timestamp": "2025-10-12T09:30:00.000Z"
    }
  ],
  "pendingApplications": [
    {
      "id": "app2",
      "applicationNumber": "GACP-2025-005",
      "farmerName": "นายสมชาย ใจดี",
      "farmName": "ฟาร์มสมุนไพรธรรมชาติ",
      "status": "pending",
      "submittedAt": "2025-10-11T14:00:00.000Z",
      "type": "สมุนไพร"
    }
  ],
  "notifications": [
    {
      "id": "n2",
      "title": "คำขอรอการตรวจสอบ",
      "message": "มีคำขอรับรอง 15 รายการรอการตรวจสอบ",
      "type": "warning",
      "read": false,
      "timestamp": "2025-10-12T10:00:00.000Z"
    }
  ],
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

**Response (Admin):**

```json
{
  "success": true,
  "role": "admin",
  "stats": {
    "totalApplications": 128,
    "totalUsers": 67,
    "totalFarms": 45,
    "totalProducts": 234,
    "todayApplications": 7,
    "monthApplications": 89,
    "pendingReviews": 15,
    "activeInspections": 5,
    "statusBreakdown": {
      "pending": 15,
      "under_review": 8,
      "approved": 98,
      "rejected": 7
    },
    "userRoleBreakdown": {
      "farmer": 45,
      "reviewer": 10,
      "auditor": 8,
      "admin": 4
    }
  },
  "systemHealth": {
    "status": "healthy",
    "database": {
      "connected": true,
      "collections": 12,
      "dataSize": 1048576,
      "storageSize": 2097152
    },
    "timestamp": "2025-10-12T10:00:00.000Z"
  },
  "recentActivities": [...],
  "notifications": [...],
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

#### 3. Get Farmer Dashboard

```http
GET /api/dashboard/farmer/:userId
Authorization: Bearer <token>
```

**Parameters:**

- `userId` - Farmer user ID

**Access Control:**

- Farmer can view their own dashboard
- Admin can view any farmer's dashboard

#### 4. Get Reviewer Dashboard

```http
GET /api/dashboard/reviewer
Authorization: Bearer <token>
```

**Access:** DTAM Staff (Reviewer role)

#### 5. Get Auditor Dashboard

```http
GET /api/dashboard/auditor
Authorization: Bearer <token>
```

**Access:** DTAM Staff (Auditor role)

#### 6. Get Admin Dashboard

```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

**Access:** Admin only

#### 7. Get Realtime Statistics

```http
GET /api/dashboard/stats/realtime
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "totalApplications": 128,
  "pendingReviews": 15,
  "activeInspections": 5,
  "recentLogins": 12,
  "systemHealth": "healthy",
  "timestamp": "2025-10-12T10:00:00.000Z"
}
```

#### 8. Get Farmer Statistics

```http
GET /api/dashboard/stats/farmer/:userId
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "userId": "user123",
  "stats": {
    "totalApplications": 3,
    "pendingApplications": 1,
    "approvedApplications": 2,
    "rejectedApplications": 0,
    "todayApplications": 0,
    "totalFarms": 1,
    "totalProducts": 5,
    "certifiedProducts": 2,
    "averageProcessingTime": 15,
    "certificationRate": 40
  }
}
```

#### 9. Get DTAM Statistics

```http
GET /api/dashboard/stats/dtam
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "role": "reviewer",
  "stats": {
    "totalApplications": 128,
    "pendingReviews": 15,
    "approvedApplications": 98,
    "rejectedApplications": 15,
    "todayApplications": 7,
    "weekApplications": 23,
    "activeUsers": 45,
    "averageProcessingTime": 14,
    "approvalRate": 76
  }
}
```

#### 10. Get Admin Statistics

```http
GET /api/dashboard/stats/admin
Authorization: Bearer <token>
```

**Access:** Admin only

#### 11. Get Recent Activities

```http
GET /api/dashboard/activities?limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional) - Number of activities to return (default: 10)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "activities": [
    {
      "id": "act1",
      "userId": "user123",
      "action": "ส่งคำขอรับรอง",
      "description": "ส่งคำขอรับรอง GACP-2025-003",
      "type": "application",
      "timestamp": "2025-10-12T09:00:00.000Z"
    }
  ]
}
```

#### 12. Get Pending Applications

```http
GET /api/dashboard/applications/pending?limit=10
Authorization: Bearer <token>
```

**Access:** DTAM Staff

**Response:**

```json
{
  "success": true,
  "count": 15,
  "applications": [
    {
      "id": "app1",
      "applicationNumber": "GACP-2025-005",
      "farmerName": "นายสมชาย ใจดี",
      "farmName": "ฟาร์มสมุนไพร",
      "status": "pending",
      "submittedAt": "2025-10-11T14:00:00.000Z",
      "type": "สมุนไพร"
    }
  ]
}
```

#### 13. Get Notifications

```http
GET /api/dashboard/notifications?limit=5
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "notifications": [
    {
      "id": "n1",
      "title": "อัปเดตสถานะคำขอ",
      "message": "คำขอของคุณอยู่ในระหว่างการตรวจสอบ",
      "type": "info",
      "read": false,
      "timestamp": "2025-10-12T09:00:00.000Z"
    }
  ]
}
```

## Data Structure

### Statistics (Farmer)

```javascript
{
  totalApplications: Number,      // Total applications submitted
  pendingApplications: Number,    // Pending review
  approvedApplications: Number,   // Approved
  rejectedApplications: Number,   // Rejected
  todayApplications: Number,      // Submitted today
  totalFarms: Number,             // Total farms owned
  totalProducts: Number,          // Total products tracked
  certifiedProducts: Number,      // Certified products
  averageProcessingTime: Number,  // Days (average)
  certificationRate: Number       // Percentage
}
```

### Statistics (DTAM Staff)

```javascript
{
  totalApplications: Number,      // Total in system
  pendingReviews: Number,         // Waiting for review
  approvedApplications: Number,   // Approved total
  rejectedApplications: Number,   // Rejected total
  todayApplications: Number,      // New today
  weekApplications: Number,       // New this week
  activeUsers: Number,            // Active farmers
  averageProcessingTime: Number,  // Days (average)
  approvalRate: Number            // Percentage
}
```

### Statistics (Admin)

```javascript
{
  totalApplications: Number,
  totalUsers: Number,
  totalFarms: Number,
  totalProducts: Number,
  todayApplications: Number,
  monthApplications: Number,
  pendingReviews: Number,
  activeInspections: Number,
  statusBreakdown: {              // Applications by status
    pending: Number,
    under_review: Number,
    approved: Number,
    rejected: Number
  },
  userRoleBreakdown: {            // Users by role
    farmer: Number,
    reviewer: Number,
    auditor: Number,
    admin: Number
  }
}
```

### Activity

```javascript
{
  id: String,
  userId: String,
  action: String,                 // Action taken
  description: String,            // Detail description
  type: String,                   // 'application', 'review', 'approval', 'document'
  timestamp: Date
}
```

### Notification

```javascript
{
  id: String,
  title: String,
  message: String,
  type: String,                   // 'info', 'success', 'warning', 'error'
  read: Boolean,
  timestamp: Date
}
```

## Usage Examples

### Initialize Module

```javascript
const { initializeDashboard } = require('./modules/dashboard');

// In app.js
const dashboard = await initializeDashboard(db, authMiddleware);
app.use('/api/dashboard', dashboard.router);
```

### Get Farmer Dashboard

```javascript
const axios = require('axios');

const response = await axios.get('http://localhost:3004/api/dashboard/farmer/user123', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log('Applications:', response.data.applications);
console.log('Stats:', response.data.stats);
console.log('Products:', response.data.products);
```

### Get DTAM Dashboard

```javascript
const response = await axios.get('http://localhost:3004/api/dashboard/reviewer', {
  headers: {
    Authorization: `Bearer ${dtamToken}`,
  },
});

console.log('Pending Reviews:', response.data.stats.pendingReviews);
console.log('Pending Applications:', response.data.pendingApplications);
```

### Get Realtime Stats

```javascript
const response = await axios.get('http://localhost:3004/api/dashboard/stats/realtime', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log('System Health:', response.data.systemHealth);
console.log('Total Applications:', response.data.totalApplications);
console.log('Recent Logins:', response.data.recentLogins);
```

## Role-Based Access Control

### Farmer

- ✅ View own dashboard
- ✅ View own statistics
- ✅ View own activities
- ✅ View own notifications
- ❌ View other users' data
- ❌ View system-wide statistics

### DTAM Staff (Reviewer/Auditor)

- ✅ View role-specific dashboard
- ✅ View pending applications
- ✅ View system statistics
- ✅ View all activities (within role)
- ❌ View admin dashboard

### Admin

- ✅ View all dashboards
- ✅ View all statistics
- ✅ View system health
- ✅ View all users' data
- ✅ View system-wide analytics

## Business Logic

### Statistics Calculation

**Average Processing Time:**

```javascript
completedApplications.forEach(app => {
  days = (app.completedAt - app.createdAt) / (1000 * 60 * 60 * 24);
  totalDays += days;
});
averageProcessingTime = Math.round(totalDays / count);
```

**Certification Rate:**

```javascript
certificationRate = (certifiedProducts / totalProducts) * 100;
```

**Approval Rate:**

```javascript
approvalRate = (approvedApplications / totalApplications) * 100;
```

### Time Ranges

- **Today:** From 00:00:00 today
- **This Week:** Last 7 days
- **This Month:** From day 1 of current month
- **Recent:** Last 5 minutes (for realtime stats)

## Integration

### With Application Workflow

```javascript
// Get pending applications for reviewer
const dashboard = await dashboardService.getDTAMDashboard(userId, 'reviewer');
const pendingApps = dashboard.pendingApplications;
```

### With Farm Management

```javascript
// Get farmer's farms for dashboard
const dashboard = await dashboardService.getFarmerDashboard(userId);
const farms = dashboard.farms;
const stats = dashboard.stats;
```

### With Track & Trace

```javascript
// Get products for farmer dashboard
const dashboard = await dashboardService.getFarmerDashboard(userId);
const products = dashboard.products;
const certifiedCount = dashboard.stats.certifiedProducts;
```

## Performance Optimization

### Database Indexes

```javascript
// Applications
{ userId: 1, status: 1 }
{ createdAt: -1 }

// Farms
{ userId: 1 }

// Products
{ userId: 1, stage: 1 }

// Activities
{ userId: 1, timestamp: -1 }

// Users
{ lastLoginAt: 1 }
```

### Caching Strategy

- Cache statistics for 5 minutes
- Cache dashboard data for 1 minute
- Real-time stats have no cache

### Parallel Queries

```javascript
const [stats, activities, applications, farms] = await Promise.all([
  getFarmerStats(userId),
  getRecentActivities(userId),
  getFarmerApplications(userId),
  getFarmerFarms(userId),
]);
```

## Error Handling

### Common Errors

```javascript
// Service not initialized
{
  "success": false,
  "message": "Dashboard service is not initialized yet"
}

// Unauthorized access
{
  "success": false,
  "message": "Access denied"
}

// User not found
{
  "success": false,
  "message": "User ID not found in request"
}

// Admin access required
{
  "success": false,
  "message": "Admin access required"
}
```

## Testing

### Unit Tests (Planned)

```bash
npm test -- dashboard
```

Test coverage:

- Service initialization
- Statistics calculation
- Role-based access
- Dashboard data aggregation
- Real-time updates
- Notification generation

## Migration Notes

### Source Files

Original implementation:

- `routes/dashboard.js` - Original dashboard routes (336 lines)
- Mock data for development

### Changes Made

1. **Architecture**: Moved to modular DDD structure
2. **Service Layer**: Created comprehensive DashboardService
3. **Real Data**: Replaced mock data with MongoDB queries
4. **Statistics**: Added real-time calculation from database
5. **Role Support**: Enhanced role-based dashboards
6. **Aggregation**: Added Promise.all for parallel queries
7. **Performance**: Added indexes and caching strategy

### Breaking Changes

None - API endpoints remain compatible

## Future Enhancements

1. **Real-Time Updates**
   - WebSocket integration
   - Push notifications
   - Live data updates

2. **Advanced Analytics**
   - Charts and graphs
   - Trend analysis
   - Predictive analytics

3. **Customization**
   - User preferences
   - Widget configuration
   - Custom dashboards

4. **Export Features**
   - PDF reports
   - CSV exports
   - Scheduled reports

5. **Notifications**
   - Email notifications
   - LINE notifications
   - SMS alerts

## Dependencies

- express - Web framework
- mongodb - Database (native driver)

## License

Internal use only - Part of GACP Certify Flow platform

---

**Module Version:** 1.0.0  
**Last Updated:** October 2025  
**Maintainer:** GACP Platform Team
