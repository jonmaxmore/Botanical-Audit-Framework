# Phase 0 Implementation Status

**Timeline**: 1 month  
**Budget**: ฿0 (Internal Resources)  
**Status**: ✅ COMPLETED (Role Structure Fixed)

---

## ✅ Task 1: Fix DTAM Role Structure

**Status**: ✅ COMPLETED  
**File**: `apps/backend/modules/auth-dtam/domain/entities/DTAMStaff.js`

### Changes Made:

#### 1. Updated Role Constants
```javascript
// BEFORE (Incorrect)
static ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',      // ❌ Wrong role
  REVIEWER: 'REVIEWER',
  AUDITOR: 'AUDITOR'       // ❌ Wrong role
};

// AFTER (Correct)
static ROLES = {
  ADMIN: 'ADMIN',
  REVIEWER: 'REVIEWER',
  INSPECTOR: 'INSPECTOR',   // ✅ Matches workflow
  APPROVER: 'APPROVER'      // ✅ Matches workflow
};
```

#### 2. Added New Permissions
```javascript
// Inspection permissions (NEW)
VIEW_INSPECTIONS: 'view_inspections',
SCHEDULE_INSPECTION: 'schedule_inspection',
CONDUCT_INSPECTION: 'conduct_inspection',
COMPLETE_INSPECTION: 'complete_inspection',
UPLOAD_INSPECTION_EVIDENCE: 'upload_inspection_evidence',

// Approval permissions (NEW)
VIEW_PENDING_APPROVALS: 'view_pending_approvals',
FINAL_APPROVAL: 'final_approval',
SEND_BACK_FOR_REVIEW: 'send_back_for_review',
```

#### 3. Updated Role Permissions Mapping

**ADMIN** (Full Access):
- All application permissions
- All inspection permissions  
- All approval permissions
- All certificate permissions
- All staff management permissions
- All system permissions

**REVIEWER** (Review Stage):
- `view_applications`
- `review_applications`
- `view_certificates`
- `view_audits`
- `view_reports`

**INSPECTOR** (Inspection Stage):
- `view_applications`
- `view_inspections`
- `schedule_inspection`
- `conduct_inspection`
- `complete_inspection`
- `upload_inspection_evidence`
- `view_certificates`
- `view_reports`

**APPROVER** (Final Approval Stage):
- `view_applications`
- `view_pending_approvals`
- `final_approval`
- `send_back_for_review`
- `view_certificates`
- `issue_certificates`
- `view_reports`
- `export_data`

---

## ⏳ Task 2: Enhance Inspector Dashboard

**Status**: 🔄 IN PROGRESS  
**File**: `apps/frontend/pages/inspector/dashboard.tsx`

### Current Status:
- ✅ Basic dashboard structure exists
- ✅ User authentication in place
- ⏳ Need to connect to real inspection API
- ⏳ Need to add inspection mode selection (Video/Hybrid/Onsite)
- ⏳ Need to add GACP checklist integration
- ⏳ Need to add evidence upload functionality

### Existing Infrastructure:
- Inspection service: `apps/backend/services/gacp-enhanced-inspection.js`
- API endpoints: `/api/gacp/inspections/*`
- Inspection model exists in backend

### Required Enhancements:

#### 1. Summary Cards (Existing - Need Data Integration)
- ✅ Farms Pending Inspection
- ✅ Inspections Scheduled  
- ✅ Inspections Completed
- ✅ Avg Inspection Score

#### 2. Inspection Queue Table (Need Enhancement)
**Current**: Basic table structure  
**Required**:
- Add "Lot ID" column
- Add "Inspection Type" (Video Call Only / Hybrid / Full Onsite)
- Add "Risk Score" from AI QC System
- Add "Scheduled Date/Time"
- Add action buttons (Schedule / Start Inspection / View Details)

#### 3. Inspection Modal (NEW)
**3 Modes Based on Risk Score**:

**Mode 1 - Video Call Only** (20% of cases, Score > 90):
- Video call interface integration
- Screen sharing for document review
- Basic GACP checklist (simplified)
- Upload photos/screenshots
- Duration: ~2 hours
- Cost: ฿500

**Mode 2 - Hybrid** (50% of cases, Score 70-89):
- Start with video call
- Inspector decides onsite visit needed
- Full GACP checklist
- Upload evidence from both video + onsite
- Duration: 4 hours (2 video + 2 onsite)
- Cost: ฿1,500

**Mode 3 - Full Onsite** (30% of cases, Score < 70):
- Full farm visit required
- Complete GACP checklist (50+ items)
- Extensive photo documentation
- Soil/water sampling if needed
- Duration: 1 day
- Cost: ฿3,000

#### 4. GACP Checklist Component (NEW)
**Standard Items (All Modes)**:
- Farm location verification
- Area size confirmation
- Water source verification
- Basic good practices

