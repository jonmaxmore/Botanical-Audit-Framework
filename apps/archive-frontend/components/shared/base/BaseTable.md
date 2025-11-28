# BaseTable Component

A comprehensive, feature-rich data table component designed for displaying and managing tabular data in the GACP (Good Agricultural and Collection Practices) system.

## Features

- **Flexible Column Configuration**: Define columns with custom renderers, widths, and alignment
- **Sorting**: Single-column sorting with ascending, descending, and no-sort states
- **Pagination**: Client-side pagination with customizable page sizes
- **Row Selection**: Single or multiple row selection with checkbox/radio buttons
- **Loading States**: Built-in loading indicator
- **Empty States**: Customizable empty data messages
- **Row Interactions**: Click handlers and hover effects
- **Custom Rendering**: Full control over cell content rendering
- **Row Numbers**: Optional row numbering column
- **Responsive**: Horizontal scrolling for mobile devices
- **Variants**: Default, striped, and bordered table styles
- **Compact Mode**: Reduced padding for dense data display
- **TypeScript**: Full type safety with generics

## Installation

```tsx
import BaseTable, { TableColumn, SortState } from '@/components/shared/base/BaseTable';
```

## Basic Usage

```tsx
interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
];

const columns: TableColumn<User>[] = [
  { id: 'name', label: 'Name', accessor: 'name' },
  { id: 'email', label: 'Email', accessor: 'email' },
  { id: 'status', label: 'Status', accessor: 'status' },
];

function MyTable() {
  return (
    <BaseTable
      columns={columns}
      data={users}
      rowKey="id"
    />
  );
}
```

## Props API

### BaseTableProps<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `TableColumn<T>[]` | **Required** | Array of column definitions |
| `data` | `T[]` | **Required** | Array of data objects to display |
| `rowKey` | `keyof T \| ((row: T) => string \| number)` | **Required** | Unique identifier for each row |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | Row selection mode |
| `selectedRows` | `(string \| number)[]` | `[]` | Array of selected row keys |
| `onSelectionChange` | `(keys: (string \| number)[]) => void` | - | Callback when selection changes |
| `onRowClick` | `(row: T, index: number) => void` | - | Callback when a row is clicked |
| `sortable` | `boolean` | `false` | Enable sorting for all columns |
| `defaultSort` | `SortState` | - | Initial sort state |
| `onSortChange` | `(sort: SortState) => void` | - | Callback when sort changes |
| `pagination` | `boolean` | `false` | Enable pagination |
| `pageSize` | `number` | `10` | Number of rows per page |
| `currentPage` | `number` | - | Current page (controlled) |
| `onPageChange` | `(page: number) => void` | - | Callback when page changes |
| `totalRows` | `number` | - | Total rows (for server-side pagination) |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `ReactNode` | `'No data available'` | Message when data is empty |
| `variant` | `'default' \| 'striped' \| 'bordered'` | `'default'` | Table visual variant |
| `compact` | `boolean` | `false` | Reduced padding mode |
| `hoverable` | `boolean` | `true` | Enable row hover effects |
| `className` | `string` | - | Additional CSS classes |
| `showRowNumbers` | `boolean` | `false` | Display row number column |

### TableColumn<T>

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | **Required** | Unique column identifier |
| `label` | `string` | **Required** | Column header text |
| `accessor` | `keyof T \| ((row: T) => any)` | **Required** | Property key or accessor function |
| `render` | `(value: any, row: T, index: number) => ReactNode` | - | Custom cell renderer |
| `width` | `string` | - | Column width (CSS value) |
| `sortable` | `boolean` | - | Override table sortable for this column |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell content alignment |
| `headerClassName` | `string` | - | Custom CSS class for header cell |
| `cellClassName` | `string` | - | Custom CSS class for data cells |

### SortState

```typescript
interface SortState {
  columnId: string | null;
  direction: 'asc' | 'desc' | null;
}
```

## Examples

### Farmer Database Table

