/**
 * 📋 GACP SOP Wizard System - Complete 5-Phase Workflow
 * ระบบตัวช่วย SOP ครบถ้วน 5 ขั้นตอนตามมาตรฐาน GACP
 *
 * Features:
 * - 5 Phases: Pre-Planting → Planting → Growing → Harvesting → Post-Harvest
 * - 20+ Activity Types with compliance tracking
 * - Photo Upload + GPS Tagging
 * - Real-time Compliance Scoring
 * - AI Integration for guidance
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

// GACP SOP Activity Definitions (20+ types)
const GACP_SOP_ACTIVITIES = {
  // 🌱 Phase 1: Pre-Planting (ขั้นตอนก่อนปลูก)
  pre_planting: {
    name: 'ขั้นตอนก่อนปลูก',
    activities: {
      soil_preparation: {
        id: 'soil_preparation',
        name: 'การเตรียมดิน',
        description: 'การปรับปรุงดิน ไถกลบ และเตรียมแปลงปลูก',
        requiredFields: ['soil_type', 'ph_level', 'organic_matter'],
        gacp_requirement: 'GACP-05.1',
        compliance_points: 15,
      },
      soil_testing: {
        id: 'soil_testing',
        name: 'การทดสอบดิน',
        description: 'วิเคราะห์คุณภาพดิน pH และธาตุอาหาร',
        requiredFields: ['lab_report', 'test_date', 'results'],
        gacp_requirement: 'GACP-05.2',
        compliance_points: 20,
      },
      water_testing: {
        id: 'water_testing',
        name: 'การทดสอบน้ำ',
        description: 'ทดสอบคุณภาพน้ำสำหรับการเพาะปลูก',
        requiredFields: ['water_source', 'test_results', 'contamination_check'],
        gacp_requirement: 'GACP-06.1',
        compliance_points: 20,
      },
      seed_selection: {
        id: 'seed_selection',
        name: 'การเลือกเมล็ดพันธุ์',
        description: 'เลือกเมล็ดพันธุ์คุณภาพและจดบันทึกแหล่งที่มา',
        requiredFields: ['variety', 'source', 'quality_certificate'],
        gacp_requirement: 'GACP-04.1',
        compliance_points: 15,
      },
      area_measurement: {
        id: 'area_measurement',
        name: 'การวัดพื้นที่',
        description: 'วัดและทำแผนที่พื้นที่ปลูก',
        requiredFields: ['area_size', 'gps_coordinates', 'layout_plan'],
        gacp_requirement: 'GACP-03.2',
        compliance_points: 10,
      },
    },
  },

  // 🌿 Phase 2: Planting (ขั้นตอนการปลูก)
  planting: {
    name: 'ขั้นตอนการปลูก',
    activities: {
      seed_germination: {
        id: 'seed_germination',
        name: 'การงอกเมล็ด',
        description: 'กระบวนการงอกเมล็ดในสภาพแวดล้อมที่เหมาะสม',
        requiredFields: ['germination_method', 'temperature', 'humidity', 'success_rate'],
        gacp_requirement: 'GACP-04.2',
        compliance_points: 15,
      },
      seedling_transplant: {
        id: 'seedling_transplant',
        name: 'การปลูกกล้า',
        description: 'ย้ายกล้าไปปลูกในแปลงถาวร',
        requiredFields: ['transplant_date', 'spacing', 'plant_count', 'survival_rate'],
        gacp_requirement: 'GACP-04.3',
        compliance_points: 15,
      },
      irrigation_setup: {
        id: 'irrigation_setup',
        name: 'การติดตั้งระบบรดน้ำ',
        description: 'ติดตั้งและทดสอบระบบให้น้ำ',
        requiredFields: ['system_type', 'coverage_area', 'water_pressure'],
        gacp_requirement: 'GACP-06.2',
        compliance_points: 10,
      },
      plant_tagging: {
        id: 'plant_tagging',
        name: 'การติดป้ายต้นพืช',
        description: 'ติดรหัสและป้ายข้อมูลแต่ละต้น',
        requiredFields: ['plant_id', 'variety', 'planting_date'],
        gacp_requirement: 'GACP-10.1',
        compliance_points: 10,
      },
    },
  },

  // 🌱 Phase 3: Growing (ขั้นตอนการเพาะปลูก)
  growing: {
    name: 'ขั้นตอนการเพาะปลูก',
    activities: {
      daily_watering: {
        id: 'daily_watering',
        name: 'การรดน้ำประจำวัน',
        description: 'บันทึกการให้น้ำรายวัน',
        requiredFields: ['water_amount', 'watering_time', 'soil_moisture'],
        gacp_requirement: 'GACP-06.3',
        compliance_points: 5,
        frequency: 'daily',
      },
      weekly_fertilizing: {
        id: 'weekly_fertilizing',
        name: 'การใส่ปุ่ยรายสัปดาห์',
        description: 'ใส่ปุ่ยและบันทึกประเภท ปริมาณ',
        requiredFields: ['fertilizer_type', 'amount', 'npk_ratio', 'application_method'],
        gacp_requirement: 'GACP-07.1',
        compliance_points: 10,
        frequency: 'weekly',
      },
      monthly_pruning: {
        id: 'monthly_pruning',
        name: 'การตัดแต่งรายเดือน',
        description: 'ตัดแต่งกิ่งและใบเพื่อควบคุมการเจริญเติบโต',
        requiredFields: ['pruning_type', 'removed_parts', 'plant_condition'],
        gacp_requirement: 'GACP-08.1',
        compliance_points: 10,
        frequency: 'monthly',
      },
      pest_monitoring: {
        id: 'pest_monitoring',
        name: 'การตรวจสอบศัตรูพืช',
        description: 'ตรวจสอบและบันทึกสถานะศัตรูพืช',
        requiredFields: ['pest_type', 'severity_level', 'affected_area', 'control_action'],
        gacp_requirement: 'GACP-09.1',
        compliance_points: 15,
        frequency: 'weekly',
      },
      disease_inspection: {
        id: 'disease_inspection',
        name: 'การตรวจสอบโรคพืช',
        description: 'ตรวจสอบอาการโรคและดำเนินการป้องกัน',
        requiredFields: ['disease_type', 'symptoms', 'prevention_method'],
        gacp_requirement: 'GACP-09.2',
        compliance_points: 15,
        frequency: 'weekly',
      },
      growth_measurement: {
        id: 'growth_measurement',
        name: 'การวัดการเจริญเติบโต',
        description: 'วัดและบันทึกการเจริญเติบโตของพืช',
        requiredFields: ['plant_height', 'stem_diameter', 'leaf_count', 'growth_stage'],
        gacp_requirement: 'GACP-08.2',
        compliance_points: 10,
        frequency: 'weekly',
      },
    },
  },

  // 🌾 Phase 4: Harvesting (ขั้นตอนการเก็บเกี่ยว)
  harvesting: {
    name: 'ขั้นตอนการเก็บเกี่ยว',
    activities: {
      maturity_assessment: {
        id: 'maturity_assessment',
        name: 'การประเมินความสุกงาม',
        description: 'ตรวจสอบความพร้อมสำหรับการเก็บเกี่ยว',
        requiredFields: ['maturity_indicators', 'trichome_color', 'harvest_readiness'],
        gacp_requirement: 'GACP-11.1',
        compliance_points: 15,
      },
      harvesting_process: {
        id: 'harvesting_process',
        name: 'การเก็บเกี่ยว',
        description: 'กระบวนการเก็บเกี่ยวและจัดการผลผลิต',
        requiredFields: ['harvest_date', 'harvest_method', 'weather_conditions', 'harvester_info'],
        gacp_requirement: 'GACP-11.2',
        compliance_points: 20,
      },
      fresh_weight_recording: {
        id: 'fresh_weight_recording',
        name: 'การชั่งน้ำหนักสด',
        description: 'ชั่งและบันทึกน้ำหนักสดทันทีหลังเก็บเกี่ยว',
        requiredFields: ['fresh_weight', 'moisture_content', 'quality_grade'],
        gacp_requirement: 'GACP-11.3',
        compliance_points: 10,
      },
      initial_packaging: {
        id: 'initial_packaging',
        name: 'การบรรจุเบื้องต้น',
        description: 'บรรจุและติดป้ายข้อมูลเบื้องต้น',
        requiredFields: ['packaging_type', 'batch_number', 'packaging_date'],
        gacp_requirement: 'GACP-12.1',
        compliance_points: 10,
      },
    },
  },

  // 📦 Phase 5: Post-Harvest (ขั้นตอนหลังการเก็บเกี่ยว)
  post_harvest: {
    name: 'ขั้นตอนหลังการเก็บเกี่ยว',
    activities: {
      drying_process: {
        id: 'drying_process',
        name: 'การอบแห้ง',
        description: 'กระบวนการอบแห้งเพื่อลดความชื้น',
        requiredFields: [
          'drying_method',
          'temperature',
          'humidity',
          'drying_duration',
          'final_moisture',
        ],
        gacp_requirement: 'GACP-13.1',
        compliance_points: 20,
      },
      processing: {
        id: 'processing',
        name: 'การแปรรูป',
        description: 'การแปรรูปผลิตภัณฑ์ตามต้องการ',
        requiredFields: ['processing_type', 'equipment_used', 'processing_conditions'],
        gacp_requirement: 'GACP-13.2',
        compliance_points: 15,
      },
      final_packaging: {
        id: 'final_packaging',
        name: 'การบรรจุขั้นสุดท้าย',
        description: 'บรรจุผลิตภัณฑ์สำเร็จพร้อมจำหน่าย',
        requiredFields: ['final_package_type', 'net_weight', 'expiry_date', 'qr_code'],
        gacp_requirement: 'GACP-12.2',
        compliance_points: 15,
      },
      storage_conditions: {
        id: 'storage_conditions',
        name: 'การเก็บรักษา',
        description: 'จัดการเก็บรักษาในสภาพแวดล้อมที่เหมาะสม',
        requiredFields: ['storage_type', 'temperature_range', 'humidity_range', 'storage_duration'],
        gacp_requirement: 'GACP-14.1',
        compliance_points: 10,
      },
      quality_testing: {
        id: 'quality_testing',
        name: 'การทดสอบคุณภาพ',
        description: 'ทดสอบคุณภาพผลิตภัณฑ์สำเร็จ',
        requiredFields: ['test_parameters', 'lab_results', 'certificate_number'],
        gacp_requirement: 'GACP-14.2',
        compliance_points: 25,
      },
    },
  },
};

// SOP Workflow State Machine
const SOP_WORKFLOW_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

class GACPSOPWizardSystem extends EventEmitter {
  constructor(db, aiAssistant = null, digitalLogbook = null) {
    super();

    this.db = db;
    this.aiAssistant = aiAssistant;
    this.digitalLogbook = digitalLogbook;

    // Collections
    this.sopSessionsCollection = db?.collection('sop_sessions');
    this.sopActivitiesCollection = db?.collection('sop_activities');
    this.complianceScoresCollection = db?.collection('compliance_scores');

    console.log('📋 GACP SOP Wizard System initialized');
  }

  /**
   * เริ่มต้น SOP session ใหม่
   */
  async startSOPSession(data) {
    try {
      const session = {
        id: uuidv4(),
        farmId: data.farmId,
        cultivationCycleId: data.cultivationCycleId,
        userId: data.userId,

        // Session Info
        sessionName: data.sessionName || `SOP Session ${new Date().toLocaleDateString('th-TH')}`,
        currentPhase: 'pre_planting',
        overallProgress: 0,

        // Phase Progress Tracking
        phaseProgress: {
          pre_planting: { completed: 0, total: 5, percentage: 0 },
          planting: { completed: 0, total: 4, percentage: 0 },
          growing: { completed: 0, total: 6, percentage: 0 },
          harvesting: { completed: 0, total: 4, percentage: 0 },
          post_harvest: { completed: 0, total: 5, percentage: 0 },
        },

        // Compliance Tracking
        complianceScore: {
          overall: 0,
          byPhase: {
            pre_planting: 0,
            planting: 0,
            growing: 0,
            harvesting: 0,
            post_harvest: 0,
          },
          maxPossible: 345, // Total compliance points
          lastUpdated: new Date(),
        },

        // AI Guidance History
        aiGuidanceHistory: [],

        metadata: {
          createdAt: new Date(),
          lastActivity: new Date(),
          status: SOP_WORKFLOW_STATES.IN_PROGRESS,
        },
      };

      if (this.sopSessionsCollection) {
        await this.sopSessionsCollection.insertOne(session);
      }

      // AI Welcome Guidance
      if (this.aiAssistant) {
        const guidance = await this.aiAssistant.provideSOPGuidance({
          action: 'session_start',
          phase: 'pre_planting',
          farmData: data,
        });

        session.aiGuidanceHistory.push(guidance);
      }

      this.emit('sop_session_started', {
        sessionId: session.id,
        farmId: session.farmId,
        phase: session.currentPhase,
      });

      return {
        success: true,
        session,
      };
    } catch (error) {
      console.error('[SOPWizard] Error starting session:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * บันทึกกิจกรรม SOP
   */
  async recordSOPActivity(sessionId, activityData) {
    try {
      // Get session
      const session = await this.sopSessionsCollection.findOne({ id: sessionId });
      if (!session) {
        throw new Error('SOP session not found');
      }

      // Validate activity
      const phase = session.currentPhase;
      const activityDef = GACP_SOP_ACTIVITIES[phase]?.activities[activityData.activityId];
      if (!activityDef) {
        throw new Error('Invalid activity for current phase');
      }

      // Create activity record
      const activity = {
        id: uuidv4(),
        sessionId,
        farmId: session.farmId,

        // Activity Details
        phase,
        activityId: activityData.activityId,
        activityName: activityDef.name,
        description: activityDef.description,

        // Data & Media
        activityData: activityData.data || {},
        photos: activityData.photos || [],
        gpsLocation: activityData.gpsLocation || null,

        // Compliance
        gacpRequirement: activityDef.gacp_requirement,
        compliancePoints: activityDef.compliance_points,
        complianceStatus: 'pending_review',

        // Timestamps
        recordedAt: new Date(),
        recordedBy: activityData.userId,

        metadata: {
          deviceInfo: activityData.deviceInfo || null,
          weather: activityData.weather || null,
          notes: activityData.notes || '',
        },
      };

      // AI Validation if available
      if (this.aiAssistant) {
        const validation = await this.aiAssistant.validateSOPActivity({
          activity,
          activityDefinition: activityDef,
          sessionContext: session,
        });

        activity.aiValidation = validation;
        activity.complianceStatus = validation.compliant ? 'approved' : 'requires_review';

        // Add AI guidance to session
        if (validation.guidance) {
          session.aiGuidanceHistory.push({
            timestamp: new Date(),
            type: 'activity_validation',
            activityId: activity.activityId,
            guidance: validation.guidance,
          });
        }
      }

      // Save activity
      if (this.sopActivitiesCollection) {
        await this.sopActivitiesCollection.insertOne(activity);
      }

      // Log to Digital Logbook if available
      if (this.digitalLogbook) {
        await this.digitalLogbook.addLogEntry({
          type: 'sop_activity',
          requirement: activityDef.gacp_requirement,
          data: {
            sessionId,
            activityId: activity.activityId,
            activityName: activity.activityName,
            compliancePoints: activity.compliancePoints,
          },
          userId: activityData.userId,
          farmId: session.farmId,
        });
      }

      // Update session progress
      await this.updateSessionProgress(sessionId, phase, activity.activityId);

      this.emit('sop_activity_recorded', {
        sessionId,
        activityId: activity.id,
        phase,
        compliancePoints: activity.compliancePoints,
      });

      return {
        success: true,
        activity,
        sessionProgress: await this.getSessionProgress(sessionId),
      };
    } catch (error) {
      console.error('[SOPWizard] Error recording activity:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * อัปเดตความคืบหน้าของ session
   */
  async updateSessionProgress(sessionId, phase, activityId) {
    try {
      const session = await this.sopSessionsCollection.findOne({ id: sessionId });
      if (!session) return;

      // Update phase progress
      const phaseActivities = Object.keys(GACP_SOP_ACTIVITIES[phase].activities);
      const completedActivities = await this.sopActivitiesCollection.countDocuments({
        sessionId,
        phase,
        complianceStatus: { $in: ['approved', 'completed'] },
      });

      session.phaseProgress[phase].completed = completedActivities;
      session.phaseProgress[phase].percentage = Math.round(
        (completedActivities / session.phaseProgress[phase].total) * 100,
      );

      // Calculate overall progress
      const totalCompleted = Object.values(session.phaseProgress).reduce(
        (sum, p) => sum + p.completed,
        0,
      );
      const totalPossible = Object.values(session.phaseProgress).reduce(
        (sum, p) => sum + p.total,
        0,
      );
      session.overallProgress = Math.round((totalCompleted / totalPossible) * 100);

      // Update compliance score
      const complianceScore = await this.calculateComplianceScore(sessionId);
      session.complianceScore = complianceScore;

      // Check if phase is complete
      if (session.phaseProgress[phase].percentage === 100) {
        const nextPhase = this.getNextPhase(phase);
        if (nextPhase) {
          session.currentPhase = nextPhase;

          // AI Guidance for next phase
          if (this.aiAssistant) {
            const guidance = await this.aiAssistant.provideSOPGuidance({
              action: 'phase_transition',
              fromPhase: phase,
              toPhase: nextPhase,
              sessionContext: session,
            });

            session.aiGuidanceHistory.push(guidance);
          }
        } else {
          // All phases complete
          session.metadata.status = SOP_WORKFLOW_STATES.COMPLETED;
          session.metadata.completedAt = new Date();
        }
      }

      // Update session
      session.metadata.lastActivity = new Date();
      await this.sopSessionsCollection.updateOne({ id: sessionId }, { $set: session });

      this.emit('sop_progress_updated', {
        sessionId,
        phase,
        overallProgress: session.overallProgress,
        complianceScore: session.complianceScore.overall,
      });
    } catch (error) {
      console.error('[SOPWizard] Error updating progress:', error);
    }
  }

  /**
   * คำนวณคะแนน compliance
   */
  async calculateComplianceScore(sessionId) {
    try {
      const activities = await this.sopActivitiesCollection
        .find({
          sessionId,
          complianceStatus: { $in: ['approved', 'completed'] },
        })
        .toArray();

      const scoreByPhase = {};
      let totalScore = 0;

      Object.keys(GACP_SOP_ACTIVITIES).forEach(phase => {
        const phaseActivities = activities.filter(a => a.phase === phase);
        const phaseScore = phaseActivities.reduce((sum, a) => sum + a.compliancePoints, 0);
        scoreByPhase[phase] = phaseScore;
        totalScore += phaseScore;
      });

      return {
        overall: totalScore,
        byPhase: scoreByPhase,
        maxPossible: 345,
        percentage: Math.round((totalScore / 345) * 100),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[SOPWizard] Error calculating compliance:', error);
      return { overall: 0, byPhase: {}, maxPossible: 345, percentage: 0 };
    }
  }

  /**
   * รับ phase ถัดไป
   */
  getNextPhase(currentPhase) {
    const phases = ['pre_planting', 'planting', 'growing', 'harvesting', 'post_harvest'];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  }

  /**
   * รับความคืบหน้าของ session
   */
  async getSessionProgress(sessionId) {
    try {
      const session = await this.sopSessionsCollection.findOne({ id: sessionId });
      if (!session) {
        throw new Error('Session not found');
      }

      // Get recent activities
      const recentActivities = await this.sopActivitiesCollection
        .find({
          sessionId,
        })
        .sort({ recordedAt: -1 })
        .limit(10)
        .toArray();

      // Get available activities for current phase
      const currentPhaseActivities = GACP_SOP_ACTIVITIES[session.currentPhase]?.activities || {};
      const availableActivities = Object.values(currentPhaseActivities);

      return {
        session,
        recentActivities,
        availableActivities,
        nextSteps: await this.getNextSteps(sessionId),
      };
    } catch (error) {
      console.error('[SOPWizard] Error getting progress:', error);
      throw error;
    }
  }

  /**
   * รับขั้นตอนถัดไป
   */
  async getNextSteps(sessionId) {
    try {
      const session = await this.sopSessionsCollection.findOne({ id: sessionId });
      if (!session) return [];

      const currentPhase = session.currentPhase;
      const phaseActivities = GACP_SOP_ACTIVITIES[currentPhase]?.activities || {};

      // Find pending activities
      const completedActivityIds = await this.sopActivitiesCollection.distinct('activityId', {
        sessionId,
        phase: currentPhase,
        complianceStatus: { $in: ['approved', 'completed'] },
      });

      const pendingActivities = Object.entries(phaseActivities)
        .filter(([id]) => !completedActivityIds.includes(id))
        .map(([id, activity]) => ({
          id,
          ...activity,
          phase: currentPhase,
        }));

      return pendingActivities.slice(0, 3); // Next 3 steps
    } catch (error) {
      console.error('[SOPWizard] Error getting next steps:', error);
      return [];
    }
  }

  /**
   * รับสถิติ SOP
   */
  async getSOPStatistics(farmId, userId) {
    try {
      // Active sessions
      const activeSessions = await this.sopSessionsCollection.countDocuments({
        farmId,
        'metadata.status': SOP_WORKFLOW_STATES.IN_PROGRESS,
      });

      // Completed sessions
      const completedSessions = await this.sopSessionsCollection.countDocuments({
        farmId,
        'metadata.status': SOP_WORKFLOW_STATES.COMPLETED,
      });

      // Total activities recorded
      const totalActivities = await this.sopActivitiesCollection.countDocuments({
        farmId,
      });

      // Average compliance score
      const sessions = await this.sopSessionsCollection
        .find({
          farmId,
          'complianceScore.overall': { $gt: 0 },
        })
        .toArray();

      const avgCompliance =
        sessions.length > 0
          ? sessions.reduce((sum, s) => sum + s.complianceScore.overall, 0) / sessions.length
          : 0;

      // Activities by phase
      const activitiesByPhase = await this.sopActivitiesCollection
        .aggregate([{ $match: { farmId } }, { $group: { _id: '$phase', count: { $sum: 1 } } }])
        .toArray();

      return {
        activeSessions,
        completedSessions,
        totalActivities,
        avgCompliance: Math.round(avgCompliance),
        activitiesByPhase: activitiesByPhase.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      };
    } catch (error) {
      console.error('[SOPWizard] Error getting statistics:', error);
      return {
        activeSessions: 0,
        completedSessions: 0,
        totalActivities: 0,
        avgCompliance: 0,
        activitiesByPhase: {},
      };
    }
  }

  /**
   * รับ SOP Dashboard Data
   */
  async getSOPDashboard(farmId, userId) {
    try {
      const statistics = await this.getSOPStatistics(farmId, userId);

      // Recent sessions
      const recentSessions = await this.sopSessionsCollection
        .find({
          farmId,
        })
        .sort({ 'metadata.lastActivity': -1 })
        .limit(5)
        .toArray();

      // Pending reviews
      const pendingReviews = await this.sopActivitiesCollection.countDocuments({
        farmId,
        complianceStatus: 'requires_review',
      });

      // Compliance trends (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const complianceTrends = await this.sopSessionsCollection
        .aggregate([
          {
            $match: {
              farmId,
              'metadata.createdAt': { $gte: sixMonthsAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$metadata.createdAt' },
                month: { $month: '$metadata.createdAt' },
              },
              avgCompliance: { $avg: '$complianceScore.overall' },
              sessionCount: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ])
        .toArray();

      return {
        statistics,
        recentSessions,
        pendingReviews,
        complianceTrends,
      };
    } catch (error) {
      console.error('[SOPWizard] Error getting dashboard:', error);
      throw error;
    }
  }
}

module.exports = {
  GACPSOPWizardSystem,
  GACP_SOP_ACTIVITIES,
  SOP_WORKFLOW_STATES,
};
