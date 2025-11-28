/**
 * BaseForm Component
 * 
 * A comprehensive form wrapper with validation, error handling, and submit management.
 * Works seamlessly with BaseInput, BaseButton, and other form components.
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { FormEvent, ReactNode, useState, useCallback } from 'react';

// Form field error type
export interface FieldError {
  [fieldName: string]: string | undefined;
}

// Form validation function type
export type ValidationFunction<T> = (values: T) => FieldError | Promise<FieldError>;

// Form submit handler type
export type SubmitHandler<T> = (values: T) => void | Promise<void>;

export interface BaseFormProps<T = Record<string, any>> {
  /** Form content */
  children: ReactNode;
  /** Initial form values */
  initialValues?: T;
  /** Validation function (sync or async) */
  validate?: ValidationFunction<T>;
  /** Form submit handler */
  onSubmit: SubmitHandler<T>;
  /** Called when form values change */
  onChange?: (values: T) => void;
  /** Called when validation errors change */
  onError?: (errors: FieldError) => void;
  /** Show validation errors on blur (default: true) */
  validateOnBlur?: boolean;
  /** Show validation errors on change (default: false) */
  validateOnChange?: boolean;
  /** Disable form while submitting */
  disableOnSubmit?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Form ID */
  id?: string;
  /** Auto-focus first input */
  autoFocus?: boolean;
}

/**
 * Form context for child components
 */
interface FormContextValue<T = any> {
  values: T;
  errors: FieldError;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string | undefined) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validateField: (field: string) => Promise<void>;
  validateForm: () => Promise<FieldError>;
  submitForm: () => Promise<void>;
}

export const FormContext = React.createContext<FormContextValue | undefined>(undefined);

/**
 * Hook to access form context
 */
export const useFormContext = <T = any,>(): FormContextValue<T> => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a BaseForm');
  }
  return context as FormContextValue<T>;
};

/**
 * BaseForm Component
 * 
 * Provides form state management, validation, and submission handling
 */
function BaseFormInner<T extends Record<string, any> = Record<string, any>>({
  children,
  initialValues = {} as T,
  validate,
  onSubmit,
  onChange,
  onError,
  validateOnBlur = true,
  validateOnChange = false,
  disableOnSubmit = true,
  className = '',
  id,
  autoFocus: _autoFocus = false,
}: BaseFormProps<T>) {
  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Set a single field error
   */
  const setFieldError = useCallback((field: string, error: string | undefined) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      onError?.(newErrors);
      return newErrors;
    });
  }, [onError]);

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (field: string) => {
    if (!validate) return;

    setIsValidating(true);
    try {
      const validationErrors = await validate(values);
      setFieldError(field, validationErrors[field]);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, [validate, values, setFieldError]);

  /**
   * Set a single field value
   */
  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => {
      const newValues = { ...prev, [field]: value };
      onChange?.(newValues);
      return newValues;
    });

    // Validate on change if enabled
    if (validateOnChange && validate) {
      validateField(field);
    }
  }, [onChange, validate, validateOnChange, validateField]);

  /**
   * Set a single field touched state
   */
  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));

    // Validate on blur if enabled
    if (isTouched && validateOnBlur && validate) {
      validateField(field);
    }
  }, [validate, validateOnBlur, validateField]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (): Promise<FieldError> => {
    if (!validate) return {};

    setIsValidating(true);
    try {
      const validationErrors = await validate(values);
      setErrors(validationErrors);
      onError?.(validationErrors);
      return validationErrors;
    } catch (error) {
      console.error('Validation error:', error);
      return {};
    } finally {
      setIsValidating(false);
    }
  }, [validate, values, onError]);

  /**
   * Submit form programmatically
   */
  const submitForm = useCallback(async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate form
    const validationErrors = await validateForm();
    const hasErrors = Object.keys(validationErrors).length > 0;

    if (hasErrors) {
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Submit error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm();
  };

  // Form context value
  const contextValue: FormContextValue<T> = {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    submitForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        id={id}
        onSubmit={handleSubmit}
        className={`space-y-4 ${className}`}
        noValidate
        autoComplete="on"
      >
        <fieldset disabled={disableOnSubmit && isSubmitting}>
          {children}
        </fieldset>
      </form>
    </FormContext.Provider>
  );
}

// Export with generic type support
export const BaseForm = BaseFormInner as <T extends Record<string, any> = Record<string, any>>(
  props: BaseFormProps<T>
) => JSX.Element;

export default BaseForm;
