'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Agriculture,
  VerifiedUser,
  Assessment,
  Speed,
  ArrowForward,
  CheckCircle,
  People,
  EmojiEvents,
  Security,
} from '@mui/icons-material';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { getDashboardRoute } from '@/lib/roles';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const user = await getCurrentUser();
        if (user) {
          // Redirect to appropriate dashboard
          const dashboardRoute = getDashboardRoute(user.role);
          router.push(dashboardRoute);
          return;
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Agriculture className="text-green-600 text-3xl mr-2" />
              <span className="text-2xl font-bold text-gray-900">GACP Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-background.svg"
            alt="GACP Farm Background"
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <VerifiedUser className="mr-2 text-lg" />
            ระบบรับรองมาตรฐาน GACP สมุนไพรทางการแพทย์
          </div>

          {/* GACP Logo */}
          <div className="mb-6">
            <Image
              src="/images/gacp-logo.svg"
              alt="GACP Platform Logo"
              width={128}
              height={128}
              className="mx-auto"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            ระบบรับรองมาตรฐาน GACP
            <span className="block text-green-600 mt-2">สมุนไพรทางการแพทย์</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            แพลตฟอร์มของกรมการแพทย์แผนไทยและการแพทย์ทางเลือก สำหรับการยื่นขอและตรวจสอบ
            การรับรองมาตรฐาน GACP (Good Agricultural and Collection Practices)
            สมุนไพรทางการแพทย์อย่างมีประสิทธิภาพและโปร่งใส
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg"
            >
              เริ่มใช้บริการ
              <ArrowForward className="ml-2" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-300 font-medium text-lg"
            >
              เรียนรู้เพิ่มเติม
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ข้อดีของระบบ GACP Platform</h2>
          <p className="text-xl text-gray-600">
            ระบบที่ออกแบบมาเพื่อรองรับการดำเนินงานตามมาตรฐานราชการ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Speed className="text-green-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">ประมวลผลอย่างรวดเร็ว</h3>
            <p className="text-gray-600 leading-relaxed">
              ระบบดิจิทัลช่วยลดระยะเวลาในการดำเนินการ ยื่นเอกสารออนไลน์
              และติดตามสถานะได้แบบเรียลไทม์
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Security className="text-blue-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">ระบบรักษาความปลอดภัย</h3>
            <p className="text-gray-600 leading-relaxed">
              ระบบรักษาความปลอดภัยตามมาตรฐานราชการ การเข้ารหัสข้อมูล และการปกป้องข้อมูลส่วนบุคคล
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Assessment className="text-purple-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">ตรวจสอบความคืบหน้า</h3>
            <p className="text-gray-600 leading-relaxed">
              ติดตามสถานะการดำเนินงาน ดูประวัติการตรวจสอบ และรับการแจ้งเตือนทุกขั้นตอนอย่างโปร่งใส
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <VerifiedUser className="text-orange-600 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">รับรองมาตรฐานสากล</h3>
            <p className="text-gray-600 leading-relaxed">
              ใบรับรองที่เป็นที่ยอมรับตามมาตรฐานสากล ตรวจสอบได้อย่างโปร่งใส และมีความน่าเชื่อถือสูง
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Farmer Success Image */}
          <div className="text-center mb-8">
            <Image
              src="/images/farmer-success.svg"
              alt="ความสำเร็จของเกษตรกร GACP"
              width={320}
              height={240}
              className="mx-auto mb-4 opacity-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">1,234+</div>
              <div className="text-xl text-green-100">ผู้ขอรับการรับรอง</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">456+</div>
              <div className="text-xl text-green-100">สถานประกอบการที่ผ่านการตรวจสอบ</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">789+</div>
              <div className="text-xl text-green-100">ใบรับรองที่ออกแล้ว</div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ขั้นตอนการขอรับรอง</h2>
          <p className="text-xl text-gray-600">4 ขั้นตอนสำคัญในการขอรับรองมาตรฐาน GACP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'ลงทะเบียนในระบบ',
              desc: 'สมัครสมาชิกและสร้างโปรไฟล์สถานประกอบการ',
              icon: <People className="text-4xl" />,
            },
            {
              step: '2',
              title: 'ยื่นคำขอ',
              desc: 'อัพโหลดเอกสารและข้อมูลสถานประกอบการ',
              icon: <Assessment className="text-4xl" />,
            },
            {
              step: '3',
              title: 'การตรวจประเมิน',
              desc: 'เจ้าหน้าที่ตรวจสอบและประเมินตามมาตรฐาน',
              icon: <CheckCircle className="text-4xl" />,
            },
            {
              step: '4',
              title: 'รับใบรับรอง',
              desc: 'ได้รับใบรับรองมาตรฐาน GACP',
              icon: <EmojiEvents className="text-4xl" />,
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-2xl">
                  {item.step}
                </div>
                <div className="text-green-600 mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowForward className="text-gray-300 text-2xl" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">เริ่มต้นการขอรับรอง</h2>
          <p className="text-xl text-green-100 mb-10">
            ลงทะเบียนและเริ่มต้นกระบวนการขอรับรองมาตรฐาน GACP สมุนไพรทางการแพทย์
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center bg-white text-green-600 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg font-medium text-lg"
            >
              ลงทะเบียนใช้บริการ
              <ArrowForward className="ml-2" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center bg-green-800 text-white px-8 py-4 rounded-xl hover:bg-green-900 transition-all border-2 border-green-500 font-medium text-lg"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Agriculture className="text-green-500 text-3xl mr-2" />
                <span className="text-xl font-bold text-white">GACP Platform</span>
              </div>
              <p className="text-gray-400">แพลตฟอร์มรับรอง GACP มาตรฐานสากล</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">เมนูหลัก</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    เกี่ยวกับระบบ
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    บริการ
                  </Link>
                </li>
                <li>
                  <Link href="/standards" className="hover:text-white transition-colors">
                    มาตรฐาน GACP
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    ติดต่อเรา
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">สำหรับผู้ขอรับรอง</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    ลงทะเบียน
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:text-white transition-colors">
                    คู่มือการใช้งาน
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    คำถามที่พบบ่อย
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">ติดต่อหน่วยงาน</h4>
              <ul className="space-y-2 text-gray-400">
                <li>อีเมล: dtam@moph.go.th</li>
                <li>โทรศัพท์: 0-2590-XXXX</li>
                <li>กรมการแพทย์แผนไทยและการแพทย์ทางเลือก</li>
                <li>กระทรวงสาธารณสุข</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 ระบบรับรองมาตรฐาน GACP สมุนไพรทางการแพทย์
              กรมการแพทย์แผนไทยและการแพทย์ทางเลือก
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
