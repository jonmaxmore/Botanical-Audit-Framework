# BaseForm Component

A comprehensive form wrapper component providing validation, error handling, submit management, and state control for complex forms.

## Features

- 📝 **Form State Management**: Centralized values, errors, and touched states
- ✅ **Flexible Validation**: Sync and async validation support
- 🎯 **Validation Modes**: Validate on blur, change, or submit
- 🔄 **Submit Handling**: Async submit with loading states
- 🚫 **Auto-disable**: Disable form during submission
- 🎨 **Form Context**: useFormContext hook for child components
- 📊 **Field Management**: Individual field control and validation
- ♿ **Accessible**: Built-in form accessibility features
- 🔗 **Integration Ready**: Works seamlessly with BaseInput, BaseButton, BaseCard

## Installation

```bash
# No installation needed - part of base components
```

## Basic Usage

```tsx
import BaseForm from '@/components/shared/base/BaseForm';
import BaseInput from '@/components/shared/base/BaseInput';
import BaseButton from '@/components/shared/base/BaseButton';

// Simple form
<BaseForm
  initialValues={{ email: '', password: '' }}
  onSubmit={(values) => {
    console.log(values);
  }}
>
  <BaseInput name="email" label="Email" />
  <BaseInput name="password" type="password" label="Password" />
  <BaseButton type="submit">Submit</BaseButton>
</BaseForm>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Form content |
| `onSubmit` | `(values) => void \| Promise<void>` | **Required** | Submit handler |
| `initialValues` | `Record<string, any>` | `{}` | Initial form values |
| `validate` | `(values) => FieldError \| Promise<FieldError>` | - | Validation function |
| `onChange` | `(values) => void` | - | Called when values change |
| `onError` | `(errors) => void` | - | Called when errors change |
| `validateOnBlur` | `boolean` | `true` | Validate fields on blur |
| `validateOnChange` | `boolean` | `false` | Validate fields on change |
| `disableOnSubmit` | `boolean` | `true` | Disable form during submission |
| `className` | `string` | - | Additional CSS classes |
| `id` | `string` | - | Form ID |
| `autoFocus` | `boolean` | `false` | Auto-focus first input |

## useFormContext Hook

Access form state and methods from child components:

```tsx
import { useFormContext } from '@/components/shared/base/BaseForm';

const FormField = ({ name }) => {
  const {
    values,           // Current form values
    errors,           // Validation errors
    touched,          // Touched fields
    isSubmitting,     // Submitting state
    isValidating,     // Validating state
    setFieldValue,    // Update field value
    setFieldError,    // Set field error
    setFieldTouched,  // Mark field as touched
    validateField,    // Validate single field
    validateForm,     // Validate entire form
    submitForm,       // Submit programmatically
  } = useFormContext();

  return (
    <input
      value={values[name] || ''}
      onChange={(e) => setFieldValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name, true)}
    />
  );
};
```

## Validation

### Synchronous Validation

```tsx
const validate = (values) => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
};

<BaseForm
  initialValues={{ email: '', password: '' }}
  validate={validate}
  onSubmit={handleSubmit}
>
  {/* form fields */}
</BaseForm>
```

### Asynchronous Validation

```tsx
const validateAsync = async (values) => {
  const errors = {};

  // Simulate API call
  const usernameAvailable = await api.checkUsername(values.username);
  if (!usernameAvailable) {
    errors.username = 'Username is already taken';
  }

  return errors;
};

<BaseForm
  validate={validateAsync}
  onSubmit={handleSubmit}
>
  {/* form fields */}
</BaseForm>
```

### Validation Modes

```tsx
// Validate on blur (default)
<BaseForm validateOnBlur onSubmit={handleSubmit}>

// Validate on change (real-time)
<BaseForm validateOnChange onSubmit={handleSubmit}>

// Validate on submit only
<BaseForm validateOnBlur={false} onSubmit={handleSubmit}>

// Both blur and change
<BaseForm validateOnBlur validateOnChange onSubmit={handleSubmit}>
```

## Form Field Integration

### Using with BaseInput

```tsx
import { useFormContext } from '@/components/shared/base/BaseForm';

const FormField = ({ name, label, type = 'text', ...props }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();

  return (
    <BaseInput
      name={name}
      label={label}
      type={type}
      value={values[name] || ''}
      onChange={(e) => setFieldValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name, true)}
      error={touched[name] ? errors[name] : undefined}
      fullWidth
      {...props}
    />
  );
};

