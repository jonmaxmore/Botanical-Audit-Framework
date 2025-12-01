# BaseAccordion Component

A flexible and accessible accordion component for collapsible content sections.

## Features

- **Single & Multiple Expansion**: Control whether one or many items can be expanded
- **Keyboard Navigation**: Full arrow key navigation (Up/Down, Home, End)
- **Controlled & Uncontrolled**: Flexible state management options
- **Smooth Animations**: Optional expand/collapse animations
- **Multiple Variants**: Default, bordered, and separated styles
- **Custom Icons**: Replace default chevrons with custom icons
- **Disabled States**: Individual items or entire accordion
- **Full Accessibility**: ARIA attributes and keyboard support
- **TypeScript Support**: Complete type definitions

## Installation

```tsx
import { BaseAccordion } from '@/components/shared/base/BaseAccordion';
```

## Basic Usage

```tsx
import { BaseAccordion, AccordionItem } from './BaseAccordion';

const items: AccordionItem[] = [
  {
    id: 'section-1',
    header: 'What is G.A.C.P.?',
    content: 'Good Agricultural and Collection Practices...',
  },
  {
    id: 'section-2',
    header: 'How long does certification take?',
    content: 'The process typically takes 3-6 months...',
  },
];

<BaseAccordion items={items} mode="single" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | **Required** | Array of accordion items to display |
| `mode` | `'single' \| 'multiple'` | `'single'` | Expansion mode - single or multiple items |
| `variant` | `'default' \| 'bordered' \| 'separated'` | `'default'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of accordion items |
| `defaultExpanded` | `string[]` | `[]` | Initially expanded item IDs (uncontrolled) |
| `expandedItems` | `string[]` | `undefined` | Controlled expanded item IDs |
| `onChange` | `(ids: string[]) => void` | `undefined` | Callback when expanded items change |
| `animated` | `boolean` | `true` | Enable expand/collapse animations |
| `showIcons` | `boolean` | `true` | Show expand/collapse chevron icons |
| `expandIcon` | `ReactNode` | Chevron down | Custom icon for collapsed state |
| `collapseIcon` | `ReactNode` | Chevron up | Custom icon for expanded state |
| `disabled` | `boolean` | `false` | Disable all accordion items |
| `className` | `string` | `''` | Custom CSS classes for container |
| `itemClassName` | `string` | `''` | Custom CSS classes for items |
| `headerClassName` | `string` | `''` | Custom CSS classes for headers |
| `panelClassName` | `string` | `''` | Custom CSS classes for panels |

## AccordionItem Interface

```tsx
interface AccordionItem {
  id: string;              // Unique identifier
  header: ReactNode;       // Header/trigger content
  content: ReactNode;      // Panel content when expanded
  icon?: ReactNode;        // Optional icon before header
  disabled?: boolean;      // Disable this item
  className?: string;      // Custom CSS for this item
}
```

## Expansion Modes

### Single Mode

Only one item can be expanded at a time. Expanding a new item automatically collapses the previously expanded item.

```tsx
<BaseAccordion items={items} mode="single" />
```

### Multiple Mode

Multiple items can be expanded simultaneously.

```tsx
<BaseAccordion items={items} mode="multiple" />
```

## Variants

### Default Variant

All items in a single bordered container with dividers.

```tsx
<BaseAccordion items={items} variant="default" />
```

### Bordered Variant

Each item has its own border, stacked without spacing.

```tsx
<BaseAccordion items={items} variant="bordered" />
```

### Separated Variant

Each item is separated with spacing and has a shadow.

```tsx
<BaseAccordion items={items} variant="separated" />
```

## Sizes

```tsx
<BaseAccordion items={items} size="small" />
<BaseAccordion items={items} size="medium" />
<BaseAccordion items={items} size="large" />
```

## With Icons

Add icons to individual accordion items:

```tsx
const items: AccordionItem[] = [
  {
    id: 'farm',
    header: 'Farm Information',
    icon: '🌾',
    content: 'Farm details here...',
  },
  {
    id: 'cert',
    header: 'Certification',
    icon: '✓',
    content: 'Certificate information...',
  },
];

<BaseAccordion items={items} variant="separated" />
```

## Custom Expand/Collapse Icons

```tsx
<BaseAccordion 
  items={items}
  expandIcon={<span>▶</span>}
  collapseIcon={<span>▼</span>}
/>
```

## Controlled Mode

Manage expanded state externally:

```tsx
const [expandedItems, setExpandedItems] = useState(['section-1']);

<BaseAccordion
  items={items}
  mode="single"
  expandedItems={expandedItems}
  onChange={setExpandedItems}
/>
```

