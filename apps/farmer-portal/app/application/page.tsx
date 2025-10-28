'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewApplicationPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    farm: '',
    crop: '',
    area: '',
    documents: [] as string[],
  });

  const crops = ['กัญชา', 'ขมิ้น', 'ขิง', 'กระชาย', 'ไพล', 'กระท่อม'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/applications" className="text-green-600 hover:underline mb-4 inline-block">← กลับ</Link>
        
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 ยื่นคำขอใบรับรอง GACP</h1>
          <p className="text-gray-600 mb-8">กรอกข้อมูลเพื่อยื่นคำขอใบรับรอง</p>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-24 h-1 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: เลือกฟาร์ม */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 1: เลือกฟาร์ม</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-green-500">
                  <input type="radio" name="farm" className="mr-3" onChange={() => setFormData({...formData, farm: 'สุขใจ'})} />
                  <div>
                    <div className="font-semibold">ฟาร์มสุขใจ</div>
                    <div className="text-sm text-gray-600">เชียงใหม่ • 5 ไร่</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-green-500">
                  <input type="radio" name="farm" className="mr-3" onChange={() => setFormData({...formData, farm: 'ปลอดภัย'})} />
                  <div>
                    <div className="font-semibold">ฟาร์มปลอดภัย</div>
                    <div className="text-sm text-gray-600">เชียงราย • 10 ไร่</div>
                  </div>
                </label>
                <Link href="/farms" className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg text-green-600 hover:border-green-500">
                  + สร้างฟาร์มใหม่
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: เลือกพืช */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 2: เลือกพืชที่ต้องการขอรับรอง</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {crops.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setFormData({...formData, crop})}
                    className={`p-4 border-2 rounded-lg font-semibold ${
                      formData.crop === crop ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-500'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">พื้นที่ปลูก (ไร่)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น 5"
                />
              </div>
            </div>
          )}

          {/* Step 3: อัปโหลดเอกสาร */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 3: อัปโหลดเอกสาร</h2>
              <div className="space-y-4">
                {['ใบอนุญาตปลูก', 'แผนที่ฟาร์ม', 'ใบรับรองที่ดิน', 'แผนการปลูก'].map((doc) => (
                  <div key={doc} className="border-2 border-dashed rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{doc}</span>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        เลือกไฟล์
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: ตรวจสอบ */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Step 4: ตรวจสอบข้อมูล</h2>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ฟาร์ม:</span>
                  <span className="font-semibold">ฟาร์ม{formData.farm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">พืช:</span>
                  <span className="font-semibold">{formData.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">พื้นที่:</span>
                  <span className="font-semibold">{formData.area} ไร่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ค่าธรรมเนียม:</span>
                  <span className="font-semibold text-green-600">30,000 บาท</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 หลังจากยื่นคำขอ คุณจะต้องชำระเงินงวดที่ 1 จำนวน 15,000 บาท ภายใน 7 วัน
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 border rounded-lg disabled:opacity-50"
            >
              ← ย้อนกลับ
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ถัดไป →
              </button>
            ) : (
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                ยื่นคำขอ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
