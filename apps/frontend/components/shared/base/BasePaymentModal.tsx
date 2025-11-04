/**
 * Base Payment Modal Component
 * 
 * Reusable modal for payment confirmation, receipt display, and payment status.
 * Consolidates logic from:
 * - PaymentConfirmModal (farmer-portal)
 * - ReceiptModal (farmer-portal)
 * - PaymentStatusModal (admin-portal)
 * 
 * Features:
 * - QR Code payment (PromptPay/Thai QR)
 * - Receipt generation and display
 * - Payment status tracking
 * - Multiple payment methods
 * - Print receipt
 * - Download PDF
 * - Real-time status updates
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, CreditCard, QrCode, CheckCircle, Clock, XCircle, Download, Printer, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type PaymentMethod = 'qr_promptpay' | 'bank_transfer' | 'credit_card' | 'cash' | 'other';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BasePaymentModalProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  mode: 'confirm' | 'receipt' | 'status';
  
  // Payment data
  paymentId?: string;
  transactionId?: string;
  amount: number;
  currency?: string;
  items?: PaymentItem[];
  
  // Payer/Payee info
  payerName?: string;
  payerEmail?: string;
  payeeOrganization?: string;
  
  // Payment method
  paymentMethod?: PaymentMethod;
  availablePaymentMethods?: PaymentMethod[];
  
  // QR Code (PromptPay)
  promptPayId?: string;
  qrCodeData?: string;
  qrCodeImage?: string;
  
  // Status
  status?: PaymentStatus;
  statusMessage?: string;
  paidAt?: string | Date;
  
  // Receipt
  receiptNumber?: string;
  invoiceNumber?: string;
  issuedDate?: string | Date;
  dueDate?: string | Date;
  
  // Callbacks
  onConfirmPayment?: (method: PaymentMethod) => Promise<void>;
  onCheckStatus?: () => Promise<PaymentStatus>;
  onDownloadReceipt?: () => Promise<void>;
  onPrintReceipt?: () => void;
  
  // Customization
  className?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  autoCheckStatus?: boolean;
  statusCheckInterval?: number; // milliseconds
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  qr_promptpay: 'QR PromptPay',
  bank_transfer: 'โอนเงินผ่านธนาคาร',
  credit_card: 'บัตรเครดิต/เดบิต',
  cash: 'เงินสด',
  other: 'อื่นๆ'
};

const STATUS_CONFIG = {
  pending: {
    icon: <Clock className="w-6 h-6" />,
    color: 'yellow',
    label: 'รอการชำระเงิน',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-500'
  },
  processing: {
    icon: <Clock className="w-6 h-6" />,
    color: 'blue',
    label: 'กำลังดำเนินการ',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-500'
  },
  completed: {
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'green',
    label: 'ชำระเงินสำเร็จ',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-500'
  },
  failed: {
    icon: <XCircle className="w-6 h-6" />,
    color: 'red',
    label: 'ชำระเงินไม่สำเร็จ',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-500'
  },
  cancelled: {
    icon: <XCircle className="w-6 h-6" />,
    color: 'gray',
    label: 'ยกเลิกการชำระเงิน',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-500'
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function BasePaymentModal({
  isOpen,
  onClose,
  mode,
  paymentId,
  transactionId,
  amount,
  currency = 'THB',
  items = [],
  payerName,
  payerEmail,
  payeeOrganization = 'กรมส่งเสริมการเกษตร',
  paymentMethod = 'qr_promptpay',
  availablePaymentMethods = ['qr_promptpay', 'bank_transfer', 'credit_card'],
  promptPayId,
  qrCodeData,
  qrCodeImage,
  status = 'pending',
  statusMessage,
  paidAt,
  receiptNumber,
  invoiceNumber,
  issuedDate = new Date(),
  dueDate,
  onConfirmPayment,
  onCheckStatus,
  onDownloadReceipt,
  onPrintReceipt,
  className = '',
  confirmButtonText = 'ยืนยันการชำระเงิน',
  cancelButtonText = 'ยกเลิก',
  showPrintButton = true,
  showDownloadButton = true,
  autoCheckStatus = true,
  statusCheckInterval = 5000
}: BasePaymentModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethod);
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>(status);
  const [error, setError] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);
  const statusCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-check status
  useEffect(() => {
    if (isOpen && mode === 'status' && autoCheckStatus && onCheckStatus) {
      statusCheckTimerRef.current = setInterval(async () => {
        try {
          const newStatus = await onCheckStatus();
          setCurrentStatus(newStatus);
          
          // Stop checking if completed or failed
          if (newStatus === 'completed' || newStatus === 'failed') {
            if (statusCheckTimerRef.current) {
              clearInterval(statusCheckTimerRef.current);
            }
          }
        } catch (error) {
          console.error('Status check error:', error);
        }
      }, statusCheckInterval);
    }

    return () => {
      if (statusCheckTimerRef.current) {
        clearInterval(statusCheckTimerRef.current);
      }
    };
  }, [isOpen, mode, autoCheckStatus, onCheckStatus, statusCheckInterval]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConfirmPayment = async () => {
    if (!onConfirmPayment) return;
    
    setLoading(true);
    setError('');
    
    try {
      await onConfirmPayment(selectedMethod);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!onDownloadReceipt) return;
    
    setLoading(true);
    try {
      await onDownloadReceipt();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดาวน์โหลดใบเสร็จได้');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (onPrintReceipt) {
      onPrintReceipt();
    } else if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>ใบเสร็จรับเงิน - ${receiptNumber}</title>
              <style>
                body { font-family: 'Sarabun', sans-serif; padding: 20px; }
                .receipt { max-width: 800px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f5f5f5; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; font-size: 1.1em; }
                @media print { button { display: none; } }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>window.print(); window.close();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const renderPaymentMethodSelection = () => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          เลือกวิธีการชำระเงิน
        </label>
        <div className="grid grid-cols-1 gap-3">
          {availablePaymentMethods.map((method) => {
            const isSelected = selectedMethod === method;
            const icon = method === 'qr_promptpay' ? <QrCode className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />;
            
            return (
              <button
                key={method}
                type="button"
                onClick={() => setSelectedMethod(method)}
                disabled={loading}
                className={`
                  flex items-center gap-3 p-4 border-2 rounded-lg transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-offset-2 ring-blue-500' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                  {icon}
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQRCode = () => {
    if (selectedMethod !== 'qr_promptpay') return null;
    
    return (
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            สแกน QR Code เพื่อชำระเงิน
          </h4>
          
          {/* QR Code Image */}
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              {qrCodeImage ? (
                <img src={qrCodeImage} alt="QR Code" className="w-64 h-64" />
              ) : (
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* PromptPay ID */}
          {promptPayId && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">PromptPay ID:</span> {promptPayId}
            </div>
          )}
          
          {/* Amount */}
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(amount)}
          </div>
          
          <p className="text-sm text-gray-600">
            สแกนด้วยแอปธนาคารของคุณ
          </p>
        </div>
      </div>
    );
  };

  const renderItemsTable = () => {
    if (items.length === 0) return null;
    
    return (
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">รายการ</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  รายการ
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                  จำนวน
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                  ราคา/หน่วย
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-900">
                  รวมทั้งหมด
                </td>
                <td className="px-4 py-4 text-right font-bold text-xl text-blue-600">
                  {formatCurrency(amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderPaymentInfo = () => {
    return (
      <div className="space-y-3 mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">เลขที่การชำระเงิน:</span>
          <span className="font-semibold text-gray-900">{paymentId || '-'}</span>
        </div>
        {transactionId && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">เลขที่ธุรกรรม:</span>
            <span className="font-semibold text-gray-900">{transactionId}</span>
          </div>
        )}
        {payerName && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ผู้ชำระเงิน:</span>
            <span className="font-semibold text-gray-900">{payerName}</span>
          </div>
        )}
        {payeeOrganization && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ผู้รับเงิน:</span>
            <span className="font-semibold text-gray-900">{payeeOrganization}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStatusBadge = () => {
    const config = STATUS_CONFIG[currentStatus];
    
    return (
      <div className={`p-6 rounded-lg border-2 ${config.bgClass} ${config.borderClass}`}>
        <div className="flex items-center justify-center gap-3">
          <div className={config.textClass}>
            {config.icon}
          </div>
          <div>
            <div className={`text-xl font-bold ${config.textClass}`}>
              {config.label}
            </div>
            {statusMessage && (
              <div className="text-sm text-gray-600 mt-1">
                {statusMessage}
              </div>
            )}
          </div>
        </div>
        
        {paidAt && currentStatus === 'completed' && (
          <div className="mt-4 text-center text-sm text-gray-600">
            ชำระเมื่อ: {formatDate(paidAt)}
          </div>
        )}
      </div>
    );
  };

  const renderReceipt = () => {
    return (
      <div ref={printRef} className="receipt p-6 bg-white">
        {/* Header */}
        <div className="text-center mb-6 pb-6 border-b-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ใบเสร็จรับเงิน
          </h2>
          <p className="text-lg text-gray-700">{payeeOrganization}</p>
          {receiptNumber && (
            <p className="text-sm text-gray-600 mt-2">
              เลขที่ใบเสร็จ: {receiptNumber}
            </p>
          )}
        </div>

        {/* Receipt Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">วันที่ออกใบเสร็จ:</p>
            <p className="font-semibold text-gray-900">{formatDate(issuedDate)}</p>
          </div>
          {invoiceNumber && (
            <div>
              <p className="text-sm text-gray-600">เลขที่ใบแจ้งหนี้:</p>
              <p className="font-semibold text-gray-900">{invoiceNumber}</p>
            </div>
          )}
          {payerName && (
            <div>
              <p className="text-sm text-gray-600">ผู้ชำระเงิน:</p>
              <p className="font-semibold text-gray-900">{payerName}</p>
            </div>
          )}
          {transactionId && (
            <div>
              <p className="text-sm text-gray-600">เลขที่ธุรกรรม:</p>
              <p className="font-semibold text-gray-900">{transactionId}</p>
            </div>
          )}
        </div>

        {/* Items Table */}
        {renderItemsTable()}

        {/* Payment Method */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">วิธีการชำระเงิน:</p>
          <p className="font-semibold text-gray-900">
            {PAYMENT_METHOD_LABELS[selectedMethod]}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            ขอบคุณที่ใช้บริการ
          </p>
        </div>
      </div>
    );
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'confirm':
        return (
          <>
            {renderPaymentMethodSelection()}
            {renderQRCode()}
            {renderItemsTable()}
            {renderPaymentInfo()}
          </>
        );
        
      case 'receipt':
        return renderReceipt();
        
      case 'status':
        return (
          <>
            {renderStatusBadge()}
            {renderPaymentInfo()}
            {currentStatus === 'completed' && renderItemsTable()}
          </>
        );
        
      default:
        return null;
    }
  };

  const renderFooterButtons = () => {
    if (mode === 'receipt') {
      return (
        <>
          {showPrintButton && (
            <button
              onClick={handlePrintReceipt}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              พิมพ์ใบเสร็จ
            </button>
          )}
          {showDownloadButton && onDownloadReceipt && (
            <button
              onClick={handleDownloadReceipt}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Download className="w-5 h-5" />
              )}
              ดาวน์โหลด PDF
            </button>
          )}
        </>
      );
    }
    
    if (mode === 'confirm') {
      return (
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmButtonText}
          </button>
        </>
      );
    }
    
    // Status mode
    return (
      <button
        onClick={onClose}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        ปิด
      </button>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  const titles = {
    confirm: 'ยืนยันการชำระเงิน',
    receipt: 'ใบเสร็จรับเงิน',
    status: 'สถานะการชำระเงิน'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{titles[mode]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderModeContent()}
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-red-800">เกิดข้อผิดพลาด</div>
                <div className="text-sm text-red-700 mt-1">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          {renderFooterButtons()}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Pre-configured for payment confirmation
 */
export const PaymentConfirmModal = (props: Omit<BasePaymentModalProps, 'mode'>) => (
  <BasePaymentModal {...props} mode="confirm" />
);

/**
 * Pre-configured for receipt display
 */
export const ReceiptModal = (props: Omit<BasePaymentModalProps, 'mode'>) => (
  <BasePaymentModal {...props} mode="receipt" />
);

/**
 * Pre-configured for payment status tracking
 */
export const PaymentStatusModal = (props: Omit<BasePaymentModalProps, 'mode'>) => (
  <BasePaymentModal {...props} mode="status" />
);
