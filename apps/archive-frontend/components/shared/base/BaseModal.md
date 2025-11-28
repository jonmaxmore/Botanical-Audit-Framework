# BaseModal Component

A flexible and accessible modal/dialog component with focus trap, scroll locking, and portal rendering.

## Features

- **Multiple Sizes**: sm, md, lg, xl, full width options
- **Animations**: Fade, slide-up, slide-down, zoom, or none
- **Focus Trap**: Keeps keyboard navigation within modal
- **Scroll Locking**: Prevents body scroll when modal is open
- **Portal Rendering**: Renders at document.body for proper z-index
- **Backdrop Control**: Customizable backdrop with opacity
- **Keyboard Support**: Escape to close, Tab navigation
- **Full Accessibility**: ARIA attributes and focus management
- **Flexible Closing**: Backdrop click, Escape key, or manual control

## Installation

```tsx
import BaseModal from '@/components/shared/base/BaseModal';
```

## Basic Usage

```tsx
import { useState } from 'react';
import BaseModal from './BaseModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <p>This is the modal content.</p>
      </BaseModal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | **Required** | Whether the modal is open |
| `onClose` | `() => void` | **Required** | Callback when modal should close |
| `children` | `ReactNode` | **Required** | Modal body content |
| `title` | `ReactNode` | `undefined` | Modal title (optional) |
| `footer` | `ReactNode` | `undefined` | Footer content (typically buttons) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Size of the modal |
| `animation` | `'fade' \| 'slide-up' \| 'slide-down' \| 'zoom' \| 'none'` | `'fade'` | Animation type |
| `closeOnBackdropClick` | `boolean` | `true` | Close modal when clicking backdrop |
| `closeOnEscape` | `boolean` | `true` | Close modal when pressing Escape |
| `showCloseButton` | `boolean` | `true` | Show close button (X) in header |
| `showBackdrop` | `boolean` | `true` | Show backdrop overlay |
| `backdropOpacity` | `number` (0-100) | `50` | Backdrop opacity percentage |
| `lockScroll` | `boolean` | `true` | Lock body scroll when open |
| `centered` | `boolean` | `true` | Center modal vertically |
| `trapFocus` | `boolean` | `true` | Enable focus trap |
| `className` | `string` | `''` | Custom CSS for modal container |
| `contentClassName` | `string` | `''` | Custom CSS for modal content |
| `headerClassName` | `string` | `''` | Custom CSS for header |
| `bodyClassName` | `string` | `''` | Custom CSS for body |
| `footerClassName` | `string` | `''` | Custom CSS for footer |
| `zIndex` | `number` | `1000` | Z-index for modal |
| `onOpen` | `() => void` | `undefined` | Callback when modal finishes opening |
| `onClosed` | `() => void` | `undefined` | Callback when modal finishes closing |

## Sizes

```tsx
// Small modal
<BaseModal isOpen={isOpen} onClose={onClose} size="sm">
  <p>Small content</p>
</BaseModal>

// Medium modal (default)
<BaseModal isOpen={isOpen} onClose={onClose} size="md">
  <p>Medium content</p>
</BaseModal>

// Large modal
<BaseModal isOpen={isOpen} onClose={onClose} size="lg">
  <p>Large content</p>
</BaseModal>

// Extra large modal
<BaseModal isOpen={isOpen} onClose={onClose} size="xl">
  <p>Extra large content</p>
</BaseModal>

// Full width modal
<BaseModal isOpen={isOpen} onClose={onClose} size="full">
  <p>Full width content</p>
</BaseModal>
```

## With Footer

Add action buttons in the footer:

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  footer={
    <>
      <button onClick={onClose}>Cancel</button>
      <button onClick={handleConfirm}>Confirm</button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</BaseModal>
```

## Animations

Control how the modal appears and disappears:

```tsx
// Fade (default)
<BaseModal animation="fade" {...props} />

// Slide up from bottom
<BaseModal animation="slide-up" {...props} />

// Slide down from top
<BaseModal animation="slide-down" {...props} />

// Zoom in/out
<BaseModal animation="zoom" {...props} />

// No animation
<BaseModal animation="none" {...props} />
```

## Backdrop Customization