**Additional Items (Hybrid/Onsite)**:
- Soil quality assessment
- Irrigation system inspection
- Storage facility inspection
- Equipment sanitation check
- Record keeping verification
- Pest management practices
- Harvest handling procedures

#### 5. Evidence Upload (NEW)
- Photo upload (with GPS metadata)
- Document scanning
- Video recording (for serious issues)
- Inspector notes/comments
- Auto-generate inspection report

---

## ⏳ Task 3: Enhance Approver Dashboard

**Status**: 🔄 IN PROGRESS  
**File**: `apps/frontend/pages/approver/dashboard.tsx`

### Current Status:
- ✅ Basic dashboard structure exists
- ✅ User authentication in place
- ⏳ Need to connect to real approval API
- ⏳ Need to add payment verification
- ⏳ Need to add certificate generation integration

### Required Enhancements:

#### 1. Summary Cards (Existing - Need Data Integration)
- ✅ Pending Certificates
- ✅ Approved Today
- ✅ Rejected
- ✅ Avg Approval Time

#### 2. Application Table (Need Enhancement)
**Current**: Basic table structure  
**Required**:
- Add "Payment Status" column (Verified / Pending / None)
- Add "Review Status" (Passed / Conditional / Failed)
- Add "Inspection Score" (0-100)
- Add "Inspection Type" (Video/Hybrid/Onsite)
- Add "Inspector Name"
- Add "Submitted Date"
- Add action buttons (Approve / Reject / Send Back / View Details)

#### 3. Approval Modal (NEW)
**Application Summary**:
- Farmer information
- Farm details (from application)
- Lot ID and area
- Crop type and quantity

**Review History**:
- Reviewer comments
- Reviewer decision (Pass/Conditional/Fail)
- Review date

**Inspection Results**:
- Inspection type and date
- Inspector name
- Inspection score (0-100)
- GACP compliance percentage
- Critical non-conformities (if any)
- Inspector recommendations
- Uploaded evidence (photos/documents)

**Payment Verification**:
- Payment amount (based on farm size)
- Payment receipt upload
- Payment date
- Payment method

**Approval Actions**:
1. **Approve** → Issue Certificate
   - Generate certificate number
   - Set validity period (3 years)
   - Auto-send to farmer portal
   - Email notification

2. **Conditional Approve** → Issue with Conditions
   - List conditions to fulfill
   - Set follow-up inspection date
   - Issue temporary certificate (6 months)

3. **Reject** → Send Rejection Notice
   - Provide rejection reasons
   - Suggest improvements needed
   - Allow re-application after 6 months

4. **Send Back** → Request More Information
   - Specify what's needed
   - Send back to Reviewer or Inspector
   - Set deadline for resubmission

#### 4. Certificate Generation Integration (NEW)
- Connect to existing certificate service
- Auto-generate certificate PDF
- QR code with verification link
- Digital signature integration
- Upload to farmer portal
- Email delivery

---

## 📊 Phase 0 Summary

### Completed (Week 1):
✅ **Role Structure Fixed** - DTAMStaff.js updated with correct roles and permissions

### In Progress (Weeks 2-4):
🔄 **Inspector Dashboard Enhancement** - Connect to backend, add 3-mode inspection system  
🔄 **Approver Dashboard Enhancement** - Connect to backend, add approval workflow

### Next Steps:
1. Complete Inspector Dashboard integration (Week 2)
2. Complete Approver Dashboard integration (Week 3)
3. Testing and bug fixes (Week 4)
4. Deploy to staging environment
5. User acceptance testing with real staff

---

## 🎯 Success Criteria

### Technical:
- ✅ All 4 roles working (ADMIN, REVIEWER, INSPECTOR, APPROVER)
- ⏳ Inspector can schedule and conduct inspections in 3 modes
- ⏳ Approver can review and approve/reject applications
- ⏳ Role-based access control enforced
- ⏳ All dashboards show real data from backend

### Business:
- ⏳ Complete workflow from application → certificate issuance
- ⏳ Average processing time < 14 days
- ⏳ Inspector can handle 5-10 inspections per week
- ⏳ Approver can process 10-15 applications per day

### User Experience:
- ⏳ Intuitive dashboard for each role
- ⏳ Mobile-friendly for inspectors (field use)
- ⏳ Clear action buttons and workflows
- ⏳ Real-time status updates

---

## 🚀 Ready for Phase 1

Once Phase 0 is complete, we'll have:
- ✅ Correct role structure
- ✅ Working dashboards for all roles
- ✅ Complete manual workflow (no AI yet)
- ✅ Baseline for measuring improvements

Then we can start **Phase 1: AI QC System + Smart Assignment** (3 months, ฿600K)