// Usage
<BaseForm onSubmit={handleSubmit}>
  <FormField name="email" label="Email" type="email" required />
  <FormField name="password" label="Password" type="password" required />
</BaseForm>
```

## Examples

### Login Form

```tsx
interface LoginFormValues {
  email: string;
  password: string;
}

const validateLogin = (values: LoginFormValues) => {
  const errors: any = {};

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

const LoginForm = () => {
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await api.login(values);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <BaseForm
      initialValues={{ email: '', password: '' }}
      validate={validateLogin}
      onSubmit={handleSubmit}
    >
      <FormField
        name="email"
        type="email"
        label="Email"
        placeholder="email@example.com"
        required
      />
      <FormField
        name="password"
        type="password"
        label="Password"
        placeholder="Enter password"
        required
      />
      <BaseButton type="submit" variant="contained" fullWidth>
        Sign In
      </BaseButton>
    </BaseForm>
  );
};
```

### Registration Form

```tsx
interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bio: string;
}

const validateRegistration = (values: RegistrationFormValues) => {
  const errors: any = {};

  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

const RegistrationForm = () => {
  const handleSubmit = async (values: RegistrationFormValues) => {
    await api.register(values);
    navigate('/welcome');
  };

  return (
    <BaseForm
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        bio: '',
      }}
      validate={validateRegistration}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField name="firstName" label="First Name" required />
        <FormField name="lastName" label="Last Name" required />
      </div>

      <FormField
        name="email"
        type="email"
        label="Email"
        required
      />

      <FormField
        name="password"
        type="password"
        label="Password"
        required
      />

      <FormField
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        required
      />

      <FormField
        name="phone"
        type="tel"
        label="Phone Number"
      />

      <FormField
        name="bio"
        label="Bio"
        multiline
        rows={4}
        maxLength={200}
        showCount
      />

      <BaseButton type="submit" variant="contained" fullWidth>
        Create Account
      </BaseButton>
    </BaseForm>
  );
};
```

### Contact Form

```tsx
const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const validate = (values: any) => {
    const errors: any = {};

    if (!values.firstName) errors.firstName = 'Required';
    if (!values.lastName) errors.lastName = 'Required';

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Invalid email';
    }

    if (!values.message) {
      errors.message = 'Message is required';
    } else if (values.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    return errors;
  };

  const handleSubmit = async (values: any) => {
    await api.sendMessage(values);
    setSubmitted(true);
  };

  if (submitted) {
    return <div>Thank you! We'll be in touch soon.</div>;
  }

  return (
    <BaseForm
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField name="firstName" label="First Name" required />
        <FormField name="lastName" label="Last Name" required />
      </div>

      <FormField
        name="email"
        type="email"
        label="Email"
        required
      />

      <FormField
        name="phone"
        type="tel"
        label="Phone"
      />

      <FormField
        name="message"
        label="Message"
        multiline
        rows={5}
        maxLength={500}
        showCount
        required
      />

      <BaseButton type="submit" variant="contained" fullWidth>
        Send Message
      </BaseButton>
    </BaseForm>
  );
};
```

### Multi-Step Form

```tsx
const MultiStepForm = () => {
  const [step, setStep] = useState(1);

  const handleSubmit = async (values: any) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await api.submitForm(values);
    }
  };

  const validate = (values: any) => {
    const errors: any = {};

    // Step 1 validation
    if (step === 1) {
      if (!values.email) errors.email = 'Required';
      if (!values.password) errors.password = 'Required';
    }

    // Step 2 validation
    if (step === 2) {
      if (!values.firstName) errors.firstName = 'Required';
      if (!values.lastName) errors.lastName = 'Required';
    }

    // Step 3 validation
    if (step === 3) {
      if (!values.address) errors.address = 'Required';
      if (!values.city) errors.city = 'Required';
    }

    return errors;
  };

  return (
    <BaseForm
      initialValues={{
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
      }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {step === 1 && (
        <>
          <h3>Step 1: Account</h3>
          <FormField name="email" type="email" label="Email" required />
          <FormField name="password" type="password" label="Password" required />
        </>
      )}

      {step === 2 && (
        <>
          <h3>Step 2: Personal Info</h3>
          <FormField name="firstName" label="First Name" required />
          <FormField name="lastName" label="Last Name" required />
        </>
      )}

      {step === 3 && (
        <>
          <h3>Step 3: Address</h3>
          <FormField name="address" label="Address" required />
          <FormField name="city" label="City" required />
        </>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <BaseButton
            type="button"
            variant="outlined"
            onClick={() => setStep(step - 1)}
          >
            Back
          </BaseButton>
        )}
        <BaseButton type="submit" variant="contained" fullWidth>
          {step === 3 ? 'Submit' : 'Next'}
        </BaseButton>
      </div>
    </BaseForm>
  );
};
```

## Advanced Usage

### Programmatic Submit

```tsx
const FormWithExternalSubmit = () => {
  const formRef = useRef<any>();

  const handleExternalSubmit = () => {
    formRef.current?.submitForm();
  };

  return (
    <>
      <BaseForm ref={formRef} onSubmit={handleSubmit}>
        <FormField name="email" label="Email" />
      </BaseForm>

      <button onClick={handleExternalSubmit}>
        Submit from outside
      </button>
    </>
  );
};
```

### Conditional Fields

```tsx
const ConditionalForm = () => {
  const { values } = useFormContext();

  return (
    <BaseForm onSubmit={handleSubmit}>
      <FormField
        name="accountType"
        label="Account Type"
        type="select"
      />

      {values.accountType === 'business' && (
        <>
          <FormField name="companyName" label="Company Name" required />
          <FormField name="taxId" label="Tax ID" required />
        </>
      )}

      {values.accountType === 'personal' && (
        <FormField name="ssn" label="SSN" required />
      )}

      <BaseButton type="submit">Submit</BaseButton>
    </BaseForm>
  );
};
```

### Field Arrays (Dynamic Fields)

```tsx
const DynamicFieldsForm = () => {
  const { values, setFieldValue } = useFormContext();
  const emails = values.emails || [''];

  const addEmail = () => {
    setFieldValue('emails', [...emails, '']);
  };

  const removeEmail = (index: number) => {
    setFieldValue('emails', emails.filter((_, i) => i !== index));
  };

  return (
    <BaseForm
      initialValues={{ emails: [''] }}
      onSubmit={handleSubmit}
    >
      {emails.map((_, index) => (
        <div key={index} className="flex gap-2">
          <FormField
            name={`emails.${index}`}
            label={`Email ${index + 1}`}
            type="email"
          />
          {index > 0 && (
            <button type="button" onClick={() => removeEmail(index)}>
              Remove
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addEmail}>
        Add Email
      </button>

      <BaseButton type="submit">Submit</BaseButton>
    </BaseForm>
  );
};
```

## Best Practices

### ✅ DO

```tsx
// Provide clear validation messages
const validate = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = 'Email address is required';  // Clear message
  }
  return errors;
};

// Use TypeScript for type safety
interface FormValues {
  email: string;
  password: string;
}

const MyForm = () => {
  const handleSubmit = (values: FormValues) => {
    // Type-safe
  };
};

// Handle async errors
const handleSubmit = async (values) => {
  try {
    await api.submit(values);
  } catch (error) {
    setErrors({ _form: error.message });
  }
};

// Disable submit during submission
<BaseForm disableOnSubmit onSubmit={handleSubmit}>
```

### ❌ DON'T

```tsx
// Don't use vague error messages
errors.email = 'Invalid';  // ❌ Not helpful

// Don't forget error handling
const handleSubmit = async (values) => {
  await api.submit(values);  // ❌ No try/catch
};

// Don't validate on change unnecessarily
<BaseForm validateOnChange>  // ❌ Can be annoying for users

// Don't skip validation
<BaseForm onSubmit={handleSubmit}>  // ❌ Missing validate prop
```

## Accessibility

- Form uses semantic HTML `<form>` element
- Fieldset disabling during submission
- Proper error announcements with ARIA
- Keyboard navigation preserved
- Focus management on errors

## Performance Tips

1. **Memoize validation functions**:
```tsx
const validate = useMemo(() => (values) => {
  // validation logic
}, []);
```

2. **Debounce async validation**:
```tsx
const validateAsync = debounce(async (values) => {
  // API call
}, 300);
```

3. **Avoid unnecessary re-renders**:
```tsx
const FormField = React.memo(({ name, label }) => {
  // component logic
});
```

## Troubleshooting

### Form not submitting
Ensure validation passes:
```tsx
<BaseForm validate={validate} onSubmit={handleSubmit}>
```

### Values not updating
Check setFieldValue is called:
```tsx
onChange={(e) => setFieldValue(name, e.target.value)}
```

### Validation not triggering
Enable validation mode:
```tsx
<BaseForm validateOnBlur validateOnChange>
```

### Context error
Ensure component is inside BaseForm:
```tsx
<BaseForm>
  <YourComponent />  // Can use useFormContext here
</BaseForm>
```

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Component**: BaseForm  
**Dependencies**: React Context API
