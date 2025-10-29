'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface KPIMetrics {
  role: string;
  totalTasks: number;
  completedTasks: number;
  delayedTasks: number;
  averageProcessingTime: number;
  completionRate: number;
  delayRate: number;
  slaThreshold: number;
}

interface SystemMetrics {
  totalApplications: number;
  completedApplications: number;
  averageProcessingTime: number;
  overallCompletionRate: number;
  roleMetrics: KPIMetrics[];
}

interface TrendData {
  date: string;
  completed: number;
  delayed: number;
  avgTime: number;
}

interface KPIDashboardProps {
  className?: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function KPIDashboard({ className = '' }: KPIDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [dateRange, setDateRange] = useState(7); // Last 7 days

  const fetchKPIData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch system metrics
      const metricsResponse = await fetch('/api/kpi/system');
      const metricsData = await metricsResponse.json();

      // Fetch trends
      const trendsResponse = await fetch(`/api/kpi/trends?days=${dateRange}`);
      const trendsData = await trendsResponse.json();

      if (metricsData.success) {
        setSystemMetrics(metricsData.data);
      }

      if (trendsData.success) {
        setTrends(trendsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchKPIData();
  }, [dateRange, fetchKPIData]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!systemMetrics) {
    return (
      <div className={`text-center p-12 text-gray-500 ${className}`}>
        ไม่สามารถโหลดข้อมูล KPI ได้
      </div>
    );
  }

  // Summary cards data
  const summaryCards = [
    {
      title: 'ใบสมัครทั้งหมด',
      value: systemMetrics.totalApplications,
      icon: Users,
      color: 'blue',
      trend: null
    },
    {
      title: 'เสร็จสมบูรณ์',
      value: systemMetrics.completedApplications,
      icon: CheckCircle,
      color: 'green',
      trend: `${systemMetrics.overallCompletionRate.toFixed(1)}%`
    },
    {
      title: 'เวลาดำเนินการเฉลี่ย',
      value: `${systemMetrics.averageProcessingTime.toFixed(1)}`,
      suffix: 'ชม.',
      icon: Clock,
      color: 'yellow',
      trend: null
    },
    {
      title: 'อัตราความล่าช้า',
      value: `${systemMetrics.roleMetrics.reduce((sum, m) => sum + m.delayRate, 0) / systemMetrics.roleMetrics.length}`,
      suffix: '%',
      icon: AlertCircle,
      color: 'red',
      trend: null
    }
  ];

  // Role performance data for bar chart
  const rolePerformanceData = systemMetrics.roleMetrics.map(metric => ({
    role:
      metric.role === 'reviewer'
        ? 'ตรวจสอบ'
        : metric.role === 'inspector'
          ? 'ตรวจแปลง'
          : metric.role === 'approver'
            ? 'อนุมัติ'
            : metric.role,
    completed: metric.completedTasks,
    delayed: metric.delayedTasks,
    completionRate: metric.completionRate
  }));

  // Role distribution data for pie chart
  const roleDistributionData = systemMetrics.roleMetrics.map(metric => ({
    name:
      metric.role === 'reviewer'
        ? 'ตรวจสอบ'
        : metric.role === 'inspector'
          ? 'ตรวจแปลง'
          : metric.role === 'approver'
            ? 'อนุมัติ'
            : metric.role,
    value: metric.totalTasks
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI Dashboard</h2>
          <p className="text-sm text-gray-600">ภาพรวมประสิทธิภาพการทำงาน</p>
        </div>

        {/* Date range selector */}
        <select
          value={dateRange}
          onChange={e => setDateRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="เลือกช่วงเวลา"
        >
          <option value={7}>7 วันที่แล้ว</option>
          <option value={14}>14 วันที่แล้ว</option>
          <option value={30}>30 วันที่แล้ว</option>
          <option value={90}>90 วันที่แล้ว</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600'
          }[card.color];

          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{card.title}</span>
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {card.value}
                    {card.suffix && (
                      <span className="text-xl text-gray-600 ml-1">{card.suffix}</span>
                    )}
                  </div>
                  {card.trend && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">{card.trend}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Performance Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ผลการดำเนินการตามตำแหน่ง</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rolePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="เสร็จสมบูรณ์" fill="#10b981" />
              <Bar dataKey="delayed" name="ล่าช้า" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">การกระจายงานตามตำแหน่ง</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends Line Chart */}
      {trends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">แนวโน้มการดำเนินงาน</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="completed"
                name="เสร็จสมบูรณ์"
                stroke="#10b981"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="delayed"
                name="ล่าช้า"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgTime"
                name="เวลาเฉลี่ย (ชม.)"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Role Details Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">รายละเอียดตามตำแหน่ง</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  งานทั้งหมด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เสร็จสมบูรณ์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ล่าช้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เวลาเฉลี่ย (ชม.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัตราเสร็จสมบูรณ์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัตราล่าช้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA (ชม.)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {systemMetrics.roleMetrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.role === 'reviewer'
                      ? 'ผู้ตรวจสอบเอกสาร'
                      : metric.role === 'inspector'
                        ? 'ผู้ตรวจแปลง'
                        : metric.role === 'approver'
                          ? 'ผู้อนุมัติ'
                          : metric.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {metric.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {metric.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {metric.delayedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {metric.averageProcessingTime.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.completionRate >= 80
                          ? 'bg-green-100 text-green-800'
                          : metric.completionRate >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {metric.completionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.delayRate < 10
                          ? 'bg-green-100 text-green-800'
                          : metric.delayRate < 20
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {metric.delayRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {metric.slaThreshold}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
