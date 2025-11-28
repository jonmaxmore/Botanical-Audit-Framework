# BaseTooltip Component

A production-ready, accessible tooltip component with intelligent positioning, multiple trigger modes, and extensive customization options.

## Features

- ✅ **Smart Positioning**: Auto-adjusts when tooltip would overflow viewport
- ✅ **Multiple Triggers**: Hover, Focus, Click, Manual control
- ✅ **Portal Rendering**: Prevents z-index and overflow issues
- ✅ **Customizable Delays**: Independent show/hide delay timings
- ✅ **Themes & Sizes**: Dark/Light themes, Small/Medium/Large sizes
- ✅ **Arrow Indicator**: Optional arrow pointing to target element
- ✅ **Accessibility**: Full ARIA support, keyboard navigation
- ✅ **TypeScript**: Complete type safety with interfaces
- ✅ **Controlled/Uncontrolled**: Both modes supported
- ✅ **Performance**: Optimized with useCallback, proper cleanup

## Installation

```tsx
import BaseTooltip from '@/components/shared/base/BaseTooltip';
```

## Basic Usage

### Simple Tooltip

```tsx
<BaseTooltip content="This is a tooltip">
  <button>Hover me</button>
</BaseTooltip>
```

### With Custom Content

```tsx
<BaseTooltip
  content={
    <div>
      <strong>Title</strong>
      <p>Detailed description here</p>
    </div>
  }
>
  <button>Info</button>
</BaseTooltip>
```

## Props API

### BaseTooltipProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | *required* | Target element that triggers the tooltip |
| `content` | `ReactNode` | *required* | Content to display in the tooltip |
| `placement` | `TooltipPlacement` | `'top'` | Tooltip position: 'top', 'bottom', 'left', 'right' |
| `offset` | `number` | `8` | Distance in pixels from target element |
| `trigger` | `TooltipTrigger` | `'hover'` | Trigger mode: 'hover', 'focus', 'click', 'manual' |
| `disabled` | `boolean` | `false` | Disables tooltip (will not show) |
| `open` | `boolean` | `undefined` | Controlled mode: tooltip visibility state |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when visibility changes |
| `showDelay` | `number` | `200` | Delay in ms before showing tooltip |
| `hideDelay` | `number` | `0` | Delay in ms before hiding tooltip |
| `size` | `TooltipSize` | `'medium'` | Size variant: 'small', 'medium', 'large' |
| `theme` | `TooltipTheme` | `'dark'` | Color theme: 'dark', 'light' |
| `arrow` | `boolean` | `true` | Show arrow indicator pointing to target |
| `maxWidth` | `string \| number` | `280` | Maximum width of tooltip (px or CSS string) |
| `className` | `string` | `undefined` | Additional CSS classes for wrapper |
| `contentClassName` | `string` | `undefined` | Additional CSS classes for tooltip content |
| `id` | `string` | `auto-generated` | HTML id attribute for tooltip element |

### Type Definitions

```typescript
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual';
type TooltipSize = 'small' | 'medium' | 'large';
type TooltipTheme = 'dark' | 'light';
```

## Positioning

### Basic Positioning

```tsx
// Top (default)
<BaseTooltip content="Top tooltip" placement="top">
  <button>Top</button>
</BaseTooltip>

// Bottom
<BaseTooltip content="Bottom tooltip" placement="bottom">
  <button>Bottom</button>
</BaseTooltip>

// Left
<BaseTooltip content="Left tooltip" placement="left">
  <button>Left</button>
</BaseTooltip>

// Right
<BaseTooltip content="Right tooltip" placement="right">
  <button>Right</button>
</BaseTooltip>
```

### Auto-Positioning

The tooltip automatically adjusts its position if it would overflow the viewport:

```tsx
// Will flip to bottom if not enough space on top
<BaseTooltip content="Smart tooltip" placement="top">
  <button>Near top edge</button>
</BaseTooltip>
```

**Auto-adjustment behavior:**
- Checks viewport boundaries before rendering
- Flips to opposite side if would overflow
- Maintains 10px margin from viewport edges
- Adjusts horizontal position to stay within bounds

### Custom Offset

```tsx
<BaseTooltip content="Far tooltip" placement="top" offset={20}>
  <button>More space</button>
</BaseTooltip>
```

## Trigger Modes

### Hover (Default)

Shows on mouse enter, hides on mouse leave:

```tsx
<BaseTooltip content="Hover tooltip" trigger="hover">
  <button>Hover me</button>
</BaseTooltip>
```

