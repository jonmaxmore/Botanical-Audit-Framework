'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../../lib/api-client';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DashboardStats {
    total: number;
    approved: number;
    pending: number;
}

interface Application {
    _id: string;
    farmName: string;
    status: string;
    submittedAt: string;
    licenseNumber?: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentApps, setRecentApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await apiClient.get('/applications/dashboard');
                setStats(statsRes.data);

                // Fetch Recent Applications (reuse my-applications endpoint)
                const appsRes = await apiClient.get('/applications/my-applications');
                setRecentApps(appsRes.data.slice(0, 5)); // Show top 5
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">👋 ยินดีต้อนรับ, เกษตรกร</h1>
                        <p className="text-gray-600 mt-1">ภาพรวมการขอรับรองมาตรฐาน GACP ของคุณ</p>
                    </div>
                    <Link
                        href="/application/new"
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm flex items-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        ยื่นคำขอใหม่
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">ทั้งหมด</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
                        <p className="text-sm text-gray-500 mt-1">ใบสมัคร</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">รอดำเนินการ</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.pending || 0}</div>
                        <p className="text-sm text-gray-500 mt-1">รอตรวจสอบ/แก้ไข</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">อนุมัติแล้ว</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats?.approved || 0}</div>
                        <p className="text-sm text-gray-500 mt-1">ใบรับรองที่ใช้งานได้</p>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">คำขอล่าสุด</h2>
                        <Link href="/applications" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            ดูทั้งหมด →
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentApps.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                ยังไม่มีคำขอใบรับรอง
                            </div>
                        ) : (
                            recentApps.map((app) => (
                                <div key={app._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${app.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                    'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {app.status === 'approved' ? <CheckCircle className="w-5 h-5" /> :
                                                app.status === 'rejected' ? <AlertCircle className="w-5 h-5" /> :
                                                    <Clock className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{app.farmName}</h3>
                                            <p className="text-sm text-gray-500">
                                                ยื่นเมื่อ: {new Date(app.submittedAt).toLocaleDateString('th-TH')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status.toUpperCase()}
                                        </span>
                                        <Link
                                            href={`/applications/${app._id}`}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
