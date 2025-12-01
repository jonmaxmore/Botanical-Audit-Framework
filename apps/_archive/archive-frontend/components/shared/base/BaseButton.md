# BaseButton Component Documentation

## Overview

`BaseButton` is a highly reusable and customizable button component that provides consistent button styling and behavior across all portals in the Botanical Audit Framework system.

## Features

- ✅ **Multiple Variants**: Contained, Outlined, Text, and Gradient
- ✅ **Size Options**: Small, Medium, and Large
- ✅ **Color Themes**: Primary, Secondary, Success, Error, Warning, Info
- ✅ **Icon Support**: Start and end icons with proper sizing
- ✅ **Loading State**: Built-in loading spinner
- ✅ **Full Width**: Optional full-width button
- ✅ **Accessibility**: ARIA attributes and keyboard navigation
- ✅ **Type Safety**: Full TypeScript support

---

## Installation

The component is located in `apps/frontend/components/shared/base/BaseButton.tsx` and can be imported directly:

```tsx
import BaseButton from '@/components/shared/base/BaseButton';
```

---

## Basic Usage

### Simple Button

```tsx
<BaseButton>Click Me</BaseButton>
```

### With Variant

```tsx
<BaseButton variant="outlined">Outlined Button</BaseButton>
<BaseButton variant="text">Text Button</BaseButton>
<BaseButton variant="gradient">Gradient Button</BaseButton>
```

### With Color

```tsx
<BaseButton color="success">Success</BaseButton>
<BaseButton color="error">Error</BaseButton>
<BaseButton color="warning">Warning</BaseButton>
```

### With Size

```tsx
<BaseButton size="small">Small</BaseButton>
<BaseButton size="medium">Medium</BaseButton>
<BaseButton size="large">Large</BaseButton>
```

---

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Button content |
| `variant` | `'contained' \| 'outlined' \| 'text' \| 'gradient'` | `'contained'` | Visual variant of the button |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the button |
| `color` | `'primary' \| 'secondary' \| 'success' \| 'error' \| 'warning' \| 'info'` | `'primary'` | Color theme |
| `startIcon` | `ReactNode` | `undefined` | Icon to display at the start |
| `endIcon` | `ReactNode` | `undefined` | Icon to display at the end |
| `loading` | `boolean` | `false` | Show loading spinner and disable button |
| `fullWidth` | `boolean` | `false` | Make button full width |
| `disabled` | `boolean` | `false` | Disable the button |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `(event: MouseEvent) => void` | `undefined` | Click handler |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute |

### Inherited HTML Button Props

The component also accepts all standard HTML button attributes:
- `onFocus`
- `onBlur`
- `onMouseEnter`
- `onMouseLeave`
- `aria-label`
- etc.

---

## Examples

### With Icons

```tsx
const SaveIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

// Start Icon
<BaseButton startIcon={<SaveIcon />}>
  บันทึก
</BaseButton>

// End Icon
<BaseButton endIcon={<SaveIcon />}>
  บันทึก
</BaseButton>

// Both Icons
<BaseButton startIcon={<SaveIcon />} endIcon={<SaveIcon />}>
  บันทึก
</BaseButton>
```

### Loading State

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = () => {
  setLoading(true);
  // API call...
  setTimeout(() => setLoading(false), 2000);
};

<BaseButton loading={loading} onClick={handleSubmit}>
  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
</BaseButton>
```

### Form Actions

```tsx
<div className="flex justify-end gap-3">
  <BaseButton variant="outlined" onClick={onCancel}>
    ยกเลิก
  </BaseButton>
  <BaseButton color="success" type="submit">
    บันทึก
  </BaseButton>
</div>
```

### Confirmation Dialog

```tsx
<div className="flex gap-3">
  <BaseButton 
    variant="outlined" 
    color="error"
    onClick={onCancel}
  >
    ไม่ลบ
  </BaseButton>
  <BaseButton 
    color="error"
    onClick={onConfirm}
  >
    ยืนยันลบ
  </BaseButton>
</div>
```

### Navigation

```tsx
<BaseButton 
  variant="text"
  onClick={() => router.push('/home')}
>
  หน้าหลัก
</BaseButton>
```

### Full Width

```tsx
<BaseButton fullWidth color="success">
  ส่งข้อมูล
</BaseButton>
```

---

## Variants Guide

### 1. Contained (Default)

Solid background, best for primary actions.

```tsx
<BaseButton variant="contained" color="primary">
  Primary Action
</BaseButton>
```

**Use Cases:**
- Form submit buttons
- Primary CTAs
- Important actions

### 2. Outlined

Border with transparent background, best for secondary actions.

```tsx
<BaseButton variant="outlined" color="secondary">
  Secondary Action
</BaseButton>
```

**Use Cases:**
- Cancel buttons
- Secondary actions
- Alternative options

### 3. Text

No border or background, best for tertiary actions.

```tsx
<BaseButton variant="text">
  Tertiary Action
</BaseButton>
```

**Use Cases:**
- Navigation links
- Less important actions
- Space-constrained layouts

### 4. Gradient

Gradient background with shadow, best for premium/featured actions.

```tsx
<BaseButton variant="gradient" color="success">
  Featured Action
