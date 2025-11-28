import React, { useState } from 'react';
import BaseModal from './BaseModal';
import BaseCard from './BaseCard';
import BaseBadge from './BaseBadge';
import BaseButton from './BaseButton';

/**
 * Example 1: Basic Modal
 */
export const BasicModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <BaseButton onClick={() => setIsOpen(true)}>Open Basic Modal</BaseButton>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Welcome"
        size="md"
      >
        <div className="space-y-4">
          <p>This is a basic modal with a title and close button.</p>
          <p>You can close it by:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Clicking the X button</li>
            <li>Pressing the Escape key</li>
            <li>Clicking outside the modal</li>
          </ul>
        </div>
      </BaseModal>
    </div>
  );
};

/**
 * Example 2: Modal Sizes
 */
export const ModalSizesExample: React.FC = () => {
  const [activeSize, setActiveSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <BaseButton onClick={() => setActiveSize('sm')} size="small">Small Modal</BaseButton>
        <BaseButton onClick={() => setActiveSize('md')} size="small">Medium Modal</BaseButton>
        <BaseButton onClick={() => setActiveSize('lg')} size="small">Large Modal</BaseButton>
        <BaseButton onClick={() => setActiveSize('xl')} size="small">Extra Large</BaseButton>
        <BaseButton onClick={() => setActiveSize('full')} size="small">Full Width</BaseButton>
      </div>

      {['sm', 'md', 'lg', 'xl', 'full'].map((size) => (
        <BaseModal
          key={size}
          isOpen={activeSize === size}
          onClose={() => setActiveSize(null)}
          title={`${size.toUpperCase()} Modal`}
          size={size as any}
        >
          <p>This is a {size} sized modal.</p>
          <p className="mt-2 text-sm text-gray-600">
            Modal sizes help you present the right amount of content in an appropriate container.
          </p>
        </BaseModal>
      ))}
    </div>
  );
};

/**
 * Example 3: Modal with Footer
 */
export const ModalWithFooterExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    setAgreed(true);
    setIsOpen(false);
    setTimeout(() => setAgreed(false), 3000);
  };

  return (
    <div>
      <BaseButton onClick={() => setIsOpen(true)}>Show Terms & Conditions</BaseButton>

      {agreed && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-success-700">✓ You have agreed to the terms and conditions</p>
        </div>
      )}

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Terms and Conditions"
        size="lg"
        footer={
          <>
            <BaseButton variant="outlined" onClick={() => setIsOpen(false)}>
              Decline
            </BaseButton>
            <BaseButton variant="contained" onClick={handleAgree}>
              Accept & Continue
            </BaseButton>
          </>
        }
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <section>
            <h4 className="font-semibold mb-2">1. Acceptance of Terms</h4>
            <p className="text-sm text-gray-600">
              By accessing and using this G.A.C.P. certification platform, you accept and agree to be bound
              by the terms and provision of this agreement.
            </p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">2. Use License</h4>
            <p className="text-sm text-gray-600">
              Permission is granted to temporarily use this platform for personal, non-commercial
              certification management purposes only.
            </p>
          </section>

          <section>
            <h4 className="font-semibold mb-2">3. Data Privacy</h4>
            <p className="text-sm text-gray-600">
              All farm data, inspection reports, and certification documents are encrypted and stored
              securely. We comply with international data protection regulations.
            </p>
          </section>

          <section>
            <h4 className="font-semibold mb-2">4. Certification Standards</h4>
            <p className="text-sm text-gray-600">
              Users agree to maintain compliance with G.A.C.P. standards and submit to regular inspections
              and audits as required by certification bodies.
            </p>
          </section>
        </div>
      </BaseModal>
    </div>
  );
};

/**
 * Example 4: Confirmation Modal
 */
