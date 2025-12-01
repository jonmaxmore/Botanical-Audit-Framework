import React, { useState } from 'react';
import { BaseAccordion, AccordionItem } from './BaseAccordion';
import BaseCard from './BaseCard';
import BaseBadge from './BaseBadge';

/**
 * Example 1: Basic Accordion with Single Mode
 */
export const BasicAccordionExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'section-1',
      header: 'What is G.A.C.P. Certification?',
      content: (
        <div className="space-y-2">
          <p>
            Good Agricultural and Collection Practices (G.A.C.P.) is an international standard
            for the cultivation and collection of medicinal plants and herbs.
          </p>
          <p>
            It ensures quality, safety, and sustainability throughout the entire production process,
            from seed selection to harvesting and post-harvest handling.
          </p>
        </div>
      ),
    },
    {
      id: 'section-2',
      header: 'How long does certification take?',
      content: (
        <div className="space-y-2">
          <p>
            The certification process typically takes 3-6 months, depending on the complexity
            of your operation and how quickly you can implement required changes.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Initial assessment: 2-4 weeks</li>
            <li>Implementation period: 1-3 months</li>
            <li>Final audit and certification: 2-4 weeks</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'section-3',
      header: 'What are the requirements?',
      content: (
        <div className="space-y-2">
          <p>Key requirements include:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Proper documentation of all farming activities</li>
            <li>Safe use and storage of agricultural inputs</li>
            <li>Water quality management and testing</li>
            <li>Worker safety and training programs</li>
            <li>Traceability systems for all products</li>
            <li>Environmental protection measures</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <BaseCard title="Frequently Asked Questions" variant="outlined">
      <BaseAccordion 
        items={items} 
        mode="single" 
        defaultExpanded={['section-1']}
      />
    </BaseCard>
  );
};

/**
 * Example 2: Multiple Expansion Mode
 */
export const MultipleExpansionExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'permissions',
      header: 'User Permissions',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>View certificates</span>
            <BaseBadge variant="solid" color="success">Enabled</BaseBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Edit inspections</span>
            <BaseBadge variant="solid" color="success">Enabled</BaseBadge>
          </div>
          <div className="flex items-center justify-between">
            <span>Delete records</span>
            <BaseBadge variant="solid" color="error">Disabled</BaseBadge>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      header: 'Notification Settings',
      content: (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Email notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>SMS alerts</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Push notifications</span>
          </label>
        </div>
      ),
    },
    {
      id: 'security',
      header: 'Security Options',
      content: (
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Two-factor authentication</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Login alerts</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Session timeout (30 minutes)</span>
          </label>
        </div>
      ),
    },
  ];

  return (
    <BaseCard title="Account Settings" variant="outlined">
      <BaseAccordion 
        items={items} 
        mode="multiple"
        defaultExpanded={['permissions', 'notifications']}
      />
    </BaseCard>
  );
};

/**
 * Example 3: Accordion Variants
 */
export const AccordionVariantsExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'item-1',
      header: 'Section 1',
      content: 'This is the content of section 1.',
    },
    {
      id: 'item-2',
      header: 'Section 2',
      content: 'This is the content of section 2.',
    },
    {
      id: 'item-3',
      header: 'Section 3',
      content: 'This is the content of section 3.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Default Variant</h3>
        <BaseAccordion items={items} variant="default" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Bordered Variant</h3>
        <BaseAccordion items={items} variant="bordered" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Separated Variant</h3>
        <BaseAccordion items={items} variant="separated" />
      </div>
    </div>
  );
};

/**
 * Example 4: Accordion with Icons
 */
