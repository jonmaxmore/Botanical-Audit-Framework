# BaseActionModal Component Documentation

## Overview

`BaseActionModal` is a unified, reusable modal component for approval, review, inspection, and other decision-making workflows across the Botanical Audit Framework.

**Created:** November 4, 2025  
**Phase:** 5 - Frontend Refactoring (Week 1-2)  
**Consolidates:** ApprovalActionModal, ReviewActionModal, ReviewDialog  
**Lines Saved:** ~700 lines  
**Similarity:** 92% (from CODE_SIMILARITY_AUDIT_REPORT.md)

---

## Features

### Core Features
- ✅ **Configurable Decision Options** - Define approve/reject/send-back or custom options
- ✅ **Validation System** - Built-in comment length, required fields validation
- ✅ **Loading States** - Async submit with loading indicators
- ✅ **Error Handling** - Form-level and field-level error display
- ✅ **Type Safety** - Full TypeScript support with interfaces

### Optional Features
- 📊 **Feedback Score** - 1-5 slider for satisfaction rating
- ⭐ **Star Rating** - 5-star visual rating system
- 🧩 **Additional Fields** - Inject custom form fields as React components
- 🎨 **Color Coding** - Success/error/warning/info color schemes
- 🔒 **Conditional Requirements** - Require reason when rejecting

---

## Installation

```bash
# Already created at:
# apps/frontend/components/shared/base/BaseActionModal.tsx
# apps/frontend/components/shared/base/BaseActionModal.example.tsx
```

---

## Basic Usage

### 1. Simple Approval Modal

```tsx
import { ApprovalModal } from '@/components/shared/base/BaseActionModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data) => {
    await fetch('/api/applications/approve', {
      method: 'POST',
      body: JSON.stringify({ applicationId: 'APP-001', ...data })
    });
  };

  return (
    <ApprovalModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      title="อนุมัติใบสมัคร"
      itemId="APP-001"
      itemData={{
        identifier: "APP-001",
        name: "ใบสมัครเกษตรกร นายสมชาย ดีมาก"
      }}
    />
  );
}
```

**Decision Options (ApprovalModal):**
- ✅ อนุมัติ (Approve)
- ❌ ปฏิเสธ (Reject) - requires reason
- ↩️ ส่งกลับแก้ไข (Send Back) - requires reason

---

### 2. Review Modal with Rating

```tsx
import { ReviewModal } from '@/components/shared/base/BaseActionModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data) => {
    // data includes: decision, comments, rating, feedbackScore
    await fetch('/api/inspections/review', {
      method: 'POST',
      body: JSON.stringify({ inspectionId: 'INS-001', ...data })
    });
  };

  return (
    <ReviewModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      title="ตรวจสอบผลการตรวจเยี่ยม"
      itemId="INS-001"
      itemData={{
        identifier: "INS-001",
        name: "การตรวจเยี่ยมฟาร์ม สวนลำไย"
      }}
      showRating={true}
      showFeedbackScore={true}
    />
  );
}
```

**Decision Options (ReviewModal):**
- ✅ ผ่าน (Pass)
- ❌ ไม่ผ่าน (Fail) - requires reason
- ℹ️ ขอข้อมูลเพิ่มเติม (Request Info)

---

### 3. Custom Decision Options

```tsx
import BaseActionModal from '@/components/shared/base/BaseActionModal';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function MyComponent() {
  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      type="custom"
      title="ตรวจสอบเอกสาร"
      itemId="DOC-001"
      itemData={{ name: "ใบรับรอง GAP" }}
      decisionOptions={[
        { 
          value: 'approve', 
          label: 'อนุมัติเอกสาร', 
          icon: <CheckCircle />, 
          color: 'success' 
        },
        { 
          value: 'reject', 
          label: 'ปฏิเสธเอกสาร', 
          icon: <XCircle />, 
          color: 'error',
          requiresReason: true 
        },
        { 
          value: 'revise', 
          label: 'ขอแก้ไข', 
          icon: <AlertTriangle />, 
          color: 'warning',
          requiresReason: true 
        }
      ]}
    />
  );
}
```

