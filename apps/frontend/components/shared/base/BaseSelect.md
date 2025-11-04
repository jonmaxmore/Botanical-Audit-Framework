# BaseSelect Component

A flexible and feature-rich dropdown selection component for form inputs. Supports single and multi-select modes, search/filtering, grouped options, custom rendering, keyboard navigation, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Interfaces](#interfaces)
- [Examples](#examples)
  - [Simple Single Select](#simple-single-select)
  - [Multi-Select](#multi-select)
  - [Searchable Select](#searchable-select)
  - [Grouped Options](#grouped-options)
  - [Custom Rendering](#custom-rendering)
  - [Async Loading](#async-loading)
  - [Create New Options](#create-new-options)
  - [Form Integration](#form-integration)
- [Advanced Usage](#advanced-usage)
  - [Controlled vs Uncontrolled](#controlled-vs-uncontrolled)
  - [Custom Option Rendering](#custom-option-rendering)
  - [Custom Value Rendering](#custom-value-rendering)
  - [Async Data Loading](#async-data-loading)
  - [Integration with BaseForm](#integration-with-baseform)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)
- [Performance Tips](#performance-tips)
- [Troubleshooting](#troubleshooting)
- [Related Components](#related-components)

---

## Features

- ✅ **Single & Multi-Select** - Support for both selection modes
- ✅ **Search/Filter** - Built-in search functionality with debouncing
- ✅ **Grouped Options** - Organize options into labeled groups
- ✅ **Custom Rendering** - Full control over option and value display
- ✅ **Keyboard Navigation** - Complete keyboard accessibility (Arrow keys, Enter, Escape, Backspace)
- ✅ **Loading States** - Visual feedback for async data fetching
- ✅ **Disabled States** - Disable entire component or individual options
- ✅ **Error Handling** - Built-in error state and validation
- ✅ **Clear Button** - Optional clear button for resetting selection
- ✅ **Max Selections** - Limit number of selections in multi-select mode
- ✅ **Create New** - Allow users to create new options on-the-fly
- ✅ **Icons & Descriptions** - Rich option display with icons and descriptions
- ✅ **Size Variants** - Small, medium, and large sizes
- ✅ **Full Width** - Responsive full-width support
- ✅ **Form Integration** - Hidden inputs for proper form submission
- ✅ **Click Outside** - Automatic dropdown closing
- ✅ **Scroll Management** - Auto-scroll highlighted option into view
- ✅ **TypeScript** - Full TypeScript support with generics

---

## Installation

```tsx
import BaseSelect, { SelectOption, SelectGroup } from '@/components/shared/base/BaseSelect';
```

---

## Basic Usage

### Minimal Example

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function App() {
  const [value, setValue] = useState<string | number>('');

  const options: SelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  return (
    <BaseSelect
      label="Select an option"
      value={value}
      onChange={setValue}
      options={options}
    />
  );
}
```

---

## Props API

### BaseSelectProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the select |
| `value` | `string \| number \| (string \| number)[]` | - | Current selected value(s) |
| `onChange` | `(value) => void` | - | Callback when selection changes |
| `options` | `SelectOption[] \| SelectGroup[]` | **Required** | Array of options or grouped options |
| `placeholder` | `string` | `'Select...'` | Placeholder text when no value selected |
| `name` | `string` | - | Form field name for submission |
| `disabled` | `boolean` | `false` | Disable the entire component |
| `required` | `boolean` | `false` | Mark field as required (shows asterisk) |
| `error` | `string` | - | Error message to display |
| `helperText` | `string` | - | Helper text displayed below the select |
| `className` | `string` | - | Additional CSS classes for container |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `maxSelections` | `number` | - | Maximum number of selections (multi-select only) |
| `searchable` | `boolean` | `false` | Enable search/filter functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `onSearch` | `(query: string) => void` | - | Callback when search query changes |
| `noOptionsMessage` | `string` | `'No options available'` | Message when no options found |
| `clearable` | `boolean` | `false` | Show clear button |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingMessage` | `string` | `'Loading...'` | Message displayed during loading |
| `renderOption` | `(option, isSelected) => ReactNode` | - | Custom option renderer |
| `renderValue` | `(selected) => ReactNode` | - | Custom selected value renderer |
| `onCreate` | `(value: string) => void` | - | Callback to create new option |
| `onFocus` | `() => void` | - | Callback when select receives focus |
| `onBlur` | `() => void` | - | Callback when select loses focus |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `fullWidth` | `boolean` | `false` | Make select full width |

---

## Interfaces

### SelectOption

```typescript
interface SelectOption {
  value: string | number;      // Unique identifier for the option
  label: string;               // Display text for the option
  disabled?: boolean;          // Disable this specific option
  group?: string;              // Group name (for flat options with grouping)
  icon?: React.ReactNode;      // Icon to display with the option
  description?: string;        // Additional description text
}
```

### SelectGroup

```typescript
interface SelectGroup {
  label: string;               // Group label/header
  options: SelectOption[];     // Options within this group
}
```

---

## Examples

### Simple Single Select

Basic single selection dropdown:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function CertificationSelect() {
  const [certification, setCertification] = useState<string | number>('');

  const options: SelectOption[] = [
    { value: 'organic', label: 'Organic Certification' },
    { value: 'gap', label: 'GAP Certification' },
    { value: 'gacp', label: 'GACP Certification' },
    { value: 'haccp', label: 'HACCP Certification' },
  ];

  return (
    <BaseSelect
      label="Certification Type"
      value={certification}
      onChange={setCertification}
      options={options}
      placeholder="Select certification type"
      required
      helperText="Choose the type of certification you want to apply for"
    />
  );
}
```

### Multi-Select

Select multiple options with visual chips:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function CropSelect() {
  const [crops, setCrops] = useState<(string | number)[]>([]);

  const options: SelectOption[] = [
    { value: 'rice', label: 'Rice', description: 'Oryza sativa' },
    { value: 'corn', label: 'Corn', description: 'Zea mays' },
    { value: 'soybean', label: 'Soybean', description: 'Glycine max' },
    { value: 'wheat', label: 'Wheat', description: 'Triticum aestivum' },
  ];

  return (
    <BaseSelect
      label="Farm Crops"
      value={crops}
      onChange={setCrops}
      options={options}
      placeholder="Select crops"
      multiple
      maxSelections={3}
      clearable
      helperText={`Selected ${crops.length} of maximum 3 crops`}
      fullWidth
    />
  );
}
```

### Searchable Select

Large datasets with search functionality:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function ProvinceSelect() {
  const [province, setProvince] = useState<string | number>('');

  // 77 provinces in Thailand
  const provinces: SelectOption[] = [
    { value: 'bangkok', label: 'Bangkok', description: 'Capital' },
    { value: 'chiang-mai', label: 'Chiang Mai', description: 'Northern Thailand' },
    // ... 75 more provinces
  ];

  return (
    <BaseSelect
      label="Province"
      value={province}
      onChange={setProvince}
      options={provinces}
      placeholder="Search for province"
      searchable
      searchPlaceholder="Type to search..."
      clearable
      fullWidth
    />
  );
}
```

### Grouped Options

Organize options into categories:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectGroup } from './BaseSelect';

function StandardSelect() {
  const [standard, setStandard] = useState<string | number>('');

  const groupedStandards: SelectGroup[] = [
    {
      label: 'Food Safety',
      options: [
        { value: 'haccp', label: 'HACCP' },
        { value: 'gmp', label: 'GMP' },
        { value: 'iso22000', label: 'ISO 22000' },
      ],
    },
    {
      label: 'Agricultural Practice',
      options: [
        { value: 'gap', label: 'GAP' },
        { value: 'gacp', label: 'GACP' },
        { value: 'globalg', label: 'GLOBALG.A.P.' },
      ],
    },
    {
      label: 'Organic',
      options: [
        { value: 'eu-organic', label: 'EU Organic' },
        { value: 'usda-organic', label: 'USDA Organic' },
      ],
    },
  ];

  return (
    <BaseSelect
      label="Certification Standard"
      value={standard}
      onChange={setStandard}
      options={groupedStandards}
      searchable
      clearable
    />
  );
}
```

### Custom Rendering

Render options with icons and custom styling:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function StatusSelect() {
  const [status, setStatus] = useState<string | number>('');

  const statusOptions: SelectOption[] = [
    {
      value: 'approved',
      label: 'Approved',
      description: 'Application has been approved',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: 'pending',
      label: 'Pending Review',
      description: 'Waiting for review',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <BaseSelect
      label="Application Status"
      value={status}
      onChange={setStatus}
      options={statusOptions}
    />
  );
}
```

### Async Loading

Load data asynchronously with loading state:

```tsx
import { useState, useEffect } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function InspectorSelect() {
  const [inspector, setInspector] = useState<string | number>('');
  const [loading, setLoading] = useState(false);
  const [inspectors, setInspectors] = useState<SelectOption[]>([]);

  useEffect(() => {
    loadInspectors();
  }, []);

  const loadInspectors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inspectors');
      const data = await response.json();
      setInspectors(data.map(i => ({
        value: i.id,
        label: i.name,
        description: `${i.experience} years experience`,
      })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseSelect
      label="Assign Inspector"
      value={inspector}
      onChange={setInspector}
      options={inspectors}
      loading={loading}
      loadingMessage="Loading inspectors..."
      searchable
      clearable
    />
  );
}
```

### Create New Options

Allow users to create options on-the-fly:

```tsx
import { useState } from 'react';
import BaseSelect, { SelectOption } from './BaseSelect';

function TagSelect() {
  const [selectedTags, setSelectedTags] = useState<(string | number)[]>([]);
  const [tags, setTags] = useState<SelectOption[]>([
    { value: 'organic', label: 'Organic' },
    { value: 'sustainable', label: 'Sustainable' },
    { value: 'local', label: 'Local' },
  ]);

  const handleCreateTag = (newTag: string) => {
    const tagValue = newTag.toLowerCase().replace(/\s+/g, '-');
    const newOption: SelectOption = {
      value: tagValue,
      label: newTag,
    };
    
    // Add to options list
    setTags([...tags, newOption]);
    
    // Add to selected
    setSelectedTags([...selectedTags, tagValue]);
  };

  return (
    <BaseSelect
      label="Tags"
      value={selectedTags}
      onChange={setSelectedTags}
      options={tags}
      multiple
      searchable
      onCreate={handleCreateTag}
      helperText="Type and press Enter to create a new tag"
    />
  );
}
```

### Form Integration

Use with BaseForm for complete form workflows:

```tsx
import { useState } from 'react';
import BaseForm from './BaseForm';
import BaseSelect, { SelectOption } from './BaseSelect';
import BaseButton from './BaseButton';

function ApplicationForm() {
  const [formData, setFormData] = useState({
    certification: '',
    province: '',
    crops: [] as (string | number)[],
  });

  const certOptions: SelectOption[] = [
    { value: 'gacp', label: 'GACP' },
    { value: 'gap', label: 'GAP' },
  ];

  const handleSubmit = (data: any) => {
    console.log('Submitted:', data);
  };

  return (
    <BaseForm onSubmit={handleSubmit}>
      <BaseSelect
        name="certification"
        label="Certification Type"
        value={formData.certification}
        onChange={(val) => setFormData({ ...formData, certification: val as string })}
        options={certOptions}
        required
      />

      <BaseSelect
        name="crops"
        label="Crops"
        value={formData.crops}
        onChange={(val) => setFormData({ ...formData, crops: val as (string | number)[] })}
        options={cropOptions}
        multiple
        required
      />

      <BaseButton type="submit">Submit</BaseButton>
    </BaseForm>
  );
}
```

---

## Advanced Usage

### Controlled vs Uncontrolled

**Controlled (Recommended):**
```tsx
const [value, setValue] = useState('');

<BaseSelect
  value={value}
  onChange={setValue}
  options={options}
/>
```

**Uncontrolled:**
```tsx
<BaseSelect
  name="fieldName"
  options={options}
  onChange={(val) => console.log('Changed to:', val)}
/>
```

### Custom Option Rendering

Full control over option display:

```tsx
const renderOption = (option: SelectOption, isSelected: boolean) => (
  <div className="flex items-center gap-3 py-2">
    {/* Custom Icon */}
    <div className={`w-8 h-8 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-gray-200'}`}>
      <span className="text-white">{option.value}</span>
    </div>
    
    {/* Content */}
    <div className="flex-1">
      <div className="font-medium">{option.label}</div>
      {option.description && (
        <div className="text-sm text-gray-500">{option.description}</div>
      )}
    </div>
    
    {/* Badge */}
    {isSelected && (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
        Selected
      </span>
    )}
  </div>
);

<BaseSelect
  options={options}
  renderOption={renderOption}
  onChange={setValue}
/>
```

### Custom Value Rendering

Control how selected values are displayed:

```tsx
const renderValue = (selectedOptions: SelectOption[]) => {
  if (selectedOptions.length === 0) {
    return <span className="text-gray-400">No selection</span>;
  }

  if (selectedOptions.length === 1) {
    return (
      <div className="flex items-center gap-2">
        {selectedOptions[0].icon}
        <span className="font-medium">{selectedOptions[0].label}</span>
      </div>
    );
  }

  return (
    <span className="text-blue-600 font-medium">
      {selectedOptions.length} items selected
    </span>
  );
};

<BaseSelect
  multiple
  value={selectedValues}
  options={options}
  renderValue={renderValue}
  onChange={setSelectedValues}
/>
```

### Async Data Loading

Best practices for loading data:

```tsx
function AsyncSelect() {
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/options');
      if (!response.ok) throw new Error('Failed to load options');
      
      const data = await response.json();
      setOptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseSelect
      label="Select Option"
      value={value}
      onChange={setValue}
      options={options}
      loading={loading}
      error={error}
      loadingMessage="Fetching options..."
    />
  );
}
```

### Integration with BaseForm

Complete form example with validation:

```tsx
import BaseForm from './BaseForm';
import BaseSelect from './BaseSelect';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    certification: '',
    province: '',
    district: '',
    crops: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.certification) {
      newErrors.certification = 'Please select a certification type';
    }
    
    if (!formData.province) {
      newErrors.province = 'Please select your province';
    }
    
    if (formData.crops.length === 0) {
      newErrors.crops = 'Please select at least one crop';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // Submit form
      console.log('Valid form data:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseSelect
        name="certification"
        label="Certification Type"
        value={formData.certification}
        onChange={(val) => {
          setFormData({ ...formData, certification: val as string });
          setErrors({ ...errors, certification: '' });
        }}
        options={certificationOptions}
        required
        error={errors.certification}
      />

      <BaseSelect
        name="province"
        label="Province"
        value={formData.province}
        onChange={(val) => {
          setFormData({ ...formData, province: val as string });
          setErrors({ ...errors, province: '' });
        }}
        options={provinceOptions}
        searchable
        required
        error={errors.province}
      />

      <BaseSelect
        name="crops"
        label="Crops"
        value={formData.crops}
        onChange={(val) => {
          setFormData({ ...formData, crops: val as (string | number)[] });
          setErrors({ ...errors, crops: '' });
        }}
        options={cropOptions}
        multiple
        maxSelections={5}
        required
        error={errors.crops}
      />

      <button type="submit">Submit Application</button>
    </form>
  );
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` or `Space` | Open/close dropdown (when focused on select) |
| `ArrowDown` | Navigate to next option |
| `ArrowUp` | Navigate to previous option |
| `Enter` | Select highlighted option |
| `Escape` | Close dropdown and clear search |
| `Backspace` | Remove last chip (multi-select with search) |
| `Tab` | Close dropdown and move to next field |
| `Type to search` | Filter options (when searchable) |

---

## Accessibility

### ARIA Attributes

BaseSelect implements proper ARIA attributes for screen readers:

```tsx
<div
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="dropdown-id"
  aria-disabled={disabled}
  aria-label={label}
>
```

### Keyboard Navigation

- Full keyboard accessibility without mouse
- Arrow keys for navigation
- Enter/Space for selection
- Escape for closing
- Tab for form navigation

### Screen Reader Support

- Announces option count
- Announces selected values
- Announces state changes (opened/closed)
- Announces loading states
- Announces error messages

### Color Contrast

All states meet WCAG 2.1 Level AA standards:
- Default: 4.5:1 contrast
- Focus: Visible focus indicator
- Error: Red text and border (accessible contrast)
- Disabled: 3:1 contrast (acceptable for disabled)

---

## Best Practices

### DO ✅

1. **Use searchable for large datasets**
   ```tsx
   // Good: 77 provinces needs search
   <BaseSelect searchable options={provinces} />
   ```

2. **Provide clear labels**
   ```tsx
   // Good: Clear, descriptive label
   <BaseSelect label="Province where farm is located" />
   ```

3. **Add helper text for guidance**
   ```tsx
   // Good: Helps users understand the field
   <BaseSelect
     label="Crops"
     helperText="Select all crops grown on your farm"
   />
   ```

4. **Use grouped options for categories**
   ```tsx
   // Good: Organized by category
   <BaseSelect options={groupedStandards} />
   ```

5. **Set maxSelections for multi-select**
   ```tsx
   // Good: Prevents overwhelming selection
   <BaseSelect multiple maxSelections={5} />
   ```

6. **Use clearable for optional fields**
   ```tsx
   // Good: Easy to clear optional selection
   <BaseSelect clearable />
   ```

7. **Handle loading states**
   ```tsx
   // Good: Shows loading feedback
   <BaseSelect
     loading={isLoading}
     loadingMessage="Loading inspectors..."
   />
   ```

8. **Validate and show errors**
   ```tsx
   // Good: Clear error messaging
   <BaseSelect
     required
     error={errors.province}
   />
   ```

### DON'T ❌

1. **Don't omit labels**
   ```tsx
   // Bad: No label
   <BaseSelect options={options} />
   
   // Good
   <BaseSelect label="Select Option" options={options} />
   ```

2. **Don't use non-searchable for large lists**
   ```tsx
   // Bad: 77 provinces without search
   <BaseSelect options={allProvinces} />
   
   // Good
   <BaseSelect searchable options={allProvinces} />
   ```

3. **Don't allow unlimited selections**
   ```tsx
   // Bad: Could select 100+ items
   <BaseSelect multiple options={manyOptions} />
   
   // Good
   <BaseSelect multiple maxSelections={10} options={manyOptions} />
   ```

4. **Don't use generic error messages**
   ```tsx
   // Bad
   <BaseSelect error="Error" />
   
   // Good
   <BaseSelect error="Please select your province" />
   ```

5. **Don't forget disabled state for unavailable options**
   ```tsx
   // Bad: Allows selecting unavailable option
   { value: 'premium', label: 'Premium (Coming Soon)' }
   
   // Good
   { value: 'premium', label: 'Premium (Coming Soon)', disabled: true }
   ```

6. **Don't use overly complex custom renderers**
   ```tsx
   // Bad: Heavy computation in render
   const renderOption = (option) => {
     const complexCalculation = heavyComputation(option);
     return <ComplexComponent data={complexCalculation} />;
   };
   
   // Good: Precompute or memoize
   const processedOptions = useMemo(() =>
     options.map(o => ({ ...o, computed: heavyComputation(o) })),
     [options]
   );
   ```

---

## Performance Tips

### 1. Memoize Large Option Lists

```tsx
const options = useMemo(() => {
  return provinces.map(p => ({
    value: p.id,
    label: p.name,
    description: p.region,
  }));
}, [provinces]);

<BaseSelect options={options} />
```

### 2. Debounce Search Callbacks

```tsx
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Expensive search operation
    searchDatabase(query);
  }, 300),
  []
);

<BaseSelect
  searchable
  onSearch={debouncedSearch}
  options={options}
/>
```

### 3. Virtual Scrolling for Very Large Lists

For 1000+ options, consider implementing virtual scrolling or server-side pagination instead of loading all options at once.

### 4. Lazy Load Grouped Options

```tsx
const [groups, setGroups] = useState<SelectGroup[]>([]);

useEffect(() => {
  // Load groups on demand
  loadGroups().then(setGroups);
}, []);

<BaseSelect options={groups} />
```

### 5. Use Keys Properly

When using custom renderers, ensure proper key props:

```tsx
const renderOption = (option: SelectOption) => (
  <div key={option.value}>
    {option.label}
  </div>
);
```

---

## Troubleshooting

### Issue: Options not displaying

**Possible causes:**
- Options array is empty
- Options have incorrect structure
- Component is in loading state

**Solution:**
```tsx
// Check options structure
console.log('Options:', options);

// Verify SelectOption interface
const validOptions: SelectOption[] = [
  { value: '1', label: 'Option 1' }, // ✅ Correct
  // { id: '1', name: 'Option 1' }, // ❌ Wrong structure
];
```

### Issue: Search not filtering

**Possible causes:**
- `searchable` prop not set
- Search query doesn't match any options
- Custom `onSearch` callback not updating options

**Solution:**
```tsx
// Ensure searchable is true
<BaseSelect searchable options={options} />

// If using custom search, update options
const handleSearch = (query: string) => {
  const filtered = allOptions.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );
  setOptions(filtered);
};

<BaseSelect
  searchable
  onSearch={handleSearch}
  options={options}
/>
```

### Issue: Multi-select not showing chips

**Possible causes:**
- `multiple` prop not set
- Value is not an array
- Value contains invalid option values

**Solution:**
```tsx
// Ensure multiple is true and value is array
const [selected, setSelected] = useState<(string | number)[]>([]);

<BaseSelect
  multiple
  value={selected}
  onChange={setSelected}
  options={options}
/>
```

### Issue: TypeScript errors with onChange

**Problem:**
```tsx
// Error: Type mismatch
const [value, setValue] = useState<string>('');
<BaseSelect onChange={setValue} />
```

**Solution:**
```tsx
// Use type assertion or wrapper function
const handleChange = (val: string | number | (string | number)[]) => {
  if (!Array.isArray(val)) {
    setValue(val as string);
  }
};

<BaseSelect onChange={handleChange} options={options} />
```

### Issue: Dropdown not closing on click outside

**Possible cause:**
- Dropdown is rendered outside component tree (portal issue)
- Click event propagation stopped

**Solution:**
- BaseSelect handles click-outside automatically
- If using inside Modal/Dialog, ensure proper z-index

### Issue: Keyboard navigation not working

**Possible causes:**
- Component not receiving focus
- Event handlers intercepted by parent
- Disabled state active

**Solution:**
```tsx
// Ensure component can receive focus
<BaseSelect
  label="Select"
  options={options}
  disabled={false} // ✅ Not disabled
  onChange={handleChange}
/>

// Check focus management
const handleFocus = () => console.log('Focused');
<BaseSelect onFocus={handleFocus} />
```

---

## Related Components

### BaseForm
Use BaseSelect within BaseForm for complete form workflows with validation:
```tsx
<BaseForm onSubmit={handleSubmit}>
  <BaseSelect name="field" options={options} />
</BaseForm>
```

### BaseInput
For text input fields (complements BaseSelect):
```tsx
<BaseInput label="Name" />
<BaseSelect label="Province" options={provinces} />
```

### BaseDialog
Use BaseSelect in dialogs for modal forms:
```tsx
<BaseDialog open={open}>
  <BaseSelect label="Select Option" options={options} />
</BaseDialog>
```

### BaseCard
Wrap BaseSelect in BaseCard for visual hierarchy:
```tsx
<BaseCard>
  <h3>Certification Details</h3>
  <BaseSelect label="Type" options={certifications} />
</BaseCard>
```

---

## Changelog

### Version 1.0.0 (November 4, 2025)
- ✅ Initial release
- ✅ Single and multi-select modes
- ✅ Search/filter functionality
- ✅ Grouped options support
- ✅ Custom rendering
- ✅ Keyboard navigation
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility features
- ✅ Form integration
- ✅ Full TypeScript support

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report a bug](https://github.com/your-repo/issues)
- Documentation: [Full documentation](https://your-docs-site.com)
- Examples: [Live examples](https://your-examples-site.com)

---

**Built with ❤️ for the GACP Botanical Audit Framework**
