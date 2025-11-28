/**
 * BaseDialog Component - Usage Examples
 * 
 * Demonstrates various dialog configurations for GACP system:
 * - Confirmation dialogs (delete, approve, reject)
 * - Alert messages
 * - Form dialogs
 * - Information modals
 * - Loading states
 * - Custom content
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState } from 'react';
import BaseDialog, { DialogAction } from './BaseDialog';
import BaseButton from './BaseButton';
import BaseCard from './BaseCard';
import BaseInput from './BaseInput';
import BaseForm, { useFormContext } from './BaseForm';

// ============================================================================
// FormField Component
// ============================================================================

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  required?: boolean;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type = 'text', required, helperText }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();
  
  return (
    <BaseInput
      name={name}
      label={label}
      type={type}
      value={values[name] || ''}
      onChange={(e) => setFieldValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name, true)}
      error={touched[name] ? errors[name] : undefined}
      fullWidth
      required={required}
      helperText={helperText}
    />
  );
};

// ============================================================================
// Example 1: Simple Confirmation Dialog
// ============================================================================

export const SimpleConfirmationExample: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    alert('Confirmed!');
    setOpen(false);
  };

  const actions: DialogAction[] = [
    {
      label: 'Cancel',
      onClick: () => setOpen(false),
      variant: 'outlined',
      color: 'secondary',
    },
    {
      label: 'Confirm',
      onClick: handleConfirm,
      variant: 'contained',
      color: 'primary',
    },
  ];

  return (
    <BaseCard title="Simple Confirmation" subtitle="Basic confirmation dialog">
      <BaseButton onClick={() => setOpen(true)}>
        Open Confirmation Dialog
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Action"
        size="small"
        actions={actions}
      >
        <p className="text-gray-700">
          Are you sure you want to proceed with this action? This cannot be undone.
        </p>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 2: Delete Confirmation Dialog
// ============================================================================

export const DeleteConfirmationExample: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setOpen(false);
    alert('Farmer deleted successfully');
  };

  const actions: DialogAction[] = [
    {
      label: 'Cancel',
      onClick: () => setOpen(false),
      variant: 'outlined',
      disabled: loading,
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      variant: 'contained',
      color: 'error',
      loading,
    },
  ];

  return (
    <BaseCard title="Delete Confirmation" subtitle="Destructive action with loading state">
      <BaseButton onClick={() => setOpen(true)} color="error">
        Delete Farmer
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Farmer"
        size="small"
        actions={actions}
        closeOnBackdrop={!loading}
        closeOnEsc={!loading}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-red-900">Warning</p>
              <p className="text-sm text-red-700">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-gray-700">
            Are you sure you want to delete <strong>Somchai Prasert</strong>? 
            All associated data including inspection records and certificates will be permanently removed.
          </p>
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 3: Alert Dialog
// ============================================================================

export const AlertDialogExample: React.FC = () => {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  return (
    <BaseCard title="Alert Dialogs" subtitle="Success, error, and warning messages">
      <div className="flex gap-2">
        <BaseButton onClick={() => setOpenSuccess(true)} color="success">
          Show Success
        </BaseButton>
        <BaseButton onClick={() => setOpenError(true)} color="error">
          Show Error
        </BaseButton>
        <BaseButton onClick={() => setOpenWarning(true)} color="warning">
          Show Warning
        </BaseButton>
      </div>

      {/* Success Alert */}
      <BaseDialog
        open={openSuccess}
        onClose={() => setOpenSuccess(false)}
        title="Success"
        size="small"
        actions={[
          {
            label: 'OK',
            onClick: () => setOpenSuccess(false),
            variant: 'contained',
            color: 'success',
          },
        ]}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Certificate Approved</p>
            <p className="text-sm text-gray-600 mt-1">
              The GAP Advanced certificate for Somchai Prasert has been approved and is now active.
            </p>
          </div>
        </div>
      </BaseDialog>

      {/* Error Alert */}
      <BaseDialog
        open={openError}
        onClose={() => setOpenError(false)}
        title="Error"
        size="small"
        actions={[
          {
            label: 'Try Again',
            onClick: () => setOpenError(false),
            variant: 'contained',
            color: 'error',
          },
        ]}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Upload Failed</p>
            <p className="text-sm text-gray-600 mt-1">
              Failed to upload inspection documents. Please check your internet connection and try again.
            </p>
          </div>
        </div>
      </BaseDialog>

      {/* Warning Alert */}
      <BaseDialog
        open={openWarning}
        onClose={() => setOpenWarning(false)}
        title="Warning"
        size="small"
        actions={[
          {
            label: 'Dismiss',
            onClick: () => setOpenWarning(false),
            variant: 'outlined',
          },
          {
            label: 'Review',
            onClick: () => {
              setOpenWarning(false);
              alert('Redirecting to review page...');
            },
            variant: 'contained',
            color: 'primary',
          },
        ]}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Incomplete Inspection</p>
            <p className="text-sm text-gray-600 mt-1">
              3 required fields are missing from the inspection report. Please complete all fields before submitting.
            </p>
          </div>
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 4: Form Dialog
// ============================================================================

