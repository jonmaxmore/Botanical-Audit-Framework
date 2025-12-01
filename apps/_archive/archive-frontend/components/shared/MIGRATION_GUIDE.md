# 📖 Base Components Migration Guide

**Version:** 1.0.0  
**Date:** November 4, 2025  
**Phase:** 5 Week 1-2 Complete

---

## 🎯 Overview

This guide helps you migrate existing components to use the new base components library. All base components are production-ready, fully tested, and include TypeScript support.

**Benefits:**
- ✅ Consistent UI/UX across all portals
- ✅ Type-safe with TypeScript
- ✅ Centralized validation logic
- ✅ Reduced code duplication
- ✅ Easier maintenance

---

## 📦 Available Base Components

### 1. BaseActionModal
**Location:** `apps/frontend/components/shared/base/BaseActionModal.tsx`  
**Use Cases:** Approval workflows, review processes, inspection decisions

**Replaces:**
- `ApprovalActionModal` (farmer-portal) ✅ Deleted
- `ReviewActionModal` (farmer-portal) ✅ Deleted
- `ReviewDialog` (admin-portal) ✅ Migrated

---

### 2. BaseUserForm
**Location:** `apps/frontend/components/shared/base/BaseUserForm.tsx`  
**Use Cases:** User creation, editing, profile management

**Helper Components:**
- `CreateUserForm` - For creating new users
- `EditUserForm` - For editing existing users
- `UserProfileForm` - For viewing/editing user profiles

**Features:**
- Thai name validation
- Role selection
- Email & phone validation (Thai format)
- Profile image upload
- Password strength indicator

---

### 3. BasePaymentModal
**Location:** `apps/frontend/components/shared/base/BasePaymentModal.tsx`  
**Use Cases:** Payment confirmation, receipts, payment status

**Helper Components:**
- `PaymentConfirmModal` - Confirm payment before processing
- `ReceiptModal` - Display payment receipt
- `PaymentStatusModal` - Show payment status

**Features:**
- QR code payment (PromptPay)
- Receipt printing
- Payment status tracking
- Thai Baht formatting

---

### 4. BaseConsentModal
**Location:** `apps/frontend/components/shared/base/BaseConsentModal.tsx`  
**Use Cases:** PDPA consent, terms acceptance, privacy agreements

**Helper Components:**
- `DataConsentModal` - Data processing consent
- `TermsConsentModal` - Terms & conditions
- `PrivacyConsentModal` - Privacy policy

**Features:**
- PDPA compliance
- Digital signature
- Document versioning
- Print/download consent form

---

### 5. ThaiAddressForm
**Location:** `apps/frontend/components/shared/forms/ThaiAddressForm.tsx`  
**Use Cases:** Farm addresses, user addresses, company addresses

**Helper Components:**
- `FarmAddressForm` - Farm location
- `UserAddressForm` - User address
- `CompanyAddressForm` - Company address

**Features:**
- Province → District → Subdistrict cascade
- Postal code auto-fill
- GPS coordinates
- Map integration ready

---

### 6. DocumentUploadForm
**Location:** `apps/frontend/components/shared/forms/DocumentUploadForm.tsx`  
**Use Cases:** File uploads, document management

**Helper Components:**
- `ImageUploadForm` - Image-only uploads
- `PDFUploadForm` - PDF-only uploads
- `SingleFileUploadForm` - Single file upload

**Features:**
- Drag-and-drop
- File type validation
- Progress bar
- Image preview
- Download/delete files

---

### 7. BaseWizard
**Location:** `apps/frontend/components/shared/base/BaseWizard.tsx`  
**Use Cases:** Multi-step forms, application wizards, onboarding

**Features:**
- Step navigation
- Progress tracking
- Validation per step
- Save draft
- Auto-save to localStorage
- Custom `useWizardStep` hook

---

## 🔧 Migration Examples

### Example 1: Migrating ReviewDialog to BaseActionModal

**Before:**
```tsx
// apps/admin-portal/components/applications/ReviewDialog.tsx (250 lines)
import { Dialog, DialogTitle, DialogContent, ... } from '@mui/material';

export default function ReviewDialog({ open, onClose, onSubmit, application }) {
  const [decision, setDecision] = useState('approve');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(4);
  
  // ... 200+ lines of validation, state management, UI ...
  
  return (
    <Dialog open={open} onClose={onClose}>
      {/* Complex UI structure */}
    </Dialog>
  );
}
```

**After:**
```tsx
// apps/admin-portal/components/applications/ReviewDialog.tsx (95 lines)
import BaseActionModal from '../../../frontend/components/shared/base/BaseActionModal';
import type { ActionFormData, DecisionOption } from '../../../frontend/components/shared/base/BaseActionModal';

export default function ReviewDialog({ open, onClose, onSubmit, application }) {
  const handleSubmit = async (formData: ActionFormData) => {
    onSubmit({
      decision: formData.decision,
      comment: formData.comments,
      rating: formData.rating,
    });
  };

  const decisionOptions: DecisionOption[] = [
    { value: 'approve', label: 'อนุมัติ', icon: <CheckCircle />, color: 'success' },
    { value: 'reject', label: 'ปฏิเสธ', icon: <XCircle />, color: 'error' },
  ];

  return (
    <BaseActionModal
      isOpen={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      type="review"
      title="พิจารณาคำขอรับรอง"
      subtitle={`${application.applicationNumber} - ${application.farmerName}`}
      decisionOptions={decisionOptions}
      itemId={application.id}
      itemData={{ name: application.farmerName }}
      showRating={true}
      minCommentLength={10}
    />
  );
}
```

**Benefits:**
- ✅ Reduced from 250 → 95 lines (62% reduction)
- ✅ Type-safe with TypeScript
- ✅ Validation handled automatically
- ✅ Consistent UI with other modals

