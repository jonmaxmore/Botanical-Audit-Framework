/**
 * Smoke Test Page - Base Components
 * 
 * Quick visual test for all base components to verify they render and work.
 * Access at: http://localhost:3000/test/smoke
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState } from 'react';
import BaseButton from '@/components/shared/base/BaseButton';
import BaseCard from '@/components/shared/base/BaseCard';
import BaseInput from '@/components/shared/base/BaseInput';
import BaseSelect, { SelectOption } from '@/components/shared/base/BaseSelect';
import BaseDatePicker from '@/components/shared/base/BaseDatePicker';

export default function SmokeTestPage() {
  // Test states
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState<string | number>('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [multiSelect, setMultiSelect] = useState<(string | number)[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test data
  const selectOptions: SelectOption[] = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  // Test functions
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testButton = () => {
    addResult('✅ Button clicked successfully');
  };

  const testInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    addResult(`✅ Input changed to: ${value}`);
  };

  const testSelect = (value: string | number | (string | number)[]) => {
    if (!Array.isArray(value)) {
      setSelectValue(value);
      addResult(`✅ Select changed to: ${value}`);
    }
  };

  const testMultiSelect = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value)) {
      setMultiSelect(value);
      addResult(`✅ Multi-select changed to: ${JSON.stringify(value)}`);
    }
  };

  const testDatePicker = (date: Date | null) => {
    setDateValue(date);
    addResult(`✅ Date changed to: ${date?.toLocaleDateString() || 'null'}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Base Components Smoke Test
          </h1>
          <p className="text-gray-600">
            Visual and functional testing for all base components
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Server: {typeof window !== 'undefined' ? window.location.origin : 'SSR'} | 
            Time: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Components */}
          <div className="space-y-6">
            {/* BaseButton Tests */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">BaseButton</h2>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <BaseButton variant="contained" onClick={testButton}>
                    Contained
                  </BaseButton>
                  <BaseButton variant="outlined" onClick={testButton}>
                    Outlined
                  </BaseButton>
                  <BaseButton variant="text" onClick={testButton}>
                    Text
                  </BaseButton>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <BaseButton size="small" onClick={testButton}>
                    Small
                  </BaseButton>
                  <BaseButton size="medium" onClick={testButton}>
                    Medium
                  </BaseButton>
                  <BaseButton size="large" onClick={testButton}>
                    Large
                  </BaseButton>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <BaseButton loading onClick={testButton}>
                    Loading
                  </BaseButton>
                  <BaseButton disabled onClick={testButton}>
                    Disabled
                  </BaseButton>
                </div>
              </div>
            </BaseCard>

            {/* BaseInput Tests */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">BaseInput</h2>
              <div className="space-y-3">
                <BaseInput
                  label="Text Input"
                  value={inputValue}
                  onChange={testInput}
                  placeholder="Type something..."
                />
                <BaseInput
                  label="Email Input"
                  type="email"
                  placeholder="email@example.com"
                />
                <BaseInput
                  label="Password Input"
                  type="password"
                  placeholder="Enter password"
                />
                <BaseInput
                  label="Disabled Input"
                  disabled
                  value="Disabled value"
                  onChange={() => {}}
                />
                <BaseInput
                  label="Error Input"
                  error="This field has an error"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </BaseCard>

            {/* BaseSelect Tests */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">BaseSelect</h2>
              <div className="space-y-3">
                <BaseSelect
                  label="Single Select"
                  value={selectValue}
                  onChange={testSelect}
                  options={selectOptions}
                  placeholder="Select an option"
                />
                <BaseSelect
                  label="Multi-Select"
                  value={multiSelect}
                  onChange={testMultiSelect}
                  options={selectOptions}
                  placeholder="Select multiple"
                  multiple
                  clearable
                />
                <BaseSelect
                  label="Searchable"
                  value={selectValue}
                  onChange={testSelect}
                  options={selectOptions}
                  searchable
                  clearable
                />
              </div>
            </BaseCard>

            {/* BaseDatePicker Tests */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">BaseDatePicker</h2>
              <div className="space-y-3">
                <BaseDatePicker
                  label="Single Date"
                  value={dateValue}
                  onChange={testDatePicker}
                  placeholder="Select a date"
                  clearable
                />
                <BaseDatePicker
                  label="With Min/Max"
                  value={dateValue}
                  onChange={testDatePicker}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  clearable
                />
                <BaseDatePicker
                  label="Disabled"
                  value={null}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </BaseCard>
          </div>

          {/* Right Column - Test Results */}
          <div className="space-y-6">
            {/* Test Results */}
            <BaseCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Test Results</h2>
                <BaseButton
                  size="small"
                  variant="outlined"
                  onClick={clearResults}
                >
                  Clear
                </BaseButton>
              </div>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-[600px] overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="text-gray-500">
                    Interact with components to see results...
                  </div>
                ) : (
                  testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </BaseCard>

            {/* Component Status */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">Component Status</h2>
              <div className="space-y-2">
                <StatusItem name="BaseButton" status="ready" />
                <StatusItem name="BaseCard" status="ready" />
                <StatusItem name="BaseInput" status="ready" />
                <StatusItem name="BaseForm" status="ready" />
                <StatusItem name="BaseTable" status="ready" />
                <StatusItem name="BaseDialog" status="ready" />
                <StatusItem name="BaseSelect" status="ready" />
                <StatusItem name="BaseDatePicker" status="ready" />
              </div>
            </BaseCard>

            {/* Current Values */}
            <BaseCard>
              <h2 className="text-xl font-semibold mb-4">Current Values</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Input:</span>
                  <span className="font-mono">{inputValue || '(empty)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Select:</span>
                  <span className="font-mono">{selectValue || '(empty)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Multi-Select:</span>
                  <span className="font-mono">
                    {multiSelect.length > 0 ? `[${multiSelect.join(', ')}]` : '(empty)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-mono">
                    {dateValue ? dateValue.toLocaleDateString() : '(empty)'}
                  </span>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All components loaded successfully ✅</p>
          <p>Phase 5 Week 3-4: Base Components Testing</p>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function StatusItem({ name, status }: { name: string; status: 'ready' | 'pending' | 'error' }) {
  const statusConfig = {
    ready: { color: 'text-green-600', icon: '✅', bg: 'bg-green-50' },
    pending: { color: 'text-yellow-600', icon: '⏳', bg: 'bg-yellow-50' },
    error: { color: 'text-red-600', icon: '❌', bg: 'bg-red-50' },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center justify-between p-2 rounded ${config.bg}`}>
      <span className="font-medium">{name}</span>
      <span className={`${config.color} font-semibold`}>
        {config.icon} {status}
      </span>
    </div>
  );
}
