# BaseInput Component

A versatile input component supporting multiple input types, validation states, icons, and textarea functionality.

## Features

- 🎯 **Multiple Types**: text, email, password, number, tel, url, search
- 📝 **Textarea Support**: Multiline input with configurable rows
- 📏 **3 Sizes**: Small, Medium, Large
- ✅ **Validation States**: Default, Success, Error, Warning
- 🎨 **Icons**: Start and end icon slots
- 📊 **Character Count**: Optional character counter with maxLength
- ♿ **Accessible**: ARIA attributes, proper labeling
- 🎛️ **Helper Text**: Support for hints, errors, success messages
- 🚫 **Disabled State**: Visual feedback for disabled inputs
- 📱 **Responsive**: Full width option for mobile layouts

## Installation

```bash
# No installation needed - part of base components
```

## Basic Usage

```tsx
import BaseInput from '@/components/shared/base/BaseInput';

// Simple text input
<BaseInput
  label="Username"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// Email with validation
<BaseInput
  type="email"
  label="Email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>

// Textarea
<BaseInput
  multiline
  rows={4}
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'` | Input type |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Input size |
| `state` | `'default' \| 'success' \| 'error' \| 'warning'` | `'default'` | Validation state |
| `label` | `ReactNode` | - | Input label |
| `helperText` | `ReactNode` | - | Helper text below input |
| `error` | `ReactNode` | - | Error message (sets state to error) |
| `success` | `ReactNode` | - | Success message (sets state to success) |
| `startIcon` | `ReactNode` | - | Icon at start of input |
| `endIcon` | `ReactNode` | - | Icon at end of input |
| `fullWidth` | `boolean` | `false` | Make input full width |
| `multiline` | `boolean` | `false` | Render as textarea |
| `rows` | `number` | `3` | Rows for textarea |
| `showCount` | `boolean` | `false` | Show character count (requires maxLength) |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable input |
| `required` | `boolean` | `false` | Mark as required |
| `value` | `string` | - | Input value |
| `onChange` | `function` | - | Change handler |
| `maxLength` | `number` | - | Maximum character length |

Plus all standard HTML input/textarea attributes.

## Input Types

### Text Input (Default)
```tsx
<BaseInput
  type="text"
  label="Full Name"
  placeholder="John Doe"
/>
```

### Email Input
```tsx
<BaseInput
  type="email"
  label="Email Address"
  placeholder="email@example.com"
  startIcon={<EmailIcon />}
/>
```

### Password Input
```tsx
<BaseInput
  type="password"
  label="Password"
  placeholder="Enter password"
  startIcon={<LockIcon />}
  helperText="Must be at least 8 characters"
/>
```

### Number Input
```tsx
<BaseInput
  type="number"
  label="Age"
  min={0}
  max={120}
/>
```

### Phone Input
```tsx
<BaseInput
  type="tel"
  label="Phone Number"
  placeholder="+1 (555) 000-0000"
  startIcon={<PhoneIcon />}
/>
```

### URL Input
```tsx
<BaseInput
  type="url"
  label="Website"
  placeholder="https://example.com"
  startIcon={<LinkIcon />}
/>
```

### Search Input
```tsx
<BaseInput
  type="search"
  label="Search"
  placeholder="Search..."
  startIcon={<SearchIcon />}
/>
```

## Sizes

### Small
Compact input for dense layouts.
```tsx
<BaseInput size="small" label="Small Input" />
```

### Medium (Default)
Standard size for most use cases.
```tsx
<BaseInput size="medium" label="Medium Input" />
```

### Large
Prominent input for important fields.
```tsx
<BaseInput size="large" label="Large Input" />
```

## Validation States

### Default State
```tsx
<BaseInput
  label="Username"
  helperText="Choose a unique username"
/>
```

### Success State
```tsx
<BaseInput
  label="Email"
  value="user@example.com"
  success="Email is valid!"
/>
```

### Error State
```tsx
<BaseInput
  label="Email"
  value="invalid-email"
  error="Please enter a valid email address"
/>
```

### Warning State
```tsx
<BaseInput
  label="Email"
  state="warning"
  value="test@test.com"
  helperText="This email domain is not recommended"
/>
```

## Icons

### Start Icon
```tsx
<BaseInput
  label="Search"
  placeholder="Search..."
  startIcon={<SearchIcon />}
/>
```

### End Icon
```tsx
<BaseInput
  label="Email"
  placeholder="email@example.com"
  endIcon={<CheckIcon />}
/>
```

### Both Icons
```tsx
<BaseInput
  label="Username"
  startIcon={<UserIcon />}
  endIcon={isValid ? <CheckIcon /> : null}
/>
```

### Interactive End Icon (Password Toggle)
```tsx
const [showPassword, setShowPassword] = useState(false);

<BaseInput
  type={showPassword ? 'text' : 'password'}
  label="Password"
  startIcon={<LockIcon />}
  endIcon={
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  }
/>
```

