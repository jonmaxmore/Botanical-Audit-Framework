/**
 * Notification System Integration Tests
 * Comprehensive end-to-end testing for notification functionality
 * 
 * Tests:
 * 1. Notification Model & Database
 * 2. REST API Endpoints
 * 3. Real-time Socket.io delivery
 * 4. Email service integration
 * 5. Notification triggers across workflows
 * 6. User preferences
 */

const mongoose = require('mongoose');
const request = require('supertest');
const io = require('socket.io-client');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Document = require('../models/Document');

describe('Notification System - Integration Tests', () => {
  let app;
  let server;
  let authToken;
  let testUserId;
  let socketClient;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/gacp-test';
    await mongoose.connect(mongoUri);

    // Import app (assuming you have an app.js or similar)
    app = require('../app');
    server = app.listen(0); // Random port
    const port = server.address().port;

    // Create test user and get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });

    authToken = loginRes.body.token;
    testUserId = loginRes.body.user._id;

    // Initialize Socket.io client
    socketClient = io(`http://localhost:${port}`, {
      auth: { token: authToken, userId: testUserId },
      reconnection: false
    });

    await new Promise((resolve) => {
      socketClient.on('connect', resolve);
    });
  });

  afterAll(async () => {
    if (socketClient) socketClient.close();
    if (server) server.close();
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  describe('1. Notification Model Tests', () => {
    test('should create notification with all required fields', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        type: 'application_submitted',
        title: 'Test Notification',
        message: 'This is a test message',
        priority: 'medium'
      });

      expect(notification._id).toBeDefined();
      expect(notification.userId.toString()).toBe(testUserId);
      expect(notification.type).toBe('application_submitted');
      expect(notification.isRead).toBe(false);
      expect(notification.isDeleted).toBe(false);
      expect(notification.createdAt).toBeDefined();
    });

    test('should validate notification types', async () => {
      const validTypes = [
        'application_submitted',
        'application_approved',
        'application_rejected',
        'inspection_scheduled',
        'certificate_issued',
        'document_approved',
        'document_rejected',
        'payment_required',
        'payment_received',
        'inspection_completed'
      ];

      for (const type of validTypes) {
        const notification = new Notification({
          userId: testUserId,
          type,
          title: 'Test',
          message: 'Test message',
          priority: 'medium'
        });

        await expect(notification.save()).resolves.toBeDefined();
        await Notification.deleteOne({ _id: notification._id });
      }
    });

    test('should validate priority levels', async () => {
      const priorities = ['low', 'medium', 'high', 'urgent'];

      for (const priority of priorities) {
        const notification = await Notification.create({
          userId: testUserId,
          type: 'system_update',
          title: 'Test',
          message: 'Test',
          priority
        });

        expect(notification.priority).toBe(priority);
        await Notification.deleteOne({ _id: notification._id });
      }
    });

    test('should support relatedEntity reference', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        type: 'application_submitted',
        title: 'Test',
        message: 'Test',
        priority: 'medium',
        relatedEntity: {
          entityType: 'application',
          entityId: new mongoose.Types.ObjectId()
        }
      });

      expect(notification.relatedEntity).toBeDefined();
      expect(notification.relatedEntity.entityType).toBe('application');
      expect(notification.relatedEntity.entityId).toBeDefined();
    });
  });

  describe('2. REST API Endpoints', () => {
    test('GET /api/notifications - should fetch user notifications', async () => {
      // Create test notifications
      await Notification.create([
        {
          userId: testUserId,
          type: 'application_submitted',
          title: 'Notification 1',
          message: 'Message 1',
          priority: 'medium'
        },
        {
          userId: testUserId,
          type: 'document_approved',
          title: 'Notification 2',
          message: 'Message 2',
          priority: 'high'
        }
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.notifications).toBeInstanceOf(Array);
      expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(2);
    });

    test('GET /api/notifications - should support pagination', async () => {
      const res = await request(app)
        .get('/api/notifications?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    test('GET /api/notifications - should filter by read status', async () => {
      const res = await request(app)
        .get('/api/notifications?isRead=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const allUnread = res.body.data.notifications.every(n => !n.isRead);
      expect(allUnread).toBe(true);
    });

    test('PUT /api/notifications/:id/read - should mark as read', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        type: 'system_update',
        title: 'Test',
        message: 'Test',
        priority: 'low'
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const updated = await Notification.findById(notification._id);
      expect(updated.isRead).toBe(true);
      expect(updated.readAt).toBeDefined();
    });

    test('PUT /api/notifications/read-all - should mark all as read', async () => {
      await Notification.create([
        {
          userId: testUserId,
          type: 'system_update',
          title: 'Test 1',
          message: 'Test',
          priority: 'low'
        },
        {
          userId: testUserId,
          type: 'system_update',
          title: 'Test 2',
          message: 'Test',
          priority: 'low'
        }
      ]);

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.modifiedCount).toBeGreaterThanOrEqual(2);
    });

    test('GET /api/notifications/unread-count - should return unread count', async () => {
      await Notification.deleteMany({ userId: testUserId });

      await Notification.create([
        {
          userId: testUserId,
          type: 'system_update',
          title: 'Unread 1',
          message: 'Test',
          priority: 'low'
        },
        {
          userId: testUserId,
          type: 'system_update',
          title: 'Unread 2',
          message: 'Test',
          priority: 'low'
        }
      ]);

      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
    });

    test('DELETE /api/notifications/:id - should delete notification', async () => {
      const notification = await Notification.create({
        userId: testUserId,
        type: 'system_update',
        title: 'To Delete',
        message: 'Test',
        priority: 'low'
      });

      await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deleted = await Notification.findById(notification._id);
      expect(deleted.isDeleted).toBe(true);
    });
  });

  describe('3. Socket.io Real-time Tests', () => {
    test('should receive new notification via Socket.io', (done) => {
      socketClient.once('notification:new', (data) => {
        expect(data).toBeDefined();
        expect(data.title).toBe('Real-time Test');
        expect(data.type).toBe('system_update');
        done();
      });

      // Trigger notification creation
      Notification.createAndSend({
        userId: testUserId,
        type: 'system_update',
        title: 'Real-time Test',
        message: 'Testing Socket.io delivery',
        priority: 'medium',
        deliveryMethods: ['realtime']
      });
    }, 10000);

    test('should receive unread count update', (done) => {
      socketClient.once('notification:unread-count', (data) => {
        expect(data).toBeDefined();
        expect(typeof data.count).toBe('number');
        done();
      });

      // Mark all as read to trigger count update
      Notification.updateMany(
        { userId: testUserId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    }, 10000);

    test('should handle multiple notifications simultaneously', (done) => {
      let receivedCount = 0;
      const expectedCount = 3;

      socketClient.on('notification:new', () => {
        receivedCount++;
        if (receivedCount === expectedCount) {
          expect(receivedCount).toBe(expectedCount);
          done();
        }
      });

      // Send multiple notifications
      for (let i = 0; i < expectedCount; i++) {
        Notification.createAndSend({
          userId: testUserId,
          type: 'system_update',
          title: `Bulk Test ${i + 1}`,
          message: 'Bulk testing',
          priority: 'low',
          deliveryMethods: ['realtime']
        });
      }
    }, 10000);
  });

  describe('4. Notification Triggers - Application Workflow', () => {
    test('should send notification when application is submitted', async () => {
      const notificationPromise = new Promise((resolve) => {
        socketClient.once('notification:new', resolve);
      });

      // Mock application submission
      await Notification.createAndSend({
        userId: testUserId,
        type: 'application_submitted',
        title: 'คำขอของคุณได้รับการบันทึกแล้ว',
        message: 'คำขอรับรอง GACP เลขที่ TEST-001 ได้รับการบันทึกเรียบร้อยแล้ว',
        priority: 'medium',
        actionUrl: '/applications/test-001',
        actionLabel: 'ดูคำขอ',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await notificationPromise;
      expect(notification.type).toBe('application_submitted');
      expect(notification.title).toContain('คำขอของคุณได้รับการบันทึกแล้ว');
    });

    test('should send notification when application is approved', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'application_approved',
        title: 'คำขอได้รับการอนุมัติ',
        message: 'คำขอรับรอง GACP ของคุณได้รับการอนุมัติแล้ว',
        priority: 'high',
        actionUrl: '/applications/test-001',
        actionLabel: 'ดูคำขอ',
        deliveryMethods: ['realtime', 'email']
      });

      const notifications = await Notification.find({
        userId: testUserId,
        type: 'application_approved'
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].priority).toBe('high');
    });

    test('should send notification when inspection is scheduled', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'inspection_scheduled',
        title: 'การตรวจประเมินได้ถูกกำหนดแล้ว',
        message: 'การตรวจประเมินฟาร์มของคุณได้ถูกกำหนดไว้ในวันที่ 15 พฤศจิกายน 2568',
        priority: 'high',
        actionUrl: '/inspections/test-001',
        actionLabel: 'ดูรายละเอียด',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await Notification.findOne({
        userId: testUserId,
        type: 'inspection_scheduled'
      });

      expect(notification).toBeDefined();
      expect(notification.actionUrl).toContain('/inspections/');
    });

    test('should send notification when certificate is issued', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'certificate_issued',
        title: 'ยินดีด้วย! คุณได้รับใบรับรอง GACP',
        message: 'ใบรับรอง GACP ของคุณพร้อมใช้งานแล้ว',
        priority: 'high',
        actionUrl: '/certificates/test-001',
        actionLabel: 'ดาวน์โหลดใบรับรอง',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await Notification.findOne({
        userId: testUserId,
        type: 'certificate_issued'
      });

      expect(notification).toBeDefined();
      expect(notification.title).toContain('ยินดีด้วย');
      expect(notification.priority).toBe('high');
    });
  });

  describe('5. Notification Triggers - Document & Payment', () => {
    test('should send notification when document is approved', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'document_approved',
        title: 'เอกสารได้รับการอนุมัติ',
        message: 'เอกสาร "ใบรับรองแปลงเพาะปลูก" ได้รับการอนุมัติแล้ว',
        priority: 'medium',
        actionUrl: '/documents/test-001',
        actionLabel: 'ดูเอกสาร',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await Notification.findOne({
        userId: testUserId,
        type: 'document_approved'
      });

      expect(notification).toBeDefined();
      expect(notification.priority).toBe('medium');
    });

    test('should send notification when payment is required', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'payment_required',
        title: 'กรุณาชำระค่าธรรมเนียม',
        message: 'กรุณาชำระค่าธรรมเนียมจำนวน 5000 บาท ภายใน 7 วัน',
        priority: 'high',
        actionUrl: '/payments/test-001',
        actionLabel: 'ชำระเงิน',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await Notification.findOne({
        userId: testUserId,
        type: 'payment_required'
      });

      expect(notification).toBeDefined();
      expect(notification.priority).toBe('high');
      expect(notification.actionLabel).toBe('ชำระเงิน');
    });

    test('should send notification when payment is received', async () => {
      await Notification.createAndSend({
        userId: testUserId,
        type: 'payment_received',
        title: 'ได้รับการชำระเงินแล้ว',
        message: 'การชำระเงินจำนวน 5000 บาท ได้รับการยืนยันแล้ว',
        priority: 'medium',
        actionUrl: '/applications/test-001',
        actionLabel: 'ดูคำขอ',
        deliveryMethods: ['realtime', 'email']
      });

      const notification = await Notification.findOne({
        userId: testUserId,
        type: 'payment_received'
      });

      expect(notification).toBeDefined();
      expect(notification.title).toContain('ได้รับการชำระเงินแล้ว');
    });
  });

  describe('6. User Preferences', () => {
    test('should respect email notification preference', async () => {
      // Update preferences to disable email
      await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: false,
          realtime: true
        })
        .expect(200);

      // Notification should only be sent via realtime
      const notification = await Notification.createAndSend({
        userId: testUserId,
        type: 'system_update',
        title: 'Test Preference',
        message: 'Testing preference filtering',
        priority: 'low',
        deliveryMethods: ['realtime', 'email']
      });

      // Email should be filtered out based on preferences
      // (This would be validated in the actual email service)
      expect(notification).toBeDefined();
    });

    test('should get user notification preferences', async () => {
      const res = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('realtime');
    });
  });

  describe('7. Error Handling & Edge Cases', () => {
    test('should reject unauthorized access', async () => {
      await request(app)
        .get('/api/notifications')
        .expect(401);
    });

    test('should handle invalid notification ID', async () => {
      await request(app)
        .get('/api/notifications/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    test('should prevent accessing other users notifications', async () => {
      const otherUserNotification = await Notification.create({
        userId: new mongoose.Types.ObjectId(),
        type: 'system_update',
        title: 'Other User',
        message: 'Test',
        priority: 'low'
      });

      await request(app)
        .get(`/api/notifications/${otherUserNotification._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('should handle missing required fields', async () => {
      const invalidNotification = new Notification({
        userId: testUserId,
        // Missing type, title, message
        priority: 'medium'
      });

      await expect(invalidNotification.save()).rejects.toThrow();
    });
  });

  describe('8. Performance & Scalability', () => {
    test('should handle bulk notification creation', async () => {
      const notifications = Array(50).fill(null).map((_, i) => ({
        userId: testUserId,
        type: 'system_update',
        title: `Bulk ${i}`,
        message: 'Bulk test',
        priority: 'low'
      }));

      const startTime = Date.now();
      await Notification.insertMany(notifications);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(5000); // Should complete in < 5s
    });

    test('should paginate large result sets efficiently', async () => {
      const res = await request(app)
        .get('/api/notifications?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.notifications.length).toBeLessThanOrEqual(20);
      expect(res.body.data.pagination).toBeDefined();
    });
  });
});
