/**
 * Base Wizard Component
 * 
 * Reusable multi-step wizard/stepper for complex forms and workflows.
 * Consolidates logic from:
 * - ApplicationWizard (farmer-portal)
 * - InspectionWizard (admin-portal)
 * - CertificateWizard (certificate-portal)
 * 
 * Features:
 * - Multi-step navigation with progress tracking
 * - Step validation before proceeding
 * - Back/Next/Submit navigation
 * - Step completion indicators
 * - Optional steps support
 * - Save draft functionality
 * - Step-specific actions
 * - Responsive design
 * - Custom step icons
 * - Progress percentage
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  component: ReactNode;
  optional?: boolean;
  
  // Validation
  validate?: () => Promise<boolean> | boolean;
  onEnter?: () => void | Promise<void>;
  onLeave?: () => void | Promise<void>;
  
  // Status
  status?: StepStatus;
  error?: string;
}

export interface WizardData {
  [key: string]: any;
}

export interface BaseWizardProps {
  // Steps configuration
  steps: WizardStep[];
  
  // Data management
  initialData?: WizardData;
  onDataChange?: (data: WizardData) => void;
  
  // Navigation
  onComplete: (data: WizardData) => void | Promise<void>;
  onCancel?: () => void;
  onSaveDraft?: (data: WizardData) => void | Promise<void>;
  
  // Configuration
  allowSkipOptional?: boolean;
  showProgressBar?: boolean;
  showStepNumbers?: boolean;
  persistDraft?: boolean; // Auto-save to localStorage
  draftKey?: string; // Key for localStorage
  
  // Labels
  nextLabel?: string;
  backLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
  saveDraftLabel?: string;
  skipLabel?: string;
  
  // State
  loading?: boolean;
  error?: string;
  
  // Customization
  className?: string;
  showStepList?: boolean; // Show vertical step list on the side
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseWizard({
  steps,
  initialData = {},
  onDataChange,
  onComplete,
  onCancel,
  onSaveDraft,
  allowSkipOptional = true,
  showProgressBar = true,
  showStepNumbers = true,
  persistDraft = false,
  draftKey = 'wizard-draft',
  nextLabel = 'ถัดไป',
  backLabel = 'ย้อนกลับ',
  submitLabel = 'ส่งข้อมูล',
  cancelLabel = 'ยกเลิก',
  saveDraftLabel = 'บันทึกแบบร่าง',
  skipLabel = 'ข้าม',
  loading = false,
  error,
  className = '',
  showStepList = true
}: BaseWizardProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>(initialData);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(
    steps.reduce((acc, step) => ({ ...acc, [step.id]: 'pending' }), {})
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // ============================================================================
  // LOAD DRAFT FROM LOCALSTORAGE
  // ============================================================================

  useEffect(() => {
    if (persistDraft && draftKey) {
      try {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setWizardData(parsed.data || {});
          setCurrentStepIndex(parsed.currentStep || 0);
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    }
  }, [persistDraft, draftKey]);

  // ============================================================================
  // AUTO-SAVE DRAFT
  // ============================================================================

  useEffect(() => {
    if (persistDraft && draftKey) {
      const draft = {
        data: wizardData,
        currentStep: currentStepIndex,
        timestamp: Date.now()
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [wizardData, currentStepIndex, persistDraft, draftKey]);

  // ============================================================================
  // STEP STATUS MANAGEMENT
  // ============================================================================

  useEffect(() => {
    setStepStatuses(prev => ({
      ...prev,
      [currentStep.id]: 'current'
    }));
  }, [currentStepIndex, currentStep.id]);

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  const updateData = useCallback((key: string, value: any) => {
    setWizardData(prev => {
      const updated = { ...prev, [key]: value };
      if (onDataChange) {
        onDataChange(updated);
      }
      return updated;
    });
  }, [onDataChange]);

  const updateMultipleData = useCallback((data: Partial<WizardData>) => {
    setWizardData(prev => {
      const updated = { ...prev, ...data };
      if (onDataChange) {
        onDataChange(updated);
      }
      return updated;
    });
  }, [onDataChange]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateCurrentStep = async (): Promise<boolean> => {
    if (!currentStep.validate) return true;

    setIsValidating(true);
    setValidationErrors(prev => ({ ...prev, [currentStep.id]: '' }));

    try {
      const isValid = await currentStep.validate();
      
      if (!isValid) {
        setStepStatuses(prev => ({ ...prev, [currentStep.id]: 'error' }));
        setValidationErrors(prev => ({ 
          ...prev, 
          [currentStep.id]: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง' 
        }));
      } else {
        setStepStatuses(prev => ({ ...prev, [currentStep.id]: 'completed' }));
        setValidationErrors(prev => ({ ...prev, [currentStep.id]: '' }));
      }

      return isValid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล';
      setStepStatuses(prev => ({ ...prev, [currentStep.id]: 'error' }));
      setValidationErrors(prev => ({ ...prev, [currentStep.id]: errorMessage }));
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  const handleNext = async () => {
    // Execute onLeave hook
    if (currentStep.onLeave) {
      await currentStep.onLeave();
    }

    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid && !currentStep.optional) {
      return;
    }

    // Move to next step
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Execute onEnter hook for next step
      if (steps[nextIndex].onEnter) {
        await steps[nextIndex].onEnter();
      }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = async () => {
    // Execute onLeave hook
    if (currentStep.onLeave) {
      await currentStep.onLeave();
    }

    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);

      // Execute onEnter hook for previous step
      if (steps[prevIndex].onEnter) {
        await steps[prevIndex].onEnter();
      }

      // Reset error status
      setStepStatuses(prev => ({ 
        ...prev, 
        [currentStep.id]: prev[currentStep.id] === 'error' ? 'pending' : prev[currentStep.id]
      }));

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = async () => {
    if (currentStep.optional && allowSkipOptional) {
      // Mark as completed (skipped)
      setStepStatuses(prev => ({ ...prev, [currentStep.id]: 'completed' }));
      
      // Execute onLeave hook
      if (currentStep.onLeave) {
        await currentStep.onLeave();
      }

      // Move to next step
      if (!isLastStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);

        // Execute onEnter hook
        if (steps[nextIndex].onEnter) {
          await steps[nextIndex].onEnter();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async () => {
    // Validate final step
    const isValid = await validateCurrentStep();
    if (!isValid && !currentStep.optional) {
      return;
    }

    // Execute onLeave hook
    if (currentStep.onLeave) {
      await currentStep.onLeave();
    }

    // Submit
    await onComplete(wizardData);

    // Clear draft if persisting
    if (persistDraft && draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft(wizardData);
    } catch (err) {
      console.error('Failed to save draft:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }

    // Clear draft if persisting
    if (persistDraft && draftKey) {
      localStorage.removeItem(draftKey);
    }
  };

  const goToStep = async (index: number) => {
    if (index === currentStepIndex) return;

    // Execute onLeave hook for current step
    if (currentStep.onLeave) {
      await currentStep.onLeave();
    }

    setCurrentStepIndex(index);

    // Execute onEnter hook for target step
    if (steps[index].onEnter) {
      await steps[index].onEnter();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // PROGRESS CALCULATION
  // ============================================================================

  const completedSteps = Object.values(stepStatuses).filter(s => s === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // ============================================================================
  // RENDER STEP STATUS ICON
  // ============================================================================

  const renderStepIcon = (step: WizardStep, index: number) => {
    const status = stepStatuses[step.id];

    if (status === 'completed') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
          <Check className="w-6 h-6 text-white" />
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
      );
    }

    if (status === 'current') {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full">
          {step.icon || (
            <span className="text-white font-semibold">{showStepNumbers ? index + 1 : '•'}</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
        <span className="text-gray-600 font-semibold">{showStepNumbers ? index + 1 : '•'}</span>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Step List Sidebar */}
      {showStepList && (
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            {steps.map((step, index) => {
              const status = stepStatuses[step.id];
              const isCurrent = index === currentStepIndex;
              const canNavigate = status === 'completed' || index < currentStepIndex;

              return (
                <div key={step.id}>
                  <button
                    onClick={() => canNavigate && goToStep(index)}
                    disabled={!canNavigate}
                    className={`
                      w-full flex items-start gap-3 p-4 rounded-lg text-left transition-all
                      ${isCurrent ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200'}
                      ${canNavigate ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'}
                    `}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {renderStepIcon(step, index)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-semibold ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                          {step.title}
                        </h3>
                        {step.optional && (
                          <span className="text-xs text-gray-500">(ไม่บังคับ)</span>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                      )}
                      {status === 'error' && validationErrors[step.id] && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors[step.id]}</p>
                      )}
                    </div>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="ml-9 h-6 w-0.5 bg-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                ความคืบหน้า: {completedSteps} / {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Mobile Step Indicator */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              {renderStepIcon(currentStep, currentStepIndex)}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{currentStep.title}</h3>
                {currentStep.description && (
                  <p className="text-xs text-gray-600">{currentStep.description}</p>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Desktop Step Header */}
          <div className="hidden lg:block mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              {renderStepIcon(currentStep, currentStepIndex)}
              <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
              {currentStep.optional && (
                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                  ไม่บังคับ
                </span>
              )}
            </div>
            {currentStep.description && (
              <p className="text-gray-600 ml-13">{currentStep.description}</p>
            )}
          </div>

          {/* Step Component */}
          <div className="min-h-[400px]">
            {React.cloneElement(currentStep.component as React.ReactElement, {
              data: wizardData,
              updateData,
              updateMultipleData
            })}
          </div>

          {/* Validation Error */}
          {validationErrors[currentStep.id] && (
            <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{validationErrors[currentStep.id]}</p>
            </div>
          )}

          {/* Global Error */}
          {error && (
            <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Side Actions */}
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <button
                onClick={handleBack}
                disabled={loading || isValidating}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {backLabel}
              </button>
            )}

            {onCancel && (
              <button
                onClick={handleCancel}
                disabled={loading || isValidating}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <button
                onClick={handleSaveDraft}
                disabled={loading || isValidating || isSaving}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {saveDraftLabel}
                  </>
                )}
              </button>
            )}

            {currentStep.optional && allowSkipOptional && !isLastStep && (
              <button
                onClick={handleSkip}
                disabled={loading || isValidating}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {skipLabel}
              </button>
            )}

            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={loading || isValidating}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || isValidating}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {submitLabel}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY HOOK FOR WIZARD STEPS
// ============================================================================

/**
 * Custom hook to create wizard steps with common patterns
 */
export const useWizardStep = (
  stepId: string,
  initialData: any = {}
) => {
  const [data, setData] = useState(initialData);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: string, validator: (value: any) => string | null) => {
    const error = validator(data[field]);
    setErrors(prev => ({ ...prev, [field]: error || '' }));
    return !error;
  };

  const validateAll = (validators: Record<string, (value: any) => string | null>): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;

    Object.entries(validators).forEach(([field, validator]) => {
      const error = validator(data[field]);
      if (error) {
        newErrors[field] = error;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(valid);
    return valid;
  };

  return {
    data,
    setData,
    updateField,
    isValid,
    setIsValid,
    errors,
    setErrors,
    validateField,
    validateAll
  };
};
