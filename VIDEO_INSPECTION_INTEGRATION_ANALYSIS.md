# Video Inspection System - Integration Analysis

## 🔗 ผู้ที่เกี่ยวข้องและการเชื่อมโยง

### 1. 👨‍🌾 **FARMER (เกษตรกร)**

#### สิ่งที่ต้องเพิ่ม:

- ✅ **Video Call Component** - เข้าร่วม video call กับ inspector
- ✅ **Schedule Confirmation** - ยืนยัน/ปฏิเสธการนัดหมาย
- ✅ **Notification Panel** - รับแจ้งเตือนการนัดหมาย
- ✅ **Inspection Status** - ดูสถานะการตรวจสอบ

#### Components ที่ต้องสร้าง:

```
apps/farmer-portal/
├── components/
│   ├── inspection/
│   │   ├── FarmerVideoCallRoom.tsx       # Video call UI for farmer
│   │   ├── ScheduleConfirmation.tsx      # Confirm/reject schedule
│   │   └── InspectionStatus.tsx          # View inspection status
│   └── notifications/
│       └── InspectionNotifications.tsx   # Inspection notifications
```

#### API Endpoints ที่ใช้:

- `POST /api/video/inspections/:id/video-token` - Get video token
- `GET /api/inspections/:id/schedule` - View schedule
- `PUT /api/inspections/:id/schedule/confirm` - Confirm schedule
- `GET /api/inspections/:id/status` - Check status

---

### 2. 📋 **REVIEWER (ผู้ตรวจสอบเอกสาร)**

#### สิ่งที่ต้องเพิ่ม:

- ✅ **Assign Inspector** - มอบหมายงานให้ inspector
- ✅ **View Inspection Reports** - ดูรายงานการตรวจสอบ
- ✅ **Track Progress** - ติดตามความคืบหน้า

#### Components ที่ต้องสร้าง:

```
apps/admin-portal/
├── components/
│   ├── reviewer/
│   │   ├── AssignInspector.tsx          # Assign to inspector
│   │   ├── InspectionReports.tsx        # View reports
│   │   └── ProgressTracker.tsx          # Track progress
```

#### API Endpoints ที่ต้องเพิ่ม:

- `POST /api/applications/:id/assign-inspector` - Assign inspector
- `GET /api/applications/:id/inspection-report` - Get report
- `GET /api/applications/:id/inspection-progress` - Track progress

---

### 3. ✅ **APPROVER (ผู้อนุมัติ)**

#### สิ่งที่ต้องเพิ่ม:

- ✅ **View Inspection Results** - ดูผลการตรวจสอบ
- ✅ **View Snapshots** - ดูภาพถ่ายจากการตรวจสอบ
- ✅ **Final Decision** - ตัดสินใจอนุมัติ/ปฏิเสธ

#### Components ที่ต้องสร้าง:

```
apps/admin-portal/
├── components/
│   ├── approver/
│   │   ├── InspectionResults.tsx        # View results
│   │   ├── SnapshotViewer.tsx           # View snapshots
│   │   └── FinalDecision.tsx            # Approve/reject
```

#### API Endpoints ที่ใช้:

- `GET /api/inspections/:id/report` - Get inspection report
- `GET /api/inspections/:id/snapshots` - Get snapshots
- `POST /api/applications/:id/final-decision` - Final approval

---

## 📊 Workflow Integration

```
1. REVIEWER assigns application to INSPECTOR
   ↓
2. INSPECTOR schedules video call/onsite
   ↓
3. System sends notification to FARMER
   ↓
4. FARMER confirms schedule
   ↓
5. INSPECTOR conducts video call
   ↓ (FARMER joins video call)
6. INSPECTOR takes snapshots & submits report
   ↓
7. System notifies REVIEWER (if need_onsite)
   ↓ (or)
   System notifies APPROVER (if approved)
   ↓
8. APPROVER reviews report & snapshots
   ↓
9. APPROVER makes final decision
   ↓
10. System notifies FARMER of result
```

