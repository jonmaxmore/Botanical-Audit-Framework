/**
 * BaseForm Unit Tests
 * 
 * Comprehensive test suite for BaseForm component
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseForm, { useFormContext, FieldError } from '../BaseForm';

// Test form field component
const TestField: React.FC<{ name: string; label: string }> = ({ name, label }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        value={values[name] || ''}
        onChange={(e) => setFieldValue(name, e.target.value)}
        onBlur={() => setFieldTouched(name, true)}
        data-testid={name}
      />
      {touched[name] && errors[name] && (
        <span data-testid={`${name}-error`}>{errors[name]}</span>
      )}
    </div>
  );
};

describe('BaseForm', () => {
  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders form with children', () => {
      render(
        <BaseForm onSubmit={jest.fn()}>
          <div>Form Content</div>
        </BaseForm>
      );
      expect(screen.getByText('Form Content')).toBeInTheDocument();
    });

    it('renders form element', () => {
      const { container } = render(
        <BaseForm onSubmit={jest.fn()}>
          <div>Content</div>
        </BaseForm>
      );
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <BaseForm onSubmit={jest.fn()} className="custom-class">
          <div>Content</div>
        </BaseForm>
      );
      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-class');
    });

    it('applies custom id', () => {
      const { container } = render(
        <BaseForm onSubmit={jest.fn()} id="custom-form">
          <div>Content</div>
        </BaseForm>
      );
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('id', 'custom-form');
    });
  });

  // ============================================================================
  // INITIAL VALUES
  // ============================================================================

  describe('Initial Values', () => {
    it('sets initial values from props', () => {
      const initialValues = { email: 'test@example.com', name: 'John' };

      render(
        <BaseForm initialValues={initialValues} onSubmit={jest.fn()}>
          <TestField name="email" label="Email" />
          <TestField name="name" label="Name" />
        </BaseForm>
      );

      expect(screen.getByTestId('email')).toHaveValue('test@example.com');
      expect(screen.getByTestId('name')).toHaveValue('John');
    });

    it('handles empty initial values', () => {
      render(
        <BaseForm onSubmit={jest.fn()}>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      expect(screen.getByTestId('email')).toHaveValue('');
    });
  });

  // ============================================================================
  // FIELD VALUE MANAGEMENT
  // ============================================================================

  describe('Field Value Management', () => {
    it('updates field value on change', () => {
      render(
        <BaseForm onSubmit={jest.fn()}>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.change(input, { target: { value: 'new@example.com' } });

      expect(input).toHaveValue('new@example.com');
    });

    it('calls onChange when field value changes', () => {
      const onChange = jest.fn();

      render(
        <BaseForm onSubmit={jest.fn()} onChange={onChange}>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.change(input, { target: { value: 'test@example.com' } });

      expect(onChange).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('handles multiple field updates', () => {
      render(
        <BaseForm onSubmit={jest.fn()}>
          <TestField name="email" label="Email" />
          <TestField name="name" label="Name" />
        </BaseForm>
      );

      fireEvent.change(screen.getByTestId('email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'John Doe' },
      });

      expect(screen.getByTestId('email')).toHaveValue('test@example.com');
      expect(screen.getByTestId('name')).toHaveValue('John Doe');
    });
  });

  // ============================================================================
  // VALIDATION - ON BLUR
  // ============================================================================

  describe('Validation on Blur', () => {
    const validate = (values: any): FieldError => {
      const errors: FieldError = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Invalid email';
      }
      return errors;
    };

    it('validates field on blur when validateOnBlur is true', async () => {
      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnBlur>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      });
    });

    it('shows error after blur with invalid value', async () => {
      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnBlur>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
      });
    });

    it('clears error after valid input', async () => {
      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnBlur>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');

      // Invalid
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });

      // Valid
      fireEvent.change(input, { target: { value: 'valid@example.com' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // VALIDATION - ON CHANGE
  // ============================================================================

  describe('Validation on Change', () => {
    const validate = (values: any): FieldError => {
      const errors: FieldError = {};
      if (!values.email) {
        errors.email = 'Email is required';
      }
      return errors;
    };

    it('validates on change when validateOnChange is true', async () => {
      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnChange>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.blur(input); // Touch field first

      fireEvent.change(input, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
      });
    });

    it('does not validate on change when validateOnChange is false', async () => {
      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnChange={false}>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.change(input, { target: { value: '' } });

      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  describe('Form Submission', () => {
    it('calls onSubmit when form is submitted', async () => {
      const onSubmit = jest.fn();

      render(
        <BaseForm onSubmit={onSubmit} initialValues={{ email: 'test@example.com' }}>
          <TestField name="email" label="Email" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
    });

    it('prevents default form submission', async () => {
      const onSubmit = jest.fn();
      const preventDefault = jest.fn();

      render(
        <BaseForm onSubmit={onSubmit}>
          <button type="submit">Submit</button>
        </BaseForm>
      );

      const form = screen.getByRole('button').closest('form')!;
      fireEvent.submit(form, { preventDefault } as any);

      expect(preventDefault).toHaveBeenCalled();
    });

    it('validates form before submission', async () => {
      const onSubmit = jest.fn();
      const validate = (values: any): FieldError => {
        const errors: FieldError = {};
        if (!values.email) errors.email = 'Required';
        return errors;
      };

      render(
        <BaseForm onSubmit={onSubmit} validate={validate}>
          <TestField name="email" label="Email" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Required');
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits form when validation passes', async () => {
      const onSubmit = jest.fn();
      const validate = (values: any): FieldError => {
        const errors: FieldError = {};
        if (!values.email) errors.email = 'Required';
        return errors;
      };

      render(
        <BaseForm onSubmit={onSubmit} validate={validate}>
          <TestField name="email" label="Email" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
    });

    it('marks all fields as touched on submission', async () => {
      const validate = (values: any): FieldError => {
        const errors: FieldError = {};
        if (!values.email) errors.email = 'Required';
        if (!values.name) errors.name = 'Required';
        return errors;
      };

      render(
        <BaseForm onSubmit={jest.fn()} validate={validate}>
          <TestField name="email" label="Email" />
          <TestField name="name" label="Name" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // ASYNC VALIDATION
  // ============================================================================

  describe('Async Validation', () => {
    it('handles async validation', async () => {
      const validate = async (values: any): Promise<FieldError> => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const errors: FieldError = {};
        if (values.username === 'taken') {
          errors.username = 'Username is taken';
        }
        return errors;
      };

      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnBlur>
          <TestField name="username" label="Username" />
        </BaseForm>
      );

      const input = screen.getByTestId('username');
      fireEvent.change(input, { target: { value: 'taken' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByTestId('username-error')).toHaveTextContent('Username is taken');
      });
    });

    it('handles async submit', async () => {
      const onSubmit = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      render(
        <BaseForm onSubmit={onSubmit} initialValues={{ email: 'test@example.com' }}>
          <TestField name="email" label="Email" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  // ============================================================================
  // SUBMITTING STATE
  // ============================================================================

  describe('Submitting State', () => {
    it('disables fieldset during submission when disableOnSubmit is true', async () => {
      const onSubmit = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const TestForm = () => {
        const { isSubmitting } = useFormContext();
        return (
          <div>
            <TestField name="email" label="Email" />
            <div data-testid="submitting-state">{isSubmitting ? 'true' : 'false'}</div>
            <button type="submit">Submit</button>
          </div>
        );
      };

      render(
        <BaseForm onSubmit={onSubmit} disableOnSubmit initialValues={{ email: 'test@example.com' }}>
          <TestForm />
        </BaseForm>
      );

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      // Should be submitting
      await waitFor(() => {
        expect(screen.getByTestId('submitting-state')).toHaveTextContent('true');
      });

      // Should finish submitting
      await waitFor(() => {
        expect(screen.getByTestId('submitting-state')).toHaveTextContent('false');
      });
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('calls onError when errors change', async () => {
      const onError = jest.fn();
      const validate = (values: any): FieldError => {
        const errors: FieldError = {};
        if (!values.email) errors.email = 'Required';
        return errors;
      };

      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} onError={onError} validateOnBlur>
          <TestField name="email" label="Email" />
        </BaseForm>
      );

      const input = screen.getByTestId('email');
      fireEvent.blur(input);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({ email: 'Required' });
      });
    });
  });

  // ============================================================================
  // FORM CONTEXT
  // ============================================================================

  describe('Form Context', () => {
    it('throws error when useFormContext used outside BaseForm', () => {
      const TestComponent = () => {
        useFormContext();
        return null;
      };

      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useFormContext must be used within a BaseForm');

      console.error = originalError;
    });

    it('provides form context to children', () => {
      const TestComponent = () => {
        const context = useFormContext();
        return <div data-testid="has-context">{context ? 'true' : 'false'}</div>;
      };

      render(
        <BaseForm onSubmit={jest.fn()}>
          <TestComponent />
        </BaseForm>
      );

      expect(screen.getByTestId('has-context')).toHaveTextContent('true');
    });
  });

  // ============================================================================
  // COMPLEX SCENARIOS
  // ============================================================================

  describe('Complex Scenarios', () => {
    it('handles multiple fields with complex validation', async () => {
      const validate = (values: any): FieldError => {
        const errors: FieldError = {};

        if (!values.email) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = 'Invalid email';
        }

        if (!values.password) {
          errors.password = 'Password is required';
        } else if (values.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }

        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
      };

      render(
        <BaseForm onSubmit={jest.fn()} validate={validate} validateOnBlur>
          <TestField name="email" label="Email" />
          <TestField name="password" label="Password" />
          <TestField name="confirmPassword" label="Confirm Password" />
          <button type="submit">Submit</button>
        </BaseForm>
      );

      // Invalid email
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'invalid' } });
      fireEvent.blur(screen.getByTestId('email'));

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
      });

      // Short password
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'short' } });
      fireEvent.blur(screen.getByTestId('password'));

      await waitFor(() => {
        expect(screen.getByTestId('password-error')).toHaveTextContent(
          'Password must be at least 8 characters'
        );
      });

      // Mismatched passwords
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByTestId('confirmPassword'), {
        target: { value: 'different' },
      });
      fireEvent.blur(screen.getByTestId('confirmPassword'));

      await waitFor(() => {
        expect(screen.getByTestId('confirmPassword-error')).toHaveTextContent(
          'Passwords do not match'
        );
      });
    });
  });
});
