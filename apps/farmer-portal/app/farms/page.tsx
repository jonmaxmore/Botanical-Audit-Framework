'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../lib/api-client';

interface Farm {
  _id: string;
  name: string;
  region: string;
  totalArea: number;
  plots: any[];
  farmingType: string;
  location: {
    lat: number;
    lng: number;
  };
}

export default function FarmsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await apiClient.get('/farms');
        setFarms(response.data);
      } catch (err) {
        console.error('Error fetching farms:', err);
        setError('Failed to load farms. Please try again later.');
        // Fallback to mock data for demo purposes if API fails
        setFarms([
          {
            _id: '1',
            name: 'ฟาร์มสุขใจ (Mock)',
            region: 'เชียงใหม่',
            totalArea: 5,
            plots: [],
            farmingType: 'Organic',
            location: { lat: 18.7883, lng: 98.9853 }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading farms...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏡 ฟาร์มของฉัน</h1>
            <p className="text-gray-600 mt-1">จัดการฟาร์มและแปลงปลูก</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-lg ${view === 'grid' ? 'bg-green-600 text-white' : 'bg-white'}`}
            >
              🔲 Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg ${view === 'list' ? 'bg-green-600 text-white' : 'bg-white'}`}
            >
              📝 List
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              + เพิ่มฟาร์ม
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid md:grid-cols-3 gap-6">
            {farms.map(farm => (
              <div
                key={farm._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                    🌱
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{farm.name}</h3>
                <p className="text-gray-600 text-sm mb-4">📍 {farm.region}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{farm.totalArea}</div>
                    <div className="text-xs text-gray-600">ไร่</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{farm.plots?.length || 0}</div>
                    <div className="text-xs text-gray-600">แปลง</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-2">ประเภท</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {farm.farmingType}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                    แก้ไข
                  </button>
                  <button className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชื่อฟาร์ม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    จังหวัด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    พื้นที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    แปลง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {farms.map(farm => (
                  <tr key={farm._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{farm.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{farm.region}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{farm.totalArea} ไร่</td>
                    <td className="px-6 py-4 whitespace-nowrap">{farm.plots?.length || 0} แปลง</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {farm.farmingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-green-600 hover:underline mr-3">แก้ไข</button>
                      <button className="text-blue-600 hover:underline">ดูรายละเอียด</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
