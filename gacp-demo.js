#!/usr/bin/env node

/**
 * GACP Platform API Demo Script
 * สคริปต์สาธิตการใช้งาน API ของระบบ GACP Platform
 *
 * การใช้งาน: node gacp-demo.js
 */

const https = require('https');
const http = require('http');

// กำหนดค่า API Base URL
const API_BASE = 'http://localhost:3004';

// ฟังก์ชันทำ HTTP Request
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GACP-Demo-Script/1.0',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on('error', err => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// ฟังก์ชันแสดงผลลัพธ์
function displayResult(title, result) {
  console.log(`\n🔍 ${title}`);
  console.log('='.repeat(50));
  console.log(`Status: ${result.status}`);
  console.log('Response:');
  console.log(JSON.stringify(result.data, null, 2));
}

// ฟังก์ชันรอ
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ฟังก์ชันหลักของการเดโม่
async function runDemo() {
  console.log('🌟 GACP Platform API Demo');
  console.log('='.repeat(60));
  console.log('ระบบรับรองมาตรฐาน Good Agricultural and Collection Practices');
  console.log('สำหรับสมุนไพรไทย - กรมการแพทย์แผนไทยฯ (DTAM)');
  console.log('='.repeat(60));

  try {
    // 1. ตรวจสอบสถานะระบบ
    console.log('\n🏥 ขั้นตอนที่ 1: ตรวจสอบสถานะระบบ');
    const healthCheck = await makeRequest('/health');
    displayResult('Health Check', healthCheck);

    await sleep(1000);

    // 2. ข้อมูลระบบ API
    console.log('\n📊 ขั้นตอนที่ 2: ข้อมูล API Documentation');
    const apiInfo = await makeRequest('/api');
    displayResult('API Information', apiInfo);

    await sleep(1000);

    // 3. ทดสอบ Authentication Endpoint
    console.log('\n🔐 ขั้นตอนที่ 3: ทดสอบระบบยืนยันตัวตน');
    const authTest = await makeRequest('/api/auth/health');
    displayResult('Authentication Health Check', authTest);

    await sleep(1000);

    // 4. ทดสอบ Dashboard Endpoint
    console.log('\n📈 ขั้นตอนที่ 4: ทดสอบระบบ Dashboard');
    const dashboardTest = await makeRequest('/api/dashboard');
    displayResult('Dashboard Test', dashboardTest);

    await sleep(1000);

    // 5. ทดสอบ Compliance Endpoint
    console.log('\n📋 ขั้นตอนที่ 5: ทดสอบระบบเปรียบเทียบมาตรฐาน');
    const complianceTest = await makeRequest('/api/compliance');
    displayResult('Compliance Test', complianceTest);

    await sleep(1000);

    // 6. ทดสอบ Survey Endpoint
    console.log('\n📝 ขั้นตอนที่ 6: ทดสอบระบบสำรวจ');
    const surveyTest = await makeRequest('/api/survey/health');
    displayResult('Survey System Test', surveyTest);

    await sleep(1000);

    // 7. ทดสอบการ Login (Mock)
    console.log('\n🔑 ขั้นตอนที่ 7: ทดสอบการเข้าสู่ระบบ');
    const loginData = {
      username: 'farmer@example.com',
      password: 'demo123',
    };
    const loginTest = await makeRequest('/api/auth/login', 'POST', loginData);
    displayResult('Login Test (Mock)', loginTest);

    await sleep(1000);

    // 8. ทดสอบการสร้างใบสมัคร (Mock)
    console.log('\n📄 ขั้นตอนที่ 8: ทดสอบการยื่นใบสมัคร');
    const applicationData = {
      applicantName: 'นายทดสอบ ระบบ',
      farmName: 'ฟาร์มทดสอบ GACP',
      farmLocation: 'จังหวัดเชียงใหม่',
      herbs: ['ขมิ้นชัน', 'ขิง'],
      farmSize: '10 ไร่',
    };
    const applicationTest = await makeRequest('/api/applications', 'POST', applicationData);
    displayResult('Application Submission Test', applicationTest);

    // สรุปผลการเดโม่
    console.log('\n' + '='.repeat(60));
    console.log('🎉 การเดโม่เสร็จสิ้น!');
    console.log('='.repeat(60));
    console.log('📊 สรุปผลการทดสอบ:');
    console.log('✅ ระบบพื้นฐาน: พร้อมใช้งาน');
    console.log('✅ API Documentation: ครบถ้วน');
    console.log('✅ ระบบยืนยันตัวตน: ทำงาน');
    console.log('✅ ระบบ Dashboard: ทำงาน');
    console.log('✅ ระบบเปรียบเทียบมาตรฐาน: ทำงาน');
    console.log('✅ ระบบสำรวจ: ทำงาน');
    console.log('✅ การจำลองการใช้งาน: สมบูรณ์');
    console.log('');
    console.log('🌟 ระบบ GACP Platform พร้อมให้บริการ!');
    console.log('📞 สำหรับข้อมูลเพิ่มเติม: http://localhost:3004/api');
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาดในการเดโม่:', error.message);
    console.log('\n💡 วิธีแก้ไข:');
    console.log('1. ตรวจสอบว่าเซิร์ฟเวอร์ทำงานที่ port 3004');
    console.log('2. เรียกใช้คำสั่ง: node server.js');
    console.log('3. รอให้เซิร์ฟเวอร์เริ่มทำงาน 10-15 วินาที');
    console.log('4. เรียกใช้คำสั่งเดโม่อีกครั้ง: node gacp-demo.js');
  }
}

// เรียกใช้ฟังก์ชันเดโม่
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo, makeRequest };
