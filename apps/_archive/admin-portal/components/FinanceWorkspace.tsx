/**
 * Finance Workspace Component (V2)
 * For payment verification and e-Receipt generation
 *
 * Features:
 * - Pending payment list
 * - Slip verification
 * - Auto e-Receipt generation
 * - Payment history tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, DollarSign, FileText, Download, Eye } from 'lucide-react';

interface Payment {
  _id: string;
  applicationId: {
    _id: string;
    applicationNumber: string;
    applicant: {
      fullName: string;
      email: string;
    };
  };
  type: 'payment_1' | 'payment_2';
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  slipImage?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  receiptNumber?: string;
}

interface FinanceWorkspaceProps {
  className?: string;
}

export default function FinanceWorkspace({ className = '' }: FinanceWorkspaceProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payments?status=${filter === 'all' ? '' : filter}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string) => {
    if (!confirm('ยืนยันการชำระเงิน?')) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert(`ยืนยันการชำระเงินสำเร็จ\nเลขที่ใบเสร็จ: ${data.data.receiptNumber}`);
        fetchPayments();
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    try {
      await fetch(`/api/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      alert('ปฏิเสธการชำระเงินสำเร็จ');
      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${paymentId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ตรวจสอบการชำระเงิน</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              รอตรวจสอบ
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-md ${
                filter === 'verified'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ยืนยันแล้ว
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Payment List */}
        <div className="w-1/3 overflow-y-auto p-6 bg-white border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            รายการชำระเงิน ({payments.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>ไม่มีรายการชำระเงิน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div
                  key={payment._id}
                  onClick={() => setSelectedPayment(payment)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${
                      selectedPayment?._id === payment._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.applicationId.applicationNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {payment.applicationId.applicant.fullName}
                      </p>
                    </div>
                    <span
                      className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${
                        payment.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }
                    `}
                    >
                      {payment.status === 'verified'
                        ? 'ยืนยันแล้ว'
                        : payment.status === 'rejected'
                          ? 'ปฏิเสธ'
                          : 'รอตรวจสอบ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {payment.type === 'payment_1' ? 'ค่าตรวจเอกสาร' : 'ค่าตรวจประเมิน'}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ฿{payment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Payment Details */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {selectedPayment ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">รายละเอียดการชำระเงิน</h2>

              {/* Payment Info */}
              <div className="bg-white rounded-lg p-6 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">เลขที่คำขอ:</span>
                    <p className="font-medium">{selectedPayment.applicationId.applicationNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ผู้ยื่นคำขอ:</span>
                    <p className="font-medium">
                      {selectedPayment.applicationId.applicant.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">ประเภท:</span>
                    <p className="font-medium">
                      {selectedPayment.type === 'payment_1' ? 'ค่าตรวจเอกสาร' : 'ค่าตรวจประเมิน'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">จำนวนเงิน:</span>
                    <p className="font-medium text-lg">
                      ฿{selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">วันที่อัปโหลด:</span>
                    <p className="font-medium">
                      {new Date(selectedPayment.uploadedAt).toLocaleString('th-TH')}
                    </p>
                  </div>
                  {selectedPayment.receiptNumber && (
                    <div>
                      <span className="text-gray-600">เลขที่ใบเสร็จ:</span>
                      <p className="font-medium">{selectedPayment.receiptNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Slip Image */}
              {selectedPayment.slipImage && (
                <div className="bg-white rounded-lg p-6 mb-4">
                  <h3 className="font-semibold mb-3">สลิปการโอนเงิน</h3>
                  <img
                    src={selectedPayment.slipImage}
                    alt="Payment Slip"
                    className="max-w-full h-auto rounded border border-gray-300"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedPayment.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(selectedPayment._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={() => handleVerify(selectedPayment._id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    ยืนยันการชำระเงิน
                  </button>
                </div>
              )}

              {selectedPayment.status === 'verified' && selectedPayment.receiptNumber && (
                <button
                  onClick={() => downloadReceipt(selectedPayment._id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  ดาวน์โหลดใบเสร็จ
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>เลือกรายการเพื่อดูรายละเอียด</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
