# 🎨 Shared Components Library

**Version:** 1.0.0  
**Phase:** 5 Week 1-2 Complete  
**Last Updated:** November 4, 2025

---

## 📦 Overview

This directory contains **production-ready base components** that consolidate duplicate code across all 3 portals (farmer, admin, certificate). All components are:

- ✅ Type-safe with TypeScript
- ✅ Fully tested with Jest
- ✅ Documented with examples
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ Responsive (mobile-first design)

---

## 🏗️ Directory Structure

```
shared/
├── base/                      # Base components
│   ├── BaseActionModal.tsx    # Decision workflows (600 lines)
│   ├── BaseUserForm.tsx       # User management (800 lines)
│   ├── BasePaymentModal.tsx   # Payments & receipts (900 lines)
│   ├── BaseConsentModal.tsx   # PDPA compliance (750 lines)
│   ├── BaseWizard.tsx         # Multi-step forms (700 lines)
│   ├── *.example.tsx          # Usage examples for each component
│   └── __tests__/             # Unit tests
├── forms/                     # Form components
│   ├── ThaiAddressForm.tsx    # Thai address cascade (550 lines)
│   ├── DocumentUploadForm.tsx # File uploads (500 lines)
│   └── __tests__/             # Unit tests
├── MIGRATION_GUIDE.md         # Detailed migration instructions
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Import Base Components

```tsx
// Base components
import BaseActionModal from '@/components/shared/base/BaseActionModal';
import BaseUserForm from '@/components/shared/base/BaseUserForm';
import BasePaymentModal from '@/components/shared/base/BasePaymentModal';
import BaseConsentModal from '@/components/shared/base/BaseConsentModal';
import BaseWizard from '@/components/shared/base/BaseWizard';

// Form components
import ThaiAddressForm from '@/components/shared/forms/ThaiAddressForm';
import DocumentUploadForm from '@/components/shared/forms/DocumentUploadForm';
```

### Use Helper Components (Recommended)

```tsx
// User forms
import { CreateUserForm, EditUserForm, UserProfileForm } from '@/components/shared/base/BaseUserForm';

// Payment modals
import { PaymentConfirmModal, ReceiptModal, PaymentStatusModal } from '@/components/shared/base/BasePaymentModal';

// Consent modals
import { DataConsentModal, TermsConsentModal, PrivacyConsentModal } from '@/components/shared/base/BaseConsentModal';

// Address forms
import { FarmAddressForm, UserAddressForm, CompanyAddressForm } from '@/components/shared/forms/ThaiAddressForm';

// Upload forms
import { ImageUploadForm, PDFUploadForm, SingleFileUploadForm } from '@/components/shared/forms/DocumentUploadForm';
```

---

## 📋 Components Reference

### 1. BaseActionModal

**Purpose:** Unified modal for approval, review, and inspection workflows

**Props:**
```tsx
interface BaseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActionFormData) => Promise<void>;
  type: 'approval' | 'review' | 'inspection' | 'custom';
  title: string;
  subtitle?: string;
  decisionOptions: DecisionOption[];
  defaultDecision?: string;
  itemId: string;
  itemData: Record<string, any>;
  showRating?: boolean;
  minCommentLength?: number;
}
```

**Example:**
```tsx
<BaseActionModal
  isOpen={true}
  onClose={handleClose}
  onSubmit={handleSubmit}
  type="review"
  title="Review Application"
  subtitle="APP-001"
  decisionOptions={[
    { value: 'approve', label: 'Approve', icon: <CheckCircle />, color: 'success' },
    { value: 'reject', label: 'Reject', icon: <XCircle />, color: 'error' }
  ]}
  itemId="app-123"
  itemData={{ name: 'John Doe' }}
  showRating={true}
  minCommentLength={10}
/>
```

**Lines Saved:** ~700 lines (replaces 3 components)

---

### 2. BaseUserForm

**Purpose:** User creation, editing, and profile management

**Helper Components:**
- `CreateUserForm` - Create new users
- `EditUserForm` - Edit existing users  
- `UserProfileForm` - View/edit profiles

**Example:**
```tsx
import { CreateUserForm } from '@/components/shared/base/BaseUserForm';

