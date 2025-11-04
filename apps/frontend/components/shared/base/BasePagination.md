# BasePagination Component

A comprehensive pagination component that provides page navigation, page size selection, and jump-to-page functionality for handling large datasets.

## Features

- **Page Navigation**: Previous, next, first, and last page buttons
- **Smart Page Numbers**: Automatic ellipsis for large page counts with intelligent range display
- **Page Size Selection**: Customizable dropdown to change items per page
- **Jump To Page**: Quick navigation input with Enter key support
- **Current Range Display**: Shows "Showing X to Y of Z items"
- **Three Variants**: Default (bordered), Minimal (clean), Compact (gray background)
- **Three Sizes**: Small, medium, and large
- **Keyboard Support**: Enter key in jump-to-page input
- **Customizable Labels**: Full i18n support for all text labels
- **Responsive Design**: Two-row layout that adapts to screen size
- **Disabled State**: Support for loading states

## Installation

```tsx
import BasePagination from '@/components/shared/base/BasePagination';
```

## Basic Usage

```tsx
function MyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const totalItems = 250; // Total number of items
  
  // Calculate items for current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = allData.slice(startIndex, endIndex);

  return (
    <div>
      <table>
        {/* Render currentPageData */}
      </table>
      
      <BasePagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | **Required** | Current active page (1-indexed) |
| `totalItems` | `number` | **Required** | Total number of items across all pages |
| `pageSize` | `number` | **Required** | Number of items per page |
| `onPageChange` | `(page: number) => void` | **Required** | Callback when page changes |
| `onPageSizeChange` | `(size: number) => void` | `undefined` | Callback when page size changes |
| `variant` | `'default' \| 'minimal' \| 'compact'` | `'default'` | Visual style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |
| `showFirstLast` | `boolean` | `true` | Show first/last page buttons |
| `showTotal` | `boolean` | `true` | Show "Showing X to Y of Z items" text |
| `showPageSize` | `boolean` | `false` | Show page size selector dropdown |
| `showJumpTo` | `boolean` | `false` | Show jump to page input |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Available page size options |
| `maxPageButtons` | `number` | `7` | Maximum number of page buttons to display |
| `disabled` | `boolean` | `false` | Disable all controls (for loading states) |
| `labels` | `PaginationLabels` | See below | Custom text labels for i18n |
| `className` | `string` | `undefined` | Additional CSS classes |

### PaginationLabels Type

```tsx
interface PaginationLabels {
  previous?: string;      // "Previous"
  next?: string;          // "Next"
  first?: string;         // "First"
  last?: string;          // "Last"
  page?: string;          // "Page"
  of?: string;            // "of"
  items?: string;         // "items"
  showing?: string;       // "Showing"
  to?: string;            // "to"
  jumpTo?: string;        // "Jump to:"
  go?: string;            // "Go"
}
```

## Variants

### Default Variant
Bordered buttons with white background - classic pagination style.

```tsx
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  variant="default"
/>
```

### Minimal Variant
Clean design without borders, using background colors for hover states.

```tsx
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  variant="minimal"
/>
```

### Compact Variant
Gray background buttons for a more subtle appearance.

```tsx
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  variant="compact"
/>
```

## Sizes

```tsx
// Small - h-8, text-sm
<BasePagination
  size="small"
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
/>

// Medium - h-10, text-base (default)
<BasePagination
  size="medium"
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
/>

