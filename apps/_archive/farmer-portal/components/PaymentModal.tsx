'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export interface Payment {
  id: string;
  paymentId: string;
  applicationId: string;
  farmerId: string;
  type: 'initial' | 'resubmission';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method?: 'credit_card' | 'bank_transfer' | 'qr_code' | 'promptpay';
  transactionId?: string;
  receiptUrl?: string;
  submissionCount?: number;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  farmerId: string;
}

export default function PaymentModal({ isOpen, onClose, applicationId }: PaymentModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeFormData, setCompleteFormData] = useState({
    transactionId: '',
    method: 'qr_code' as Payment['method'],
    receiptUrl: ''
  });

  // Fetch payments
  const fetchPayments = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/application/${applicationId}`);
      const data = await response.json();

      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchPayments();
    }
  }, [isOpen, applicationId, fetchPayments]);

  // Complete payment
  const handleCompletePayment = async (paymentId: string) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/payments/${paymentId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeFormData)
      });

      const data = await response.json();

      if (data.success) {
        // Refresh payments
        await fetchPayments();
        setShowCompleteForm(false);
        setCompleteFormData({ transactionId: '', method: 'qr_code', receiptUrl: '' });
        alert('บันทึกการชำระเงินสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to complete payment:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  // Cancel payment
  const handleCancelPayment = async (paymentId: string) => {
    if (!confirm('ต้องการยกเลิกการชำระเงินนี้?')) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/payments/${paymentId}/cancel`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (data.success) {
        await fetchPayments();
        alert('ยกเลิกการชำระเงินสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      alert('เกิดข้อผิดพลาดในการยกเลิกการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment type label
  const getPaymentTypeLabel = (type: Payment['type']) => {
    return type === 'initial' ? 'ค่าธรรมเนียมเริ่มต้น' : 'ค่าธรรมเนียมส่งใหม่ครั้งที่ 3';
  };

  // Get payment method label
  const getPaymentMethodLabel = (method?: Payment['method']) => {
    switch (method) {
      case 'credit_card':
        return 'บัตรเครดิต';
      case 'bank_transfer':
        return 'โอนเงินผ่านธนาคาร';
      case 'qr_code':
        return 'QR Code';
      case 'promptpay':
        return 'PromptPay';
      default:
        return 'ไม่ระบุ';
    }
  };

  // Get status config
  const getStatusConfig = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'ชำระแล้ว' };
      case 'pending':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'รอชำระ' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'ล้มเหลว' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'ยกเลิก' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'ไม่ทราบ' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ประวัติการชำระเงิน</h2>
                  <p className="text-sm text-gray-600">รหัสใบสมัคร: {applicationId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="ปิด"
                aria-label="ปิด"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading && payments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600">ไม่มีประวัติการชำระเงิน</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map(payment => {
                  const statusConfig = getStatusConfig(payment.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Payment header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {getPaymentTypeLabel(payment.type)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              รหัสการชำระเงิน: {payment.paymentId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatAmount(payment.amount)}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-medium ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Payment details */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">วิธีชำระเงิน:</span>
                          <span className="ml-2 font-medium">
                            {getPaymentMethodLabel(payment.method)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">วันที่สร้าง:</span>
                          <span className="ml-2 font-medium">{formatDate(payment.createdAt)}</span>
                        </div>
                        {payment.transactionId && (
                          <div className="col-span-2">
                            <span className="text-gray-600">เลขที่รายการ:</span>
                            <span className="ml-2 font-medium font-mono">
                              {payment.transactionId}
                            </span>
                          </div>
                        )}
                        {payment.receiptUrl && (
                          <div className="col-span-2">
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                            >
                              <FileText className="w-4 h-4" />
                              ดูใบเสร็จ
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {payment.status === 'pending' && (
                        <div className="flex gap-2 pt-3 border-t border-gray-200">
                          {selectedPayment?.id === payment.id && showCompleteForm ? (
                            <div className="w-full space-y-3">
                              <input
                                type="text"
                                placeholder="เลขที่รายการ (Transaction ID)"
                                value={completeFormData.transactionId}
                                onChange={e =>
                                  setCompleteFormData({
                                    ...completeFormData,
                                    transactionId: e.target.value
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <select
                                value={completeFormData.method}
                                onChange={e =>
                                  setCompleteFormData({
                                    ...completeFormData,
                                    method: e.target.value as Payment['method']
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="เลือกวิธีชำระเงิน"
                              >
                                <option value="qr_code">QR Code</option>
                                <option value="promptpay">PromptPay</option>
                                <option value="bank_transfer">โอนเงินผ่านธนาคาร</option>
                                <option value="credit_card">บัตรเครดิต</option>
                              </select>
                              <input
                                type="url"
                                placeholder="URL ใบเสร็จ (ถ้ามี)"
                                value={completeFormData.receiptUrl}
                                onChange={e =>
                                  setCompleteFormData({
                                    ...completeFormData,
                                    receiptUrl: e.target.value
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleCompletePayment(payment.id)}
                                  disabled={!completeFormData.transactionId || loading}
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  บันทึกการชำระเงิน
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCompleteForm(false);
                                    setSelectedPayment(null);
                                  }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowCompleteForm(true);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                บันทึกการชำระเงิน
                              </button>
                              <button
                                onClick={() => handleCancelPayment(payment.id)}
                                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                ยกเลิก
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
