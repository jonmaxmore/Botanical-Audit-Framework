# BaseCard Component

A versatile card component for displaying content in a structured container with header, content, and footer sections.

## Features

- 🎨 **3 Variants**: Default, Outlined, Elevated
- 📦 **Flexible Layout**: Header, Content, Footer sections
- 🎯 **Header Options**: Title, Subtitle, Icon, Actions
- 🔘 **Footer Actions**: Custom footer or action button array
- 🖱️ **Interactive**: Hover effects and click handlers
- 🎛️ **Padding Control**: None, Small, Medium, Large
- ⏳ **Loading State**: Full card overlay with spinner
- ♿ **Accessible**: ARIA attributes, keyboard navigation
- 📱 **Responsive**: Works on all screen sizes

## Installation

```bash
# No installation needed - part of base components
```

## Basic Usage

```tsx
import BaseCard from '@/components/shared/base/BaseCard';

// Simple card
<BaseCard>
  <p>Card content goes here</p>
</BaseCard>

// Card with header
<BaseCard title="User Profile" subtitle="View and edit your information">
  <div>Profile content</div>
</BaseCard>

// Card with actions
<BaseCard
  title="Confirm Action"
  actions={[
    { label: 'Cancel', onClick: handleCancel, variant: 'secondary' },
    { label: 'Confirm', onClick: handleConfirm, variant: 'primary' }
  ]}
>
  <p>Are you sure you want to proceed?</p>
</BaseCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Card content |
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Card style variant |
| `title` | `ReactNode` | - | Card header title |
| `subtitle` | `ReactNode` | - | Card header subtitle |
| `headerIcon` | `ReactNode` | - | Icon displayed before title |
| `headerActions` | `ReactNode` | - | Actions displayed in header (right side) |
| `footer` | `ReactNode` | - | Custom footer content |
| `actions` | `BaseCardAction[]` | - | Action buttons for footer |
| `hoverable` | `boolean` | `false` | Enable hover animation |
| `onClick` | `() => void` | - | Click handler (makes card interactive) |
| `padding` | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Content padding size |
| `loading` | `boolean` | `false` | Show loading overlay |
| `className` | `string` | - | Additional CSS classes |

### BaseCardAction Type

```typescript
interface BaseCardAction {
  label: string;           // Button label
  onClick: () => void;     // Click handler
  variant?: 'primary' | 'secondary' | 'text';  // Button style
  disabled?: boolean;      // Disable button
}
```

## Variants

### Default
White background with border. Standard card style.
```tsx
<BaseCard variant="default">Content</BaseCard>
```

### Outlined
Transparent background with bold border. Lighter appearance.
```tsx
<BaseCard variant="outlined">Content</BaseCard>
```

### Elevated
White background with shadow. Prominent appearance.
```tsx
<BaseCard variant="elevated">Content</BaseCard>
```

## Examples

### Dashboard Statistics Card
```tsx
<BaseCard
  title="Total Revenue"
  subtitle="Last 30 days"
  headerIcon={<ChartIcon />}
  variant="elevated"
  padding="large"
>
  <div className="text-4xl font-bold text-green-600">$45,231</div>
  <div className="text-sm text-gray-500 mt-2">↑ 12.5% from last month</div>
</BaseCard>
```

### User Profile Card
```tsx
<BaseCard
  title="John Doe"
  subtitle="john.doe@example.com"
  headerIcon={
    <img src="/avatar.jpg" alt="Avatar" className="w-10 h-10 rounded-full" />
  }
  headerActions={
    <button className="text-blue-600">Edit</button>
  }
  variant="outlined"
>
  <div className="space-y-2">
    <div><strong>Role:</strong> Administrator</div>
    <div><strong>Joined:</strong> January 2024</div>
  </div>
</BaseCard>
```

### Form Card with Actions
```tsx
<BaseCard
  title="Create New Project"
  subtitle="Enter project details"
  actions={[
    { 
      label: 'Cancel', 
      onClick: handleCancel, 
      variant: 'secondary' 
    },
    { 
      label: 'Create', 
      onClick: handleCreate, 
      variant: 'primary',
      disabled: !isValid 
    }
  ]}
>
  <form className="space-y-4">
    <input type="text" placeholder="Project name" className="w-full p-2 border rounded" />
    <textarea placeholder="Description" className="w-full p-2 border rounded" />
  </form>
</BaseCard>
```

### Interactive Hoverable Card
```tsx
<BaseCard
  title="View Details"
  hoverable
  onClick={() => navigate('/details')}
>
  <p>Click this card to view more information</p>
</BaseCard>
```

### Loading State
```tsx
<BaseCard
  title="Processing..."
  loading={isSubmitting}
  actions={[
    { label: 'Submit', onClick: handleSubmit, variant: 'primary' }
  ]}
