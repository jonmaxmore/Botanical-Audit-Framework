'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Agriculture,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  ArrowForward,
} from '@mui/icons-material';
import { login, isAuthenticated, getCurrentUser } from '@/lib/auth';
import { getDashboardRoute } from '@/lib/roles';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const user = await getCurrentUser();
        if (user) {
          const dashboardRoute = getDashboardRoute(user.role);
          router.push(dashboardRoute);
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        setError('กรุณากรอกอีเมลและรหัสผ่าน');
        setLoading(false);
        return;
      }

      // Attempt login
      const session = await login(formData.email, formData.password);

      if (session && session.user) {
        // Get redirect URL from query params or use default dashboard
        const redirectTo = searchParams.get('redirect') || getDashboardRoute(session.user.role);
        router.push(redirectTo);
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Agriculture className="text-green-600 text-3xl mr-2" />
              <span className="text-2xl font-bold text-gray-900">GACP Platform</span>
            </Link>
            <Link
              href="/register"
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-600 text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h1>
              <p className="text-gray-600">ยินดีต้อนรับกลับสู่ GACP Platform</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Email className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    จดจำการเข้าสู่ระบบ
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <ArrowForward className="ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ยังไม่มีบัญชี?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                  สมัครสมาชิกฟรี
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">🧪 บัญชีทดสอบ (Demo)</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• farmer@test.com / password123 (เกษตรกร)</p>
              <p>• reviewer@test.com / password123 (ผู้ตรวจสอบ)</p>
              <p>• inspector@test.com / password123 (ผู้ตรวจฟาร์ม)</p>
              <p>• approver@test.com / password123 (ผู้อนุมัติ)</p>
              <p>• admin@test.com / password123 (ผู้ดูแลระบบ)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 GACP Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
