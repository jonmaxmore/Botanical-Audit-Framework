import React from 'react';
import BaseBreadcrumb, { BreadcrumbItem } from './BaseBreadcrumb';

/**
 * BaseBreadcrumb Examples
 * 
 * Demonstrates all features and use cases of the BaseBreadcrumb component.
 */

// Example 1: Basic Breadcrumb
export const BasicBreadcrumbExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptop' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Breadcrumb</h3>
      <BaseBreadcrumb items={items} />
    </div>
  );
};

// Example 2: Separator Styles
export const SeparatorStylesExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Docs', href: '/docs' },
    { label: 'Components', href: '/docs/components' },
    { label: 'Breadcrumb' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Separator Styles</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Slash (default)</p>
          <BaseBreadcrumb items={items} separator="slash" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Chevron</p>
          <BaseBreadcrumb items={items} separator="chevron" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Arrow</p>
          <BaseBreadcrumb items={items} separator="arrow" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Dot</p>
          <BaseBreadcrumb items={items} separator="dot" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Custom (❯)</p>
          <BaseBreadcrumb
            items={items}
            separator="custom"
            customSeparator={<span className="mx-2 text-primary-500">❯</span>}
          />
        </div>
      </div>
    </div>
  );
};

// Example 3: Sizes
export const BreadcrumbSizesExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Breadcrumb Sizes</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Small</p>
          <BaseBreadcrumb items={items} size="small" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Medium (default)</p>
          <BaseBreadcrumb items={items} size="medium" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Large</p>
          <BaseBreadcrumb items={items} size="large" />
        </div>
      </div>
    </div>
  );
};

// Example 4: With Home Icon
export const BreadcrumbWithHomeIconExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">With Home Icon</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">Default Home Icon</p>
          <BaseBreadcrumb items={items} showHomeIcon separator="chevron" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Custom Home Icon</p>
          <BaseBreadcrumb
            items={items}
            showHomeIcon
            separator="chevron"
            homeIcon={
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
};

// Example 5: With Icons
export const BreadcrumbWithIconsExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Farms',
      href: '/farms',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
    },
    {
      label: 'Farm #42',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Icons</h3>
      <BaseBreadcrumb items={items} separator="chevron" />
    </div>
  );
};

// Example 6: Collapsed Breadcrumb (maxItems)
export const CollapsedBreadcrumbExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Level 1', href: '/level1' },
    { label: 'Level 2', href: '/level1/level2' },
    { label: 'Level 3', href: '/level1/level2/level3' },
    { label: 'Level 4', href: '/level1/level2/level3/level4' },
    { label: 'Level 5', href: '/level1/level2/level3/level4/level5' },
    { label: 'Current Page' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Collapsed Breadcrumb</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">All Items (7 levels)</p>
          <BaseBreadcrumb items={items} separator="chevron" />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Max 5 Items (collapsed)</p>
          <BaseBreadcrumb items={items} separator="chevron" maxItems={5} />
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Max 3 Items (more collapsed)</p>
          <BaseBreadcrumb items={items} separator="chevron" maxItems={3} />
        </div>
      </div>
    </div>
  );
};

// Example 7: With Click Handler
export const BreadcrumbWithClickHandlerExample: React.FC = () => {
  const [lastClicked, setLastClicked] = React.useState<string>('');

  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops' },
  ];

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    setLastClicked(`Clicked: "${item.label}" (index ${index})`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Click Handler</h3>
      <BaseBreadcrumb
        items={items}
        separator="chevron"
        onItemClick={handleItemClick}
      />
      {lastClicked && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          {lastClicked}
        </div>
      )}
    </div>
  );
};

// Example 8: Real-World - Farm Management
export const FarmManagementBreadcrumbExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Farms', href: '/farms' },
    { label: 'Green Valley Farm', href: '/farms/42' },
    { label: 'Inspections', href: '/farms/42/inspections' },
    { label: 'Inspection Report #2024-001' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Farm Management Navigation</h3>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <BaseBreadcrumb
          items={items}
          separator="chevron"
          showHomeIcon
          size="medium"
        />
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900">Inspection Report #2024-001</h2>
          <p className="text-gray-600 mt-2">Detailed inspection report for Green Valley Farm</p>
        </div>
      </div>
    </div>
  );
};

