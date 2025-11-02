# Calendar System User Guide

## Overview

The Calendar System provides a comprehensive scheduling solution for managing inspections, appointments, and availability in the GACP certification process.

**Key Features:**
- 📅 Inspector availability management
- 📝 Farmer self-service booking
- 🔄 Google Calendar integration
- ⚠️ Conflict detection
- 🔔 Automated reminders (Email, SMS, LINE)
- 📊 Dashboard widgets

---

## For Farmers

### Booking an Inspection

1. **Access Booking Page**
   - From your dashboard, click the **"จองการตรวจสอบ"** button in the header
   - Or navigate to **Farmer Portal → Booking**

2. **Select Inspector** (Step 1 of 3)
   - Browse available inspectors
   - View inspector profiles and certifications
   - Click **"เลือก"** to proceed

3. **Choose Time Slot** (Step 2 of 3)
   - Select desired date
   - View available time slots (green)
   - Unavailable slots shown in gray
   - Duration: 2-3 hours (default)
   - Click on a slot to select

4. **Provide Details** (Step 3 of 3)
   - Farm: Auto-selected from your profile
   - Application: Select from your active applications
   - Purpose: Describe inspection purpose
   - Special Requirements: Optional (e.g., "Need translator")
   - Contact Person: Your name
   - Contact Phone: Your phone number
   - Click **"จองการตรวจสอบ"** to confirm

5. **Confirmation**
   - Success message appears
   - Notification sent to inspector
   - Confirmation email/SMS sent to you
   - You'll be redirected to dashboard

### Viewing Your Schedule

1. **Calendar View**
   - Click **"ดูปฏิทินการตรวจสอบของฉัน"** button
   - View all your inspections and appointments
   - Different colors for different event types:
     - 🔵 Blue: Inspections
     - 🟠 Orange: Meetings
     - 🟣 Purple: Training
     - 🔴 Red: Reviews

2. **Event Details**
   - Click any event to view full details
   - See inspection status (Scheduled/Confirmed/Completed)
   - View inspector information
   - Check location and time

3. **Upcoming Inspections**
   - Dashboard shows next 7 days
   - Quick overview of your schedule
   - Conflict warnings if any

### Booking Guidelines

⚠️ **Important Rules:**
- Book at least **3 days in advance**
- Inspections last **2-3 hours**
- Inspectors have **daily booking limits**
- Choose available time slots only
- Provide accurate contact information
- Confirm farm location is accessible

### Reminders

You'll receive reminders via:
- 📧 Email: 24 hours before inspection
- 📱 SMS: 24 hours before inspection
- 💬 LINE: 24 hours before inspection
- 🔔 In-app: When inspector confirms

### Rescheduling

If you need to reschedule:
1. Contact inspector directly (phone/email)
2. Or contact GACP administrator
3. Provide reason for rescheduling
4. You'll receive new booking confirmation

### Cancellation

To cancel an inspection:
1. Navigate to event details
2. Click **"ยกเลิก"** button
3. Provide cancellation reason
4. Confirm cancellation
5. Notifications sent to all parties

---

## For Inspectors

### Managing Your Availability

1. **Access Calendar Settings**
   - Navigate to **Inspector Dashboard → Schedule**
   - Click **"ตั้งค่าความพร้อม"**

2. **Set Working Hours**
   - Select days of the week
   - Set start and end times for each day
   - Example:
     - Monday: 09:00 - 17:00
     - Tuesday: 09:00 - 17:00
     - Weekend: Closed

3. **Block Time Off**
   - Click **"บล็อกเวลา"**
   - Select date range
   - Choose reason (Vacation, Personal, Training)
   - Add notes if needed
   - Save changes

4. **Set Booking Constraints**
   - Maximum daily inspections: 2-3 (recommended)
   - Minimum inspection duration: 60-180 minutes
   - Advance booking requirement: 2-3 days
   - Break time between inspections: 30-60 minutes

### Google Calendar Integration

**Benefits:**
- Automatic sync with your personal calendar
- Prevent double-booking
- View GACP appointments in Google Calendar
- Get mobile notifications

**Setup Process:**

