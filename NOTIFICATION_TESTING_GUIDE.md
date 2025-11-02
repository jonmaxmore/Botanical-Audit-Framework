# Notification System Testing Guide

## ✅ สรุปสิ่งที่ทำเสร็จ

### Backend Infrastructure
- ✅ Notification Model (apps/backend/models/Notification.js)
  - 27 notification types
  - 4 priority levels (low, medium, high, urgent)
  - Related entity tracking
  - Multi-channel delivery support
  
- ✅ REST API Endpoints (apps/backend/routes/notification.js)
  - GET /api/notifications - List notifications
  - GET /api/notifications/:id - Get notification detail
  - GET /api/notifications/unread-count - Get unread count
  - PUT /api/notifications/:id/read - Mark as read
  - PUT /api/notifications/read-all - Mark all as read
  - DELETE /api/notifications/:id - Delete notification
  - GET /api/notifications/preferences - Get preferences
  - PUT /api/notifications/preferences - Update preferences
  
- ✅ Socket.io Real-time Service (apps/backend/services/realtime.service.js)
  - Real-time notification delivery
  - User room management
  - Unread count updates
  - System announcements
  
- ✅ Email Service (apps/backend/services/email.service.js)
  - Email delivery with templates
  - Thai language support
  - Development mode logging

### Frontend Components
- ✅ NotificationBell (apps/frontend/components/notifications/NotificationBell.tsx)
  - Header badge with unread count
  - Real-time updates via Socket.io
  - Quick notification preview
  
- ✅ Notifications Page (apps/frontend/pages/notifications/index.tsx)
  - Full notification management interface
  - Filters (read/unread, priority, type)
  - Pagination
  - Bulk actions (mark all read, delete all)
  - Statistics cards

### Notification Triggers (9 total)
- ✅ Application Workflow (apps/backend/routes/applications.js)
  1. application_submitted - When application is submitted
  2. application_approved - When application is approved
  3. application_rejected - When application is rejected  
  4. application_revision_required - When revision is required
  5. inspection_scheduled - When inspection is scheduled
  6. certificate_issued - When certificate is issued
  
- ✅ Document Management (apps/backend/routes/document.js)
  7. document_approved - When document is approved
  8. document_rejected - When document is rejected
  
- ✅ Payment System (apps/backend/routes/payment.routes.js)
  9. payment_required - When payment is created
  10. payment_received - When payment is completed
  
- ✅ Inspection (apps/backend/routes/inspection.js)
  11. inspection_completed - When inspection is finished

---

## 🧪 Manual Testing Checklist

### 1. Database & Model Testing

```bash
# Connect to MongoDB and verify Notification collection
mongosh gacp-dev

# Check notifications
db.notifications.find().limit(5).pretty()

# Count by type
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])

# Check unread notifications
db.notifications.countDocuments({ isRead: false })
```

### 2. API Endpoint Testing (using curl or Postman)

```bash
# Get auth token first
TOKEN="your-jwt-token-here"

# 1. Get all notifications
curl -X GET "http://localhost:3001/api/notifications" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get unread count
curl -X GET "http://localhost:3001/api/notifications/unread-count" \
  -H "Authorization: Bearer $TOKEN"

# 3. Mark notification as read
curl -X PUT "http://localhost:3001/api/notifications/{notificationId}/read" \
  -H "Authorization: Bearer $TOKEN"

# 4. Mark all as read
curl -X PUT "http://localhost:3001/api/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get notification preferences
curl -X GET "http://localhost:3001/api/notifications/preferences" \
  -H "Authorization: Bearer $TOKEN"

# 6. Update preferences
curl -X PUT "http://localhost:3001/api/notifications/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": true, "realtime": true}'

# 7. Delete notification
curl -X DELETE "http://localhost:3001/api/notifications/{notificationId}" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Socket.io Real-time Testing

**Test in Browser Console:**

```javascript
// Connect to Socket.io
const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('token'),
    userId: JSON.parse(localStorage.getItem('user'))._id
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('✓ Connected to notification server');
});

// Listen for new notifications
socket.on('notification:new', (data) => {
  console.log('✓ New notification received:', data);
});

// Listen for unread count updates
socket.on('notification:unread-count', (data) => {
  console.log('✓ Unread count update:', data.count);
});

// Listen for system announcements
socket.on('system:announcement', (data) => {
  console.log('✓ System announcement:', data);
});

// Check connection errors
socket.on('connect_error', (error) => {
  console.error('✗ Connection error:', error);
});
```

### 4. Notification Trigger Testing

**Test each workflow trigger:**

```javascript
// 1. Test Application Submission
// Action: Submit a new application
// Expected: Receive "application_submitted" notification

// 2. Test Application Review
// Action: Admin approves/rejects application
// Expected: Receive "application_approved" or "application_rejected" notification

