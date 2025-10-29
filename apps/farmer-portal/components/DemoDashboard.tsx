/**
 * Demo Dashboard Component
 * แสดงภาพรวมของระบบในโหมด demo
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getDemoController } from '../lib/demoController';
import {
  demoUsers,
  demoApplications,
  demoInspections,
  demoCertificates,
  DemoUser,
  DemoApplication,
  DemoInspection,
  DemoCertificate
} from '../lib/demoData';

interface DemoDashboardProps {
  userRole?: string;
  className?: string;
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

interface DashboardStats {
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  inspections: {
    scheduled: number;
    completed: number;
    pending: number;
  };
  certificates: {
    active: number;
    expired: number;
    total: number;
  };
  users: {
    farmers: number;
    inspectors: number;
    reviewers: number;
    admins: number;
  };
}

export default function DemoDashboard({ userRole = 'farmer', className = '' }: DemoDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const _demoController = getDemoController();

  const updateCurrentUser = useCallback(() => {
    const user = demoUsers.find((u: DemoUser) => u.role === userRole) || null;
    setCurrentUser(user);
  }, [userRole]);

  const calculateStats = useCallback(() => {
    const dashboardStats: DashboardStats = {
      applications: {
        total: demoApplications.length,
        pending: demoApplications.filter((app: DemoApplication) => app.status === 'pending').length,
        approved: demoApplications.filter((app: DemoApplication) => app.status === 'approved')
          .length,
        rejected: demoApplications.filter((app: DemoApplication) => app.status === 'rejected')
          .length
      },
      inspections: {
        scheduled: demoInspections.filter((ins: DemoInspection) => ins.status === 'scheduled')
          .length,
        completed: demoInspections.filter((ins: DemoInspection) => ins.status === 'completed')
          .length,
        pending: demoInspections.filter((ins: DemoInspection) => ins.status === 'pending').length
      },
      certificates: {
        active: demoCertificates.filter((cert: DemoCertificate) => cert.status === 'active').length,
        expired: demoCertificates.filter((cert: DemoCertificate) => cert.status === 'expired')
          .length,
        total: demoCertificates.length
      },
      users: {
        farmers: demoUsers.filter((user: DemoUser) => user.role === 'farmer').length,
        inspectors: demoUsers.filter((user: DemoUser) => user.role === 'inspector').length,
        reviewers: demoUsers.filter((user: DemoUser) => user.role === 'reviewer').length,
        admins: demoUsers.filter((user: DemoUser) => user.role === 'admin').length
      }
    };
    setStats(dashboardStats);
  }, []);

  useEffect(() => {
    calculateStats();
    updateCurrentUser();
  }, [userRole, updateCurrentUser, calculateStats]);

  if (!stats || !currentUser) {
    return <div className="animate-pulse bg-gray-100 rounded-lg h-64"></div>;
  }

  const getRoleBasedCards = () => {
    switch (userRole) {
      case 'farmer':
        return [
          {
            title: 'คำขอของฉัน',
            value: demoApplications.filter(
              (app: DemoApplication) => app.farmerId === currentUser.id
            ).length,
            subtitle: 'คำขอทั้งหมด',
            icon: '📝',
            color: 'bg-blue-50 border-blue-200 text-blue-600'
          },
          {
            title: 'การตรวจสอบ',
            value: demoInspections.filter((ins: DemoInspection) => ins.farmerId === currentUser.id)
              .length,
            subtitle: 'รอตรวจสอบ',
            icon: '🔍',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-600'
          },
          {
            title: 'ใบรับรอง',
            value: demoCertificates.filter(
              (cert: DemoCertificate) =>
                cert.farmerId === currentUser.id && cert.status === 'active'
            ).length,
            subtitle: 'ใบรับรองที่ใช้งานได้',
            icon: '🏆',
            color: 'bg-green-50 border-green-200 text-green-600'
          }
        ];

      case 'inspector':
        return [
          {
            title: 'งานตรวจสอบ',
            value: demoInspections.filter(
              (ins: DemoInspection) =>
                ins.inspectorId === currentUser.id && ins.status === 'scheduled'
            ).length,
            subtitle: 'ที่ได้รับมอบหมาย',
            icon: '📋',
            color: 'bg-orange-50 border-orange-200 text-orange-600'
          },
          {
            title: 'ตรวจสอบแล้ว',
            value: demoInspections.filter(
              (ins: DemoInspection) =>
                ins.inspectorId === currentUser.id && ins.status === 'completed'
            ).length,
            subtitle: 'ในเดือนนี้',
            icon: '✅',
            color: 'bg-green-50 border-green-200 text-green-600'
          },
          {
            title: 'คะแนนเฉลี่ย',
            value: '8.5',
            subtitle: 'คะแนนการตรวจสอบ',
            icon: '⭐',
            color: 'bg-purple-50 border-purple-200 text-purple-600'
          }
        ];

      case 'reviewer':
        return [
          {
            title: 'รอการประเมิน',
            value: demoApplications.filter((app: DemoApplication) => app.status === 'under_review')
              .length,
            subtitle: 'คำขอที่ต้องประเมิน',
            icon: '📊',
            color: 'bg-blue-50 border-blue-200 text-blue-600'
          },
          {
            title: 'ประเมินแล้ว',
            value: demoApplications.filter((app: DemoApplication) =>
              ['approved', 'rejected'].includes(app.status)
            ).length,
            subtitle: 'ในเดือนนี้',
            icon: '📈',
            color: 'bg-green-50 border-green-200 text-green-600'
          },
          {
            title: 'อัตราผ่าน',
            value: '85%',
            subtitle: 'ของการประเมิน',
            icon: '🎯',
            color: 'bg-indigo-50 border-indigo-200 text-indigo-600'
          }
        ];

      case 'admin':
      default:
        return [
          {
            title: 'คำขอทั้งหมด',
            value: stats.applications.total,
            subtitle: `รอดำเนินการ ${stats.applications.pending} รายการ`,
            icon: '📊',
            color: 'bg-blue-50 border-blue-200 text-blue-600'
          },
          {
            title: 'การตรวจสอบ',
            value: stats.inspections.completed,
            subtitle: `เสร็จสิ้นแล้ว/${stats.inspections.scheduled + stats.inspections.completed} รายการ`,
            icon: '🔍',
            color: 'bg-green-50 border-green-200 text-green-600'
          },
          {
            title: 'ใบรับรอง',
            value: stats.certificates.active,
            subtitle: `ใช้งานได้/${stats.certificates.total} ใบ`,
            icon: '🏆',
            color: 'bg-yellow-50 border-yellow-200 text-yellow-600'
          }
        ];
    }
  };

  const getRecentActivities = () => {
    const activities: Activity[] = [];

    // Add recent applications
    demoApplications
      .filter(
        (app: DemoApplication) =>
          userRole === 'admin' || (userRole === 'farmer' && app.farmerId === currentUser.id)
      )
      .slice(0, 3)
      .forEach((app: DemoApplication) => {
        activities.push({
          id: app.id,
          type: 'application',
          message: `คำขอ GACP #${app.id} สถานะ: ${app.status}`,
          timestamp: app.submittedDate
        });
      });

    // Add recent inspections
    demoInspections
      .filter(
        (ins: DemoInspection) =>
          userRole === 'admin' || (userRole === 'inspector' && ins.inspectorId === currentUser.id)
      )
      .slice(0, 2)
      .forEach((ins: DemoInspection) => {
        activities.push({
          id: ins.id,
          type: 'inspection',
          message: `การตรวจสอบ #${ins.id}`,
          timestamp: ins.date
        });
      });

    return activities.slice(0, 5);
  };

  const cards = getRoleBasedCards();
  const activities = getRecentActivities();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Info */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {userRole === 'farmer'
              ? '🌾'
              : userRole === 'inspector'
                ? '🔍'
                : userRole === 'reviewer'
                  ? '📋'
                  : '⚙️'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentUser.name}</h2>
            <p className="text-gray-600">{currentUser.email}</p>
            <p className="text-sm text-gray-500">
              {userRole === 'farmer'
                ? 'เกษตรกร'
                : userRole === 'inspector'
                  ? 'ผู้ตรวจสอบ'
                  : userRole === 'reviewer'
                    ? 'ผู้ประเมิน'
                    : 'ผู้บริหาร'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div key={index} className={`border rounded-lg p-4 ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs opacity-70">{card.subtitle}</p>
              </div>
              <div className="text-2xl">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">กิจกรรมล่าสุด</h3>
        </div>
        <div className="divide-y">
          {activities.map(activity => (
            <div key={activity.id} className="p-4 flex items-center space-x-3">
              <div className="text-xl">{activity.type === 'application' ? '📝' : '🔍'}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-600">{activity.type}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString('th-TH')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Overview */}
      {userRole === 'admin' && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">ภาพรวมระบบ</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.users.farmers}</div>
                <div className="text-sm text-gray-600">เกษตรกร</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.users.inspectors}</div>
                <div className="text-sm text-gray-600">ผู้ตรวจสอบ</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.users.reviewers}</div>
                <div className="text-sm text-gray-600">ผู้ประเมิน</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.users.admins}</div>
                <div className="text-sm text-gray-600">ผู้บริหาร</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