### Focus

Shows on focus, hides on blur (keyboard-friendly):

```tsx
<BaseTooltip content="Focus tooltip" trigger="focus">
  <button>Tab to me</button>
</BaseTooltip>
```

### Click

Toggles on click (mobile-friendly):

```tsx
<BaseTooltip content="Click tooltip" trigger="click">
  <button>Click me</button>
</BaseTooltip>
```

### Manual

Controlled via `open` prop (programmatic control):

```tsx
function ControlledExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BaseTooltip
        content="Manually controlled"
        trigger="manual"
        open={open}
        onOpenChange={setOpen}
      >
        <button>Target</button>
      </BaseTooltip>
      
      <button onClick={() => setOpen(!open)}>
        Toggle Tooltip
      </button>
    </>
  );
}
```

## Delays

### Show Delay

Delay before tooltip appears (prevents accidental tooltips):

```tsx
<BaseTooltip content="Delayed" showDelay={500}>
  <button>Wait for it...</button>
</BaseTooltip>
```

### Hide Delay

Delay before tooltip disappears (allows reading):

```tsx
<BaseTooltip content="Stays longer" hideDelay={300}>
  <button>Lingers after leave</button>
</BaseTooltip>
```

### Both Delays

```tsx
<BaseTooltip
  content="Smooth transitions"
  showDelay={300}
  hideDelay={200}
>
  <button>Smooth</button>
</BaseTooltip>
```

## Themes & Sizes

### Themes

#### Dark Theme (Default)

```tsx
<BaseTooltip content="Dark tooltip" theme="dark">
  <button>Dark</button>
</BaseTooltip>
```

#### Light Theme

```tsx
<BaseTooltip content="Light tooltip" theme="light">
  <button>Light</button>
</BaseTooltip>
```

### Sizes

#### Small

```tsx
<BaseTooltip content="Small tooltip" size="small">
  <button>Small</button>
</BaseTooltip>
```

#### Medium (Default)

```tsx
<BaseTooltip content="Medium tooltip" size="medium">
  <button>Medium</button>
</BaseTooltip>
```

#### Large

```tsx
<BaseTooltip content="Large tooltip" size="large">
  <button>Large</button>
</BaseTooltip>
```

### Arrow Options

```tsx
// With arrow (default)
<BaseTooltip content="Has arrow" arrow={true}>
  <button>Arrow</button>
</BaseTooltip>

// Without arrow
<BaseTooltip content="No arrow" arrow={false}>
  <button>No Arrow</button>
</BaseTooltip>
```

## Advanced Usage

### Complex Content

```tsx
<BaseTooltip
  content={
    <div>
      <div className="font-semibold mb-2">Certification Status</div>
      <div className="space-y-1 text-xs">
        <div>✅ Documents verified</div>
        <div>✅ Payment confirmed</div>
        <div>⏳ Pending inspection</div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700">
        <a href="#" className="text-blue-400 hover:underline">
          View details →
        </a>
      </div>
    </div>
  }
  maxWidth={300}
  theme="dark"
>
  <button>Status</button>
</BaseTooltip>
```

### Form Field Help

```tsx
function FormFieldWithHelp() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label>Farm Size (hectares)</label>
        <BaseTooltip
          content={
            <div>
              <div className="font-semibold mb-1">Requirements:</div>
              <ul className="text-xs space-y-0.5">
                <li>• Minimum: 0.5 hectares</li>
                <li>• Include all cultivated areas</li>
                <li>• Exclude non-agricultural land</li>
              </ul>
            </div>
          }
          placement="right"
          maxWidth={250}
        >
          <button className="text-gray-500 hover:text-gray-700">
            ⓘ
          </button>
        </BaseTooltip>
      </div>
      <input type="number" placeholder="25.5" />
    </div>
  );
}
```

### Icon Tooltips

```tsx
<div className="flex gap-2">
  <BaseTooltip content="Edit item" placement="top">
    <button className="p-2 hover:bg-gray-100 rounded">✏️</button>
  </BaseTooltip>
  
  <BaseTooltip content="Delete item" placement="top">
    <button className="p-2 hover:bg-gray-100 rounded">🗑️</button>
  </BaseTooltip>
  
  <BaseTooltip content="Share item" placement="top">
    <button className="p-2 hover:bg-gray-100 rounded">📤</button>
  </BaseTooltip>
</div>
```

### Status Indicators