>
  <form>
    {/* Form fields */}
  </form>
</BaseCard>
```

### Card with Custom Footer
```tsx
<BaseCard
  title="Upload Progress"
  footer={
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading files...</span>
        <span>75%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
      </div>
    </div>
  }
>
  <div>5 of 8 files uploaded</div>
</BaseCard>
```

## Padding Options

### None
No padding - use for custom layouts or full-width content.
```tsx
<BaseCard padding="none">
  <img src="/banner.jpg" className="w-full" />
</BaseCard>
```

### Small (16px)
Compact spacing for dense layouts.
```tsx
<BaseCard padding="small">Content</BaseCard>
```

### Medium (24px) - Default
Balanced spacing for most use cases.
```tsx
<BaseCard padding="medium">Content</BaseCard>
```

### Large (32px)
Generous spacing for prominent content.
```tsx
<BaseCard padding="large">Content</BaseCard>
```

## Layout Patterns

### Dashboard Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <BaseCard title="Users" variant="elevated">
    <div className="text-3xl font-bold">1,234</div>
  </BaseCard>
  <BaseCard title="Revenue" variant="elevated">
    <div className="text-3xl font-bold">$45K</div>
  </BaseCard>
  <BaseCard title="Orders" variant="elevated">
    <div className="text-3xl font-bold">856</div>
  </BaseCard>
  <BaseCard title="Growth" variant="elevated">
    <div className="text-3xl font-bold">+12%</div>
  </BaseCard>
</div>
```

### List with Cards
```tsx
<div className="space-y-4">
  {items.map(item => (
    <BaseCard
      key={item.id}
      title={item.title}
      subtitle={item.date}
      headerActions={
        <button onClick={() => handleEdit(item.id)}>Edit</button>
      }
      hoverable
      onClick={() => handleView(item.id)}
    >
      <p>{item.description}</p>
    </BaseCard>
  ))}
</div>
```

### Settings Panel
```tsx
<div className="space-y-6">
  <BaseCard title="Account Settings" variant="outlined">
    <div className="space-y-4">
      <label className="flex items-center">
        <input type="checkbox" />
        <span className="ml-2">Email notifications</span>
      </label>
      <label className="flex items-center">
        <input type="checkbox" />
        <span className="ml-2">SMS alerts</span>
      </label>
    </div>
  </BaseCard>

  <BaseCard
    title="Danger Zone"
    variant="outlined"
    actions={[
      { 
        label: 'Delete Account', 
        onClick: handleDelete, 
        variant: 'text' 
      }
    ]}
  >
    <p className="text-red-600">This action cannot be undone.</p>
  </BaseCard>
</div>
```

## Accessibility

BaseCard implements comprehensive accessibility features:

### Keyboard Navigation
- **Tab**: Focus on interactive cards
- **Enter/Space**: Activate card onClick handler
- **Tab**: Navigate through header actions and footer buttons

### ARIA Attributes
```tsx
// Interactive cards
<div 
  role="button" 
  tabIndex={0} 
  aria-label="Card title"
/>

// Loading state
<div aria-live="polite" aria-busy="true">
  Loading...
</div>
```

### Screen Reader Support
- Card structure is announced properly
- Headings use semantic HTML
- Buttons have clear labels
- Loading states are announced

### Focus Management
- Interactive cards receive focus outline
- Action buttons maintain focus order
- Loading state disables interactions

## Best Practices

### ✅ DO

```tsx
// Use appropriate variant
<BaseCard variant="elevated">  // For prominent cards
<BaseCard variant="outlined">  // For lighter appearance
<BaseCard variant="default">   // For standard cards

// Provide clear titles
<BaseCard title="User Settings" subtitle="Manage your preferences">

// Use actions for common operations
<BaseCard actions={[
  { label: 'Cancel', onClick: handleCancel, variant: 'secondary' },
  { label: 'Save', onClick: handleSave, variant: 'primary' }
]}>

// Show loading state during async operations
<BaseCard loading={isSaving}>

// Use padding appropriately
<BaseCard padding="none">     // For images/custom layouts
<BaseCard padding="large">    // For important content
```

### ❌ DON'T

```tsx
// Don't nest cards too deeply
<BaseCard>
  <BaseCard>  // ❌ Avoid this
    <BaseCard>  // ❌ Definitely avoid this
    </BaseCard>
  </BaseCard>
</BaseCard>

// Don't mix footer and actions
<BaseCard 
  footer={<div>Custom footer</div>}
  actions={[...]}  // ❌ Choose one or the other
>

// Don't make every card hoverable
<BaseCard hoverable>  // ❌ Only use when clickable
  <p>Static content</p>
</BaseCard>

// Don't use onClick without hoverable indicator
<BaseCard onClick={handleClick}>  // ❌ Missing visual feedback
  // Either add hoverable prop or use actions
</BaseCard>
```