### Multi-Step Form Example

```tsx
const [currentStep, setCurrentStep] = useState(0);
const [expandedItems, setExpandedItems] = useState(['step-1']);

const steps = [
  { id: 'step-1', header: 'Step 1', content: <Form1 /> },
  { id: 'step-2', header: 'Step 2', content: <Form2 /> },
  { id: 'step-3', header: 'Step 3', content: <Form3 /> },
];

const handleNext = () => {
  const nextStep = currentStep + 1;
  setCurrentStep(nextStep);
  setExpandedItems([steps[nextStep].id]);
};

<BaseAccordion
  items={steps}
  mode="single"
  expandedItems={expandedItems}
  onChange={setExpandedItems}
/>
```

## Keyboard Navigation

The accordion supports full keyboard navigation:

| Key | Action |
|-----|--------|
| **Enter** / **Space** | Toggle expand/collapse of focused item |
| **Arrow Down** | Move focus to next item |
| **Arrow Up** | Move focus to previous item |
| **Home** | Move focus to first item |
| **End** | Move focus to last item |

Navigation automatically wraps around and skips disabled items.

## Disabled States

### Disable Individual Items

```tsx
const items: AccordionItem[] = [
  {
    id: 'available',
    header: 'Available Section',
    content: 'This is accessible',
  },
  {
    id: 'locked',
    header: 'Locked Section',
    content: 'Not accessible',
    disabled: true,
  },
];

<BaseAccordion items={items} />
```

### Disable Entire Accordion

```tsx
<BaseAccordion items={items} disabled />
```

## Animations

Enable or disable expand/collapse animations:

```tsx
<BaseAccordion items={items} animated />        {/* With animations */}
<BaseAccordion items={items} animated={false} /> {/* Without animations */}
```

## Real-World Examples

### FAQ Section

```tsx
const faqItems: AccordionItem[] = [
  {
    id: 'q1',
    header: 'What is G.A.C.P. Certification?',
    content: (
      <div className="space-y-2">
        <p>Good Agricultural and Collection Practices...</p>
        <p>It ensures quality, safety, and sustainability...</p>
      </div>
    ),
  },
  // More FAQ items...
];

<BaseAccordion 
  items={faqItems} 
  mode="single"
  variant="separated"
  defaultExpanded={['q1']}
/>
```

### Settings Panel

```tsx
const settingsItems: AccordionItem[] = [
  {
    id: 'permissions',
    header: 'User Permissions',
    icon: '👤',
    content: (
      <div className="space-y-3">
        <label>
          <input type="checkbox" defaultChecked />
          <span>View certificates</span>
        </label>
        {/* More permissions... */}
      </div>
    ),
  },
  {
    id: 'notifications',
    header: 'Notifications',
    icon: '🔔',
    content: (/* Notification settings */)
  },
  // More settings sections...
];

<BaseAccordion 
  items={settingsItems}
  mode="multiple"
  variant="bordered"
  defaultExpanded={['permissions']}
/>
```

### Dashboard Sections

```tsx
const dashboardSections: AccordionItem[] = [
  {
    id: 'overview',
    header: 'Farm Overview',
    icon: '📊',
    content: (
      <div className="grid grid-cols-3 gap-4">
        <StatCard value="15.5" label="Hectares" />
        <StatCard value="12" label="Crop Types" />
        <StatCard value="3" label="Certifications" />
      </div>
    ),
  },
  // More dashboard sections...
];

<BaseAccordion
  items={dashboardSections}
  mode="multiple"
  variant="separated"
/>
```

## Accessibility

The BaseAccordion component follows WAI-ARIA accordion pattern:

- **ARIA Attributes**: Proper `aria-expanded`, `aria-controls`, and `aria-disabled` attributes
- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Focus Management**: Maintains focus during navigation
- **Screen Readers**: Announces state changes and content
- **Semantic HTML**: Uses `<button>` for headers, proper roles for regions

### Best Practices

1. **Unique IDs**: Ensure each accordion item has a unique `id`
2. **Descriptive Headers**: Use clear, concise header text
3. **Logical Order**: Arrange items in a logical sequence
4. **Content Structure**: Use proper heading hierarchy in content
5. **Default State**: Consider defaultExpanded for important content

## Performance Tips

- **Lazy Content**: For heavy content, render conditionally based on expanded state
- **Memoization**: Use `React.memo` for complex item content
- **Virtualization**: For very long lists, consider virtual scrolling
- **Animations**: Disable animations if performance is critical

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Version History

- **1.0.0**: Initial release with single/multiple modes, keyboard navigation, and variants
