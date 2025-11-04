/**
 * BaseTooltip Component Examples
 * 
 * Demonstrates various use cases:
 * 1. Basic Tooltips (Simple text)
 * 2. Positioning (Top, Bottom, Left, Right)
 * 3. Trigger Modes (Hover, Focus, Click)
 * 4. Themes & Sizes
 * 5. With Icons & Complex Content
 * 6. Controlled Tooltips
 * 7. Form Field Help
 * 8. Interactive Elements
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseTooltip from './BaseTooltip';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';
import BaseInput from './BaseInput';

// ============================================================================
// Example 1: Basic Tooltips
// ============================================================================

export function BasicTooltipsExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Basic Tooltips</h3>
      
      <div className="flex flex-wrap gap-4">
        <BaseTooltip content="This is a simple tooltip">
          <BaseButton variant="contained">Hover me</BaseButton>
        </BaseTooltip>

        <BaseTooltip content="Click to edit this item">
          <BaseButton variant="outlined">Edit</BaseButton>
        </BaseTooltip>

        <BaseTooltip content="Delete this item permanently">
          <BaseButton variant="contained" color="error">Delete</BaseButton>
        </BaseTooltip>

        <BaseTooltip content="Save changes to database">
          <BaseButton variant="contained" color="success">Save</BaseButton>
        </BaseTooltip>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Simple text tooltips for buttons</p>
        <p><strong>Features:</strong> Default hover trigger, dark theme</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 2: Positioning
// ============================================================================

export function PositioningExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Tooltip Positioning</h3>
      
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Center area for positioning demo */}
        <div className="col-span-2 flex items-center justify-center gap-8">
          <BaseTooltip content="Tooltip on top" placement="top">
            <BaseButton variant="outlined">Top</BaseButton>
          </BaseTooltip>
        </div>

        <div className="col-span-2 flex items-center justify-center gap-8">
          <BaseTooltip content="Tooltip on left" placement="left">
            <BaseButton variant="outlined">Left</BaseButton>
          </BaseTooltip>

          <BaseTooltip content="Tooltip on right" placement="right">
            <BaseButton variant="outlined">Right</BaseButton>
          </BaseTooltip>
        </div>

        <div className="col-span-2 flex items-center justify-center gap-8">
          <BaseTooltip content="Tooltip on bottom" placement="bottom">
            <BaseButton variant="outlined">Bottom</BaseButton>
          </BaseTooltip>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Control tooltip position relative to target</p>
        <p><strong>Features:</strong> Auto-adjusts if goes off-screen</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 3: Trigger Modes
// ============================================================================