```tsx
<BaseTooltip
  content={
    <div className="text-xs">
      <div className="font-semibold mb-1">Pending Review</div>
      <div>Awaiting inspector assignment</div>
      <div className="mt-1 text-gray-300">Est. 2-3 days</div>
    </div>
  }
  placement="top"
>
  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm cursor-help">
    ⏳ Pending
  </span>
</BaseTooltip>
```

### Disabled State

```tsx
<BaseTooltip content="Will not show" disabled>
  <button>Disabled Tooltip</button>
</BaseTooltip>
```

### Custom Styling

```tsx
<BaseTooltip
  content="Custom styled tooltip"
  className="custom-wrapper-class"
  contentClassName="custom-tooltip-class shadow-2xl"
  maxWidth={350}
>
  <button>Custom</button>
</BaseTooltip>
```

## Accessibility

### ARIA Support

The component automatically adds proper ARIA attributes:

```tsx
<BaseTooltip content="Accessible tooltip" id="my-tooltip">
  <button>Trigger</button>
</BaseTooltip>

// Renders:
// <button aria-describedby="my-tooltip">Trigger</button>
// <div role="tooltip" id="my-tooltip">Accessible tooltip</div>
```

### Keyboard Navigation

- **Tab**: Focus on trigger element (with focus trigger)
- **Escape**: Close tooltip
- **Click outside**: Close tooltip (with click trigger)

### Screen Readers

Content is announced when tooltip becomes visible:
- Uses `role="tooltip"` for semantic meaning
- Links trigger to tooltip via `aria-describedby`
- Content is read when tooltip shows

### Best Practices

```tsx
// ✅ Good: Provides helpful context
<BaseTooltip content="Save changes to database">
  <button aria-label="Save">💾</button>
</BaseTooltip>

// ✅ Good: Keyboard accessible with focus trigger
<BaseTooltip content="Help text" trigger="focus">
  <button>Help</button>
</BaseTooltip>

// ❌ Avoid: Tooltip with essential information
// (Users may not discover it)
<BaseTooltip content="Required field">
  <input />
</BaseTooltip>

// ✅ Better: Show required information directly
<label>
  Email <span className="text-red-500">*</span>
  <BaseTooltip content="We'll never share your email">
    <button>ⓘ</button>
  </BaseTooltip>
</label>
```

## Performance

### Optimizations

1. **useCallback**: Stable function references prevent re-renders
2. **useRef**: Direct DOM access without re-renders
3. **Portal Rendering**: Efficient layering at document level
4. **Conditional Rendering**: Tooltip only renders when visible
5. **Cleanup**: Proper cleanup of timeouts and event listeners

### Best Practices

```tsx
// ✅ Good: Memoized content
const tooltipContent = useMemo(() => (
  <div>Complex content</div>
), [dependencies]);

<BaseTooltip content={tooltipContent}>
  <button>Target</button>
</BaseTooltip>

// ✅ Good: Controlled mode with state
const [open, setOpen] = useState(false);
<BaseTooltip open={open} onOpenChange={setOpen}>
  <button>Controlled</button>
</BaseTooltip>

// ⚠️ Avoid: Creating new objects on every render
<BaseTooltip content={<div>New object</div>}>
  <button>Target</button>
</BaseTooltip>
```

## Common Patterns

### Form Validation

```tsx
<BaseTooltip
  content="Please enter a valid email address"
  theme="light"
  trigger="manual"
  open={!!error}
>
  <input
    type="email"
    className={error ? 'border-red-500' : ''}
  />
</BaseTooltip>
```

### Toolbar Actions

```tsx
<div className="flex gap-1">
  {actions.map(action => (
    <BaseTooltip
      key={action.id}
      content={action.tooltip}
      placement="bottom"
    >
      <button onClick={action.onClick}>
        {action.icon}
      </button>
    </BaseTooltip>
  ))}
</div>
```

### Truncated Text

```tsx
<BaseTooltip content={fullText} trigger="hover">
  <div className="truncate max-w-xs">
    {fullText}
  </div>
</BaseTooltip>
```

### Loading States

```tsx
<BaseTooltip
  content={isLoading ? "Loading..." : "Click to refresh"}
  trigger="hover"
>
  <button disabled={isLoading}>
    {isLoading ? "⏳" : "🔄"}
  </button>
</BaseTooltip>
```

## Integration Examples

### With BaseButton

```tsx
import BaseButton from './BaseButton';
import BaseTooltip from './BaseTooltip';

<BaseTooltip content="Save changes">
  <BaseButton variant="contained" color="primary">
    Save
  </BaseButton>
</BaseTooltip>
```

### With BaseCard