// Example 9: Real-World - Certificate Portal
export const CertificatePortalBreadcrumbExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Certificates', href: '/certificates' },
    { label: 'GACP-2024-001234', href: '/certificates/GACP-2024-001234' },
    { label: 'Documents' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Certificate Portal Navigation</h3>
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
        <BaseBreadcrumb
          items={items}
          separator="chevron"
          size="medium"
        />
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Certificate Documents</h2>
              <p className="text-sm text-gray-600">GACP-2024-001234 • Issued: Jan 15, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 10: Real-World - Admin Portal Settings
export const AdminPortalBreadcrumbExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    {
      label: 'Admin',
      href: '/admin',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'System Settings',
      href: '/admin/settings',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      label: 'Email Configuration',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Admin Portal Settings</h3>
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <BaseBreadcrumb
          items={items}
          separator="chevron"
          size="small"
        />
        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Email Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">SMTP Server</p>
              <p className="text-sm text-gray-600 mt-1">smtp.example.com</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Port</p>
              <p className="text-sm text-gray-600 mt-1">587 (TLS)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 11: Disabled Items
export const DisabledItemsExample: React.FC = () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Restricted Area', href: '/restricted', disabled: true },
    { label: 'Settings' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Disabled Items</h3>
      <BaseBreadcrumb items={items} separator="chevron" />
      <p className="text-sm text-gray-600">
        "Restricted Area" is disabled and not clickable
      </p>
    </div>
  );
};

// Example 12: All Features Combined
export const ComprehensiveBreadcrumbExample: React.FC = () => {
  const [clickLog, setClickLog] = React.useState<string[]>([]);

  const items: BreadcrumbItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory 1', href: '/category/sub1' },
    { label: 'Subcategory 2', href: '/category/sub1/sub2' },
    { label: 'Subcategory 3', href: '/category/sub1/sub2/sub3', disabled: true },
    { label: 'Current Page' },
  ];

  const handleClick = (item: BreadcrumbItem, index: number) => {
    const message = `${new Date().toLocaleTimeString()}: Clicked "${item.label}" at index ${index}`;
    setClickLog((prev) => [message, ...prev].slice(0, 5));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">All Features Combined</h3>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <BaseBreadcrumb
          items={items}
          separator="chevron"
          size="medium"
          maxItems={4}
          onItemClick={handleClick}
        />

        {clickLog.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Click Log:</h4>
            <div className="space-y-1">
              {clickLog.map((log, index) => (
                <p key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>✓ Custom icon for first item</p>
        <p>✓ Chevron separator</p>
        <p>✓ Medium size</p>
        <p>✓ Collapsed to 4 items max (shows ... for hidden items)</p>
        <p>✓ One disabled item (Subcategory 3)</p>
        <p>✓ Click tracking enabled</p>
      </div>
    </div>
  );
};

// Export all examples
export const AllBreadcrumbExamples: React.FC = () => {
  return (
    <div className="space-y-12 p-8">
      <h1 className="text-3xl font-bold text-gray-900">BaseBreadcrumb Examples</h1>
      
      <BasicBreadcrumbExample />
      <SeparatorStylesExample />
      <BreadcrumbSizesExample />
      <BreadcrumbWithHomeIconExample />
      <BreadcrumbWithIconsExample />
      <CollapsedBreadcrumbExample />
      <BreadcrumbWithClickHandlerExample />
      <DisabledItemsExample />
      <FarmManagementBreadcrumbExample />
      <CertificatePortalBreadcrumbExample />
      <AdminPortalBreadcrumbExample />
      <ComprehensiveBreadcrumbExample />
    </div>
  );
};

export default AllBreadcrumbExamples;
