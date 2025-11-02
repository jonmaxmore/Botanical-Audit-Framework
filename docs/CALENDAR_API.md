# Calendar API Documentation

## Overview

The Calendar API provides endpoints for managing calendar events, inspector availability, and booking inspections. It supports Google Calendar integration for seamless synchronization.

**Base URL:** `/api/calendar`

**Authentication:** All endpoints require Bearer token authentication.

---

## Event Management

### Create Event

Creates a new calendar event.

**Endpoint:** `POST /events`

**Authorization:** Staff or Inspector roles

**Request Body:**
```json
{
  "title": "Farm Inspection",
  "description": "GACP certification inspection",
  "eventType": "INSPECTION",
  "startTime": "2025-11-05T09:00:00Z",
  "endTime": "2025-11-05T11:00:00Z",
  "location": {
    "type": "FARM",
    "address": "123 Farm Road, Chiang Mai"
  },
  "attendees": [
    {
      "userId": "farmer123",
      "role": "FARMER",
      "rsvpStatus": "PENDING"
    }
  ],
  "reminders": [
    {
      "type": "EMAIL",
      "minutesBefore": 1440
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "title": "Farm Inspection",
    "status": "SCHEDULED",
    "hasConflict": false,
    "createdAt": "2025-11-02T10:00:00Z"
  }
}
```

---

### Get Events

Retrieves events with optional filters.

**Endpoint:** `GET /events`

**Query Parameters:**
- `startDate` (optional): Filter events starting from this date
- `endDate` (optional): Filter events ending before this date
- `userId` (optional): Filter by user ID
- `eventType` (optional): Filter by event type (INSPECTION, MEETING, etc.)
- `status` (optional): Filter by status (SCHEDULED, CONFIRMED, etc.)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "title": "Farm Inspection",
      "eventType": "INSPECTION",
      "startTime": "2025-11-05T09:00:00Z",
      "status": "SCHEDULED"
    }
  ]
}
```

---

### Get Single Event

Retrieves a specific event by ID.

**Endpoint:** `GET /events/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "title": "Farm Inspection",
    "description": "GACP certification inspection",
    "eventType": "INSPECTION",
    "startTime": "2025-11-05T09:00:00Z",
    "endTime": "2025-11-05T11:00:00Z",
    "organizer": {
      "userId": "inspector123",
      "role": "INSPECTOR"
    },
    "attendees": [...],
    "location": {...},
    "status": "SCHEDULED"
  }
}
```

---

### Update Event

Updates an existing event.

**Endpoint:** `PUT /events/:id`

**Authorization:** Must be event organizer or admin

**Request Body:**
```json
{
  "title": "Updated Title",
  "startTime": "2025-11-05T10:00:00Z",
  "status": "CONFIRMED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "title": "Updated Title",
    "updatedAt": "2025-11-02T10:30:00Z"
  }
}
```

---

### Delete Event

Soft deletes an event.

**Endpoint:** `DELETE /events/:id`

**Authorization:** Must be event organizer or admin

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Availability & Booking

### Get Available Slots

Retrieves available time slots for an inspector.

**Endpoint:** `GET /availability/:inspectorId`

**Query Parameters:**
- `startDate` (required): Start date for availability check
- `endDate` (required): End date for availability check
- `duration` (required): Required duration in minutes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "start": "2025-11-05T09:00:00Z",
      "end": "2025-11-05T11:00:00Z",
      "inspectorId": "inspector123"
    },
    {
      "start": "2025-11-05T13:00:00Z",
      "end": "2025-11-05T15:00:00Z",
      "inspectorId": "inspector123"
    }
  ]
}
```

---

### Book Inspection

Books an inspection appointment.

**Endpoint:** `POST /bookings/inspection`

**Request Body:**
```json
{
  "inspectorId": "inspector123",
  "startTime": "2025-11-05T09:00:00Z",
  "endTime": "2025-11-05T11:00:00Z",
  "farmId": "farm123",
  "applicationId": "app123",
  "purpose": "GACP certification inspection",
  "specialRequirements": "Need translator",
  "contactPerson": "John Doe",
  "contactPhone": "081-234-5678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "eventType": "INSPECTION",
    "status": "SCHEDULED",
    "bookingConfirmed": true
  }
}
```

