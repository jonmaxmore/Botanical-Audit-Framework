/**
 * Enhanced Farm Management Service
 * Integrates farm data with SOP management and cannabis cultivation tracking
 */

const SOP = require('../models/mongodb/SOP');
const EnhancedCultivationRecord = require('../models/mongodb/EnhancedCultivationRecord');
const Farm = require('../microservices/api-trace/src/models/Farm');

class EnhancedFarmManagementService {
  constructor() {
    this.cannabisRegulations = {
      thcLimits: {
        medical: { max: 1.0, unit: '%' },
        industrial: { max: 0.2, unit: '%' },
        research: { max: 5.0, unit: '%' },
      },
      licenseTypes: [
        'cultivation',
        'processing',
        'distribution',
        'retail',
        'research',
        'medical_use',
      ],
    };
  }

  /**
   * Create farm with cannabis-specific features
   */
  async createCannabisEnabledFarm(farmData, userInfo) {
    try {
      // Validate cannabis-specific requirements
      if (farmData.cropTypes.includes('cannabis')) {
        const validationResult = this.validateCannabisCompliance(farmData);
        if (!validationResult.isValid) {
          throw new Error(
            `Cannabis compliance validation failed: ${validationResult.errors.join(', ')}`
          );
        }
      }

      // Create enhanced farm record
      const enhancedFarmData = {
        ...farmData,

        // Cannabis-specific enhancements
        cannabisFeatures: farmData.cropTypes.includes('cannabis')
          ? {
              enabled: true,
              licenseInfo: {
                licenseNumber: farmData.cannabisLicense?.licenseNumber,
                licenseType: farmData.cannabisLicense?.licenseType,
                issuedBy: farmData.cannabisLicense?.issuedBy,
                issuedDate: farmData.cannabisLicense?.issuedDate,
                expiryDate: farmData.cannabisLicense?.expiryDate,
                restrictions: farmData.cannabisLicense?.restrictions || [],
              },

              securityMeasures: {
                cameraSystem: false,
                fencing: false,
                accessControl: false,
                alarmSystem: false,
                lightingSystem: false,
                implementation: {
                  completed: [],
                  pending: [
                    'cameraSystem',
                    'fencing',
                    'accessControl',
                    'alarmSystem',
                    'lightingSystem',
                  ],
                },
              },

              complianceTracking: {
                inspectionSchedule: {
                  frequency: 'quarterly',
                  lastInspection: null,
                  nextInspection: null,
                  inspector: null,
                },
                reporting: {
                  frequency: 'monthly',
                  lastReport: null,
                  nextReport: null,
                  reportingAuthority: farmData.cannabisLicense?.issuedBy,
                },
              },

              productionLimits: {
                plantCount: {
                  max: farmData.cannabisLicense?.plantLimit || 0,
                  current: 0,
                },
                harvestWeight: {
                  max: farmData.cannabisLicense?.harvestLimit || 0,
                  current: 0,
                  unit: 'kg',
                },
              },
            }
          : { enabled: false },

        // SOP integration
        sopIntegration: {
          defaultSOPs: [],
          customSOPs: [],
          complianceLevel: 'standard',
        },

        // Enhanced audit trail
        auditTrail: [
          {
            action: 'farm_created',
            performedBy: userInfo.id,
            performedAt: new Date(),
            details: {
              farmType: farmData.farmType,
              cropTypes: farmData.cropTypes,
              cannabisEnabled: farmData.cropTypes.includes('cannabis'),
            },
          },
        ],
      };

      const farm = new Farm(enhancedFarmData);
      await farm.save();

      // If cannabis farm, set up default SOPs
      if (farmData.cropTypes.includes('cannabis')) {
        await this.setupDefaultCannabisSOPs(farm.farmCode, farmData.cannabisLicense?.licenseType);
      }

      // Set up compliance monitoring
      await this.initializeComplianceMonitoring(farm.farmCode, farmData.cropTypes);

      return {
        success: true,
        farmCode: farm.farmCode,
        message: 'Enhanced farm created successfully',
        cannabisEnabled: farmData.cropTypes.includes('cannabis'),
      };
    } catch (error) {
      throw new Error(`Failed to create enhanced farm: ${error.message}`);
    }
  }