## Textarea/Multiline

### Basic Textarea
```tsx
<BaseInput
  multiline
  label="Comments"
  placeholder="Enter your comments..."
  rows={4}
/>
```

### Textarea with Character Count
```tsx
<BaseInput
  multiline
  label="Description"
  rows={5}
  maxLength={500}
  showCount
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

## Character Count

Show character count when user approaches limit:

```tsx
<BaseInput
  label="Tweet"
  placeholder="What's happening?"
  maxLength={280}
  showCount
  value={tweet}
  onChange={(e) => setTweet(e.target.value)}
/>
```

The counter turns red when approaching 90% of maxLength.

## Required Fields

```tsx
<BaseInput
  label="Email Address"
  placeholder="email@example.com"
  required
/>
```

The label will show a red asterisk (*) for required fields.

## Full Width

```tsx
<BaseInput
  label="Full Width Input"
  fullWidth
  placeholder="This input takes full container width"
/>

// Use in responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <BaseInput label="First Name" fullWidth />
  <BaseInput label="Last Name" fullWidth />
</div>
```

## Examples

### Login Form
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

<div className="space-y-4">
  <BaseInput
    type="email"
    label="Email"
    placeholder="email@example.com"
    required
    fullWidth
    startIcon={<EmailIcon />}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <BaseInput
    type="password"
    label="Password"
    placeholder="Enter password"
    required
    fullWidth
    startIcon={<LockIcon />}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
    Sign In
  </button>
</div>
```

### Registration Form
```tsx
<div className="space-y-4">
  <BaseInput
    label="Full Name"
    placeholder="John Doe"
    required
    fullWidth
    startIcon={<UserIcon />}
  />

  <BaseInput
    type="email"
    label="Email"
    placeholder="email@example.com"
    required
    fullWidth
    startIcon={<EmailIcon />}
  />

  <BaseInput
    type="password"
    label="Password"
    required
    fullWidth
    startIcon={<LockIcon />}
    helperText="Must be at least 8 characters"
  />

  <BaseInput
    type="tel"
    label="Phone"
    placeholder="+1 (555) 000-0000"
    fullWidth
    startIcon={<PhoneIcon />}
  />

  <BaseInput
    multiline
    label="Bio"
    placeholder="Tell us about yourself"
    rows={4}
    maxLength={200}
    showCount
  />
</div>
```

### Contact Form
```tsx
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <BaseInput
      label="First Name"
      placeholder="John"
      required
    />
    <BaseInput
      label="Last Name"
      placeholder="Doe"
      required
    />
  </div>

  <BaseInput
    type="email"
    label="Email"
    placeholder="email@example.com"
    required
    fullWidth
    startIcon={<EmailIcon />}
  />

  <BaseInput
    multiline
    label="Message"
    placeholder="How can we help?"
    required
    fullWidth
    rows={5}
    maxLength={500}
    showCount
  />

  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
    Send Message
  </button>
</div>
```

### Search Bar
```tsx
<BaseInput
  type="search"
  size="large"
  placeholder="Search products, categories, brands..."
  fullWidth
  startIcon={<SearchIcon />}
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

### Settings Form
```tsx
<div className="space-y-6">
  <BaseInput
    label="Display Name"
    value={displayName}
    onChange={(e) => setDisplayName(e.target.value)}
    success={saved ? "Saved successfully" : undefined}
  />

  <BaseInput
    type="email"
    label="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    helperText="We'll never share your email"
    disabled={!canChangeEmail}
  />

  <BaseInput
    type="url"
    label="Website"
    value={website}
    onChange={(e) => setWebsite(e.target.value)}
    startIcon={<LinkIcon />}
  />
</div>
```

## Validation

### Client-Side Validation
```tsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) {
    setEmailError('Email is required');
  } else if (!emailRegex.test(value)) {
    setEmailError('Please enter a valid email');
  } else {
    setEmailError('');
  }
};

<BaseInput
  type="email"
  label="Email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={emailError}
/>
```

### Async Validation
```tsx
const [username, setUsername] = useState('');
const [checking, setChecking] = useState(false);
const [usernameStatus, setUsernameStatus] = useState<{
  type: 'success' | 'error';
  message: string;
} | null>(null);

const checkUsername = async (value: string) => {
  setChecking(true);
  const available = await api.checkUsername(value);
  setChecking(false);
  
  if (available) {
    setUsernameStatus({
      type: 'success',
      message: 'Username is available'
    });
  } else {
    setUsernameStatus({
      type: 'error',
      message: 'Username is already taken'
    });
  }
};