```tsx
// Dark backdrop (80% opacity)
<BaseModal backdropOpacity={80} {...props} />

// Light backdrop (20% opacity)
<BaseModal backdropOpacity={20} {...props} />

// No backdrop
<BaseModal showBackdrop={false} {...props} />

// Prevent closing on backdrop click
<BaseModal closeOnBackdropClick={false} {...props} />
```

## Confirmation Dialog

```tsx
function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    // Perform delete action
    setIsOpen(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Deletion"
      size="sm"
      closeOnBackdropClick={false}
      footer={
        <>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={handleDelete} className="danger">Delete</button>
        </>
      }
    >
      <div className="warning">
        <p>Are you sure you want to delete this item?</p>
        <p>This action cannot be undone.</p>
      </div>
    </BaseModal>
  );
}
```

## Form Modal

```tsx
function AddItemModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    setIsOpen(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Add New Item"
      size="md"
      footer={
        <>
          <button type="button" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" form="item-form">
            Add Item
          </button>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </form>
    </BaseModal>
  );
}
```

## Nested Modals

For modals that open other modals, use different z-index values:

```tsx
function NestedModals() {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <>
      <BaseModal
        isOpen={firstOpen}
        onClose={() => setFirstOpen(false)}
        title="First Modal"
        zIndex={1000}
      >
        <button onClick={() => setSecondOpen(true)}>
          Open Second Modal
        </button>
      </BaseModal>

      <BaseModal
        isOpen={secondOpen}
        onClose={() => setSecondOpen(false)}
        title="Second Modal"
        zIndex={1100}
      >
        <p>This modal appears on top of the first one.</p>
      </BaseModal>
    </>
  );
}
```

## Focus Management

The modal automatically:
- Focuses the first focusable element when opened
- Traps focus within the modal (Tab/Shift+Tab cycles through elements)
- Restores focus to the previously focused element when closed

To disable focus trap:

```tsx
<BaseModal trapFocus={false} {...props} />
```

## Scroll Locking

Body scroll is automatically locked when the modal is open and restored when closed.

To disable:

```tsx
<BaseModal lockScroll={false} {...props} />
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| **Escape** | Close modal (if closeOnEscape is true) |
| **Tab** | Move focus to next element (trapped within modal) |
| **Shift + Tab** | Move focus to previous element (trapped within modal) |

## Accessibility

The BaseModal component follows WAI-ARIA dialog pattern:

- **ARIA Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Focus Management**: Automatic focus trap and restoration
- **Keyboard Support**: Escape to close, Tab navigation
- **Screen Readers**: Announces modal state and content
- **Backdrop**: Marked with `aria-hidden="true"`

### Best Practices

1. **Always provide a title** for screen readers (can be visually hidden)
2. **Include descriptive labels** on action buttons
3. **Use semantic HTML** in modal content
4. **Provide clear close mechanisms** (X button, Cancel button, Escape key)
5. **Avoid nested modals** when possible (consider alternative UX)
6. **Test with keyboard only** to ensure full accessibility

## Styling

The component uses Tailwind CSS classes. You can customize appearance with:

```tsx
<BaseModal
  className="shadow-2xl"
  headerClassName="bg-primary-50"
  bodyClassName="min-h-[200px]"
  footerClassName="bg-gray-100"
  {...props}
/>
```

## Performance Tips

- **Conditional Rendering**: Modal only renders when `isOpen` is true
- **Portal Rendering**: Uses React Portal for optimal DOM placement
- **Scroll Locking**: Efficiently manages body scroll state
- **Focus Trap**: Uses refs for direct DOM manipulation
- **Animation**: Can be disabled with `animation="none"` for better performance

## Common Patterns

### Success/Error Messages

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="sm"
  centered
>
  <div className="text-center">
    <div className="success-icon">✓</div>
    <h3>Success!</h3>
    <p>Your changes have been saved.</p>
  </div>
</BaseModal>
```

### Loading State

```tsx
<BaseModal
  isOpen={isLoading}
  onClose={() => {}}
  showCloseButton={false}
  closeOnBackdropClick={false}
  closeOnEscape={false}
  size="sm"
>
  <div className="text-center">
    <div className="spinner" />
    <p>Processing...</p>
  </div>
</BaseModal>
```

### Image Gallery

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  size="full"
  showBackdrop={true}
  backdropOpacity={90}
>
  <img src={selectedImage} alt="Gallery" className="max-h-screen" />
</BaseModal>
```

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Version History

- **1.0.0**: Initial release with sizes, animations, focus trap, and accessibility
