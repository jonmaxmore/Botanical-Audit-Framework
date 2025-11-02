# Calendar System Integration Guide

## Overview

This guide explains how to integrate the Calendar System into new pages, use calendar components, and work with the calendar API in your application.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  - CalendarView (main calendar)                             │
│  - EventModal (create/edit dialog)                          │
│  - BookingForm (3-step wizard)                              │
│  - AvailabilityPicker (time slot selection)                 │
│  - SyncSettings (Google sync config)                        │
│  - CalendarWidget (dashboard widget)                        │
├─────────────────────────────────────────────────────────────┤
│  API Service: calendarApi.ts                                │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Routes: calendar.routes.js (22 endpoints)                  │
│  ├─ Event Management                                        │
│  ├─ Availability & Booking                                  │
│  ├─ Google Calendar Integration                             │
│  └─ Utilities                                               │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                  │
│  - CalendarService (business logic)                         │
│  - GoogleCalendarService (OAuth + sync)                     │
│  - CalendarNotificationService (notifications)              │
├─────────────────────────────────────────────────────────────┤
│  Models:                                                    │
│  - CalendarEvent                                            │
│  - InspectorAvailability                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Integration

### CalendarView Component

**Purpose:** Full-featured calendar with month/week/day/list views

**Import:**
```typescript
import { CalendarView } from '@/components/calendar';
```

**Basic Usage:**
```tsx
<CalendarView
  userId={currentUser._id}
  userRole={currentUser.role}
  onEventClick={(event) => console.log('Event clicked:', event)}
  onSlotClick={(date) => console.log('Date clicked:', date)}
/>
```

**Props:**
```typescript
interface CalendarViewProps {
  userId: string;              // Current user ID
  userRole: 'FARMER' | 'INSPECTOR' | 'STAFF'; // User role
  initialView?: 'month' | 'week' | 'day' | 'list'; // Default: 'month'
  onEventClick?: (event: CalendarEvent) => void; // Event click handler
  onSlotClick?: (date: Date) => void; // Empty slot click handler
  height?: string;              // Calendar height (default: '600px')
  editable?: boolean;           // Enable drag-and-drop (default: true)
  readOnly?: boolean;           // Read-only mode (default: false)
}
```

**Features:**
- Multiple view modes (month, week, day, list)
- Drag-and-drop rescheduling
- Color-coded events by type
- Conflict detection indicators
- Responsive design
- Touch support for mobile

**Example: Inspector Schedule Page**
```tsx
import { CalendarView } from '@/components/calendar';
import { useState } from 'react';

export default function InspectorSchedulePage() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <Box>
      <Typography variant="h4">My Schedule</Typography>
      <CalendarView
        userId={user._id}
        userRole="INSPECTOR"
        onEventClick={setSelectedEvent}
        editable={true}
        height="700px"
      />
    </Box>
  );
}
```

---

### EventModal Component

**Purpose:** Dialog for creating/editing events

**Import:**
```typescript
import { EventModal } from '@/components/calendar';
```

**Usage:**
```tsx
<EventModal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleSaveEvent}
  event={selectedEvent}
  mode="create"
  userRole="INSPECTOR"
/>
```

**Props:**
```typescript
interface EventModalProps {
  open: boolean;                // Dialog open state
  onClose: () => void;          // Close handler
  onSave: (event: CalendarEvent) => void; // Save handler
  event?: CalendarEvent;        // Event to edit (optional)
  mode: 'create' | 'edit';      // Modal mode
  userRole: UserRole;           // Current user role
  defaultStartTime?: Date;      // Pre-filled start time
  defaultEndTime?: Date;        // Pre-filled end time
}
```

**Features:**
- Form validation
- Conflict detection
- Attendee management
- Reminder configuration
- Location input (online/farm/office)
- Event type selection