// Large - h-12, text-lg
<BasePagination
  size="large"
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
/>
```

## Page Size Selection

Enable the page size dropdown to let users choose how many items to display per page:

```tsx
function DataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    // Optionally adjust current page if it becomes invalid
    const newTotalPages = Math.ceil(totalItems / newSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  return (
    <BasePagination
      currentPage={currentPage}
      totalItems={250}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={handlePageSizeChange}
      showPageSize={true}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
```

**Note**: The component automatically adjusts the current page if changing the page size makes the current page invalid.

## Jump To Page

Enable quick navigation to specific pages with the jump-to-page input:

```tsx
<BasePagination
  currentPage={page}
  totalItems={500}
  pageSize={10}
  onPageChange={setPage}
  showJumpTo={true}
/>
```

Users can:
- Type a page number
- Press Enter or click "Go" to navigate
- Input is validated against valid page range

## Smart Page Number Generation

The component intelligently displays page numbers with ellipsis (...) when there are many pages:

### Small Dataset (shows all pages)
```
[First] [Prev] [1] [2] [3] [4] [5] [Next] [Last]
```

### Large Dataset (uses ellipsis)
```
[First] [Prev] [1] ... [8] [9] [10] [11] [12] ... [50] [Next] [Last]
                      └─── Current page (10) ───┘
```

The algorithm ensures:
- First and last pages are always visible
- Current page is always visible
- Pages around current page (±offset) are visible
- Ellipsis indicates hidden pages
- Smooth transitions as you navigate

Control with `maxPageButtons` prop (default: 7):
```tsx
<BasePagination
  currentPage={page}
  totalItems={1000}
  pageSize={10}
  onPageChange={setPage}
  maxPageButtons={5} // Show fewer page buttons
/>
```

## Internationalization (i18n)

Customize all text labels for localization:

```tsx
// Thai language example
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

<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  labels={thaiLabels}
  showTotal
  showJumpTo
/>
```

You can override only specific labels:
```tsx
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  labels={{
    previous: 'Prev',
    next: 'Next Page',
  }}
/>
```

## Real-World Examples

### Data Table with Full Features

```tsx
function CertificateTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const certificates = useCertificates(); // Assume 156 total
  const totalItems = certificates.length;
  
  // Calculate current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = certificates.slice(startIndex, endIndex);

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr>
            <th>Certificate ID</th>
            <th>Farm Name</th>
            <th>Issue Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((cert) => (
            <tr key={cert.id}>
              <td>{cert.id}</td>
              <td>{cert.farmName}</td>
              <td>{cert.issueDate}</td>
              <td>{cert.expiryDate}</td>
              <td>
                <BaseBadge variant={cert.status === 'Active' ? 'success' : 'warning'}>
                  {cert.status}
                </BaseBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <BasePagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showTotal
        showPageSize
        showJumpTo
        pageSizeOptions={[10, 20, 50, 100]}
        maxPageButtons={7}
      />
    </div>
  );
}
```

### Search Results with API Pagination

```tsx
function SearchResults() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  
  const { data, totalCount } = useSearchQuery({
    page: currentPage,
    limit: pageSize,
  });

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setCurrentPage(newPage);
    // API call happens automatically via useSearchQuery
    setLoading(false);
  };

  return (
    <div>
      <div className="results-grid">
        {data.map((item) => (
          <ResultCard key={item.id} data={item} />
        ))}
      </div>

      <BasePagination
        currentPage={currentPage}
        totalItems={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={setPageSize}
        showPageSize
        showJumpTo
        disabled={loading}
      />
    </div>
  );
}
```

### Card Grid with Minimal Pagination

```tsx
function FarmList() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const farms = useFarms(); // 47 total farms
  const totalItems = farms.length;
  
  const startIndex = (currentPage - 1) * pageSize;
  const currentFarms = farms.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFarms.map((farm) => (
          <BaseCard key={farm.id}>
            <h3>{farm.name}</h3>
            <p>{farm.location}</p>
            <BaseBadge variant={
              farm.status === 'Active' ? 'success' :
              farm.status === 'Pending' ? 'warning' : 'error'
            }>
              {farm.status}
            </BaseBadge>
          </BaseCard>
        ))}
      </div>

      <BasePagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        variant="minimal"
        showTotal={false}
      />
    </div>
  );
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` | Submit jump-to-page input |

## Accessibility

The component follows WAI-ARIA best practices:

- **ARIA Labels**: All buttons have descriptive `aria-label` attributes
  - Previous: `aria-label="Previous"`
  - Next: `aria-label="Next"`
  - First: `aria-label="First"`
  - Last: `aria-label="Last"`
  - Page numbers: `aria-label="Page N"`
  
- **Current Page**: Active page has `aria-current="page"`
  
- **Disabled State**: Disabled buttons have `disabled` attribute
  
- **Form Controls**: Page size select and jump input have associated labels
  
- **Semantic HTML**: Uses `<button>`, `<select>`, `<input>` elements
  
- **Focus Management**: Keyboard navigable with visible focus rings

## Best Practices

### 1. Handle Page Size Changes Properly

When changing page size, adjust the current page if needed:

```tsx
const handlePageSizeChange = (newSize: number) => {
  setPageSize(newSize);
  const newTotalPages = Math.ceil(totalItems / newSize);
  if (currentPage > newTotalPages) {
    setCurrentPage(newTotalPages);
  }
};
```

**Note**: The component handles this internally, but you may want to manage it explicitly for API calls.

### 2. Calculate Page Data Correctly

Always use 1-indexed page numbers:

```tsx
// Correct
const startIndex = (currentPage - 1) * pageSize;
const endIndex = startIndex + pageSize;
const pageData = allData.slice(startIndex, endIndex);

