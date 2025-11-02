# Job Ticket System - Frontend Components

## Overview
This document describes the frontend components for the Job Ticket System (Phase 1A - Step 5).

## Components Created

### 1. JobDetailModal.tsx
**Location:** `apps/frontend/components/job-ticket/JobDetailModal.tsx`

**Purpose:** Main modal component for displaying comprehensive job assignment details with tabbed interface.

**Features:**
- Full job overview with status, type, and SLA information
- Tabbed interface for Comments, Attachments, and History
- Quick action buttons (Accept, Start, Complete)
- Real-time data refresh
- Error handling and loading states

**Props:**
```typescript
interface JobDetailModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onUpdate?: () => void;
}
```

**Usage:**
```tsx
import JobDetailModal from '@/components/job-ticket/JobDetailModal';

<JobDetailModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  jobId="job-id-here"
  onUpdate={() => fetchJobs()}
/>
```

---

### 2. CommentThread.tsx
**Location:** `apps/frontend/components/job-ticket/CommentThread.tsx`

**Purpose:** Comment list and input component with real-time updates.

**Features:**
- Comment input with Ctrl+Enter submit
- Chronological comment display
- Author role badges with color coding
- Relative timestamps (Thai locale)
- Attachment indicators
- Auto-refresh on submit

**Props:**
```typescript
interface CommentThreadProps {
  jobId: string;
  onUpdate?: () => void;
}
```