export const FormDialogExample: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  interface FarmerFormValues {
    name: string;
    farmName: string;
    location: string;
    phone: string;
  }

  const initialValues: FarmerFormValues = {
    name: '',
    farmName: '',
    location: '',
    phone: '',
  };

  const validate = (values: FarmerFormValues) => {
    const errors: any = {};
    if (!values.name) errors.name = 'Name is required';
    if (!values.farmName) errors.farmName = 'Farm name is required';
    if (!values.location) errors.location = 'Location is required';
    if (!values.phone) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(values.phone)) errors.phone = 'Phone must be 10 digits';
    return errors;
  };

  const handleSubmit = async (values: FarmerFormValues) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setOpen(false);
    alert(`Farmer registered: ${values.name}`);
  };

  return (
    <BaseCard title="Form Dialog" subtitle="Dialog with form inputs">
      <BaseButton onClick={() => setOpen(true)}>
        Register New Farmer
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Register New Farmer"
        size="medium"
        closeOnBackdrop={!loading}
        closeOnEsc={!loading}
      >
        <BaseForm
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <FormField
              name="name"
              label="Farmer Name"
              required
            />

            <FormField
              name="farmName"
              label="Farm Name"
              required
            />

            <FormField
              name="location"
              label="Location"
              required
            />

            <FormField
              name="phone"
              label="Phone Number"
              type="tel"
              required
              helperText="Enter 10-digit phone number"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <BaseButton
                variant="outlined"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </BaseButton>
              <BaseButton
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  'Register Farmer'
                )}
              </BaseButton>
            </div>
          </div>
        </BaseForm>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 5: Information Dialog
// ============================================================================

