'use client';

import Link from 'next/link';

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const timeline = [
    { status: 'ยื่นคำขอ', date: '15/01/2025 10:30', completed: true },
    { status: 'ชำระเงินงวดที่ 1', date: '16/01/2025 14:20', completed: true },
    { status: 'ตรวจสอบเอกสาร', date: 'กำลังดำเนินการ', completed: false, active: true },
    { status: 'นัดตรวจสอบสถานที่', date: 'รอดำเนินการ', completed: false },
    { status: 'อนุมัติ', date: 'รอดำเนินการ', completed: false },
  ];

  const comments = [
    { user: 'Reviewer', message: 'กรุณาเพิ่มเอกสารใบอนุญาตปลูก', date: '17/01/2025 09:15', type: 'staff' },
    { user: 'คุณ', message: 'อัปโหลดเอกสารเพิ่มเติมแล้วครับ', date: '17/01/2025 15:30', type: 'farmer' },
  ];

  const documents = [
    { name: 'ใบอนุญาตปลูก.pdf', size: '2.5 MB', date: '15/01/2025' },
    { name: 'แผนที่ฟาร์ม.pdf', size: '1.8 MB', date: '15/01/2025' },
    { name: 'ใบรับรองที่ดิน.pdf', size: '3.2 MB', date: '15/01/2025' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/applications" className="text-green-600 hover:underline mb-4 inline-block">← กลับ</Link>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">คำขอ #{params.id}</h1>
              <p className="text-gray-600 mt-1">ฟาร์มสุขใจ - กัญชา</p>
            </div>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              ตรวจสอบเอกสาร
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">ข้อมูลคำขอ</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ฟาร์ม:</span>
                  <span className="font-medium">ฟาร์มสุขใจ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">พืช:</span>
                  <span className="font-medium">กัญชา</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">พื้นที่:</span>
                  <span className="font-medium">5 ไร่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จังหวัด:</span>
                  <span className="font-medium">เชียงใหม่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">วันที่ยื่น:</span>
                  <span className="font-medium">15/01/2025</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-500' : item.active ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}>
                      {item.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.status}</div>
                      <div className="text-xs text-gray-500">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">💬 ความคิดเห็น</h3>
            <div className="space-y-4 mb-4">
              {comments.map((comment, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${comment.type === 'staff' ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm">{comment.user}</span>
                    <span className="text-xs text-gray-500">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.message}</p>
                </div>
              ))}
            </div>
            <textarea
              placeholder="เขียนความคิดเห็น..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
            />
            <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              ส่งความคิดเห็น
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">📎 เอกสารแนบ ({documents.length})</h3>
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.size} • {doc.date}</div>
                    </div>
                  </div>
                  <button className="text-green-600 hover:underline text-sm">ดาวน์โหลด</button>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600">
              + อัปโหลดเอกสารเพิ่มเติม
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
