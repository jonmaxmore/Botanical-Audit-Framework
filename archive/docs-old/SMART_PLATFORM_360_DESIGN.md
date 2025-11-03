# 🌐 Smart Platform 360° - Complete Workflow Design

**Version**: 4.0  
**Date**: November 2, 2025  
**Status**: 🎯 **COMPREHENSIVE DESIGN**  
**Purpose**: ออกแบบ Business Logic และ Workflow ครบถ้วนสำหรับ DTAM Platform

---

## 🎯 ปัญหาที่พบในระบบเดิม

### ❌ สิ่งที่ขาด:

1. **Inspector Dashboard** ไม่มีระบบ Video Call ในตัว (มีแค่นัดหมาย)
2. **Reviewer** ไม่มีตารางนัดของ Inspector (ไม่รู้ว่า Inspector นัดเมื่อไหร่)
3. **Job Ticket System** ไม่มีการส่งงานแบบ Track ได้
4. **Evidence Storage** ไม่มีระบบเก็บหลักฐานการส่งงาน
5. **Video Call Integration** แยกจาก Dashboard (ต้องไปหน้าอื่น)
6. **Calendar/Schedule** ไม่มี Shared View ระหว่าง Reviewer/Inspector/Approver
7. **Notification** ไม่ครอบคลุมทุก Event

---

## ✅ Smart Platform 360° Solution

### 1️⃣ Job Ticket System (ระบบใบงาน)

**Purpose**: เก็บหลักฐานการส่งงานระหว่าง Role และ Track Status

#### Database Schema: `JobTicket`

```javascript
{
  jobTicketId: "JOB-2025-001",
  applicationId: "APP-2025-001",
  
  // Job Assignment
  assignedFrom: {
    userId: "user-reviewer-001",
    role: "DTAM_REVIEWER",
    name: "สมชาย ตรวจสอบ",
    timestamp: "2025-10-14T10:00:00Z"
  },
  
  assignedTo: {
    userId: "user-inspector-001", 
    role: "DTAM_INSPECTOR",
    name: "สมหญิง ตรวจฟาร์ม",
    timestamp: "2025-10-14T10:05:00Z"
  },
  
  // Job Details
  jobType: "FARM_INSPECTION", // DOCUMENT_REVIEW | FARM_INSPECTION | FINAL_APPROVAL
  priority: "high", // low | medium | high | urgent
  dueDate: "2025-10-21T23:59:59Z",
  
  // Status Tracking
  status: "assigned", // assigned | accepted | in_progress | completed | rejected | escalated
  
  // Evidence & Attachments
  attachments: [
    {
      type: "assignment_note",
      fileName: "inspection-requirements.pdf",
      url: "https://s3.../assignment_note.pdf",
      uploadedBy: "user-reviewer-001",
      uploadedAt: "2025-10-14T10:00:00Z"
    }
  ],
  
  // Communication Log
  comments: [
    {
      commentId: "comment-001",
      userId: "user-inspector-001",
      message: "รับงานแล้วครับ จะไปตรวจวันพุธ",
      timestamp: "2025-10-14T10:10:00Z",
      attachments: []
    }
  ],
  
  // Completion Evidence
  completionEvidence: {
    completedBy: "user-inspector-001",
    completedAt: "2025-10-16T14:30:00Z",
    reportUrl: "https://s3.../inspection-report.pdf",
    score: 92,
    recommendation: "Approve"
  },
  
  // KPI Tracking
  sla: {
    expectedDuration: 7, // days
    actualDuration: 2, // days
    isOnTime: true,
    delayReason: null
  },
  
  // Audit Trail
  history: [
    {
      action: "JOB_CREATED",
      timestamp: "2025-10-14T10:00:00Z",
      actor: "user-reviewer-001",
      details: "Job created and assigned to Inspector"
    },
    {
      action: "JOB_ACCEPTED",
      timestamp: "2025-10-14T10:05:00Z",
      actor: "user-inspector-001",
      details: "Inspector accepted the job"
    },
    {
      action: "JOB_COMPLETED",
      timestamp: "2025-10-16T14:30:00Z",
      actor: "user-inspector-001",
      details: "Inspection completed with score 92"
    }
  ],
  
  createdAt: "2025-10-14T10:00:00Z",
  updatedAt: "2025-10-16T14:30:00Z"
}
```

#### API Endpoints

