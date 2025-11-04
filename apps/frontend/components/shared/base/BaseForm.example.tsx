/**
 * BaseForm Examples
 * 
 * Comprehensive showcase of BaseForm with real-world scenarios
 * Demonstrates integration with BaseInput, BaseButton, and BaseCard
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseForm, { useFormContext, FieldError } from './BaseForm';
import BaseInput from './BaseInput';
import BaseButton from './BaseButton';
import BaseCard from './BaseCard';

// ============================================================================
// SVG ICONS
// ============================================================================

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

// ============================================================================
// FORM FIELD COMPONENT (Connects BaseInput with Form Context)
// ============================================================================

interface FormFieldProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  multiline = false,
  rows,
  maxLength,
  showCount,
  startIcon,
  endIcon,
  disabled,
}) => {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();

  const value = values[name] || '';
  const error = touched[name] ? errors[name] : undefined;

  return (
    <BaseInput
      type={type}
      label={label}
      name={name}
      value={value}
      onChange={(e) => setFieldValue(name, e.target.value)}
      onBlur={() => setFieldTouched(name, true)}
      error={error}
      placeholder={placeholder}
      required={required}
      multiline={multiline}
      rows={rows}
      maxLength={maxLength}
      showCount={showCount}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      fullWidth
    />
  );
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

interface LoginFormValues {
  email: string;
  password: string;
}

const validateLoginForm = (values: LoginFormValues): FieldError => {
  const errors: FieldError = {};

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

interface RegistrationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  bio: string;
}

const validateRegistrationForm = (values: RegistrationFormValues): FieldError => {
  const errors: FieldError = {};

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

  if (values.phone && !/^\+?[\d\s-()]+$/.test(values.phone)) {
    errors.phone = 'Invalid phone number';
  }

  return errors;
};

interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const validateContactForm = (values: ContactFormValues): FieldError => {
  const errors: FieldError = {};

  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  if (!values.message) {
    errors.message = 'Message is required';
  } else if (values.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  return errors;
};

// ============================================================================
// EXAMPLE COMPONENT
// ============================================================================

const BaseFormExamples: React.FC = () => {
  const [loginResult, setLoginResult] = useState<string>('');
  const [registrationResult, setRegistrationResult] = useState<string>('');
  const [contactResult, setContactResult] = useState<string>('');

  // Login form
  const handleLogin = async (values: LoginFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoginResult(`Logged in with: ${values.email}`);
  };

  // Registration form
  const handleRegistration = async (values: RegistrationFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRegistrationResult(`Account created for: ${values.email}`);
  };

  // Contact form
  const handleContact = async (values: ContactFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setContactResult(`Message sent from: ${values.email}`);
  };

  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">BaseForm Examples</h1>

      {/* Basic Login Form */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Login Form</h2>
        <BaseCard variant="outlined" className="max-w-md">
          <BaseForm
            initialValues={{ email: '', password: '' }}
            validate={validateLoginForm}
            onSubmit={handleLogin}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Sign In</h3>

              <FormField
                name="email"
                type="email"
                label="Email"
                placeholder="email@example.com"
                required
                startIcon={<EmailIcon />}
              />

              <FormField
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                startIcon={<LockIcon />}
              />

              <BaseButton type="submit" variant="contained" color="primary" fullWidth>
                Sign In
              </BaseButton>

              {loginResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  {loginResult}
                </div>
              )}
            </div>
          </BaseForm>
        </BaseCard>
      </section>

      {/* Registration Form */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Registration Form</h2>
        <BaseCard variant="outlined">
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
            validate={validateRegistrationForm}
            onSubmit={handleRegistration}
            validateOnBlur
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Create Account</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  required
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  required
                />
              </div>

              <FormField
                name="email"
                type="email"
                label="Email Address"
                placeholder="email@example.com"
                required
                startIcon={<EmailIcon />}
              />

              <FormField
                name="password"
                type="password"
                label="Password"
                placeholder="At least 8 characters"
                required
                startIcon={<LockIcon />}
              />

              <FormField
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Re-enter password"
                required
                startIcon={<LockIcon />}
              />

              <FormField
                name="phone"
                type="tel"
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                startIcon={<PhoneIcon />}
              />

              <FormField
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself (optional)"
                multiline
                rows={4}
                maxLength={200}
                showCount
              />

              <div className="flex gap-3">
                <BaseButton type="button" variant="outlined" color="secondary" fullWidth>
                  Cancel
                </BaseButton>
                <BaseButton type="submit" variant="contained" color="primary" fullWidth>
                  Create Account
                </BaseButton>
              </div>

              {registrationResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  {registrationResult}
                </div>
              )}
            </div>
          </BaseForm>
        </BaseCard>
      </section>

      {/* Contact Form */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Form</h2>
        <BaseCard variant="outlined">
          <BaseForm
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              message: '',
            }}
            validate={validateContactForm}
            onSubmit={handleContact}
          >
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  required
                />
                <FormField
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  required
                />
              </div>

              <FormField
                name="email"
                type="email"
                label="Email"
                placeholder="email@example.com"
                required
                startIcon={<EmailIcon />}
              />

              <FormField
                name="phone"
                type="tel"
                label="Phone"
                placeholder="+1 (555) 000-0000"
                startIcon={<PhoneIcon />}
              />

              <FormField
                name="message"
                label="Message"
                placeholder="How can we help you?"
                required
                multiline
                rows={5}
                maxLength={500}
                showCount
              />

              <BaseButton type="submit" variant="contained" color="primary" fullWidth>
                Send Message
              </BaseButton>

              {contactResult && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  {contactResult}
                </div>
              )}
            </div>
          </BaseForm>
        </BaseCard>
      </section>

      {/* Form with Validation on Change */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Real-time Validation (Validate on Change)
        </h2>
        <BaseCard variant="outlined" className="max-w-md">
          <BaseForm
            initialValues={{ email: '', password: '' }}
            validate={validateLoginForm}
            onSubmit={handleLogin}
            validateOnChange
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This form validates as you type (validateOnChange=true)
              </p>

              <FormField
                name="email"
                type="email"
                label="Email"
                placeholder="email@example.com"
                required
                startIcon={<EmailIcon />}
              />

              <FormField
                name="password"
                type="password"
                label="Password"
                placeholder="At least 8 characters"
                required
                startIcon={<LockIcon />}
              />

              <BaseButton type="submit" variant="contained" color="primary" fullWidth>
                Submit
              </BaseButton>
            </div>
          </BaseForm>
        </BaseCard>
      </section>

      {/* Async Validation Example */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Async Validation Example
        </h2>
        <BaseCard variant="outlined" className="max-w-md">
          <BaseForm
            initialValues={{ username: '', email: '' }}
            validate={async (values) => {
              await new Promise((resolve) => setTimeout(resolve, 500));
              const errors: FieldError = {};

              if (!values.username) {
                errors.username = 'Username is required';
              } else if (values.username === 'admin') {
                errors.username = 'Username is already taken';
              }

              if (!values.email) {
                errors.email = 'Email is required';
              }

              return errors;
            }}
            onSubmit={async (values) => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              alert(`Form submitted: ${JSON.stringify(values, null, 2)}`);
            }}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Try entering "admin" as username to see async validation error
              </p>

              <FormField
                name="username"
                label="Username"
                placeholder="Choose a username"
                required
                startIcon={<UserIcon />}
              />

              <FormField
                name="email"
                type="email"
                label="Email"
                placeholder="email@example.com"
                required
                startIcon={<EmailIcon />}
              />

              <BaseButton type="submit" variant="contained" color="primary" fullWidth>
                Check Availability
              </BaseButton>
            </div>
          </BaseForm>
        </BaseCard>
      </section>
    </div>
  );
};

export default BaseFormExamples;
