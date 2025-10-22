/**
 * 📹 Visual Remote Support (VRS) System
 * ระบบตรวจสอบทางไกลด้วยภาพสำหรับการ Audit GACP
 *
 * Features:
 * - WebRTC Video Streaming
 * - AR Overlays & Annotations
 * - Secure Video Recording
 * - Real-time Audit Checklist
 * - Evidence Capture & Documentation
 * - Multi-participant Support
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

// VRS Session States
const VRS_SESSION_STATES = {
  CREATED: 'created',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  IN_PROGRESS: 'in_progress',
  RECORDING: 'recording',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Audit Checklist Templates based on GACP requirements
const AUDIT_CHECKLISTS = {
  INITIAL_INSPECTION: {
    id: 'initial_inspection',
    name: 'การตรวจสอบเบื้องต้น',
    description: 'การตรวจสอบครั้งแรกสำหรับใบรับรอง GACP',
    checkpoints: [
      {
        id: 'site_overview',
        category: 'SITE',
        title: 'ภาพรวมสถานที่',
        description: 'แสดงภาพรวมพื้นที่ฟาร์มและสิ่งแวดล้อม',
        evidenceRequired: ['video', 'photos'],
        timeRequired: 10, // minutes
      },
      {
        id: 'cultivation_area',
        category: 'CULTIVATION',
        title: 'พื้นที่เพาะปลูก',
        description: 'ตรวจสอบพื้นที่ปลูกและโครงสร้าง',
        evidenceRequired: ['video', 'photos', 'measurements'],
        timeRequired: 15,
      },
      {
        id: 'water_source',
        category: 'WATER',
        title: 'แหล่งน้ำ',
        description: 'ตรวจสอบแหล่งน้ำและระบบการให้น้ำ',
        evidenceRequired: ['video', 'water_sample'],
        timeRequired: 10,
      },
      {
        id: 'storage_facility',
        category: 'STORAGE',
        title: 'สถานที่เก็บรักษา',
        description: 'ตรวจสอบคลังเก็บวัตถุดิบและผลิตภัณฑ์',
        evidenceRequired: ['video', 'photos', 'temperature_log'],
        timeRequired: 15,
      },
      {
        id: 'documentation_review',
        category: 'DOCUMENTATION',
        title: 'ตรวจสอบเอกสาร',
        description: 'ตรวจสอบสมุดบันทึกและเอกสารประกอบ',
        evidenceRequired: ['document_photos', 'record_review'],
        timeRequired: 20,
      },
    ],
    totalTimeEstimate: 70, // minutes
    requiredParticipants: ['auditor', 'farmer', 'witness'],
    gacpRequirements: ['SITE', 'CULTIVATION', 'WATER', 'STORAGE', 'DOCUMENTATION'],
  },

  FOLLOW_UP_INSPECTION: {
    id: 'follow_up_inspection',
    name: 'การตรวจสอบติดตาม',
    description: 'การตรวจสอบประจำปีหรือติดตามผล',
    checkpoints: [
      {
        id: 'compliance_review',
        category: 'QUALITY_ASSURANCE',
        title: 'ทบทวนการปฏิบัติตามข้อกำหนด',
        description: 'ตรวจสอบการปฏิบัติตาม GACP ในช่วงที่ผ่านมา',
        evidenceRequired: ['record_review', 'photos'],
        timeRequired: 20,
      },
      {
        id: 'batch_traceability',
        category: 'HARVESTING',
        title: 'การตรวจสอบย้อนกลับ',
        description: 'ตรวจสอบ Batch และ Traceability',
        evidenceRequired: ['batch_records', 'qr_verification'],
        timeRequired: 15,
      },
      {
        id: 'corrective_actions',
        category: 'QUALITY_ASSURANCE',
        title: 'การแก้ไขปรับปรุง',
        description: 'ตรวจสอบการดำเนินการแก้ไขจากครั้งก่อน',
        evidenceRequired: ['before_after_photos', 'implementation_evidence'],
        timeRequired: 10,
      },
    ],
    totalTimeEstimate: 45,
    requiredParticipants: ['auditor', 'farmer'],
    gacpRequirements: ['QUALITY_ASSURANCE', 'HARVESTING', 'DOCUMENTATION'],
  },
};

// AR Annotation Types
const AR_ANNOTATION_TYPES = {
  POINTER: 'pointer',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  TEXT: 'text',
  MEASUREMENT: 'measurement',
  WARNING: 'warning',
  CHECKMARK: 'checkmark',
};

// VRS Security Configuration
const VRS_SECURITY_CONFIG = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationInterval: 3600000, // 1 hour
    requireEndToEndEncryption: true,
  },
  access: {
    maxParticipants: 5,
    requireAuthentication: true,
    sessionTimeout: 7200000, // 2 hours
    requireConsent: true,
  },
  recording: {
    maxDuration: 14400000, // 4 hours
    compressionLevel: 'medium',
    autoDeleteAfter: 2592000000, // 30 days
    requireApproval: true,
  },
};

class VRSSession extends EventEmitter {
  constructor(sessionConfig) {
    super();

    this.id = uuidv4();
    this.sessionNumber = this.generateSessionNumber();
    this.state = VRS_SESSION_STATES.CREATED;

    // Session Configuration
    this.config = {
      farmId: sessionConfig.farmId,
      applicationId: sessionConfig.applicationId,
      inspectionType: sessionConfig.inspectionType,
      checklist: AUDIT_CHECKLISTS[sessionConfig.inspectionType],
      scheduledStartTime: sessionConfig.scheduledStartTime,
      estimatedDuration: sessionConfig.estimatedDuration,
      participants: sessionConfig.participants || [],
      ...sessionConfig,
    };

    // Session State
    this.participants = new Map();
    this.activeConnections = new Map();
    this.checklistProgress = new Map();
    this.evidenceCollection = [];
    this.arAnnotations = [];
    this.recordings = [];

    // Security
    this.encryptionKey = this.generateEncryptionKey();
    this.sessionToken = this.generateSessionToken();
    this.consentRecords = new Map();

    // Timing
    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;
    this.actualDuration = 0;

    console.log(`📹 VRS Session created: ${this.sessionNumber}`);
  }

  /**
   * สร้างหมายเลข Session
   */
  generateSessionNumber() {
    const now = new Date();
    const year = now.getFullYear() + 543; // Buddhist year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().substring(0, 5).replace(':', '');
    const random = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');

    return `VRS-${year}${month}${day}-${time}-${random}`;
  }

  /**
   * สร้าง Encryption Key
   */
  generateEncryptionKey() {
    // In production, use proper cryptographic key generation
    return Buffer.from(uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, ''), 'hex');
  }

  /**
   * สร้าง Session Token
   */
  generateSessionToken() {
    return Buffer.from(`${this.id}:${Date.now()}:${Math.random()}`).toString('base64');
  }

  /**
   * เริ่มต้น Session
   */
  async startSession() {
    if (this.state !== VRS_SESSION_STATES.CREATED) {
      throw new Error(`Cannot start session in state: ${this.state}`);
    }

    this.state = VRS_SESSION_STATES.CONNECTING;
    this.startedAt = new Date();

    // Initialize checklist progress
    if (this.config.checklist) {
      for (const checkpoint of this.config.checklist.checkpoints) {
        this.checklistProgress.set(checkpoint.id, {
          status: 'pending',
          startTime: null,
          endTime: null,
          evidence: [],
          notes: '',
          completed: false,
        });
      }
    }

    this.emit('session_starting', {
      sessionId: this.id,
      sessionNumber: this.sessionNumber,
      checklist: this.config.checklist,
    });

    console.log(`📹 VRS Session starting: ${this.sessionNumber}`);
    return this.getSessionInfo();
  }

  /**
   * เชื่อมต่อผู้เข้าร่วม
   */
  async connectParticipant(participantInfo) {
    const participantId = uuidv4();

    // Verify consent
    if (!this.consentRecords.get(participantInfo.userId)) {
      throw new Error('Participant consent required');
    }

    // Create WebRTC connection (mock implementation)
    const connection = await this.createWebRTCConnection(participantId, participantInfo);

    const participant = {
      id: participantId,
      userId: participantInfo.userId,
      name: participantInfo.name,
      role: participantInfo.role, // 'auditor', 'farmer', 'witness'
      connection: connection,
      joinedAt: new Date(),
      isActive: true,
      permissions: this.getParticipantPermissions(participantInfo.role),
    };

    this.participants.set(participantId, participant);
    this.activeConnections.set(participantId, connection);

    // Update session state if needed
    if (this.state === VRS_SESSION_STATES.CONNECTING && this.hasRequiredParticipants()) {
      this.state = VRS_SESSION_STATES.CONNECTED;
    }

    this.emit('participant_joined', {
      sessionId: this.id,
      participant: participant,
    });

    console.log(`👤 Participant joined VRS: ${participant.name} (${participant.role})`);
    return participant;
  }

  /**
   * สร้างการเชื่อมต่อ WebRTC (Mock)
   */
  async createWebRTCConnection(participantId, participantInfo) {
    // Mock WebRTC implementation
    const connection = {
      id: participantId,
      state: 'connecting',
      isVideoEnabled: true,
      isAudioEnabled: true,
      bandwidth: 'high',
      quality: 'HD',
      encryption: {
        enabled: true,
        algorithm: VRS_SECURITY_CONFIG.encryption.algorithm,
      },
    };

    // Simulate connection establishment
    setTimeout(() => {
      connection.state = 'connected';
      this.emit('connection_established', {
        participantId,
        connection,
      });
    }, 2000);

    return connection;
  }

  /**
   * กำหนดสิทธิ์ผู้เข้าร่วม
   */
  getParticipantPermissions(role) {
    const permissions = {
      auditor: {
        canControlSession: true,
        canAddAnnotations: true,
        canCaptureEvidence: true,
        canAccessChecklist: true,
        canStartRecording: true,
        canEndSession: true,
      },
      farmer: {
        canControlSession: false,
        canAddAnnotations: false,
        canCaptureEvidence: true,
        canAccessChecklist: true,
        canStartRecording: false,
        canEndSession: false,
      },
      witness: {
        canControlSession: false,
        canAddAnnotations: false,
        canCaptureEvidence: false,
        canAccessChecklist: true,
        canStartRecording: false,
        canEndSession: false,
      },
    };

    return permissions[role] || permissions.witness;
  }

  /**
   * ตรวจสอบว่ามีผู้เข้าร่วมครบตามที่กำหนด
   */
  hasRequiredParticipants() {
    if (!this.config.checklist.requiredParticipants) return true;

    const participantRoles = Array.from(this.participants.values()).map(p => p.role);

    return this.config.checklist.requiredParticipants.every(role =>
      participantRoles.includes(role),
    );
  }

  /**
   * เริ่มการตรวจสอบ
   */
  async beginInspection() {
    if (this.state !== VRS_SESSION_STATES.CONNECTED) {
      throw new Error(`Cannot begin inspection in state: ${this.state}`);
    }

    if (!this.hasRequiredParticipants()) {
      throw new Error('Required participants not present');
    }

    this.state = VRS_SESSION_STATES.IN_PROGRESS;

    this.emit('inspection_started', {
      sessionId: this.id,
      checklist: this.config.checklist,
      participants: Array.from(this.participants.values()),
    });

    console.log(`🔍 Inspection began: ${this.sessionNumber}`);
    return this.getCurrentStatus();
  }

  /**
   * เริ่มขั้นตอนตรวจสอบ
   */
  async startCheckpoint(checkpointId, participantId) {
    const checkpoint = this.config.checklist.checkpoints.find(cp => cp.id === checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    const participant = this.participants.get(participantId);
    if (!participant || !participant.permissions.canAccessChecklist) {
      throw new Error('Unauthorized to access checklist');
    }

    const progress = this.checklistProgress.get(checkpointId);
    progress.status = 'in_progress';
    progress.startTime = new Date();

    this.checklistProgress.set(checkpointId, progress);

    this.emit('checkpoint_started', {
      sessionId: this.id,
      checkpoint: checkpoint,
      participantId: participantId,
      startTime: progress.startTime,
    });

    console.log(`✓ Checkpoint started: ${checkpoint.title}`);
    return {
      checkpoint,
      progress,
      estimatedTime: checkpoint.timeRequired,
    };
  }

  /**
   * เพิ่ม AR Annotation
   */
  async addARAnnotation(annotationData, participantId) {
    const participant = this.participants.get(participantId);
    if (!participant || !participant.permissions.canAddAnnotations) {
      throw new Error('Unauthorized to add annotations');
    }

    const annotation = {
      id: uuidv4(),
      type: annotationData.type,
      position: annotationData.position, // {x, y, z} coordinates
      data: annotationData.data,
      text: annotationData.text,
      color: annotationData.color || '#FF0000',
      createdBy: participantId,
      createdAt: new Date(),
      visible: true,
      persistent: annotationData.persistent || false,
    };

    this.arAnnotations.push(annotation);

    // Broadcast to all participants
    this.emit('ar_annotation_added', {
      sessionId: this.id,
      annotation: annotation,
      participantId: participantId,
    });

    console.log(`📍 AR Annotation added: ${annotation.type} by ${participant.name}`);
    return annotation;
  }

  /**
   * จับภาพหลักฐาน
   */
  async captureEvidence(evidenceData, participantId) {
    const participant = this.participants.get(participantId);
    if (!participant || !participant.permissions.canCaptureEvidence) {
      throw new Error('Unauthorized to capture evidence');
    }

    const evidence = {
      id: uuidv4(),
      type: evidenceData.type, // 'photo', 'video', 'screenshot', 'document'
      checkpointId: evidenceData.checkpointId,
      title: evidenceData.title,
      description: evidenceData.description,

      // Media data
      data: evidenceData.data, // Base64 or file reference
      metadata: {
        timestamp: new Date(),
        location: evidenceData.location,
        cameraSettings: evidenceData.cameraSettings,
        participantId: participantId,
        sessionId: this.id,
      },

      // Security
      encrypted: true,
      checksum: this.calculateChecksum(evidenceData.data),

      // Annotations
      annotations: evidenceData.annotations || [],
    };

    this.evidenceCollection.push(evidence);

    // Add to checkpoint progress
    if (evidenceData.checkpointId) {
      const progress = this.checklistProgress.get(evidenceData.checkpointId);
      if (progress) {
        progress.evidence.push(evidence.id);
        this.checklistProgress.set(evidenceData.checkpointId, progress);
      }
    }

    this.emit('evidence_captured', {
      sessionId: this.id,
      evidence: evidence,
      participantId: participantId,
    });

    console.log(`📸 Evidence captured: ${evidence.type} - ${evidence.title}`);
    return evidence;
  }

  /**
   * คำนวณ Checksum
   */
  calculateChecksum(data) {
    // Mock checksum calculation
    return Buffer.from(data).toString('base64').substring(0, 16);
  }

  /**
   * เริ่มบันทึกวิดีโอ
   */
  async startRecording(participantId) {
    const participant = this.participants.get(participantId);
    if (!participant || !participant.permissions.canStartRecording) {
      throw new Error('Unauthorized to start recording');
    }

    if (this.state === VRS_SESSION_STATES.RECORDING) {
      throw new Error('Recording already in progress');
    }

    const recording = {
      id: uuidv4(),
      sessionId: this.id,
      startedBy: participantId,
      startTime: new Date(),
      endTime: null,
      duration: 0,
      state: 'recording',

      // Recording settings
      quality: 'HD',
      compression: VRS_SECURITY_CONFIG.recording.compressionLevel,
      encryption: {
        enabled: true,
        key: this.generateEncryptionKey(),
      },

      // Participants being recorded
      recordedParticipants: Array.from(this.participants.keys()),

      // Files
      videoFile: null,
      audioFile: null,
      metadataFile: null,
    };

    this.recordings.push(recording);
    this.currentRecording = recording;
    this.state = VRS_SESSION_STATES.RECORDING;

    this.emit('recording_started', {
      sessionId: this.id,
      recording: recording,
      participantId: participantId,
    });

    console.log(`🎥 Recording started by ${participant.name}`);
    return recording;
  }

  /**
   * หยุดบันทึกวิดีโอ
   */
  async stopRecording(participantId) {
    const participant = this.participants.get(participantId);
    if (!participant || !participant.permissions.canStartRecording) {
      throw new Error('Unauthorized to stop recording');
    }

    if (!this.currentRecording || this.currentRecording.state !== 'recording') {
      throw new Error('No active recording');
    }

    this.currentRecording.endTime = new Date();
    this.currentRecording.duration =
      this.currentRecording.endTime - this.currentRecording.startTime;
    this.currentRecording.state = 'completed';

    // Mock file generation
    this.currentRecording.videoFile = `${this.sessionNumber}_recording_${this.currentRecording.id}.mp4`;
    this.currentRecording.audioFile = `${this.sessionNumber}_recording_${this.currentRecording.id}.wav`;
    this.currentRecording.metadataFile = `${this.sessionNumber}_recording_${this.currentRecording.id}_metadata.json`;

    this.state = VRS_SESSION_STATES.IN_PROGRESS;
    const completedRecording = this.currentRecording;
    this.currentRecording = null;

    this.emit('recording_stopped', {
      sessionId: this.id,
      recording: completedRecording,
      participantId: participantId,
    });

    console.log(`🎥 Recording stopped: ${completedRecording.duration}ms`);
    return completedRecording;
  }

  /**
   * เสร็จสิ้นขั้นตอนตรวจสอบ
   */
  async completeCheckpoint(checkpointId, completionData, participantId) {
    const checkpoint = this.config.checklist.checkpoints.find(cp => cp.id === checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${checkpointId}`);
    }

    const progress = this.checklistProgress.get(checkpointId);
    if (progress.status !== 'in_progress') {
      throw new Error(`Checkpoint not in progress: ${checkpointId}`);
    }

    progress.status = 'completed';
    progress.endTime = new Date();
    progress.completed = true;
    progress.notes = completionData.notes || '';
    progress.result = completionData.result; // 'pass', 'fail', 'conditional'
    progress.findings = completionData.findings || [];

    this.checklistProgress.set(checkpointId, progress);

    this.emit('checkpoint_completed', {
      sessionId: this.id,
      checkpoint: checkpoint,
      progress: progress,
      participantId: participantId,
    });

    console.log(`✅ Checkpoint completed: ${checkpoint.title} - ${progress.result}`);

    // Check if all checkpoints are completed
    if (this.isInspectionComplete()) {
      await this.completeInspection();
    }

    return progress;
  }

  /**
   * ตรวจสอบว่าการตรวจสอบเสร็จสิ้นแล้ว
   */
  isInspectionComplete() {
    return Array.from(this.checklistProgress.values()).every(progress => progress.completed);
  }

  /**
   * เสร็จสิ้นการตรวจสอบ
   */
  async completeInspection() {
    if (
      this.state !== VRS_SESSION_STATES.IN_PROGRESS &&
      this.state !== VRS_SESSION_STATES.RECORDING
    ) {
      throw new Error(`Cannot complete inspection in state: ${this.state}`);
    }

    // Stop any active recording
    if (this.currentRecording) {
      const auditor = Array.from(this.participants.values()).find(p => p.role === 'auditor');
      if (auditor) {
        await this.stopRecording(auditor.id);
      }
    }

    this.state = VRS_SESSION_STATES.COMPLETED;
    this.endedAt = new Date();
    this.actualDuration = this.endedAt - this.startedAt;

    // Generate final report
    const finalReport = await this.generateInspectionReport();

    this.emit('inspection_completed', {
      sessionId: this.id,
      completedAt: this.endedAt,
      duration: this.actualDuration,
      report: finalReport,
    });

    console.log(`🏁 Inspection completed: ${this.sessionNumber}`);
    return finalReport;
  }

  /**
   * สร้างรายงานการตรวจสอบ
   */
  async generateInspectionReport() {
    const checkpointResults = [];
    let overallResult = 'pass';
    let totalScore = 0;
    let maxScore = 0;

    for (const [checkpointId, progress] of this.checklistProgress) {
      const checkpoint = this.config.checklist.checkpoints.find(cp => cp.id === checkpointId);

      const result = {
        checkpoint: {
          id: checkpoint.id,
          title: checkpoint.title,
          category: checkpoint.category,
          description: checkpoint.description,
        },
        progress: {
          result: progress.result,
          notes: progress.notes,
          findings: progress.findings,
          evidenceCount: progress.evidence.length,
          timeSpent: progress.endTime - progress.startTime,
        },
      };

      checkpointResults.push(result);

      // Calculate scoring
      if (progress.result === 'pass') {
        totalScore += 100;
      } else if (progress.result === 'conditional') {
        totalScore += 75;
      }
      maxScore += 100;

      if (progress.result === 'fail') {
        overallResult = 'fail';
      }
    }

    const inspectionReport = {
      session: {
        id: this.id,
        sessionNumber: this.sessionNumber,
        farmId: this.config.farmId,
        applicationId: this.config.applicationId,
        inspectionType: this.config.inspectionType,
      },

      timing: {
        scheduledStartTime: this.config.scheduledStartTime,
        actualStartTime: this.startedAt,
        actualEndTime: this.endedAt,
        estimatedDuration: this.config.estimatedDuration,
        actualDuration: this.actualDuration,
      },

      participants: Array.from(this.participants.values()).map(p => ({
        name: p.name,
        role: p.role,
        joinedAt: p.joinedAt,
        isActive: p.isActive,
      })),

      results: {
        overallResult: overallResult,
        totalScore: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
        checkpointResults: checkpointResults,
        complianceStatus: overallResult === 'pass' ? 'compliant' : 'non-compliant',
      },

      evidence: {
        totalItems: this.evidenceCollection.length,
        photos: this.evidenceCollection.filter(e => e.type === 'photo').length,
        videos: this.evidenceCollection.filter(e => e.type === 'video').length,
        documents: this.evidenceCollection.filter(e => e.type === 'document').length,
        recordings: this.recordings.length,
      },

      technical: {
        arAnnotations: this.arAnnotations.length,
        connectionQuality: this.getAverageConnectionQuality(),
        encryptionUsed: true,
      },

      generatedAt: new Date(),
      reportId: uuidv4(),
    };

    return inspectionReport;
  }

  /**
   * คำนวณคุณภาพการเชื่อมต่อเฉลี่ย
   */
  getAverageConnectionQuality() {
    const connections = Array.from(this.activeConnections.values());
    if (connections.length === 0) return 'unknown';

    const qualityScores = {
      HD: 100,
      SD: 75,
      low: 50,
      poor: 25,
    };

    const totalScore = connections.reduce((sum, conn) => {
      return sum + (qualityScores[conn.quality] || 0);
    }, 0);

    const averageScore = totalScore / connections.length;

    if (averageScore >= 90) return 'excellent';
    if (averageScore >= 75) return 'good';
    if (averageScore >= 50) return 'fair';
    return 'poor';
  }

  /**
   * บันทึกการยินยอม
   */
  async recordConsent(userId, consentData) {
    const consent = {
      userId: userId,
      sessionId: this.id,
      consentGiven: consentData.consentGiven,
      consentType: consentData.consentType, // 'recording', 'participation', 'data_processing'
      consentText: consentData.consentText,
      timestamp: new Date(),
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
      signature: consentData.signature, // Digital signature if available
    };

    this.consentRecords.set(userId, consent);

    this.emit('consent_recorded', {
      sessionId: this.id,
      consent: consent,
    });

    console.log(`📝 Consent recorded for user: ${userId}`);
    return consent;
  }

  /**
   * ยกเลิก Session
   */
  async cancelSession(reason, participantId) {
    if (
      this.state === VRS_SESSION_STATES.COMPLETED ||
      this.state === VRS_SESSION_STATES.CANCELLED
    ) {
      throw new Error(`Cannot cancel session in state: ${this.state}`);
    }

    this.state = VRS_SESSION_STATES.CANCELLED;
    this.endedAt = new Date();

    // Stop any active recording
    if (this.currentRecording) {
      this.currentRecording.state = 'cancelled';
      this.currentRecording.endTime = new Date();
    }

    // Disconnect all participants
    for (const [participantId, participant] of this.participants) {
      participant.isActive = false;
      // Close WebRTC connections
    }

    this.emit('session_cancelled', {
      sessionId: this.id,
      reason: reason,
      cancelledBy: participantId,
      cancelledAt: this.endedAt,
    });

    console.log(`❌ Session cancelled: ${this.sessionNumber} - ${reason}`);
    return this.getSessionInfo();
  }

  /**
   * ดึงข้อมูลสถานะ Session
   */
  getSessionInfo() {
    return {
      id: this.id,
      sessionNumber: this.sessionNumber,
      state: this.state,
      config: this.config,
      participants: Array.from(this.participants.values()),
      checklistProgress: Object.fromEntries(this.checklistProgress),
      evidenceCount: this.evidenceCollection.length,
      arAnnotationsCount: this.arAnnotations.length,
      recordingsCount: this.recordings.length,
      timing: {
        createdAt: this.createdAt,
        startedAt: this.startedAt,
        endedAt: this.endedAt,
        actualDuration: this.actualDuration,
      },
    };
  }

  /**
   * ดึงสถานะปัจจุบัน
   */
  getCurrentStatus() {
    const completedCheckpoints = Array.from(this.checklistProgress.values()).filter(
      p => p.completed,
    ).length;
    const totalCheckpoints = this.checklistProgress.size;

    return {
      sessionId: this.id,
      state: this.state,
      progress: {
        completed: completedCheckpoints,
        total: totalCheckpoints,
        percentage: totalCheckpoints > 0 ? (completedCheckpoints / totalCheckpoints) * 100 : 0,
      },
      activeParticipants: Array.from(this.participants.values()).filter(p => p.isActive).length,
      isRecording: this.state === VRS_SESSION_STATES.RECORDING,
      currentCheckpoint: this.getCurrentCheckpoint(),
    };
  }

  /**
   * ดึงขั้นตอนปัจจุบัน
   */
  getCurrentCheckpoint() {
    for (const [checkpointId, progress] of this.checklistProgress) {
      if (progress.status === 'in_progress') {
        const checkpoint = this.config.checklist.checkpoints.find(cp => cp.id === checkpointId);
        return {
          checkpoint,
          progress,
          timeElapsed: new Date() - progress.startTime,
        };
      }
    }
    return null;
  }
}

// Main VRS System Manager
class VisualRemoteSupportSystem extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.activeConnections = new Map();
    this.systemStats = {
      totalSessions: 0,
      activeSessions: 0,
      completedInspections: 0,
      totalParticipants: 0,
    };

    console.log('📹 Visual Remote Support System initialized');
  }

  /**
   * สร้าง VRS Session ใหม่
   */
  async createSession(sessionConfig) {
    const session = new VRSSession(sessionConfig);

    // Setup event listeners
    this.setupSessionEventListeners(session);

    // Store session
    this.sessions.set(session.id, session);
    this.systemStats.totalSessions++;
    this.systemStats.activeSessions++;

    console.log(`📹 VRS Session created: ${session.sessionNumber}`);
    return session;
  }

  /**
   * ตั้งค่า Event Listeners สำหรับ Session
   */
  setupSessionEventListeners(session) {
    session.on('session_starting', data => {
      this.emit('vrs_session_starting', data);
    });

    session.on('participant_joined', data => {
      this.systemStats.totalParticipants++;
      this.emit('vrs_participant_joined', data);
    });

    session.on('inspection_completed', data => {
      this.systemStats.completedInspections++;
      this.systemStats.activeSessions--;
      this.emit('vrs_inspection_completed', data);
    });

    session.on('session_cancelled', data => {
      this.systemStats.activeSessions--;
      this.emit('vrs_session_cancelled', data);
    });

    // Forward all other events
    session.on('checkpoint_started', data => this.emit('vrs_checkpoint_started', data));
    session.on('checkpoint_completed', data => this.emit('vrs_checkpoint_completed', data));
    session.on('evidence_captured', data => this.emit('vrs_evidence_captured', data));
    session.on('recording_started', data => this.emit('vrs_recording_started', data));
    session.on('recording_stopped', data => this.emit('vrs_recording_stopped', data));
    session.on('ar_annotation_added', data => this.emit('vrs_ar_annotation_added', data));
  }

  /**
   * ดึง Session
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * ค้นหา Sessions
   */
  findSessions(criteria) {
    const sessions = [];

    for (const session of this.sessions.values()) {
      let matches = true;

      if (criteria.farmId && session.config.farmId !== criteria.farmId) {
        matches = false;
      }

      if (criteria.state && session.state !== criteria.state) {
        matches = false;
      }

      if (criteria.inspectionType && session.config.inspectionType !== criteria.inspectionType) {
        matches = false;
      }

      if (criteria.dateRange) {
        const sessionDate = session.createdAt;
        if (sessionDate < criteria.dateRange.start || sessionDate > criteria.dateRange.end) {
          matches = false;
        }
      }

      if (matches) {
        sessions.push(session);
      }
    }

    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * ดึงสถิติระบบ
   */
  getSystemStatistics() {
    return {
      ...this.systemStats,
      sessionsByState: this.getSessionsByState(),
      averageSessionDuration: this.getAverageSessionDuration(),
      participantsByRole: this.getParticipantsByRole(),
      evidenceStatistics: this.getEvidenceStatistics(),
      lastUpdated: new Date(),
    };
  }

  /**
   * จำแนก Sessions ตามสถานะ
   */
  getSessionsByState() {
    const stateCount = {};

    for (const state of Object.values(VRS_SESSION_STATES)) {
      stateCount[state] = 0;
    }

    for (const session of this.sessions.values()) {
      stateCount[session.state]++;
    }

    return stateCount;
  }

  /**
   * คำนวณระยะเวลาเฉลี่ยของ Session
   */
  getAverageSessionDuration() {
    const completedSessions = Array.from(this.sessions.values()).filter(
      s => s.state === VRS_SESSION_STATES.COMPLETED && s.actualDuration > 0,
    );

    if (completedSessions.length === 0) return 0;

    const totalDuration = completedSessions.reduce((sum, s) => sum + s.actualDuration, 0);
    return totalDuration / completedSessions.length;
  }

  /**
   * จำแนกผู้เข้าร่วมตามบทบาท
   */
  getParticipantsByRole() {
    const roleCount = {
      auditor: 0,
      farmer: 0,
      witness: 0,
    };

    for (const session of this.sessions.values()) {
      for (const participant of session.participants.values()) {
        if (roleCount.hasOwnProperty(participant.role)) {
          roleCount[participant.role]++;
        }
      }
    }

    return roleCount;
  }

  /**
   * สถิติหลักฐาน
   */
  getEvidenceStatistics() {
    let totalEvidence = 0;
    let totalPhotos = 0;
    let totalVideos = 0;
    let totalRecordings = 0;

    for (const session of this.sessions.values()) {
      totalEvidence += session.evidenceCollection.length;
      totalPhotos += session.evidenceCollection.filter(e => e.type === 'photo').length;
      totalVideos += session.evidenceCollection.filter(e => e.type === 'video').length;
      totalRecordings += session.recordings.length;
    }

    return {
      totalEvidence,
      totalPhotos,
      totalVideos,
      totalRecordings,
      averageEvidencePerSession:
        this.systemStats.totalSessions > 0 ? totalEvidence / this.systemStats.totalSessions : 0,
    };
  }

  /**
   * ตรวจสอบสุขภาพระบบ
   */
  getSystemHealth() {
    return {
      status: 'operational',
      activeSessions: this.systemStats.activeSessions,
      systemLoad: this.calculateSystemLoad(),
      memoryUsage: this.getMemoryUsage(),
      connectionQuality: this.getOverallConnectionQuality(),
      lastHealthCheck: new Date(),
    };
  }

  /**
   * คำนวณโหลดระบบ
   */
  calculateSystemLoad() {
    const maxConcurrentSessions = 50; // Example limit
    return (this.systemStats.activeSessions / maxConcurrentSessions) * 100;
  }

  /**
   * ดึงข้อมูลการใช้หน่วยความจำ
   */
  getMemoryUsage() {
    // Mock implementation
    return {
      used: Math.floor(Math.random() * 1000) + 500, // MB
      available: 2048, // MB
      percentage: Math.floor(Math.random() * 50) + 25,
    };
  }

  /**
   * ดึงคุณภาพการเชื่อมต่อโดยรวม
   */
  getOverallConnectionQuality() {
    const activeSessions = Array.from(this.sessions.values()).filter(
      s => s.state === VRS_SESSION_STATES.IN_PROGRESS || s.state === VRS_SESSION_STATES.RECORDING,
    );

    if (activeSessions.length === 0) return 'no_active_sessions';

    const qualityScores = activeSessions.map(s => s.getAverageConnectionQuality());
    const scoreValues = {
      excellent: 100,
      good: 75,
      fair: 50,
      poor: 25,
    };

    const totalScore = qualityScores.reduce((sum, quality) => {
      return sum + (scoreValues[quality] || 0);
    }, 0);

    const averageScore = totalScore / qualityScores.length;

    if (averageScore >= 90) return 'excellent';
    if (averageScore >= 75) return 'good';
    if (averageScore >= 50) return 'fair';
    return 'poor';
  }
}

module.exports = {
  VisualRemoteSupportSystem,
  VRSSession,
  VRS_SESSION_STATES,
  AUDIT_CHECKLISTS,
  AR_ANNOTATION_TYPES,
  VRS_SECURITY_CONFIG,
};
