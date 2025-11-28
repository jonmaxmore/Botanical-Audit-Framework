/**
 * BaseSelect Component Examples
 * 
 * Demonstrates various use cases:
 * 1. Simple Single Select
 * 2. Multi-Select with Tags
 * 3. Searchable Select
 * 4. Grouped Options
 * 5. Custom Option Rendering
 * 6. Async/Loading State
 * 7. Create New Options
 * 8. Complex Form Integration
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

import React, { useState } from 'react';
import BaseSelect, { SelectOption, SelectGroup } from './BaseSelect';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';

// ============================================================================
// Example 1: Simple Single Select
// ============================================================================

export function SimpleSingleSelectExample() {
  const [value, setValue] = useState<string | number>('');

  const options: SelectOption[] = [
    { value: 'organic', label: 'Organic Certification' },
    { value: 'gap', label: 'GAP Certification' },
    { value: 'gacp', label: 'GACP Certification' },
    { value: 'haccp', label: 'HACCP Certification' },
    { value: 'gmp', label: 'GMP Certification' },
  ];

  const handleChange = (val: string | number | (string | number)[]) => {
    if (!Array.isArray(val)) {
      setValue(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Simple Single Select</h3>
      
      <BaseSelect
        label="Certification Type"
        value={value}
        onChange={handleChange}
        options={options}
        placeholder="Select certification type"
        required
        helperText="Choose the type of certification you want to apply for"
      />

      {value && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Selected: <strong>{options.find(o => o.value === value)?.label}</strong>
          </p>
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// Example 2: Multi-Select with Tags
// ============================================================================

export function MultiSelectExample() {
  const [selectedCrops, setSelectedCrops] = useState<(string | number)[]>([]);

  const cropOptions: SelectOption[] = [
    { value: 'rice', label: 'Rice', description: 'Oryza sativa' },
    { value: 'corn', label: 'Corn', description: 'Zea mays' },
    { value: 'soybean', label: 'Soybean', description: 'Glycine max' },
    { value: 'wheat', label: 'Wheat', description: 'Triticum aestivum' },
    { value: 'coffee', label: 'Coffee', description: 'Coffea arabica' },
    { value: 'tea', label: 'Tea', description: 'Camellia sinensis' },
    { value: 'rubber', label: 'Rubber', description: 'Hevea brasiliensis' },
    { value: 'palm', label: 'Oil Palm', description: 'Elaeis guineensis' },
  ];

  const handleChange = (val: string | number | (string | number)[]) => {
    if (Array.isArray(val)) {
      setSelectedCrops(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Multi-Select Crops</h3>
      
      <BaseSelect
        label="Farm Crops"
        value={selectedCrops}
        onChange={handleChange}
        options={cropOptions}
        placeholder="Select crops grown on your farm"
        multiple
        maxSelections={5}
        clearable
        helperText={`Selected ${selectedCrops.length} of maximum 5 crops`}
        fullWidth
      />

      {selectedCrops.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Crops:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {selectedCrops.map(cropValue => {
              const crop = cropOptions.find(o => o.value === cropValue);
              return crop ? (
                <li key={cropValue}>
                  <strong>{crop.label}</strong> - {crop.description}
                </li>
              ) : null;
            })}
          </ul>
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// Example 3: Searchable Select
// ============================================================================

export function SearchableSelectExample() {
  const [selectedProvince, setSelectedProvince] = useState<string | number>('');

  const thailandProvinces: SelectOption[] = [
    { value: 'bangkok', label: 'Bangkok', description: 'Capital of Thailand' },
    { value: 'chiang-mai', label: 'Chiang Mai', description: 'Northern Thailand' },
    { value: 'phuket', label: 'Phuket', description: 'Southern Island' },
    { value: 'nakhon-ratchasima', label: 'Nakhon Ratchasima', description: 'Korat' },
    { value: 'khon-kaen', label: 'Khon Kaen', description: 'Northeastern Hub' },
    { value: 'chonburi', label: 'Chonburi', description: 'Eastern Seaboard' },
    { value: 'rayong', label: 'Rayong', description: 'Industrial Zone' },
    { value: 'songkhla', label: 'Songkhla', description: 'Deep South' },
    { value: 'surat-thani', label: 'Surat Thani', description: 'Southern Gateway' },
    { value: 'ubon-ratchathani', label: 'Ubon Ratchathani', description: 'Eastern Isan' },
  ];

  const handleChange = (val: string | number | (string | number)[]) => {
    if (!Array.isArray(val)) {
      setSelectedProvince(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Searchable Province Select</h3>
      
      <BaseSelect
        label="Farm Location"
        value={selectedProvince}
        onChange={handleChange}
        options={thailandProvinces}
        placeholder="Search for province"
        searchable
        searchPlaceholder="Type to search provinces..."
        clearable
        fullWidth
        helperText="Select the province where your farm is located"
      />

      {selectedProvince && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          {thailandProvinces.find(p => p.value === selectedProvince) && (
            <>
              <h4 className="font-medium text-green-900">
                {thailandProvinces.find(p => p.value === selectedProvince)?.label}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {thailandProvinces.find(p => p.value === selectedProvince)?.description}
              </p>
            </>
          )}
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// Example 4: Grouped Options
// ============================================================================

export function GroupedOptionsExample() {
  const [selectedStandard, setSelectedStandard] = useState<string | number>('');

  const groupedStandards: SelectGroup[] = [
    {
      label: 'Food Safety',
      options: [
        { value: 'haccp', label: 'HACCP', description: 'Hazard Analysis Critical Control Points' },
        { value: 'gmp', label: 'GMP', description: 'Good Manufacturing Practice' },
        { value: 'iso22000', label: 'ISO 22000', description: 'Food Safety Management' },
      ],
    },
    {
      label: 'Agricultural Practice',
      options: [
        { value: 'gap', label: 'GAP', description: 'Good Agricultural Practice' },
        { value: 'gacp', label: 'GACP', description: 'Good Agricultural Collection Practice' },
        { value: 'globalg', label: 'GLOBALG.A.P.', description: 'Global Good Agricultural Practice' },
      ],
    },
    {
      label: 'Organic',
      options: [
        { value: 'eu-organic', label: 'EU Organic', description: 'European Union Organic' },
        { value: 'usda-organic', label: 'USDA Organic', description: 'United States Department of Agriculture' },
        { value: 'jm-organic', label: 'JAS Organic', description: 'Japanese Agricultural Standard' },
      ],
    },
    {
      label: 'Environmental',
      options: [
        { value: 'rainforest', label: 'Rainforest Alliance', description: 'Sustainable Farming' },
        { value: 'fairtrade', label: 'Fairtrade', description: 'Fair Trade Certification' },
        { value: 'utz', label: 'UTZ Certified', description: 'Sustainable Farming Program' },
      ],
    },
  ];

  const handleChange = (val: string | number | (string | number)[]) => {
    if (!Array.isArray(val)) {
      setSelectedStandard(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Grouped Standards</h3>
      
      <BaseSelect
        label="Certification Standard"
        value={selectedStandard}
        onChange={handleChange}
        options={groupedStandards}
        placeholder="Select a standard"
        searchable
        clearable
        fullWidth
        helperText="Standards are grouped by category"
      />

      {selectedStandard && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Selected Standard: <strong>{selectedStandard}</strong>
          </p>
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// Example 5: Custom Option Rendering with Icons
// ============================================================================

export function CustomRenderExample() {
  const [selectedStatus, setSelectedStatus] = useState<string | number>('');

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
      description: 'Waiting for inspector review',
      icon: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: 'rejected',
      label: 'Rejected',
      description: 'Application did not meet requirements',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: 'revision',
      label: 'Needs Revision',
      description: 'Requires additional information',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  const handleChange = (val: string | number | (string | number)[]) => {
    if (!Array.isArray(val)) {
      setSelectedStatus(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Custom Rendering with Icons</h3>
      
      <BaseSelect
        label="Application Status"
        value={selectedStatus}
        onChange={handleChange}
        options={statusOptions}
        placeholder="Select status"
        fullWidth
        helperText="Status options with custom icons and descriptions"
      />

      {selectedStatus && (
        <div className="mt-4">
          {statusOptions.map(option => {
            if (option.value === selectedStatus) {
              return (
                <div key={option.value} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-3">
                  {option.icon}
                  <div>
                    <h4 className="font-medium text-gray-900">{option.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </BaseCard>
  );
}

// ============================================================================
// Example 6: Async/Loading State
// ============================================================================

export function AsyncLoadingExample() {
  const [selectedInspector, setSelectedInspector] = useState<string | number>('');
  const [loading, setLoading] = useState(false);
  const [inspectors, setInspectors] = useState<SelectOption[]>([]);

  const loadInspectors = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInspectors: SelectOption[] = [
      { value: '1', label: 'Inspector John Doe', description: 'Senior Inspector - 15 years experience' },
      { value: '2', label: 'Inspector Jane Smith', description: 'Lead Inspector - 12 years experience' },
      { value: '3', label: 'Inspector Mike Johnson', description: 'Field Inspector - 8 years experience' },
      { value: '4', label: 'Inspector Sarah Williams', description: 'Quality Inspector - 10 years experience' },
      { value: '5', label: 'Inspector David Brown', description: 'Certification Inspector - 6 years experience' },
    ];
    
    setInspectors(mockInspectors);
    setLoading(false);
  };

  const handleChange = (val: string | number | (string | number)[]) => {
    if (!Array.isArray(val)) {
      setSelectedInspector(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Async Loading Example</h3>
      
      <div className="space-y-4">
        {inspectors.length === 0 && !loading && (
          <BaseButton onClick={loadInspectors} variant="outlined">
            Load Inspectors
          </BaseButton>
        )}
        
        <BaseSelect
          label="Assign Inspector"
          value={selectedInspector}
          onChange={handleChange}
          options={inspectors}
          placeholder="Select an inspector"
          loading={loading}
          loadingMessage="Loading inspectors..."
          noOptionsMessage="Click 'Load Inspectors' button to fetch data"
          searchable
          clearable
          fullWidth
          helperText="Inspectors will be loaded from the server"
        />

        {selectedInspector && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              Assigned to:{' '}
              <strong>{inspectors.find(i => i.value === selectedInspector)?.label}</strong>
            </p>
          </div>
        )}
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 7: Create New Options
// ============================================================================

export function CreateNewOptionExample() {
  const [selectedTags, setSelectedTags] = useState<(string | number)[]>([]);
  const [tags, setTags] = useState<SelectOption[]>([
    { value: 'organic', label: 'Organic' },
    { value: 'sustainable', label: 'Sustainable' },
    { value: 'local', label: 'Local' },
    { value: 'fresh', label: 'Fresh' },
  ]);

  const handleCreateTag = (newTag: string) => {
    const tagValue = newTag.toLowerCase().replace(/\s+/g, '-');
    const newOption: SelectOption = {
      value: tagValue,
      label: newTag,
    };
    
    setTags([...tags, newOption]);
    setSelectedTags([...selectedTags, tagValue]);
  };

  const handleChange = (val: string | number | (string | number)[]) => {
    if (Array.isArray(val)) {
      setSelectedTags(val);
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Create New Tags</h3>
      
      <BaseSelect
        label="Product Tags"
        value={selectedTags}
        onChange={handleChange}
        options={tags}
        placeholder="Search or create tags"
        multiple
        searchable
        clearable
        onCreate={handleCreateTag}
        fullWidth
        helperText="Type and press Enter to create a new tag"
      />

      {selectedTags.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Tags:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagValue => {
              const tag = tags.find(t => t.value === tagValue);
              return tag ? (
                <span
                  key={tagValue}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {tag.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 Tip: Search for a tag that doesn't exist and press Enter to create it
        </p>
      </div>
    </BaseCard>
  );
}

// ============================================================================
// Example 8: Complex Form Integration
// ============================================================================

export function ComplexFormExample() {
  const [formData, setFormData] = useState({
    certification: '',
    crops: [] as (string | number)[],
    province: '',
    status: '',
    inspector: '',
    farmSize: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const certificationOptions: SelectOption[] = [
    { value: 'gacp', label: 'GACP Certification' },
    { value: 'gap', label: 'GAP Certification' },
    { value: 'organic', label: 'Organic Certification' },
  ];

  const cropOptions: SelectOption[] = [
    { value: 'rice', label: 'Rice' },
    { value: 'corn', label: 'Corn' },
    { value: 'soybean', label: 'Soybean' },
  ];

  const provinceOptions: SelectOption[] = [
    { value: 'bangkok', label: 'Bangkok' },
    { value: 'chiang-mai', label: 'Chiang Mai' },
    { value: 'phuket', label: 'Phuket' },
  ];

  const sizeOptions: SelectOption[] = [
    { value: 'small', label: 'Small (< 10 rai)', description: 'Less than 10 rai' },
    { value: 'medium', label: 'Medium (10-50 rai)', description: '10 to 50 rai' },
    { value: 'large', label: 'Large (> 50 rai)', description: 'More than 50 rai' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.certification) newErrors.certification = 'Please select a certification type';
    if (formData.crops.length === 0) newErrors.crops = 'Please select at least one crop';
    if (!formData.province) newErrors.province = 'Please select your province';
    if (!formData.farmSize) newErrors.farmSize = 'Please select your farm size';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!\n\n' + JSON.stringify(formData, null, 2));
    }
  };

  return (
    <BaseCard>
      <h3 className="text-lg font-semibold mb-4">Farm Application Form</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <BaseSelect
          label="Certification Type"
          value={formData.certification}
          onChange={(value) => {
            setFormData({ ...formData, certification: value as string });
            setErrors({ ...errors, certification: '' });
          }}
          options={certificationOptions}
          placeholder="Select certification"
          required
          error={errors.certification}
          fullWidth
        />

        <BaseSelect
          label="Crops"
          value={formData.crops}
          onChange={(value) => {
            setFormData({ ...formData, crops: value as (string | number)[] });
            setErrors({ ...errors, crops: '' });
          }}
          options={cropOptions}
          placeholder="Select crops"
          multiple
          maxSelections={3}
          required
          error={errors.crops}
          helperText="Select up to 3 crops"
          fullWidth
        />

        <BaseSelect
          label="Province"
          value={formData.province}
          onChange={(value) => {
            setFormData({ ...formData, province: value as string });
            setErrors({ ...errors, province: '' });
          }}
          options={provinceOptions}
          placeholder="Select province"
          searchable
          required
          error={errors.province}
          fullWidth
        />

        <BaseSelect
          label="Farm Size"
          value={formData.farmSize}
          onChange={(value) => {
            setFormData({ ...formData, farmSize: value as string });
            setErrors({ ...errors, farmSize: '' });
          }}
          options={sizeOptions}
          placeholder="Select farm size"
          required
          error={errors.farmSize}
          fullWidth
        />

        <div className="flex gap-3 pt-4 border-t">
          <BaseButton
            type="button"
            variant="outlined"
            onClick={() => {
              setFormData({
                certification: '',
                crops: [],
                province: '',
                status: '',
                inspector: '',
                farmSize: '',
              });
              setErrors({});
            }}
          >
            Reset
          </BaseButton>
          <BaseButton type="submit" variant="contained">
            Submit Application
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export default function BaseSelectExamples() {
  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BaseSelect Examples</h1>
        <p className="text-gray-600 mb-8">
          Comprehensive examples demonstrating all BaseSelect features
        </p>

        <div className="space-y-6">
          <SimpleSingleSelectExample />
          <MultiSelectExample />
          <SearchableSelectExample />
          <GroupedOptionsExample />
          <CustomRenderExample />
          <AsyncLoadingExample />
          <CreateNewOptionExample />
          <ComplexFormExample />
        </div>
      </div>
    </div>
  );
}
