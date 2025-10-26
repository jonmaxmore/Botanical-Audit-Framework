const { createLogger } = require('../../../shared/logger');
const logger = createLogger('dashboard-dashboard.service');

/**
 * Dashboard Service
 *
 * Service for aggregating and providing dashboard data
 * Supports multiple user roles (farmer, DTAM staff, admin)
 */

class DashboardService {
  constructor(db) {
    this.db = db;
    this.applicationsCollection = null;
    this.farmsCollection = null;
    this.usersCollection = null;
    this.productsCollection = null;
    this.activitiesCollection = null;
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      this.applicationsCollection = this.db.collection('applications');
      this.farmsCollection = this.db.collection('farms');
      this.usersCollection = this.db.collection('users');
      this.productsCollection = this.db.collection('products');
      this.activitiesCollection = this.db.collection('activities');

      // Create indexes for performance
      await this.applicationsCollection.createIndex({ userId: 1, status: 1 });
      await this.applicationsCollection.createIndex({ createdAt: -1 });
      await this.farmsCollection.createIndex({ userId: 1 });
      await this.productsCollection.createIndex({ userId: 1, stage: 1 });
      await this.activitiesCollection.createIndex({ userId: 1, timestamp: -1 });

      this.initialized = true;
      logger.info('Dashboard Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Dashboard Service:', error);
      throw error;
    }
  }

  /**
   * Get farmer dashboard data
   */
  async getFarmerDashboard(userId) {
    try {
      const [stats, recentActivities, applications, farms, products, notifications] =
        await Promise.all([
          this.getFarmerStats(userId),
          this.getRecentActivities(userId, 10),
          this.getFarmerApplications(userId, 5),
          this.getFarmerFarms(userId),
          this.getFarmerProducts(userId, 5),
          this.getFarmerNotifications(userId, 5),
        ]);

      return {
        stats,
        recentActivities,
        applications,
        farms,
        products,
        notifications,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting farmer dashboard:', error);
      throw error;
    }
  }

  /**
   * Get DTAM staff dashboard data
   */
  async getDTAMDashboard(userId, role) {
    try {
      const [stats, recentActivities, pendingApplications, notifications] = await Promise.all([
        this.getDTAMStats(role),
        this.getRecentActivities(userId, 10),
        this.getPendingApplications(role, 10),
        this.getDTAMNotifications(userId, 5),
      ]);

      return {
        stats,
        recentActivities,
        pendingApplications,
        notifications,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting DTAM dashboard:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard data
   */
  async getAdminDashboard() {
    try {
      const [stats, systemHealth, recentActivities, notifications] = await Promise.all([
        this.getAdminStats(),
        this.getSystemHealth(),
        this.getRecentActivities(null, 20), // All activities
        this.getAdminNotifications(10),
      ]);

      return {
        stats,
        systemHealth,
        recentActivities,
        notifications,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting admin dashboard:', error);
      throw error;
    }
  }

  /**
   * Get farmer statistics
   */
  async getFarmerStats(userId) {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        todayApplications,
        totalFarms,
        totalProducts,
        certifiedProducts,
      ] = await Promise.all([
        this.applicationsCollection.countDocuments({ userId }),
        this.applicationsCollection.countDocuments({ userId, status: 'pending' }),
        this.applicationsCollection.countDocuments({ userId, status: 'approved' }),
        this.applicationsCollection.countDocuments({ userId, status: 'rejected' }),
        this.applicationsCollection.countDocuments({
          userId,
          createdAt: { $gte: todayStart },
        }),
        this.farmsCollection.countDocuments({ userId }),
        this.productsCollection.countDocuments({ userId }),
        this.productsCollection.countDocuments({
          userId,
          certificationStatus: 'CERTIFIED',
        }),
      ]);

      // Calculate average processing time
      const completedApplications = await this.applicationsCollection
        .find({
          userId,
          status: { $in: ['approved', 'rejected'] },
          completedAt: { $exists: true },
        })
        .toArray();

      let averageProcessingTime = 0;
      if (completedApplications.length > 0) {
        const totalDays = completedApplications.reduce((sum, app) => {
          const days = Math.ceil((app.completedAt - app.createdAt) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        averageProcessingTime = Math.round(totalDays / completedApplications.length);
      }

      return {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        todayApplications,
        totalFarms,
        totalProducts,
        certifiedProducts,
        averageProcessingTime,
        certificationRate:
          totalProducts > 0 ? Math.round((certifiedProducts / totalProducts) * 100) : 0,
      };
    } catch (error) {
      logger.error('Error getting farmer stats:', error);
      throw error;
    }
  }

  /**
   * Get DTAM staff statistics
   */
  async getDTAMStats(_role) {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalApplications,
        pendingReviews,
        approvedApplications,
        rejectedApplications,
        todayApplications,
        weekApplications,
        activeUsers,
      ] = await Promise.all([
        this.applicationsCollection.countDocuments({}),
        this.applicationsCollection.countDocuments({ status: 'pending' }),
        this.applicationsCollection.countDocuments({ status: 'approved' }),
        this.applicationsCollection.countDocuments({ status: 'rejected' }),
        this.applicationsCollection.countDocuments({
          createdAt: { $gte: todayStart },
        }),
        this.applicationsCollection.countDocuments({
          createdAt: { $gte: weekStart },
        }),
        this.usersCollection.countDocuments({
          lastLoginAt: { $gte: weekStart },
        }),
      ]);

      // Calculate average processing time
      const completedApplications = await this.applicationsCollection
        .find({
          status: { $in: ['approved', 'rejected'] },
          completedAt: { $exists: true },
          createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        })
        .limit(100)
        .toArray();

      let averageProcessingTime = 0;
      if (completedApplications.length > 0) {
        const totalDays = completedApplications.reduce((sum, app) => {
          const days = Math.ceil((app.completedAt - app.createdAt) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        averageProcessingTime = Math.round(totalDays / completedApplications.length);
      }

      return {
        totalApplications,
        pendingReviews,
        approvedApplications,
        rejectedApplications,
        todayApplications,
        weekApplications,
        activeUsers,
        averageProcessingTime,
        approvalRate:
          totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0,
      };
    } catch (error) {
      logger.error('Error getting DTAM stats:', error);
      throw error;
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalApplications,
        totalUsers,
        totalFarms,
        totalProducts,
        todayApplications,
        monthApplications,
        pendingReviews,
        activeInspections,
      ] = await Promise.all([
        this.applicationsCollection.countDocuments({}),
        this.usersCollection.countDocuments({}),
        this.farmsCollection.countDocuments({}),
        this.productsCollection.countDocuments({}),
        this.applicationsCollection.countDocuments({
          createdAt: { $gte: todayStart },
        }),
        this.applicationsCollection.countDocuments({
          createdAt: { $gte: monthStart },
        }),
        this.applicationsCollection.countDocuments({ status: 'pending' }),
        this.applicationsCollection.countDocuments({ status: 'under_review' }),
      ]);

      // Application status breakdown
      const statusBreakdown = await this.applicationsCollection
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      // User role breakdown
      const userRoleBreakdown = await this.usersCollection
        .aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      return {
        totalApplications,
        totalUsers,
        totalFarms,
        totalProducts,
        todayApplications,
        monthApplications,
        pendingReviews,
        activeInspections,
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        userRoleBreakdown: userRoleBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error('Error getting admin stats:', error);
      throw error;
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    try {
      const dbStats = await this.db.stats();
      const collections = await this.db.listCollections().toArray();

      return {
        status: 'healthy',
        database: {
          connected: true,
          collections: collections.length,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting system health:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(userId, limit = 10) {
    try {
      const query = userId ? { userId } : {};

      const activities = await this.activitiesCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return activities.map(activity => ({
        id: activity._id.toString(),
        userId: activity.userId,
        action: activity.action,
        description: activity.description,
        type: activity.type,
        timestamp: activity.timestamp,
      }));
    } catch (error) {
      logger.error('Error getting recent activities:', error);
      // Return mock data if collection doesn't exist yet
      return [];
    }
  }

  /**
   * Get farmer applications
   */
  async getFarmerApplications(userId, limit = 5) {
    try {
      const applications = await this.applicationsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return applications.map(app => ({
        id: app._id.toString(),
        applicationNumber: app.applicationNumber,
        farmName: app.farmName || app.farmData?.farmName,
        status: app.status,
        submittedAt: app.createdAt,
        type: app.cropType || app.farmData?.cropType,
      }));
    } catch (error) {
      logger.error('Error getting farmer applications:', error);
      return [];
    }
  }

  /**
   * Get farmer farms
   */
  async getFarmerFarms(userId) {
    try {
      const farms = await this.farmsCollection.find({ userId }).toArray();

      return farms.map(farm => ({
        id: farm._id.toString(),
        farmName: farm.farmName,
        location: farm.location,
        size: farm.size,
        cropType: farm.cropType,
        status: farm.status,
      }));
    } catch (error) {
      logger.error('Error getting farmer farms:', error);
      return [];
    }
  }

  /**
   * Get farmer products
   */
  async getFarmerProducts(userId, limit = 5) {
    try {
      const products = await this.productsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return products.map(product => ({
        id: product._id.toString(),
        batchCode: product.batchCode,
        productName: product.productName,
        stage: product.stage,
        certificationStatus: product.certificationStatus,
        quantity: product.quantity,
        unit: product.unit,
      }));
    } catch (error) {
      logger.error('Error getting farmer products:', error);
      return [];
    }
  }

  /**
   * Get pending applications for DTAM
   */
  async getPendingApplications(role, limit = 10) {
    try {
      const applications = await this.applicationsCollection
        .find({ status: { $in: ['pending', 'under_review'] } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return applications.map(app => ({
        id: app._id.toString(),
        applicationNumber: app.applicationNumber,
        farmerName: app.farmerName,
        farmName: app.farmName || app.farmData?.farmName,
        status: app.status,
        submittedAt: app.createdAt,
        type: app.cropType || app.farmData?.cropType,
      }));
    } catch (error) {
      logger.error('Error getting pending applications:', error);
      return [];
    }
  }

  /**
   * Get farmer notifications
   */
  async getFarmerNotifications(userId, limit = 5) {
    try {
      // Mock notifications for now - can be extended to use a notifications collection
      return [
        {
          id: 'n1',
          title: 'อัปเดตสถานะคำขอ',
          message: 'คำขอรับรองของคุณอยู่ในระหว่างการตรวจสอบ',
          type: 'info',
          read: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];
    } catch (error) {
      logger.error('Error getting farmer notifications:', error);
      return [];
    }
  }

  /**
   * Get DTAM notifications
   */
  async getDTAMNotifications(userId, limit = 5) {
    try {
      const pendingCount = await this.applicationsCollection.countDocuments({
        status: 'pending',
      });

      return [
        {
          id: 'n1',
          title: 'คำขอรอการตรวจสอบ',
          message: `มีคำขอรับรอง ${pendingCount} รายการรอการตรวจสอบ`,
          type: pendingCount > 5 ? 'warning' : 'info',
          read: false,
          timestamp: new Date().toISOString(),
        },
      ];
    } catch (error) {
      logger.error('Error getting DTAM notifications:', error);
      return [];
    }
  }

  /**
   * Get admin notifications
   */
  async getAdminNotifications(limit = 10) {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [todayApplications, pendingReviews] = await Promise.all([
        this.applicationsCollection.countDocuments({
          createdAt: { $gte: todayStart },
        }),
        this.applicationsCollection.countDocuments({ status: 'pending' }),
      ]);

      const notifications = [];

      if (todayApplications > 0) {
        notifications.push({
          id: 'n1',
          title: 'คำขอใหม่วันนี้',
          message: `มีคำขอรับรอง ${todayApplications} รายการวันนี้`,
          type: 'info',
          read: false,
          timestamp: new Date().toISOString(),
        });
      }

      if (pendingReviews > 10) {
        notifications.push({
          id: 'n2',
          title: 'คำขอค้างการตรวจสอบ',
          message: `มีคำขอรอการตรวจสอบ ${pendingReviews} รายการ`,
          type: 'warning',
          read: false,
          timestamp: new Date().toISOString(),
        });
      }

      return notifications;
    } catch (error) {
      logger.error('Error getting admin notifications:', error);
      return [];
    }
  }

  /**
   * Get dashboard data by role
   */
  async getDashboardByRole(userId, role) {
    try {
      switch (role) {
        case 'farmer':
          return await this.getFarmerDashboard(userId);

        case 'reviewer':
        case 'document_reviewer':
        case 'inspector':
        case 'staff':
          return await this.getDTAMDashboard(userId, role);

        case 'auditor':
        case 'field_auditor':
        case 'approver':
          return await this.getDTAMDashboard(userId, role);

        case 'admin':
        case 'super_admin':
        case 'system_admin':
          return await this.getAdminDashboard();

        default:
          return await this.getFarmerDashboard(userId);
      }
    } catch (error) {
      logger.error('Error getting dashboard by role:', error);
      throw error;
    }
  }

  /**
   * Get realtime statistics
   */
  async getRealtimeStats() {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const [totalApplications, pendingReviews, activeInspections, recentLogins] =
        await Promise.all([
          this.applicationsCollection.countDocuments({}),
          this.applicationsCollection.countDocuments({ status: 'pending' }),
          this.applicationsCollection.countDocuments({ status: 'under_review' }),
          this.usersCollection.countDocuments({
            lastLoginAt: { $gte: fiveMinutesAgo },
          }),
        ]);

      return {
        totalApplications,
        pendingReviews,
        activeInspections,
        recentLogins,
        systemHealth: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting realtime stats:', error);
      throw error;
    }
  }
}

module.exports = DashboardService;
