// GACP Farmer Simulation JavaScript Functions
// ฟังก์ชันจำลองการทำงานของเกษตรกร

class FarmerSimulation {
  constructor() {
    this.currentUser = {
      role: 'farmer',
      id: 'F001',
      name: 'นายสมชาย ใจดี',
      farmId: 'FARM001',
    };

    this.applicationData = {
      id: null,
      status: 'draft',
      submittedAt: null,
      personalInfo: {},
      farmInfo: {},
      documents: [],
      checklistResponse: null,
    };

    this.mockDocuments = [
      {
        id: 'DOC001',
        type: 'id_card',
        title: 'สำเนาบัตรประชาชน',
        file: 'id_card_somchai.pdf',
        uploadedAt: new Date(),
        status: 'verified',
      },
      {
        id: 'DOC002',
        type: 'land_document',
        title: 'โฉนดที่ดิน',
        file: 'land_deed_123456.pdf',
        uploadedAt: new Date(),
        status: 'pending',
      },
    ];

    this.checklistData = {
      sectionA: {
        title: 'ข้อมูลทั่วไปของไร่',
        items: [
          {
            id: 'A1',
            question: 'มีการจัดทำแผนผังไร่/แปลงปลูกหรือไม่?',
            type: 'yes_no',
            required: true,
            answer: null,
          },
          {
            id: 'A2',
            question: 'มีการบันทึกข้อมูลการปลูกหรือไม่?',
            type: 'yes_no',
            required: true,
            answer: null,
          },
        ],
      },
      sectionB: {
        title: 'การจัดการดิน',
        items: [
          {
            id: 'B1',
            question: 'มีการวิเคราะห์ดินในช่วง 3 ปีที่ผ่านมาหรือไม่?',
            type: 'yes_no',
            required: true,
            answer: null,
          },
          {
            id: 'B2',
            question: 'ค่า pH ของดิน',
            type: 'number',
            required: true,
            answer: null,
            unit: 'pH',
          },
        ],
      },
    };
  }

  // จำลองการกรอกข้อมูลส่วนตัว
  fillPersonalInfo() {
    const personalInfo = {
      fullName: 'นายสมชาย ใจดี',
      idCard: '1234567890123',
      birthDate: '1980-05-15',
      phone: '081-234-5678',
      email: 'somchai@email.com',
      address: '123 หมู่ 4 ตำบลบางใหญ่ อำเภอบางใหญ่ จังหวัดนนทบุรี 11140',
    };

    this.applicationData.personalInfo = personalInfo;
    return personalInfo;
  }

  // จำลองการกรอกข้อมูลไร่
  fillFarmInfo() {
    const farmInfo = {
      farmName: 'ไร่สมชายออร์แกนิค',
      farmArea: 5.5,
      cropType: 'ผักใบเขียว',
      farmingSystem: 'เกษตรอินทรีย์',
      location: '456 หมู่ 7 ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120',
      coordinates: {
        latitude: 14.0722,
        longitude: 100.6014,
      },
      plantingMethod: 'ปลูกในแปลง',
      waterSource: 'บ่อบาดาล',
      description: 'ปลูกผักใบเขียวแบบออร์แกนิก ใช้น้ำจากบ่อบาดาล มีระบบสปริงเกลอร์',
    };

    this.applicationData.farmInfo = farmInfo;
    return farmInfo;
  }

  // จำลองการอัปโหลดเอกสาร
  uploadDocument(documentType, fileName) {
    const newDoc = {
      id: 'DOC' + (this.applicationData.documents.length + 1).toString().padStart(3, '0'),
      type: documentType,
      fileName: fileName,
      uploadedAt: new Date(),
      status: 'uploaded',
      size: Math.floor(Math.random() * 5000) + 1000, // KB
    };

    this.applicationData.documents.push(newDoc);
    return newDoc;
  }

  // จำลองการกรอก RC Checklist
  fillChecklistItem(sectionId, itemId, answer, comment = '') {
    if (this.checklistData[sectionId] && this.checklistData[sectionId].items) {
      const item = this.checklistData[sectionId].items.find(i => i.id === itemId);
      if (item) {
        item.answer = answer;
        item.comment = comment;
        item.answeredAt = new Date();

        return true;
      }
    }
    return false;
  }

  // จำลองการส่งคำขอ
  submitApplication() {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (
      !this.applicationData.personalInfo.fullName ||
      !this.applicationData.farmInfo.farmName ||
      this.applicationData.documents.length < 2
    ) {
      console.error('❌ ข้อมูลไม่ครบถ้วน ไม่สามารถส่งคำขอได้');
      return false;
    }

    // สร้างหมายเลขคำขอ
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.applicationData.id = `GACP${year}${randomNum}`;
    this.applicationData.status = 'submitted';
    this.applicationData.submittedAt = new Date();

    return this.applicationData;
  }