export const AccordionWithIconsExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'farm-info',
      header: 'Farm Information',
      icon: '🌾',
      content: (
        <div className="space-y-2">
          <p><strong>Farm Name:</strong> Green Valley Botanicals</p>
          <p><strong>Location:</strong> Chiang Mai, Thailand</p>
          <p><strong>Size:</strong> 15 hectares</p>
          <p><strong>Crops:</strong> Medicinal herbs, organic vegetables</p>
        </div>
      ),
    },
    {
      id: 'certification',
      header: 'Certification Status',
      icon: '✓',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BaseBadge variant="solid" color="success">Active</BaseBadge>
            <span>G.A.C.P. Certified</span>
          </div>
          <p><strong>Certificate Number:</strong> GACP-2024-001234</p>
          <p><strong>Issue Date:</strong> January 15, 2024</p>
          <p><strong>Expiry Date:</strong> January 15, 2027</p>
        </div>
      ),
    },
    {
      id: 'inspections',
      header: 'Recent Inspections',
      icon: '🔍',
      content: (
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-medium">Annual Audit - October 2024</p>
            <p className="text-sm text-gray-600">Result: Passed with minor observations</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-medium">Surprise Inspection - July 2024</p>
            <p className="text-sm text-gray-600">Result: Fully compliant</p>
          </div>
        </div>
      ),
    },
    {
      id: 'documents',
      header: 'Documents',
      icon: '📄',
      content: (
        <div className="space-y-2">
          <a href="#" className="block text-primary-600 hover:text-primary-700">
            📥 Certificate Copy (PDF)
          </a>
          <a href="#" className="block text-primary-600 hover:text-primary-700">
            📥 Audit Report (PDF)
          </a>
          <a href="#" className="block text-primary-600 hover:text-primary-700">
            📥 Farm Management Plan (PDF)
          </a>
        </div>
      ),
    },
  ];

  return (
    <BaseCard title="Farm Profile" variant="outlined">
      <BaseAccordion 
        items={items} 
        mode="single"
        variant="separated"
      />
    </BaseCard>
  );
};

/**
 * Example 5: Accordion Sizes
 */
export const AccordionSizesExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'item-1',
      header: 'Section 1',
      content: 'Content with appropriate padding based on size.',
    },
    {
      id: 'item-2',
      header: 'Section 2',
      content: 'Notice how the padding and text size changes.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Small Size</h3>
        <BaseAccordion items={items} size="small" variant="bordered" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Medium Size (Default)</h3>
        <BaseAccordion items={items} size="medium" variant="bordered" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Large Size</h3>
        <BaseAccordion items={items} size="large" variant="bordered" />
      </div>
    </div>
  );
};

/**
 * Example 6: Controlled Accordion
 */
export const ControlledAccordionExample: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['step-1']);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: AccordionItem[] = [
    {
      id: 'step-1',
      header: '📝 Step 1: Farm Details',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Farm Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter farm name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter location"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'step-2',
      header: '🌱 Step 2: Crop Information',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Crops</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter crop types"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Area (hectares)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Enter area"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'step-3',
      header: '📋 Step 3: Certification Type',
      content: (
        <div className="space-y-3">
          <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="radio" name="cert-type" value="gacp" />
            <div>
              <div className="font-medium">G.A.C.P. Certification</div>
              <div className="text-sm text-gray-600">Good Agricultural and Collection Practices</div>
            </div>
          </label>
          <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="radio" name="cert-type" value="organic" />
            <div>
              <div className="font-medium">Organic Certification</div>
              <div className="text-sm text-gray-600">Certified organic farming practices</div>
            </div>
          </label>
        </div>
      ),
    },
    {
      id: 'step-4',
      header: '✓ Step 4: Review & Submit',
      content: (
        <div className="space-y-3">
          <p className="text-gray-600">Please review your information before submitting:</p>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p><strong>Farm:</strong> [Your farm name]</p>
            <p><strong>Location:</strong> [Your location]</p>
            <p><strong>Crops:</strong> [Your crops]</p>
            <p><strong>Certification:</strong> [Selected type]</p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setExpandedItems([steps[nextStep].id]);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setExpandedItems([steps[prevStep].id]);
    }
  };

  return (
    <BaseCard title="Certification Application Form" variant="outlined">
      <BaseAccordion
        items={steps}
        mode="single"
        variant="separated"
        expandedItems={expandedItems}
        onChange={setExpandedItems}
      />
      
      <div className="flex justify-between mt-6 pt-6 border-t">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Next Step
          </button>
        ) : (
          <button className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700">
            Submit Application
          </button>
        )}
      </div>
    </BaseCard>
  );
};

/**
 * Example 7: Disabled States
 */
