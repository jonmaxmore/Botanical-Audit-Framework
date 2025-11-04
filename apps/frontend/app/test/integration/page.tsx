/**
 * Integration Test - Form with All Components
 * 
 * Tests complete workflow: Form with all base components working together
 * Access at: http://localhost:3001/test/integration
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

interface FarmApplicationData {
  farmerName: string;
  email: string;
  phone: string;
  province: string | number;
  district: string | number;
  certification: string | number;
  crops: (string | number)[];
  farmSize: string;
  inspectionDate: Date | null;
  applicationDate: Date | null;
  notes: string;
}

export default function IntegrationTestPage() {
  const [formData, setFormData] = useState<FarmApplicationData>({
    farmerName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    certification: '',
    crops: [],
    farmSize: '',
    inspectionDate: null,
    applicationDate: null,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<FarmApplicationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options
  const provinceOptions: SelectOption[] = [
    { value: 'bangkok', label: 'Bangkok' },
    { value: 'chiang-mai', label: 'Chiang Mai' },
    { value: 'phuket', label: 'Phuket' },
    { value: 'khon-kaen', label: 'Khon Kaen' },
  ];

  const districtOptions: SelectOption[] = [
    { value: 'district-1', label: 'District 1' },
    { value: 'district-2', label: 'District 2' },
    { value: 'district-3', label: 'District 3' },
  ];

  const certificationOptions: SelectOption[] = [
    { value: 'gacp', label: 'GACP Certification' },
    { value: 'gap', label: 'GAP Certification' },
    { value: 'organic', label: 'Organic Certification' },
  ];

  const cropOptions: SelectOption[] = [
    { value: 'rice', label: 'Rice', description: 'Oryza sativa' },
    { value: 'corn', label: 'Corn', description: 'Zea mays' },
    { value: 'soybean', label: 'Soybean', description: 'Glycine max' },
    { value: 'wheat', label: 'Wheat', description: 'Triticum aestivum' },
  ];

  const farmSizeOptions: SelectOption[] = [
    { value: 'small', label: 'Small (< 10 rai)' },
    { value: 'medium', label: 'Medium (10-50 rai)' },
    { value: 'large', label: 'Large (> 50 rai)' },
  ];

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.farmerName) newErrors.farmerName = 'Farmer name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.certification) newErrors.certification = 'Certification type is required';
    if (formData.crops.length === 0) newErrors.crops = 'Select at least one crop';
    if (!formData.farmSize) newErrors.farmSize = 'Farm size is required';
    if (!formData.inspectionDate) newErrors.inspectionDate = 'Inspection date is required';
    if (!formData.applicationDate) newErrors.applicationDate = 'Application date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmittedData(formData);
    setIsSubmitting(false);

    // Scroll to results
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset
  const handleReset = () => {
    setFormData({
      farmerName: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      certification: '',
      crops: [],
      farmSize: '',
      inspectionDate: null,
      applicationDate: null,
      notes: '',
    });
    setErrors({});
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 Integration Test - Farm Application Form
          </h1>
          <p className="text-gray-600">
            Complete workflow testing with all base components
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Server: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}
          </p>
        </div>

        {/* Form */}
        <BaseCard className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Farm Certification Application</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseInput
                  label="Farmer Name"
                  value={formData.farmerName}
                  onChange={(e) => {
                    setFormData({ ...formData, farmerName: e.target.value });
                    setErrors({ ...errors, farmerName: '' });
                  }}
                  placeholder="Enter full name"
                  required
                  error={errors.farmerName}
                />

                <BaseInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  placeholder="email@example.com"
                  required
                  error={errors.email}
                />

                <BaseInput
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="0812345678"
                  required
                  error={errors.phone}
                />
              </div>
            </div>

            {/* Farm Location */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Farm Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseSelect
                  label="Province"
                  value={formData.province}
                  onChange={(val) => {
                    if (!Array.isArray(val)) {
                      setFormData({ ...formData, province: val });
                      setErrors({ ...errors, province: '' });
                    }
                  }}
                  options={provinceOptions}
                  placeholder="Select province"
                  searchable
                  required
                  error={errors.province}
                />

                <BaseSelect
                  label="District"
                  value={formData.district}
                  onChange={(val) => {
                    if (!Array.isArray(val)) {
                      setFormData({ ...formData, district: val });
                    }
                  }}
                  options={districtOptions}
                  placeholder="Select district"
                  searchable
                />
              </div>
            </div>

            {/* Certification Details */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Certification Details</h3>
              <div className="space-y-4">
                <BaseSelect
                  label="Certification Type"
                  value={formData.certification}
                  onChange={(val) => {
                    if (!Array.isArray(val)) {
                      setFormData({ ...formData, certification: val });
                      setErrors({ ...errors, certification: '' });
                    }
                  }}
                  options={certificationOptions}
                  placeholder="Select certification"
                  required
                  error={errors.certification}
                />

                <BaseSelect
                  label="Crops"
                  value={formData.crops}
                  onChange={(val) => {
                    if (Array.isArray(val)) {
                      setFormData({ ...formData, crops: val });
                      setErrors({ ...errors, crops: '' });
                    }
                  }}
                  options={cropOptions}
                  placeholder="Select crops"
                  multiple
                  maxSelections={3}
                  clearable
                  required
                  error={errors.crops}
                  helperText="Select up to 3 crops"
                />

                <BaseSelect
                  label="Farm Size"
                  value={formData.farmSize}
                  onChange={(val) => {
                    if (!Array.isArray(val)) {
                      setFormData({ ...formData, farmSize: val as string });
                      setErrors({ ...errors, farmSize: '' });
                    }
                  }}
                  options={farmSizeOptions}
                  placeholder="Select farm size"
                  required
                  error={errors.farmSize}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaseDatePicker
                  label="Application Date"
                  value={formData.applicationDate}
                  onChange={(date) => {
                    setFormData({ ...formData, applicationDate: date });
                    setErrors({ ...errors, applicationDate: '' });
                  }}
                  placeholder="Select application date"
                  clearable
                  required
                  error={errors.applicationDate}
                />

                <BaseDatePicker
                  label="Preferred Inspection Date"
                  value={formData.inspectionDate}
                  onChange={(date) => {
                    setFormData({ ...formData, inspectionDate: date });
                    setErrors({ ...errors, inspectionDate: '' });
                  }}
                  placeholder="Select inspection date"
                  minDate={new Date()}
                  clearable
                  required
                  error={errors.inspectionDate}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <BaseInput
                label="Additional Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
                multiline
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <BaseButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </BaseButton>
              <BaseButton
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Form
              </BaseButton>
            </div>
          </form>
        </BaseCard>

        {/* Results */}
        {submittedData && (
          <BaseCard id="results" className="bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
              ✅ Application Submitted Successfully!
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Farmer:</strong> {submittedData.farmerName}</p>
              <p><strong>Email:</strong> {submittedData.email}</p>
              <p><strong>Phone:</strong> {submittedData.phone}</p>
              <p><strong>Province:</strong> {submittedData.province}</p>
              <p><strong>District:</strong> {submittedData.district || 'Not specified'}</p>
              <p><strong>Certification:</strong> {submittedData.certification}</p>
              <p><strong>Crops:</strong> {submittedData.crops.join(', ')}</p>
              <p><strong>Farm Size:</strong> {submittedData.farmSize}</p>
              <p><strong>Application Date:</strong> {submittedData.applicationDate?.toLocaleDateString()}</p>
              <p><strong>Inspection Date:</strong> {submittedData.inspectionDate?.toLocaleDateString()}</p>
              {submittedData.notes && <p><strong>Notes:</strong> {submittedData.notes}</p>}
            </div>
          </BaseCard>
        )}

        {/* Status */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>✅ All components integrated successfully</p>
          <p>Server running on: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
        </div>
      </div>
    </div>
  );
}
