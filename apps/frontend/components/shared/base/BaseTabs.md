# BaseTabs Component

A flexible and accessible tabs component for organizing content into separate views with keyboard navigation support.

## Features

- ✅ **3 Variants**: Underline, Contained, Pills
- ✅ **Keyboard Navigation**: Arrow keys, Home, End
- ✅ **Icon & Badge Support**: Visual indicators per tab
- ✅ **Disabled Tabs**: Prevent tab access
- ✅ **Controlled/Uncontrolled**: Both modes supported
- ✅ **Lazy Loading**: Render only active content
- ✅ **Layout Options**: Full width, centered
- ✅ **Accessibility**: Full ARIA support
- ✅ **TypeScript**: Complete type safety

## Installation

```tsx
import BaseTabs, { Tab } from '@/components/shared/base/BaseTabs';
```

## Basic Usage

```tsx
const tabs: Tab[] = [
  {
    id: 'tab1',
    label: 'Overview',
    content: <div>Overview content</div>,
  },
  {
    id: 'tab2',
    label: 'Details',
    content: <div>Details content</div>,
  },
];

<BaseTabs tabs={tabs} />
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | *required* | Array of tab configurations |
| `variant` | `'underline' \| 'contained' \| 'pills'` | `'underline'` | Visual style |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tab size |
| `activeTab` | `string` | `undefined` | Controlled active tab ID |
| `defaultActiveTab` | `string` | *first tab* | Initial active tab (uncontrolled) |
| `onChange` | `(tabId) => void` | `undefined` | Tab change callback |
| `lazy` | `boolean` | `false` | Lazy load tab content |
| `fullWidth` | `boolean` | `false` | Stretch tabs to full width |
| `centered` | `boolean` | `false` | Center align tabs |
| `className` | `string` | `''` | Tab container classes |
| `panelClassName` | `string` | `''` | Tab panel classes |

### Tab Interface

```typescript
interface Tab {
  id: string;              // Unique identifier
  label: string;           // Tab label text
  content: ReactNode;      // Tab content
  icon?: ReactNode;        // Optional icon
  badge?: ReactNode;       // Optional badge
  disabled?: boolean;      // Disable tab
  className?: string;      // Tab-specific classes
}
```

## Variants

### Underline (Default)

Classic underline style:

```tsx
<BaseTabs tabs={tabs} variant="underline" />
```

### Contained

Filled background style:

```tsx
<BaseTabs tabs={tabs} variant="contained" />
```

### Pills

Rounded pill style:

```tsx
<BaseTabs tabs={tabs} variant="pills" />
```

## Icons & Badges

```tsx
const tabs: Tab[] = [
  {
    id: 'all',
    label: 'All Items',
    icon: <span>📄</span>,
    badge: '156',
    content: <div>All items...</div>,
  },
  {
    id: 'pending',
    label: 'Pending',
    icon: <span>⏳</span>,
    badge: '12',
    content: <div>Pending items...</div>,
  },
];
```

## Keyboard Navigation

- **Arrow Left/Up**: Previous tab
- **Arrow Right/Down**: Next tab
- **Home**: First tab
- **End**: Last tab
- **Tab**: Move focus in/out of tabs

## Controlled Mode

```tsx
function ControlledTabs() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <BaseTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
    />
  );
}
```

## Lazy Loading

Only renders active tab content:

```tsx
<BaseTabs tabs={tabs} lazy />
```

**Benefits:**
- Improved performance
- Reduced initial render time
- Lower memory usage

## Layout Options

### Full Width

```tsx
<BaseTabs tabs={tabs} fullWidth />
```

### Centered

```tsx
<BaseTabs tabs={tabs} centered />
```

## Real-World Examples

### Dashboard with Stats

```tsx
const dashboardTabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <span>📊</span>,
    content: (
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total" value="156" />
        <StatCard title="Active" value="98" />
        <StatCard title="Pending" value="58" />
      </div>
    ),
  },
  // ... more tabs
];

<BaseTabs tabs={dashboardTabs} variant="contained" />
```

### Multi-Step Form

```tsx
function MultiStepForm() {
  const [step, setStep] = useState('step1');

  const steps: Tab[] = [
    {
      id: 'step1',
      label: 'Basic Info',
      content: <Step1Form onNext={() => setStep('step2')} />,
    },
    {
      id: 'step2',
      label: 'Details',
      content: <Step2Form onNext={() => setStep('step3')} />,
    },
    {
      id: 'step3',
      label: 'Review',
      content: <ReviewForm onSubmit={handleSubmit} />,
    },
  ];

  return (
    <BaseTabs
      tabs={steps}
      activeTab={step}
      onChange={setStep}
      variant="underline"
    />
  );
}
```

## Accessibility

### ARIA Attributes

- `role="tablist"` on tab container
- `role="tab"` on each tab button
- `role="tabpanel"` on content panels
- `aria-selected` indicates active tab
- `aria-controls` links tab to panel
- `tabIndex` for keyboard navigation

### Best Practices

```tsx
// ✅ Good: Descriptive labels
<Tab label="User Profile" />

// ✅ Good: Logical tab order
const tabs = [overview, details, settings];

// ❌ Avoid: Too many tabs (>7)
// Consider using a different UI pattern

// ✅ Better: Use dropdown for many options
<Dropdown items={manyItems} />
```

## Performance Tips

```tsx
// ✅ Use lazy loading for heavy content
<BaseTabs tabs={tabs} lazy />

// ✅ Memoize tab content
const content = useMemo(() => <HeavyComponent />, [deps]);

// ✅ Stable tab array
const tabs = useMemo(() => [...], []);
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers

## Version History

- **1.0.0** (November 4, 2025): Initial release

---

**Need help?** Check [examples](./BaseTabs.example.tsx) or [tests](./BaseTabs.test.tsx).
