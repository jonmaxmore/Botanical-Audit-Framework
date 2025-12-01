# BaseDialog Component

A highly flexible and accessible modal dialog component for displaying content that requires user interaction or attention.

## Table of Contents

- [Features](#features)
- [Installation & Import](#installation--import)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Dialog Sizes](#dialog-sizes)
- [Action Buttons](#action-buttons)
- [Close Behavior](#close-behavior)
- [Custom Footer](#custom-footer)
- [Focus Management](#focus-management)
- [Scroll Lock](#scroll-lock)
- [Examples](#examples)
  - [Simple Confirmation](#simple-confirmation)
  - [Delete Confirmation](#delete-confirmation)
  - [Alert Dialogs](#alert-dialogs)
  - [Form Dialog](#form-dialog)
  - [Information Dialog](#information-dialog)
  - [Approval Workflow](#approval-workflow)
  - [Fullscreen Dialog](#fullscreen-dialog)
  - [Custom Footer / Wizard](#custom-footer--wizard)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## Features

✨ **Key Features:**

1. **Multiple Sizes** - Small, medium, large, and fullscreen options
2. **Flexible Actions** - Configure action buttons with variants, colors, loading states, and disabled states
3. **Close Handlers** - Close via ESC key, backdrop click, or X button (all configurable)
4. **Custom Footer** - Use custom ReactNode footer or built-in action buttons
5. **Focus Trap** - Automatically manages focus, traps focus inside dialog, restores on close
6. **Scroll Lock** - Prevents body scroll when dialog is open (can be disabled)
7. **Loading States** - Built-in loading spinners for action buttons
8. **Accessibility** - Full ARIA support, keyboard navigation, semantic HTML
9. **Smooth Animations** - Fade-in backdrop and slide-in dialog transitions
10. **Customizable** - Custom classes, z-index, and content styling

---

## Installation & Import

```tsx
import BaseDialog from '@/components/shared/base/BaseDialog';
```

**Dependencies:**
- React 18+
- TypeScript (recommended)
- Tailwind CSS (for styling)

---

## Basic Usage

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Open Dialog
      </button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Dialog Title"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setOpen(false),
            variant: 'outlined',
          },
          {
            label: 'Confirm',
            onClick: () => {
              // Handle confirmation
              setOpen(false);
            },
            variant: 'contained',
            color: 'primary',
          },
        ]}
      >
        <p>This is the dialog content.</p>
      </BaseDialog>
    </>
  );
}
```

---

## Props API

### BaseDialogProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | **required** | Controls whether the dialog is visible |
| `onClose` | `() => void` | **required** | Callback function called when dialog should close |
| `title` | `ReactNode` | `undefined` | Dialog title displayed in header |
| `children` | `ReactNode` | **required** | Content to display inside the dialog |
| `size` | `DialogSize` | `'medium'` | Size of the dialog: `'small'` \| `'medium'` \| `'large'` \| `'fullscreen'` |
| `actions` | `DialogAction[]` | `undefined` | Array of action buttons to display in footer |
| `showCloseButton` | `boolean` | `true` | Whether to show the X close button in header |
| `closeOnBackdrop` | `boolean` | `true` | Whether clicking the backdrop closes the dialog |
| `closeOnEsc` | `boolean` | `true` | Whether pressing ESC key closes the dialog |
| `footer` | `ReactNode` | `undefined` | Custom footer content (overrides `actions`) |
| `disableScrollLock` | `boolean` | `false` | Whether to disable body scroll lock |
| `className` | `string` | `undefined` | Additional CSS classes for dialog container |
| `contentClassName` | `string` | `undefined` | Additional CSS classes for content area |
| `zIndex` | `number` | `1000` | Z-index for the dialog overlay |

### DialogSize Type

```tsx
type DialogSize = 'small' | 'medium' | 'large' | 'fullscreen';
```

**Size Dimensions:**
- `small`: `max-w-sm` (384px)
- `medium`: `max-w-lg` (512px) - **default**
- `large`: `max-w-2xl` (672px)
- `fullscreen`: `w-full h-full` (no margin or border radius)

### DialogAction Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | ✅ Yes | Text displayed on the button |
| `onClick` | `() => void` | ✅ Yes | Function called when button is clicked |
| `variant` | `'contained'` \| `'outlined'` \| `'text'` | No | Button visual style (default: `'contained'`) |
| `color` | `'primary'` \| `'secondary'` \| `'success'` \| `'error'` | No | Button color theme (default: `'primary'`) |
| `disabled` | `boolean` | No | Whether button is disabled (default: `false`) |
| `loading` | `boolean` | No | Whether to show loading spinner (default: `false`) |

---

## Dialog Sizes

### Small
**Use case:** Quick confirmations, simple alerts

```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  size="small"
  title="Quick Confirmation"
>
  <p>Are you sure?</p>
</BaseDialog>
```

### Medium (Default)
**Use case:** Standard dialogs, forms with 3-5 fields

```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  size="medium" // or omit (default)
  title="User Information"
>
  {/* Form content */}
</BaseDialog>
```

### Large
**Use case:** Detailed information, longer forms, data tables

```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  size="large"
  title="Inspection Report"
>
  {/* Detailed report content */}
</BaseDialog>
```

### Fullscreen
**Use case:** Document viewers, complex multi-step processes

```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  size="fullscreen"
  title="Document Viewer"
>
  {/* Full-screen document */}
</BaseDialog>
```

---

## Action Buttons

### Button Variants

**Contained (Default)** - Solid background, high emphasis
```tsx
{ label: 'Submit', onClick: handleSubmit, variant: 'contained' }
```

**Outlined** - Border only, medium emphasis
```tsx
{ label: 'Cancel', onClick: handleCancel, variant: 'outlined' }
```

**Text** - No border or background, low emphasis
```tsx
{ label: 'Skip', onClick: handleSkip, variant: 'text' }
```

### Button Colors

```tsx
const actions = [
  { label: 'Primary', onClick: handlePrimary, color: 'primary' },   // Blue
  { label: 'Secondary', onClick: handleSecondary, color: 'secondary' }, // Gray
  { label: 'Success', onClick: handleSuccess, color: 'success' },   // Green
  { label: 'Error', onClick: handleError, color: 'error' },         // Red
];
```

### Loading State

```tsx
const [loading, setLoading] = useState(false);

const actions = [
  {
    label: 'Save',
    onClick: async () => {
      setLoading(true);
      await saveData();
      setLoading(false);
    },
    loading: loading,
  },
];
```

**What happens when loading:**
- Button shows spinner animation
- Button becomes disabled (non-clickable)
- onClick handler will not fire

### Disabled State

```tsx
const [isValid, setIsValid] = useState(false);

const actions = [
  {
    label: 'Submit',
    onClick: handleSubmit,
    disabled: !isValid, // Button disabled when form invalid
  },
];
```

---

## Close Behavior

### Close Button (X)
```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  showCloseButton={true} // default: true
>
  Content
</BaseDialog>
```

**To hide close button:**
```tsx
showCloseButton={false}
```

### Backdrop Click
```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  closeOnBackdrop={true} // default: true
>
  Content
</BaseDialog>
```

**To prevent closing on backdrop click:**
```tsx
closeOnBackdrop={false}
```

**Use case:** During loading operations, unsaved changes

### ESC Key
```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  closeOnEsc={true} // default: true
>
  Content
</BaseDialog>
```

**To prevent closing on ESC:**
```tsx
closeOnEsc={false}
```

### Prevent All Closing (During Loading)
```tsx
const [loading, setLoading] = useState(false);

<BaseDialog
  open={open}
  onClose={handleClose}
  closeOnBackdrop={!loading}
  closeOnEsc={!loading}
  showCloseButton={!loading}
>
  {loading ? 'Processing...' : 'Content'}
</BaseDialog>
```

---

## Custom Footer

Override the default action buttons footer with custom content:

```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  title="Custom Footer Example"
  footer={
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>
      <div className="flex gap-2">
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  }
>
  Content for step {currentStep}
</BaseDialog>
```

**Note:** When `footer` prop is provided, the `actions` prop is ignored.

---

## Focus Management

BaseDialog automatically manages focus:

1. **On Open:**
   - Stores the currently focused element
   - Moves focus to the dialog container
   - Traps focus inside the dialog

2. **While Open:**
   - Tab key cycles through focusable elements inside dialog
   - Focus cannot escape the dialog

3. **On Close:**
   - Restores focus to the previously focused element
   - Removes event listeners

**No configuration needed** - focus management is automatic and follows accessibility best practices.

---

## Scroll Lock

By default, BaseDialog locks body scroll when open:

```tsx
// Default behavior - body scroll locked
<BaseDialog open={open} onClose={handleClose}>
  Content
</BaseDialog>
```

**To disable scroll lock:**
```tsx
<BaseDialog
  open={open}
  onClose={handleClose}
  disableScrollLock={true}
>
  Content
</BaseDialog>
```

**How it works:**
1. On open: Sets `document.body.style.overflow = 'hidden'`
2. On close: Restores original overflow value
3. Cleanup on unmount to prevent stuck scroll lock

---

## Examples

### Simple Confirmation

Basic yes/no confirmation dialog.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function SimpleConfirmationExample() {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    // Perform action
    console.log('Confirmed!');
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Show Confirmation
      </button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Action"
        size="small"
        actions={[
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
        ]}
      >
        <p className="text-gray-600">
          Are you sure you want to perform this action?
        </p>
      </BaseDialog>
    </>
  );
}
```

---

### Delete Confirmation

Destructive action with warning and loading state.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function DeleteConfirmationExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setLoading(false);
    setOpen(false);
    alert('Item deleted successfully');
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Delete Item
      </button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Confirmation"
        size="small"
        closeOnBackdrop={!loading}
        closeOnEsc={!loading}
        actions={[
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
            loading: loading,
          },
        ]}
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-medium text-red-900 mb-1">Warning</h4>
              <p className="text-sm text-red-700">
                This action cannot be undone. All associated data will be permanently deleted.
              </p>
            </div>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
```

---

### Alert Dialogs

Success, error, and warning alerts.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

type AlertType = 'success' | 'error' | 'warning' | null;

export function AlertDialogExample() {
  const [alertType, setAlertType] = useState<AlertType>(null);

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getAlertContent = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          title: 'Success',
          message: 'Your certificate has been approved and is ready for download.',
          action: { label: 'Download Certificate', color: 'success' as const },
        };
      case 'error':
        return {
          title: 'Error',
          message: 'Failed to upload document. Please check the file format and try again.',
          action: { label: 'Retry Upload', color: 'error' as const },
        };
      case 'warning':
        return {
          title: 'Incomplete Inspection',
          message: 'You have not completed all required fields in this inspection.',
          action: { label: 'Review Inspection', color: 'primary' as const },
        };
      default:
        return { title: '', message: '', action: { label: '', color: 'primary' as const } };
    }
  };

  const content = getAlertContent(alertType);

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => setAlertType('success')}>Success Alert</button>
        <button onClick={() => setAlertType('error')}>Error Alert</button>
        <button onClick={() => setAlertType('warning')}>Warning Alert</button>
      </div>

      <BaseDialog
        open={alertType !== null}
        onClose={() => setAlertType(null)}
        size="small"
        actions={[
          {
            label: 'Dismiss',
            onClick: () => setAlertType(null),
            variant: 'outlined',
          },
          {
            label: content.action.label,
            onClick: () => {
              console.log(`Action clicked: ${alertType}`);
              setAlertType(null);
            },
            variant: 'contained',
            color: content.action.color,
          },
        ]}
      >
        <div className="text-center">
          {getAlertIcon(alertType)}
          <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
          <p className="text-gray-600">{content.message}</p>
        </div>
      </BaseDialog>
    </>
  );
}
```

---

### Form Dialog

Form submission within a dialog with validation.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';
import BaseForm from '@/components/shared/base/BaseForm';
import BaseInput from '@/components/shared/base/BaseInput';

interface FarmerFormValues {
  name: string;
  farmName: string;
  location: string;
  phone: string;
}

export function FormDialogExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialValues: FarmerFormValues = {
    name: '',
    farmName: '',
    location: '',
    phone: '',
  };

  const validate = (values: FarmerFormValues) => {
    const errors: Partial<Record<keyof FarmerFormValues, string>> = {};

    if (!values.name) errors.name = 'Name is required';
    if (!values.farmName) errors.farmName = 'Farm name is required';
    if (!values.location) errors.location = 'Location is required';
    if (!values.phone) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(values.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }

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
    <>
      <button onClick={() => setOpen(true)}>
        Register New Farmer
      </button>

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
            <BaseInput
              name="name"
              label="Farmer Name"
              fullWidth
              required
            />

            <BaseInput
              name="farmName"
              label="Farm Name"
              fullWidth
              required
            />

            <BaseInput
              name="location"
              label="Location"
              fullWidth
              required
            />

            <BaseInput
              name="phone"
              label="Phone Number"
              type="tel"
              fullWidth
              required
              helperText="Enter 10-digit phone number"
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Farmer'}
              </button>
            </div>
          </div>
        </BaseForm>
      </BaseDialog>
    </>
  );
}
```

---

### Information Dialog

Display detailed read-only information.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function InformationDialogExample() {
  const [open, setOpen] = useState(false);

  const inspectionData = {
    id: 'INS-2024-001',
    farmer: 'John Doe',
    farm: 'Green Valley Farm',
    date: '2024-01-15',
    inspector: 'Jane Smith',
    score: 92,
    categories: [
      { name: 'Documentation', score: 95 },
      { name: 'Field Conditions', score: 90 },
      { name: 'Equipment', score: 88 },
      { name: 'Safety Procedures', score: 94 },
    ],
    recommendations: [
      'Update equipment maintenance log',
      'Review pesticide storage procedures',
      'Complete worker training documentation',
    ],
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        View Inspection Report
      </button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Inspection Report"
        size="large"
        actions={[
          {
            label: 'Download PDF',
            onClick: () => console.log('Download PDF'),
            variant: 'outlined',
            color: 'secondary',
          },
          {
            label: 'Close',
            onClick: () => setOpen(false),
            variant: 'contained',
          },
        ]}
      >
        <div className="space-y-6">
          {/* Inspection Details */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <div className="text-sm text-gray-500">Inspection ID</div>
              <div className="font-medium">{inspectionData.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-medium">{inspectionData.date}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Farmer</div>
              <div className="font-medium">{inspectionData.farmer}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Inspector</div>
              <div className="font-medium">{inspectionData.inspector}</div>
            </div>
          </div>

          {/* Overall Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Score</span>
              <span className="text-2xl font-bold text-green-600">
                {inspectionData.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${inspectionData.score}%` }}
              />
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="font-medium mb-3">Category Breakdown</h4>
            <div className="space-y-2">
              {inspectionData.categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-sm">{category.name}</span>
                  <span className="font-medium">{category.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-medium mb-3">Recommendations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {inspectionData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
```

---

### Approval Workflow

Multi-action dialog for approval/rejection workflow.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function ApprovalDialogExample() {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setApproving(false);
    setOpen(false);
    alert('Application approved!');
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setRejecting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRejecting(false);
    setOpen(false);
    alert(`Application rejected: ${comment}`);
  };

  const loading = approving || rejecting;

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Review Application
      </button>

      <BaseDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Review Certificate Application"
        size="medium"
        closeOnBackdrop={!loading}
        closeOnEsc={!loading}
        actions={[
          {
            label: 'Reject',
            onClick: handleReject,
            variant: 'outlined',
            color: 'error',
            disabled: approving,
            loading: rejecting,
          },
          {
            label: 'Approve',
            onClick: handleApprove,
            variant: 'contained',
            color: 'success',
            disabled: rejecting,
            loading: approving,
          },
        ]}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Application #APP-2024-001
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Farmer: John Doe</div>
              <div>Farm: Green Valley Farm</div>
              <div>Type: Organic Certification</div>
              <div>Submitted: 2024-01-15</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Comments {!comment.trim() && '(Required for rejection)'}
            </label>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add your review comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
```

---

### Fullscreen Dialog

Full-screen dialog for immersive content like document viewers.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function FullscreenDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        View Document Fullscreen
      </button>

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
        <div className="h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Document content would appear here</p>
          </div>
        </div>
      </BaseDialog>
    </>
  );
}
```

---

### Custom Footer / Wizard

Multi-step wizard with custom footer for step navigation.

```tsx
import React, { useState } from 'react';
import BaseDialog from '@/components/shared/base/BaseDialog';

export function CustomFooterDialogExample() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setOpen(false);
      setStep(1);
      alert('Wizard completed!');
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getStepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="font-medium mb-2">Step 1: Basic Information</h3>
            <p className="text-gray-600">Enter your basic information here.</p>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="font-medium mb-2">Step 2: Details</h3>
            <p className="text-gray-600">Provide additional details.</p>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="font-medium mb-2">Step 3: Review</h3>
            <p className="text-gray-600">Review your information before submitting.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>
        Start Wizard
      </button>

      <BaseDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setStep(1);
        }}
        title={`Setup Wizard - Step ${step} of ${totalSteps}`}
        size="medium"
        footer={
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full ${
                    index + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </button>
              <button onClick={handleNext}>
                {step === totalSteps ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        }
      >
        <div className="py-6">
          {getStepContent(step)}
        </div>
      </BaseDialog>
    </>
  );
}
```

---

## Advanced Usage

### Multiple Dialogs

Handle multiple dialogs with different states:

```tsx
function MultipleDialogsExample() {
  const [dialogState, setDialogState] = useState({
    confirm: false,
    details: false,
    delete: false,
  });

  return (
    <>
      <BaseDialog
        open={dialogState.confirm}
        onClose={() => setDialogState({ ...dialogState, confirm: false })}
        title="Confirm"
        zIndex={1000}
      >
        Confirm dialog content
      </BaseDialog>

      <BaseDialog
        open={dialogState.details}
        onClose={() => setDialogState({ ...dialogState, details: false })}
        title="Details"
        zIndex={1100} // Higher z-index for stacking
      >
        Details dialog content
      </BaseDialog>
    </>
  );
}
```

### Programmatic Control

Control dialog from external events:

```tsx
function ProgrammaticExample() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Open dialog after 3 seconds
    const timer = setTimeout(() => {
      setOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Listen to custom events
  useEffect(() => {
    const handleCustomEvent = () => setOpen(true);
    window.addEventListener('showDialog', handleCustomEvent);
    return () => window.removeEventListener('showDialog', handleCustomEvent);
  }, []);

  return (
    <BaseDialog open={open} onClose={() => setOpen(false)}>
      Dialog opened programmatically
    </BaseDialog>
  );
}
```

### Conditional Content

Render different content based on state:

```tsx
function ConditionalContentExample() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <BaseDialog
      open={open}
      onClose={() => setOpen(false)}
      title={mode === 'view' ? 'View Details' : 'Edit Details'}
      actions={
        mode === 'view'
          ? [
              {
                label: 'Edit',
                onClick: () => setMode('edit'),
                variant: 'contained',
              },
            ]
          : [
              {
                label: 'Cancel',
                onClick: () => setMode('view'),
                variant: 'outlined',
              },
              {
                label: 'Save',
                onClick: () => {
                  // Save logic
                  setMode('view');
                },
                variant: 'contained',
              },
            ]
      }
    >
      {mode === 'view' ? (
        <div>View mode content</div>
      ) : (
        <div>Edit mode content with form fields</div>
      )}
    </BaseDialog>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Use appropriate sizes**
   - Small for quick confirmations
   - Medium for standard forms (3-5 fields)
   - Large for detailed information or longer forms
   - Fullscreen for document viewers or complex processes

2. **Provide clear action labels**
   ```tsx
   // Good
   { label: 'Delete Farmer', onClick: handleDelete }
   
   // Avoid
   { label: 'OK', onClick: handleDelete }
   ```

3. **Use loading states for async operations**
   ```tsx
   {
     label: 'Save',
     onClick: handleSave,
     loading: isSaving, // Show spinner during API call
   }
   ```

4. **Prevent closing during critical operations**
   ```tsx
   <BaseDialog
     closeOnBackdrop={!loading}
     closeOnEsc={!loading}
     showCloseButton={!loading}
   >
   ```

5. **Use appropriate button colors**
   - `error` for destructive actions (delete, reject)
   - `success` for positive actions (approve, confirm)
   - `primary` for main actions (save, submit)
   - `secondary` for cancel/close

6. **Provide feedback after actions**
   ```tsx
   const handleSubmit = async () => {
     await saveData();
     setOpen(false);
     toast.success('Data saved successfully!'); // Or use alert/notification
   };
   ```

### ❌ DON'T

1. **Don't use dialogs for everything**
   - Avoid for simple messages (use toast/snackbar instead)
   - Don't nest dialogs within dialogs
   - Don't use fullscreen for small content

2. **Don't forget to handle loading states**
   ```tsx
   // Bad - no loading feedback
   const handleSave = async () => {
     await api.save();
     setOpen(false);
   };

   // Good - show loading state
   const handleSave = async () => {
     setLoading(true);
     await api.save();
     setLoading(false);
     setOpen(false);
   };
   ```

3. **Don't make dialogs too complex**
   - Split multi-step processes into wizards (use custom footer)
   - Break long forms into sections
   - Consider separate pages for very complex workflows

4. **Don't ignore accessibility**
   - Always provide meaningful titles
   - Ensure keyboard navigation works
   - Don't override focus management unless necessary

5. **Don't block all close methods without reason**
   ```tsx
   // Bad - user can't close even after error
   <BaseDialog
     closeOnBackdrop={false}
     closeOnEsc={false}
     showCloseButton={false}
   >

   // Good - allow closing except during loading
   <BaseDialog
     closeOnBackdrop={!loading}
     closeOnEsc={!loading}
     showCloseButton={!loading}
   >
   ```

---

## Accessibility

BaseDialog follows WAI-ARIA best practices:

### ARIA Attributes

- `role="dialog"` - Identifies the element as a dialog
- `aria-modal="true"` - Indicates the dialog is modal
- `aria-labelledby` - Links dialog to its title (when title provided)

### Keyboard Navigation

- **Tab** - Move focus between interactive elements inside dialog
- **Shift + Tab** - Move focus backwards
- **ESC** - Close dialog (configurable via `closeOnEsc`)
- **Enter** - Activate focused button/link

### Focus Management

1. **Focus Trap** - Focus stays within dialog, cannot tab outside
2. **Initial Focus** - Dialog container receives focus on open
3. **Focus Restoration** - Previous focus restored on close

### Screen Reader Support

- Dialog title announced when opened
- All interactive elements properly labeled
- Action buttons have clear labels
- Loading states announced (via spinner aria-label)

### Testing with Screen Readers

**NVDA / JAWS:**
```
Dialog opened → "Dialog, [Title]"
Tab through elements → Reads labels and roles
ESC or button → "Dialog closed", focus restored
```

**VoiceOver:**
```
Dialog opened → "[Title] dialog"
Navigate with VO+arrow keys
All content readable and interactive
```

---

## Performance

### Optimization Tips

1. **Lazy Load Dialog Content**
   ```tsx
   <BaseDialog open={open} onClose={handleClose}>
     {open && <ExpensiveComponent />}
   </BaseDialog>
   ```

2. **Memoize Action Handlers**
   ```tsx
   const actions = useMemo(() => [
     { label: 'Cancel', onClick: handleCancel },
     { label: 'Save', onClick: handleSave },
   ], [handleCancel, handleSave]);
   ```

3. **Avoid Re-renders**
   ```tsx
   // Wrap content in useMemo if expensive
   const content = useMemo(() => (
     <ExpensiveContent data={data} />
   ), [data]);
   ```

4. **Cleanup on Unmount**
   - BaseDialog automatically cleans up event listeners
   - Scroll lock restored
   - Focus restored

### Performance Metrics

- **First Paint:** < 16ms (60fps)
- **Interaction Ready:** < 100ms
- **Close Animation:** 200ms (smooth fade out)
- **Memory:** Minimal - no memory leaks with proper cleanup

---

## Troubleshooting

### Dialog not closing on ESC

**Problem:** ESC key doesn't close dialog

**Solutions:**
1. Check `closeOnEsc` prop (must be `true` or omitted)
2. Verify no other component is capturing ESC key
3. Check if dialog is in loading state blocking close

```tsx
// Ensure ESC is enabled
<BaseDialog closeOnEsc={true} {...props}>
```

### Focus not restoring after close

**Problem:** Focus not returning to trigger button

**Solutions:**
1. Ensure trigger element still exists in DOM
2. Check if trigger element is focusable
3. Verify no other focus management interfering

```tsx
// Ensure trigger is focusable
<button ref={triggerRef} onClick={() => setOpen(true)}>
  Open Dialog
</button>
```

### Body scroll not unlocking

**Problem:** Page remains unscrollable after dialog closes

**Solutions:**
1. Check for multiple dialogs open simultaneously
2. Verify component unmounts properly
3. Manually reset if needed:

```tsx
useEffect(() => {
  return () => {
    // Failsafe: reset on unmount
    document.body.style.overflow = '';
  };
}, []);
```

### Dialog content overflowing

**Problem:** Content too tall/wide for dialog

**Solutions:**
1. Use appropriate size (`large` or `fullscreen`)
2. Add scroll to content area:

```tsx
<BaseDialog contentClassName="max-h-[500px] overflow-y-auto" {...props}>
  {/* Long content */}
</BaseDialog>
```

3. Split into multiple steps with wizard pattern

### Actions not rendering

**Problem:** Action buttons don't appear

**Solutions:**
1. Verify `actions` array is not empty
2. Check if `footer` prop is overriding actions
3. Ensure actions have required `label` and `onClick`

```tsx
// ✅ Correct
const actions = [
  { label: 'OK', onClick: handleClose }, // Required: label, onClick
];

// ❌ Wrong
const actions = [
  { onClick: handleClose }, // Missing label
];
```

### TypeScript errors with actions

**Problem:** Type errors with action buttons

**Solution:** Use proper types:

```tsx
import { DialogAction } from '@/components/shared/base/BaseDialog';

const actions: DialogAction[] = [
  {
    label: 'Cancel',
    onClick: handleCancel,
    variant: 'outlined',
    color: 'secondary',
  },
];
```

### Z-index conflicts

**Problem:** Dialog appearing behind other elements

**Solutions:**
1. Increase `zIndex` prop
2. Check parent element z-index
3. Verify CSS isolation

```tsx
<BaseDialog zIndex={2000} {...props}>
  {/* Content */}
</BaseDialog>
```

---

## Related Components

- **BaseButton** - Used for trigger buttons and custom action buttons
- **BaseForm** - Use inside dialogs for form submission
- **BaseInput** - Form fields for dialog forms
- **BaseCard** - Wrapping container for dialog examples

---

## Migration from Other Dialog Components

### From Material-UI Dialog

```tsx
// Material-UI
<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSave}>Save</Button>
  </DialogActions>
</Dialog>

// BaseDialog
<BaseDialog
  open={open}
  onClose={handleClose}
  title="Title"
  actions={[
    { label: 'Cancel', onClick: handleClose, variant: 'outlined' },
    { label: 'Save', onClick: handleSave, variant: 'contained' },
  ]}
>
  Content
</BaseDialog>
```

### From Custom Modal

```tsx
// Custom Modal
<Modal isOpen={open} onClose={handleClose}>
  <div className="modal-header">Title</div>
  <div className="modal-body">Content</div>
  <div className="modal-footer">
    <button onClick={handleClose}>Close</button>
  </div>
</Modal>

// BaseDialog
<BaseDialog
  open={open}
  onClose={handleClose}
  title="Title"
  actions={[
    { label: 'Close', onClick: handleClose },
  ]}
>
  Content
</BaseDialog>
```

---

## Support

For issues, questions, or contributions:
- File issues in project repository
- Check examples folder for more use cases
- Review test file for behavior documentation

---

## Changelog

### Version 1.0.0 (2024-01)
- Initial release
- Multiple sizes (small, medium, large, fullscreen)
- Action buttons with variants and colors
- Close handlers (ESC, backdrop, X button)
- Focus management and scroll lock
- Loading states and disabled states
- Custom footer support
- Full accessibility support
- Comprehensive documentation and examples

---

**Last Updated:** January 2024  
**Component Version:** 1.0.0  
**React Version:** 18+  
**TypeScript:** Yes (Full support)
