# BaseBreadcrumb Component

A navigation component that shows the current page's location within a hierarchical structure. Essential for helping users understand where they are in your application and providing quick navigation to parent pages.

## Features

- **Multiple Separators**: Slash, chevron, arrow, dot, or custom separators
- **Three Sizes**: Small, medium, and large
- **Home Icon**: Optional home icon for first item
- **Item Icons**: Support for custom icons per item
- **Collapse Long Paths**: Automatically collapse with ellipsis when too many items
- **Disabled Items**: Support for non-clickable breadcrumb items
- **Click Tracking**: Optional click handler for analytics
- **Responsive Design**: Horizontal scroll on mobile
- **Accessibility**: Full ARIA support and semantic HTML
- **Next.js Integration**: Built-in support for Next.js Link component

## Installation

```tsx
import BaseBreadcrumb from '@/components/shared/base/BaseBreadcrumb';
```

## Basic Usage

```tsx
import BaseBreadcrumb, { BreadcrumbItem } from '@/components/shared/base/BaseBreadcrumb';

function MyPage() {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptop' }, // Last item (current page) has no href
  ];

  return <BaseBreadcrumb items={items} separator="chevron" />;
}
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | **Required** | Array of breadcrumb items to display |
| `separator` | `'slash' \| 'chevron' \| 'arrow' \| 'dot' \| 'custom'` | `'slash'` | Separator style between items |
| `customSeparator` | `React.ReactNode` | `undefined` | Custom separator element (requires `separator='custom'`) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the breadcrumb text |
| `maxItems` | `number` | `undefined` | Maximum number of items to display before collapsing |
| `showHomeIcon` | `boolean` | `false` | Show home icon for first item |
| `homeIcon` | `React.ReactNode` | Default home icon | Custom home icon element |
| `responsive` | `boolean` | `true` | Enable horizontal scrolling on mobile |
| `className` | `string` | `undefined` | Additional CSS classes |
| `onItemClick` | `(item: BreadcrumbItem, index: number) => void` | `undefined` | Click handler for breadcrumb items |

### BreadcrumbItem Interface

```tsx
interface BreadcrumbItem {
  /** Label to display */
  label: string;
  
  /** URL to navigate to (optional for last item) */
  href?: string;
  
  /** Icon element to display before label */
  icon?: React.ReactNode;
  
  /** Whether this item is disabled */
  disabled?: boolean;
}
```

## Separator Styles

### Slash Separator (Default)
```tsx
<BaseBreadcrumb items={items} separator="slash" />
// Home / Products / Laptop
```

### Chevron Separator
```tsx
<BaseBreadcrumb items={items} separator="chevron" />
// Home > Products > Laptop
```

### Arrow Separator
```tsx
<BaseBreadcrumb items={items} separator="arrow" />
// Home → Products → Laptop
```

### Dot Separator
```tsx
<BaseBreadcrumb items={items} separator="dot" />
// Home • Products • Laptop
```

### Custom Separator
```tsx
<BaseBreadcrumb
  items={items}
  separator="custom"
  customSeparator={<span className="mx-2 text-primary-500">❯</span>}
/>
// Home ❯ Products ❯ Laptop
```

## Sizes

```tsx
// Small - text-xs
<BaseBreadcrumb items={items} size="small" />

// Medium - text-sm (default)
<BaseBreadcrumb items={items} size="medium" />

// Large - text-base
<BaseBreadcrumb items={items} size="large" />
```

## Home Icon

Display a home icon for the first breadcrumb item:

```tsx
// Default home icon
<BaseBreadcrumb
  items={items}
  showHomeIcon
  separator="chevron"
/>

// Custom home icon
<BaseBreadcrumb
  items={items}
  showHomeIcon
  homeIcon={
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  }
/>
```

## Item Icons

Add icons to individual breadcrumb items:

```tsx
const items: BreadcrumbItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: <SettingsIcon className="h-4 w-4" />,
  },
  {
    label: 'Profile',
    icon: <UserIcon className="h-4 w-4" />,
  },
];

<BaseBreadcrumb items={items} separator="chevron" />
```

**Note**: Icons for the first item are only shown when `showHomeIcon={false}`.

## Collapsing Long Paths

Automatically collapse breadcrumbs with many levels:

```tsx
const longPath: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Level 1', href: '/level1' },
  { label: 'Level 2', href: '/level1/level2' },
  { label: 'Level 3', href: '/level1/level2/level3' },
  { label: 'Level 4', href: '/level1/level2/level3/level4' },
  { label: 'Current Page' },
];