export function TriggerModesExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Trigger Modes</h3>
      
      <div className="space-y-4">
        {/* Hover Trigger */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Hover:</span>
          <BaseTooltip content="Shows on mouse hover" trigger="hover">
            <BaseButton variant="outlined">Hover over me</BaseButton>
          </BaseTooltip>
        </div>

        {/* Focus Trigger */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Focus:</span>
          <BaseTooltip content="Shows on keyboard focus" trigger="focus">
            <BaseButton variant="outlined">Tab to focus</BaseButton>
          </BaseTooltip>
        </div>

        {/* Click Trigger */}
        <div className="flex items-center gap-4">
          <span className="w-24 text-sm font-medium">Click:</span>
          <BaseTooltip content="Shows on click (click again to hide)" trigger="click">
            <BaseButton variant="outlined">Click me</BaseButton>
          </BaseTooltip>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Different interaction patterns</p>
        <p><strong>Features:</strong> Hover (default), Focus (keyboard), Click (mobile)</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 4: Themes & Sizes
// ============================================================================

export function ThemesSizesExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Themes & Sizes</h3>
      
      <div className="space-y-6">
        {/* Themes */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Themes:</h4>
          <div className="flex gap-4">
            <BaseTooltip content="Dark theme (default)" theme="dark">
              <BaseButton variant="outlined">Dark</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Light theme with shadow" theme="light">
              <BaseButton variant="outlined">Light</BaseButton>
            </BaseTooltip>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Sizes:</h4>
          <div className="flex gap-4">
            <BaseTooltip content="Small tooltip" size="small">
              <BaseButton variant="outlined" size="small">Small</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Medium tooltip (default)" size="medium">
              <BaseButton variant="outlined" size="medium">Medium</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Large tooltip with more space" size="large">
              <BaseButton variant="outlined" size="large">Large</BaseButton>
            </BaseTooltip>
          </div>
        </div>

        {/* Without Arrow */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Arrow Options:</h4>
          <div className="flex gap-4">
            <BaseTooltip content="With arrow (default)" arrow={true}>
              <BaseButton variant="outlined">With Arrow</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="No arrow indicator" arrow={false}>
              <BaseButton variant="outlined">No Arrow</BaseButton>
            </BaseTooltip>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Match tooltip style to UI design</p>
        <p><strong>Features:</strong> Dark/Light themes, Small/Medium/Large sizes</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 5: With Icons & Complex Content
// ============================================================================

export function ComplexContentExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Complex Content</h3>
      
      <div className="space-y-4">
        {/* Rich Text Tooltip */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Rich Content:</span>
          <BaseTooltip
            content={
              <div>
                <div className="font-semibold mb-1">Certification Status</div>
                <div className="text-xs">
                  ✅ Documents verified<br />
                  ✅ Payment confirmed<br />
                  ⏳ Pending inspection
                </div>
              </div>
            }
            maxWidth={250}
          >
            <BaseButton variant="outlined">
              Status Info
            </BaseButton>
          </BaseTooltip>
        </div>

        {/* Icon with Tooltip */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Help Icon:</span>
          <BaseTooltip
            content="Click here for detailed instructions on how to complete the GACP certification form"
            maxWidth={200}
          >
            <button className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold hover:bg-blue-600 transition-colors">
              ?
            </button>
          </BaseTooltip>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Warning:</span>
          <BaseTooltip
            content={
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div className="text-xs">
                  This action cannot be undone. Please review carefully before proceeding.
                </div>
              </div>
            }
            theme="light"
            maxWidth={280}
          >
            <BaseButton variant="contained" color="warning">
              Dangerous Action
            </BaseButton>
          </BaseTooltip>
        </div>

        {/* Stats Tooltip */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Statistics:</span>
          <BaseTooltip
            content={
              <div className="space-y-1">
                <div className="font-semibold text-xs">Farm Statistics</div>
                <div className="text-xs space-y-0.5">
                  <div>Total Area: 25 hectares</div>
                  <div>Certified: 18 hectares (72%)</div>
                  <div>Pending: 7 hectares (28%)</div>
                </div>
              </div>
            }
            maxWidth={220}
            placement="right"
          >
            <div className="px-4 py-2 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100 transition-colors">
              <span className="text-sm font-medium text-green-800">📊 View Stats</span>
            </div>
          </BaseTooltip>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Rich content with formatting, icons, lists</p>
        <p><strong>Features:</strong> Custom maxWidth, React components as content</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 6: Controlled Tooltips
// ============================================================================

export function ControlledTooltipExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Controlled Tooltips</h3>
      
      <div className="space-y-6">
        {/* Manual Control */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Manual Control:</h4>
          <div className="flex gap-4">
            <BaseTooltip
              content="This tooltip is controlled manually"
              trigger="manual"
              open={isOpen}
              onOpenChange={setIsOpen}
            >
              <BaseButton variant="outlined">Controlled Button</BaseButton>
            </BaseTooltip>

            <BaseButton
              variant="contained"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Hide' : 'Show'} Tooltip
            </BaseButton>
          </div>
        </div>

        {/* Programmatic Control */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Programmatic Control:</h4>
          <div className="flex gap-4">
            <BaseTooltip
              content="Automatically shown for 3 seconds"
              trigger="manual"
              open={autoOpen}
              onOpenChange={setAutoOpen}
            >
              <BaseButton variant="outlined">Auto Tooltip</BaseButton>
            </BaseTooltip>

            <BaseButton
              variant="contained"
              color="success"
              onClick={() => {
                setAutoOpen(true);
                setTimeout(() => setAutoOpen(false), 3000);
              }}
            >
              Show for 3s
            </BaseButton>
          </div>
        </div>

        {/* Status Display */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Manual tooltip:</strong> {isOpen ? 'Visible ✅' : 'Hidden ❌'}<br />
            <strong>Auto tooltip:</strong> {autoOpen ? 'Visible ✅' : 'Hidden ❌'}
          </p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Programmatic tooltip control</p>
        <p><strong>Features:</strong> Manual trigger, open/onOpenChange props</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 7: Form Field Help
// ============================================================================

export function FormFieldHelpExample() {
  const [formData, setFormData] = useState({
    farmName: '',
    farmSize: '',
    email: '',
  });

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Form Field Help</h3>
      
      <div className="space-y-4 max-w-md">
        {/* Farm Name */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Farm Name</label>
            <BaseTooltip
              content="Enter the official registered name of your farm as it appears on legal documents"
              maxWidth={250}
              placement="right"
            >
              <button className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs hover:bg-gray-500 transition-colors">
                ?
              </button>
            </BaseTooltip>
          </div>
          <BaseInput
            value={formData.farmName}
            onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
            placeholder="e.g., Green Valley Organic Farm"
          />
        </div>

        {/* Farm Size */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Farm Size (hectares)</label>
            <BaseTooltip
              content={
                <div className="text-xs">
                  <div className="font-semibold mb-1">Requirements:</div>
                  <ul className="space-y-0.5">
                    <li>• Minimum: 0.5 hectares</li>
                    <li>• Must include all cultivated areas</li>
                    <li>• Exclude non-agricultural land</li>
                  </ul>
                </div>
              }
              maxWidth={220}
              placement="right"
            >
              <button className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs hover:bg-gray-500 transition-colors">
                ?
              </button>
            </BaseTooltip>
          </div>
          <BaseInput
            type="number"
            value={formData.farmSize}
            onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
            placeholder="e.g., 25.5"
          />
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Contact Email</label>
            <BaseTooltip
              content="We'll send certification updates and inspection schedules to this email"
              maxWidth={200}
              placement="right"
            >
              <button className="w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs hover:bg-gray-500 transition-colors">
                ?
              </button>
            </BaseTooltip>
          </div>
          <BaseInput
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="farmer@example.com"
          />
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Contextual help for form fields</p>
        <p><strong>Features:</strong> Info icons with detailed instructions</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 8: Interactive Elements
// ============================================================================

export function InteractiveElementsExample() {
  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Interactive Elements</h3>
      
      <div className="space-y-6">
        {/* Table Actions */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Table Row Actions:</h4>
          <div className="border rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Farm Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 text-sm">Green Valley Farm</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Certified</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <BaseTooltip content="View certificate details" placement="top">
                        <button className="p-1 hover:bg-gray-100 rounded">👁️</button>
                      </BaseTooltip>
                      <BaseTooltip content="Download certificate PDF" placement="top">
                        <button className="p-1 hover:bg-gray-100 rounded">📄</button>
                      </BaseTooltip>
                      <BaseTooltip content="Renew certification" placement="top">
                        <button className="p-1 hover:bg-gray-100 rounded">🔄</button>
                      </BaseTooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Icon Toolbar */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Icon Toolbar:</h4>
          <div className="inline-flex gap-1 p-2 bg-gray-50 rounded">
            <BaseTooltip content="Bold (Ctrl+B)" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">
                <strong>B</strong>
              </button>
            </BaseTooltip>
            <BaseTooltip content="Italic (Ctrl+I)" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">
                <em>I</em>
              </button>
            </BaseTooltip>
            <BaseTooltip content="Underline (Ctrl+U)" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">
                <u>U</u>
              </button>
            </BaseTooltip>
            <div className="w-px bg-gray-300 mx-1" />
            <BaseTooltip content="Align Left" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">≡</button>
            </BaseTooltip>
            <BaseTooltip content="Align Center" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">≣</button>
            </BaseTooltip>
            <BaseTooltip content="Align Right" placement="bottom">
              <button className="p-2 hover:bg-gray-200 rounded">≡</button>
            </BaseTooltip>
          </div>
        </div>

        {/* Status Badges */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Status Indicators:</h4>
          <div className="flex gap-3">
            <BaseTooltip
              content={
                <div className="text-xs">
                  <div className="font-semibold mb-1">Pending Review</div>
                  <div>Awaiting inspector assignment</div>
                  <div className="mt-1 text-gray-300">Est. 2-3 days</div>
                </div>
              }
              placement="top"
            >
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm cursor-help">
                ⏳ Pending
              </span>
            </BaseTooltip>

            <BaseTooltip
              content={
                <div className="text-xs">
                  <div className="font-semibold mb-1">Inspection Scheduled</div>
                  <div>Date: Nov 15, 2025</div>
                  <div>Inspector: John Smith</div>
                </div>
              }
              placement="top"
            >
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-help">
                📅 Scheduled
              </span>
            </BaseTooltip>

            <BaseTooltip
              content={
                <div className="text-xs">
                  <div className="font-semibold mb-1">Certification Complete</div>
                  <div>Valid until: Nov 4, 2026</div>
                  <div className="mt-1 text-green-300">Certificate #GAC-2025-0123</div>
                </div>
              }
              placement="top"
            >
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm cursor-help">
                ✅ Certified
              </span>
            </BaseTooltip>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Tooltips for icons, badges, and actions</p>
        <p><strong>Features:</strong> Quick info without clicking away</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export default function BaseTooltipExamples() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BaseTooltip Examples</h1>
        <p className="text-gray-600">
          Comprehensive examples demonstrating all features of the BaseTooltip component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicTooltipsExample />
        <PositioningExample />
        <TriggerModesExample />
        <ThemesSizesExample />
      </div>

      <div className="mt-6">
        <ComplexContentExample />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ControlledTooltipExample />
        <FormFieldHelpExample />
      </div>

      <div className="mt-6">
        <InteractiveElementsExample />
      </div>
    </div>
  );
}
