import React, { useState } from 'react';
import BasePagination from './BasePagination';
import BaseCard from './BaseCard';
import BaseBadge from './BaseBadge';

/**
 * Example 1: Basic Pagination
 */
export const BasicPaginationExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 150;
  const pageSize = 10;

  return (
    <BaseCard title="Basic Pagination" variant="outlined">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Current Page: <strong>{currentPage}</strong>
        </div>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 2: Pagination Variants
 */
export const PaginationVariantsExample: React.FC = () => {
  const [defaultPage, setDefaultPage] = useState(1);
  const [minimalPage, setMinimalPage] = useState(1);
  const [compactPage, setCompactPage] = useState(1);
  
  const totalItems = 100;
  const pageSize = 10;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Default Variant</h3>
        <BasePagination
          currentPage={defaultPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setDefaultPage}
          variant="default"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Minimal Variant</h3>
        <BasePagination
          currentPage={minimalPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setMinimalPage}
          variant="minimal"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Compact Variant</h3>
        <BasePagination
          currentPage={compactPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCompactPage}
          variant="compact"
        />
      </div>
    </div>
  );
};

/**
 * Example 3: Pagination Sizes
 */
export const PaginationSizesExample: React.FC = () => {
  const [smallPage, setSmallPage] = useState(1);
  const [mediumPage, setMediumPage] = useState(1);
  const [largePage, setLargePage] = useState(1);
  
  const totalItems = 100;
  const pageSize = 10;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Small Size</h3>
        <BasePagination
          currentPage={smallPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setSmallPage}
          size="small"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Medium Size (Default)</h3>
        <BasePagination
          currentPage={mediumPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setMediumPage}
          size="medium"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Large Size</h3>
        <BasePagination
          currentPage={largePage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setLargePage}
          size="large"
        />
      </div>
    </div>
  );
};

/**
 * Example 4: With Page Size Selector
 */
export const PageSizeSelectorExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 250;

  return (
    <BaseCard title="Page Size Selector" variant="outlined">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Current Page: <strong>{currentPage}</strong>, Items per Page: <strong>{pageSize}</strong>
        </div>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          showPageSize
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 5: With Jump To Page
 */
export const JumpToPageExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 500;
  const pageSize = 10;

  return (
    <BaseCard title="Jump To Page" variant="outlined">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Total Pages: <strong>{Math.ceil(totalItems / pageSize)}</strong>
        </div>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showJumpTo
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 6: Minimal Configuration
 */
export const MinimalConfigExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 100;
  const pageSize = 10;

  return (
    <BaseCard title="Minimal Configuration" variant="outlined">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Only navigation buttons, no extras
        </p>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          showTotal={false}
          showPageSize={false}
          showFirstLast={false}
          maxPageButtons={5}
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 7: Real-World Farm List with Pagination
 */
export const FarmListExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Mock farm data
  const allFarms = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    name: `Farm ${i + 1}`,
    location: ['Chiang Mai', 'Bangkok', 'Phuket', 'Khon Kaen', 'Nakhon Ratchasima'][i % 5],
    size: Math.floor(Math.random() * 50) + 10,
    status: ['Active', 'Pending', 'Expired'][i % 3],
  }));

  // Paginate data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFarms = allFarms.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      Active: 'success',
      Pending: 'warning',
      Expired: 'error',
    };
    return colorMap[status] || 'gray';
  };

  return (
    <BaseCard title="G.A.C.P. Certified Farms" variant="outlined">
      <div className="space-y-4">
        {/* Farm List */}
        <div className="space-y-2">
          {currentFarms.map((farm) => (
            <div
              key={farm.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{farm.name}</h4>
                  <p className="text-sm text-gray-600">
                    📍 {farm.location} • {farm.size} hectares
                  </p>
                </div>
                <BaseBadge variant="soft" color={getStatusColor(farm.status)}>
                  {farm.status}
                </BaseBadge>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <BasePagination
          currentPage={currentPage}
          totalItems={allFarms.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20]}
          showPageSize
          showTotal
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 8: Certificate List with Advanced Pagination
 */
export const CertificateListExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Mock certificate data
  const allCertificates = Array.from({ length: 156 }, (_, i) => ({
    id: `GACP-2024-${String(i + 1).padStart(6, '0')}`,
    farmName: `Farm ${i + 1}`,
    issueDate: new Date(2024, 0, 1 + (i % 365)).toLocaleDateString(),
    expiryDate: new Date(2027, 0, 1 + (i % 365)).toLocaleDateString(),
    status: i % 10 === 0 ? 'Expiring Soon' : i % 15 === 0 ? 'Expired' : 'Active',
  }));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCertificates = allCertificates.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, any> = {
      Active: 'success',
      'Expiring Soon': 'warning',
      Expired: 'error',
    };
    return colorMap[status] || 'gray';
  };

  return (
    <BaseCard title="Certificate Database" variant="outlined">
      <div className="space-y-4">
        {/* Certificate Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-semibold text-sm">Certificate ID</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Farm Name</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Issue Date</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Expiry Date</th>
                <th className="text-left py-2 px-4 font-semibold text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentCertificates.map((cert) => (
                <tr key={cert.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono">{cert.id}</td>
                  <td className="py-3 px-4 text-sm">{cert.farmName}</td>
                  <td className="py-3 px-4 text-sm">{cert.issueDate}</td>
                  <td className="py-3 px-4 text-sm">{cert.expiryDate}</td>
                  <td className="py-3 px-4">
                    <BaseBadge variant="soft" color={getStatusColor(cert.status)} size="small">
                      {cert.status}
                    </BaseBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Advanced Pagination */}
        <BasePagination
          currentPage={currentPage}
          totalItems={allCertificates.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          showPageSize
          showTotal
          showJumpTo
          showFirstLast
          maxPageButtons={7}
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 9: Disabled State
 */
export const DisabledPaginationExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = 100;
  const pageSize = 10;

  return (
    <BaseCard title="Disabled Pagination" variant="outlined">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Pagination is disabled (e.g., while loading data)
        </p>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          disabled
        />
      </div>
    </BaseCard>
  );
};

/**
 * Example 10: Custom Labels (Internationalization)
 */
export const CustomLabelsExample: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 100;

  // Thai language labels
  const thaiLabels = {
    previous: 'ก่อนหน้า',
    next: 'ถัดไป',
    first: 'หน้าแรก',
    last: 'หน้าสุดท้าย',
    page: 'หน้า',
    of: 'จาก',
    items: 'รายการ',
    showing: 'แสดง',
    to: 'ถึง',
    jumpTo: 'ไปที่หน้า',
    go: 'ไป',
  };

  return (
    <BaseCard title="Custom Labels (Thai)" variant="outlined">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Pagination with Thai language labels
        </p>
        
        <BasePagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          labels={thaiLabels}
          showJumpTo
        />
      </div>
    </BaseCard>
  );
};

const examples = {
  BasicPaginationExample,
  PaginationVariantsExample,
  PaginationSizesExample,
  PageSizeSelectorExample,
  JumpToPageExample,
  MinimalConfigExample,
  FarmListExample,
  CertificateListExample,
  DisabledPaginationExample,
  CustomLabelsExample,
};

export default examples;