---

### 4. With Additional Fields

```tsx
function MyComponent() {
  const AdditionalFields = ({ onChange, disabled, errors }) => (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium">เลือกผู้ตรวจสอบ *</label>
        <select
          onChange={(e) => onChange('inspectorId', e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">-- เลือก --</option>
          <option value="INS-001">นายสมชาย</option>
          <option value="INS-002">นางสมศรี</option>
        </select>
        {errors?.inspectorId && <p className="text-red-600">{errors.inspectorId}</p>}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">กำหนดวันนัดหมาย</label>
        <input
          type="date"
          onChange={(e) => onChange('scheduledDate', e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </>
  );

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      type="custom"
      title="มอบหมายผู้ตรวจสอบ"
      itemId="INS-002"
      itemData={{ name: "สวนมะม่วง" }}
      decisionOptions={[
        { value: 'assign', label: 'มอบหมาย', icon: '👤' }
      ]}
      additionalFields={<AdditionalFields />}
      requiredFields={['inspectorId']}
    />
  );
}
```

---

## Props Reference

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Modal visibility state |
| `onClose` | `() => void` | ✅ | Close handler |
| `onSubmit` | `(data: ActionFormData) => Promise<void>` | ✅ | Submit handler (async) |
| `type` | `'approval' \| 'review' \| 'inspection' \| 'custom'` | ✅ | Modal type |
| `title` | `string` | ✅ | Modal title |
| `itemId` | `string` | ✅ | Item/application/inspection ID |
| `itemData` | `{ name?: string; identifier?: string; [key: string]: any }` | ✅ | Display data |
| `decisionOptions` | `DecisionOption[]` | ✅ | Array of decision buttons |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `subtitle` | `string` | `undefined` | Optional subtitle below title |
| `defaultDecision` | `string` | First option | Pre-selected decision |
| `showFeedbackScore` | `boolean` | `false` | Show 1-5 satisfaction slider |
| `showRating` | `boolean` | `false` | Show 5-star rating |
| `additionalFields` | `ReactNode` | `undefined` | Custom form fields |
| `minCommentLength` | `number` | `10` | Minimum comment characters |
| `requiredFields` | `string[]` | `[]` | Required additional field keys |
| `className` | `string` | `''` | Custom CSS classes |
| `submitButtonText` | `string` | `'ยืนยัน'` | Submit button label |
| `cancelButtonText` | `string` | `'ยกเลิก'` | Cancel button label |

---

## DecisionOption Interface

```typescript
interface DecisionOption {
  value: string;                // e.g., 'approve', 'reject'
  label: string;                // e.g., 'อนุมัติ', 'ปฏิเสธ'
  icon: ReactNode;              // e.g., <CheckCircle />, '✅'
  color?: 'success' | 'error' | 'warning' | 'info';  // Color theme
  requiresReason?: boolean;     // Force comment when selected
  requiresAdditionalFields?: boolean;  // Future use
}
```

---

## ActionFormData Output

```typescript
interface ActionFormData {
  decision: string;         // Selected decision value
  comments: string;         // User comments (trimmed)
  feedbackScore?: number;   // 1-5 if showFeedbackScore=true
  rating?: number;          // 1-5 if showRating=true
  [key: string]: any;       // Additional fields data
}
```

**Example Output:**

```json
{
  "decision": "approve",
  "comments": "ข้อมูลครบถ้วน ตรวจสอบแล้วถูกต้อง",
  "rating": 5,
  "feedbackScore": 4,
  "inspectorId": "INS-001",
  "scheduledDate": "2025-12-01"
}
```

---

## Migration Guide

### From ApprovalActionModal

**BEFORE:**
```tsx
<ApprovalActionModal
  open={open}
  onClose={handleClose}
  applicationId={applicationId}
  applicationData={data}
  onApprove={handleApprove}
/>
```

**AFTER:**
```tsx
<ApprovalModal
  isOpen={open}
  onClose={handleClose}
  itemId={applicationId}
  itemData={data}
  onSubmit={handleSubmit}
  title="อนุมัติใบสมัคร"
/>
```

