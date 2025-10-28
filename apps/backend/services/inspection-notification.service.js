class InspectionNotificationService {
  constructor(io) {
    this.io = io;
  }

  async notifyInspectionStarted(inspectionId, farmerId, inspectorName) {
    const message = `Inspector ${inspectorName} กำลังตรวจสอบคำขอของคุณ`;
    
    this.io.to(`user_${farmerId}`).emit('notification', {
      type: 'inspection_started',
      inspectionId,
      message,
      timestamp: new Date()
    });

    // TODO: Send email/SMS
  }

  async notifyVideoCallScheduled(inspectionId, farmerId, scheduledTime) {
    const message = `นัดหมาย Video Call วันที่ ${scheduledTime}`;
    
    this.io.to(`user_${farmerId}`).emit('notification', {
      type: 'video_call_scheduled',
      inspectionId,
      message,
      scheduledTime,
      timestamp: new Date()
    });

    // TODO: Send email/SMS with calendar invite
  }

  async notifyVideoCallStarting(inspectionId, farmerId, inspectorId) {
    this.io.to(`user_${farmerId}`).emit('notification', {
      type: 'video_call_starting',
      inspectionId,
      message: 'Inspector กำลังเริ่ม Video Call',
      timestamp: new Date()
    });

    this.io.to(`user_${inspectorId}`).emit('notification', {
      type: 'video_call_starting',
      inspectionId,
      message: 'Farmer เข้าร่วม Video Call แล้ว',
      timestamp: new Date()
    });
  }

  async notifyInspectionCompleted(inspectionId, farmerId, decision) {
    const messages = {
      approve: '✅ ผ่านการตรวจสอบ! กำลังส่งไปยังผู้อนุมัติ',
      need_onsite: '❓ จำเป็นต้องตรวจสอบ Onsite - รอการนัดหมาย',
      reject: '❌ คำขอถูกปฏิเสธ - กรุณาแก้ไขและยื่นใหม่'
    };

    this.io.to(`user_${farmerId}`).emit('notification', {
      type: 'inspection_completed',
      inspectionId,
      decision,
      message: messages[decision],
      timestamp: new Date()
    });

    // TODO: Send email/SMS
  }

  async notifyApprover(applicationId, approverId) {
    this.io.to(`user_${approverId}`).emit('notification', {
      type: 'pending_approval',
      applicationId,
      message: 'คำขอใหม่รอการอนุมัติ',
      timestamp: new Date()
    });
  }
}

module.exports = InspectionNotificationService;