**Example: Create Event Button**
```tsx
import { EventModal } from '@/components/calendar';
import { useState } from 'react';
import { Button } from '@mui/material';

export default function CreateEventButton() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const handleSave = async (eventData) => {
    try {
      await calendarApi.createEvent(eventData);
      setOpen(false);
      // Refresh calendar
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Create Event
      </Button>
      <EventModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        mode="create"
        userRole={user.role}
      />
    </>
  );
}
```

---

### BookingForm Component

**Purpose:** 3-step wizard for farmers to book inspections

**Import:**
```typescript
import { BookingForm } from '@/components/calendar';
```

**Usage:**
```tsx
<BookingForm
  open={isBookingOpen}
  onClose={() => setIsBookingOpen(false)}
  onSuccess={handleBookingSuccess}
  farmId={user.farmId}
/>
```

**Props:**
```typescript
interface BookingFormProps {
  open: boolean;                // Dialog open state
  onClose: () => void;          // Close handler
  onSuccess: (event: CalendarEvent) => void; // Success callback
  farmId: string;               // Farmer's farm ID
  applicationId?: string;       // Pre-selected application
}
```

**Steps:**
1. Select Inspector
2. Choose Time Slot
3. Provide Details

**Example: Farmer Booking Page**
```tsx
import { BookingForm } from '@/components/calendar';
import { useState } from 'react';

export default function FarmerBookingPage() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.push('/farmer/dashboard');
  };

  return (
    <Box>
      <Button onClick={() => setOpen(true)}>
        Book Inspection
      </Button>
      <BookingForm
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
        farmId={user.farmId}
      />
    </Box>
  );
}
```

---

### CalendarWidget Component

**Purpose:** Dashboard widget showing upcoming events

**Import:**
```typescript
import { CalendarWidget } from '@/components/calendar';
```

**Usage:**
```tsx
<CalendarWidget
  inspectorId={user._id}
  onCreateEvent={() => router.push('/inspector/schedule')}
/>
```

**Props:**
```typescript
interface CalendarWidgetProps {
  inspectorId: string;          // Inspector user ID
  onCreateEvent?: () => void;   // Create event handler
  maxHeight?: string;           // Max widget height (default: '300px')
  days?: number;                // Days ahead to show (default: 7)
}
```

**Features:**
- Shows next 7 days
- Conflict indicators
- Color-coded events
- Refresh button
- "View All" link

**Example: Dashboard Integration**
```tsx
import { CalendarWidget } from '@/components/calendar';
import { useRouter } from 'next/router';

export default function InspectorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <CalendarWidget
          inspectorId={user._id}
          onCreateEvent={() => router.push('/inspector/schedule')}
          days={7}
        />
      </Grid>
      {/* Other dashboard content */}
    </Grid>
  );
}
```

---

### AvailabilityPicker Component

**Purpose:** Time slot selection by period (morning/afternoon/evening)

**Import:**
```typescript
import { AvailabilityPicker } from '@/components/calendar';
```

**Usage:**
```tsx
<AvailabilityPicker
  date={selectedDate}
  availableSlots={slots}
  onSlotSelect={handleSlotSelect}
  duration={120}
/>
```

**Props:**
```typescript
interface AvailabilityPickerProps {
  date: Date;                   // Selected date
  availableSlots: TimeSlot[];   // Available slots
  onSlotSelect: (slot: TimeSlot) => void; // Slot selection handler
  duration: number;             // Required duration in minutes
  selectedSlot?: TimeSlot;      // Currently selected slot
}
```

---

### SyncSettings Component

**Purpose:** Google Calendar sync configuration

**Import:**
```typescript
import { SyncSettings } from '@/components/calendar';
```

**Usage:**
```tsx
<SyncSettings
  inspectorId={user._id}
  onSettingsChange={handleSettingsChange}
/>
```

**Props:**
```typescript
interface SyncSettingsProps {
  inspectorId: string;          // Inspector user ID
  onSettingsChange?: (settings: SyncSettings) => void; // Settings change handler
}
```