**Changes:**
- `open` → `isOpen`
- `onApprove` → `onSubmit` (receives all form data)
- `applicationId` → `itemId`
- `applicationData` → `itemData`
- Added `title` prop

---

### From ReviewActionModal

**BEFORE:**
```tsx
<ReviewActionModal
  open={open}
  onClose={handleClose}
  inspectionId={inspectionId}
  inspectionData={data}
  onReview={handleReview}
  showRating={true}
/>
```

**AFTER:**
```tsx
<ReviewModal
  isOpen={open}
  onClose={handleClose}
  itemId={inspectionId}
  itemData={data}
  onSubmit={handleSubmit}
  title="ตรวจสอบผลการตรวจเยี่ยม"
  showRating={true}
  showFeedbackScore={true}
/>
```

**Changes:**
- `open` → `isOpen`
- `onReview` → `onSubmit`
- `inspectionId` → `itemId`
- `inspectionData` → `itemData`
- Can add `showFeedbackScore`

---

### From ReviewDialog (Admin Portal)

**BEFORE:**
```tsx
<ReviewDialog
  open={open}
  onClose={handleClose}
  documentId={documentId}
  document={document}
  onReviewComplete={handleReview}
  reviewType="document"
/>
```

**AFTER:**
```tsx
<BaseActionModal
  isOpen={open}
  onClose={handleClose}
  itemId={documentId}
  itemData={document}
  onSubmit={handleSubmit}
  type="review"
  title="ตรวจสอบเอกสาร"
  decisionOptions={[
    { value: 'approve', label: 'อนุมัติ', icon: '✅', color: 'success' },
    { value: 'reject', label: 'ปฏิเสธ', icon: '❌', color: 'error', requiresReason: true }
  ]}
/>
```

---

## Validation Rules

### Built-in Validation

1. **Comments Required** - Always required
2. **Minimum Length** - Default 10 characters (configurable)
3. **Required Reason** - When `requiresReason: true` in decision option
4. **Additional Fields** - When specified in `requiredFields` prop

### Custom Validation Example

```tsx
const handleSubmit = async (data: ActionFormData) => {
  // Additional validation before API call
  if (data.decision === 'approve' && !data.inspectorId) {
    throw new Error('กรุณาเลือกผู้ตรวจสอบ');
  }
  
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

---

## Styling & Customization

### Color Themes

| Color | Use Case | Background | Border | Text |
|-------|----------|------------|--------|------|
| `success` | Approve, Pass | `bg-green-50` | `border-green-500` | `text-green-700` |
| `error` | Reject, Fail | `bg-red-50` | `border-red-500` | `text-red-700` |
| `warning` | Send Back, Revise | `bg-yellow-50` | `border-yellow-500` | `text-yellow-700` |
| `info` | Request Info | `bg-blue-50` | `border-blue-500` | `text-blue-700` |

### Custom Classes

```tsx
<BaseActionModal
  className="max-w-4xl"  // Wider modal
  // ... other props
/>
```

---

## Performance Considerations

- ✅ **Lazy Rendering** - Component only renders when `isOpen={true}`
- ✅ **Form Reset** - Auto-resets state on close
- ✅ **Async Submit** - Prevents double-submit with loading state
- ✅ **Error Recovery** - Keeps form data on submit error

---

## Accessibility

- ✅ **Keyboard Navigation** - Tab through form fields
- ✅ **ESC to Close** - Close modal with Escape key
- ✅ **Focus Management** - Auto-focus on open
- ✅ **Screen Reader** - Semantic HTML with labels
- ✅ **ARIA Labels** - Proper ARIA attributes

---

## Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApprovalModal } from '@/components/shared/base/BaseActionModal';

describe('BaseActionModal', () => {
  it('should submit approval with comments', async () => {
    const mockSubmit = jest.fn();
    
    render(
      <ApprovalModal
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={mockSubmit}
        title="Test Approval"
        itemId="TEST-001"
        itemData={{ name: "Test Item" }}
      />
    );

    // Select decision
    fireEvent.click(screen.getByText('อนุมัติ'));

    // Enter comments
    fireEvent.change(screen.getByPlaceholderText(/ความคิดเห็น/), {
      target: { value: 'Test comments with sufficient length' }
    });

    // Submit
    fireEvent.click(screen.getByText('ยืนยัน'));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        decision: 'approve',
        comments: 'Test comments with sufficient length'
      });
    });
  });
});
```