export const InformationDialogExample: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <BaseCard title="Information Dialog" subtitle="Display detailed information">
      <BaseButton onClick={() => setOpen(true)}>
        View Inspection Details
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Inspection Report #INS-2025-001"
        size="large"
        actions={[
          {
            label: 'Download PDF',
            onClick: () => alert('Downloading PDF...'),
            variant: 'outlined',
            color: 'secondary',
          },
          {
            label: 'Close',
            onClick: () => setOpen(false),
            variant: 'contained',
            color: 'primary',
          },
        ]}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Farmer</p>
              <p className="font-semibold text-gray-900">Somchai Prasert</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Farm</p>
              <p className="font-semibold text-gray-900">Green Valley Farm</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inspection Date</p>
              <p className="font-semibold text-gray-900">November 1, 2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Inspector</p>
              <p className="font-semibold text-gray-900">John Inspector</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Inspection Score</h4>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-green-600">95</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-600 h-4 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Excellent - Passed all requirements</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Categories</h4>
            <div className="space-y-2">
              {[
                { name: 'Water Management', score: 98 },
                { name: 'Soil Health', score: 95 },
                { name: 'Pest Control', score: 92 },
                { name: 'Record Keeping', score: 94 },
              ].map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{category.name}</span>
                  <span className="font-semibold text-gray-900">{category.score}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Continue current water conservation practices</li>
              <li>Consider implementing additional organic pest control methods</li>
              <li>Update record-keeping system to digital format</li>
            </ul>
          </div>
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 6: Approval Workflow Dialog
// ============================================================================

export const ApprovalDialogExample: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setAction('approve');
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setOpen(false);
    alert('Certificate approved!');
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setAction('reject');
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setOpen(false);
    alert('Certificate rejected');
  };

  const actions: DialogAction[] = [
    {
      label: 'Reject',
      onClick: handleReject,
      variant: 'outlined',
      color: 'error',
      disabled: loading,
      loading: action === 'reject' && loading,
    },
    {
      label: 'Approve',
      onClick: handleApprove,
      variant: 'contained',
      color: 'success',
      disabled: loading,
      loading: action === 'approve' && loading,
    },
  ];

  return (
    <BaseCard title="Approval Workflow" subtitle="Approve or reject certificate application">
      <BaseButton onClick={() => setOpen(true)} color="primary">
        Review Application
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Certificate Application Review"
        size="medium"
        actions={actions}
        closeOnBackdrop={!loading}
        closeOnEsc={!loading}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-900 mb-2">Application Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-blue-700">Applicant:</span> <span className="font-medium">Somchai Prasert</span></p>
              <p><span className="text-blue-700">Certificate Type:</span> <span className="font-medium">GAP Advanced</span></p>
              <p><span className="text-blue-700">Inspection Score:</span> <span className="font-medium">95/100</span></p>
              <p><span className="text-blue-700">Submitted:</span> <span className="font-medium">November 2, 2025</span></p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments {action === 'reject' && <span className="text-red-600">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={action === 'reject' ? 'Provide reason for rejection' : 'Optional comments'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {action === 'reject' && !comment.trim() && (
              <p className="text-sm text-red-600 mt-1">Reason is required for rejection</p>
            )}
          </div>
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 7: Fullscreen Dialog
// ============================================================================

export const FullscreenDialogExample: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <BaseCard title="Fullscreen Dialog" subtitle="Dialog that takes full screen">
      <BaseButton onClick={() => setOpen(true)}>
        Open Fullscreen
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Document Viewer"
        size="fullscreen"
        actions={[
          {
            label: 'Close',
            onClick: () => setOpen(false),
            variant: 'contained',
          },
        ]}
      >
        <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg text-gray-600">Document viewer placeholder</p>
            <p className="text-sm text-gray-500">Fullscreen mode for detailed content</p>
          </div>
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Example 8: Custom Footer Dialog
// ============================================================================

export const CustomFooterDialogExample: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  return (
    <BaseCard title="Custom Footer" subtitle="Dialog with custom footer content">
      <BaseButton onClick={() => setOpen(true)}>
        Start Wizard
      </BaseButton>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Setup Wizard - Step ${step} of 3`}
        size="medium"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              Step {step} of 3
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <BaseButton
                  variant="outlined"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </BaseButton>
              )}
              {step < 3 ? (
                <BaseButton
                  variant="contained"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </BaseButton>
              ) : (
                <BaseButton
                  variant="contained"
                  color="success"
                  onClick={() => {
                    alert('Wizard completed!');
                    setOpen(false);
                    setStep(1);
                  }}
                >
                  Finish
                </BaseButton>
              )}
            </div>
          </div>
        }
      >
        <div className="py-4">
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Farm Information</h3>
              <p className="text-gray-600">Enter your farm details and location information.</p>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Certification Type</h3>
              <p className="text-gray-600">Select the type of certification you want to apply for.</p>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Review & Submit</h3>
              <p className="text-gray-600">Review your information and submit your application.</p>
            </div>
          )}
        </div>
      </BaseDialog>
    </BaseCard>
  );
};

// ============================================================================
// Main Demo Component
// ============================================================================

export default function BaseDialogExamples() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BaseDialog Component Examples</h1>
          <p className="text-gray-600">Real-world dialog configurations for GACP system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleConfirmationExample />
          <DeleteConfirmationExample />
          <AlertDialogExample />
          <FormDialogExample />
          <InformationDialogExample />
          <ApprovalDialogExample />
          <FullscreenDialogExample />
          <CustomFooterDialogExample />
        </div>
      </div>
    </div>
  );
}