1. **Enable Integration**
   - Go to **Inspector Dashboard → Schedule**
   - Click **"Google Calendar Settings"**
   - Click **"เชื่อมต่อ Google Calendar"**

2. **Authorization**
   - You'll be redirected to Google login
   - Select your Google account
   - Grant calendar access permissions
   - You'll be redirected back to GACP

3. **Configure Sync**
   - Select calendar: Primary (default) or specific calendar
   - Choose sync direction:
     - **Import Only**: Google → GACP
     - **Export Only**: GACP → Google
     - **Bidirectional**: Both ways (recommended)
   - Set sync frequency: Every 15/30/60 minutes
   - Click **"บันทึก"**

4. **Sync Settings**
   - **Auto-sync**: Enabled by default
   - **Conflict Handling**: Skip conflicting events
   - **Event Visibility**: Public or Private
   - **Reminder Sync**: Sync reminder settings

5. **Manual Sync**
   - Click **"ซิงค์ตอนนี้"** button
   - Wait for sync completion message
   - Check sync status: Events imported/exported

**Troubleshooting:**
- If sync fails, try reconnecting your Google account
- Check Google Calendar API is enabled
- Verify calendar permissions
- Contact admin if issues persist

### Managing Bookings

1. **View Booking Requests**
   - Dashboard shows pending bookings
   - Notification badge on calendar icon
   - Email/SMS notification sent

2. **Confirm Inspection**
   - Click on booking event
   - Review details (farm, location, farmer)
   - Click **"ยืนยัน"** to confirm
   - Or click **"ติดต่อเกษตรกร"** to discuss
   - Farmer receives confirmation notification

3. **Reschedule Request**
   - Click event → **"เลื่อนนัด"**
   - Select new time slot
   - Provide reason for rescheduling
   - Click **"ยืนยันการเลื่อนนัด"**
   - Farmer receives notification with new time

4. **Cancel Inspection**
   - Click event → **"ยกเลิก"**
   - Select reason:
     - Weather conditions
     - Inspector unavailable
     - Farmer request
     - Other (specify)
   - Add notes
   - Confirm cancellation
   - Notifications sent automatically

### Calendar Views

**Month View** (Default)
- Overview of entire month
- Color-coded events
- Conflict indicators (⚠️)
- Click date to see day details

**Week View**
- Detailed weekly schedule
- Time slots visible
- Drag-and-drop to reschedule
- See event duration clearly

**Day View**
- Hour-by-hour schedule
- Detailed timeline
- See all event details
- Manage breaks and gaps

**List View**
- Chronological event list
- Filter by type, status
- Quick search
- Bulk actions

### Dashboard Widget

Your dashboard shows:
- **Upcoming 7 Days**: Next week's schedule
- **Today's Events**: Current day highlight
- **Conflict Warnings**: Red border + ⚠️ icon
- **Quick Actions**:
  - 🔄 Refresh
  - ➕ Create new event
  - 📅 View full calendar

### Conflict Detection

System automatically detects:
- ⚠️ **Overlapping Events**: Two events at same time
- ⚠️ **Daily Limit Exceeded**: Too many inspections in one day
- ⚠️ **Outside Working Hours**: Event scheduled during time off
- ⚠️ **Too Close**: Insufficient break between events

When conflict detected:
1. Warning displayed when creating event
2. Red border on conflicting events
3. Email alert sent
4. Dashboard shows conflict count

### Completing Inspections

1. **Mark as Completed**
   - Click completed inspection
   - Click **"ทำเสร็จ"** button
   - Add completion notes
   - Select result: PASSED / FAILED / PENDING
   - Upload inspection report (optional)

2. **Follow-up Actions**
   - Link to job ticket
   - Generate certificate (if passed)
   - Schedule follow-up (if needed)
   - Close inspection workflow

### Notifications You'll Receive

- 📧 **New Booking**: When farmer books inspection
- ✅ **Booking Confirmed**: When you confirm booking
- ⏰ **24h Reminder**: Day before inspection
- 🔔 **Morning Summary**: Daily schedule at 8:00 AM
- ⚠️ **Conflict Alert**: When scheduling conflict detected
- ❌ **Cancellation**: When booking is cancelled

### Daily Routine