```javascript
// Create Job Ticket (Reviewer → Inspector)
POST /api/job-tickets
Body: {
  applicationId: "APP-2025-001",
  assignedTo: "user-inspector-001",
  jobType: "FARM_INSPECTION",
  priority: "high",
  dueDate: "2025-10-21",
  notes: "ตรวจฟาร์มและให้คะแนน"
}

// Accept/Reject Job
PATCH /api/job-tickets/:jobTicketId/accept
Body: { action: "accept" | "reject", reason: "..." }

// Update Job Status
PATCH /api/job-tickets/:jobTicketId/status
Body: { status: "in_progress", notes: "กำลังดำเนินการ" }

// Add Comment
POST /api/job-tickets/:jobTicketId/comments
Body: { message: "...", attachments: [...] }

// Complete Job
POST /api/job-tickets/:jobTicketId/complete
Body: {
  reportUrl: "https://...",
  score: 92,
  recommendation: "Approve"
}

// Get My Jobs
GET /api/job-tickets/my-jobs?status=assigned,in_progress

// Get Job History
GET /api/job-tickets/:jobTicketId/history
```

---

### 2️⃣ Video Call Integration (ในตัว Dashboard)

**Technology**: Agora RTC / WebRTC

#### Inspector Dashboard - Video Call Component

```typescript
// InspectorDashboard.tsx

interface VideoCallSession {
  sessionId: string;
  inspectionId: string;
  applicationId: string;
  farmerName: string;
  farmName: string;
  
  // Agora Config
  agoraAppId: string;
  channelName: string;
  token: string;
  uid: number;
  
  // Session Info
  scheduledTime: Date;
  startTime: Date | null;
  endTime: Date | null;
  duration: number; // minutes
  
  // Recording
  recordingEnabled: boolean;
  recordingUrl: string | null;
  
  // Participants
  participants: {
    inspector: { userId: string; name: string; status: "online" | "offline" };
    farmer: { userId: string; name: string; status: "online" | "offline" };
  };
  
  // Evidence Capture
  snapshots: [
    {
      snapshotId: string;
      timestamp: Date;
      imageUrl: string;
      description: string;
    }
  ];
  
  // Notes
  inspectorNotes: string;
  
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

// Component Structure
<InspectorDashboard>
  <VideoCallPanel>
    {/* Video Call UI */}
    <AgoraVideoPlayer />
    
    {/* Quick Tools */}
    <VideoCallControls>
      <Button onClick={takeSnapshot}>📸 Capture</Button>
      <Button onClick={toggleRecording}>🔴 Record</Button>
      <Button onClick={toggleMic}>🎤 Mute</Button>
      <Button onClick={toggleCamera}>📹 Camera</Button>
      <Button onClick={shareScreen}>🖥️ Share Screen</Button>
    </VideoCallControls>
    
    {/* Evidence Gallery */}
    <SnapshotGallery snapshots={session.snapshots} />
    
    {/* Inspector Notes */}
    <NotesEditor 
      value={inspectorNotes}
      onChange={updateNotes}
      placeholder="บันทึกสิ่งที่สังเกตเห็น..."
    />
    
    {/* GACP Checklist (Side Panel) */}
    <ChecklistPanel items={gacpChecklist} onChange={updateChecklist} />
    
    {/* End Call Actions */}
    <EndCallDialog>
      <TextField label="สรุปผลการตรวจ" multiline />
      <RadioGroup>
        <FormControlLabel value="pass" label="✅ ผ่าน - ไม่ต้องลงพื้นที่" />
        <FormControlLabel value="onsite_required" label="🚗 ต้องลงพื้นที่ตรวจเพิ่ม" />
        <FormControlLabel value="fail" label="❌ ไม่ผ่าน" />
      </RadioGroup>
      <Button onClick={endCallAndSubmit}>บันทึกผลการตรวจ</Button>
    </EndCallDialog>
  </VideoCallPanel>
</InspectorDashboard>
```

#### API Endpoints for Video Call

```javascript
// Initialize Video Call Session
POST /api/video-call/initialize
Body: {
  inspectionId: "INS-2025-001",
  farmerId: "user-farmer-001"
}
Response: {
  sessionId: "SESSION-001",
  agoraAppId: "xxx",
  channelName: "inspection-001",
  token: "xxx",
  uid: 12345
}

// Start Video Call
POST /api/video-call/:sessionId/start

// Take Snapshot during call
POST /api/video-call/:sessionId/snapshot
Body: { 
  imageData: "base64...",
  description: "ภาพระบบน้ำ"
}

// Save Inspector Notes
PATCH /api/video-call/:sessionId/notes
Body: { notes: "..." }

// End Call & Submit Result
POST /api/video-call/:sessionId/end
Body: {
  decision: "pass" | "onsite_required" | "fail",
  summary: "...",
  checklistResults: {...}
}
```

