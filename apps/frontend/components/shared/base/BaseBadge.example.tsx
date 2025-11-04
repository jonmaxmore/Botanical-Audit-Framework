/**
 * BaseBadge Component Examples
 * 
 * Demonstrates various use cases:
 * 1. Basic Badges (Colors & Variants)
 * 2. Sizes
 * 3. With Icons
 * 4. With Dots
 * 5. Removable Badges
 * 6. Clickable Badges
 * 7. Status Indicators
 * 8. Real-World Use Cases
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseBadge from './BaseBadge';
import BaseCard from './BaseCard';

// ============================================================================
// Example 1: Basic Badges - Colors & Variants
// ============================================================================

export function BasicBadgesExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Basic Badges - Colors & Variants</h3>
      
      {/* Solid Variant */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Solid Variant (Default):</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge color="primary">Primary</BaseBadge>
            <BaseBadge color="secondary">Secondary</BaseBadge>
            <BaseBadge color="success">Success</BaseBadge>
            <BaseBadge color="error">Error</BaseBadge>
            <BaseBadge color="warning">Warning</BaseBadge>
            <BaseBadge color="info">Info</BaseBadge>
            <BaseBadge color="gray">Gray</BaseBadge>
          </div>
        </div>

        {/* Outlined Variant */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Outlined Variant:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="outlined" color="primary">Primary</BaseBadge>
            <BaseBadge variant="outlined" color="secondary">Secondary</BaseBadge>
            <BaseBadge variant="outlined" color="success">Success</BaseBadge>
            <BaseBadge variant="outlined" color="error">Error</BaseBadge>
            <BaseBadge variant="outlined" color="warning">Warning</BaseBadge>
            <BaseBadge variant="outlined" color="info">Info</BaseBadge>
            <BaseBadge variant="outlined" color="gray">Gray</BaseBadge>
          </div>
        </div>

        {/* Soft Variant */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Soft Variant:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="soft" color="primary">Primary</BaseBadge>
            <BaseBadge variant="soft" color="secondary">Secondary</BaseBadge>
            <BaseBadge variant="soft" color="success">Success</BaseBadge>
            <BaseBadge variant="soft" color="error">Error</BaseBadge>
            <BaseBadge variant="soft" color="warning">Warning</BaseBadge>
            <BaseBadge variant="soft" color="info">Info</BaseBadge>
            <BaseBadge variant="soft" color="gray">Gray</BaseBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Color-coded status and categories</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 2: Sizes
// ============================================================================

export function BadgeSizesExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Badge Sizes</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Small:</span>
          <BaseBadge size="small" color="primary">Small Badge</BaseBadge>
          <BaseBadge size="small" variant="outlined" color="success">Outlined</BaseBadge>
          <BaseBadge size="small" variant="soft" color="warning">Soft</BaseBadge>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Medium:</span>
          <BaseBadge size="medium" color="primary">Medium Badge</BaseBadge>
          <BaseBadge size="medium" variant="outlined" color="success">Outlined</BaseBadge>
          <BaseBadge size="medium" variant="soft" color="warning">Soft</BaseBadge>
        </div>

        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Large:</span>
          <BaseBadge size="large" color="primary">Large Badge</BaseBadge>
          <BaseBadge size="large" variant="outlined" color="success">Outlined</BaseBadge>
          <BaseBadge size="large" variant="soft" color="warning">Soft</BaseBadge>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Match badge size to context</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 3: With Icons
// ============================================================================

export function BadgesWithIconsExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Badges with Icons</h3>
      
      <div className="space-y-4">
        {/* Start Icon */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Start Icon:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge color="success" startIcon={<span>✓</span>}>
              Verified
            </BaseBadge>
            <BaseBadge color="error" startIcon={<span>✕</span>}>
              Failed
            </BaseBadge>
            <BaseBadge color="warning" startIcon={<span>⚠</span>}>
              Warning
            </BaseBadge>
            <BaseBadge color="info" startIcon={<span>ℹ</span>}>
              Information
            </BaseBadge>
          </div>
        </div>

        {/* End Icon */}
        <div>
          <h4 className="text-sm font-semibold mb-2">End Icon:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge color="primary" endIcon={<span>→</span>}>
              Continue
            </BaseBadge>
            <BaseBadge color="success" endIcon={<span>↑</span>}>
              Upload
            </BaseBadge>
            <BaseBadge color="info" endIcon={<span>↓</span>}>
              Download
            </BaseBadge>
          </div>
        </div>

        {/* Both Icons */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Both Icons:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge 
              color="success" 
              startIcon={<span>🌱</span>}
              endIcon={<span>✓</span>}
            >
              Certified Farm
            </BaseBadge>
            <BaseBadge 
              variant="soft"
              color="warning" 
              startIcon={<span>📋</span>}
              endIcon={<span>⏳</span>}
            >
              Pending Review
            </BaseBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Visual indicators for status and actions</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 4: With Dots
// ============================================================================

export function BadgesWithDotsExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Badges with Dot Indicators</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <BaseBadge color="success" dot>Online</BaseBadge>
          <BaseBadge color="error" dot>Offline</BaseBadge>
          <BaseBadge color="warning" dot>Away</BaseBadge>
          <BaseBadge color="gray" dot>Inactive</BaseBadge>
        </div>

        <div className="flex flex-wrap gap-2">
          <BaseBadge variant="soft" color="success" dot>Active</BaseBadge>
          <BaseBadge variant="soft" color="warning" dot>Processing</BaseBadge>
          <BaseBadge variant="soft" color="error" dot>Failed</BaseBadge>
        </div>

        <div className="flex flex-wrap gap-2">
          <BaseBadge variant="outlined" color="info" dot>In Progress</BaseBadge>
          <BaseBadge variant="outlined" color="success" dot>Completed</BaseBadge>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Real-time status indicators with animated pulse</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 5: Removable Badges
// ============================================================================

export function RemovableBadgesExample() {
  const [tags, setTags] = useState([
    { id: 1, label: 'Organic', color: 'success' as const },
    { id: 2, label: 'Premium', color: 'primary' as const },
    { id: 3, label: 'Export Quality', color: 'info' as const },
    { id: 4, label: 'Fair Trade', color: 'secondary' as const },
  ]);

  const handleRemove = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Removable Badges</h3>
      
      <div className="space-y-4">
        {/* Solid Removable */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Solid Removable:</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <BaseBadge
                key={tag.id}
                color={tag.color}
                removable
                onRemove={() => handleRemove(tag.id)}
              >
                {tag.label}
              </BaseBadge>
            ))}
          </div>
        </div>

        {/* Soft Removable */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Soft Removable:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="soft" color="primary" removable onRemove={() => {}}>
              JavaScript
            </BaseBadge>
            <BaseBadge variant="soft" color="success" removable onRemove={() => {}}>
              TypeScript
            </BaseBadge>
            <BaseBadge variant="soft" color="info" removable onRemove={() => {}}>
              React
            </BaseBadge>
          </div>
        </div>

        {/* Outlined Removable */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Outlined Removable:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="outlined" color="warning" removable onRemove={() => {}}>
              Pending
            </BaseBadge>
            <BaseBadge variant="outlined" color="error" removable onRemove={() => {}}>
              Rejected
            </BaseBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Removable tags, filters, and selections</p>
        <p className="text-xs mt-1">Try removing the tags above!</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 6: Clickable Badges
// ============================================================================

export function ClickableBadgesExample() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', color: 'gray' as const },
    { id: 'certified', label: 'Certified', color: 'success' as const },
    { id: 'pending', label: 'Pending', color: 'warning' as const },
    { id: 'expired', label: 'Expired', color: 'error' as const },
  ];

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Clickable Badges</h3>
      
      <div className="space-y-4">
        {/* Filter Badges */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Filter Selection:</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <BaseBadge
                key={cat.id}
                color={cat.color}
                variant={selectedCategory === cat.id ? 'solid' : 'soft'}
                clickable
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </BaseBadge>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Selected: <strong>{selectedCategory}</strong>
          </p>
        </div>

        {/* Action Badges */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Action Badges:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge
              color="primary"
              clickable
              onClick={() => alert('View all certificates')}
              endIcon={<span>→</span>}
            >
              View All
            </BaseBadge>
            <BaseBadge
              color="success"
              clickable
              onClick={() => alert('Download report')}
              startIcon={<span>↓</span>}
            >
              Download
            </BaseBadge>
            <BaseBadge
              color="info"
              clickable
              onClick={() => alert('Share link')}
              startIcon={<span>🔗</span>}
            >
              Share
            </BaseBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Interactive filters and action triggers</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 7: Status Indicators
// ============================================================================

export function StatusIndicatorsExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
      
      <div className="space-y-6">
        {/* Certification Status */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Certification Status:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge color="success" startIcon={<span>✓</span>} pill>
              Certified
            </BaseBadge>
            <BaseBadge color="warning" dot pill>
              Pending Inspection
            </BaseBadge>
            <BaseBadge color="info" dot pill>
              Under Review
            </BaseBadge>
            <BaseBadge color="error" startIcon={<span>✕</span>} pill>
              Rejected
            </BaseBadge>
            <BaseBadge color="gray" pill>
              Draft
            </BaseBadge>
          </div>
        </div>

        {/* Farm Status */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Farm Status:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="soft" color="success" dot>
              Active
            </BaseBadge>
            <BaseBadge variant="soft" color="warning" dot>
              Verification Needed
            </BaseBadge>
            <BaseBadge variant="soft" color="gray">
              Suspended
            </BaseBadge>
          </div>
        </div>

        {/* Document Status */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Document Status:</h4>
          <div className="flex flex-wrap gap-2">
            <BaseBadge variant="outlined" color="success" startIcon={<span>📄</span>}>
              Approved
            </BaseBadge>
            <BaseBadge variant="outlined" color="warning" startIcon={<span>📋</span>}>
              Pending Review
            </BaseBadge>
            <BaseBadge variant="outlined" color="error" startIcon={<span>📝</span>}>
              Changes Required
            </BaseBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Visual status communication throughout the system</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 8: Real-World Use Cases
// ============================================================================

export function RealWorldExamplesCard() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Real-World Use Cases</h3>
      
      <div className="space-y-6">
        {/* Farm List */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Farm Listing:</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Green Valley Organic Farm</p>
                <p className="text-sm text-gray-600">Owner: John Smith</p>
              </div>
              <div className="flex gap-2">
                <BaseBadge color="success" size="small">Certified</BaseBadge>
                <BaseBadge variant="soft" color="primary" size="small">Premium</BaseBadge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Sunrise Agricultural Co.</p>
                <p className="text-sm text-gray-600">Owner: Jane Doe</p>
              </div>
              <div className="flex gap-2">
                <BaseBadge color="warning" size="small" dot>Pending</BaseBadge>
                <BaseBadge variant="soft" color="info" size="small">Export</BaseBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Card */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Certificate Information:</h4>
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h5 className="font-medium">GACP Certificate #2025-0123</h5>
                <p className="text-sm text-gray-600">Issued: January 15, 2025</p>
              </div>
              <BaseBadge color="success" startIcon={<span>✓</span>}>
                Valid
              </BaseBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              <BaseBadge variant="soft" color="primary" size="small">
                GACP
              </BaseBadge>
              <BaseBadge variant="soft" color="success" size="small">
                Organic
              </BaseBadge>
              <BaseBadge variant="soft" color="info" size="small">
                Export Approved
              </BaseBadge>
            </div>
          </div>
        </div>

        {/* Notification */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Notifications:</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <BaseBadge color="info" size="small">New</BaseBadge>
              <div className="flex-1">
                <p className="text-sm font-medium">Inspection Scheduled</p>
                <p className="text-xs text-gray-600">Your farm inspection is scheduled for Nov 15, 2025</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <BaseBadge color="warning" size="small" dot>Action Required</BaseBadge>
              <div className="flex-1">
                <p className="text-sm font-medium">Document Update Needed</p>
                <p className="text-xs text-gray-600">Please update your farm registration documents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Integration in real application contexts</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export default function BaseBadgeExamples() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BaseBadge Examples</h1>
        <p className="text-gray-600">
          Comprehensive examples demonstrating all features of the BaseBadge component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicBadgesExample />
        <BadgeSizesExample />
        <BadgesWithIconsExample />
        <BadgesWithDotsExample />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RemovableBadgesExample />
        <ClickableBadgesExample />
      </div>

      <div className="mt-6">
        <StatusIndicatorsExample />
      </div>

      <div className="mt-6">
        <RealWorldExamplesCard />
      </div>
    </div>
  );
}