export const ConfirmationModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = () => {
    setDeleted(true);
    setIsOpen(false);
    setTimeout(() => setDeleted(false), 3000);
  };

  return (
    <div>
      <BaseButton variant="danger" onClick={() => setIsOpen(true)}>
        Delete Certificate
      </BaseButton>

      {deleted && (
        <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700">Certificate has been deleted</p>
        </div>
      )}

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        size="sm"
        closeOnBackdropClick={false}
        footer={
          <>
            <BaseButton variant="outlined" onClick={() => setIsOpen(false)}>
              Cancel
            </BaseButton>
            <BaseButton variant="danger" onClick={handleDelete}>
              Delete
            </BaseButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">Are you sure?</p>
          </div>
          <p className="text-sm text-gray-600">
            This action cannot be undone. This will permanently delete the certificate
            "GACP-2024-001234" and remove all associated data.
          </p>
        </div>
      </BaseModal>
    </div>
  );
};

/**
 * Example 5: Form Modal
 */
export const FormModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', size: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', location: '', size: '' });
    }, 3000);
  };

  return (
    <div>
      <BaseButton onClick={() => setIsOpen(true)}>Add New Farm</BaseButton>

      {submitted && (
        <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-success-700">✓ Farm "{formData.name}" has been added successfully</p>
        </div>
      )}

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Farm"
        size="md"
        footer={
          <>
            <BaseButton variant="outlined" onClick={() => setIsOpen(false)}>
              Cancel
            </BaseButton>
            <BaseButton variant="contained" type="submit" form="farm-form">
              Add Farm
            </BaseButton>
          </>
        }
      >
        <form id="farm-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="farm-name" className="block text-sm font-medium text-gray-700 mb-1">
              Farm Name *
            </label>
            <input
              id="farm-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter farm name"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              id="location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              Farm Size (hectares) *
            </label>
            <input
              id="size"
              type="number"
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter size"
            />
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

/**
 * Example 6: Modal with Custom Animations
 */
export const AnimatedModalExample: React.FC = () => {
  const [animation, setAnimation] = useState<'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'none' | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <BaseButton onClick={() => setAnimation('fade')} size="small">Fade</BaseButton>
        <BaseButton onClick={() => setAnimation('slide-up')} size="small">Slide Up</BaseButton>
        <BaseButton onClick={() => setAnimation('slide-down')} size="small">Slide Down</BaseButton>
        <BaseButton onClick={() => setAnimation('zoom')} size="small">Zoom</BaseButton>
        <BaseButton onClick={() => setAnimation('none')} size="small">No Animation</BaseButton>
      </div>

      {['fade', 'slide-up', 'slide-down', 'zoom', 'none'].map((anim) => (
        <BaseModal
          key={anim}
          isOpen={animation === anim}
          onClose={() => setAnimation(null)}
          title={`${anim} Animation`}
          animation={anim as any}
          size="md"
        >
          <p>This modal uses the <strong>{anim}</strong> animation.</p>
          <p className="mt-2 text-sm text-gray-600">
            Different animations can enhance the user experience and match your design system.
          </p>
        </BaseModal>
      ))}
    </div>
  );
};

/**
 * Example 7: Custom Backdrop Modal
 */
export const CustomBackdropModalExample: React.FC = () => {
  const [config, setConfig] = useState<{ showBackdrop: boolean; opacity: number; closeOnClick: boolean } | null>(null);

  const openModal = (showBackdrop: boolean, opacity: number, closeOnClick: boolean) => {
    setConfig({ showBackdrop, opacity, closeOnClick });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <BaseButton onClick={() => openModal(true, 50, true)} size="small">
          Default Backdrop
        </BaseButton>
        <BaseButton onClick={() => openModal(true, 80, true)} size="small">
          Dark Backdrop
        </BaseButton>
        <BaseButton onClick={() => openModal(true, 20, true)} size="small">
          Light Backdrop
        </BaseButton>
        <BaseButton onClick={() => openModal(false, 0, false)} size="small">
          No Backdrop
        </BaseButton>
        <BaseButton onClick={() => openModal(true, 50, false)} size="small">
          No Click to Close
        </BaseButton>
      </div>

      {config && (
        <BaseModal
          isOpen={!!config}
          onClose={() => setConfig(null)}
          title="Custom Backdrop"
          size="md"
          showBackdrop={config.showBackdrop}
          backdropOpacity={config.opacity}
          closeOnBackdropClick={config.closeOnClick}
        >
          <div className="space-y-2">
            <p><strong>Backdrop:</strong> {config.showBackdrop ? 'Visible' : 'Hidden'}</p>
            <p><strong>Opacity:</strong> {config.opacity}%</p>
            <p><strong>Click to Close:</strong> {config.closeOnClick ? 'Enabled' : 'Disabled'}</p>
          </div>
        </BaseModal>
      )}
    </div>
  );
};