**Morning (8:00 AM)**
1. Receive daily schedule summary email
2. Check dashboard widget for today's events
3. Confirm any pending bookings
4. Review locations and prepare

**During Day**
1. Receive 24h reminders for tomorrow
2. Check for new booking requests
3. Update event statuses as you complete them
4. Add notes to completed inspections

**Evening**
1. Mark completed inspections
2. Plan next day's route
3. Block time if needed
4. Review tomorrow's schedule

---

## Common Scenarios

### Scenario 1: Farmer Books Inspection

**Farmer's Flow:**
1. Click "จองการตรวจสอบ"
2. Select inspector from list
3. Choose available time slot
4. Fill in details and confirm
5. Receive confirmation notification

**Inspector's Flow:**
1. Receive booking notification
2. Review booking details in calendar
3. Check farm location and access
4. Confirm or contact farmer
5. Prepare for inspection

### Scenario 2: Conflict Detected

**What Happens:**
1. System detects time overlap
2. Warning displayed when creating event
3. Event marked with ⚠️ icon
4. Email alert sent to inspector
5. Dashboard shows conflict count

**Resolution:**
1. Inspector reviews conflicting events
2. Reschedules one event
3. Farmer receives notification
4. Conflict automatically resolved

### Scenario 3: Google Sync Issue

**Symptoms:**
- Events not appearing in Google Calendar
- Sync status shows error
- Last sync time not updating

**Solutions:**
1. Click "ซิงค์ตอนนี้" to force sync
2. Check sync status for error messages
3. Try disconnecting and reconnecting Google account
4. Verify Google Calendar API access
5. Contact admin if unresolved

### Scenario 4: Need to Cancel

**Farmer Cancels:**
1. Farmer contacts inspector or admin
2. Admin cancels booking with reason
3. Inspector receives notification
4. Time slot becomes available again

**Inspector Cancels:**
1. Inspector clicks event → "ยกเลิก"
2. Selects reason (weather, emergency)
3. Adds notes for farmer
4. Confirms cancellation
5. Farmer receives notification
6. Farmer can rebook

---

## Best Practices

### For Farmers

✅ **Do:**
- Book at least 3 days in advance
- Provide accurate contact information
- Confirm farm is accessible
- Be present during inspection
- Prepare required documents

❌ **Don't:**
- Book too close to inspection date
- Change location without notifying
- Book when not available
- Ignore reminder notifications

### For Inspectors

✅ **Do:**
- Keep availability updated
- Confirm bookings promptly (within 24h)
- Enable Google Calendar sync
- Review daily schedule each morning
- Mark inspections complete same day
- Add notes to completed events

❌ **Don't:**
- Overbook yourself
- Ignore booking requests
- Forget to mark time off
- Skip confirming bookings
- Leave conflicts unresolved

---

## Troubleshooting

### Can't See Available Slots

**Causes:**
- Inspector hasn't set availability
- All slots are booked
- Booking too soon (< 3 days)
- Inspector reached daily limit

**Solutions:**
- Try different date
- Choose another inspector
- Contact admin

### Booking Failed

**Causes:**
- Validation error (missing fields)
- Scheduling conflict
- Daily limit reached
- Network error

**Solutions:**
- Check all required fields
- Try different time slot
- Refresh page and retry
- Contact admin if persistent

### Google Sync Not Working

**Causes:**
- Authorization expired
- API limit reached
- Network connection
- Calendar permissions

**Solutions:**
- Reconnect Google account
- Check sync status
- Verify permissions
- Try manual sync
- Contact admin

### Not Receiving Notifications

**Causes:**
- Email/phone not verified
- Notification settings disabled
- Spam filter blocking
- LINE not connected

**Solutions:**
- Check profile settings
- Enable notification channels
- Whitelist gacp@example.com
- Connect LINE account
- Test with manual notification

---

## Support

Need help? Contact us:

📧 Email: support@gacp-platform.com  
📱 Phone: 02-xxx-xxxx  
💬 LINE: @gacp-support  
🕐 Hours: Monday-Friday, 9:00-17:00

For technical issues, include:
- Your user role (Farmer/Inspector)
- Screenshot of error
- Steps to reproduce
- Browser and device info