---

## FAQ

### Q: Can I use emoji icons instead of React components?
**A:** Yes! Just pass string emoji like `icon: '✅'`

### Q: How do I make a field conditionally required?
**A:** Use `requiresReason: true` in the decision option, or validate in `onSubmit`

### Q: Can I customize button colors?
**A:** Yes, use the `color` prop in `DecisionOption` (success/error/warning/info)

### Q: How do I access additional field data?
**A:** All additional fields are merged into the `ActionFormData` object passed to `onSubmit`

### Q: Can I have more than 3 decision options?
**A:** Yes, no limit! Pass as many as needed in `decisionOptions` array

---

---

# BaseUserForm Component Documentation

## Overview

`BaseUserForm` is a unified, reusable form component for creating and editing user profiles across all portals (admin, farmer, certificate).

**Created:** November 4, 2025  
**Phase:** 5 - Frontend Refactoring (Week 1-2)  
**Consolidates:** CreateUserForm (admin), EditUserForm (admin), UserProfileForm (farmer)  
**Lines Saved:** ~450 lines  
**Similarity:** 88% (from CODE_SIMILARITY_AUDIT_REPORT.md)

---

## Features

### Core Features
- ✅ **Thai Name Validation** - Optional regex validation for Thai characters (ก-ฮ)
- ✅ **Email Validation** - RFC-compliant email format checking
- ✅ **Phone Validation** - Thai phone format (0812345678)
- ✅ **Real-time Validation** - Field-level validation with visual feedback
- ✅ **Role Selection** - Configurable roles with permissions display
- ✅ **Password Management** - Create mode with strength indicator
- ✅ **Profile Image Upload** - Drag-drop with preview (max 2MB)
- ✅ **Type Safety** - Full TypeScript support

### Validation Features
- ✅ **Visual Feedback** - Green checkmark for valid, red border for errors
- ✅ **Touch-based Validation** - Only validate after user interaction
- ✅ **Password Strength** - Visual indicator (weak/medium/strong)
- ✅ **Confirm Password** - Auto-match validation

---

## Basic Usage

### 1. Create New User (Admin Portal)

```tsx
import { CreateUserForm } from '@/components/shared/base/BaseUserForm';

function AdminCreateUser() {
  const handleSubmit = async (data) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    window.location.href = '/admin/users';
  };

  return (
    <CreateUserForm
      onSubmit={handleSubmit}
      onCancel={() => window.history.back()}
      requireThaiName={true}
    />
  );
}
```

### 2. Edit User (Admin Portal)

```tsx
import { EditUserForm } from '@/components/shared/base/BaseUserForm';

function AdminEditUser({ userId }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUserData);
  }, [userId]);

  const handleSubmit = async (data) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <EditUserForm
      initialData={userData}
      userId={userId}
      onSubmit={handleSubmit}
    />
  );
}
```

### 3. User Profile (Farmer Portal)

```tsx
import { UserProfileForm } from '@/components/shared/base/BaseUserForm';

function FarmerProfile() {
  const [userData, setUserData] = useState({
    firstName: 'สมศรี',
    lastName: 'ใจดี',
    email: 'somsri@example.com',
    phone: '0898765432',
    profileImage: '/images/profile.jpg'
  });

  const handleSubmit = async (data) => {
    // Handle image upload if changed
    let imageUrl = userData.profileImage;
    
    if (data.profileImage instanceof File) {
      const formData = new FormData();
      formData.append('image', data.profileImage);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      imageUrl = (await uploadResponse.json()).url;
    }
    
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profileImage: imageUrl })
    });
  };

  return (
    <UserProfileForm
      initialData={userData}
      onSubmit={handleSubmit}
      showProfileImage={true}
    />
  );
}
```

---