export const DisabledAccordionExample: React.FC = () => {
  const items: AccordionItem[] = [
    {
      id: 'available',
      header: 'Available Section',
      content: 'This section is available and can be expanded.',
    },
    {
      id: 'disabled-1',
      header: 'Disabled Section',
      content: 'This content is not accessible.',
      disabled: true,
    },
    {
      id: 'available-2',
      header: 'Another Available Section',
      content: 'This section is also available.',
    },
    {
      id: 'disabled-2',
      header: 'Another Disabled Section',
      content: 'This content is also not accessible.',
      disabled: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Individual Items Disabled</h3>
        <BaseAccordion items={items} variant="bordered" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Entire Accordion Disabled</h3>
        <BaseAccordion 
          items={items.map(item => ({ ...item, disabled: false }))} 
          variant="bordered"
          disabled
        />
      </div>
    </div>
  );
};

/**
 * Example 8: Real-World Dashboard Use Case
 */
export const RealWorldAccordionExample: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const dashboardSections: AccordionItem[] = [
    {
      id: 'overview',
      header: 'Farm Overview',
      icon: '📊',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-3xl font-bold text-primary-600">15.5</div>
            <div className="text-sm text-gray-600">Hectares</div>
          </div>
          <div className="p-4 bg-success-50 rounded-lg">
            <div className="text-3xl font-bold text-success-600">12</div>
            <div className="text-sm text-gray-600">Crop Types</div>
          </div>
          <div className="p-4 bg-warning-50 rounded-lg">
            <div className="text-3xl font-bold text-warning-600">3</div>
            <div className="text-sm text-gray-600">Certifications</div>
          </div>
        </div>
      ),
    },
    {
      id: 'active-certificates',
      header: 'Active Certificates',
      icon: '✓',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">G.A.C.P. Certification</div>
              <div className="text-sm text-gray-600">Expires: January 15, 2027</div>
            </div>
            <BaseBadge variant="solid" color="success">Active</BaseBadge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Organic Certification</div>
              <div className="text-sm text-gray-600">Expires: March 22, 2026</div>
            </div>
            <BaseBadge variant="solid" color="success">Active</BaseBadge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Fair Trade Certification</div>
              <div className="text-sm text-gray-600">Expires: June 10, 2025</div>
            </div>
            <BaseBadge variant="solid" color="warning">Expiring Soon</BaseBadge>
          </div>
        </div>
      ),
    },
    {
      id: 'upcoming-inspections',
      header: 'Upcoming Inspections',
      icon: '📅',
      content: (
        <div className="space-y-3">
          <div className="p-3 border-l-4 border-primary-500 bg-primary-50 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Annual G.A.C.P. Audit</span>
              <BaseBadge variant="soft" color="primary">In 15 days</BaseBadge>
            </div>
            <p className="text-sm text-gray-600">Scheduled: November 19, 2025</p>
          </div>
          <div className="p-3 border-l-4 border-warning-500 bg-warning-50 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Organic Recertification</span>
              <BaseBadge variant="soft" color="warning">In 45 days</BaseBadge>
            </div>
            <p className="text-sm text-gray-600">Scheduled: December 19, 2025</p>
          </div>
        </div>
      ),
    },
    {
      id: 'recent-activity',
      header: 'Recent Activity',
      icon: '📝',
      content: (
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
            <div className="text-2xl">📄</div>
            <div className="flex-1">
              <p className="text-sm font-medium">SOP Document Updated</p>
              <p className="text-xs text-gray-600">Harvest procedures revised - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
            <div className="text-2xl">🔍</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Field Inspection Completed</p>
              <p className="text-xs text-gray-600">North field inspection passed - Yesterday</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
            <div className="text-2xl">✓</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Training Session Completed</p>
              <p className="text-xs text-gray-600">Worker safety training - 3 days ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <p className="text-sm font-medium">Monthly Report Generated</p>
              <p className="text-xs text-gray-600">Production summary for October - 1 week ago</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <BaseCard title="Farm Dashboard" variant="elevated">
      <BaseAccordion
        items={dashboardSections}
        mode="multiple"
        variant="separated"
        expandedItems={expandedSections}
        onChange={setExpandedSections}
      />
    </BaseCard>
  );
};

const examples = {
  BasicAccordionExample,
  MultipleExpansionExample,
  AccordionVariantsExample,
  AccordionWithIconsExample,
  AccordionSizesExample,
  ControlledAccordionExample,
  DisabledAccordionExample,
  RealWorldAccordionExample,
};

export default examples;