// Incorrect (0-indexed)
const pageData = allData.slice(currentPage * pageSize, ...);
```

### 3. Show Loading States

Use the `disabled` prop during data fetching:

```tsx
<BasePagination
  currentPage={currentPage}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageChange={handlePageChange}
  disabled={isLoading}
/>
```

### 4. Choose Appropriate Variants

- **Default**: Traditional table pagination
- **Minimal**: Card grids, image galleries
- **Compact**: Sidebars, dense layouts

### 5. Optimize Page Size Options

Consider your data and UX:

```tsx
// For large datasets
pageSizeOptions={[25, 50, 100, 250]}

// For small datasets
pageSizeOptions={[5, 10, 20]}

// For images/cards
pageSizeOptions={[12, 24, 48]}
```

### 6. Hide Unnecessary Features

For simple use cases, disable extra features:

```tsx
<BasePagination
  currentPage={currentPage}
  totalItems={50}
  pageSize={10}
  onPageChange={setCurrentPage}
  showTotal={false}
  showFirstLast={false}
  maxPageButtons={5}
/>
```

## Performance Tips

### 1. Memoize Calculations

Use `useMemo` for expensive page data calculations:

```tsx
const currentPageData = useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return allData.slice(start, start + pageSize);
}, [currentPage, pageSize, allData]);
```

### 2. Virtual Scrolling for Large Datasets

For very large datasets (10,000+ items), consider virtual scrolling instead:

```tsx
// Use react-window or similar
import { FixedSizeList } from 'react-window';

// Only render visible rows
<FixedSizeList
  height={600}
  itemCount={totalItems}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

### 3. Server-Side Pagination

For large datasets, fetch only current page data:

```tsx
async function fetchPage(page: number, size: number) {
  const response = await fetch(
    `/api/items?page=${page}&limit=${size}`
  );
  return response.json();
}

const handlePageChange = async (newPage: number) => {
  setLoading(true);
  const data = await fetchPage(newPage, pageSize);
  setData(data.items);
  setCurrentPage(newPage);
  setLoading(false);
};
```

## Common Patterns

### Reset to First Page on Search

```tsx
const handleSearch = (query: string) => {
  setSearchQuery(query);
  setCurrentPage(1); // Always reset to first page
};
```

### Persist Page State in URL

```tsx
import { useRouter } from 'next/router';

function DataTable() {
  const router = useRouter();
  const currentPage = Number(router.query.page) || 1;
  
  const handlePageChange = (page: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    });
  };
  
  return <BasePagination currentPage={currentPage} onPageChange={handlePageChange} />;
}
```

### Track Analytics

```tsx
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  
  // Track page view
  analytics.track('Pagination Navigation', {
    from: currentPage,
    to: page,
    totalPages: Math.ceil(totalItems / pageSize),
  });
};
```

## Styling Customization

### Custom Styling with Tailwind

```tsx
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  className="mt-8 justify-center"
/>
```

### Theme Integration

The component uses primary color from your Tailwind theme:
- Active page: `bg-primary-600`
- Hover: `hover:bg-primary-50`
- Focus: `focus:ring-primary-500`

Configure in `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          // ... other shades
          600: '#16a34a',
        },
      },
    },
  },
};
```

## Related Components

- **BaseTable**: Use together for paginated tables
- **BaseCard**: Paginate card grids
- **BaseSelect**: Similar dropdown styling

## Migration from Other Libraries

### From Material-UI Pagination

```tsx
// Before (MUI)
<Pagination
  count={10}
  page={page}
  onChange={(e, page) => setPage(page)}
/>

// After (BasePagination)
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
/>
```

### From React-Paginate

```tsx
// Before (react-paginate)
<ReactPaginate
  pageCount={10}
  pageRangeDisplayed={5}
  onPageChange={({ selected }) => setPage(selected + 1)}
/>

// After (BasePagination)
<BasePagination
  currentPage={page}
  totalItems={100}
  pageSize={10}
  onPageChange={setPage}
  maxPageButtons={5}
/>
```

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import BasePagination, { 
  type BasePaginationProps,
  type PaginationVariant,
  type PaginationSize,
  type PaginationLabels
} from '@/components/shared/base/BasePagination';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