**Color Coding:**
- Inspector: Orange (#ff9800)
- Reviewer: Blue (#2196f3)
- Admin: Purple (#9c27b0)
- Farmer: Green (#4caf50)

---

### 3. JobAttachmentList.tsx
**Location:** `apps/frontend/components/job-ticket/JobAttachmentList.tsx`

**Purpose:** File attachment management with upload and download.

**Features:**
- File upload with drag-and-drop support
- File list with metadata (size, uploader, date)
- File type icons (PDF, Image, Generic)
- Download functionality
- File size formatting (Bytes, KB, MB, GB)

**Props:**
```typescript
interface JobAttachmentListProps {
  jobId: string;
  onUpdate?: () => void;
}
```

**Supported File Types:**
- All file types accepted
- Visual indicators for: Images, PDFs, Generic files

---

### 4. JobHistoryTimeline.tsx
**Location:** `apps/frontend/components/job-ticket/JobHistoryTimeline.tsx`

**Purpose:** Visual timeline showing job assignment history.

**Features:**
- Vertical timeline with custom styling (no @mui/lab dependency)
- Action icons and color coding
- Timestamp formatting (Thai locale)
- Change details display
- Auto-scrolling for long histories

**Props:**
```typescript
interface JobHistoryTimelineProps {
  jobId: string;
}
```

**Action Types:**
- created (Info - Blue)
- accepted (Primary - Blue)
- started (Warning - Orange)
- completed (Success - Green)
- rejected (Error - Red)
- reassigned (Grey)
- comment_added (Info - Blue)
- attachment_added (Info - Blue)
- status_changed (Primary - Blue)
- updated (Grey)

---

### 5. SLAIndicator.tsx
**Location:** `apps/frontend/components/job-ticket/SLAIndicator.tsx`

**Purpose:** Visual SLA status indicator with progress bar.

**Features:**
- Color-coded status chips
- Linear progress bar
- Remaining time calculation
- Six status states
- Thai language labels

**Props:**
```typescript
interface SLAIndicatorProps {
  sla: {
    dueDate: string;
    breached: boolean;
    remainingHours?: number;
    completedAt?: string;
  };
}
```

**Status States:**
1. **on_track** (Green): More than 48 hours remaining
2. **warning** (Orange): 24-48 hours remaining
3. **critical** (Red): Less than 24 hours remaining
4. **breached** (Dark Red): Overdue
5. **completed_on_time** (Dark Green): Completed before deadline
6. **completed_breached** (Dark Red): Completed after deadline

---

## Integration

### Inspector Dashboard
**Location:** `apps/frontend/pages/inspector/dashboard.tsx`

**Changes:**
- Added JobDetailModal import
- Added state management for job assignments
- Created job assignment fetch function
- Updated table to display job assignments
- Added "View Details" button for each job
- Integrated modal with job update callback

**New Features:**
- Job listing by status (Pending, In Progress, Completed)
- Quick access to job details
- Real-time updates after actions
- Status and type labels with color coding

---

## Migration Script

### migrate-job-assignments.js
**Location:** `apps/backend/scripts/migrate-job-assignments.js`

**Purpose:** Migrate existing job assignments to include new fields.

**Features:**
- Dry run mode for preview
- Backward compatibility
- Automatic SLA calculation
- History reconstruction from timestamps
- Error handling and rollback

**Usage:**
```bash
# Dry run (preview changes)
DRY_RUN=true node apps/backend/scripts/migrate-job-assignments.js

# Apply migration
node apps/backend/scripts/migrate-job-assignments.js
```

**Migrated Fields:**
- `jobType`: Determined from existing inspection type
- `comments`: Empty array
- `attachments`: Empty array
- `completionEvidence`: null
- `sla`: Calculated from creation date and scheduled date
- `history`: Reconstructed from existing timestamps
- `relatedEntities`: Extracted from existing fields
- `notifications`: Initial state based on SLA

---

## API Endpoints Used

All components interact with the backend through these endpoints:

### Job Details
- `GET /api/job-assignments/:id` - Fetch job details

### Actions
- `PUT /api/job-assignments/:id/accept` - Accept job
- `PUT /api/job-assignments/:id/start` - Start job
- `PUT /api/job-assignments/:id/complete` - Complete job

### Comments
- `POST /api/job-assignments/:id/comments` - Add comment
- `GET /api/job-assignments/:id/comments` - Get comments

### Attachments
- `POST /api/job-assignments/:id/attachments` - Upload attachment
- `GET /api/job-assignments/:id/attachments` - Get attachments

### History
- `GET /api/job-assignments/:id/history` - Get history

### Listing
- `GET /api/job-assignments?assignedTo={id}&status={statuses}` - List jobs

---

## Styling & Theme

All components use Material-UI (MUI) v5 with:
- Thai language labels
- Consistent color palette
- Responsive design (mobile-friendly)
- Loading and error states
- Skeleton loaders for better UX

**Color Palette:**
- Primary: Blue (#2196f3)
- Secondary: Orange (#ff9800)
- Success: Green (#4caf50)
- Warning: Orange (#ff9800)
- Error: Red (#f44336)
- Info: Blue (#2196f3)

---

## Dependencies

**Required packages:**
- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `date-fns` - Date formatting
- `next` - React framework
- `react` - Core library

**Note:** This implementation does NOT require `@mui/lab` (removed Timeline dependency).

---

## Testing Checklist

- [ ] Open JobDetailModal with valid job ID
- [ ] Submit comment and verify display
- [ ] Upload file and verify download
- [ ] View history timeline
- [ ] Check SLA indicator colors
- [ ] Accept job from modal
- [ ] Start job from modal
- [ ] Complete job from modal
- [ ] Close modal and verify dashboard refresh
- [ ] Test on mobile viewport
- [ ] Run migration script in dry-run mode
- [ ] Apply migration and verify data

---

## Next Steps (Step 6)

After completing Step 5 (Frontend Components), proceed to:
- **Step 6:** Run migration script on production data
- **Step 7:** Deploy frontend components
- **Step 8:** User acceptance testing (UAT)
- **Step 9:** Monitor for issues and gather feedback

---

## Known Issues & Limitations

1. **File Upload:** Currently uses FormData, may need S3/cloud storage integration
2. **Lint Warnings:** Minor formatting issues, safe to ignore or fix later
3. **@mui/lab:** Removed dependency, using custom timeline implementation
4. **Real-time Updates:** Uses polling, consider Socket.IO for true real-time

---

## Support

For questions or issues:
1. Check backend API routes documentation
2. Review component props and usage examples
3. Test with dry-run migration first
4. Monitor browser console for errors

---

**Status:** ✅ COMPLETED
**Date:** 2025-11-02
**Version:** 1.0.0