**Features:**
- Enable/disable sync
- Sync direction selection
- Calendar selection
- Sync frequency configuration
- Manual sync trigger

---

## API Service Integration

### Import API Service

```typescript
import { calendarApi } from '@/services/calendarApi';
```

### Available Methods

#### Event Management

```typescript
// Create event
const event = await calendarApi.createEvent({
  title: 'Farm Inspection',
  eventType: 'INSPECTION',
  startTime: '2025-11-05T09:00:00Z',
  endTime: '2025-11-05T11:00:00Z',
  // ... other fields
});

// Get events with filters
const events = await calendarApi.getEvents({
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  userId: 'user123',
  eventType: 'INSPECTION',
});

// Get single event
const event = await calendarApi.getEvent('event123');

// Update event
const updated = await calendarApi.updateEvent('event123', {
  title: 'Updated Title',
});

// Delete event
await calendarApi.deleteEvent('event123');
```

#### Availability & Booking

```typescript
// Get available slots
const slots = await calendarApi.getAvailableSlots(
  'inspector123',
  '2025-11-05',
  '2025-11-10',
  120 // duration in minutes
);

// Book inspection
const booking = await calendarApi.bookInspection({
  inspectorId: 'inspector123',
  startTime: '2025-11-05T09:00:00Z',
  endTime: '2025-11-05T11:00:00Z',
  farmId: 'farm123',
  applicationId: 'app123',
  purpose: 'GACP certification',
});
```

#### Event Actions

```typescript
// Confirm event
await calendarApi.confirmEvent('event123');

// Cancel event
await calendarApi.cancelEvent('event123', {
  reason: 'Weather conditions',
});

// Complete event
await calendarApi.completeEvent('event123', {
  notes: 'Inspection completed',
  result: 'PASSED',
});
```

#### Utilities

```typescript
// Check conflicts
const conflicts = await calendarApi.checkConflicts(
  'user123',
  '2025-11-05T09:00:00Z',
  '2025-11-05T11:00:00Z',
  'event456' // exclude this event
);

// Get upcoming events
const upcoming = await calendarApi.getUpcomingEvents(7); // next 7 days
```

#### Google Calendar Integration

```typescript
// Get OAuth URL
const { authUrl } = await calendarApi.getGoogleAuthUrl();
window.location.href = authUrl;

// Enable sync (after OAuth callback)
await calendarApi.enableGoogleSync(oauthCode, 'primary');

// Disable sync
await calendarApi.disableGoogleSync();

// Manual sync
const result = await calendarApi.triggerManualSync();
console.log(`Imported: ${result.eventsImported}, Exported: ${result.eventsExported}`);

// Get sync status
const status = await calendarApi.getSyncStatus();
console.log(status.syncStatus); // 'active' | 'inactive' | 'error'
```

---

## Backend Integration

### Using CalendarService

**Import:**
```javascript
const CalendarService = require('../services/calendar.service');
const calendarService = new CalendarService(notificationService);
```

**Methods:**

```javascript
// Create event
const event = await calendarService.createEvent({
  title: 'Farm Inspection',
  eventType: 'INSPECTION',
  organizer: { userId: 'inspector123', role: 'INSPECTOR' },
  // ... other fields
});

// Get available slots
const slots = await calendarService.getAvailableSlots(
  'inspector123',
  new Date('2025-11-05'),
  new Date('2025-11-10'),
  120 // duration
);

// Book inspection
const booking = await calendarService.bookInspection({
  inspectorId: 'inspector123',
  startTime: new Date('2025-11-05T09:00:00Z'),
  endTime: new Date('2025-11-05T11:00:00Z'),
  farmId: 'farm123',
  // ... other fields
});

// Update event
const updated = await calendarService.updateEvent(
  'event123',
  'user123',
  { title: 'Updated Title' }
);

// Delete event (soft delete)
await calendarService.deleteEvent('event123', 'user123');
```

