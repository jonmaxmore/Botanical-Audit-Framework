'use client';

import { useState, useEffect } from 'react';
import { api, endpoints } from '@/lib/api';

interface HealthStatus {
  status: string;
  database: boolean;
  uptime: number;
  message?: string;
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await api.get(endpoints.health);
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setHealthStatus({
        status: 'error',
        database: false,
        uptime: 0,
        message: 'ไม่สามารถเชื่อมต่อ Backend ได้',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🌿 GACP Platform</h1>
          <p className="text-xl text-gray-600 mb-2">
            ระบบรับรองมาตรฐาน Good Agricultural and Collection Practices
          </p>
          <p className="text-lg text-gray-500">กรมการแพทย์แผนไทยและการแพทย์ทางเลือก (DTAM)</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Frontend Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-800">Frontend (Next.js)</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              <p>✅ React 19.1.0</p>
              <p>✅ Next.js 15.5.6</p>
              <p>✅ TypeScript</p>
              <p>✅ Tailwind CSS</p>
              <p>✅ Turbopack</p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  healthStatus?.status === 'healthy'
                    ? 'bg-green-500'
                    : healthStatus?.status === 'degraded'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              ></div>
              <h3 className="text-xl font-semibold text-gray-800">Backend (Express.js)</h3>
            </div>
            <div className="space-y-2 text-gray-600">
              {healthStatus ? (
                <>
                  <p>🔧 Status: {healthStatus.status}</p>
                  <p>💾 Database: {healthStatus.database ? '✅ Connected' : '❌ Disconnected'}</p>
                  <p>⏱️ Uptime: {Math.floor(healthStatus.uptime / 60)} minutes</p>
                  <p>🔗 API: http://localhost:3004</p>
                </>
              ) : (
                <p className="text-red-500">❌ ไม่สามารถเชื่อมต่อได้</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🚀 Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={checkBackendHealth}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Refresh Status
            </button>
            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center transition-colors"
            >
              🔗 Backend API
            </a>
            <a
              href="http://localhost:3004/health"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-center transition-colors"
            >
              ❤️ Health Check
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>GACP Platform - Full Stack Application</p>
          <p>Frontend: http://localhost:3000 | Backend: http://localhost:3004</p>
        </div>
      </div>
    </div>
  );
}
