import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  TrendingUp as TrendUpIcon,
  TrendingDown as TrendDownIcon,
} from '@mui/icons-material';

export interface StatisticsData {
  id: string;
  category: string;
  value: number;
  previousValue: number;
  change: number;
  status: 'increase' | 'decrease' | 'stable';
  period: string;
}

export interface StatisticsTableProps {
  title?: string;
  subtitle?: string;
  data?: StatisticsData[];
}

type Order = 'asc' | 'desc';
type OrderBy = keyof StatisticsData;

const defaultData: StatisticsData[] = [
  {
    id: '1',
    category: 'คำขอทั้งหมด',
    value: 1248,
    previousValue: 1112,
    change: 12.2,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '2',
    category: 'คำขอรอตรวจสอบ',
    value: 156,
    previousValue: 170,
    change: -8.2,
    status: 'decrease',
    period: 'เดือนนี้',
  },
  {
    id: '3',
    category: 'คำขออนุมัติแล้ว',
    value: 892,
    previousValue: 774,
    change: 15.2,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '4',
    category: 'คำขอไม่อนุมัติ',
    value: 200,
    previousValue: 168,
    change: 19.0,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '5',
    category: 'ผู้ใช้งานใหม่',
    value: 45,
    previousValue: 42,
    change: 7.1,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '6',
    category: 'การตรวจสอบเสร็จสิ้น',
    value: 203,
    previousValue: 189,
    change: 7.4,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '7',
    category: 'เอกสารที่อัพโหลด',
    value: 3456,
    previousValue: 3201,
    change: 8.0,
    status: 'increase',
    period: 'เดือนนี้',
  },
  {
    id: '8',
    category: 'ความเห็นทั้งหมด',
    value: 892,
    previousValue: 956,
    change: -6.7,
    status: 'decrease',
    period: 'เดือนนี้',
  },
];

export default function StatisticsTable({
  title = 'สถิติรายละเอียด',
  subtitle = 'ตารางข้อมูลสถิติทั้งหมด',
  data = defaultData,
}: StatisticsTableProps) {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<OrderBy>('category');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting data...');
  };

  // Filter data based on search query
  const filteredData = data.filter(row =>
    row.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort data
  const sortedData = React.useMemo(() => {
    const comparator = (a: StatisticsData, b: StatisticsData) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue, 'th')
          : bValue.localeCompare(aValue, 'th');
      }

      return 0;
    };

    return [...filteredData].sort(comparator);
  }, [filteredData, order, orderBy]);

  // Paginate data
  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusChip = (status: string, change: number) => {
    if (status === 'increase') {
      return (
        <Chip
          icon={<TrendUpIcon />}
          label={`+${change.toFixed(1)}%`}
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else if (status === 'decrease') {
      return (
        <Chip
          icon={<TrendDownIcon />}
          label={`${change.toFixed(1)}%`}
          color="error"
          size="small"
          variant="outlined"
        />
      );
    }
    return <Chip label="0%" color="default" size="small" variant="outlined" />;
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
            <Tooltip title="ส่งออกข้อมูล">
              <IconButton onClick={handleExport} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="ค้นหาหมวดหมู่..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'category'}
                    direction={orderBy === 'category' ? order : 'asc'}
                    onClick={() => handleRequestSort('category')}
                  >
                    หมวดหมู่
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'value'}
                    direction={orderBy === 'value' ? order : 'asc'}
                    onClick={() => handleRequestSort('value')}
                  >
                    ค่าปัจจุบัน
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'previousValue'}
                    direction={orderBy === 'previousValue' ? order : 'asc'}
                    onClick={() => handleRequestSort('previousValue')}
                  >
                    ค่าก่อนหน้า
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={orderBy === 'change'}
                    direction={orderBy === 'change' ? order : 'asc'}
                    onClick={() => handleRequestSort('change')}
                  >
                    การเปลี่ยนแปลง
                  </TableSortLabel>
                </TableCell>
                <TableCell>ช่วงเวลา</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map(row => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight={500}>
                      {row.category}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {row.value.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {row.previousValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{getStatusChip(row.status, row.change)}</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {row.period}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      ไม่พบข้อมูล
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="แถวต่อหน้า:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count}`}
        />
      </CardContent>
    </Card>
  );
}