## Common Patterns

### Modal/Dialog Replacement
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <BaseCard
    title="Confirm Action"
    subtitle="This action cannot be undone"
    actions={[
      { label: 'Cancel', onClick: onClose, variant: 'secondary' },
      { label: 'Confirm', onClick: onConfirm, variant: 'primary' }
    ]}
    className="max-w-md"
  >
    <p>Are you sure you want to delete this item?</p>
  </BaseCard>
</div>
```

### Empty State
```tsx
<BaseCard 
  title="No Items Found"
  variant="outlined"
  padding="large"
  className="text-center"
>
  <div className="py-8">
    <EmptyIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
    <p className="text-gray-600 mb-4">You don't have any items yet.</p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded">
      Create Your First Item
    </button>
  </div>
</BaseCard>
```

### Collapsible Card
```tsx
const [expanded, setExpanded] = useState(false);

<BaseCard
  title="Advanced Settings"
  headerActions={
    <button onClick={() => setExpanded(!expanded)}>
      {expanded ? 'Collapse' : 'Expand'}
    </button>
  }
>
  {expanded && (
    <div className="space-y-4">
      {/* Advanced settings content */}
    </div>
  )}
</BaseCard>
```

## Styling

BaseCard uses Tailwind CSS classes. Customize by:

### Using className
```tsx
<BaseCard className="border-blue-500 shadow-blue-100">
  Custom styled card
</BaseCard>
```

### Wrapper Approach
```tsx
<div className="max-w-md mx-auto">
  <BaseCard>
    Centered card with max width
  </BaseCard>
</div>
```

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BaseCard from './BaseCard';

test('renders card with title', () => {
  render(<BaseCard title="Test Title">Content</BaseCard>);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});

test('calls onClick when card is clicked', () => {
  const onClick = jest.fn();
  const { container } = render(
    <BaseCard onClick={onClick}>Content</BaseCard>
  );
  
  fireEvent.click(container.firstChild);
  expect(onClick).toHaveBeenCalled();
});

test('calls action onClick', () => {
  const onSave = jest.fn();
  const actions = [{ label: 'Save', onClick: onSave }];
  
  render(<BaseCard actions={actions}>Content</BaseCard>);
  
  fireEvent.click(screen.getByText('Save'));
  expect(onSave).toHaveBeenCalled();
});
```

## Migration from Material-UI

```tsx
// Material-UI
import { Card, CardHeader, CardContent, CardActions } from '@mui/material';

<Card>
  <CardHeader title="Title" subheader="Subtitle" />
  <CardContent>Content</CardContent>
  <CardActions>
    <Button>Cancel</Button>
    <Button>Save</Button>
  </CardActions>
</Card>

// BaseCard
import BaseCard from '@/components/shared/base/BaseCard';

<BaseCard
  title="Title"
  subtitle="Subtitle"
  actions={[
    { label: 'Cancel', onClick: handleCancel, variant: 'secondary' },
    { label: 'Save', onClick: handleSave, variant: 'primary' }
  ]}
>
  Content
</BaseCard>
```

## Performance Tips

1. **Memoize Expensive Content**: Use `React.memo` for card content that doesn't change often
2. **Lazy Load Images**: Use `loading="lazy"` for images in cards
3. **Virtualize Long Lists**: Use react-window for large card lists
4. **Avoid Inline Functions**: Define onClick handlers outside render

```tsx
// ❌ Bad
<BaseCard onClick={() => handleClick(id)}>

// ✅ Good
const handleCardClick = useCallback(() => {
  handleClick(id);
}, [id]);

<BaseCard onClick={handleCardClick}>
```

## Troubleshooting

### Card not clickable
Ensure you've added `onClick` prop or set `hoverable={true}`:
```tsx
<BaseCard onClick={handleClick}>  // or
<BaseCard hoverable onClick={handleClick}>
```

### Actions not showing
Check that you're not mixing `footer` and `actions` props:
```tsx
// ❌ Wrong
<BaseCard footer={<div>...</div>} actions={[...]}>

// ✅ Correct - choose one
<BaseCard footer={<div>...</div>}>  // or
<BaseCard actions={[...]}>
```

### Loading state not working
Verify `loading` prop is a boolean:
```tsx
<BaseCard loading={isLoading}>  // ✅
<BaseCard loading="true">       // ❌
```

### Styling not applied
Use `className` for custom styles:
```tsx
<BaseCard className="my-custom-class">
```

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Component**: BaseCard  
**Dependencies**: None (pure SVG icons)