/**
 * Example 8: Real-World Certificate Details Modal
 */
export const CertificateDetailsModalExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <BaseCard
        title="G.A.C.P. Certificate"
        variant="outlined"
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">GACP-2024-001234</span>
            <BaseBadge variant="solid" color="success">Active</BaseBadge>
          </div>
          <p className="text-sm text-gray-600">Green Valley Botanicals</p>
          <p className="text-xs text-gray-500">Click to view details</p>
        </div>
      </BaseCard>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Certificate Details"
        size="lg"
        footer={
          <>
            <BaseButton variant="outlined" onClick={() => setIsOpen(false)}>
              Close
            </BaseButton>
            <BaseButton variant="contained">
              Download PDF
            </BaseButton>
          </>
        }
      >
        <div className="space-y-6">
          {/* Certificate Status */}
          <div className="flex items-center justify-between p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-success-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-success-900">Certificate Active</p>
                <p className="text-sm text-success-700">Valid until January 15, 2027</p>
              </div>
            </div>
            <BaseBadge variant="solid" color="success">Active</BaseBadge>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="font-semibold mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Certificate Number</p>
                <p className="font-medium">GACP-2024-001234</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Farm Name</p>
                <p className="font-medium">Green Valley Botanicals</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-medium">January 15, 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiry Date</p>
                <p className="font-medium">January 15, 2027</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">Chiang Mai, Thailand</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Farm Size</p>
                <p className="font-medium">15 hectares</p>
              </div>
            </div>
          </div>

          {/* Certified Crops */}
          <div>
            <h4 className="font-semibold mb-3">Certified Crops</h4>
            <div className="flex flex-wrap gap-2">
              <BaseBadge variant="soft" color="primary">Medicinal Herbs</BaseBadge>
              <BaseBadge variant="soft" color="primary">Organic Vegetables</BaseBadge>
              <BaseBadge variant="soft" color="primary">Traditional Medicine Plants</BaseBadge>
            </div>
          </div>

          {/* Recent Inspections */}
          <div>
            <h4 className="font-semibold mb-3">Recent Inspections</h4>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Annual Audit</span>
                  <BaseBadge variant="soft" color="success">Passed</BaseBadge>
                </div>
                <p className="text-sm text-gray-600">October 15, 2024</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">Surprise Inspection</span>
                  <BaseBadge variant="soft" color="success">Passed</BaseBadge>
                </div>
                <p className="text-sm text-gray-600">July 8, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  );
};

/**
 * Example 9: Nested Modals
 */
export const NestedModalsExample: React.FC = () => {
  const [isFirstOpen, setIsFirstOpen] = useState(false);
  const [isSecondOpen, setIsSecondOpen] = useState(false);

  return (
    <div>
      <BaseButton onClick={() => setIsFirstOpen(true)}>Open First Modal</BaseButton>

      <BaseModal
        isOpen={isFirstOpen}
        onClose={() => setIsFirstOpen(false)}
        title="First Modal"
        size="md"
        zIndex={1000}
      >
        <div className="space-y-4">
          <p>This is the first modal.</p>
          <BaseButton onClick={() => setIsSecondOpen(true)}>
            Open Second Modal
          </BaseButton>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isSecondOpen}
        onClose={() => setIsSecondOpen(false)}
        title="Second Modal"
        size="sm"
        zIndex={1100}
      >
        <p>This modal appears on top of the first modal.</p>
        <p className="mt-2 text-sm text-gray-600">
          Notice the higher z-index ensures proper stacking.
        </p>
      </BaseModal>
    </div>
  );
};

const examples = {
  BasicModalExample,
  ModalSizesExample,
  ModalWithFooterExample,
  ConfirmationModalExample,
  FormModalExample,
  AnimatedModalExample,
  CustomBackdropModalExample,
  CertificateDetailsModalExample,
  NestedModalsExample,
};

export default examples;