<CreateUserForm
  onSubmit={handleCreateUser}
  onCancel={handleCancel}
  availableRoles={['admin', 'reviewer', 'farmer']}
  requirePassword={true}
  showProfileImage={true}
/>
```

**Features:**
- Thai name validation
- Email & phone validation (Thai format: 0XX-XXX-XXXX)
- Role selection
- Profile image upload
- Password strength indicator

**Lines Saved:** ~450 lines

---

### 3. BasePaymentModal

**Purpose:** Payment confirmation, receipts, and status tracking

**Helper Components:**
- `PaymentConfirmModal` - Confirm payment
- `ReceiptModal` - Display receipt
- `PaymentStatusModal` - Show status

**Example:**
```tsx
import { PaymentConfirmModal } from '@/components/shared/base/BasePaymentModal';

<PaymentConfirmModal
  isOpen={true}
  onClose={handleClose}
  onConfirm={handlePayment}
  amount={1500}
  payerName="John Doe"
  description="GACP Certificate Fee"
  paymentMethod="promptpay"
  qrCodeData="00020101021..."
/>
```

**Features:**
- QR code payment (PromptPay)
- Receipt printing
- Thai Baht formatting
- Payment status tracking

**Lines Saved:** ~500 lines

---

### 4. BaseConsentModal

**Purpose:** PDPA consent, terms acceptance, privacy agreements

**Helper Components:**
- `DataConsentModal` - Data processing
- `TermsConsentModal` - Terms & conditions
- `PrivacyConsentModal` - Privacy policy

**Example:**
```tsx
import { DataConsentModal } from '@/components/shared/base/BaseConsentModal';

<DataConsentModal
  isOpen={true}
  onClose={handleClose}
  onAccept={handleAccept}
  userName="John Doe"
  consentVersion="2.0"
  requireSignature={true}
/>
```

**Features:**
- PDPA compliance
- Digital signature
- Document versioning
- Print/download consent form

**Lines Saved:** ~470 lines

---

### 5. ThaiAddressForm

**Purpose:** Thai address input with province/district/subdistrict cascade

**Helper Components:**
- `FarmAddressForm` - Farm addresses
- `UserAddressForm` - User addresses
- `CompanyAddressForm` - Company addresses

**Example:**
```tsx
import { FarmAddressForm } from '@/components/shared/forms/ThaiAddressForm';

<FarmAddressForm
  value={address}
  onChange={handleAddressChange}
  required={true}
  showGpsCoordinates={true}
  apiBaseUrl="/api/thailand"
/>
```

**Features:**
- Province → District → Subdistrict cascade
- Postal code auto-fill
- GPS coordinates
- Map integration ready

**Lines Saved:** ~550 lines

---

### 6. DocumentUploadForm

**Purpose:** File upload with drag-and-drop, validation, and preview

**Helper Components:**
- `ImageUploadForm` - Images only
- `PDFUploadForm` - PDFs only
- `SingleFileUploadForm` - Single file

**Example:**
```tsx
import { ImageUploadForm } from '@/components/shared/forms/DocumentUploadForm';

<ImageUploadForm
  value={files}
  onChange={handleFilesChange}
  maxFiles={5}
  maxSizeMB={10}
  required={true}
  showPreview={true}
/>
```

**Features:**
- Drag-and-drop
- File type validation
- Progress bar
- Image preview
- Download/delete files

**Lines Saved:** ~280 lines

---

### 7. BaseWizard

**Purpose:** Multi-step forms with navigation and validation

**Custom Hook:** `useWizardStep`

**Example:**
```tsx
import BaseWizard from '@/components/shared/base/BaseWizard';