---

### 3️⃣ Shared Calendar System

**Purpose**: ให้ Reviewer/Inspector/Approver ดู Schedule ของกันและกันได้

#### Database Schema: `Schedule`

```javascript
{
  scheduleId: "SCH-2025-001",
  
  // Event Details
  eventType: "VIDEO_CALL", // VIDEO_CALL | ONSITE_INSPECTION | MEETING | DEADLINE
  title: "ตรวจฟาร์มอินทรีย์ - Video Call",
  description: "ตรวจสอบระบบน้ำและการจัดการปุ๋ย",
  
  // Related Entities
  applicationId: "APP-2025-001",
  jobTicketId: "JOB-2025-001",
  
  // Participants
  organizer: {
    userId: "user-inspector-001",
    role: "DTAM_INSPECTOR",
    name: "สมหญิง ตรวจฟาร์ม"
  },
  
  attendees: [
    {
      userId: "user-farmer-001",
      role: "FARMER",
      name: "สมชาย ใจดี",
      status: "accepted" // pending | accepted | declined
    },
    {
      userId: "user-reviewer-001",
      role: "DTAM_REVIEWER",
      name: "สมศักดิ์ ตรวจสอบ",
      status: "pending" // Observer (optional)
    }
  ],
  
  // Timing
  scheduledStartTime: "2025-10-16T09:00:00Z",
  scheduledEndTime: "2025-10-16T10:00:00Z",
  actualStartTime: "2025-10-16T09:05:00Z",
  actualEndTime: "2025-10-16T10:15:00Z",
  
  // Location (for Onsite)
  location: {
    farmName: "ฟาร์มอินทรีย์",
    address: "123 หมู่ 5 ต.แม่ริม อ.แม่ริม จ.เชียงใหม่",
    gpsCoordinates: { lat: 18.9062, lng: 98.9063 }
  },
  
  // Meeting Link (for Video Call)
  meetingInfo: {
    platform: "Agora",
    channelName: "inspection-001",
    meetingUrl: "https://platform.com/join/inspection-001",
    password: "123456"
  },
  
  // Reminders
  reminders: [
    {
      type: "notification",
      triggerBefore: 60, // minutes
      sent: true,
      sentAt: "2025-10-16T08:00:00Z"
    },
    {
      type: "email",
      triggerBefore: 1440, // 24 hours
      sent: true,
      sentAt: "2025-10-15T09:00:00Z"
    }
  ],
  
  // Status
  status: "scheduled", // scheduled | in_progress | completed | cancelled | rescheduled
  
  // Rescheduling History
  rescheduledFrom: "SCH-2025-000",
  rescheduledReason: "เกษตรกรติดธุระ",
  
  // Visibility
  visibility: "team", // private | team | public
  
  createdAt: "2025-10-14T10:00:00Z",
  updatedAt: "2025-10-14T10:00:00Z"
}
```

#### Shared Calendar Views

**Reviewer Dashboard**:
```typescript
// Reviewer เห็น:
// 1. งานที่ส่งไปให้ Inspector แล้ว Inspector นัดเมื่อไหร่
// 2. Inspector คนไหนว่าง/ไม่ว่าง
// 3. Inspector ที่นัดซ้อนกันหรือไม่

<ReviewerDashboard>
  <SharedCalendarWidget>
    <CalendarView mode="team">
      {/* Show Inspector Schedules */}
      <InspectorScheduleList>
        <InspectorCard>
          <Avatar name="สมหญิง ตรวจฟาร์ม" />
          <Typography>Inspections Today: 3</Typography>
          <Chip label="Available after 3 PM" color="success" />
          <Button onClick={viewFullSchedule}>ดูตารางเต็ม</Button>
        </InspectorCard>
      </InspectorScheduleList>
      
      {/* Calendar Grid */}
      <Calendar
        events={teamSchedules}
        onEventClick={viewEventDetails}
        filters={["inspector-001", "inspector-002"]}
      />
    </CalendarView>
  </SharedCalendarWidget>
  
  {/* My Applications & Their Status */}
  <ApplicationStatusTable>
    <TableRow>
      <Cell>APP-2025-001</Cell>
      <Cell>สมชาย ใจดี</Cell>
      <Cell>Inspector: สมหญิง</Cell>
      <Cell>
        <Chip label="📅 Scheduled: 16/10 09:00" color="primary" />
      </Cell>
      <Cell>
        <Button onClick={viewSchedule}>ดูนัดหมาย</Button>
      </Cell>
    </TableRow>
  </ApplicationStatusTable>
</ReviewerDashboard>
```

