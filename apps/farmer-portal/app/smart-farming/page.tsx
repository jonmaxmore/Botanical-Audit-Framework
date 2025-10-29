'use client';

export default function SmartFarmingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🌾 Smart Farming</h1>
          <p className="text-gray-600 mt-1">ระบบแนะนำการเพาะปลูกอัจฉริยะ</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg p-6 text-white">
            <div className="text-5xl mb-3">☀️</div>
            <h3 className="text-xl font-bold mb-2">สภาพอากาศ</h3>
            <div className="text-4xl font-bold mb-2">28°C</div>
            <p className="text-yellow-100">ท้องฟ้าแจ่มใส</p>
            <div className="mt-4 pt-4 border-t border-yellow-300">
              <div className="flex justify-between text-sm">
                <span>ความชื้น</span>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>ฝน</span>
                <span className="font-semibold">0 mm</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-5xl mb-3">🌱</div>
            <h3 className="text-xl font-bold mb-2">สภาพดิน</h3>
            <div className="text-4xl font-bold mb-2">pH 6.5</div>
            <p className="text-green-100">ดินร่วน - เหมาะสม</p>
            <div className="mt-4 pt-4 border-t border-green-300">
              <div className="flex justify-between text-sm">
                <span>ความชื้นดิน</span>
                <span className="font-semibold">70%</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>ประเภท</span>
                <span className="font-semibold">ดินร่วน</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-5xl mb-3">💧</div>
            <h3 className="text-xl font-bold mb-2">การรดน้ำ</h3>
            <div className="text-4xl font-bold mb-2">4.5 L</div>
            <p className="text-blue-100">ต่อต้นต่อวัน</p>
            <div className="mt-4 pt-4 border-t border-blue-300">
              <div className="flex justify-between text-sm">
                <span>ความถี่</span>
                <span className="font-semibold">ทุกวัน</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>เวลา</span>
                <span className="font-semibold">เช้า/เย็น</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📅 ปฏิทินปลูก - กัญชา</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-600">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-semibold">ระยะงอก (7 วัน)</div>
                  <p className="text-sm text-gray-600">รักษาความชื้น 70-80%</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-600">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-semibold">ระยะกล้า (14 วัน)</div>
                  <p className="text-sm text-gray-600">ให้แสงแดด 18 ชั่วโมง/วัน</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-600">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-semibold">ระยะเจริญเติบโต (30 วัน)</div>
                  <p className="text-sm text-gray-600">ใส่ปุ๋ย NPK 15-10-10</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💡 คำแนะนำวันนี้</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-blue-600">💧</span>
                  <span className="font-semibold text-blue-900">การรดน้ำ</span>
                </div>
                <p className="text-sm text-blue-800">
                  รดน้ำเช้า 4.5 ลิตร ตรวจสอบความชื้นดินก่อนรดน้ำ
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-green-600">🌱</span>
                  <span className="font-semibold text-green-900">ปุ๋ย</span>
                </div>
                <p className="text-sm text-green-800">ใส่ปุ๋ย NPK 15-10-10 อัตรา 50 กรัม/ต้น</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-yellow-600">🐛</span>
                  <span className="font-semibold text-yellow-900">โรคแมลง</span>
                </div>
                <p className="text-sm text-yellow-800">ตรวจสอบใบและลำต้น หาสัญญาณโรคและแมลง</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 พยากรณ์อากาศ 7 วัน</h3>
          <div className="grid grid-cols-7 gap-4">
            {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900 mb-2">{day}</div>
                <div className="text-3xl mb-2">☀️</div>
                <div className="text-sm font-bold text-gray-900">28°C</div>
                <div className="text-xs text-gray-600">65%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
