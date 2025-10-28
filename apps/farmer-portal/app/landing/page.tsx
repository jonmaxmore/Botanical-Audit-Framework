'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-2xl">🌿</div>
            <span className="text-2xl font-bold text-green-800">GACP Platform</span>
          </div>
          <div className="flex space-x-3">
            <Link href="/login" className="px-4 py-2 text-green-600 hover:text-green-700">เข้าสู่ระบบ</Link>
            <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">ลงทะเบียน</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
              🇹🇭 รองรับมาตรฐาน GACP ประเทศไทย
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              ระบบรับรอง<br />
              <span className="text-green-600">GACP ดิจิทัล</span><br />
              สำหรับกัญชาและพืชสมุนไพร
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              ยื่นขอใบรับรอง GACP ออนไลน์ ติดตามสถานะแบบเรียลไทม์ พร้อมระบบ Smart Farming ช่วยเพิ่มผลผลิต
            </p>
            <div className="flex space-x-4">
              <Link href="/register" className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 shadow-lg">
                เริ่มต้นใช้งานฟรี
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 shadow-2xl">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🌱</div>
                <div>
                  <div className="font-semibold text-gray-900">ฟาร์มกัญชา สุขใจ</div>
                  <div className="text-sm text-gray-500">เชียงใหม่</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">สถานะใบรับรอง</span>
                  <span className="text-sm font-semibold text-green-600">กำลังตรวจสอบ</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">28°C</div>
                  <div className="text-xs text-gray-600">อุณหภูมิ</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-xs text-gray-600">ความชื้น</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">pH 6.5</div>
                  <div className="text-xs text-gray-600">ดิน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">เกษตรกรใช้งาน</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-green-100">ใบรับรองออก</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-green-100">อัตราผ่าน</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30 วัน</div>
              <div className="text-green-100">เวลาเฉลี่ย</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">คุณสมบัติครบครัน</h2>
          <p className="text-xl text-gray-600">ทุกอย่างที่คุณต้องการในที่เดียว</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-3xl">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">ยื่นขอออนไลน์</h3>
            <p className="text-gray-600">ยื่นคำขอใบรับรอง GACP ผ่านระบบออนไลน์ ไม่ต้องเดินทาง</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-3xl">🌾</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Farming</h3>
            <p className="text-gray-600">ระบบแนะนำการเพาะปลูกอัจฉริยะ ช่วยเพิ่มผลผลิต</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-3xl">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">แจ้งเตือนเรียลไทม์</h3>
            <p className="text-gray-600">รับการแจ้งเตือนทุกขั้นตอน ผ่าน Email, SMS และ LINE</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ราคาที่เหมาะสม</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">ทดลองใช้</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">ฟรี<span className="text-lg font-normal text-gray-600">/30 วัน</span></div>
            <button className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50">เริ่มทดลองใช้</button>
          </div>
          <div className="bg-green-600 p-8 rounded-xl shadow-2xl transform scale-105">
            <h3 className="text-2xl font-bold text-white mb-2">มาตรฐาน</h3>
            <div className="text-4xl font-bold text-white mb-4">30,000฿<span className="text-lg font-normal text-green-100">/ใบรับรอง</span></div>
            <button className="w-full py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100">เริ่มใช้งาน</button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">องค์กร</h3>
            <div className="text-4xl font-bold text-gray-900 mb-4">ติดต่อ<span className="text-lg font-normal text-gray-600">/ปี</span></div>
            <button className="w-full py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50">ติดต่อเรา</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p className="text-xl text-green-100 mb-8">ลงทะเบียนวันนี้ รับฟรี 30 วัน</p>
          <Link href="/register" className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg text-lg font-semibold hover:bg-gray-100 shadow-lg">
            ลงทะเบียนฟรี
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-xl">🌿</div>
            <span className="text-xl font-bold text-white">GACP Platform</span>
          </div>
          <p className="text-sm mb-4">ระบบรับรอง GACP ดิจิทัลสำหรับกัญชาและพืชสมุนไพรไทย</p>
          <p className="text-sm">&copy; 2025 GACP Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