<BaseWizard
  steps={[
    { id: 'step1', title: 'Farm Information', component: <FarmInfoStep /> },
    { id: 'step2', title: 'Documents', component: <DocumentsStep /> },
    { id: 'step3', title: 'Review', component: <ReviewStep /> }
  ]}
  onComplete={handleComplete}
  onSaveDraft={handleSaveDraft}
  enableAutoSave={true}
  showProgressBar={true}
/>
```

**Features:**
- Step navigation
- Progress tracking
- Validation per step
- Save draft
- Auto-save to localStorage

**Lines Saved:** ~1,200 lines

---

## 🧪 Testing

### Run Tests

```bash
# All tests
npm test

# Specific component
npm test BaseActionModal

# Coverage
npm test -- --coverage
```

### Test Files

Each component has comprehensive tests in `__tests__/`:
- ✅ Rendering
- ✅ User interactions
- ✅ Validation
- ✅ Submit flow
- ✅ Error handling
- ✅ Accessibility

---

## 📚 Documentation

### Example Files

Each base component has a `.example.tsx` file showing:
- Basic usage
- Advanced usage
- Migration examples
- Best practices

### Migration Guide

See `MIGRATION_GUIDE.md` for:
- Step-by-step migration instructions
- Before/after code comparisons
- Troubleshooting tips

### Audit Report

See `CODE_SIMILARITY_AUDIT_REPORT.md` for:
- Duplicate analysis
- Lines saved per component
- Phase 5 results

---

## 🎯 Code Quality

### TypeScript

All components are fully typed:
```tsx
import type { 
  ActionFormData, 
  DecisionOption 
} from '@/components/shared/base/BaseActionModal';
```

### ESLint

- 0 errors ✅
- 4 warnings (intentional in example files)

### Test Coverage

- Unit tests: 100% coverage goal
- Integration tests: Key workflows covered

---

## 🔄 Migration Status

**Phase 5 Week 1-2 Results:**

| Component | Status | Lines Saved |
|-----------|--------|-------------|
| BaseActionModal | ✅ Complete | ~700 |
| BaseUserForm | ✅ Complete | ~450 |
| BasePaymentModal | ✅ Complete | ~500 |
| BaseConsentModal | ✅ Complete | ~470 |
| ThaiAddressForm | ✅ Complete | ~550 |
| DocumentUploadForm | ✅ Complete | ~280 |
| BaseWizard | ✅ Complete | ~1,200 |
| **Total** | **7/7** | **4,150** |

**Migrated Components:**
- ✅ `ReviewDialog` (admin-portal) → `BaseActionModal`
- ❌ `ApprovalActionModal` (deleted - not in use)
- ❌ `ReviewActionModal` (deleted - not in use)

**Ready to Use:**
- ✅ 15 helper components exported
- ✅ All with TypeScript types
- ✅ All with usage examples

---

## 🛠️ Development

### Adding New Base Component

1. Create component in `base/` or `forms/`
2. Add TypeScript types
3. Create `.example.tsx` file
4. Write unit tests
5. Update this README
6. Update MIGRATION_GUIDE.md

### Component Guidelines

- **Single Responsibility:** Each component should do one thing well
- **Type Safety:** Export all interfaces and types
- **Accessibility:** Follow WCAG 2.1 AA standards
- **Responsive:** Mobile-first design
- **Documentation:** Include JSDoc comments

---

## 📞 Support

**Questions?** Check:

1. **Example Files:** `*.example.tsx` in each folder
2. **Tests:** `__tests__/*.test.tsx` for usage patterns
3. **Migration Guide:** `MIGRATION_GUIDE.md`
4. **Audit Report:** `CODE_SIMILARITY_AUDIT_REPORT.md`

---

## 📈 Project Impact

**Total Lines Saved:** 11,250 (Phase 1-5)
- Phase 1-4 (Backend): 7,100 lines
- Phase 5 (Frontend): 4,150 lines

**Benefits:**
- ✅ Consistent UI/UX across 3 portals
- ✅ Type-safe development
- ✅ Faster feature development
- ✅ Easier maintenance
- ✅ Better test coverage
- ✅ Improved accessibility

---

**Last Updated:** November 4, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