---

## 🔧 Backend Updates Required

### 1. Application Status Updates

```javascript
// apps/backend/routes/application-status.routes.js
- Update status when inspector assigned
- Update status when schedule confirmed
- Update status when inspection completed
- Update status when final decision made
```

### 2. Notification Integration

```javascript
// apps/backend/services/inspection-notification.service.js
- Notify farmer when schedule created
- Notify farmer 1 day before
- Notify reviewer when need_onsite
- Notify approver when inspection completed
- Notify farmer of final decision
```

### 3. Database Schema

```javascript
// Add to Application model
{
  inspectionSchedule: {
    type: { type: String, enum: ['video_call', 'onsite'] },
    scheduledDate: Date,
    scheduledTime: String,
    status: String,
    confirmedAt: Date
  },
  inspectionReport: {
    reportId: ObjectId,
    submittedAt: Date,
    decision: String,
    snapshotCount: Number
  }
}
```

---

## 📝 Priority Implementation Order

### Phase 4: Farmer Integration (HIGH PRIORITY)

1. ✅ FarmerVideoCallRoom component
2. ✅ ScheduleConfirmation component
3. ✅ InspectionNotifications component
4. ✅ Backend: Schedule confirmation endpoint

### Phase 5: Reviewer Integration (MEDIUM PRIORITY)

1. ✅ AssignInspector component
2. ✅ InspectionReports viewer
3. ✅ ProgressTracker component
4. ✅ Backend: Assignment endpoints

### Phase 6: Approver Integration (MEDIUM PRIORITY)

1. ✅ InspectionResults viewer
2. ✅ SnapshotViewer component
3. ✅ FinalDecision component
4. ✅ Backend: Final decision endpoint

### Phase 7: Complete Integration (HIGH PRIORITY)

1. ✅ Application status workflow
2. ✅ Complete notification flow
3. ✅ Database schema updates
4. ✅ End-to-end testing

---

## 🎯 Missing Components Summary

### Farmer Portal (4 components)

- [ ] FarmerVideoCallRoom.tsx
- [ ] ScheduleConfirmation.tsx
- [ ] InspectionStatus.tsx
- [ ] InspectionNotifications.tsx

### Admin Portal - Reviewer (3 components)

- [ ] AssignInspector.tsx
- [ ] InspectionReports.tsx
- [ ] ProgressTracker.tsx

### Admin Portal - Approver (3 components)

- [ ] InspectionResults.tsx
- [ ] SnapshotViewer.tsx
- [ ] FinalDecision.tsx

### Backend APIs (8 endpoints)

- [ ] POST /api/applications/:id/assign-inspector
- [ ] GET /api/applications/:id/inspection-progress
- [ ] POST /api/applications/:id/final-decision
- [ ] GET /api/inspections/:id/status
- [ ] PUT /api/applications/:id/status
- [ ] POST /api/notifications/schedule-reminder (cron job)
- [ ] GET /api/applications/:id/complete-workflow
- [ ] POST /api/inspections/:id/schedule/reschedule

---

## 🚀 Recommended Next Steps

1. **Start with Farmer Integration** (Most Critical)
   - Farmers need to confirm schedules
   - Farmers need to join video calls
2. **Then Reviewer Integration**
   - Reviewers need to assign inspectors
   - Reviewers need to track progress

3. **Then Approver Integration**
   - Approvers need to see inspection results
   - Approvers make final decisions

4. **Finally Complete Integration**
   - Connect all workflows
   - Test end-to-end
   - Deploy to production

---

**Total Estimated Work:**

- Components: 10
- API Endpoints: 8
- Database Updates: 2 models
- Estimated Time: 2-3 days

**Current Status:** Inspector tools complete (100%)
**Next Priority:** Farmer integration (0%)