**Inspector Dashboard**:
```typescript
// Inspector เห็น:
// 1. นัดของตัวเอง
// 2. นัดของ Inspector คนอื่น (เพื่อประสานงาน)
// 3. Availability ของ Farmer

<InspectorDashboard>
  <MySchedulePanel>
    <FullCalendar
      events={mySchedules}
      eventContent={renderEventWithJobTicket}
      onEventClick={openInspectionModal}
    />
  </MySchedulePanel>
  
  <TeamSchedulePanel>
    <Typography variant="h6">Inspector Team Schedule</Typography>
    <TeamCalendar 
      inspectors={[{id: "inspector-002", name: "สมชาย ตรวจ"}]}
      showAvailability={true}
    />
  </TeamSchedulePanel>
</InspectorDashboard>
```

#### API Endpoints for Calendar

```javascript
// Get My Schedule
GET /api/schedules/my-schedule?from=2025-10-01&to=2025-10-31

// Get Team Schedule (Reviewer sees Inspector schedules)
GET /api/schedules/team-schedule?role=DTAM_INSPECTOR&from=2025-10-01&to=2025-10-31

// Create Schedule Event
POST /api/schedules
Body: {
  eventType: "VIDEO_CALL",
  applicationId: "APP-2025-001",
  attendees: ["user-farmer-001"],
  scheduledStartTime: "2025-10-16T09:00:00Z",
  scheduledEndTime: "2025-10-16T10:00:00Z",
  meetingInfo: {...}
}

// Reschedule Event
PATCH /api/schedules/:scheduleId/reschedule
Body: {
  newStartTime: "2025-10-17T09:00:00Z",
  newEndTime: "2025-10-17T10:00:00Z",
  reason: "เกษตรกรติดธุระ"
}

// Accept/Decline Schedule
PATCH /api/schedules/:scheduleId/respond
Body: { status: "accepted" | "declined", reason: "..." }

// Get Inspector Availability
GET /api/schedules/availability?inspectorId=user-inspector-001&date=2025-10-16
Response: {
  availableSlots: [
    { start: "09:00", end: "10:00" },
    { start: "14:00", end: "16:00" }
  ]
}
```

---

### 4️⃣ Enhanced Notification System

#### Notification Events (Comprehensive)

```javascript
// 1. Job Ticket Events
"job_ticket.created"        → Inspector: "คุณได้รับงานใหม่"
"job_ticket.accepted"       → Reviewer: "Inspector รับงานแล้ว"
"job_ticket.rejected"       → Reviewer: "Inspector ปฏิเสธงาน"
"job_ticket.in_progress"    → Reviewer: "Inspector กำลังดำเนินการ"
"job_ticket.completed"      → Reviewer + Approver: "Inspector ส่งงานแล้ว"
"job_ticket.comment_added"  → All participants: "มี Comment ใหม่"

// 2. Schedule Events
"schedule.created"          → Attendees: "นัดหมายใหม่: Video Call วันที่ XX"
"schedule.rescheduled"      → Attendees: "เลื่อนนัดหมาย: เหตุผล XXX"
"schedule.reminder_1h"      → Attendees: "เตือน: นัดตรวจในอีก 1 ชั่วโมง"
"schedule.reminder_24h"     → Attendees: "เตือน: พรุ่งนี้มีนัดตรวจ"
"schedule.started"          → Observers: "Inspector เริ่มตรวจแล้ว"
"schedule.completed"        → All: "ตรวจเสร็จแล้ว"

// 3. Video Call Events
"video_call.farmer_joined"  → Inspector: "Farmer เข้า Video Call แล้ว"
"video_call.started"        → Farmer + Reviewer: "Inspector เริ่ม Video Call"
"video_call.snapshot_taken" → All: "Inspector ถ่ายรูปหลักฐาน"
"video_call.ended"          → All: "Video Call สิ้นสุด"

// 4. Payment Events
"payment.3rd_rejection"     → Farmer: "ต้องชำระ 5,000 บาท (ส่งครั้งที่ 3)"
"payment.completed"         → Reviewer: "Farmer ชำระเงินแล้ว"
"payment.overdue"           → Admin: "Payment เกินกำหนด"

// 5. SLA & Delay Events
"sla.approaching"           → Owner: "ใกล้ครบกำหนด SLA (осталось 24 ชม.)"
"sla.breached"              → Owner + Manager: "เกิน SLA แล้ว"
"job.delayed"               → Manager: "งานล่าช้ากว่ากำหนด"

// 6. Approval Events
"approval.pending"          → Approver: "รอการอนุมัติ"
"approval.approved"         → Farmer: "คำขออนุมัติแล้ว"
"approval.rejected"         → Farmer + Reviewer: "คำขอถูกปฏิเสธ"
```