  /**
   * Validate cannabis compliance requirements
   */
  validateCannabisCompliance(farmData) {
    const errors = [];

    // Check license requirements
    if (!farmData.cannabisLicense?.licenseNumber) {
      errors.push('Cannabis license number is required');
    }

    if (!farmData.cannabisLicense?.licenseType) {
      errors.push('Cannabis license type is required');
    }

    if (!this.cannabisRegulations.licenseTypes.includes(farmData.cannabisLicense?.licenseType)) {
      errors.push('Invalid cannabis license type');
    }

    // Check expiry date
    if (farmData.cannabisLicense?.expiryDate) {
      const expiryDate = new Date(farmData.cannabisLicense.expiryDate);
      if (expiryDate < new Date()) {
        errors.push('Cannabis license has expired');
      }
    }

    // Check security requirements
    if (!farmData.securityMeasures || Object.keys(farmData.securityMeasures).length === 0) {
      errors.push('Security measures plan is required for cannabis cultivation');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Setup default SOPs for cannabis cultivation
   */
  async setupDefaultCannabisSOPs(farmCode, licenseType) {
    try {
      // Find appropriate cannabis SOPs
      const cannabisSOPs = await SOP.findCannabisSOP(null, null);

      if (cannabisSOPs.length === 0) {
        // Create basic cannabis SOP template
        await this.createBasicCannabisSOPTemplate();
        const cannabisSOPs = await SOP.findCannabisSOP(null, null);
      }

      // Link SOPs to farm
      const farm = await Farm.findOne({ farmCode });
      if (farm) {
        farm.sopIntegration.defaultSOPs = cannabisSOPs.map(sop => ({
          sopCode: sop.sopCode,
          sopTitle: sop.title,
          assignedAt: new Date(),
          mandatory: true,
          licenseRequirement: licenseType,
        }));

        await farm.save();
      }

      return cannabisSOPs;
    } catch (error) {
      console.error('Error setting up cannabis SOPs:', error);
      throw error;
    }
  }

  /**
   * Create basic cannabis SOP template
   */
  async createBasicCannabisSOPTemplate() {
    const cannabisSOP = new SOP({
      title: 'Basic Cannabis Cultivation SOP',
      titleTH: 'มาตรฐานการปลูกกัญชาพื้นฐาน',
      description: 'Standard operating procedures for legal cannabis cultivation in Thailand',
      cropType: 'cannabis',

      cannabisDetails: {
        strain: 'hybrid',
        thcLevel: { min: 0, max: 1.0, unit: '%' },
        cbdLevel: { min: 1.0, max: 20.0, unit: '%' },
        medicalPurpose: 'pain_relief',
        regulatoryCompliance: {
          authority: 'FDA Thailand',
          restrictions: ['THC < 1%', 'Medical use only', 'Licensed cultivation only'],
        },
      },

      phases: [
        {
          phaseCode: 'LAND_PREP',
          phaseName: 'Land Preparation',
          phaseNameTH: 'การเตรียมดิน',
          duration: { min: 7, max: 14, typical: 10 },
          steps: [
            {
              stepCode: 'LP001',
              stepName: 'Soil Testing',
              stepNameTH: 'การตรวจสอบดิน',
              description: 'Test soil pH, nutrients, and contaminants',
              descriptionTH: 'ตรวจสอบค่า pH ธาตุอาหาร และสารปนเปื้อนในดิน',
              frequency: 'once',
              materials: [
                {
                  name: 'Soil testing kit',
                  nameTH: 'ชุดทดสอบดิน',
                  quantity: 1,
                  unit: 'set',
                  required: true,
                },
              ],
              safetyRequirements: [
                {
                  requirement: 'Wear gloves when handling soil samples',
                  requirementTH: 'สวมถุงมือเมื่อจัดการตัวอย่างดิน',
                  mandatory: true,
                },
              ],
            },
          ],
        },
        {
          phaseCode: 'PLANTING',
          phaseName: 'Planting',
          phaseNameTH: 'การปลูก',
          duration: { min: 1, max: 3, typical: 2 },
          steps: [
            {
              stepCode: 'PL001',
              stepName: 'Seed/Clone Preparation',
              stepNameTH: 'การเตรียมเมล็ด/พันธุ์พืช',
              description: 'Prepare seeds or clones for planting with proper documentation',
              descriptionTH: 'เตรียมเมล็ดหรือพันธุ์พืชสำหรับการปลูกพร้อมเอกสารที่ถูกต้อง',
              frequency: 'once',
              recordKeeping: [
                {
                  recordType: 'Plant inventory',
                  frequency: 'daily',
                  retention: '3 years',
                  required: true,
                },
              ],
            },
          ],
        },
      ],

      gacpCompliance: {
        categories: [
          {
            categoryCode: 'RECORD_TRACE',
            requirements: [
              {
                requirementCode: 'RT001',
                description: 'Maintain detailed cultivation records',
                descriptionTH: 'บันทึกการปลูกอย่างละเอียด',
                mandatory: true,
                relatedSteps: ['LP001', 'PL001'],
              },
            ],
          },
        ],
        overallComplianceLevel: 'premium',
      },

      status: 'published',
      approvalWorkflow: {
        createdBy: {
          userId: 'system',
          name: 'System Generated',
          role: 'system',
          createdAt: new Date(),
        },
        approvedBy: {
          userId: 'system',
          name: 'System Approved',
          role: 'system',
          approvedAt: new Date(),
        },
        publishedBy: {
          userId: 'system',
          name: 'System Published',
          role: 'system',
          publishedAt: new Date(),
        },
      },

      tags: ['cannabis', 'medical', 'thailand', 'legal', 'basic'],
      difficulty: 'medium',
    });

    await cannabisSOP.save();
    return cannabisSOP;
  }

  /**
   * Initialize compliance monitoring for farm
   */
  async initializeComplianceMonitoring(farmCode, cropTypes) {
    try {
      const monitoringConfig = {
        farmCode,
        cropTypes,
        schedules: {},
        alerts: {
          enabled: true,
          channels: ['email', 'database'],
          thresholds: {
            compliance: 80, // Alert if compliance falls below 80%
            deadline: 7, // Alert 7 days before deadlines
          },
        },
      };

      // Cannabis-specific monitoring
      if (cropTypes.includes('cannabis')) {
        monitoringConfig.schedules.cannabis = {
          inspections: {
            frequency: 'quarterly',
            nextDue: this.calculateNextInspectionDate('quarterly'),
          },
          reporting: {
            frequency: 'monthly',
            nextDue: this.calculateNextReportingDate('monthly'),
          },
          inventoryAudit: {
            frequency: 'weekly',
            nextDue: this.calculateNextInventoryAudit('weekly'),
          },
        };
      }

      // Store monitoring configuration
      // This would typically be stored in a separate monitoring collection
      console.log('Compliance monitoring initialized:', monitoringConfig);

      return monitoringConfig;
    } catch (error) {
      console.error('Error initializing compliance monitoring:', error);
      throw error;
    }
  }

  /**
   * Get farm dashboard data with SOP integration
   */
  async getFarmDashboardData(farmCode, userRole) {
    try {
      const farm = await Farm.findOne({ farmCode }).lean();
      if (!farm) {
        throw new Error('Farm not found');
      }

      // Get active cultivation records
      const activeCultivations = await EnhancedCultivationRecord.find({
        farmCode,
        status: { $in: ['PLANTING', 'GROWING', 'HARVESTING'] },
      }).limit(10);

      // Get SOP compliance data
      const sopCompliance = await this.calculateFarmSOPCompliance(farmCode);

      // Get pending activities
      const pendingActivities = await this.getPendingSOPActivities(farmCode);

      // Cannabis-specific data
      let cannabisData = null;
      if (farm.cannabisFeatures?.enabled) {
        cannabisData = await this.getCannabisComplianceData(farmCode);
      }

      // Role-based data filtering
      const dashboardData = {
        farm: {
          farmCode: farm.farmCode,
          name: farm.farmInfo.name,
          owner: farm.farmInfo.ownerName,
          totalArea: farm.farmInfo.totalArea,
          cropTypes: farm.farmInfo.cropTypes,
          cannabisEnabled: farm.cannabisFeatures?.enabled || false,
        },
        cultivations: {
          active: activeCultivations.length,
          records: userRole === 'farmer' ? activeCultivations : activeCultivations.slice(0, 5),
        },
        sopCompliance,
        pendingActivities:
          userRole === 'farmer' ? pendingActivities : pendingActivities.slice(0, 10),
        alerts: await this.getFarmAlerts(farmCode),
        ...(cannabisData && { cannabis: cannabisData }),
      };

      return dashboardData;
    } catch (error) {
      throw new Error(`Failed to get farm dashboard data: ${error.message}`);
    }
  }

  /**
   * Calculate SOP compliance for farm
   */
  async calculateFarmSOPCompliance(farmCode) {
    try {
      const cultivations = await EnhancedCultivationRecord.find({ farmCode });

      if (cultivations.length === 0) {
        return { overall: 0, byPhase: {}, activeCultivations: 0 };
      }

      let totalCompliance = 0;
      const phaseCompliance = {};

      for (const cultivation of cultivations) {
        if (cultivation.sopIntegration?.complianceTracking) {
          totalCompliance += cultivation.sopIntegration.complianceTracking.overallCompliance || 0;

          // Aggregate phase compliance
          if (cultivation.sopIntegration.complianceTracking.phaseCompliance) {
            for (const phase of cultivation.sopIntegration.complianceTracking.phaseCompliance) {
              if (!phaseCompliance[phase.phaseCode]) {
                phaseCompliance[phase.phaseCode] = {
                  total: 0,
                  count: 0,
                  phaseName: phase.phaseName,
                };
              }
              phaseCompliance[phase.phaseCode].total += phase.compliancePercentage || 0;
              phaseCompliance[phase.phaseCode].count += 1;
            }
          }
        }
      }

      // Calculate averages
      const overallCompliance = cultivations.length > 0 ? totalCompliance / cultivations.length : 0;

      for (const phaseCode in phaseCompliance) {
        const phase = phaseCompliance[phaseCode];
        phase.average = phase.count > 0 ? phase.total / phase.count : 0;
      }

      return {
        overall: Math.round(overallCompliance),
        byPhase: phaseCompliance,
        activeCultivations: cultivations.filter(c => ['GROWING', 'HARVESTING'].includes(c.status))
          .length,
      };
    } catch (error) {
      console.error('Error calculating SOP compliance:', error);
      return { overall: 0, byPhase: {}, activeCultivations: 0 };
    }
  }

  /**
   * Get pending SOP activities for farm
   */
  async getPendingSOPActivities(farmCode) {
    try {
      const cultivations = await EnhancedCultivationRecord.find({
        farmCode,
        'sopActivities.status': { $in: ['planned', 'in_progress'] },
      }).select('recordCode sopActivities cropInfo');

      const pendingActivities = [];

      for (const cultivation of cultivations) {
        for (const activity of cultivation.sopActivities) {
          if (['planned', 'in_progress'].includes(activity.status)) {
            pendingActivities.push({
              cultivationRecord: cultivation.recordCode,
              cropType: cultivation.cropInfo?.cropType,
              activityId: activity._id,
              sopPhaseCode: activity.sopPhaseCode,
              sopStepCode: activity.sopStepCode,
              stepName: activity.sopStepName,
              scheduledDate: activity.scheduledDate,
              status: activity.status,
              priority: this.calculateActivityPriority(activity),
              daysOverdue:
                activity.scheduledDate < new Date()
                  ? Math.floor((new Date() - activity.scheduledDate) / (1000 * 60 * 60 * 24))
                  : 0,
            });
          }
        }
      }

      // Sort by priority and scheduled date
      pendingActivities.sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      });

      return pendingActivities;
    } catch (error) {
      console.error('Error getting pending SOP activities:', error);
      return [];
    }
  }