// Collapse to 4 items max
<BaseBreadcrumb
  items={longPath}
  separator="chevron"
  maxItems={4}
/>
// Result: Home > ... > Level 4 > Current Page
```

The component:
- Always shows the first item
- Shows ellipsis (...) for collapsed items
- Always shows the last items up to `maxItems - 2`
- Ellipsis is not clickable

## Disabled Items

Mark certain items as disabled (not clickable):

```tsx
const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Restricted Area', href: '/restricted', disabled: true },
  { label: 'Settings' },
];

<BaseBreadcrumb items={items} separator="chevron" />
```

Disabled items:
- Render as `<span>` instead of `<a>` or `<button>`
- Have reduced opacity (50%)
- Are not clickable
- Do not trigger `onItemClick`

## Click Tracking

Track when users click on breadcrumb items:

```tsx
function MyPage() {
  const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
    console.log(`Clicked: ${item.label} at index ${index}`);
    
    // Track analytics
    analytics.track('Breadcrumb Navigation', {
      label: item.label,
      href: item.href,
      position: index,
    });
  };

  return (
    <BaseBreadcrumb
      items={items}
      onItemClick={handleBreadcrumbClick}
    />
  );
}
```

**Note**: The click handler is not called for:
- The last item (current page)
- Disabled items
- Ellipsis items

## Real-World Examples

### E-Commerce Product Page

```tsx
const productBreadcrumb: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Electronics', href: '/category/electronics' },
  { label: 'Computers', href: '/category/electronics/computers' },
  { label: 'Laptops', href: '/category/electronics/computers/laptops' },
  { label: 'Dell XPS 15' },
];

<BaseBreadcrumb
  items={productBreadcrumb}
  separator="chevron"
  showHomeIcon
  size="small"
/>
```

### Farm Management System

```tsx
const farmBreadcrumb: BreadcrumbItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Farms',
    href: '/farms',
    icon: <FarmIcon />,
  },
  {
    label: 'Green Valley Farm',
    href: '/farms/42',
  },
  {
    label: 'Inspections',
    href: '/farms/42/inspections',
  },
  {
    label: 'Inspection Report #2024-001',
  },
];

<BaseBreadcrumb
  items={farmBreadcrumb}
  separator="chevron"
  maxItems={5}
/>
```

### Document Management

```tsx
const documentBreadcrumb: BreadcrumbItem[] = [
  { label: 'Documents', href: '/documents' },
  { label: 'Projects', href: '/documents/projects' },
  { label: '2024', href: '/documents/projects/2024' },
  { label: 'Q1', href: '/documents/projects/2024/q1' },
  { label: 'Proposal.pdf' },
];

<BaseBreadcrumb
  items={documentBreadcrumb}
  separator="arrow"
  size="small"
/>
```

### Admin Settings

```tsx
const settingsBreadcrumb: BreadcrumbItem[] = [
  {
    label: 'Admin',
    href: '/admin',
    icon: <AdminIcon />,
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: <SettingsIcon />,
  },
  {
    label: 'Email Configuration',
    icon: <EmailIcon />,
  },
];

<BaseBreadcrumb
  items={settingsBreadcrumb}
  separator="chevron"
  size="small"
/>
```

## Accessibility

The component follows WAI-ARIA breadcrumb pattern:

- **Semantic HTML**: Uses `<nav>`, `<ol>`, and `<li>` elements
- **ARIA Labels**: `<nav>` has `aria-label="Breadcrumb"`
- **Current Page**: Last item has `aria-current="page"`
- **Separators**: Hidden from screen readers with `aria-hidden="true"`
- **Keyboard Navigation**: All links and buttons are keyboard accessible

```tsx
// Generated HTML structure:
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/products">Products</a></li>
    <li aria-hidden="true">/</li>
    <li><span aria-current="page">Laptop</span></li>
  </ol>
</nav>
```

## Best Practices

### 1. Keep It Simple

Don't overload breadcrumbs with too many levels:

```tsx
// ❌ Bad: Too many levels (7+)
Home > Category > Subcategory > Sub-subcategory > Item > Details > Tab