#### Notification UI Component

```typescript
// NotificationCenter.tsx

<NotificationCenter>
  {/* Real-time Badge */}
  <IconButton onClick={toggleDrawer}>
    <Badge badgeContent={unreadCount} color="error">
      <NotificationsIcon />
    </Badge>
  </IconButton>
  
  {/* Notification Drawer */}
  <Drawer open={drawerOpen} onClose={closeDrawer}>
    <NotificationList>
      {/* Filter Tabs */}
      <Tabs value={filter} onChange={setFilter}>
        <Tab label="ทั้งหมด" value="all" />
        <Tab label="งาน" value="job" />
        <Tab label="นัดหมาย" value="schedule" />
        <Tab label="Video Call" value="video" />
      </Tabs>
      
      {/* Notification Items */}
      {notifications.map(notif => (
        <NotificationItem key={notif.id}>
          <ListItemIcon>{getIcon(notif.type)}</ListItemIcon>
          <ListItemText
            primary={notif.title}
            secondary={notif.message}
          />
          <Typography variant="caption">{formatTime(notif.timestamp)}</Typography>
          
          {/* Quick Actions */}
          {notif.actionable && (
            <Box sx={{mt: 1}}>
              <Button size="small" onClick={() => handleAction(notif)}>
                {notif.actionLabel}
              </Button>
            </Box>
          )}
        </NotificationItem>
      ))}
    </NotificationList>
  </Drawer>
  
  {/* Toast Notifications (Real-time) */}
  <Snackbar
    open={toastOpen}
    message={toastMessage}
    action={
      <Button color="secondary" onClick={viewNotification}>
        ดู
      </Button>
    }
  />
</NotificationCenter>
```

---

### 5️⃣ Evidence Storage System

**Purpose**: เก็บหลักฐานทุกขั้นตอน เพื่อ Audit และ Compliance

#### Database Schema: `Evidence`

```javascript
{
  evidenceId: "EVD-2025-001",
  
  // Related Entities
  applicationId: "APP-2025-001",
  jobTicketId: "JOB-2025-001",
  scheduleId: "SCH-2025-001",
  
  // Evidence Type
  evidenceType: "VIDEO_CALL_SNAPSHOT", 
  // Types: DOCUMENT | VIDEO_CALL_SNAPSHOT | VIDEO_CALL_RECORDING | 
  //        ONSITE_PHOTO | GPS_LOCATION | INSPECTOR_REPORT | 
  //        APPROVAL_CERTIFICATE | PAYMENT_RECEIPT
  
  // File Info
  fileName: "farm-water-system.jpg",
  fileType: "image/jpeg",
  fileSize: 1024000, // bytes
  fileUrl: "https://s3.amazonaws.com/.../farm-water-system.jpg",
  thumbnailUrl: "https://s3.amazonaws.com/.../thumb_farm-water-system.jpg",
  
  // Metadata
  capturedBy: {
    userId: "user-inspector-001",
    role: "DTAM_INSPECTOR",
    name: "สมหญิง ตรวจฟาร์ม"
  },
  
  capturedAt: "2025-10-16T09:30:00Z",
  
  location: {
    farmName: "ฟาร์มอินทรีย์",
    gpsCoordinates: { lat: 18.9062, lng: 98.9063 }
  },
  
  // Description
  description: "ระบบน้ำสำหรับรดต้นกัญชา - ใช้ระบบดริป",
  tags: ["water_system", "irrigation", "compliance"],
  
  // Verification
  verified: true,
  verifiedBy: "user-approver-001",
  verifiedAt: "2025-10-17T10:00:00Z",
  
  // Access Control
  visibility: "internal", // public | internal | restricted
  accessLog: [
    {
      userId: "user-approver-001",
      action: "VIEW",
      timestamp: "2025-10-17T10:00:00Z"
    }
  ],
  
  createdAt: "2025-10-16T09:30:00Z"
}
```

#### Evidence Gallery Component