<BaseInput
  label="Username"
  value={username}
  onChange={(e) => {
    setUsername(e.target.value);
    checkUsername(e.target.value);
  }}
  error={usernameStatus?.type === 'error' ? usernameStatus.message : undefined}
  success={usernameStatus?.type === 'success' ? usernameStatus.message : undefined}
  endIcon={checking ? <SpinnerIcon /> : undefined}
/>
```

## Accessibility

BaseInput implements comprehensive accessibility:

### ARIA Attributes
- `aria-invalid`: Set to true for error state
- `aria-describedby`: Links to helper text
- `aria-required`: Set when required prop is true

### Keyboard Navigation
- **Tab**: Navigate between inputs
- **Enter**: Submit form (when in form context)
- **Escape**: Clear input (browser default for search)

### Screen Reader Support
- Labels properly associated with inputs
- Helper text announced
- Error messages announced
- Required indicator announced

### Focus Management
- Clear focus outline (ring-2)
- Focus visible on all interactive elements
- Tab order preserved

## Best Practices

### ✅ DO

```tsx
// Use appropriate input types
<BaseInput type="email" />  // For email
<BaseInput type="tel" />    // For phone
<BaseInput type="url" />    // For URLs

// Provide helpful labels and helper text
<BaseInput
  label="Password"
  helperText="Must be at least 8 characters"
/>

// Show validation feedback
<BaseInput
  error={emailError}
  success="Email verified!"
/>

// Use icons for clarity
<BaseInput
  type="search"
  startIcon={<SearchIcon />}
/>

// Show character limits
<BaseInput
  maxLength={280}
  showCount
/>
```

### ❌ DON'T

```tsx
// Don't use wrong input types
<BaseInput type="text" />  // ❌ For email input

// Don't hide errors
<BaseInput value={invalid} />  // ❌ No error message

// Don't make everything required
<BaseInput required />  // ❌ Unless truly required

// Don't use placeholder as label
<BaseInput placeholder="Email" />  // ❌ Missing label

// Don't nest inputs
<BaseInput>
  <BaseInput />  // ❌ Invalid HTML
</BaseInput>
```

## Styling

### Custom Styles
```tsx
<BaseInput
  className="border-blue-500 focus:ring-blue-300"
  label="Custom Styled"
/>
```

### Wrapper Styling
```tsx
<div className="max-w-md mx-auto">
  <BaseInput label="Centered Input" />
</div>
```

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BaseInput from './BaseInput';

test('renders input with label', () => {
  render(<BaseInput label="Username" />);
  expect(screen.getByText('Username')).toBeInTheDocument();
});

test('calls onChange when value changes', () => {
  const onChange = jest.fn();
  render(<BaseInput onChange={onChange} />);
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  
  expect(onChange).toHaveBeenCalled();
});

test('shows error message', () => {
  render(<BaseInput error="Invalid input" />);
  expect(screen.getByText('Invalid input')).toBeInTheDocument();
});

test('shows character count', () => {
  render(<BaseInput value="test" maxLength={10} showCount />);
  expect(screen.getByText('4/10')).toBeInTheDocument();
});
```

## Migration from Material-UI

```tsx
// Material-UI
import { TextField } from '@mui/material';

<TextField
  label="Email"
  variant="outlined"
  error={!!error}
  helperText={error || "Enter email"}
  InputProps={{
    startAdornment: <EmailIcon />
  }}
/>

// BaseInput
import BaseInput from '@/components/shared/base/BaseInput';

<BaseInput
  label="Email"
  error={error}
  helperText={!error ? "Enter email" : undefined}
  startIcon={<EmailIcon />}
/>
```

## Performance Tips

1. **Debounce onChange**: For expensive operations like API calls
2. **Memoize Icons**: Wrap icon components in React.memo
3. **Controlled vs Uncontrolled**: Use uncontrolled for simple forms
4. **Avoid Inline Functions**: Define handlers outside render

```tsx
// ❌ Bad - Creates new function on every render
<BaseInput onChange={(e) => handleChange(e.target.value)} />

// ✅ Good - Stable reference
const handleChange = useCallback((e) => {
  setValue(e.target.value);
}, []);

<BaseInput onChange={handleChange} />
```

## Troubleshooting

### Input not updating
Ensure you're using controlled component pattern:
```tsx
<BaseInput value={value} onChange={(e) => setValue(e.target.value)} />
```

### Icons not showing
Verify icon component is valid React element:
```tsx
<BaseInput startIcon={<YourIcon />} />  // ✅
<BaseInput startIcon="icon" />          // ❌
```

### Character count not appearing
Both maxLength and showCount must be set:
```tsx
<BaseInput maxLength={100} showCount />  // ✅
<BaseInput showCount />                  // ❌
```

### Ref not working
Use correct ref type:
```tsx
const inputRef = useRef<HTMLInputElement>(null);  // For input
const textareaRef = useRef<HTMLTextAreaElement>(null);  // For textarea
```

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Component**: BaseInput  
**Dependencies**: None (pure SVG icons)