</BaseButton>
```

**Use Cases:**
- Premium features
- Highlight important actions
- Modern UI emphasis

---

## Color Guide

| Color | Hex | Use Case |
|-------|-----|----------|
| **Primary** | Blue (#2563eb) | Main actions, default buttons |
| **Secondary** | Gray (#4b5563) | Alternative actions |
| **Success** | Green (#16a34a) | Confirmations, approvals |
| **Error** | Red (#dc2626) | Delete, reject, cancel |
| **Warning** | Yellow (#ca8a04) | Cautions, important notices |
| **Info** | Cyan (#0891b2) | Informational actions |

---

## Accessibility

### ARIA Attributes

The component automatically sets:
- `aria-busy="true"` when loading
- `aria-disabled="true"` when disabled
- `aria-hidden="true"` on icons and spinner

### Keyboard Navigation

- ✅ **Tab**: Focus the button
- ✅ **Enter**: Activate button
- ✅ **Space**: Activate button

### Screen Readers

```tsx
<BaseButton aria-label="บันทึกข้อมูล">
  บันทึก
</BaseButton>
```

### Focus Indicators

All buttons have visible focus rings:
```
focus:outline-none focus:ring-2 focus:ring-offset-2
```

---

## Best Practices

### ✅ DO

```tsx
// Clear, descriptive labels
<BaseButton>บันทึกข้อมูล</BaseButton>

// Appropriate variants
<BaseButton variant="contained" color="success">Submit</BaseButton>
<BaseButton variant="outlined">Cancel</BaseButton>

// Loading states
<BaseButton loading={isSubmitting}>
  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
</BaseButton>

// Meaningful icons
<BaseButton startIcon={<SaveIcon />}>บันทึก</BaseButton>
```

### ❌ DON'T

```tsx
// Vague labels
<BaseButton>OK</BaseButton>

// Too many gradient buttons
<BaseButton variant="gradient">Button 1</BaseButton>
<BaseButton variant="gradient">Button 2</BaseButton>

// Mixing conflicting colors
<BaseButton color="error">Save</BaseButton>

// Too many buttons in one line
<div>
  <BaseButton>1</BaseButton>
  <BaseButton>2</BaseButton>
  <BaseButton>3</BaseButton>
  <BaseButton>4</BaseButton>
  <BaseButton>5</BaseButton>
</div>
```

---

## Common Patterns

### Form with Multiple Actions

```tsx
<form onSubmit={handleSubmit}>
  {/* Form fields... */}
  
  <div className="flex items-center justify-end gap-3 mt-6">
    <BaseButton 
      variant="outlined" 
      type="button"
      onClick={onCancel}
    >
      ยกเลิก
    </BaseButton>
    
    <BaseButton 
      variant="outlined"
      color="secondary"
      type="button"
      onClick={onSaveDraft}
    >
      บันทึกแบบร่าง
    </BaseButton>
    
    <BaseButton 
      color="success"
      type="submit"
      loading={isSubmitting}
    >
      บันทึก
    </BaseButton>
  </div>
</form>
```

### Confirmation Modal

```tsx
<div className="flex flex-col gap-4">
  <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?</p>
  
  <div className="flex justify-end gap-3">
    <BaseButton variant="outlined" onClick={onCancel}>
      ยกเลิก
    </BaseButton>
    <BaseButton color="error" onClick={onConfirm}>
      ลบข้อมูล
    </BaseButton>
  </div>
</div>
```

### Action Menu

```tsx
<div className="flex gap-2">
  <BaseButton variant="text" size="small">
    แก้ไข
  </BaseButton>
  <BaseButton variant="text" size="small" color="error">
    ลบ
  </BaseButton>
</div>
```

---

## Migration from Material-UI

If you're migrating from Material-UI `Button`:

```tsx
// Before (Material-UI)
import { Button } from '@mui/material';

<Button variant="contained" color="primary" size="medium">
  Click Me
</Button>

// After (BaseButton)
import BaseButton from '@/components/shared/base/BaseButton';

<BaseButton variant="contained" color="primary" size="medium">
  Click Me
</BaseButton>
```

**Key Differences:**
- No `component` prop (use regular links/router components)
- Icons use `startIcon`/`endIcon` instead of `startIcon`/`endIcon`
- `loading` prop instead of separate loading component
- Tailwind CSS classes instead of Material-UI styling

---

## Testing

See `BaseButton.test.tsx` for comprehensive test examples.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BaseButton from './BaseButton';

test('calls onClick when clicked', () => {
  const onClick = jest.fn();
  render(<BaseButton onClick={onClick}>Click Me</BaseButton>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('shows loading state', () => {
  render(<BaseButton loading>Loading</BaseButton>);
  
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
```

---

## Troubleshooting

### Button not clickable?

- Check if `disabled` or `loading` props are set
- Verify `onClick` handler is defined
- Ensure button is not covered by other elements (z-index)

### Styling issues?

- Make sure Tailwind CSS is properly configured
- Check if custom `className` conflicts with base styles
- Verify parent container doesn't override button styles

### Icons not showing?

- Ensure icon components are properly imported
- Check icon SVG has proper `viewBox` attribute
- Verify icons have `currentColor` for stroke/fill

---

## Support

For issues or questions:
- Check `BaseButton.example.tsx` for usage examples
- Review `BaseButton.test.tsx` for test patterns
- See `README.md` in `apps/frontend/components/shared/base/`

---

**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**Author:** Code Refactoring - Phase 5 Week 3-4