```typescript
// EvidenceGallery.tsx

<EvidenceGallery applicationId="APP-2025-001">
  {/* Filter by Type */}
  <FilterBar>
    <Chip label="All" onClick={() => setFilter("all")} />
    <Chip label="📸 Photos" onClick={() => setFilter("photos")} />
    <Chip label="🎥 Videos" onClick={() => setFilter("videos")} />
    <Chip label="📄 Documents" onClick={() => setFilter("documents")} />
    <Chip label="📍 GPS" onClick={() => setFilter("gps")} />
  </FilterBar>
  
  {/* Timeline View */}
  <Timeline>
    {evidenceByDate.map(({ date, items }) => (
      <TimelineItem key={date}>
        <TimelineSeparator>
          <TimelineDot color="primary" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="h6">{formatDate(date)}</Typography>
          <ImageList cols={3}>
            {items.map(evidence => (
              <ImageListItem key={evidence.id}>
                <img src={evidence.thumbnailUrl} alt={evidence.description} />
                <ImageListItemBar
                  title={evidence.description}
                  subtitle={`by ${evidence.capturedBy.name}`}
                  actionIcon={
                    <IconButton onClick={() => viewEvidence(evidence)}>
                      <InfoIcon />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        </TimelineContent>
      </TimelineItem>
    ))}
  </Timeline>
  
  {/* Evidence Detail Modal */}
  <Dialog open={detailModalOpen} onClose={closeModal}>
    <DialogTitle>{selectedEvidence?.description}</DialogTitle>
    <DialogContent>
      <img src={selectedEvidence?.fileUrl} width="100%" />
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Captured by:</strong> {selectedEvidence?.capturedBy.name}
        </Typography>
        <Typography variant="body2">
          <strong>Date:</strong> {formatDateTime(selectedEvidence?.capturedAt)}
        </Typography>
        <Typography variant="body2">
          <strong>Location:</strong> {selectedEvidence?.location.farmName}
        </Typography>
        {selectedEvidence?.location.gpsCoordinates && (
          <Button startIcon={<MapIcon />} onClick={viewOnMap}>
            View on Map
          </Button>
        )}
      </Box>
    </DialogContent>
  </Dialog>
</EvidenceGallery>
```

---

### 6️⃣ Complete Dashboard Redesign

#### 🔵 Reviewer Dashboard (Enhanced)

```typescript
<ReviewerDashboard>
  {/* Top Bar */}
  <AppBar>
    <Toolbar>
      <Typography variant="h6">Reviewer Dashboard</Typography>
      <NotificationCenter />
      <UserMenu />
    </Toolbar>
  </AppBar>
  
  {/* Main Content */}
  <Container maxWidth="xl" sx={{ mt: 3 }}>
    {/* Summary Cards */}
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="รอตรวจสอบ"
          value={pendingCount}
          icon={<AssignmentIcon />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="ส่งกลับแก้ไข"
          value={revisionCount}
          icon={<ReturnIcon />}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="รอชำระเงิน"
          value={paymentPendingCount}
          icon={<PaymentIcon />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="ส่ง Inspector แล้ว"
          value={sentToInspectorCount}
          icon={<CheckIcon />}
          color="success"
        />
      </Grid>
    </Grid>
    
    {/* Inspector Team Status */}
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        👥 Inspector Team Status
      </Typography>
      <Grid container spacing={2}>
        {inspectors.map(inspector => (
          <Grid item xs={12} sm={6} md={4} key={inspector.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar src={inspector.avatar}>{inspector.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{inspector.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Jobs: {inspector.activeJobs}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={inspector.available ? "🟢 Available" : "🔴 Busy"}
                    color={inspector.available ? "success" : "error"}
                    size="small"
                  />
                  <Button
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => viewInspectorSchedule(inspector.id)}
                  >
                    ดูตาราง
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
    
    {/* Application Queue Table */}
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        📋 Application Queue
      </Typography>
      <DataGrid
        rows={applications}
        columns={[
          { field: "applicationId", headerName: "Application ID", width: 150 },
          { field: "farmerName", headerName: "Farmer", width: 150 },
          { field: "farmName", headerName: "Farm", width: 150 },
          { 
            field: "submissionCount", 
            headerName: "Submission", 
            width: 120,
            renderCell: (params) => (
              <Chip 
                label={`${params.value} ครั้ง`}
                color={params.value >= 3 ? "error" : "default"}
              />
            )
          },
          { 
            field: "paymentStatus", 
            headerName: "Payment", 
            width: 120,
            renderCell: (params) => (
              <Chip 
                label={params.value}
                color={params.value === "Paid" ? "success" : "warning"}
              />
            )
          },
          { 
            field: "inspectorStatus", 
            headerName: "Inspector Status", 
            width: 200,
            renderCell: (params) => {
              if (!params.value) return <Chip label="ยังไม่ส่ง" />;
              return (
                <Box>
                  <Chip 
                    label={params.value.name} 
                    size="small"
                    avatar={<Avatar src={params.value.avatar} />}
                  />
                  <Typography variant="caption" display="block">
                    📅 {params.value.scheduledDate}
                  </Typography>
                </Box>
              );
            }
          },
          { field: "submittedDate", headerName: "Submitted", width: 120 },
          {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
              <Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => reviewApplication(params.row.id)}
                >
                  ตรวจสอบ
                </Button>
              </Box>
            )
          }
        ]}
        pageSize={10}
        autoHeight
      />
    </Paper>
    
    {/* Shared Calendar - See Inspector Schedules */}
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        📅 Inspector Schedule (Team View)
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={inspectorSchedules}
        eventContent={(eventInfo) => (
          <Box>
            <Typography variant="caption">{eventInfo.event.title}</Typography>
            <Typography variant="caption" display="block">
              Inspector: {eventInfo.event.extendedProps.inspectorName}
            </Typography>
          </Box>
        )}
        eventClick={viewScheduleDetails}
      />
    </Paper>
  </Container>
</ReviewerDashboard>
```

