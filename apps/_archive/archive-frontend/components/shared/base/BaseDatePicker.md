# BaseDatePicker Component

A comprehensive and feature-rich date picker component for selecting single dates or date ranges. Includes calendar popup, date constraints, custom formatting, keyboard navigation, and full form integration.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Examples](#examples)
  - [Simple Single Date](#simple-single-date)
  - [Date Range Selection](#date-range-selection)
  - [Min/Max Date Constraints](#minmax-date-constraints)
  - [Disabled Dates](#disabled-dates)
  - [Custom Date Formats](#custom-date-formats)
  - [Form Integration](#form-integration)
  - [Validation & Errors](#validation--errors)
  - [Complex Workflow](#complex-workflow)
- [Advanced Usage](#advanced-usage)
  - [Date Constraints](#date-constraints)
  - [Custom Disabled Logic](#custom-disabled-logic)
  - [Date Range Dependencies](#date-range-dependencies)
  - [Multi-Step Workflows](#multi-step-workflows)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)
- [Performance Tips](#performance-tips)
- [Troubleshooting](#troubleshooting)
- [Related Components](#related-components)

---

## Features

- ✅ **Single & Range Selection** - Select single dates or date ranges
- ✅ **Calendar Popup** - Interactive calendar with 42-day grid (6 weeks)
- ✅ **Month/Year Navigation** - Easy navigation between months and years
- ✅ **Date Constraints** - Min/max date restrictions
- ✅ **Disabled Dates** - Disable specific dates or date patterns
- ✅ **Custom Formatting** - Multiple date format options (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.)
- ✅ **Today Button** - Quick selection of current date
- ✅ **Clear Button** - Reset selected date(s)
- ✅ **Keyboard Navigation** - Full keyboard support (Enter, Escape, arrows)
- ✅ **Click Outside** - Auto-close when clicking outside
- ✅ **Size Variants** - Small, medium, and large sizes
- ✅ **Error States** - Built-in error handling and validation
- ✅ **Form Integration** - Hidden inputs for form submission
- ✅ **Visual States** - Selected, in-range, today, disabled date styling
- ✅ **TypeScript** - Full TypeScript support
- ✅ **Responsive** - Mobile-friendly design
- ✅ **Accessibility** - ARIA labels and keyboard navigation

---

## Installation

```tsx
import BaseDatePicker from '@/components/shared/base/BaseDatePicker';
```

---

## Basic Usage

### Minimal Example

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function App() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <BaseDatePicker
      label="Select Date"
      value={date}
      onChange={setDate}
      placeholder="Choose a date..."
    />
  );
}
```

### Date Range Example

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function App() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <BaseDatePicker
      label="Select Date Range"
      range
      startDate={startDate}
      endDate={endDate}
      onRangeChange={handleRangeChange}
      placeholder="Select start and end dates..."
    />
  );
}
```

---

## Props API

### BaseDatePickerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the picker |
| `value` | `Date \| null` | `null` | Current selected date (single mode) |
| `onChange` | `(date: Date \| null) => void` | - | Callback when date changes (single mode) |
| `placeholder` | `string` | `'Select date...'` | Placeholder text when no date selected |
| `name` | `string` | - | Form field name for submission |
| `disabled` | `boolean` | `false` | Disable the entire component |
| `required` | `boolean` | `false` | Mark field as required (shows asterisk) |
| `error` | `boolean` | `false` | Show error state |
| `helperText` | `string` | - | Helper text or error message displayed below |
| `className` | `string` | - | Additional CSS classes for container |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| **Range Mode** | | | |
| `range` | `boolean` | `false` | Enable date range selection mode |
| `startDate` | `Date \| null` | `null` | Start date for range mode |
| `endDate` | `Date \| null` | `null` | End date for range mode |
| `onRangeChange` | `(start: Date \| null, end: Date \| null) => void` | - | Callback when date range changes |
| **Date Constraints** | | | |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |
| `disabledDates` | `Date[] \| ((date: Date) => boolean)` | - | Array of disabled dates or predicate function |
| **Formatting** | | | |
| `dateFormat` | `'MM/DD/YYYY' \| 'DD/MM/YYYY' \| 'YYYY-MM-DD'` | `'MM/DD/YYYY'` | Date display format |
| **UI Options** | | | |
| `clearable` | `boolean` | `false` | Show clear button |
| `showTodayButton` | `boolean` | `false` | Show "Today" button in calendar |
| `closeOnSelect` | `boolean` | `false` | Auto-close calendar after selection |
| **Callbacks** | | | |
| `onFocus` | `() => void` | - | Callback when picker receives focus |
| `onBlur` | `() => void` | - | Callback when picker loses focus |

---

## Examples

### Simple Single Date

Select a single date with basic functionality.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <BaseDatePicker
      label="Select a Date"
      value={date}
      onChange={setDate}
      placeholder="Choose a date..."
      clearable
      showTodayButton
    />
  );
}
```

### Date Range Selection

Select a start and end date range.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <BaseDatePicker
      label="Select Date Range"
      range
      startDate={startDate}
      endDate={endDate}
      onRangeChange={handleRangeChange}
      placeholder="Select start and end dates..."
      clearable
    />
  );
}
```

### Min/Max Date Constraints

Restrict selectable dates to a specific range.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [date, setDate] = useState<Date | null>(null);
  
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 30); // 30 days ago
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90); // 90 days from now

  return (
    <BaseDatePicker
      label="Inspection Date"
      value={date}
      onChange={setDate}
      minDate={minDate}
      maxDate={maxDate}
      helperText="Must be within 30 days ago to 90 days from today"
    />
  );
}
```

### Disabled Dates

Disable specific dates or patterns (e.g., weekends, holidays).

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [date, setDate] = useState<Date | null>(null);

  // Disable weekends
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  // OR disable specific dates
  const holidays = [
    new Date(2025, 0, 1),  // New Year
    new Date(2025, 11, 25), // Christmas
  ];

  return (
    <BaseDatePicker
      label="Office Visit Date"
      value={date}
      onChange={setDate}
      disabledDates={isWeekend} // or use: disabledDates={holidays}
      helperText="Only weekdays (Mon-Fri)"
    />
  );
}
```

### Custom Date Formats

Display dates in different regional formats.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [dateUS, setDateUS] = useState<Date | null>(null);
  const [dateEU, setDateEU] = useState<Date | null>(null);
  const [dateISO, setDateISO] = useState<Date | null>(null);

  return (
    <>
      {/* US Format */}
      <BaseDatePicker
        label="US Format (MM/DD/YYYY)"
        value={dateUS}
        onChange={setDateUS}
        dateFormat="MM/DD/YYYY"
      />

      {/* European Format */}
      <BaseDatePicker
        label="European Format (DD/MM/YYYY)"
        value={dateEU}
        onChange={setDateEU}
        dateFormat="DD/MM/YYYY"
      />

      {/* ISO Format */}
      <BaseDatePicker
        label="ISO Format (YYYY-MM-DD)"
        value={dateISO}
        onChange={setDateISO}
        dateFormat="YYYY-MM-DD"
      />
    </>
  );
}
```

### Form Integration

Integrate with forms for submission.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';
import BaseButton from './BaseButton';

function Example() {
  const [formData, setFormData] = useState({
    applicationDate: null as Date | null,
    inspectionDate: null as Date | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <BaseDatePicker
        label="Application Date"
        name="applicationDate"
        value={formData.applicationDate}
        onChange={(date) => setFormData({ ...formData, applicationDate: date })}
        required
      />

      <BaseDatePicker
        label="Inspection Date"
        name="inspectionDate"
        value={formData.inspectionDate}
        onChange={(date) => setFormData({ ...formData, inspectionDate: date })}
        minDate={formData.applicationDate || new Date()}
        required
      />

      <BaseButton type="submit">Submit</BaseButton>
    </form>
  );
}
```

### Validation & Errors

Show error states with validation messages.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const validateDate = (newDate: Date | null) => {
    setDate(newDate);
    
    if (!newDate) {
      setError('Date is required');
      return;
    }

    const today = new Date();
    const minFutureDate = new Date(today);
    minFutureDate.setDate(today.getDate() + 7);

    if (newDate < minFutureDate) {
      setError('Date must be at least 7 days in the future');
      return;
    }

    setError('');
  };

  return (
    <BaseDatePicker
      label="Inspection Date"
      value={date}
      onChange={validateDate}
      error={!!error}
      helperText={error || 'Select a date at least 7 days from today'}
      required
    />
  );
}
```

### Complex Workflow

Multi-step workflow with date dependencies.

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';

function Example() {
  const [requestDate, setRequestDate] = useState<Date | null>(null);
  const [inspectionDate, setInspectionDate] = useState<Date | null>(null);
  const [reportDeadline, setReportDeadline] = useState<Date | null>(null);

  // Inspection must be at least 14 days after request
  const getInspectionMinDate = () => {
    if (!requestDate) return new Date();
    const min = new Date(requestDate);
    min.setDate(min.getDate() + 14);
    return min;
  };

  // Report must be 1-30 days after inspection
  const getReportMinDate = () => {
    if (!inspectionDate) return new Date();
    const min = new Date(inspectionDate);
    min.setDate(min.getDate() + 1);
    return min;
  };

  const getReportMaxDate = () => {
    if (!inspectionDate) return new Date();
    const max = new Date(inspectionDate);
    max.setDate(max.getDate() + 30);
    return max;
  };

  return (
    <>
      <BaseDatePicker
        label="Request Date"
        value={requestDate}
        onChange={setRequestDate}
        maxDate={new Date()}
        helperText="When did you submit the request?"
      />

      <BaseDatePicker
        label="Inspection Date"
        value={inspectionDate}
        onChange={setInspectionDate}
        minDate={getInspectionMinDate()}
        helperText="Must be at least 14 days after request"
        disabled={!requestDate}
      />

      <BaseDatePicker
        label="Report Deadline"
        value={reportDeadline}
        onChange={setReportDeadline}
        minDate={getReportMinDate()}
        maxDate={getReportMaxDate()}
        helperText="Between 1-30 days after inspection"
        disabled={!inspectionDate}
      />
    </>
  );
}
```

---

## Advanced Usage

### Date Constraints

Combine multiple constraint types:

```tsx
const today = new Date();

// Min: Today, Max: 90 days from now
const minDate = today;
const maxDate = new Date(today);
maxDate.setDate(today.getDate() + 90);

// Disabled: Weekends + holidays
const holidays = [new Date(2025, 0, 1), new Date(2025, 11, 25)];
const isDisabled = (date: Date) => {
  // Check weekend
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  
  // Check holidays
  return holidays.some(h => 
    h.getDate() === date.getDate() &&
    h.getMonth() === date.getMonth() &&
    h.getFullYear() === date.getFullYear()
  );
};

<BaseDatePicker
  label="Appointment Date"
  value={date}
  onChange={setDate}
  minDate={minDate}
  maxDate={maxDate}
  disabledDates={isDisabled}
/>
```

### Custom Disabled Logic

Implement complex business rules:

```tsx
const isDateDisabled = (date: Date) => {
  // Business rule 1: No weekends
  const day = date.getDay();
  if (day === 0 || day === 6) return true;
  
  // Business rule 2: No dates in past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return true;
  
  // Business rule 3: Only first 2 weeks of each month
  if (date.getDate() > 14) return true;
  
  // Business rule 4: No December
  if (date.getMonth() === 11) return true;
  
  return false;
};

<BaseDatePicker
  label="Audit Date"
  value={date}
  onChange={setDate}
  disabledDates={isDateDisabled}
  helperText="Only weekdays, first 2 weeks, not in December"
/>
```

### Date Range Dependencies

Create dependent date ranges:

```tsx
const [checkIn, setCheckIn] = useState<Date | null>(null);
const [checkOut, setCheckOut] = useState<Date | null>(null);

// Check-out must be after check-in
const handleCheckInChange = (date: Date | null) => {
  setCheckIn(date);
  // Reset check-out if it's before new check-in
  if (checkOut && date && checkOut <= date) {
    setCheckOut(null);
  }
};

<>
  <BaseDatePicker
    label="Check-in Date"
    value={checkIn}
    onChange={handleCheckInChange}
    minDate={new Date()}
  />

  <BaseDatePicker
    label="Check-out Date"
    value={checkOut}
    onChange={setCheckOut}
    minDate={checkIn || new Date()}
    disabled={!checkIn}
    helperText="Must be after check-in date"
  />
</>
```

### Multi-Step Workflows

Build complex multi-step date workflows:

```tsx
const [step, setStep] = useState(1);
const [dates, setDates] = useState({
  request: null as Date | null,
  inspection: null as Date | null,
  report: null as Date | null,
});

const canProceed = () => {
  switch (step) {
    case 1: return dates.request !== null;
    case 2: return dates.inspection !== null;
    case 3: return dates.report !== null;
    default: return false;
  }
};

return (
  <>
    {step === 1 && (
      <BaseDatePicker
        label="Request Date"
        value={dates.request}
        onChange={(date) => setDates({ ...dates, request: date })}
        maxDate={new Date()}
      />
    )}
    
    {step === 2 && (
      <BaseDatePicker
        label="Inspection Date"
        value={dates.inspection}
        onChange={(date) => setDates({ ...dates, inspection: date })}
        minDate={getInspectionMin(dates.request)}
      />
    )}
    
    {step === 3 && (
      <BaseDatePicker
        label="Report Deadline"
        value={dates.report}
        onChange={(date) => setDates({ ...dates, report: date })}
        minDate={getReportMin(dates.inspection)}
        maxDate={getReportMax(dates.inspection)}
      />
    )}
    
    <button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
      Next
    </button>
  </>
);
```

---

## Keyboard Shortcuts

### Input Field

| Key | Action |
|-----|--------|
| `Enter` | Open calendar popup |
| `Escape` | Close calendar popup |
| `Tab` | Move focus to next field |

### Calendar Popup

| Key | Action |
|-----|--------|
| `Escape` | Close calendar |
| `Arrow Left` | Navigate to previous month |
| `Arrow Right` | Navigate to next month |
| `Click` | Select date |

---

## Accessibility

The BaseDatePicker component follows WCAG 2.1 accessibility guidelines:

### ARIA Labels

```tsx
<BaseDatePicker
  label="Inspection Date"
  aria-label="Select inspection date"
  aria-describedby="inspection-help"
/>
```

### Required Fields

```tsx
<BaseDatePicker
  label="Date"
  required
  aria-required="true"
/>
```

### Error States

```tsx
<BaseDatePicker
  label="Date"
  error
  helperText="Date is required"
  aria-invalid="true"
/>
```

### Keyboard Navigation

- Full keyboard support for opening/closing calendar
- Arrow key navigation between months
- Enter key for selecting dates
- Escape key for closing calendar

### Screen Reader Support

- Proper ARIA labels for all interactive elements
- Clear button has `aria-label="Clear date"`
- Calendar icon has `aria-label="Open calendar"`
- Month navigation has `aria-label="Previous month"` and `aria-label="Next month"`

---

## Best Practices

### DO ✅

```tsx
// DO: Use controlled components
const [date, setDate] = useState<Date | null>(null);
<BaseDatePicker value={date} onChange={setDate} />

// DO: Provide clear labels and helper text
<BaseDatePicker
  label="Inspection Date"
  helperText="Select a date at least 7 days in the future"
/>

// DO: Use appropriate date constraints
<BaseDatePicker
  minDate={new Date()}
  maxDate={maxFutureDate}
/>

// DO: Handle validation properly
const validateDate = (date: Date | null) => {
  if (!date) {
    setError('Date is required');
    return;
  }
  // ... validation logic
};

// DO: Clear dependent dates when parent changes
const handleStartDateChange = (date: Date | null) => {
  setStartDate(date);
  if (endDate && date && endDate <= date) {
    setEndDate(null); // Clear invalid end date
  }
};

// DO: Use date range mode for periods
<BaseDatePicker
  range
  startDate={start}
  endDate={end}
  onRangeChange={handleRangeChange}
/>

// DO: Disable dates based on business rules
<BaseDatePicker
  disabledDates={(date) => isHoliday(date) || isWeekend(date)}
/>
```

### DON'T ❌

```tsx
// DON'T: Use uncontrolled components
<BaseDatePicker /> // No value/onChange

// DON'T: Forget to handle null values
const handleChange = (date: Date) => { // Should be Date | null
  setDate(date);
};

// DON'T: Allow invalid date selections
<BaseDatePicker
  // Missing minDate/maxDate constraints
  onChange={setDate}
/>

// DON'T: Use string dates instead of Date objects
<BaseDatePicker
  value="2025-11-04" // Should be Date object
  onChange={setDate}
/>

// DON'T: Ignore date range validation
<BaseDatePicker
  range
  startDate={start}
  endDate={end}
  // Missing validation: end > start
/>

// DON'T: Disable without explanation
<BaseDatePicker
  disabled
  // No helperText explaining why
/>

// DON'T: Use wrong format for region
<BaseDatePicker
  dateFormat="MM/DD/YYYY" // In Europe, use DD/MM/YYYY
/>
```

---

## Performance Tips

### 1. Memoize Date Calculations

```tsx
import { useMemo } from 'react';

const minDate = useMemo(() => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}, []); // Only calculate once

<BaseDatePicker minDate={minDate} />
```

### 2. Optimize Disabled Date Predicates

```tsx
// Good: Pre-compute holidays set
const holidaysSet = useMemo(() => 
  new Set(holidays.map(d => d.toISOString().split('T')[0]))
, [holidays]);

const isDisabled = useCallback((date: Date) => {
  return holidaysSet.has(date.toISOString().split('T')[0]);
}, [holidaysSet]);

<BaseDatePicker disabledDates={isDisabled} />
```

### 3. Avoid Recreating Functions

```tsx
// Bad: Function recreated on every render
<BaseDatePicker
  onChange={(date) => setDate(date)} // New function each render
/>

// Good: Use existing function
<BaseDatePicker
  onChange={setDate} // Reuse setState function
/>
```

### 4. Use closeOnSelect for Better UX

```tsx
<BaseDatePicker
  closeOnSelect // Close immediately after selection
  onChange={setDate}
/>
```

---

## Troubleshooting

### Calendar doesn't open

**Problem:** Clicking the input doesn't open the calendar.

**Solutions:**
- Check if component is `disabled`
- Verify `onChange` or `onRangeChange` is provided
- Check for CSS z-index conflicts

```tsx
// Ensure onChange is provided
<BaseDatePicker onChange={setDate} /> // ✅

// Not this
<BaseDatePicker /> // ❌
```

### Selected date not displaying

**Problem:** Date is selected but not showing in input.

**Solutions:**
- Verify `value` prop is a Date object, not string
- Check if `dateFormat` matches your region
- Ensure state is updating correctly

```tsx
// Correct
const [date, setDate] = useState<Date | null>(null);
<BaseDatePicker value={date} onChange={setDate} />

// Incorrect
<BaseDatePicker value="2025-11-04" /> // String instead of Date
```

### Date constraints not working

**Problem:** Disabled dates are still selectable.

**Solutions:**
- Verify `minDate`/`maxDate` are Date objects
- Check `disabledDates` function is returning boolean
- Ensure dates are compared correctly (time part)

```tsx
// Set time to midnight for comparison
const minDate = new Date();
minDate.setHours(0, 0, 0, 0);

<BaseDatePicker minDate={minDate} />
```

### Date range not working

**Problem:** Can't select second date in range mode.

**Solutions:**
- Ensure `range` prop is true
- Provide both `startDate` and `endDate` props
- Use `onRangeChange` instead of `onChange`

```tsx
// Correct range setup
<BaseDatePicker
  range
  startDate={start}
  endDate={end}
  onRangeChange={(s, e) => {
    setStart(s);
    setEnd(e);
  }}
/>
```

### Form submission issues

**Problem:** Date not submitted with form.

**Solutions:**
- Provide `name` prop
- Ensure date is in correct format
- Check hidden input is created

```tsx
<BaseDatePicker
  name="inspectionDate" // Required for form submission
  value={date}
  onChange={setDate}
/>
```

### Performance issues with many disabled dates

**Problem:** Calendar is slow when many dates are disabled.

**Solutions:**
- Use Set for O(1) lookups instead of array
- Memoize disabled date function
- Consider date range constraints instead

```tsx
// Optimize with Set
const disabledSet = useMemo(() => 
  new Set(disabledDates.map(d => d.toISOString()))
, [disabledDates]);

const isDisabled = useCallback((date: Date) => 
  disabledSet.has(date.toISOString())
, [disabledSet]);
```

---

## Related Components

- **BaseInput** - Text input component for manual date entry
- **BaseForm** - Form container with validation
- **BaseButton** - Button component for form actions
- **BaseCard** - Card container for date picker sections
- **BaseSelect** - Dropdown for selecting predefined date ranges

---

## Complete Example

Here's a comprehensive example combining multiple features:

```tsx
import { useState } from 'react';
import BaseDatePicker from './BaseDatePicker';
import BaseButton from './BaseButton';
import BaseCard from './BaseCard';

function CompleteDatePickerExample() {
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState('');

  // Define constraints
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 7);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 90);

  // Define holidays
  const holidays = [
    new Date(2025, 0, 1),
    new Date(2025, 11, 25),
  ];

  // Disable weekends and holidays
  const isDisabled = (checkDate: Date) => {
    // Weekend
    const day = checkDate.getDay();
    if (day === 0 || day === 6) return true;

    // Holiday
    return holidays.some(h =>
      h.getDate() === checkDate.getDate() &&
      h.getMonth() === checkDate.getMonth() &&
      h.getFullYear() === checkDate.getFullYear()
    );
  };

  // Validation
  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);

    if (!newDate) {
      setError('Date is required');
      return;
    }

    if (newDate < minDate) {
      setError('Date must be at least 7 days in the future');
      return;
    }

    if (newDate > maxDate) {
      setError('Date cannot be more than 90 days in the future');
      return;
    }

    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && !error) {
      console.log('Submitted date:', date);
    }
  };

  return (
    <BaseCard>
      <form onSubmit={handleSubmit}>
        <BaseDatePicker
          label="Inspection Date"
          name="inspectionDate"
          value={date}
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={isDisabled}
          dateFormat="DD/MM/YYYY"
          error={!!error}
          helperText={error || 'Select a weekday between 7-90 days from today'}
          required
          clearable
          showTodayButton
          size="medium"
        />

        <BaseButton
          type="submit"
          disabled={!date || !!error}
        >
          Schedule Inspection
        </BaseButton>
      </form>
    </BaseCard>
  );
}
```

---

## Version History

- **1.0.0** (November 4, 2025)
  - Initial release
  - Single date selection
  - Date range selection
  - Calendar with 42-day grid
  - Min/max date constraints
  - Disabled dates support
  - Custom date formatting
  - Keyboard navigation
  - Form integration
  - Full TypeScript support

---

## License

MIT License - Part of Botanical Audit Framework

---

## Support

For issues, questions, or contributions, please contact the development team or open an issue in the project repository.