---

### Using GoogleCalendarService

**Import:**
```javascript
const GoogleCalendarService = require('../services/google-calendar.service');
```

**Methods:**

```javascript
// Get OAuth URL
const authUrl = GoogleCalendarService.getAuthUrl('inspector123');

// Exchange code for tokens
const tokens = await GoogleCalendarService.getTokensFromCode(
  oauthCode,
  'inspector123'
);

// Create event in Google Calendar
await GoogleCalendarService.createGoogleEvent(
  'inspector123',
  event
);

// Sync calendars
const result = await GoogleCalendarService.syncCalendars('inspector123');
console.log(result); // { imported: 5, exported: 3 }
```

---

### Using CalendarNotificationService

**Import:**
```javascript
const CalendarNotificationService = require('../services/calendar-notification.service');
const notificationService = new CalendarNotificationService(NotificationService);
```

**Methods:**

```javascript
// Send booking confirmation
await notificationService.sendBookingConfirmation(event);

// Send 24h reminder
await notificationService.send24HourReminder(event);

// Send reschedule notification
await notificationService.sendRescheduleNotification(
  event,
  oldStartTime,
  'Weather conditions'
);

// Send cancellation
await notificationService.sendCancellationNotification(
  event,
  'Inspector unavailable'
);

// Send daily summary
await notificationService.sendDailyScheduleSummary(
  'inspector123',
  todayEvents
);

// Send conflict alert
await notificationService.sendConflictAlert(event, conflictingEvents);

// Process reminder queue (cron job)
await notificationService.processReminderQueue();
```

---

## Notification Event Types

Register these in your notification template system:

```javascript
const calendarNotificationTypes = {
  'calendar.booking_confirmed': {
    title: 'การจองได้รับการยืนยัน',
    body: 'การตรวจสอบของคุณได้รับการยืนยันแล้ว',
    channels: ['inapp', 'email', 'sms'],
    priority: 'medium',
  },
  'calendar.booking_pending': {
    title: 'มีการจองใหม่',
    body: 'คุณมีคำขอจองการตรวจสอบใหม่',
    channels: ['inapp', 'email'],
    priority: 'medium',
  },
  'calendar.24h_reminder': {
    title: 'เตือนการตรวจสอบ',
    body: 'คุณมีการตรวจสอบในวันพรุ่งนี้',
    channels: ['email', 'sms', 'line'],
    priority: 'high',
  },
  'calendar.rescheduled': {
    title: 'เลื่อนนัดหมาย',
    body: 'นัดหมายของคุณถูกเลื่อน',
    channels: ['inapp', 'email', 'sms'],
    priority: 'high',
  },
  'calendar.cancelled': {
    title: 'ยกเลิกนัดหมาย',
    body: 'นัดหมายของคุณถูกยกเลิก',
    channels: ['inapp', 'email', 'sms'],
    priority: 'high',
  },
  'calendar.daily_summary': {
    title: 'ตารางงานวันนี้',
    body: 'สรุปการนัดหมายวันนี้',
    channels: ['email'],
    priority: 'medium',
  },
  'calendar.conflict_alert': {
    title: 'พบความขัดแย้งในตาราง',
    body: 'นัดหมายของคุณมีความขัดแย้ง',
    channels: ['inapp', 'email'],
    priority: 'urgent',
  },
};
```

---

## Database Queries

### Find Events by Date Range

```javascript
const events = await CalendarEvent.find({
  startTime: { $gte: startDate, $lte: endDate },
  deletedAt: null,
});
```

### Find Inspector Availability

```javascript
const availability = await InspectorAvailability.findOne({
  userId: inspectorId,
});
```

### Check Conflicts

```javascript
const conflicts = await CalendarEvent.findConflicts(
  userId,
  startTime,
  endTime,
  excludeEventId
);
```

### Get Upcoming Events

```javascript
const events = await CalendarEvent.findUserEvents(
  userId,
  new Date(),
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
);
```