#### 🟢 Inspector Dashboard (Enhanced with Video Call)

```typescript
<InspectorDashboard>
  <AppBar>
    <Toolbar>
      <Typography variant="h6">Inspector Dashboard</Typography>
      <NotificationCenter />
      <UserMenu />
    </Toolbar>
  </AppBar>
  
  <Container maxWidth="xl" sx={{ mt: 3 }}>
    {/* Summary Cards */}
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="งานที่รับแล้ว"
          value={assignedCount}
          icon={<AssignmentTurnedInIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Video Call วันนี้"
          value={videoCallTodayCount}
          icon={<VideocamIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="ลงพื้นที่วันนี้"
          value={onsiteТ todayCount}
          icon={<LocationOnIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md=3}>
        <StatCard
          title="เสร็จสิ้นแล้ว"
          value={completedCount}
          icon={<CheckCircleIcon />}
        />
      </Grid>
    </Grid>
    
    {/* Active Video Call Session */}
    {activeVideoCall && (
      <Paper sx={{ p: 3, mt: 3, bgcolor: "primary.light" }}>
        <Typography variant="h6" gutterBottom>
          🎥 Active Video Call Session
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Agora Video Player */}
            <Box sx={{ height: 500, bgcolor: "black", borderRadius: 2 }}>
              <AgoraVideoCall
                sessionId={activeVideoCall.sessionId}
                onSnapshot={handleSnapshot}
                onEndCall={handleEndCall}
              />
            </Box>
            
            {/* Video Controls */}
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={takeSnapshot}>
                📸 Capture
              </Button>
              <Button variant="contained" color="error" onClick={toggleRecording}>
                {recording ? "⏹️ Stop" : "🔴 Record"}
              </Button>
              <Button variant="outlined" onClick={toggleMic}>
                {micMuted ? "🎤 Unmute" : "🔇 Mute"}
              </Button>
              <Button variant="outlined" onClick={toggleCamera}>
                {cameraOff ? "📹 Camera On" : "📹 Camera Off"}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* GACP Checklist (Real-time) */}
            <Paper sx={{ p: 2, height: 500, overflow: "auto" }}>
              <Typography variant="subtitle1" gutterBottom>
                📋 GACP Checklist
              </Typography>
              <List>
                {gacpChecklist.map((item, index) => (
                  <ListItem key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.checked}
                          onChange={() => toggleChecklistItem(index)}
                        />
                      }
                      label={item.name}
                    />
                  </ListItem>
                ))}
              </List>
              
              {/* Inspector Notes */}
              <TextField
                label="บันทึกสิ่งที่สังเกตเห็น"
                multiline
                rows={4}
                fullWidth
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Paper>
          </Grid>
        </Grid>
        
        {/* Snapshot Gallery */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Captured Evidence:</Typography>
          <ImageList cols={6} sx={{ mt: 1 }}>
            {snapshots.map((snapshot, index) => (
              <ImageListItem key={index}>
                <img src={snapshot.url} alt={`Snapshot ${index}`} />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
        
        {/* End Call Button */}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={openEndCallDialog}
          >
            ⏹️ End Call & Submit Result
          </Button>
        </Box>
      </Paper>
    )}
    
    {/* My Schedule */}
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        📅 My Schedule
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        events={mySchedules}
        eventClick={startInspection}
      />
    </Paper>
    
    {/* Job Queue Table */}
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        📋 My Jobs
      </Typography>
      <DataGrid
        rows={myJobs}
        columns={[
          { field: "jobTicketId", headerName: "Job ID", width: 150 },
          { field: "farmName", headerName: "Farm", width: 150 },
          { field: "lotId", headerName: "Lot ID", width: 120 },
          { field: "farmerName", headerName: "Farmer", width: 150 },
          { 
            field: "type", 
            headerName: "Type", 
            width: 120,
            renderCell: (params) => (
              <Chip 
                icon={params.value === "VIDEO_CALL" ? <VideocamIcon /> : <LocationOnIcon />}
                label={params.value}
              />
            )
          },
          { field: "scheduledDate", headerName: "Scheduled", width: 150 },
          { 
            field: "status", 
            headerName: "Status", 
            width: 120,
            renderCell: (params) => (
              <Chip label={params.value} color={getStatusColor(params.value)} />
            )
          },
          {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
              <Button
                variant="contained"
                onClick={() => startJob(params.row)}
              >
                {params.row.type === "VIDEO_CALL" ? "🎥 Start Call" : "🚗 Start Inspection"}
              </Button>
            )
          }
        ]}
        autoHeight
      />
    </Paper>
  </Container>
</InspectorDashboard>
```