  /**
   * Calculate activity priority based on various factors
   */
  calculateActivityPriority(activity) {
    const now = new Date();
    const scheduledDate = new Date(activity.scheduledDate);
    const daysUntilDue = Math.floor((scheduledDate - now) / (1000 * 60 * 60 * 24));

    // Critical phases that need immediate attention
    const criticalPhases = ['PLANTING', 'HARVESTING'];

    if (daysUntilDue < 0) {
      return 'urgent'; // Overdue
    } else if (daysUntilDue <= 1) {
      return 'high'; // Due today or tomorrow
    } else if (criticalPhases.includes(activity.sopPhaseCode)) {
      return 'high'; // Critical phase
    } else if (daysUntilDue <= 7) {
      return 'medium'; // Due within a week
    } else {
      return 'low'; // Future activity
    }
  }

  /**
   * Get cannabis-specific compliance data
   */
  async getCannabisComplianceData(farmCode) {
    try {
      const farm = await Farm.findOne({ farmCode });
      if (!farm?.cannabisFeatures?.enabled) {
        return null;
      }

      const cannabisCultivations = await EnhancedCultivationRecord.find({
        farmCode,
        'cropInfo.cropType': 'cannabis',
      });

      const complianceData = {
        license: {
          number: farm.cannabisFeatures.licenseInfo.licenseNumber,
          type: farm.cannabisFeatures.licenseInfo.licenseType,
          expiryDate: farm.cannabisFeatures.licenseInfo.expiryDate,
          daysUntilExpiry: farm.cannabisFeatures.licenseInfo.expiryDate
            ? Math.floor(
                (new Date(farm.cannabisFeatures.licenseInfo.expiryDate) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        },

        productionLimits: farm.cannabisFeatures.productionLimits,

        securityCompliance: {
          implemented: farm.cannabisFeatures.securityMeasures.implementation.completed,
          pending: farm.cannabisFeatures.securityMeasures.implementation.pending,
          compliancePercentage: Math.round(
            (farm.cannabisFeatures.securityMeasures.implementation.completed.length /
              (farm.cannabisFeatures.securityMeasures.implementation.completed.length +
                farm.cannabisFeatures.securityMeasures.implementation.pending.length)) *
              100
          ),
        },

        inspections: farm.cannabisFeatures.complianceTracking.inspectionSchedule,
        reporting: farm.cannabisFeatures.complianceTracking.reporting,

        activeCultivations: cannabisCultivations.length,

        alerts: this.generateCannabisAlerts(farm, cannabisCultivations),
      };

      return complianceData;
    } catch (error) {
      console.error('Error getting cannabis compliance data:', error);
      return null;
    }
  }

  /**
   * Generate cannabis-specific alerts
   */
  generateCannabisAlerts(farm, cultivations) {
    const alerts = [];

    // License expiry alert
    if (farm.cannabisFeatures.licenseInfo.expiryDate) {
      const daysUntilExpiry = Math.floor(
        (new Date(farm.cannabisFeatures.licenseInfo.expiryDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 30) {
        alerts.push({
          type: 'license_expiry',
          severity: daysUntilExpiry <= 7 ? 'critical' : 'warning',
          message: `Cannabis license expires in ${daysUntilExpiry} days`,
          action: 'Renew license immediately',
        });
      }
    }

    // Production limit alerts
    const plantLimit = farm.cannabisFeatures.productionLimits.plantCount;
    if (plantLimit.current >= plantLimit.max * 0.9) {
      alerts.push({
        type: 'production_limit',
        severity: plantLimit.current >= plantLimit.max ? 'critical' : 'warning',
        message: `Plant count: ${plantLimit.current}/${plantLimit.max}`,
        action: 'Monitor plant count carefully',
      });
    }

    // Security compliance alert
    if (farm.cannabisFeatures.securityMeasures.implementation.pending.length > 0) {
      alerts.push({
        type: 'security_compliance',
        severity: 'medium',
        message: `${farm.cannabisFeatures.securityMeasures.implementation.pending.length} security measures pending`,
        action: 'Complete security implementation',
      });
    }

    return alerts;
  }

  /**
   * Get farm alerts
   */
  async getFarmAlerts(farmCode) {
    try {
      const alerts = [];

      // Get SOP compliance alerts
      const compliance = await this.calculateFarmSOPCompliance(farmCode);
      if (compliance.overall < 80) {
        alerts.push({
          type: 'sop_compliance',
          severity: compliance.overall < 50 ? 'critical' : 'warning',
          message: `SOP compliance: ${compliance.overall}%`,
          action: 'Review and complete pending SOP activities',
        });
      }

      // Get overdue activities
      const pendingActivities = await this.getPendingSOPActivities(farmCode);
      const overdueCount = pendingActivities.filter(a => a.daysOverdue > 0).length;

      if (overdueCount > 0) {
        alerts.push({
          type: 'overdue_activities',
          severity: overdueCount > 5 ? 'critical' : 'medium',
          message: `${overdueCount} activities overdue`,
          action: 'Complete overdue SOP activities',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error getting farm alerts:', error);
      return [];
    }
  }

  // Helper methods for date calculations
  calculateNextInspectionDate(frequency) {
    const now = new Date();
    switch (frequency) {
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }

  calculateNextReportingDate(frequency) {
    return this.calculateNextInspectionDate(frequency);
  }

  calculateNextInventoryAudit(frequency) {
    return this.calculateNextInspectionDate(frequency);
  }
}

module.exports = EnhancedFarmManagementService;