---

### Example 2: Using Helper Components

**CreateUserForm (Ready to Use):**
```tsx
import { CreateUserForm } from '@/components/shared/base/BaseUserForm';

function AdminUserManagement() {
  const handleCreateUser = async (userData) => {
    await api.createUser(userData);
  };

  return (
    <CreateUserForm
      onSubmit={handleCreateUser}
      onCancel={() => setModalOpen(false)}
      availableRoles={['admin', 'reviewer', 'farmer']}
      requirePassword={true}
    />
  );
}
```

**No Migration Needed!** Helper components are exported and ready to use.

---

### Example 3: ThaiAddressForm

**Before:**
```tsx
// Custom address form with manual province/district handling
function FarmAddressForm() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  // ... 200+ lines of cascade logic ...
}
```

**After:**
```tsx
import { FarmAddressForm } from '@/components/shared/forms/ThaiAddressForm';

function FarmRegistration() {
  const handleAddressChange = (address) => {
    setFarmData({ ...farmData, address });
  };

  return (
    <FarmAddressForm
      value={farmData.address}
      onChange={handleAddressChange}
      required={true}
      showGpsCoordinates={true}
    />
  );
}
```

---

## 🚀 Migration Steps

### Step 1: Identify Component to Migrate

Check `CODE_SIMILARITY_AUDIT_REPORT.md` for list of duplicate components.

### Step 2: Choose Base Component

Match your use case to one of the 7 base components above.

### Step 3: Install Dependencies (if needed)

```bash
cd apps/frontend
npm install lucide-react
```

### Step 4: Update Import

```tsx
// Old
import MyCustomModal from './MyCustomModal';

// New
import BaseActionModal from '@/components/shared/base/BaseActionModal';
```

### Step 5: Map Props

Create a wrapper component that maps your old props to base component props:

```tsx
export default function MyCustomModal(props) {
  return (
    <BaseActionModal
      isOpen={props.open}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
      // ... map other props
    />
  );
}
```

### Step 6: Test

```bash
npm run test -- MyCustomModal.test.tsx
```

### Step 7: Delete Old Component

Once tested and working:
```bash
git rm path/to/OldComponent.tsx
```

---

## 📝 Best Practices

### 1. Use Helper Components When Possible

Instead of using base components directly, use the helper components:

```tsx
// ✅ Good
import { CreateUserForm } from '@/components/shared/base/BaseUserForm';

// ❌ Avoid (unless you need full customization)
import BaseUserForm from '@/components/shared/base/BaseUserForm';
```

### 2. Type Safety

Always use TypeScript interfaces:

```tsx
import type { ActionFormData } from '@/components/shared/base/BaseActionModal';

const handleSubmit = async (data: ActionFormData) => {
  // TypeScript will validate data structure
};
```

### 3. Consistent Styling

Base components use Tailwind CSS. Keep styling consistent:

```tsx
// ✅ Good - Uses base component styles
<BaseActionModal {...props} />

// ❌ Avoid - Custom styling that breaks consistency
<BaseActionModal {...props} className="my-custom-class" />
```

### 4. Validation

Let base components handle validation:

```tsx
// ✅ Good
<BaseActionModal
  minCommentLength={10}
  requiredFields={['decision', 'comments']}
/>

// ❌ Avoid - Manual validation
const validate = () => {
  if (comment.length < 10) return false;
  // ...
};
```

---

## 🧪 Testing Migration

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import MyMigratedComponent from './MyMigratedComponent';

test('should render with base component', () => {
  render(<MyMigratedComponent />);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
```

### Integration Tests

```bash
npm run test:integration
```

### Manual Testing Checklist

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Validation works
- [ ] Submit flow works
- [ ] Loading states work
- [ ] Error handling works
- [ ] Accessibility (keyboard navigation, screen readers)

---

## 🐛 Troubleshooting

### Issue: Type Errors

**Problem:** TypeScript complains about prop types

**Solution:** Import types from base component:
```tsx
import type { ActionFormData } from '@/components/shared/base/BaseActionModal';
```

### Issue: Styling Differences

**Problem:** Component looks different after migration

**Solution:** Check Tailwind CSS configuration and ensure you're using the same design tokens.

### Issue: Validation Not Working

**Problem:** Form submits without validation

**Solution:** Set `minCommentLength` and `requiredFields` props:
```tsx
<BaseActionModal
  minCommentLength={10}
  requiredFields={['decision', 'comments']}
/>
```

---

## 📚 Additional Resources

- **Example Files:** Check `*.example.tsx` files in base component folders
- **Type Definitions:** See `*.d.ts` files for TypeScript interfaces
- **Tests:** Review `__tests__/*.test.tsx` for usage patterns
- **Storybook:** (Coming soon) Interactive component documentation

---

## 🎯 Migration Checklist

Use this checklist for each component migration:

- [ ] Identify duplicate component
- [ ] Choose appropriate base component
- [ ] Create wrapper component
- [ ] Map props correctly
- [ ] Add TypeScript types
- [ ] Write/update tests
- [ ] Test manually
- [ ] Update documentation
- [ ] Delete old component
- [ ] Commit changes
- [ ] Update audit report

---

## 📞 Need Help?

Questions about migration? Check:

1. **Example Files:** `*.example.tsx` in each component folder
2. **Tests:** `__tests__/*.test.tsx` for usage patterns
3. **Documentation:** This migration guide
4. **Audit Report:** `CODE_SIMILARITY_AUDIT_REPORT.md` for before/after comparisons

---

**Last Updated:** November 4, 2025  
**Version:** 1.0.0  
**Phase 5 Status:** Week 1-2 Complete ✅