// 3. Test Inspection Scheduling
// Action: Admin schedules an inspection
// Expected: Receive "inspection_scheduled" notification

// 4. Test Certificate Issuance
// Action: System issues certificate
// Expected: Receive "certificate_issued" notification

// 5. Test Document Approval
// Action: Admin approves document
// Expected: Receive "document_approved" notification

// 6. Test Document Rejection
// Action: Admin rejects document
// Expected: Receive "document_rejected" notification

// 7. Test Payment Required
// Action: Create payment requirement
// Expected: Receive "payment_required" notification

// 8. Test Payment Received
// Action: Complete payment
// Expected: Receive "payment_received" notification

// 9. Test Inspection Completion
// Action: Inspector completes inspection
// Expected: Receive "inspection_completed" notification
```

### 5. Email Service Testing

**Check email logs in development mode:**

```bash
# View backend console logs for email delivery
# Emails will be logged to console in development mode

# Look for lines like:
[Email Service] Email logged (dev mode): Test Notification
```

### 6. Frontend Component Testing

**Test NotificationBell:**
1. Login to application
2. Check notification bell icon in header
3. Verify badge shows unread count
4. Click bell to see notification dropdown
5. Verify notifications appear in dropdown
6. Click "ดูทั้งหมด" to go to full page

**Test Notifications Page:**
1. Navigate to /notifications
2. Verify all notifications load
3. Test filters (All, Unread, Priority)
4. Test "Mark all as read" button
5. Test individual notification actions
6. Verify pagination works
7. Check statistics cards display correctly

### 7. User Preferences Testing

**Test notification preferences:**
1. Go to notification preferences
2. Toggle email notifications off
3. Trigger a notification
4. Verify email is NOT sent
5. Toggle email notifications on
6. Trigger a notification
7. Verify email IS sent

### 8. Performance Testing

```bash
# Create 100 test notifications
for i in {1..100}; do
  curl -X POST "http://localhost:3001/api/notifications/test" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Test $i\", \"message\": \"Performance test\"}"
done

# Verify pagination handles large datasets
curl "http://localhost:3001/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Expected Results

### ✅ All Tests Should Pass:
- [x] Notification model creates/reads/updates/deletes successfully
- [x] All 9 notification triggers fire correctly
- [x] REST API endpoints return expected data
- [x] Socket.io delivers notifications in real-time
- [x] Email service logs emails in dev mode
- [x] Frontend NotificationBell updates in real-time
- [x] Notifications page displays and filters correctly
- [x] User preferences are respected
- [x] Bulk operations perform well
- [x] No console errors in browser
- [x] No server errors in backend logs

---

## 🐛 Common Issues & Solutions

### Issue: Notifications not received in real-time
**Solution:** 
- Check Socket.io connection in browser console
- Verify backend Socket.io service is initialized
- Check firewall/CORS settings

### Issue: Email not sending
**Solution:**
- In development, emails are logged, not sent
- Check backend console for email logs
- For production, configure SMTP settings in .env

### Issue: Unread count not updating
**Solution:**
- Verify Socket.io connection
- Check realtime.service.js is emitting unread-count event
- Refresh browser to reset state

### Issue: Duplicate notifications
**Solution:**
- Check trigger code doesn't call createAndSend() twice
- Verify MongoDB unique indexes
- Check for multiple Socket.io connections

---

## 📈 Success Metrics

**Notification System is considered FULLY TESTED when:**
- ✅ All 9 notification triggers tested manually
- ✅ Socket.io real-time delivery verified
- ✅ Email service tested (dev mode logs)
- ✅ Frontend components display notifications correctly
- ✅ User preferences work as expected
- ✅ Bulk operations perform efficiently
- ✅ No errors in browser console or server logs
- ✅ All REST API endpoints return correct data
- ✅ Documentation is complete

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. ✅ Mark Feature 2 as 100% complete
2. 🚀 Move to Feature 3: Analytics Dashboard
3. 📝 Update project documentation
4. 🎉 Celebrate successful implementation!

---

## 📝 Testing Log

### Test Session: [Date]
**Tester:** [Your Name]

#### Results:
- [ ] Database & Model: ⬜ Pass / ⬜ Fail
- [ ] REST API Endpoints: ⬜ Pass / ⬜ Fail  
- [ ] Socket.io Real-time: ⬜ Pass / ⬜ Fail
- [ ] Email Service: ⬜ Pass / ⬜ Fail
- [ ] Notification Triggers: ⬜ Pass / ⬜ Fail
- [ ] Frontend Components: ⬜ Pass / ⬜ Fail
- [ ] User Preferences: ⬜ Pass / ⬜ Fail
- [ ] Performance: ⬜ Pass / ⬜ Fail

#### Notes:
```
[Add testing notes here]
```

#### Issues Found:
```
[List any issues discovered during testing]
```
