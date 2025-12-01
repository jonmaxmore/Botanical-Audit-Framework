/**
 * Ticket List Component (V2)
 * Displays user's tickets with pagination and filtering
 * Integrates with /api/v2/tickets endpoint
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertCircle,
  DollarSign,
  HelpCircle,
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// TypeScript Interfaces matching Backend V2
interface TicketMessage {
  _id: string;
  sender: {
    _id: string;
    fullName: string;
    role: string;
  };
  message: string;
  fieldReference?: string;
  attachments?: Array<{
    filename: string;
    path: string;
    size: number;
  }>;
  isRead: boolean;
  createdAt: string;
}

interface Ticket {
  _id: string;
  applicationId: {
    _id: string;
    applicationNumber: string;
    currentStatus: string;
  };
  applicant: {
    _id: string;
    fullName: string;
    email: string;
  };
  assignedStaff?: {
    _id: string;
    fullName: string;
    role: string;
  };
  status: 'open' | 'in_progress' | 'waiting_user' | 'waiting_staff' | 'resolved' | 'closed';
  subject: string;
  category: 'document_correction' | 'payment_issue' | 'general_inquiry' | 'technical_support';
  priority: 0 | 1 | 2 | 3;
  messages: TicketMessage[];
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TicketsResponse {
  success: boolean;
  data: {
    tickets: Ticket[];
    pagination: PaginationMeta;
  };
}

interface TicketListProps {
  className?: string;
}

// Category Icons
const CATEGORY_ICONS = {
  document_correction: AlertCircle,
  payment_issue: DollarSign,
  general_inquiry: HelpCircle,
  technical_support: Wrench,
};

// Category Colors
const CATEGORY_COLORS = {
  document_correction: 'bg-red-50 border-red-200 text-red-800',
  payment_issue: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  general_inquiry: 'bg-blue-50 border-blue-200 text-blue-800',
  technical_support: 'bg-purple-50 border-purple-200 text-purple-800',
};

// Status Colors
const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_user: 'bg-orange-100 text-orange-800',
  waiting_staff: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

// Status Labels (Thai)
const STATUS_LABELS = {
  open: 'เปิด',
  in_progress: 'กำลังดำเนินการ',
  waiting_user: 'รอผู้ใช้',
  waiting_staff: 'รอเจ้าหน้าที่',
  resolved: 'แก้ไขแล้ว',
  closed: 'ปิด',
};

// Category Labels (Thai)
const CATEGORY_LABELS = {
  document_correction: 'แก้ไขเอกสาร',
  payment_issue: 'ปัญหาการชำระเงิน',
  general_inquiry: 'สอบถามทั่วไป',
  technical_support: 'ช่วยเหลือทางเทคนิค',
};

export default function TicketList({ className = '' }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch tickets from V2 API
  const fetchTickets = async (pageNum = 1, status = '') => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/v2/tickets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TicketsResponse = await response.json();

      if (data.success) {
        // Access data from correct response structure
        setTickets(data.data.tickets);
        setPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
        setTotalCount(data.data.pagination.total);
      } else {
        throw new Error('API returned success: false');
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError(
        err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการตั๋วได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets(1, statusFilter);
  }, [statusFilter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTickets(newPage, statusFilter);
    }
  };

  // Handle retry
  const handleRetry = () => {
    fetchTickets(page, statusFilter);
  };

  // Get category icon
  const getCategoryIcon = (category: Ticket['category']) => {
    const IconComponent = CATEGORY_ICONS[category] || HelpCircle;
    return <IconComponent className="w-5 h-5" />;
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">ตั๋วสนับสนุน</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">เกิดข้อผิดพลาด</h3>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ตั๋วสนับสนุน</h2>
          <p className="text-sm text-gray-600 mt-1">ทั้งหมด {totalCount} รายการ</p>
        </div>
        <button
          onClick={() => fetchTickets(page, statusFilter)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">กรองตามสถานะ</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ทั้งหมด</option>
          <option value="open">เปิด</option>
          <option value="in_progress">กำลังดำเนินการ</option>
          <option value="waiting_user">รอผู้ใช้</option>
          <option value="waiting_staff">รอเจ้าหน้าที่</option>
          <option value="resolved">แก้ไขแล้ว</option>
          <option value="closed">ปิด</option>
        </select>
      </div>

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีตั๋วสนับสนุน</h3>
          <p className="text-gray-600">
            {statusFilter ? 'ไม่พบตั๋วที่ตรงกับตัวกรอง' : 'คุณยังไม่มีตั๋วสนับสนุนในระบบ'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                // Navigate to ticket detail (implement routing)
                window.location.href = `/tickets/${ticket._id}`;
              }}
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div
                  className={`
                    p-3 rounded-full
                    ${CATEGORY_COLORS[ticket.category]}
                  `}
                >
                  {getCategoryIcon(ticket.category)}
                </div>

                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {ticket.subject}
                    </h3>
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2
                        ${STATUS_COLORS[ticket.status]}
                      `}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {ticket.messages.length} ข้อความ
                    </span>
                    <span>คำขอ: {ticket.applicationId.applicationNumber}</span>
                    <span>{CATEGORY_LABELS[ticket.category]}</span>
                    {ticket.revisionCount > 0 && (
                      <span className="text-orange-600">แก้ไขครั้งที่ {ticket.revisionCount}</span>
                    )}
                  </div>

                  {/* Last Message Preview */}
                  {ticket.messages.length > 0 && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {ticket.messages[ticket.messages.length - 1].message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ticket.messages[ticket.messages.length - 1].sender.fullName} •{' '}
                        {new Date(
                          ticket.messages[ticket.messages.length - 1].createdAt
                        ).toLocaleString('th-TH')}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    สร้างเมื่อ {new Date(ticket.createdAt).toLocaleString('th-TH')}
                    {ticket.resolvedAt && (
                      <>
                        {' • '}
                        <CheckCircle className="w-3 h-3" />
                        แก้ไขเมื่อ {new Date(ticket.resolvedAt).toLocaleString('th-TH')}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            ก่อนหน้า
          </button>

          <span className="text-sm text-gray-600">
            หน้า {page} จาก {totalPages} ({totalCount} รายการ)
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ถัดไป
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
