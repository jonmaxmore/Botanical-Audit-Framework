/**
 * Email Templates
 * Professional email templates for GACP Platform notifications
 */

/**
 * Generate base HTML template
 */
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GACP Platform</title>
  <style>
    body {
      font-family: 'Sarabun', 'Tahoma', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2e7d32 0%, #4caf50 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #4caf50;
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background: #45a049;
    }
    .footer {
      background: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .info-box {
      background: #f0f7f0;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
    }
    .warning-box {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>
        <strong>GACP Platform</strong><br>
        กรมการปกครอง กระทรวงมหาดไทย<br>
        Department of Provincial Administration, Ministry of Interior
      </p>
      <p style="font-size: 11px; color: #999;">
        อีเมลนี้ส่งโดยระบบอัตโนมัติ กรุณาอย่าตอบกลับ<br>
        This is an automated email. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome Email (Farmer Registration)
 */
function welcomeEmail(userName, email, farmName) {
  const content = `
    <div class="header">
      <h1>🌾 ยินดีต้อนรับสู่ GACP Platform</h1>
    </div>
    <div class="content">
      <h2>สวัสดีครับ/ค่ะ คุณ${userName}</h2>
      <p>ขอบคุณที่ลงทะเบียนใช้งานระบบ GACP Platform สำหรับการยื่นขอรับรอง GACP (Good Agricultural and Collection Practices)</p>
      
      <div class="info-box">
        <strong>ข้อมูลบัญชีของคุณ:</strong><br>
        📧 อีเมล: ${email}<br>
        🏡 ชื่อฟาร์ม: ${farmName || 'ยังไม่ระบุ'}
      </div>

      <h3>ขั้นตอนถัดไป:</h3>
      <ol>
        <li>เข้าสู่ระบบด้วยอีเมลและรหัสผ่านของคุณ</li>
        <li>กรอกข้อมูลฟาร์มให้ครบถ้วน</li>
        <li>เตรียมเอกสารที่จำเป็นสำหรับการยื่นขอรับรอง</li>
        <li>ส่งคำขอรับรองและรอการตรวจสอบจากเจ้าหน้าที่</li>
      </ol>

      <p style="text-align: center;">
        <a href="${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/login" class="button">
          เข้าสู่ระบบ
        </a>
      </p>

      <p>หากมีข้อสงสัยประการใด กรุณาติดต่อ:</p>
      <ul>
        <li>📞 โทร: 02-XXX-XXXX</li>
        <li>📧 อีเมล: support@gacp.dtam.go.th</li>
        <li>⏰ วันจันทร์-ศุกร์ 08:30-16:30 น.</li>
      </ul>
    </div>
  `;

  return {
    subject: '🌾 ยินดีต้อนรับสู่ GACP Platform - ลงทะเบียนสำเร็จ',
    html: baseTemplate(content),
    text: `ยินดีต้อนรับสู่ GACP Platform\n\nสวัสดี คุณ${userName}\n\nขอบคุณที่ลงทะเบียนใช้งานระบบ GACP Platform\n\nอีเมล: ${email}\nชื่อฟาร์ม: ${farmName || 'ยังไม่ระบุ'}\n\nกรุณาเข้าสู่ระบบที่: ${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/login`
  };
}

/**
 * Password Reset Email
 */
function passwordResetEmail(userName, resetToken) {
  const resetUrl = `${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/reset-password?token=${resetToken}`;
  const content = `
    <div class="header">
      <h1>🔐 รีเซ็ตรหัสผ่าน</h1>
    </div>
    <div class="content">
      <h2>สวัสดีครับ/ค่ะ คุณ${userName}</h2>
      <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชี GACP Platform</p>
      
      <div class="warning-box">
        <strong>⚠️ ข้อควรระวัง:</strong><br>
        ลิงก์นี้จะหมดอายุภายใน <strong>1 ชั่วโมง</strong><br>
        หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
      </div>

      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">
          รีเซ็ตรหัสผ่าน
        </a>
      </p>

      <p style="font-size: 12px; color: #666;">
        หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br>
        <code style="background: #f0f0f0; padding: 5px; display: block; margin-top: 5px;">${resetUrl}</code>
      </p>

      <p>เพื่อความปลอดภัย กรุณา:</p>
      <ul>
        <li>ไม่แชร์ลิงก์นี้กับผู้อื่น</li>
        <li>ตรวจสอบว่าคุณอยู่ที่เว็บไซต์ที่ถูกต้อง</li>
        <li>ใช้รหัสผ่านที่แข็งแรง (อย่างน้อย 8 ตัวอักษร)</li>
      </ul>
    </div>
  `;

  return {
    subject: '🔐 รีเซ็ตรหัสผ่าน - GACP Platform',
    html: baseTemplate(content),
    text: `รีเซ็ตรหัสผ่าน GACP Platform\n\nสวัสดี คุณ${userName}\n\nคุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกลิงก์นี้:\n${resetUrl}\n\nลิงก์จะหมดอายุภายใน 1 ชั่วโมง`
  };
}

/**
 * Application Submitted Email
 */
function applicationSubmittedEmail(userName, applicationNumber, farmName) {
  const content = `
    <div class="header">
      <h1>📋 ได้รับคำขอรับรองแล้ว</h1>
    </div>
    <div class="content">
      <h2>สวัสดีครับ/ค่ะ คุณ${userName}</h2>
      <p>เราได้รับคำขอรับรอง GACP ของคุณเรียบร้อยแล้ว</p>
      
      <div class="info-box">
        <strong>รายละเอียดคำขอ:</strong><br>
        📝 เลขที่คำขอ: <strong>${applicationNumber}</strong><br>
        🏡 ชื่อฟาร์ม: ${farmName}<br>
        📅 วันที่ส่ง: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <h3>ขั้นตอนต่อไป:</h3>
      <ol>
        <li>เจ้าหน้าที่จะตรวจสอบเอกสารของคุณ (3-5 วันทำการ)</li>
        <li>หากเอกสารครบถ้วน จะนัดหมายตรวจสอบภาคสนาม</li>
        <li>ผู้ตรวจจะเข้าตรวจสอบฟาร์ม</li>
        <li>รับใบรับรอง GACP หากผ่านเกณฑ์</li>
      </ol>

      <p style="text-align: center;">
        <a href="${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/applications/${applicationNumber}" class="button">
          ดูสถานะคำขอ
        </a>
      </p>

      <p>คุณสามารถติดตามสถานะคำขอได้ตลอดเวลาในระบบ</p>
    </div>
  `;

  return {
    subject: `📋 ได้รับคำขอรับรอง ${applicationNumber} - GACP Platform`,
    html: baseTemplate(content),
    text: `ได้รับคำขอรับรอง GACP\n\nสวัสดี คุณ${userName}\n\nเลขที่คำขอ: ${applicationNumber}\nชื่อฟาร์ม: ${farmName}\n\nเจ้าหน้าที่จะตรวจสอบเอกสารภายใน 3-5 วันทำการ`
  };
}

/**
 * Application Approved Email
 */
function applicationApprovedEmail(userName, applicationNumber, farmName, certificateNumber) {
  const content = `
    <div class="header">
      <h1>🎉 คำขอได้รับการอนุมัติแล้ว!</h1>
    </div>
    <div class="content">
      <h2>ขอแสดงความยินดี คุณ${userName}!</h2>
      <p>คำขอรับรอง GACP ของคุณได้รับการอนุมัติแล้ว</p>
      
      <div class="info-box">
        <strong>🎊 รายละเอียดการอนุมัติ:</strong><br>
        📝 เลขที่คำขอ: ${applicationNumber}<br>
        🏆 เลขที่ใบรับรอง: <strong>${certificateNumber}</strong><br>
        🏡 ชื่อฟาร์ม: ${farmName}<br>
        📅 วันที่อนุมัติ: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <p>คุณสามารถดาวน์โหลดใบรับรอง GACP ได้แล้ว!</p>

      <p style="text-align: center;">
        <a href="${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/certificates/${certificateNumber}" class="button">
          📥 ดาวน์โหลดใบรับรอง
        </a>
      </p>

      <h3>ข้อควรรู้:</h3>
      <ul>
        <li>ใบรับรองมีอายุ <strong>2 ปี</strong> นับจากวันที่ออกใบรับรอง</li>
        <li>ระบบจะแจ้งเตือนก่อนหมดอายุ 3 เดือนและ 1 เดือน</li>
        <li>คุณสามารถต่ออายุใบรับรองได้ก่อนหมดอายุ</li>
        <li>กรุณารักษามาตรฐาน GACP ไว้อย่างต่อเนื่อง</li>
      </ul>

      <p>ขอบคุณที่ไว้วางใจใช้บริการ GACP Platform</p>
    </div>
  `;

  return {
    subject: `🎉 คำขอ ${applicationNumber} ได้รับการอนุมัติ - GACP Platform`,
    html: baseTemplate(content),
    text: `คำขอรับรอง GACP ได้รับการอนุมัติ!\n\nขอแสดงความยินดี คุณ${userName}\n\nเลขที่คำขอ: ${applicationNumber}\nเลขที่ใบรับรอง: ${certificateNumber}\nชื่อฟาร์ม: ${farmName}\n\nดาวน์โหลดใบรับรองได้ที่: ${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/certificates/${certificateNumber}`
  };
}

/**
 * Application Rejected Email
 */
function applicationRejectedEmail(userName, applicationNumber, farmName, reason) {
  const content = `
    <div class="header" style="background: linear-gradient(135deg, #d32f2f 0%, #f44336 100%);">
      <h1>❌ คำขอไม่ผ่านการพิจารณา</h1>
    </div>
    <div class="content">
      <h2>สวัสดีครับ/ค่ะ คุณ${userName}</h2>
      <p>เราเสียใจที่ต้องแจ้งให้ทราบว่า คำขอรับรอง GACP ของคุณไม่ผ่านการพิจารณา</p>
      
      <div class="warning-box">
        <strong>📝 รายละเอียดคำขอ:</strong><br>
        เลขที่คำขอ: ${applicationNumber}<br>
        ชื่อฟาร์ม: ${farmName}<br><br>
        <strong>เหตุผล:</strong><br>
        ${reason || 'เอกสารไม่ครบถ้วนหรือไม่เป็นไปตามมาตรฐาน'}
      </div>

      <h3>ขั้นตอนถัดไป:</h3>
      <ul>
        <li>ตรวจสอบเหตุผลที่ไม่ผ่านการพิจารณา</li>
        <li>แก้ไขปรับปรุงตามข้อเสนอแนะ</li>
        <li>ยื่นคำขอใหม่อีกครั้งเมื่อพร้อม</li>
      </ul>

      <p style="text-align: center;">
        <a href="${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/applications/${applicationNumber}" class="button" style="background: #d32f2f;">
          ดูรายละเอียด
        </a>
      </p>

      <p>หากต้องการคำปรึกษาเพิ่มเติม กรุณาติดต่อเจ้าหน้าที่:<br>
      📞 โทร: 02-XXX-XXXX | 📧 อีเมล: support@gacp.dtam.go.th</p>
    </div>
  `;

  return {
    subject: `❌ คำขอ ${applicationNumber} ไม่ผ่านการพิจารณา - GACP Platform`,
    html: baseTemplate(content),
    text: `คำขอรับรอง GACP ไม่ผ่านการพิจารณา\n\nสวัสดี คุณ${userName}\n\nเลขที่คำขอ: ${applicationNumber}\nชื่อฟาร์ม: ${farmName}\n\nเหตุผล: ${reason}\n\nคุณสามารถแก้ไขและยื่นคำขอใหม่ได้`
  };
}

/**
 * Certificate Expiring Soon Email
 */
function certificateExpiringEmail(userName, certificateNumber, farmName, daysLeft) {
  const content = `
    <div class="header" style="background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);">
      <h1>⚠️ ใบรับรองใกล้หมดอายุ</h1>
    </div>
    <div class="content">
      <h2>สวัสดีครับ/ค่ะ คุณ${userName}</h2>
      <p>ใบรับรอง GACP ของคุณจะหมดอายุในอีก <strong>${daysLeft} วัน</strong></p>
      
      <div class="warning-box">
        <strong>📋 รายละเอียดใบรับรอง:</strong><br>
        เลขที่ใบรับรอง: ${certificateNumber}<br>
        ชื่อฟาร์ม: ${farmName}<br>
        เหลือเวลา: <strong>${daysLeft} วัน</strong>
      </div>

      <h3>กรุณาดำเนินการต่ออายุ:</h3>
      <ol>
        <li>ยื่นคำขอต่ออายุใบรับรอง</li>
        <li>เตรียมเอกสารที่จำเป็น</li>
        <li>รอการตรวจสอบจากเจ้าหน้าที่</li>
      </ol>

      <p style="text-align: center;">
        <a href="${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/certificates/${certificateNumber}/renew" class="button" style="background: #ff9800;">
          🔄 ต่ออายุใบรับรอง
        </a>
      </p>

      <p>หากไม่ดำเนินการต่ออายุ ใบรับรองจะหมดอายุและคุณจะต้องยื่นขอรับรองใหม่</p>
    </div>
  `;

  return {
    subject: `⚠️ ใบรับรอง ${certificateNumber} ใกล้หมดอายุ (เหลือ ${daysLeft} วัน) - GACP Platform`,
    html: baseTemplate(content),
    text: `ใบรับรอง GACP ใกล้หมดอายุ\n\nสวัสดี คุณ${userName}\n\nเลขที่ใบรับรอง: ${certificateNumber}\nชื่อฟาร์ม: ${farmName}\nเหลือเวลา: ${daysLeft} วัน\n\nกรุณาดำเนินการต่ออายุที่: ${process.env.FARMER_PORTAL_URL || 'https://gacp.dtam.go.th'}/certificates/${certificateNumber}/renew`
  };
}

module.exports = {
  welcomeEmail,
  passwordResetEmail,
  applicationSubmittedEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
  certificateExpiringEmail
};