```tsx
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

function FarmerDatabase() {
  const [selectedFarmers, setSelectedFarmers] = useState<(string | number)[]>([]);
  const [sortState, setSortState] = useState<SortState>({ columnId: null, direction: null });

  const columns: TableColumn<Farmer>[] = [
    {
      id: 'name',
      label: 'Farmer Name',
      accessor: 'name',
      sortable: true,
    },
    {
      id: 'farmName',
      label: 'Farm Name',
      accessor: 'farmName',
      sortable: true,
    },
    {
      id: 'certificationLevel',
      label: 'Certification',
      accessor: 'certificationLevel',
      render: (value) => (
        <span className={`px-2 py-1 rounded ${getCertColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      id: 'score',
      label: 'Score',
      accessor: 'score',
      sortable: true,
      align: 'center',
      render: (value) => (
        <span className={`font-semibold ${getScoreColor(value)}`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={farmers}
      rowKey="id"
      selectionMode="multiple"
      selectedRows={selectedFarmers}
      onSelectionChange={setSelectedFarmers}
      sortable
      onSortChange={setSortState}
      pagination
      pageSize={10}
      hoverable
    />
  );
}
```

### Audit Log Table with Striped Rows

```tsx
interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  status: 'Success' | 'Failed' | 'Pending';
}

function AuditLogTable() {
  const columns: TableColumn<AuditLog>[] = [
    {
      id: 'timestamp',
      label: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      id: 'user',
      label: 'User',
      accessor: 'user',
      sortable: true,
    },
    {
      id: 'action',
      label: 'Action',
      accessor: 'action',
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={auditLogs}
      rowKey="id"
      variant="striped"
      showRowNumbers
      pagination
      pageSize={20}
    />
  );
}
```

### Certificate Management with Loading State

```tsx
function CertificateTable() {
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const data = await fetchCertificates();
      setCertificates(data);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Certificate>[] = [
    { id: 'id', label: 'Certificate ID', accessor: 'id' },
    { id: 'farmer', label: 'Farmer', accessor: 'farmerName' },
    { id: 'type', label: 'Type', accessor: 'certificateType' },
    {
      id: 'actions',
      label: 'Actions',
      accessor: 'id',
      render: (_, row) => (
        <button onClick={() => downloadCert(row.id)}>
          Download
        </button>
      ),
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={certificates}
      rowKey="id"
      loading={loading}
      variant="bordered"
      compact
    />
  );
}
```

### User Management with Single Selection

```tsx
function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<(string | number)[]>([]);

  const columns: TableColumn<User>[] = [
    {
      id: 'name',
      label: 'Name',
      accessor: 'name',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-semibold">
              {value.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    { id: 'email', label: 'Email', accessor: 'email' },
    { id: 'role', label: 'Role', accessor: 'role' },
  ];

  return (
    <>
      <BaseTable
        columns={columns}
        data={users}
        rowKey="id"
        selectionMode="single"
        selectedRows={selectedUser}
        onSelectionChange={setSelectedUser}
        onRowClick={(row) => console.log('Clicked:', row.name)}
        hoverable
      />
      
      {selectedUser.length > 0 && (
        <div className="mt-4">
          <button>Edit Selected User</button>
        </div>
      )}
    </>
  );
}
```

### Simple Product Table

```tsx
interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

function ProductTable() {
  const columns: TableColumn<Product>[] = [
    { id: 'name', label: 'Product', accessor: 'name' },
    { 
      id: 'quantity', 
      label: 'Quantity', 
      accessor: 'quantity',
      align: 'right'
    },
    { 
      id: 'price', 
      label: 'Price', 
      accessor: 'price',
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      id: 'total', 
      label: 'Total', 
      accessor: (row) => row.quantity * row.price,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
  ];

  return (
    <BaseTable
      columns={columns}
      data={products}
      rowKey="id"
    />
  );
}
```

## Advanced Usage

### Controlled Pagination (Server-Side)

```tsx
function ServerPaginatedTable() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Farmer[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadPage(page);
  }, [page]);

  const loadPage = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await api.getFarmers({ page: pageNum, limit: pageSize });
      setData(response.data);
      setTotalRows(response.total);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseTable
      columns={columns}
      data={data}
      rowKey="id"
      pagination
      pageSize={pageSize}
      currentPage={page}
      onPageChange={setPage}
      totalRows={totalRows}
      loading={loading}
    />
  );
}
```

### Controlled Sorting

```tsx
function SortedTable() {
  const [sortState, setSortState] = useState<SortState>({
    columnId: 'name',
    direction: 'asc',
  });

  const handleSortChange = (newSort: SortState) => {
    setSortState(newSort);
    // Optionally fetch sorted data from server
    fetchSortedData(newSort);
  };

  return (
    <BaseTable
      columns={columns}
      data={data}
      rowKey="id"
      sortable
      defaultSort={sortState}
      onSortChange={handleSortChange}
    />
  );
}
```

### Custom Empty State

```tsx
function TableWithCustomEmpty() {
  return (
    <BaseTable
      columns={columns}
      data={[]}
      rowKey="id"
      emptyMessage={
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No farmers registered</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new farmer profile.</p>
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Add Farmer
            </button>
          </div>
        </div>
      }
    />
  );
}
```

### Conditional Row Styling

```tsx
function HighlightedTable() {
  const columns: TableColumn<Farmer>[] = [
    // ... column definitions
  ];

  return (
    <BaseTable
      columns={columns}
      data={farmers}
      rowKey="id"
      onRowClick={(row) => {
        if (row.status === 'Suspended') {
          alert('This farmer is currently suspended');
        }
      }}
    />
  );
}

// Style rows with CSS based on status
// In your CSS:
// tr.bg-red-50 { background-color: #fef2f2; }
```

### Combined Features Example

```tsx
function CompleteTable() {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [sort, setSort] = useState<SortState>({ columnId: null, direction: null });
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="flex gap-2">
          <button>Export {selected.length} selected</button>
          <button onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}
      
      <BaseTable
        columns={columns}
        data={farmers}
        rowKey="id"
        
        // Selection
        selectionMode="multiple"
        selectedRows={selected}
        onSelectionChange={setSelected}
        
        // Sorting
        sortable
        onSortChange={setSort}
        
        // Pagination
        pagination
        pageSize={15}
        currentPage={page}
        onPageChange={setPage}
        
        // Interaction
        onRowClick={(row) => router.push(`/farmer/${row.id}`)}
        hoverable
        
        // Visual
        variant="striped"
        showRowNumbers
      />
    </div>
  );
}
```

## Best Practices

### DO ✅

```tsx
// ✅ Use TypeScript interfaces for type safety
interface Farmer {
  id: number;
  name: string;
  // ...
}