---

## 📊 Implementation Plan

### Phase 1: Job Ticket System (Week 1-2)
- [ ] Create `JobTicket` MongoDB schema
- [ ] Build Job Ticket API endpoints
- [ ] Create Job Assignment UI (Reviewer → Inspector)
- [ ] Add Comment system on Job Tickets
- [ ] Test Job Ticket workflow

### Phase 2: Shared Calendar System (Week 3-4)
- [ ] Create `Schedule` MongoDB schema
- [ ] Integrate FullCalendar library
- [ ] Build Shared Calendar API
- [ ] Add Team View for Reviewer
- [ ] Add My Schedule for Inspector
- [ ] Test Calendar sync and notifications

### Phase 3: Video Call Integration (Week 5-6)
- [ ] Set up Agora RTC account
- [ ] Build Video Call component
- [ ] Add Snapshot capture feature
- [ ] Add Recording feature
- [ ] Integrate GACP Checklist in Video Call
- [ ] Test End-to-End Video Call workflow

### Phase 4: Evidence Storage (Week 7)
- [ ] Create `Evidence` MongoDB schema
- [ ] Build Evidence upload API
- [ ] Create Evidence Gallery component
- [ ] Add Timeline view
- [ ] Test Evidence lifecycle

### Phase 5: Enhanced Notifications (Week 8)
- [ ] Expand Notification types (30+ events)
- [ ] Build Real-time WebSocket handlers
- [ ] Create Notification Center UI
- [ ] Add Email/SMS integration
- [ ] Test all notification flows

### Phase 6: Dashboard Redesign (Week 9-10)
- [ ] Redesign Reviewer Dashboard
- [ ] Redesign Inspector Dashboard
- [ ] Add Inspector Team Status widget
- [ ] Add Quick Actions
- [ ] User testing and feedback

---

## 🎯 Success Criteria

### Must Have (100% Required)
- ✅ Job Ticket system with full audit trail
- ✅ Shared Calendar visible to all roles
- ✅ Video Call embedded in Inspector Dashboard
- ✅ Evidence storage for all inspection activities
- ✅ Real-time notifications for all events
- ✅ Reviewer can see Inspector schedules
- ✅ Inspector can see team schedules

### Should Have (80% Required)
- ✅ Video recording during calls
- ✅ GPS tracking for onsite inspections
- ✅ Automated SLA alerts
- ✅ Mobile responsive design

### Nice to Have (Optional)
- AI-powered GACP compliance check during video call
- Automatic report generation from video call
- Multi-language support (Thai/English)

---

## 📝 Related Documents

- `DTAM_WORKFLOW_STANDARD_OFFICIAL.md` - Official workflow standard
- `STAFF_WORKFLOW_SUMMARY.md` - Current workflow summary
- `VIDEO_INSPECTION_COMPLETE.md` - Video inspection implementation
- `INTEGRATION_TEST_REPORT.md` - Integration testing results

---

**Prepared by**: AI Assistant  
**Review Status**: ⏳ Pending User Approval  
**Next Steps**: Get user approval → Start Phase 1 implementation
