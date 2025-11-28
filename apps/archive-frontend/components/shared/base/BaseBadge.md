# BaseBadge Component

A versatile badge component for status indicators, labels, tags, and notifications across all portals.

## Features

- ✅ **Multiple Variants**: Solid, Outlined, Soft styles
- ✅ **7 Color Themes**: Primary, Secondary, Success, Error, Warning, Info, Gray
- ✅ **3 Sizes**: Small, Medium, Large
- ✅ **Icon Support**: Start and end icons
- ✅ **Dot Indicator**: Animated pulse dot for status
- ✅ **Removable**: Optional close button
- ✅ **Clickable**: Interactive with hover effects
- ✅ **Shape Options**: Rounded or pill-shaped
- ✅ **Accessibility**: Full keyboard navigation and ARIA support
- ✅ **TypeScript**: Complete type safety

## Installation

```tsx
import BaseBadge from '@/components/shared/base/BaseBadge';
```

## Basic Usage

### Simple Badge

```tsx
<BaseBadge>Default Badge</BaseBadge>
```

### With Color

```tsx
<BaseBadge color="success">Success</BaseBadge>
<BaseBadge color="error">Error</BaseBadge>
<BaseBadge color="warning">Warning</BaseBadge>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | *required* | Badge content |
| `variant` | `'solid' \| 'outlined' \| 'soft'` | `'solid'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the badge |
| `color` | `BadgeColor` | `'primary'` | Color theme |
| `startIcon` | `ReactNode` | `undefined` | Icon before content |
| `endIcon` | `ReactNode` | `undefined` | Icon after content (hidden if removable) |
| `dot` | `boolean` | `false` | Show animated dot indicator |
| `removable` | `boolean` | `false` | Show close button |
| `onRemove` | `(event) => void` | `undefined` | Callback when removed |
| `pill` | `boolean` | `false` | Fully rounded pill shape |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onClick` | `(event) => void` | `undefined` | Click handler |
| `clickable` | `boolean` | `false` | Show hover effect |

### Type Definitions

```typescript
type BadgeVariant = 'solid' | 'outlined' | 'soft';
type BadgeSize = 'small' | 'medium' | 'large';
type BadgeColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'gray';
```

## Variants

### Solid (Default)

Bold, filled badges with white text:

```tsx
<BaseBadge variant="solid" color="primary">Primary</BaseBadge>
<BaseBadge variant="solid" color="success">Success</BaseBadge>
<BaseBadge variant="solid" color="error">Error</BaseBadge>
```

### Outlined

Border-only with transparent background:

```tsx
<BaseBadge variant="outlined" color="primary">Primary</BaseBadge>
<BaseBadge variant="outlined" color="success">Success</BaseBadge>
<BaseBadge variant="outlined" color="error">Error</BaseBadge>
```

### Soft

Light background with colored text:

```tsx
<BaseBadge variant="soft" color="primary">Primary</BaseBadge>
<BaseBadge variant="soft" color="success">Success</BaseBadge>
<BaseBadge variant="soft" color="error">Error</BaseBadge>
```

## Colors

All 7 color themes available for each variant:

```tsx
<BaseBadge color="primary">Primary</BaseBadge>
<BaseBadge color="secondary">Secondary</BaseBadge>
<BaseBadge color="success">Success</BaseBadge>
<BaseBadge color="error">Error</BaseBadge>
<BaseBadge color="warning">Warning</BaseBadge>
<BaseBadge color="info">Info</BaseBadge>
<BaseBadge color="gray">Gray</BaseBadge>
```

## Sizes

### Small

Compact badges for inline text:

```tsx
<BaseBadge size="small">Small</BaseBadge>
```

### Medium (Default)

Standard size for most use cases:

```tsx
<BaseBadge size="medium">Medium</BaseBadge>
```

### Large

Prominent badges for emphasis:

```tsx
<BaseBadge size="large">Large</BaseBadge>
```

## Icons

### Start Icon

Icon before the text:

```tsx
<BaseBadge startIcon={<span>✓</span>} color="success">
  Verified
