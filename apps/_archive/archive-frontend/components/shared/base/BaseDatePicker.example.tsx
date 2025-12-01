/**
 * BaseDatePicker Component Examples
 * 
 * Demonstrates various use cases:
 * 1. Simple Single Date Selection
 * 2. Date Range Selection
 * 3. With Min/Max Date Constraints
 * 4. Disabled Dates (Weekends & Holidays)
 * 5. Custom Date Formats
 * 6. With Form Integration
 * 7. Validation & Error States
 * 8. Complex Workflow (Inspection Scheduling)
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';
import BaseInput from './BaseInput';

// ============================================================================
// Example 1: Simple Single Date Selection
// ============================================================================

export function SimpleSingleDateExample() {
  const [date, setDate] = useState<Date | null>(null);

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Simple Single Date Selection</h3>
      
      <BaseDatePicker
        label="Select a Date"
        value={date}
        onChange={handleChange}
        placeholder="Choose a date..."
        clearable
        showTodayButton
      />

      {date && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            Selected: <strong>{date.toLocaleDateString()}</strong>
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Basic date selection with clear and today buttons</p>
        <p><strong>Features:</strong> Clearable, Today button, Simple selection</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 2: Date Range Selection
// ============================================================================

export function DateRangeExample() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Date Range Selection</h3>
      
      <BaseDatePicker
        label="Select Date Range"
        range
        startDate={startDate}
        endDate={endDate}
        onRangeChange={handleRangeChange}
        placeholder="Select start and end dates..."
        clearable
        showTodayButton
      />

      {startDate && endDate && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Start:</strong> {startDate.toLocaleDateString()}
          </p>
          <p className="text-sm text-blue-800 mb-2">
            <strong>End:</strong> {endDate.toLocaleDateString()}
          </p>
          <p className="text-sm font-semibold text-blue-900">
            Total Days: {getDayCount()}
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Select date ranges for reports, bookings, or audits</p>
        <p><strong>Features:</strong> Range selection, Day count calculation</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 3: With Min/Max Date Constraints
// ============================================================================

export function MinMaxDateExample() {
  const [date, setDate] = useState<Date | null>(null);
  
  // Set constraints
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 30); // 30 days ago
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90); // 90 days from now

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">With Min/Max Date Constraints</h3>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Constraint:</strong> You can only select dates between {minDate.toLocaleDateString()} and {maxDate.toLocaleDateString()}
        </p>
      </div>

      <BaseDatePicker
        label="Inspection Date"
        value={date}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholder="Select inspection date..."
        helperText="Must be within 30 days ago to 90 days from today"
        clearable
        showTodayButton
      />

      {date && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            Selected: <strong>{date.toLocaleDateString()}</strong>
          </p>
          <p className="text-xs text-green-700 mt-1">
            {date < today ? 'Past date' : date.toDateString() === today.toDateString() ? 'Today' : 'Future date'}
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Restrict date selection to valid ranges (inspections, bookings)</p>
        <p><strong>Features:</strong> Min/Max constraints, Date validation</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 4: Disabled Dates (Weekends & Holidays)
// ============================================================================

export function DisabledDatesExample() {
  const [date, setDate] = useState<Date | null>(null);

  // Define holidays (example: Thai holidays in 2025)
  const holidays = [
    new Date(2025, 0, 1),  // New Year
    new Date(2025, 3, 13), // Songkran
    new Date(2025, 3, 14), // Songkran
    new Date(2025, 3, 15), // Songkran
    new Date(2025, 4, 1),  // Labor Day
    new Date(2025, 11, 25), // Christmas
  ];

  // Disable weekends and holidays
  const isDateDisabled = (checkDate: Date) => {
    // Check if weekend
    const day = checkDate.getDay();
    if (day === 0 || day === 6) return true;

    // Check if holiday
    return holidays.some(holiday => 
      holiday.getFullYear() === checkDate.getFullYear() &&
      holiday.getMonth() === checkDate.getMonth() &&
      holiday.getDate() === checkDate.getDate()
    );
  };

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Disabled Dates (Weekends & Holidays)</h3>
      
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-800 mb-2">
          <strong>Disabled:</strong> Weekends and public holidays
        </p>
        <p className="text-xs text-red-700">
          Holidays: New Year, Songkran (Apr 13-15), Labor Day, Christmas
        </p>
      </div>

      <BaseDatePicker
        label="Office Visit Date"
        value={date}
        onChange={handleChange}
        disabledDates={isDateDisabled}
        placeholder="Select a working day..."
        helperText="Only weekdays (Mon-Fri) excluding holidays"
        clearable
        showTodayButton
      />

      {date && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            Selected: <strong>{date.toLocaleDateString()}</strong>
          </p>
          <p className="text-xs text-green-700 mt-1">
            Day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]}
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Schedule appointments only on working days</p>
        <p><strong>Features:</strong> Custom disabled logic, Weekend blocking, Holiday blocking</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 5: Custom Date Formats
// ============================================================================

export function CustomFormatExample() {
  const [dateUS, setDateUS] = useState<Date | null>(null);
  const [dateEU, setDateEU] = useState<Date | null>(null);
  const [dateTH, setDateTH] = useState<Date | null>(null);
  const [dateISO, setDateISO] = useState<Date | null>(null);

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Custom Date Formats</h3>
      
      <div className="space-y-4">
        {/* US Format */}
        <div>
          <BaseDatePicker
            label="US Format (MM/DD/YYYY)"
            value={dateUS}
            onChange={setDateUS}
            dateFormat="MM/DD/YYYY"
            placeholder="MM/DD/YYYY"
            size="small"
          />
          {dateUS && (
            <p className="text-xs text-gray-600 mt-1">
              Display: {dateUS.getMonth() + 1}/{dateUS.getDate()}/{dateUS.getFullYear()}
            </p>
          )}
        </div>

        {/* European Format */}
        <div>
          <BaseDatePicker
            label="European Format (DD/MM/YYYY)"
            value={dateEU}
            onChange={setDateEU}
            dateFormat="DD/MM/YYYY"
            placeholder="DD/MM/YYYY"
            size="small"
          />
          {dateEU && (
            <p className="text-xs text-gray-600 mt-1">
              Display: {dateEU.getDate()}/{dateEU.getMonth() + 1}/{dateEU.getFullYear()}
            </p>
          )}
        </div>

        {/* Thai Format */}
        <div>
          <BaseDatePicker
            label="Thai Format (DD/MM/BBBB)"
            value={dateTH}
            onChange={setDateTH}
            dateFormat="DD/MM/YYYY"
            placeholder="DD/MM/BBBB (Buddhist Era)"
            size="small"
          />
          {dateTH && (
            <p className="text-xs text-gray-600 mt-1">
              Display: {dateTH.getDate()}/{dateTH.getMonth() + 1}/{dateTH.getFullYear() + 543} (BE)
            </p>
          )}
        </div>

        {/* ISO Format */}
        <div>
          <BaseDatePicker
            label="ISO Format (YYYY-MM-DD)"
            value={dateISO}
            onChange={setDateISO}
            dateFormat="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            size="small"
          />
          {dateISO && (
            <p className="text-xs text-gray-600 mt-1">
              Display: {dateISO.getFullYear()}-{String(dateISO.getMonth() + 1).padStart(2, '0')}-{String(dateISO.getDate()).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Support different regional date formats</p>
        <p><strong>Features:</strong> Multiple format options, Custom display patterns</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 6: With Form Integration
// ============================================================================

export function FormIntegrationExample() {
  const [formData, setFormData] = useState({
    farmerName: '',
    farmSize: '',
    applicationDate: null as Date | null,
    inspectionDate: null as Date | null,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      farmerName: '',
      farmSize: '',
      applicationDate: null,
      inspectionDate: null,
    });
    setSubmitted(false);
  };

  const isFormValid = () => {
    return formData.farmerName && 
           formData.farmSize && 
           formData.applicationDate && 
           formData.inspectionDate;
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Form Integration</h3>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <BaseInput
            label="Farmer Name"
            value={formData.farmerName}
            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
            placeholder="Enter farmer name..."
            required
          />

          <BaseInput
            label="Farm Size (hectares)"
            type="number"
            value={formData.farmSize}
            onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
            placeholder="Enter farm size..."
            required
          />

          <BaseDatePicker
            label="Application Date"
            value={formData.applicationDate}
            onChange={(date) => setFormData({ ...formData, applicationDate: date })}
            maxDate={new Date()}
            placeholder="When did you apply?"
            helperText="Must be today or earlier"
            required
            clearable
          />

          <BaseDatePicker
            label="Inspection Date"
            value={formData.inspectionDate}
            onChange={(date) => setFormData({ ...formData, inspectionDate: date })}
            minDate={formData.applicationDate || new Date()}
            placeholder="When should we inspect?"
            helperText="Must be after application date"
            required
            clearable
          />

          <div className="flex gap-2 pt-2">
            <BaseButton
              type="submit"
              variant="contained"
              disabled={!isFormValid()}
            >
              Submit Application
            </BaseButton>
            <BaseButton
              type="button"
              variant="outlined"
              onClick={handleReset}
            >
              Reset
            </BaseButton>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-green-50 rounded">
          <h4 className="font-semibold text-green-800 mb-3">Application Submitted!</h4>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Farmer:</strong> {formData.farmerName}</p>
            <p><strong>Farm Size:</strong> {formData.farmSize} hectares</p>
            <p><strong>Application Date:</strong> {formData.applicationDate?.toLocaleDateString()}</p>
            <p><strong>Inspection Date:</strong> {formData.inspectionDate?.toLocaleDateString()}</p>
          </div>
          <BaseButton
            onClick={handleReset}
            variant="outlined"
            size="small"
            className="mt-4"
          >
            Submit Another
          </BaseButton>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Complete form with date pickers and validation</p>
        <p><strong>Features:</strong> Form integration, Date dependencies, Validation</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 7: Validation & Error States
// ============================================================================

export function ValidationExample() {
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const validateDate = (newDate: Date | null) => {
    setDate(newDate);
    
    if (!newDate) {
      setError('Date is required');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(newDate);
    selectedDate.setHours(0, 0, 0, 0);

    // Must be at least 7 days in the future
    const minFutureDate = new Date(today);
    minFutureDate.setDate(today.getDate() + 7);

    if (selectedDate < minFutureDate) {
      setError('Inspection must be scheduled at least 7 days in advance');
      return;
    }

    // Cannot be more than 90 days in the future
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(today.getDate() + 90);

    if (selectedDate > maxFutureDate) {
      setError('Inspection cannot be scheduled more than 90 days in advance');
      return;
    }

    // Check if weekend
    const day = selectedDate.getDay();
    if (day === 0 || day === 6) {
      setError('Inspections are only available on weekdays');
      return;
    }

    setError('');
  };

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 7);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Validation & Error States</h3>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800 font-semibold mb-2">Validation Rules:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Date is required</li>
          <li>Must be at least 7 days in the future</li>
          <li>Cannot be more than 90 days in the future</li>
          <li>Must be a weekday (Mon-Fri)</li>
        </ul>
      </div>

      <BaseDatePicker
        label="Farm Inspection Date"
        value={date}
        onChange={validateDate}
        minDate={minDate}
        maxDate={maxDate}
        placeholder="Select inspection date..."
        error={error}
        helperText={error || 'Select a date at least 7 days from today'}
        required
        clearable
      />

      {date && !error && (
        <div className="mt-4 p-3 bg-green-50 rounded">
          <p className="text-sm text-green-800">
            ✅ Valid inspection date: <strong>{date.toLocaleDateString()}</strong>
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Complex date validation with business rules</p>
        <p><strong>Features:</strong> Custom validation, Error messages, Visual feedback</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 8: Complex Workflow (Inspection Scheduling)
// ============================================================================

export function ComplexWorkflowExample() {
  const [step, setStep] = useState(1);
  const [workflow, setWorkflow] = useState({
    farmType: '',
    certificationLevel: '',
    requestDate: null as Date | null,
    inspectionDate: null as Date | null,
    reportDeadline: null as Date | null,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(1);
    setWorkflow({
      farmType: '',
      certificationLevel: '',
      requestDate: null,
      inspectionDate: null,
      reportDeadline: null,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return workflow.requestDate !== null;
      case 2: return workflow.inspectionDate !== null;
      case 3: return workflow.reportDeadline !== null;
      default: return false;
    }
  };

  // Calculate dates based on workflow
  const getInspectionMinDate = () => {
    if (!workflow.requestDate) return new Date();
    const min = new Date(workflow.requestDate);
    min.setDate(min.getDate() + 14); // At least 14 days after request
    return min;
  };

  const getReportMinDate = () => {
    if (!workflow.inspectionDate) return new Date();
    const min = new Date(workflow.inspectionDate);
    min.setDate(min.getDate() + 1); // At least 1 day after inspection
    return min;
  };

  const getReportMaxDate = () => {
    if (!workflow.inspectionDate) return new Date();
    const max = new Date(workflow.inspectionDate);
    max.setDate(max.getDate() + 30); // Maximum 30 days after inspection
    return max;
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Complex Workflow: Inspection Scheduling</h3>
      
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                s < step ? 'bg-green-500' :
                s === step ? 'bg-blue-500' :
                'bg-gray-200'
              } ${s !== 4 ? 'mr-2' : ''}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Request</span>
          <span>Inspection</span>
          <span>Report</span>
          <span>Summary</span>
        </div>
      </div>

      {/* Step 1: Request Date */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Step 1:</strong> When do you want to request the certification?
            </p>
          </div>

          <BaseDatePicker
            label="Certification Request Date"
            value={workflow.requestDate}
            onChange={(date) => setWorkflow({ ...workflow, requestDate: date })}
            maxDate={new Date()}
            placeholder="Select request date..."
            helperText="Must be today or earlier"
            required
            clearable
            showTodayButton
          />

          {workflow.requestDate && (
            <div className="p-3 bg-green-50 rounded text-sm text-green-800">
              Inspection can be scheduled from: <strong>
                {getInspectionMinDate().toLocaleDateString()}
              </strong> (14 days later)
            </div>
          )}
        </div>
      )}

      {/* Step 2: Inspection Date */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Step 2:</strong> When should the farm inspection take place?
            </p>
          </div>

          <BaseDatePicker
            label="Farm Inspection Date"
            value={workflow.inspectionDate}
            onChange={(date) => setWorkflow({ ...workflow, inspectionDate: date })}
            minDate={getInspectionMinDate()}
            placeholder="Select inspection date..."
            helperText={`Must be at least 14 days after request (${workflow.requestDate?.toLocaleDateString()})`}
            required
            clearable
          />

          {workflow.inspectionDate && (
            <div className="p-3 bg-green-50 rounded text-sm text-green-800">
              Report deadline: Between <strong>
                {getReportMinDate().toLocaleDateString()}
              </strong> and <strong>
                {getReportMaxDate().toLocaleDateString()}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Report Deadline */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <strong>Step 3:</strong> When should the inspection report be completed?
            </p>
          </div>

          <BaseDatePicker
            label="Report Deadline"
            value={workflow.reportDeadline}
            onChange={(date) => setWorkflow({ ...workflow, reportDeadline: date })}
            minDate={getReportMinDate()}
            maxDate={getReportMaxDate()}
            placeholder="Select report deadline..."
            helperText={`Between 1-30 days after inspection (${workflow.inspectionDate?.toLocaleDateString()})`}
            required
            clearable
          />
        </div>
      )}

      {/* Step 4: Summary */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded">
            <h4 className="font-semibold text-green-800 mb-3">✅ Workflow Complete!</h4>
            
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Request Date:</span>
                <strong>{workflow.requestDate?.toLocaleDateString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Inspection Date:</span>
                <strong>{workflow.inspectionDate?.toLocaleDateString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Report Deadline:</span>
                <strong>{workflow.reportDeadline?.toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-green-200">
              <p className="text-xs text-green-600 mb-2">Timeline:</p>
              <div className="space-y-1 text-xs text-green-700">
                <p>• Request to Inspection: {workflow.requestDate && workflow.inspectionDate ? 
                  Math.ceil((workflow.inspectionDate.getTime() - workflow.requestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0} days</p>
                <p>• Inspection to Report: {workflow.inspectionDate && workflow.reportDeadline ? 
                  Math.ceil((workflow.reportDeadline.getTime() - workflow.inspectionDate.getTime()) / (1000 * 60 * 60 * 24)) : 0} days</p>
                <p>• Total Duration: {workflow.requestDate && workflow.reportDeadline ? 
                  Math.ceil((workflow.reportDeadline.getTime() - workflow.requestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0} days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t">
        {step > 1 && step < 4 && (
          <BaseButton
            variant="outlined"
            onClick={handleBack}
          >
            Back
          </BaseButton>
        )}
        
        {step < 4 ? (
          <BaseButton
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 3 ? 'Finish' : 'Next'}
          </BaseButton>
        ) : (
          <BaseButton
            variant="contained"
            onClick={handleReset}
          >
            Start New Workflow
          </BaseButton>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Use Case:</strong> Multi-step certification workflow with date dependencies</p>
        <p><strong>Features:</strong> Step-by-step process, Date constraints, Timeline calculation</p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export default function BaseDatePickerExamples() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BaseDatePicker Examples</h1>
        <p className="text-gray-600">
          Comprehensive examples demonstrating all features of the BaseDatePicker component
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleSingleDateExample />
        <DateRangeExample />
        <MinMaxDateExample />
        <DisabledDatesExample />
        <CustomFormatExample />
        <FormIntegrationExample />
        <ValidationExample />
      </div>

      <div className="mt-6">
        <ComplexWorkflowExample />
      </div>
    </div>
  );
}
