'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../../lib/api-client';

interface Application {
  id: string;
  farm: string;
  crop: string;
  status: string;
  date: string;
  progress: number;
}

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get('/applications');
        // Transform API data to match UI needs if necessary
        // Assuming API returns data in a compatible format or we map it here
        const mappedApps = response.data.map((app: any) => ({
          id: app._id || app.id,
          farm: app.farmName || app.farm?.name || 'Unknown Farm',
          crop: app.cropName || app.crop?.name || 'Unknown Crop',
          status: app.status,
          date: new Date(app.createdAt).toLocaleDateString('th-TH'),
          progress: app.progress || 0
        }));
        setApplications(mappedApps);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications.');
        // Fallback to mock data
        setApplications([
          {
            id: '001',
            farm: 'ฟาร์มสุขใจ (Mock)',
            crop: 'กัญชา',
            status: 'document_review',
            date: '15/01/2025',
            progress: 60
          },
          {
            id: '002',
            farm: 'ฟาร์มปลอดภัย (Mock)',
            crop: 'ขมิ้น',
            status: 'payment_pending',
            date: '10/01/2025',
            progress: 20
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'ร่าง', color: 'text-gray-800', bg: 'bg-gray-100' },
    submitted: { label: 'ยื่นคำขอแล้ว', color: 'text-blue-800', bg: 'bg-blue-100' },
    payment_pending: { label: 'รอชำระเงิน', color: 'text-yellow-800', bg: 'bg-yellow-100' },
    document_review: { label: 'ตรวจเอกสาร', color: 'text-purple-800', bg: 'bg-purple-100' },
    inspection_scheduled: { label: 'นัดตรวจสอบ', color: 'text-orange-800', bg: 'bg-orange-100' },
    approved: { label: 'อนุมัติแล้ว', color: 'text-green-800', bg: 'bg-green-100' },
    rejected: { label: 'ไม่ผ่าน', color: 'text-red-800', bg: 'bg-red-100' }
  };

  const filteredApps = applications.filter(app => {
    if (filter !== 'all' && app.status !== filter) return false;
    if (search && !app.farm.includes(search) && !app.crop.includes(search)) return false;
    return true;
  });

  if (loading) return <div className="p-6 text-center">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📋 คำขอใบรับรอง GACP</h1>
            <p className="text-gray-600 mt-1">จัดการคำขอทั้งหมดของคุณ</p>
          </div>
          <Link
            href="/application/new"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            + ยื่นคำขอใหม่
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">ทั้งหมด</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'payment_pending').length}
            </div>
            <div className="text-sm text-gray-600">รอชำระเงิน</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              {applications.filter(a => a.status === 'document_review').length}
            </div>
            <div className="text-sm text-gray-600">กำลังตรวจสอบ</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">อนุมัติแล้ว</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="🔍 ค้นหาฟาร์ม หรือพืช..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="submitted">ยื่นคำขอแล้ว</option>
              <option value="payment_pending">รอชำระเงิน</option>
              <option value="document_review">ตรวจเอกสาร</option>
              <option value="inspection_scheduled">นัดตรวจสอบ</option>
              <option value="approved">อนุมัติแล้ว</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ฟาร์ม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  พืช
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ความคืบหน้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold text-gray-900">#{app.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{app.farm}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-600">{app.crop}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${statusMap[app.status]?.bg || 'bg-gray-100'} ${statusMap[app.status]?.color || 'text-gray-800'}`}
                    >
                      {statusMap[app.status]?.label || app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${app.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{app.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-green-600 hover:underline font-medium"
                    >
                      ดูรายละเอียด →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
            <p className="text-gray-500">ไม่พบคำขอที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
    </div>
  );
}
