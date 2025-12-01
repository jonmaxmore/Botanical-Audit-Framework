'use client';

import { useEffect, useState } from 'react';
import { certificatesApi, Certificate } from '../../lib/api/certificates';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await certificatesApi.getMyCertificates();
        if (response.success && response.data) {
          setCertificates(response.data);
        } else {
          setError(response.message || 'Failed to load certificates');
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError('An error occurred while loading certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading certificates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🏆 ใบรับรอง GACP</h1>
          <p className="text-gray-600 mt-1">ใบรับรองที่ได้รับทั้งหมด</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <div
                className={`h-2 ${cert.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-4xl">📜</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      cert.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {cert.status === 'active' ? 'ใช้งานได้' : 'หมดอายุ/ระงับ'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.certificateNumber}</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ฟาร์ม:</span>
                    <span className="font-medium">{cert.farmName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">พืช:</span>
                    <span className="font-medium">{cert.cropTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ออกเมื่อ:</span>
                    <span className="font-medium">
                      {new Date(cert.issueDate).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">หมดอายุ:</span>
                    <span
                      className={`font-medium ${cert.status !== 'active' ? 'text-yellow-600' : ''}`}
                    >
                      {new Date(cert.expiryDate).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
                    📥 ดาวน์โหลด PDF
                  </button>
                  <button className="w-full py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm font-semibold">
                    📱 แสดง QR Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📜</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีใบรับรอง</h3>
            <p className="text-gray-600 mb-6">ยื่นคำขอเพื่อรับใบรับรอง GACP</p>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              ยื่นคำขอใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