const columns: TableColumn<Farmer>[] = [
  // Compiler ensures accessor matches Farmer properties
  { id: 'name', label: 'Name', accessor: 'name' },
];

// ✅ Memoize columns to prevent re-renders
const columns = useMemo(() => [
  { id: 'name', label: 'Name', accessor: 'name' },
  // ...
], []);

// ✅ Use controlled components for complex state
const [selectedRows, setSelectedRows] = useState<number[]>([]);

// ✅ Provide meaningful empty messages
emptyMessage={
  <div>
    <p>No farmers found</p>
    <button>Register New Farmer</button>
  </div>
}

// ✅ Use custom renderers for formatted data
{
  id: 'price',
  label: 'Price',
  accessor: 'price',
  render: (value) => `฿${value.toFixed(2)}`,
}

// ✅ Server-side pagination for large datasets
<BaseTable
  pagination
  totalRows={apiResponse.total}
  onPageChange={fetchPage}
/>
```

### DON'T ❌

```tsx
// ❌ Don't create columns inside render
function MyTable() {
  // This creates new columns array every render!
  const columns = [
    { id: 'name', label: 'Name', accessor: 'name' },
  ];
  return <BaseTable columns={columns} data={data} rowKey="id" />;
}

// ❌ Don't use index as rowKey
<BaseTable rowKey={(row, index) => index} /> // BAD

// ❌ Don't forget to handle selection changes
<BaseTable
  selectionMode="multiple"
  selectedRows={selected}
  // Missing: onSelectionChange={setSelected}
/>

// ❌ Don't mix controlled and uncontrolled
<BaseTable
  currentPage={page}
  // Missing: onPageChange={setPage}
/>

// ❌ Don't perform heavy operations in render functions
{
  id: 'data',
  render: (value) => {
    // BAD: Heavy processing on every render
    return processLargeData(value);
  },
}