</BaseBadge>

<BaseBadge startIcon={<span>⚠</span>} color="warning">
  Warning
</BaseBadge>
```

### End Icon

Icon after the text:

```tsx
<BaseBadge endIcon={<span>→</span>} color="primary">
  Continue
</BaseBadge>

<BaseBadge endIcon={<span>↓</span>} color="info">
  Download
</BaseBadge>
```

### Both Icons

```tsx
<BaseBadge 
  startIcon={<span>🌱</span>}
  endIcon={<span>✓</span>}
  color="success"
>
  Certified Farm
</BaseBadge>
```

## Dot Indicator

Animated pulse dot for status:

```tsx
<BaseBadge color="success" dot>Online</BaseBadge>
<BaseBadge color="error" dot>Offline</BaseBadge>
<BaseBadge color="warning" dot>Away</BaseBadge>
<BaseBadge color="gray" dot>Inactive</BaseBadge>
```

**Perfect for:**
- Connection status
- Real-time indicators
- Processing states
- Availability status

## Removable Badges

### Basic Removable

```tsx
<BaseBadge removable onRemove={(e) => console.log('Removed')}>
  Remove Me
</BaseBadge>
```

### Tag Management

```tsx
function TagManager() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind']);

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex gap-2">
      {tags.map((tag, i) => (
        <BaseBadge
          key={i}
          variant="soft"
          color="primary"
          removable
          onRemove={() => removeTag(i)}
        >
          {tag}
        </BaseBadge>
      ))}
    </div>
  );
}
```

**Note:** When `removable={true}`, the `endIcon` prop is ignored.

## Clickable Badges

### Interactive Filters

```tsx
function FilterBadges() {
  const [selected, setSelected] = useState('all');

  return (
    <>
      <BaseBadge
        color="primary"
        variant={selected === 'all' ? 'solid' : 'soft'}
        clickable
        onClick={() => setSelected('all')}
      >
        All
      </BaseBadge>
      
      <BaseBadge
        color="success"
        variant={selected === 'active' ? 'solid' : 'soft'}
        clickable
        onClick={() => setSelected('active')}
      >
        Active
      </BaseBadge>
    </>
  );
}
```

### Action Badges

```tsx
<BaseBadge
  color="primary"
  clickable
  onClick={() => viewDetails()}
  endIcon={<span>→</span>}
>
  View Details
</BaseBadge>
```

**Keyboard Support:**
- `Enter` or `Space` triggers onClick
- Automatically receives `tabIndex="0"`
- Has `role="button"` for screen readers

## Shape Options

### Rounded (Default)

Standard rounded corners:

```tsx
<BaseBadge>Rounded</BaseBadge>
```

### Pill

Fully rounded ends:

```tsx
<BaseBadge pill>Pill Shape</BaseBadge>
```

Perfect for:
- Status indicators
- User tags
- Category labels

## Real-World Examples

### Status Indicators

```tsx
// Certification Status
<BaseBadge color="success" startIcon={<span>✓</span>} pill>
  Certified
</BaseBadge>

<BaseBadge color="warning" dot pill>
  Pending Inspection
</BaseBadge>

<BaseBadge color="error" startIcon={<span>✕</span>} pill>
  Rejected