---

## Cron Jobs Setup

### 24h Reminder Job

```javascript
const cron = require('node-cron');
const CalendarNotificationService = require('./services/calendar-notification.service');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running reminder queue...');
  await CalendarNotificationService.processReminderQueue();
});
```

### Daily Summary Job

```javascript
// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Sending daily summaries...');
  
  const inspectors = await User.find({ role: 'INSPECTOR' });
  
  for (const inspector of inspectors) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await CalendarEvent.findUserEvents(
      inspector._id,
      today,
      tomorrow
    );
    
    if (events.length > 0) {
      await CalendarNotificationService.sendDailyScheduleSummary(
        inspector._id,
        events
      );
    }
  }
});
```

---

## Testing Integration

### Unit Tests Example

```javascript
const CalendarService = require('../services/calendar.service');

describe('CalendarService', () => {
  let service;
  let mockNotificationService;

  beforeEach(() => {
    mockNotificationService = {
      sendBookingConfirmation: jest.fn(),
      sendConflictAlert: jest.fn(),
    };
    service = new CalendarService(mockNotificationService);
  });

  it('should create event successfully', async () => {
    const eventData = {
      title: 'Test Event',
      eventType: 'INSPECTION',
      // ... other fields
    };

    const event = await service.createEvent(eventData);

    expect(event).toHaveProperty('_id');
    expect(event.title).toBe('Test Event');
  });
});
```

### Integration Tests Example

```javascript
const request = require('supertest');
const app = require('../app');

describe('Calendar API', () => {
  it('POST /api/calendar/events should create event', async () => {
    const response = await request(app)
      .post('/api/calendar/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Event',
        eventType: 'INSPECTION',
        startTime: '2025-11-05T09:00:00Z',
        endTime: '2025-11-05T11:00:00Z',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
  });
});
```

---

## Environment Variables

Required environment variables:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback

# Calendar Settings
CALENDAR_ADVANCE_BOOKING_DAYS=3
CALENDAR_MAX_DAILY_INSPECTIONS=3
CALENDAR_MIN_INSPECTION_DURATION=60
CALENDAR_SYNC_INTERVAL=15
```

---

## Best Practices

### Frontend

✅ **Do:**
- Use barrel exports (`@/components/calendar`)
- Handle loading and error states
- Validate form inputs client-side
- Use TypeScript interfaces for type safety
- Implement optimistic UI updates
- Cache API responses when appropriate

❌ **Don't:**
- Make API calls in render methods
- Store sensitive data in component state
- Bypass validation
- Ignore error responses

### Backend

✅ **Do:**
- Use services for business logic
- Validate all inputs
- Handle errors gracefully
- Use transactions for multi-step operations
- Log important events
- Rate limit API endpoints

❌ **Don't:**
- Put business logic in routes
- Trust client input
- Expose sensitive data
- Skip authorization checks

---

## Common Integration Patterns

### Pattern 1: Dashboard Integration

```tsx
// Add calendar widget to any dashboard
import { CalendarWidget } from '@/components/calendar';

<Grid container>
  <Grid item xs={12} md={4}>
    <CalendarWidget inspectorId={user._id} />
  </Grid>
</Grid>
```

### Pattern 2: Booking Flow

```tsx
// Add booking button to farmer pages
import { BookingForm } from '@/components/calendar';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Book Inspection</Button>
<BookingForm open={open} onClose={() => setOpen(false)} />
```

### Pattern 3: Schedule Page

```tsx
// Create full schedule page
import { CalendarView, EventModal } from '@/components/calendar';

<CalendarView
  userId={user._id}
  userRole={user.role}
  onEventClick={handleEventClick}
/>
<EventModal open={modalOpen} ... />
```

---

## Support

For integration support, contact:
- Email: dev-support@gacp-platform.com
- Slack: #calendar-integration
- Docs: https://docs.gacp-platform.com/calendar
