'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Info,
  TrendingUp,
  People,
  Description,
  Dashboard
} from '@mui/icons-material';

export default function TailwindExamplesPage() {
  const [activeTab, setActiveTab] = useState<'components' | 'layouts' | 'forms'>('components');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dashboard className="text-green-600 w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Next.js + Tailwind CSS Examples
                </h1>
                <p className="text-sm text-gray-500">
                  GACP Platform - Farmer Portal Component Library
                </p>
              </div>
            </div>
            <Link
              href="/farmer/dashboard"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('components')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'components'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Components
          </button>
          <button
            onClick={() => setActiveTab('layouts')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'layouts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Layouts
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'forms'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Forms
          </button>
        </div>

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            {/* Alert Cards */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alert Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Success Alert */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 w-5 h-5 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <p className="text-sm text-green-700 mt-1">Your document has been approved</p>
                    </div>
                  </div>
                </div>

                {/* Warning Alert */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start">
                    <Warning className="text-yellow-600 w-5 h-5 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                      <p className="text-sm text-yellow-700 mt-1">Please review your information</p>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start">
                    <ErrorIcon className="text-red-600 w-5 h-5 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">Failed to upload document</p>
                    </div>
                  </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                  <div className="flex items-start">
                    <Info className="text-blue-600 w-5 h-5 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Info</h3>
                      <p className="text-sm text-blue-700 mt-1">New update available</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stat Cards */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Description className="text-green-600 w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      +12%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">125</h3>
                  <p className="text-sm text-gray-500 mt-1">Total Documents</p>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <People className="text-blue-600 w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      +5%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">48</h3>
                  <p className="text-sm text-gray-500 mt-1">Active Users</p>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="text-purple-600 w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      +28%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">89%</h3>
                  <p className="text-sm text-gray-500 mt-1">Success Rate</p>
                </div>

                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Warning className="text-orange-600 w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      -3%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">12</h3>
                  <p className="text-sm text-gray-500 mt-1">Pending Reviews</p>
                </div>
              </div>
            </section>

            {/* Button Variants */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Button Variants</h2>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Primary Button
                  </button>
                  <button className="px-6 py-2 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium">
                    Outline Button
                  </button>
                  <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                    Secondary Button
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all font-medium shadow-lg">
                    Gradient Button
                  </button>
                  <button className="px-6 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium">
                    Text Button
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Layouts Tab */}
        {activeTab === 'layouts' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Grid Layouts</h2>

              {/* 2 Columns */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">2 Columns (responsive)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Column 1</h4>
                    <p className="text-sm opacity-90 mt-2">Full width on mobile, 50% on desktop</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Column 2</h4>
                    <p className="text-sm opacity-90 mt-2">Full width on mobile, 50% on desktop</p>
                  </div>
                </div>
              </div>

              {/* 3 Columns */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">3 Columns (responsive)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Column 1</h4>
                  </div>
                  <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Column 2</h4>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Column 3</h4>
                  </div>
                </div>
              </div>

              {/* Flexbox Layout */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Flexbox Layout</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px] bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Flex Item 1</h4>
                  </div>
                  <div className="flex-1 min-w-[200px] bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Flex Item 2</h4>
                  </div>
                  <div className="flex-1 min-w-[200px] bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg p-6 text-white">
                    <h4 className="font-bold">Flex Item 3</h4>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Form Components</h2>
              <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl">
                <form className="space-y-6">
                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Select Dropdown */}
                  <div>
                    <label
                      htmlFor="farmType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Farm Type
                    </label>
                    <select
                      id="farmType"
                      aria-label="Select farm type"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option>Select farm type</option>
                      <option>Organic Farm</option>
                      <option>Medicinal Herbs</option>
                      <option>Cannabis Farm</option>
                      <option>Mixed Agriculture</option>
                    </select>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your farm..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                      I agree to the terms and conditions
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Submit Form
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