</BaseBadge>
```

### Farm Listing

```tsx
function FarmCard({ farm }) {
  return (
    <div className="card">
      <h3>{farm.name}</h3>
      <div className="flex gap-2 mt-2">
        {farm.certified && (
          <BaseBadge color="success" size="small">
            Certified
          </BaseBadge>
        )}
        {farm.premium && (
          <BaseBadge variant="soft" color="primary" size="small">
            Premium
          </BaseBadge>
        )}
        {farm.exportReady && (
          <BaseBadge variant="soft" color="info" size="small">
            Export
          </BaseBadge>
        )}
      </div>
    </div>
  );
}
```

### User Profile

```tsx
function UserProfile({ user }) {
  return (
    <div className="profile">
      <div className="flex items-center gap-2">
        <h3>{user.name}</h3>
        {user.online && (
          <BaseBadge color="success" dot size="small">
            Online
          </BaseBadge>
        )}
        {user.verified && (
          <BaseBadge color="info" size="small" startIcon={<span>✓</span>}>
            Verified
          </BaseBadge>
        )}
      </div>
    </div>
  );
}
```

### Notification Badge

```tsx
function NotificationBell({ count }) {
  return (
    <div className="relative">
      <button className="bell-icon">🔔</button>
      {count > 0 && (
        <div className="absolute -top-2 -right-2">
          <BaseBadge color="error" size="small" pill>
            {count > 99 ? '99+' : count}
          </BaseBadge>
        </div>
      )}
    </div>
  );
}
```

### Tag Cloud

```tsx
function TagCloud({ tags, onTagRemove }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <BaseBadge
          key={tag.id}
          variant="soft"
          color={tag.category === 'skill' ? 'primary' : 'secondary'}
          removable
          onRemove={() => onTagRemove(tag.id)}
        >
          {tag.name}
        </BaseBadge>
      ))}
    </div>
  );
}
```

### Table Row Status

```tsx
function FarmTable({ farms }) {
  return (
    <table>
      <tbody>
        {farms.map(farm => (
          <tr key={farm.id}>
            <td>{farm.name}</td>
            <td>
              {farm.status === 'certified' && (
                <BaseBadge color="success" size="small">Certified</BaseBadge>
              )}
              {farm.status === 'pending' && (
                <BaseBadge color="warning" size="small" dot>Pending</BaseBadge>
              )}
              {farm.status === 'rejected' && (
                <BaseBadge color="error" size="small">Rejected</BaseBadge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Accessibility

### ARIA Support

The component provides proper ARIA attributes:

```tsx
// Clickable badges
<BaseBadge onClick={() => {}}>
  {/* Automatically has role="button" */}
</BaseBadge>

// Removable badges
<BaseBadge removable>
  {/* Close button has aria-label="Remove" */}
</BaseBadge>
```

### Keyboard Navigation

**Clickable badges:**
- `Tab` to focus
- `Enter` or `Space` to activate
- `Shift+Tab` to navigate backward

**Removable badges:**
- `Tab` to focus close button
- `Enter` or `Space` to remove

### Screen Reader Support

- Icons have `aria-hidden="true"`
- Text content is announced
- Remove button has descriptive label
- Role="button" for clickable badges

### Best Practices

```tsx
// ✅ Good: Clear, descriptive text
<BaseBadge color="success">Certificate Valid</BaseBadge>

// ✅ Good: Icon supplements text
<BaseBadge color="warning" startIcon={<span>⚠</span>}>
  Requires Action
</BaseBadge>

// ❌ Avoid: Icon only, no text
<BaseBadge color="error">
  <span>✕</span>
</BaseBadge>

// ✅ Better: Add descriptive text
<BaseBadge color="error" startIcon={<span>✕</span>}>
  Failed
</BaseBadge>
```

## Styling & Customization

### Custom Classes

```tsx
<BaseBadge className="shadow-lg uppercase tracking-wide">
  Custom Style
</BaseBadge>
```

### Color Mapping

**Solid Variant:**
- Primary: Blue (`bg-blue-600`)
- Success: Green (`bg-green-600`)
- Error: Red (`bg-red-600`)
- Warning: Yellow (`bg-yellow-600`)
- Info: Cyan (`bg-cyan-600`)
- Secondary: Purple (`bg-purple-600`)
- Gray: Gray (`bg-gray-600`)

**Soft Variant:**
- Light background (`*-100`)
- Dark text (`*-800`)
- Subtle border (`*-200`)

**Outlined Variant:**
- Border only (`border-*-600`)
- Colored text (`text-*-700`)
- Transparent background

### Hover Effects

When `clickable` or `onClick` is provided:

```tsx
// Solid: Darkens on hover
<BaseBadge clickable color="primary">
  {/* hover:bg-blue-700 */}
</BaseBadge>

// Soft: Brightens on hover
<BaseBadge clickable variant="soft" color="primary">
  {/* hover:bg-blue-200 */}
</BaseBadge>
```

## Performance

### Optimization Tips

```tsx
// ✅ Good: Memoize icons
const CheckIcon = useMemo(() => <span>✓</span>, []);

<BaseBadge startIcon={CheckIcon}>Verified</BaseBadge>

// ✅ Good: Use callback refs
const handleRemove = useCallback((id) => {
  removeBadge(id);
}, []);

// ⚠️ Avoid: Creating new functions in render
<BaseBadge onRemove={() => handleRemove(item.id)}>
  {/* Creates new function each render */}
</BaseBadge>

// ✅ Better: Pass stable reference
<BaseBadge onRemove={handleRemove}>
  {/* Stable reference */}
</BaseBadge>
```

## Common Patterns

### Conditional Rendering

```tsx
{user.verified && (
  <BaseBadge color="success" size="small">Verified</BaseBadge>
)}

{errors.length > 0 && (
  <BaseBadge color="error" size="small">{errors.length}</BaseBadge>
)}
```

### Dynamic Colors

```tsx
function StatusBadge({ status }) {
  const colorMap = {
    active: 'success',
    pending: 'warning',
    inactive: 'gray',
  };

  return (
    <BaseBadge color={colorMap[status] || 'gray'}>
      {status}
    </BaseBadge>
  );
}
```

### Badge Group

```tsx
function BadgeGroup({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <BaseBadge
          key={item.id}
          color={item.color}
          variant="soft"
        >
          {item.label}
        </BaseBadge>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Badge Not Clickable

**Problem**: Badge doesn't respond to clicks

**Solution**: Add `onClick` or `clickable` prop

```tsx
// ❌ Not clickable
<BaseBadge>Click Me</BaseBadge>

// ✅ Clickable
<BaseBadge onClick={() => {}}>Click Me</BaseBadge>
// or
<BaseBadge clickable onClick={() => {}}>Click Me</BaseBadge>
```

### Remove Button Not Showing

**Problem**: Close button doesn't appear

**Solution**: Ensure both `removable` and `onRemove` are provided

```tsx
// ❌ Missing onRemove
<BaseBadge removable>Remove</BaseBadge>

// ✅ Complete
<BaseBadge removable onRemove={() => {}}>Remove</BaseBadge>
```

### End Icon Missing

**Problem**: endIcon doesn't show

**Solution**: Check if `removable` is true (it takes precedence)

```tsx
// ❌ endIcon hidden when removable
<BaseBadge removable endIcon={<span>→</span>}>
  Badge
</BaseBadge>

// ✅ Use startIcon instead
<BaseBadge removable startIcon={<span>→</span>}>
  Badge
</BaseBadge>
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import BaseBadge, {
  BaseBadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeColor,
} from './BaseBadge';

const props: BaseBadgeProps = {
  variant: 'soft',
  size: 'medium',
  color: 'success',
  removable: true,
  onRemove: () => {},
};
```

## Related Components

- **BaseButton**: For primary actions
- **BaseChip**: Similar but for input contexts
- **BaseTooltip**: For additional information
- **BaseAlert**: For notifications

## Version History

- **1.0.0** (November 4, 2025): Initial release
  - 3 variants (solid, outlined, soft)
  - 7 color themes
  - 3 sizes
  - Icon support
  - Dot indicator
  - Removable functionality
  - Clickable with keyboard support
  - Full accessibility

---

**Need help?** Check the [examples](./BaseBadge.example.tsx) or [tests](./BaseBadge.test.tsx) for more usage patterns.
