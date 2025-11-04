/**
 * BaseTable Component - Usage Examples
 * 
 * Demonstrates various table configurations for GACP system:
 * - Farmer database listing
 * - Audit log display
 * - Certificate management
 * - User management
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { useState } from 'react';
import BaseTable, { TableColumn, SortState } from './BaseTable';
import BaseCard from './BaseCard';
import BaseButton from './BaseButton';

// ============================================================================
// Types
// ============================================================================

interface Farmer {
  id: number;
  name: string;
  farmName: string;
  location: string;
  certificationLevel: 'Basic' | 'Intermediate' | 'Advanced';
  status: 'Active' | 'Pending' | 'Suspended';
  lastInspection: string;
  score: number;
}

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  status: 'Success' | 'Failed' | 'Pending';
  details: string;
}

interface Certificate {
  id: string;
  farmerName: string;
  certificateType: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expired' | 'Revoked';
  downloadUrl: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Inspector' | 'Farmer';
  lastActive: string;
  status: 'Online' | 'Offline';
}

// ============================================================================
// Sample Data
// ============================================================================

const farmers: Farmer[] = [
  {
    id: 1,
    name: 'Somchai Prasert',
    farmName: 'Green Valley Farm',
    location: 'Chiang Mai',
    certificationLevel: 'Advanced',
    status: 'Active',
    lastInspection: '2025-10-15',
    score: 95,
  },
  {
    id: 2,
    name: 'Niran Tanaka',
    farmName: 'Organic Hills',
    location: 'Chiang Rai',
    certificationLevel: 'Intermediate',
    status: 'Active',
    lastInspection: '2025-09-20',
    score: 87,
  },
  {
    id: 3,
    name: 'Preecha Wongsawat',
    farmName: 'Sunrise Gardens',
    location: 'Lampang',
    certificationLevel: 'Basic',
    status: 'Pending',
    lastInspection: '2025-08-10',
    score: 72,
  },
  {
    id: 4,
    name: 'Anan Kittipong',
    farmName: 'Mountain View Farm',
    location: 'Mae Hong Son',
    certificationLevel: 'Advanced',
    status: 'Active',
    lastInspection: '2025-11-01',
    score: 98,
  },
  {
    id: 5,
    name: 'Surasak Pimolrat',
    farmName: 'Golden Harvest',
    location: 'Phayao',
    certificationLevel: 'Intermediate',
    status: 'Suspended',
    lastInspection: '2025-07-15',
    score: 65,
  },
  {
    id: 6,
    name: 'Wichai Saengsuk',
    farmName: 'Blue Sky Organics',
    location: 'Nan',
    certificationLevel: 'Basic',
    status: 'Active',
    lastInspection: '2025-10-28',
    score: 78,
  },
  {
    id: 7,
    name: 'Prasit Komon',
    farmName: 'Eco Valley',
    location: 'Uttaradit',
    certificationLevel: 'Advanced',
    status: 'Active',
    lastInspection: '2025-10-22',
    score: 92,
  },
  {
    id: 8,
    name: 'Thawatchai Boonmee',
    farmName: 'Nature Paradise',
    location: 'Phrae',
    certificationLevel: 'Intermediate',
    status: 'Active',
    lastInspection: '2025-09-15',
    score: 84,
  },
];

const auditLogs: AuditLog[] = [
  {
    id: 1,
    timestamp: '2025-11-04 10:23:45',
    user: 'Admin User',
    action: 'Certificate Issued',
    target: 'CERT-2025-001',
    status: 'Success',
    details: 'Advanced certification issued to Somchai Prasert',
  },
  {
    id: 2,
    timestamp: '2025-11-04 09:15:22',
    user: 'Inspector John',
    action: 'Inspection Completed',
    target: 'Farm ID: 7',
    status: 'Success',
    details: 'Annual inspection completed with score 92',
  },
  {
    id: 3,
    timestamp: '2025-11-03 16:42:11',
    user: 'System',
    action: 'Auto Reminder',
    target: 'All Pending Farmers',
    status: 'Pending',
    details: 'Sent inspection reminder emails',
  },
  {
    id: 4,
    timestamp: '2025-11-03 14:30:00',
    user: 'Admin User',
    action: 'User Registration',
    target: 'Farmer ID: 8',
    status: 'Success',
    details: 'New farmer registered: Thawatchai Boonmee',
  },
  {
    id: 5,
    timestamp: '2025-11-03 11:20:33',
    user: 'Inspector Mary',
    action: 'Document Upload',
    target: 'Farm ID: 5',
    status: 'Failed',
    details: 'File size exceeded limit',
  },
];

const certificates: Certificate[] = [
  {
    id: 'CERT-2025-001',
    farmerName: 'Somchai Prasert',
    certificateType: 'GAP Advanced',
    issueDate: '2025-01-15',
    expiryDate: '2026-01-15',
    status: 'Valid',
    downloadUrl: '/certificates/cert-001.pdf',
  },
  {
    id: 'CERT-2024-156',
    farmerName: 'Niran Tanaka',
    certificateType: 'GAP Intermediate',
    issueDate: '2024-06-20',
    expiryDate: '2025-06-20',
    status: 'Valid',
    downloadUrl: '/certificates/cert-156.pdf',
  },
  {
    id: 'CERT-2024-089',
    farmerName: 'Anan Kittipong',
    certificateType: 'GAP Advanced',
    issueDate: '2024-03-10',
    expiryDate: '2025-03-10',
    status: 'Expired',
    downloadUrl: '/certificates/cert-089.pdf',
  },
  {
    id: 'CERT-2023-234',
    farmerName: 'Surasak Pimolrat',
    certificateType: 'GAP Basic',
    issueDate: '2023-11-01',
    expiryDate: '2024-11-01',
    status: 'Revoked',
    downloadUrl: '/certificates/cert-234.pdf',
  },
];

const users: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@gacp.com',
    role: 'Admin',
    lastActive: '2025-11-04 10:30:00',
    status: 'Online',
  },
  {
    id: 2,
    name: 'Inspector John',
    email: 'john@gacp.com',
    role: 'Inspector',
    lastActive: '2025-11-04 09:15:00',
    status: 'Online',
  },
  {
    id: 3,
    name: 'Inspector Mary',
    email: 'mary@gacp.com',
    role: 'Inspector',
    lastActive: '2025-11-03 16:45:00',
    status: 'Offline',
  },
  {
    id: 4,
    name: 'Somchai Prasert',
    email: 'somchai@email.com',
    role: 'Farmer',
    lastActive: '2025-11-02 14:20:00',
    status: 'Offline',
  },
];

// ============================================================================
// Status Badge Component
// ============================================================================

const StatusBadge: React.FC<{ status: string; type?: 'farmer' | 'audit' | 'certificate' | 'user' }> = ({ 
  status, 
  type = 'farmer' 
}) => {
  const getColors = () => {
    if (type === 'farmer') {
      switch (status) {
        case 'Active':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Suspended':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else if (type === 'audit') {
      switch (status) {
        case 'Success':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Pending':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Failed':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else if (type === 'certificate') {
      switch (status) {
        case 'Valid':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Expired':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Revoked':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else if (type === 'user') {
      switch (status) {
        case 'Online':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'Offline':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getColors()}`}>
      {status}
    </span>
  );
};

// ============================================================================
// Example 1: Farmer Database Table
// ============================================================================

export const FarmerDatabaseExample: React.FC = () => {
  const [selectedFarmers, setSelectedFarmers] = useState<(string | number)[]>([]);
  const [sortState, setSortState] = useState<SortState>({ columnId: null, direction: null });

  const columns: TableColumn<Farmer>[] = [
    {
      id: 'name',
      label: 'Farmer Name',
      accessor: 'name',
      sortable: true,
      width: '180px',
    },
    {
      id: 'farmName',
      label: 'Farm Name',
      accessor: 'farmName',
      sortable: true,
      width: '200px',
    },
    {
      id: 'location',
      label: 'Location',
      accessor: 'location',
      sortable: true,
    },
    {
      id: 'certificationLevel',
      label: 'Certification',
      accessor: 'certificationLevel',
      sortable: true,
      render: (value) => {
        const colors = {
          Basic: 'bg-blue-100 text-blue-800',
          Intermediate: 'bg-purple-100 text-purple-800',
          Advanced: 'bg-green-100 text-green-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      render: (value) => <StatusBadge status={value} type="farmer" />,
    },
    {
      id: 'score',
      label: 'Score',
      accessor: 'score',
      sortable: true,
      align: 'center',
      render: (value) => {
        const color = value >= 90 ? 'text-green-600' : value >= 75 ? 'text-blue-600' : 'text-orange-600';
        return <span className={`font-semibold ${color}`}>{value}</span>;
      },
    },
    {
      id: 'lastInspection',
      label: 'Last Inspection',
      accessor: 'lastInspection',
      sortable: true,
      width: '140px',
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: 'id',
      align: 'center',
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(`View details for ${row.name}`);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(`Edit ${row.name}`);
            }}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <BaseCard
      title="Farmer Database"
      subtitle="Manage and monitor all registered farmers"
      headerActions={
        <BaseButton size="small" variant="contained">
          Add Farmer
        </BaseButton>
      }
    >
      <div className="space-y-4">
        {selectedFarmers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedFarmers.length} farmer(s) selected
            </span>
            <div className="flex gap-2">
              <BaseButton size="small" variant="outlined">
                Export Selected
              </BaseButton>
              <BaseButton
                size="small"
                variant="text"
                onClick={() => setSelectedFarmers([])}
              >
                Clear Selection
              </BaseButton>
            </div>
          </div>
        )}

        <BaseTable
          columns={columns}
          data={farmers}
          rowKey="id"
          selectionMode="multiple"
          selectedRows={selectedFarmers}
          onSelectionChange={setSelectedFarmers}
          sortable
          defaultSort={sortState}
          onSortChange={setSortState}
          pagination
          pageSize={5}
          hoverable
          onRowClick={(row) => alert(`Viewing farmer: ${row.name}`)}
        />
      </div>
    </BaseCard>
  );
};

// ============================================================================
// Example 2: Audit Log Table
// ============================================================================

export const AuditLogExample: React.FC = () => {
  const columns: TableColumn<AuditLog>[] = [
    {
      id: 'timestamp',
      label: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      width: '180px',
      render: (value) => <span className="text-gray-600 text-sm font-mono">{value}</span>,
    },
    {
      id: 'user',
      label: 'User',
      accessor: 'user',
      sortable: true,
      width: '150px',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      id: 'action',
      label: 'Action',
      accessor: 'action',
      sortable: true,
    },
    {
      id: 'target',
      label: 'Target',
      accessor: 'target',
      render: (value) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{value}</code>,
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      render: (value) => <StatusBadge status={value} type="audit" />,
      align: 'center',
    },
    {
      id: 'details',
      label: 'Details',
      accessor: 'details',
      cellClassName: 'max-w-md truncate',
    },
  ];

  return (
    <BaseCard
      title="Audit Log"
      subtitle="System activity and changes tracking"
    >
      <BaseTable
        columns={columns}
        data={auditLogs}
        rowKey="id"
        variant="striped"
        showRowNumbers
        pagination
        pageSize={3}
      />
    </BaseCard>
  );
};

// ============================================================================
// Example 3: Certificate Management Table
// ============================================================================

export const CertificateManagementExample: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = (url: string, certId: string) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Downloading certificate: ${certId}`);
      setLoading(false);
    }, 1000);
  };

  const columns: TableColumn<Certificate>[] = [
    {
      id: 'id',
      label: 'Certificate ID',
      accessor: 'id',
      sortable: true,
      width: '150px',
      render: (value) => <code className="text-sm font-semibold text-blue-600">{value}</code>,
    },
    {
      id: 'farmerName',
      label: 'Farmer Name',
      accessor: 'farmerName',
      sortable: true,
    },
    {
      id: 'certificateType',
      label: 'Type',
      accessor: 'certificateType',
      sortable: true,
    },
    {
      id: 'issueDate',
      label: 'Issue Date',
      accessor: 'issueDate',
      sortable: true,
    },
    {
      id: 'expiryDate',
      label: 'Expiry Date',
      accessor: 'expiryDate',
      sortable: true,
      render: (value, row) => {
        const isExpired = row.status === 'Expired';
        return (
          <span className={isExpired ? 'text-red-600 font-medium' : ''}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      render: (value) => <StatusBadge status={value} type="certificate" />,
      align: 'center',
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: 'downloadUrl',
      align: 'center',
      render: (url, row) => (
        <BaseButton
          size="small"
          variant="outlined"
          onClick={() => handleDownload(url, row.id)}
          disabled={row.status === 'Revoked'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </BaseButton>
      ),
    },
  ];

  return (
    <BaseCard
      title="Certificate Management"
      subtitle="View and download certification documents"
    >
      <BaseTable
        columns={columns}
        data={certificates}
        rowKey="id"
        loading={loading}
        variant="bordered"
        compact
        hoverable
      />
    </BaseCard>
  );
};

// ============================================================================
// Example 4: User Management Table
// ============================================================================

export const UserManagementExample: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<(string | number)[]>([]);

  const columns: TableColumn<User>[] = [
    {
      id: 'name',
      label: 'Name',
      accessor: 'name',
      sortable: true,
      render: (value, _row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">
              {value.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      id: 'role',
      label: 'Role',
      accessor: 'role',
      render: (value) => {
        const colors = {
          Admin: 'bg-red-100 text-red-800',
          Inspector: 'bg-blue-100 text-blue-800',
          Farmer: 'bg-green-100 text-green-800',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      id: 'lastActive',
      label: 'Last Active',
      accessor: 'lastActive',
      sortable: true,
      width: '180px',
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${value === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
  ];

  return (
    <BaseCard
      title="User Management"
      subtitle="System users and their activity"
      headerActions={
        <BaseButton size="small" variant="contained">
          Invite User
        </BaseButton>
      }
    >
      <BaseTable
        columns={columns}
        data={users}
        rowKey="id"
        selectionMode="single"
        selectedRows={selectedUser}
        onSelectionChange={setSelectedUser}
        sortable
        hoverable
        emptyMessage={
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800">
              Add your first user
            </button>
          </div>
        }
      />

      {selectedUser.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Selected User Actions:</p>
          <div className="flex gap-2">
            <BaseButton size="small" variant="contained">Edit Profile</BaseButton>
            <BaseButton size="small" variant="outlined">Reset Password</BaseButton>
            <BaseButton size="small" variant="text">View Logs</BaseButton>
          </div>
        </div>
      )}
    </BaseCard>
  );
};

// ============================================================================
// Example 5: Simple Table (Minimal Configuration)
// ============================================================================

export const SimpleTableExample: React.FC = () => {
  const simpleData = [
    { id: 1, product: 'Organic Rice', quantity: 1000, unit: 'kg', price: 45.00 },
    { id: 2, product: 'Fresh Vegetables', quantity: 500, unit: 'kg', price: 35.00 },
    { id: 3, product: 'Herbal Tea', quantity: 200, unit: 'kg', price: 120.00 },
  ];

  const columns: TableColumn[] = [
    { id: 'product', label: 'Product', accessor: 'product' },
    { id: 'quantity', label: 'Quantity', accessor: 'quantity', align: 'right' },
    { id: 'unit', label: 'Unit', accessor: 'unit' },
    { 
      id: 'price', 
      label: 'Price (THB)', 
      accessor: 'price', 
      align: 'right',
      render: (value) => `฿${value.toFixed(2)}`
    },
    { 
      id: 'total', 
      label: 'Total (THB)', 
      accessor: (_row: any) => _row.quantity * _row.price,
      align: 'right',
      render: (value) => <span className="font-semibold">฿{value.toFixed(2)}</span>
    },
  ];

  return (
    <BaseCard title="Product Inventory" subtitle="Current stock levels">
      <BaseTable
        columns={columns}
        data={simpleData}
        rowKey="id"
      />
    </BaseCard>
  );
};

// ============================================================================
// Main Demo Component
// ============================================================================

export default function BaseTableExamples() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BaseTable Component Examples</h1>
          <p className="text-gray-600">Real-world table configurations for GACP system</p>
        </div>

        <FarmerDatabaseExample />
        <AuditLogExample />
        <CertificateManagementExample />
        <UserManagementExample />
        <SimpleTableExample />
      </div>
    </div>
  );
}