  // จำลองการตรวจสอบสถานะ
  checkApplicationStatus() {
    const statuses = [
      { status: 'submitted', description: 'ได้รับคำขอแล้ว', icon: '📨' },
      { status: 'document_review', description: 'กำลังตรวจสอบเอกสาร', icon: '📋' },
      { status: 'inspection_scheduled', description: 'นัดหมายวันตรวจไร่', icon: '📅' },
      { status: 'inspection_completed', description: 'ตรวจไร่เสร็จสิ้น', icon: '✅' },
      { status: 'approved', description: 'อนุมัติแล้ว', icon: '🏆' },
    ];

    const currentStatus = statuses.find(s => s.status === this.applicationData.status);
    return currentStatus;
  }

  // จำลองการรับใบรับรอง
  getCertificate() {
    if (this.applicationData.status === 'approved') {
      const certificate = {
        certificateId: `CERT${new Date().getFullYear()}${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`,
        farmName: this.applicationData.farmInfo.farmName,
        farmerName: this.applicationData.personalInfo.fullName,
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
        standard: 'GACP (Good Agricultural Practices)',
        scope: this.applicationData.farmInfo.cropType,
      };

      return certificate;
    } else {
      return null;
    }
  }

  // จำลองการดำเนินการแบบอัตโนมัติ (Auto-fill)
  simulateCompleteProcess() {
    // ขั้นตอนที่ 1: กรอกข้อมูลส่วนตัว
    setTimeout(() => {
      this.fillPersonalInfo();
    }, 1000);

    // ขั้นตอนที่ 2: กรอกข้อมูลไร่
    setTimeout(() => {
      this.fillFarmInfo();
    }, 2000);

    // ขั้นตอนที่ 3: อัปโหลดเอกสาร
    setTimeout(() => {
      this.uploadDocument('id_card', 'บัตรประชาชน_สมชาย.pdf');
      this.uploadDocument('land_document', 'โฉนดที่ดิน_123456.pdf');
      this.uploadDocument('farm_map', 'แผนที่ไร่_สมชาย.jpg');
    }, 3000);

    // ขั้นตอนที่ 4: กรอก Checklist
    setTimeout(() => {
      this.fillChecklistItem('sectionA', 'A1', 'yes', 'มีแผนผังไร่แสดงขอบเขตและตำแหน่งแปลงปลูก');
      this.fillChecklistItem('sectionA', 'A2', 'yes', 'มีสมุดบันทึกการปลูกและการดูแล');
      this.fillChecklistItem('sectionB', 'B1', 'yes', 'วิเคราะห์ดินเมื่อปี 2023');
      this.fillChecklistItem('sectionB', 'B2', 6.5, 'ค่า pH อยู่ในเกณฑ์เหมาะสม');
    }, 4000);

    // ขั้นตอนที่ 5: ส่งคำขอ
    setTimeout(() => {
      const result = this.submitApplication();
      if (result) {
        console.log('Application submitted successfully');
      }
    }, 5000);
  }

  // ฟังก์ชันแสดงข้อมูลปัจจุบัน
  showCurrentData() {
    return this.applicationData;
  }
}

// การใช้งาน
const farmerSim = new FarmerSimulation();

// ตัวอย่างการใช้งานแบบ Manual
function manualDemo() {
  // เกษตรกรกรอกข้อมูลทีละขั้นตอน
  farmerSim.fillPersonalInfo();
  farmerSim.fillFarmInfo();
  farmerSim.uploadDocument('id_card', 'บัตรประชาชน.pdf');
  farmerSim.uploadDocument('land_document', 'โฉนดที่ดิน.pdf');

  // กรอก Checklist
  farmerSim.fillChecklistItem('sectionA', 'A1', 'yes');
  farmerSim.fillChecklistItem('sectionA', 'A2', 'yes');

  // ส่งคำขอ
  farmerSim.submitApplication();
  farmerSim.checkApplicationStatus();
}

// ตัวอย่างการใช้งานแบบ Auto
function autoDemo() {
  farmerSim.simulateCompleteProcess();
}

// Export สำหรับใช้ใน HTML
if (typeof window !== 'undefined') {
  window.FarmerSimulation = FarmerSimulation;
  window.farmerSim = new FarmerSimulation();
  window.manualDemo = manualDemo;
  window.autoDemo = autoDemo;
}

// Export สำหรับ Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FarmerSimulation, manualDemo, autoDemo };
}