// ✅ Good: Use maxItems to collapse
<BaseBreadcrumb items={items} maxItems={5} />
// Result: Home > ... > Item > Details > Tab
```

### 2. Use Clear Labels

Labels should be concise and descriptive:

```tsx
// ❌ Bad: Vague labels
{ label: 'Page 1', href: '/page1' }
{ label: 'Section', href: '/section' }

// ✅ Good: Descriptive labels
{ label: 'Products', href: '/products' }
{ label: 'Electronics', href: '/products/electronics' }
```

### 3. Consistent Separator

Use the same separator throughout your application:

```tsx
// ✅ Consistent across all pages
<BaseBreadcrumb items={items} separator="chevron" />
```

### 4. Appropriate Size

Choose size based on context:

```tsx
// Hero sections, page headers
<BaseBreadcrumb items={items} size="large" />

// Standard navigation
<BaseBreadcrumb items={items} size="medium" />

// Compact layouts, mobile, admin panels
<BaseBreadcrumb items={items} size="small" />
```

### 5. Show Home Icon Wisely

Use home icon for better recognition:

```tsx
// ✅ Good: Clear visual anchor
<BaseBreadcrumb
  items={items}
  showHomeIcon
  separator="chevron"
/>
```

### 6. Handle Dynamic Breadcrumbs

Generate breadcrumbs from route or data:

```tsx
import { useRouter } from 'next/router';

function DynamicBreadcrumb() {
  const router = useRouter();
  
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = router.asPath.split('/').filter(Boolean);
    
    return [
      { label: 'Home', href: '/' },
      ...pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === pathSegments.length - 1;
        
        return {
          label,
          href: isLast ? undefined : href,
        };
      }),
    ];
  };

  return <BaseBreadcrumb items={generateBreadcrumbs()} />;
}
```

### 7. Don't Duplicate Page Title

The last breadcrumb item represents the current page:

```tsx
// ❌ Bad: Duplicate
<BaseBreadcrumb items={items} />
<h1>Laptop</h1> {/* Same as last breadcrumb */}

// ✅ Good: Complementary
<BaseBreadcrumb items={items} />
<h1>Dell XPS 15</h1> {/* More specific than breadcrumb */}
```

## Performance Tips

### 1. Memoize Items

Prevent unnecessary re-renders:

```tsx
import { useMemo } from 'react';

function MyPage() {
  const items = useMemo(() => [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptop' },
  ], []); // Only create once

  return <BaseBreadcrumb items={items} />;
}
```

### 2. Prefetch Links

Improve navigation performance with Next.js prefetching:

```tsx
// Next.js automatically prefetches links on hover
// The component uses Next.js Link internally
<BaseBreadcrumb items={items} />
```

## Styling Customization

### Custom Styling with Tailwind

```tsx
<BaseBreadcrumb
  items={items}
  className="bg-gray-50 p-4 rounded-lg"
  separator="chevron"
/>
```

### Theme Integration

The component uses these Tailwind classes:
- Text: `text-gray-600`, `text-gray-900`
- Hover: `hover:text-primary-600`
- Disabled: `opacity-50`

Configure in `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#16a34a', // Your brand color
        },
      },
    },
  },
};
```

## Related Components

- **BaseButton**: For action buttons
- **BaseLink**: For standalone links
- **BaseTabs**: For horizontal navigation

## Migration from Other Libraries

### From Material-UI Breadcrumbs

```tsx
// Before (MUI)
<Breadcrumbs separator="›">
  <Link href="/">Home</Link>
  <Link href="/products">Products</Link>
  <Typography>Laptop</Typography>
</Breadcrumbs>

// After (BaseBreadcrumb)
<BaseBreadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptop' },
  ]}
  separator="chevron"
/>
```

### From React Bootstrap Breadcrumb

```tsx
// Before (React Bootstrap)
<Breadcrumb>
  <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
  <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
  <Breadcrumb.Item active>Laptop</Breadcrumb.Item>
</Breadcrumb>

// After (BaseBreadcrumb)
<BaseBreadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Laptop' },
  ]}
/>
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import BaseBreadcrumb, {
  type BaseBreadcrumbProps,
  type BreadcrumbItem,
  type BreadcrumbSeparator,
  type BreadcrumbSize,
} from '@/components/shared/base/BaseBreadcrumb';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
];

const separator: BreadcrumbSeparator = 'chevron';
const size: BreadcrumbSize = 'medium';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
