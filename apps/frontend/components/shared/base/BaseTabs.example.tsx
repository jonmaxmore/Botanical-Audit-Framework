/**
 * BaseTabs Component Examples
 * 
 * Demonstrates various use cases:
 * 1. Basic Tabs (Underline variant)
 * 2. Variants (Underline, Contained, Pills)
 * 3. With Icons
 * 4. With Badges
 * 5. Sizes
 * 6. Full Width & Centered
 * 7. Controlled Tabs
 * 8. Real-World Use Cases
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseTabs, { Tab } from './BaseTabs';
import BaseCard from './BaseCard';
import BaseBadge from './BaseBadge';

// ============================================================================
// Example 1: Basic Tabs
// ============================================================================

export function BasicTabsExample() {
  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Farm Overview</h3>
          <p className="text-gray-600">
            General information about your farm, including location, size, and certification status.
          </p>
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Farm Details</h3>
          <p className="text-gray-600">
            Detailed specifications, crop types, farming methods, and infrastructure information.
          </p>
        </div>
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Farm Documents</h3>
          <p className="text-gray-600">
            Upload and manage your farm documentation, certificates, and compliance records.
          </p>
        </div>
      ),
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Basic Tabs</h3>
      <BaseTabs tabs={tabs} />
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Simple content organization with underline variant</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 2: Variants
// ============================================================================

export function TabVariantsExample() {
  const tabs: Tab[] = [
    {
      id: 'tab1',
      label: 'Tab One',
      content: <div className="p-4">Content for Tab One</div>,
    },
    {
      id: 'tab2',
      label: 'Tab Two',
      content: <div className="p-4">Content for Tab Two</div>,
    },
    {
      id: 'tab3',
      label: 'Tab Three',
      content: <div className="p-4">Content for Tab Three</div>,
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-6">Tab Variants</h3>
      
      <div className="space-y-8">
        {/* Underline */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Underline (Default):</h4>
          <BaseTabs tabs={tabs} variant="underline" />
        </div>

        {/* Contained */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Contained:</h4>
          <BaseTabs tabs={tabs} variant="contained" />
        </div>

        {/* Pills */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Pills:</h4>
          <BaseTabs tabs={tabs} variant="pills" />
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Different visual styles for different contexts</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 3: With Icons
// ============================================================================

export function TabsWithIconsExample() {
  const tabs: Tab[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <span>👤</span>,
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">User Profile</h3>
          <p className="text-gray-600">Manage your personal information and preferences.</p>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <span>⚙️</span>,
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-gray-600">Configure your account settings and notifications.</p>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      icon: <span>🔒</span>,
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Security</h3>
          <p className="text-gray-600">Manage your password and security settings.</p>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <span>🔔</span>,
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          <p className="text-gray-600">Control how you receive updates and alerts.</p>
        </div>
      ),
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Tabs with Icons</h3>
      <BaseTabs tabs={tabs} variant="pills" />
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Visual indicators for tab content</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 4: With Badges
// ============================================================================

export function TabsWithBadgesExample() {
  const tabs: Tab[] = [
    {
      id: 'all',
      label: 'All',
      badge: '156',
      content: (
        <div className="p-4">
          <p className="text-gray-600">All 156 items displayed here.</p>
        </div>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <span>⏳</span>,
      badge: '12',
      content: (
        <div className="p-4">
          <p className="text-gray-600">12 items pending review.</p>
        </div>
      ),
    },
    {
      id: 'approved',
      label: 'Approved',
      icon: <span>✓</span>,
      badge: '98',
      content: (
        <div className="p-4">
          <p className="text-gray-600">98 items approved.</p>
        </div>
      ),
    },
    {
      id: 'rejected',
      label: 'Rejected',
      icon: <span>✕</span>,
      badge: '46',
      content: (
        <div className="p-4">
          <p className="text-gray-600">46 items rejected.</p>
        </div>
      ),
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Tabs with Badges</h3>
      <BaseTabs tabs={tabs} variant="underline" />
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Show counts or notifications per tab</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 5: Sizes
// ============================================================================

export function TabSizesExample() {
  const tabs: Tab[] = [
    {
      id: 'tab1',
      label: 'First',
      content: <div className="p-4">Content here</div>,
    },
    {
      id: 'tab2',
      label: 'Second',
      content: <div className="p-4">Content here</div>,
    },
    {
      id: 'tab3',
      label: 'Third',
      content: <div className="p-4">Content here</div>,
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-6">Tab Sizes</h3>
      
      <div className="space-y-8">
        {/* Small */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Small:</h4>
          <BaseTabs tabs={tabs} size="small" variant="pills" />
        </div>

        {/* Medium */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Medium (Default):</h4>
          <BaseTabs tabs={tabs} size="medium" variant="pills" />
        </div>

        {/* Large */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Large:</h4>
          <BaseTabs tabs={tabs} size="large" variant="pills" />
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Match tab size to context and hierarchy</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 6: Full Width & Centered
// ============================================================================

export function TabLayoutExample() {
  const tabs: Tab[] = [
    {
      id: 'tab1',
      label: 'Overview',
      content: <div className="p-4">Overview content</div>,
    },
    {
      id: 'tab2',
      label: 'Analytics',
      content: <div className="p-4">Analytics content</div>,
    },
    {
      id: 'tab3',
      label: 'Reports',
      content: <div className="p-4">Reports content</div>,
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-6">Tab Layouts</h3>
      
      <div className="space-y-8">
        {/* Default (Left aligned) */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Left Aligned (Default):</h4>
          <BaseTabs tabs={tabs} variant="contained" />
        </div>

        {/* Centered */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Centered:</h4>
          <BaseTabs tabs={tabs} variant="contained" centered />
        </div>

        {/* Full Width */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Full Width:</h4>
          <BaseTabs tabs={tabs} variant="contained" fullWidth />
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Different alignments for different layouts</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 7: Controlled Tabs
// ============================================================================

export function ControlledTabsExample() {
  const [activeTab, setActiveTab] = useState('step1');

  const handleNext = () => {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  };

  const tabs: Tab[] = [
    {
      id: 'step1',
      label: 'Farm Info',
      icon: <span>🌱</span>,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Step 1: Farm Information</h3>
          <p className="text-gray-600 mb-4">Enter your basic farm details.</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleNext}
            >
              Next →
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'step2',
      label: 'Crops',
      icon: <span>🌾</span>,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Step 2: Crop Details</h3>
          <p className="text-gray-600 mb-4">Specify the crops you grow.</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handlePrevious}
            >
              ← Previous
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleNext}
            >
              Next →
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'step3',
      label: 'Documents',
      icon: <span>📄</span>,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Step 3: Upload Documents</h3>
          <p className="text-gray-600 mb-4">Upload required documentation.</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handlePrevious}
            >
              ← Previous
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleNext}
            >
              Next →
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'step4',
      label: 'Review',
      icon: <span>✓</span>,
      content: (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Step 4: Review & Submit</h3>
          <p className="text-gray-600 mb-4">Review your application before submission.</p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={handlePrevious}
            >
              ← Previous
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => alert('Form submitted!')}
            >
              Submit ✓
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Controlled Tabs (Stepper)</h3>
      <BaseTabs
        tabs={tabs}
        variant="underline"
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Multi-step forms with programmatic navigation</p>
        <p className="text-xs mt-1">Current step: {activeTab}</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 8: Real-World Use Cases
// ============================================================================

export function RealWorldTabsExample() {
  // Farm Dashboard
  const farmDashboardTabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <span>📊</span>,
      content: (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Area</p>
              <p className="text-2xl font-bold">25 ha</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Certified</p>
              <p className="text-2xl font-bold">18 ha</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">7 ha</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: <span>🏆</span>,
      badge: '3',
      content: (
        <div className="p-4">
          <div className="space-y-2">
            <div className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">GACP Certificate</p>
                <p className="text-sm text-gray-600">Valid until: Dec 2025</p>
              </div>
              <BaseBadge color="success" size="small">Active</BaseBadge>
            </div>
            <div className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">Organic Certificate</p>
                <p className="text-sm text-gray-600">Valid until: Jan 2026</p>
              </div>
              <BaseBadge color="success" size="small">Active</BaseBadge>
            </div>
            <div className="p-3 border rounded flex justify-between items-center">
              <div>
                <p className="font-medium">Fair Trade Certificate</p>
                <p className="text-sm text-gray-600">Expired: Oct 2025</p>
              </div>
              <BaseBadge color="error" size="small">Expired</BaseBadge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: <span>📋</span>,
      badge: '2',
      content: (
        <div className="p-4">
          <div className="space-y-2">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-medium">Upcoming Inspection</p>
              <p className="text-sm text-gray-600">Date: Nov 15, 2025</p>
              <p className="text-sm text-gray-600">Inspector: John Smith</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="font-medium">Last Inspection</p>
              <p className="text-sm text-gray-600">Date: May 10, 2025</p>
              <p className="text-sm text-gray-600">Result: Passed ✓</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'activities',
      label: 'Activity Log',
      icon: <span>📝</span>,
      content: (
        <div className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-500">Nov 4, 2025</span>
              <span>Certificate renewed successfully</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Nov 2, 2025</span>
              <span>Documents uploaded</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500">Oct 28, 2025</span>
              <span>Inspection report received</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Farm Dashboard Tabs</h3>
      <BaseTabs tabs={farmDashboardTabs} variant="contained" />
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Complete farm management interface</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export default function BaseTabsExamples() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BaseTabs Examples</h1>
        <p className="text-gray-600">
          Comprehensive examples demonstrating all features of the BaseTabs component
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BasicTabsExample />
        <TabVariantsExample />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TabsWithIconsExample />
        <TabsWithBadgesExample />
      </div>

      <div className="mt-6">
        <TabSizesExample />
      </div>

      <div className="mt-6">
        <TabLayoutExample />
      </div>

      <div className="mt-6">
        <ControlledTabsExample />
      </div>

      <div className="mt-6">
        <RealWorldTabsExample />
      </div>
    </div>
  );
}