## Props Reference

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'create' \| 'edit' \| 'profile'` | ✅ | Form mode |
| `onSubmit` | `(data: UserFormData) => Promise<void>` | ✅ | Submit handler (async) |
| `onCancel` | `() => void` | ❌ | Cancel button handler |
| `initialData` | `Partial<UserFormData>` | ❌ | Pre-fill data (edit/profile mode) |
| `userId` | `string` | ❌ | User ID for tracking |

### Configuration Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showRoleSelection` | `boolean` | `true` | Show role selection cards |
| `showPasswordFields` | `boolean` | `mode === 'create'` | Show password & confirm fields |
| `showDepartment` | `boolean` | `true` | Show department field |
| `showOrganization` | `boolean` | `true` | Show organization field |
| `showProfileImage` | `boolean` | `true` | Show image upload section |
| `showPermissions` | `boolean` | `false` | Show permissions on role cards |

### Validation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requirePassword` | `boolean` | `mode === 'create'` | Make password required |
| `minPasswordLength` | `number` | `8` | Minimum password length |
| `requireThaiName` | `boolean` | `false` | Force Thai characters only |

### Customization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `availableRoles` | `RoleOption[]` | DEFAULT_ROLES | Custom role options |
| `className` | `string` | `''` | Custom CSS classes |
| `submitButtonText` | `string` | `'สร้างผู้ใช้'` or `'บันทึกการแก้ไข'` | Submit button label |
| `cancelButtonText` | `string` | `'ยกเลิก'` | Cancel button label |
| `title` | `string` | `undefined` | Form title header |
| `onFieldChange` | `(field: string, value: any) => void` | `undefined` | Field change callback |

---

## Interfaces

### UserFormData

```typescript
interface UserFormData {
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Role & permissions
  role?: 'admin' | 'inspector' | 'farmer' | 'officer' | 'viewer';
  permissions?: string[];
  
  // Organization
  department?: string;
  organization?: string;
  
  // Authentication
  password?: string;
  confirmPassword?: string;
  
  // Profile
  profileImage?: string | File;
  
  // Additional
  [key: string]: any;
}
```

### RoleOption

```typescript
interface RoleOption {
  value: 'admin' | 'inspector' | 'farmer' | 'officer' | 'viewer';
  label: string;
  description?: string;
  permissions?: string[];
  icon?: ReactNode;
}
```

---

## Default Roles

| Role | Label | Permissions |
|------|-------|-------------|
| `admin` | ผู้ดูแลระบบ | `all` |
| `inspector` | ผู้ตรวจสอบ | `inspect`, `review`, `report` |
| `farmer` | เกษตรกร | `apply`, `view_own` |
| `officer` | เจ้าหน้าที่ | `manage_docs`, `issue_certs` |
| `viewer` | ผู้ดูข้อมูล | `view_all` |

---

## Validation Rules

### Built-in Validation

1. **First Name** - Required, optional Thai-only
2. **Last Name** - Required, optional Thai-only
3. **Email** - Required, valid email format
4. **Phone** - Required, Thai format (0812345678)
5. **Password** - Min length (default 8), required in create mode
6. **Confirm Password** - Must match password
7. **Department** - Required if `showDepartment={true}`
8. **Organization** - Required if `showOrganization={true}`

### Visual Feedback

- ✅ **Green checkmark** - Valid field
- 🔴 **Red border** - Error
- 🔵 **Blue ring** - Focused
- ⚪ **Gray** - Untouched

### Password Strength

- 🔴 **Weak** - < 8 characters
- 🟡 **Medium** - 8-11 characters
- 🟢 **Strong** - 12+ characters

---

## Custom Roles Example

```tsx
const customRoles = [
  {
    value: 'farmer',
    label: 'เกษตรกร',
    description: 'เกษตรกรผู้สมัคร',
    permissions: ['apply', 'view_own'],
    icon: <User className="w-5 h-5" />
  },
  {
    value: 'inspector',
    label: 'ผู้ตรวจสอบ',
    description: 'ตรวจสอบฟาร์ม',
    permissions: ['inspect', 'review'],
    icon: <Shield className="w-5 h-5" />
  }
];

<BaseUserForm
  mode="create"
  onSubmit={handleSubmit}
  availableRoles={customRoles}
  showPermissions={true}
/>
```