// ❌ Don't forget accessibility
// BAD: No rowKey provided
<BaseTable columns={columns} data={data} />
```

## Accessibility

BaseTable follows WCAG 2.1 guidelines:

- **Semantic HTML**: Uses proper `<table>`, `<thead>`, `<tbody>` elements
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Selection**: Checkboxes and radio buttons are properly labeled
- **Sort Indicators**: Visual indicators show sort state
- **Focus Management**: Proper focus states on interactive elements
- **Screen Readers**: Appropriate ARIA labels (when needed)

### Recommendations

```tsx
// Provide descriptive column labels
{ id: 'actions', label: 'Available Actions', accessor: 'id' }

// Use semantic HTML in custom renderers
render: (value) => <a href={`/profile/${value}`}>View Profile</a>

// Ensure sufficient color contrast
// Use colors from your design system

// Test with keyboard only
// Tab through selectable rows and clickable cells
```

## Performance Tips

### 1. Memoize Columns

```tsx
const columns = useMemo<TableColumn<Farmer>[]>(() => [
  { id: 'name', label: 'Name', accessor: 'name' },
  { id: 'email', label: 'Email', accessor: 'email' },
], []);
```

### 2. Use Pagination for Large Datasets

```tsx
// For > 100 rows, enable pagination
<BaseTable
  data={largeDataset}
  pagination
  pageSize={20}
/>
```

### 3. Optimize Custom Renderers

```tsx
// ❌ BAD: Creates new component every render
render: (value) => <CustomComponent value={value} />

// ✅ GOOD: Memoize or use simple JSX
const StatusBadge = memo(({ status }) => <span>{status}</span>);
render: (value) => <StatusBadge status={value} />
```

### 4. Virtual Scrolling for Very Large Datasets

For datasets with thousands of rows, consider using a virtual scrolling library like `react-window` or implement server-side pagination.

## Troubleshooting

### Sorting doesn't work

**Problem**: Clicking column headers doesn't sort data

**Solution**: Ensure `sortable` prop is `true` or individual columns have `sortable: true`

```tsx
<BaseTable sortable columns={columns} data={data} rowKey="id" />
```

### Selection not updating

**Problem**: Selected rows don't highlight

**Solution**: Ensure you're handling `onSelectionChange` and updating state

```tsx
const [selected, setSelected] = useState<number[]>([]);

<BaseTable
  selectionMode="multiple"
  selectedRows={selected}
  onSelectionChange={setSelected}
/>
```

### Pagination shows wrong page count

**Problem**: Page count doesn't match actual pages

**Solution**: For server-side pagination, provide `totalRows` prop

```tsx
<BaseTable
  pagination
  pageSize={10}
  totalRows={apiResponse.total} // Total rows from server
/>
```

### Custom renderer not updating

**Problem**: Custom cell content doesn't re-render

**Solution**: Ensure your render function doesn't have stale closures

```tsx
// Define render function properly
const columns: TableColumn<User>[] = [
  {
    id: 'status',
    label: 'Status',
    accessor: 'status',
    render: (value, row) => {
      // Has access to current value and row
      return <StatusBadge status={value} />;
    },
  },
];
```

### TypeScript errors with rowKey

**Problem**: TypeScript error: "Type 'string' is not assignable to type 'number'"

**Solution**: Ensure rowKey matches your data type

```tsx
interface User {
  id: number; // or string
  // ...
}

// If id is number:
<BaseTable rowKey="id" />

// If id is string:
<BaseTable rowKey="id" />

// Custom function:
<BaseTable rowKey={(row) => row.customId} />
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 13+, Chrome Android

## Related Components

- **BaseCard**: Wrap tables in cards for consistent layout
- **BaseButton**: Use in action columns
- **BaseInput**: Combine with table for inline editing
- **BaseForm**: Use for row editing forms

## Migration from Old Table Components

```tsx
// Old (farmer-portal/components/FarmerTable.tsx)
<FarmerTable
  farmers={data}
  onSelect={handleSelect}
/>

// New (Recommended)
<BaseTable
  columns={farmerColumns}
  data={data}
  rowKey="id"
  selectionMode="single"
  selectedRows={selected}
  onSelectionChange={handleSelect}
  sortable
  pagination
/>
```

## Support

For issues or questions:
- Check examples in `BaseTable.example.tsx`
- Review test cases in `BaseTable.test.tsx`
- Contact: Phase 5 Week 3-4 Refactoring Team

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Component Location**: `apps/frontend/components/shared/base/BaseTable.tsx`
