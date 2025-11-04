/**
 * Thai Address Form Component
 * 
 * Reusable form for Thai address input with province/district/subdistrict dropdowns.
 * Consolidates logic from:
 * - FarmAddressForm (farmer-portal)
 * - UserAddressForm (admin-portal)
 * - CompanyAddressForm (certificate-portal)
 * 
 * Features:
 * - Thailand administrative divisions API
 * - Province → District → Subdistrict → Postal Code cascade
 * - Auto-fill postal code based on subdistrict
 * - Search/filter in dropdowns
 * - Map integration (optional)
 * - Address validation
 * - GPS coordinates
 * - Type-ahead suggestions
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Province {
  id: string;
  name_th: string;
  name_en: string;
}

export interface District {
  id: string;
  province_id: string;
  name_th: string;
  name_en: string;
}

export interface Subdistrict {
  id: string;
  district_id: string;
  name_th: string;
  name_en: string;
  zip_code: string;
}

export interface ThaiAddressData {
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export interface ThaiAddressFormProps {
  // Core props
  value?: Partial<ThaiAddressData>;
  onChange: (data: ThaiAddressData) => void;
  
  // Configuration
  showMap?: boolean;
  showGPS?: boolean;
  required?: boolean;
  disabled?: boolean;
  
  // Labels
  addressLabel?: string;
  provinceLabel?: string;
  districtLabel?: string;
  subdistrictLabel?: string;
  postalCodeLabel?: string;
  
  // Placeholders
  addressPlaceholder?: string;
  provincePlaceholder?: string;
  districtPlaceholder?: string;
  subdistrictPlaceholder?: string;
  
  // API
  apiBaseUrl?: string;
  
  // Validation
  onValidate?: (isValid: boolean) => void;
  
  // Customization
  className?: string;
}

// ============================================================================
// MOCK DATA (Replace with real API calls)
// ============================================================================

const MOCK_PROVINCES: Province[] = [
  { id: '1', name_th: 'กรุงเทพมหานคร', name_en: 'Bangkok' },
  { id: '2', name_th: 'เชียงใหม่', name_en: 'Chiang Mai' },
  { id: '3', name_th: 'นครราชสีมา', name_en: 'Nakhon Ratchasima' },
  { id: '4', name_th: 'ภูเก็ต', name_en: 'Phuket' },
  { id: '5', name_th: 'สงขลา', name_en: 'Songkhla' }
];

const MOCK_DISTRICTS: Record<string, District[]> = {
  '1': [
    { id: '10', province_id: '1', name_th: 'บางรัก', name_en: 'Bang Rak' },
    { id: '11', province_id: '1', name_th: 'ดุสิต', name_en: 'Dusit' },
    { id: '12', province_id: '1', name_th: 'ปทุมวัน', name_en: 'Pathum Wan' }
  ],
  '2': [
    { id: '20', province_id: '2', name_th: 'เมืองเชียงใหม่', name_en: 'Mueang Chiang Mai' },
    { id: '21', province_id: '2', name_th: 'หางดง', name_en: 'Hang Dong' },
    { id: '22', province_id: '2', name_th: 'สันทราย', name_en: 'San Sai' }
  ]
};

const MOCK_SUBDISTRICTS: Record<string, Subdistrict[]> = {
  '10': [
    { id: '100', district_id: '10', name_th: 'มหาพฤฒาราม', name_en: 'Maha Phruettharam', zip_code: '10500' },
    { id: '101', district_id: '10', name_th: 'สี่พระยา', name_en: 'Si Phraya', zip_code: '10500' }
  ],
  '20': [
    { id: '200', district_id: '20', name_th: 'ศรีภูมิ', name_en: 'Si Phum', zip_code: '50200' },
    { id: '201', district_id: '20', name_th: 'พระสิงห์', name_en: 'Phra Sing', zip_code: '50200' },
    { id: '202', district_id: '20', name_th: 'ช้างคลาน', name_en: 'Chang Khlan', zip_code: '50100' }
  ]
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ThaiAddressForm({
  value = {},
  onChange,
  showMap = false,
  showGPS = false,
  required = true,
  disabled = false,
  addressLabel = 'ที่อยู่',
  provinceLabel = 'จังหวัด',
  districtLabel = 'อำเภอ/เขต',
  subdistrictLabel = 'ตำบล/แขวง',
  postalCodeLabel = 'รหัสไปรษณีย์',
  addressPlaceholder = 'เลขที่ หมู่ ซอย ถนน',
  provincePlaceholder = 'เลือกจังหวัด',
  districtPlaceholder = 'เลือกอำเภอ/เขต',
  subdistrictPlaceholder = 'เลือกตำบล/แขวง',
  apiBaseUrl = '/api/thailand',
  onValidate,
  className = ''
}: ThaiAddressFormProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [address, setAddress] = useState(value.address || '');
  const [province, setProvince] = useState(value.province || '');
  const [district, setDistrict] = useState(value.district || '');
  const [subdistrict, setSubdistrict] = useState(value.subdistrict || '');
  const [postalCode, setPostalCode] = useState(value.postalCode || '');
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(false);
  
  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [subdistrictSearch, setSubdistrictSearch] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true);
    try {
      // Replace with real API call
      // const response = await fetch(`${apiBaseUrl}/provinces`);
      // const data = await response.json();
      // setProvinces(data);
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      setProvinces(MOCK_PROVINCES);
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  }, [apiBaseUrl]);

  const fetchDistricts = useCallback(async (provinceId: string) => {
    setLoadingDistricts(true);
    try {
      // Replace with real API call
      // const response = await fetch(`${apiBaseUrl}/districts?province_id=${provinceId}`);
      // const data = await response.json();
      // setDistricts(data);
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      setDistricts(MOCK_DISTRICTS[provinceId] || []);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  }, [apiBaseUrl]);

  const fetchSubdistricts = useCallback(async (districtId: string) => {
    setLoadingSubdistricts(true);
    try {
      // Replace with real API call
      // const response = await fetch(`${apiBaseUrl}/subdistricts?district_id=${districtId}`);
      // const data = await response.json();
      // setSubdistricts(data);
      
      // Mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      setSubdistricts(MOCK_SUBDISTRICTS[districtId] || []);
    } catch (error) {
      console.error('Failed to fetch subdistricts:', error);
    } finally {
      setLoadingSubdistricts(false);
    }
  }, [apiBaseUrl]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  useEffect(() => {
    if (province) {
      const selectedProvince = provinces.find(p => p.name_th === province);
      if (selectedProvince) {
        fetchDistricts(selectedProvince.id);
      }
    } else {
      setDistricts([]);
      setDistrict('');
    }
  }, [province, provinces, fetchDistricts]);

  useEffect(() => {
    if (district) {
      const selectedDistrict = districts.find(d => d.name_th === district);
      if (selectedDistrict) {
        fetchSubdistricts(selectedDistrict.id);
      }
    } else {
      setSubdistricts([]);
      setSubdistrict('');
    }
  }, [district, districts, fetchSubdistricts]);

  useEffect(() => {
    if (subdistrict) {
      const selectedSubdistrict = subdistricts.find(s => s.name_th === subdistrict);
      if (selectedSubdistrict) {
        setPostalCode(selectedSubdistrict.zip_code);
      }
    }
  }, [subdistrict, subdistricts]);

  // Validate and notify parent
  useEffect(() => {
    const isValid = !!(
      address.trim() &&
      province &&
      district &&
      subdistrict &&
      postalCode
    );

    if (onValidate) {
      onValidate(isValid);
    }

    if (isValid) {
      onChange({
        address: address.trim(),
        province,
        district,
        subdistrict,
        postalCode,
        latitude: value.latitude,
        longitude: value.longitude
      });
    }
  }, [address, province, district, subdistrict, postalCode, onChange, onValidate, value.latitude, value.longitude]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateField = (field: string, val: string): string => {
    if (required && !val.trim()) {
      return `กรุณากรอก${
        field === 'address' ? addressLabel :
        field === 'province' ? provinceLabel :
        field === 'district' ? districtLabel :
        field === 'subdistrict' ? subdistrictLabel :
        postalCodeLabel
      }`;
    }
    return '';
  };

  const handleBlur = (field: string, val: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, val);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }
  };

  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setDistrict('');
    setSubdistrict('');
    setPostalCode('');
    if (errors.province) {
      setErrors(prev => ({ ...prev, province: '' }));
    }
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setSubdistrict('');
    setPostalCode('');
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }));
    }
  };

  const handleSubdistrictChange = (val: string) => {
    setSubdistrict(val);
    if (errors.subdistrict) {
      setErrors(prev => ({ ...prev, subdistrict: '' }));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange({
          address,
          province,
          district,
          subdistrict,
          postalCode,
          latitude,
          longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('ไม่สามารถรับตำแหน่งได้');
      }
    );
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const filterOptions = <T extends { name_th: string }>(
    items: T[],
    search: string
  ): T[] => {
    if (!search) return items;
    return items.filter(item =>
      item.name_th.toLowerCase().includes(search.toLowerCase())
    );
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (val: string) => void,
    options: { name_th: string }[],
    placeholder: string,
    loading: boolean,
    search: string,
    setSearch: (val: string) => void,
    field: string
  ) => {
    const error = errors[field];
    const isValid = touched[field] && !error && value;
    const filteredOptions = filterOptions(options, search);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          {loading ? (
            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg flex items-center gap-2 bg-gray-50">
              <Loader className="w-5 h-5 animate-spin text-gray-400" />
              <span className="text-gray-500">กำลังโหลด...</span>
            </div>
          ) : (
            <>
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => handleBlur(field, value)}
                disabled={disabled || options.length === 0}
                className={`
                  w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${error ? 'border-red-500' : isValid ? 'border-green-500' : 'border-gray-300'}
                  ${disabled || options.length === 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
              >
                <option value="">{placeholder}</option>
                {filteredOptions.map((option) => (
                  <option key={option.name_th} value={option.name_th}>
                    {option.name_th}
                  </option>
                ))}
              </select>
              
              {isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </>
          )}
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Line */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {addressLabel} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onBlur={() => handleBlur('address', address)}
            disabled={disabled}
            placeholder={addressPlaceholder}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${errors.address ? 'border-red-500' : touched.address && address ? 'border-green-500' : 'border-gray-300'}
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
            `}
          />
          {touched.address && address && !errors.address && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {errors.address && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.address}</span>
          </div>
        )}
      </div>

      {/* Province & District */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSelect(
          provinceLabel,
          province,
          handleProvinceChange,
          provinces,
          provincePlaceholder,
          loadingProvinces,
          provinceSearch,
          setProvinceSearch,
          'province'
        )}
        
        {renderSelect(
          districtLabel,
          district,
          handleDistrictChange,
          districts,
          districtPlaceholder,
          loadingDistricts,
          districtSearch,
          setDistrictSearch,
          'district'
        )}
      </div>

      {/* Subdistrict & Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSelect(
          subdistrictLabel,
          subdistrict,
          handleSubdistrictChange,
          subdistricts,
          subdistrictPlaceholder,
          loadingSubdistricts,
          subdistrictSearch,
          setSubdistrictSearch,
          'subdistrict'
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {postalCodeLabel} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={postalCode}
            readOnly
            disabled={disabled}
            placeholder="-----"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">
            รหัสไปรษณีย์จะถูกกรอกอัตโนมัติเมื่อเลือกตำบล
          </p>
        </div>
      </div>

      {/* GPS Coordinates */}
      {showGPS && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">พิกัด GPS</div>
                {value.latitude && value.longitude ? (
                  <div className="text-xs text-gray-600 mt-1">
                    {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">ยังไม่ได้ระบุพิกัด</div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={disabled}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              รับตำแหน่งปัจจุบัน
            </button>
          </div>
        </div>
      )}

      {/* Map (Placeholder) */}
      {showMap && value.latitude && value.longitude && (
        <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">แผนที่แสดงที่นี่</p>
            <p className="text-xs text-gray-500 mt-1">
              {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Pre-configured for farm address
 */
export const FarmAddressForm = (props: Omit<ThaiAddressFormProps, 'addressLabel'>) => (
  <ThaiAddressForm
    {...props}
    addressLabel="ที่อยู่ฟาร์ม"
    showMap={true}
    showGPS={true}
  />
);

/**
 * Pre-configured for user address
 */
export const UserAddressForm = (props: Omit<ThaiAddressFormProps, 'addressLabel'>) => (
  <ThaiAddressForm
    {...props}
    addressLabel="ที่อยู่ผู้ใช้"
    showMap={false}
    showGPS={false}
  />
);

/**
 * Pre-configured for company address
 */
export const CompanyAddressForm = (props: Omit<ThaiAddressFormProps, 'addressLabel'>) => (
  <ThaiAddressForm
    {...props}
    addressLabel="ที่อยู่บริษัท"
    showMap={true}
    showGPS={false}
  />
);