---

## Event Actions

### Confirm Event

Confirms a scheduled event (Inspector only).

**Endpoint:** `PUT /events/:id/confirm`

**Authorization:** Inspector role

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "status": "CONFIRMED"
  }
}
```

---

### Cancel Event

Cancels an event.

**Endpoint:** `PUT /events/:id/cancel`

**Request Body:**
```json
{
  "reason": "Weather conditions"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "status": "CANCELLED"
  }
}
```

---

### Complete Event

Marks an event as completed (Inspector only).

**Endpoint:** `PUT /events/:id/complete`

**Authorization:** Inspector role

**Request Body:**
```json
{
  "notes": "Inspection completed successfully",
  "result": "PASSED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "event123",
    "status": "COMPLETED"
  }
}
```

---

## Utilities

### Check Conflicts

Checks for scheduling conflicts.

**Endpoint:** `GET /conflicts/:userId`

**Query Parameters:**
- `startTime` (required): Start time to check
- `endTime` (required): End time to check
- `excludeEventId` (optional): Event ID to exclude from conflict check

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "event456",
      "title": "Existing Meeting",
      "startTime": "2025-11-05T10:00:00Z",
      "endTime": "2025-11-05T12:00:00Z"
    }
  ]
}
```

---

### Get Upcoming Events

Retrieves upcoming events for current user.

**Endpoint:** `GET /upcoming`

**Query Parameters:**
- `days` (optional, default: 7): Number of days ahead to fetch

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "event123",
      "title": "Farm Inspection",
      "startTime": "2025-11-05T09:00:00Z",
      "isUpcoming": true
    }
  ]
}
```

---

## Google Calendar Integration

### Get OAuth Authorization URL

Retrieves Google OAuth authorization URL.

**Endpoint:** `GET /google/auth`

**Authorization:** Inspector role

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

---

### Enable Google Sync

Enables Google Calendar synchronization.

**Endpoint:** `POST /google/sync/enable`

**Authorization:** Inspector role

**Request Body:**
```json
{
  "code": "oauth-authorization-code",
  "calendarId": "primary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google Calendar sync enabled",
  "data": {
    "syncEnabled": true,
    "calendarId": "primary"
  }
}
```

---

### Disable Google Sync

Disables Google Calendar synchronization.

**Endpoint:** `POST /google/sync/disable`

**Authorization:** Inspector role

**Response:**
```json
{
  "success": true,
  "message": "Google Calendar sync disabled"
}
```

---

### Trigger Manual Sync

Triggers immediate sync with Google Calendar.

**Endpoint:** `POST /google/sync/now`

**Authorization:** Inspector role

**Response:**
```json
{
  "success": true,
  "message": "Sync completed",
  "data": {
    "eventsImported": 5,
    "eventsExported": 3,
    "syncedAt": "2025-11-02T10:00:00Z"
  }
}
```

---

### Get Sync Status

Retrieves Google Calendar sync status.

**Endpoint:** `GET /google/sync/status`

**Authorization:** Inspector role

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "syncStatus": "active",
    "lastSyncAt": "2025-11-02T09:00:00Z",
    "nextSyncAt": "2025-11-02T10:00:00Z",
    "syncDirection": "bidirectional",
    "eventsCount": 15
  }
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Scheduling conflict detected
- `500 Internal Server Error`: Server error

---

## Event Types

- `INSPECTION`: Farm inspection
- `MEETING`: Meeting or consultation
- `TRAINING`: Training session
- `REVIEW`: Document or process review
- `BREAK`: Inspector break time
- `BLOCKED`: Time blocked (unavailable)
- `OTHER`: Other event types

## Event Statuses

- `SCHEDULED`: Event scheduled
- `CONFIRMED`: Event confirmed by inspector
- `CANCELLED`: Event cancelled
- `COMPLETED`: Event completed
- `NO_SHOW`: Attendee did not show up

## Location Types

- `ONLINE`: Online meeting (video call)
- `FARM`: On-site at farm
- `OFFICE`: At office location