```tsx
import BaseCard from './BaseCard';
import BaseTooltip from './BaseTooltip';

<BaseCard>
  <div className="flex justify-between items-center">
    <h3>Farm Statistics</h3>
    <BaseTooltip content="Data updated daily">
      <button>ⓘ</button>
    </BaseTooltip>
  </div>
</BaseCard>
```

### With BaseTable

```tsx
import BaseTable from './BaseTable';
import BaseTooltip from './BaseTooltip';

<BaseTable
  columns={[
    {
      header: (
        <div className="flex items-center gap-2">
          Farm Name
          <BaseTooltip content="Official registered name">
            <button>?</button>
          </BaseTooltip>
        </div>
      ),
      accessor: 'name',
    },
    // ... other columns
  ]}
  data={farms}
/>
```

## Troubleshooting

### Tooltip Not Showing

**Problem**: Tooltip doesn't appear on hover

**Solutions**:
1. Check if `disabled={true}` is set
2. Verify trigger mode matches interaction (hover, focus, click)
3. Ensure content is not empty
4. Check if parent has `overflow: hidden` (use portal rendering)

```tsx
// ✅ Solution: Verify props
<BaseTooltip
  content="Text here"
  trigger="hover"
  disabled={false}
>
  <button>Trigger</button>
</BaseTooltip>
```

### Positioning Issues

**Problem**: Tooltip appears in wrong position

**Solutions**:
1. Component auto-adjusts if near viewport edges
2. Increase `offset` prop if too close to target
3. Try different `placement` value
4. Check if parent has `transform` CSS (breaks positioning)

```tsx
// ✅ Solution: Adjust offset and placement
<BaseTooltip
  content="Better positioned"
  placement="right"
  offset={16}
>
  <button>Target</button>
</BaseTooltip>
```

### Tooltip Clipped

**Problem**: Tooltip is cut off by parent container

**Solution**: Component uses portal rendering by default (renders at document root)

If still clipped, check:
1. Parent has `overflow: hidden`
2. Parent has `position: relative` with limited height
3. Z-index conflicts (tooltip uses 9999)

### Multiple Tooltips Conflict

**Problem**: Multiple tooltips show at once

**Solution**: Each tooltip manages its own state independently. For mutual exclusivity:

```tsx
function MutualTooltips() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <>
      <BaseTooltip
        content="First"
        trigger="manual"
        open={activeTooltip === 'first'}
        onOpenChange={(open) => setActiveTooltip(open ? 'first' : null)}
      >
        <button>First</button>
      </BaseTooltip>
      
      <BaseTooltip
        content="Second"
        trigger="manual"
        open={activeTooltip === 'second'}
        onOpenChange={(open) => setActiveTooltip(open ? 'second' : null)}
      >
        <button>Second</button>
      </BaseTooltip>
    </>
  );
}
```

### Performance Issues

**Problem**: Lag with many tooltips

**Solutions**:
1. Use `showDelay` to prevent accidental tooltips
2. Memoize complex content with `useMemo`
3. Avoid re-creating content objects on every render
4. Consider virtualization for long lists

```tsx
// ✅ Optimized
const content = useMemo(() => (
  <ComplexComponent data={data} />
), [data]);

<BaseTooltip content={content} showDelay={300}>
  <button>Optimized</button>
</BaseTooltip>
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Android

**Required features**:
- CSS Flexbox
- CSS Transforms
- Portal rendering (React 16.8+)
- Intersection Observer (for viewport detection)

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import BaseTooltip, {
  BaseTooltipProps,
  TooltipPlacement,
  TooltipTrigger,
  TooltipSize,
  TooltipTheme,
} from './BaseTooltip';

// Type-safe usage
const props: BaseTooltipProps = {
  content: 'Typed tooltip',
  placement: 'top',
  trigger: 'hover',
  size: 'medium',
  theme: 'dark',
};

<BaseTooltip {...props}>
  <button>Target</button>
</BaseTooltip>
```

## Related Components

- **BasePopover**: For complex interactive content
- **BaseDialog**: For modal interactions
- **BaseDropdown**: For menu options
- **BaseAlert**: For important notifications

## Version History

- **1.0.0** (November 4, 2025): Initial release
  - Portal rendering
  - Auto-positioning
  - 4 trigger modes
  - Themes & sizes
  - Full accessibility
  - TypeScript support

## License

Part of the Botanical Audit Framework component library.

---

**Need help?** Check the [examples](./BaseTooltip.example.tsx) or [tests](./BaseTooltip.test.tsx) for more usage patterns.