---

## Migration Guide

### From CreateUserForm (Admin Portal)

**BEFORE:**
```tsx
<CreateUserForm
  onSuccess={handleSuccess}
  onCancel={handleCancel}
  showRoles={true}
/>
```

**AFTER:**
```tsx
<CreateUserForm
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  showRoleSelection={true}
/>
```

**Changes:**
- `onSuccess` → `onSubmit` (now async with error handling)
- `showRoles` → `showRoleSelection`
- Built-in validation (no separate validation needed)
- Built-in loading states

---

### From EditUserForm (Admin Portal)

**BEFORE:**
```tsx
<EditUserForm
  userId={userId}
  userData={userData}
  onUpdate={handleUpdate}
  onCancel={handleCancel}
/>
```

**AFTER:**
```tsx
<EditUserForm
  userId={userId}
  initialData={userData}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**Changes:**
- `userData` → `initialData`
- `onUpdate` → `onSubmit`
- Auto-hides password fields in edit mode
- Better error handling

---

### From UserProfileForm (Farmer Portal)

**BEFORE:**
```tsx
<UserProfileForm
  user={currentUser}
  onSave={handleSave}
  showProfilePicture={true}
/>
```

**AFTER:**
```tsx
<UserProfileForm
  initialData={currentUser}
  onSubmit={handleSubmit}
  showProfileImage={true}
/>
```

**Changes:**
- `user` → `initialData`
- `onSave` → `onSubmit`
- `showProfilePicture` → `showProfileImage`
- Auto-hides role selection for profile mode
- Better image handling (max 2MB, preview)

---

## Field Change Callback

```tsx
const [emailAvailable, setEmailAvailable] = useState(null);

const handleFieldChange = async (field, value) => {
  if (field === 'email' && value.includes('@')) {
    const res = await fetch(`/api/check-email?email=${value}`);
    const { available } = await res.json();
    setEmailAvailable(available);
  }
};

<CreateUserForm
  onSubmit={handleSubmit}
  onFieldChange={handleFieldChange}
/>
```

---

## Accessibility

- ✅ **Keyboard Navigation** - Tab through all fields
- ✅ **Labels** - All inputs have associated labels
- ✅ **Error Messages** - Screen reader accessible
- ✅ **Visual Feedback** - Icons + color coding
- ✅ **Focus Management** - Clear focus indicators

---

## Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateUserForm } from '@/components/shared/base/BaseUserForm';

describe('BaseUserForm', () => {
  it('should validate Thai name', async () => {
    const mockSubmit = jest.fn();
    
    render(
      <CreateUserForm
        onSubmit={mockSubmit}
        requireThaiName={true}
      />
    );

    // Enter English name
    fireEvent.change(screen.getByLabelText(/ชื่อ/), {
      target: { value: 'John' }
    });
    
    fireEvent.blur(screen.getByLabelText(/ชื่อ/));

    // Should show error
    expect(screen.getByText(/กรอกชื่อเป็นภาษาไทย/)).toBeInTheDocument();
  });
  
  it('should validate email format', async () => {
    const mockSubmit = jest.fn();
    
    render(<CreateUserForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByLabelText(/อีเมล/), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.blur(screen.getByLabelText(/อีเมล/));

    expect(screen.getByText(/รูปแบบอีเมลไม่ถูกต้อง/)).toBeInTheDocument();
  });
});
```

---

## Related Components

- ✅ `BaseActionModal` - Action/approval modals
- 🚧 `BasePaymentModal` - Payment/receipt modals (upcoming)
- 🚧 `BaseConsentModal` - PDPA consent modals (upcoming)
- 🚧 `ThaiAddressForm` - Thai address forms (upcoming)

---

## Support

- **Documentation:** See `BaseUserForm.example.tsx` for more examples
- **Migration Help:** Check CODE_SIMILARITY_AUDIT_REPORT.md for original component details
- **Issues:** Report to Phase 5 refactoring team

---

**Last Updated:** November 4, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
