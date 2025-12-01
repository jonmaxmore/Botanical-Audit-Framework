/**
 * Registrar Workspace Component (V2)
 * For document review and verification
 *
 * Features:
 * - Smart Form Data Viewer (Left Pane)
 * - File Attachments Viewer (Right Pane)
 * - Comment & Return functionality
 * - Pass/Reject actions
 * - Revision tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, FileText, AlertCircle, Eye } from 'lucide-react';

interface Application {
  _id: string;
  applicationNumber: string;
  currentStatus: string;
  farmInformation: {
    farmName: string;
    location: {
      address: string;
      province: string;
      district: string;
      subDistrict: string;
    };
    farmSize: {
      totalArea: number;
      unit: string;
    };
    plantingSystem: string;
  };
  cropInformation: Array<{
    cropType: string;
    variety: string;
  }>;
  applicant: {
    fullName: string;
    email: string;
    nationalId: string;
  };
  documents: Array<{
    type: string;
    filename: string;
    path: string;
  }>;
  revisionCount: number;
}

interface RegistrarWorkspaceProps {
  applicationId: string;
}

export default function RegistrarWorkspace({ applicationId }: RegistrarWorkspaceProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setApplication(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePass = async () => {
    if (!confirm('ยืนยันการอนุมัติเอกสาร?')) return;

    try {
      await fetch(`/api/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'pass',
          status: 'pending_payment_2',
        }),
      });
      alert('อนุมัติเอกสารสำเร็จ');
      fetchApplication();
    } catch (error) {
      console.error('Failed to pass application:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleReturn = async () => {
    if (!comment.trim()) {
      alert('กรุณาระบุเหตุผลในการส่งคืน');
      return;
    }

    try {
      // Create ticket for communication
      await fetch('/api/v2/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          applicationId: application?._id,
          subject: 'เอกสารต้องแก้ไข',
          category: 'document_correction',
          priority: 2,
          initialMessage: comment,
          fieldReference: selectedField,
        }),
      });

      // Update application status
      await fetch(`/api/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'return',
          status: 'document_review',
          comment,
        }),
      });

      alert('ส่งคืนเอกสารสำเร็จ');
      setShowCommentModal(false);
      setComment('');
      fetchApplication();
    } catch (error) {
      console.error('Failed to return application:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleReject = async () => {
    if (!confirm('ยืนยันการปฏิเสธคำขอ? การดำเนินการนี้ไม่สามารถยกเลิกได้')) return;

    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;

    try {
      await fetch(`/api/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'reject',
          status: 'rejected',
          comment: reason,
        }),
      });
      alert('ปฏิเสธคำขอสำเร็จ');
      fetchApplication();
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบข้อมูลคำขอ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ตรวจสอบเอกสาร: {application.applicationNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ผู้ยื่นคำขอ: {application.applicant.fullName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              รอบที่ {application.revisionCount + 1}
            </span>
            {application.revisionCount >= 2 && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                ครั้งสุดท้าย
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Form Data */}
        <div className="w-1/2 overflow-y-auto p-6 bg-white border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลที่กรอก</h2>

          {/* Farm Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลฟาร์ม</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ชื่อฟาร์ม:</span>
                <span className="font-medium">{application.farmInformation.farmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ที่อยู่:</span>
                <span className="font-medium">{application.farmInformation.location.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">จังหวัด:</span>
                <span className="font-medium">{application.farmInformation.location.province}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">พื้นที่:</span>
                <span className="font-medium">
                  {application.farmInformation.farmSize.totalArea}{' '}
                  {application.farmInformation.farmSize.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ระบบการปลูก:</span>
                <span className="font-medium">{application.farmInformation.plantingSystem}</span>
              </div>
            </div>
          </div>

          {/* Crop Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">ข้อมูลพืช</h3>
            {application.cropInformation.map((crop, index) => (
              <div key={index} className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ประเภทพืช:</span>
                  <span className="font-medium">{crop.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">พันธุ์:</span>
                  <span className="font-medium">{crop.variety}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Button */}
          <button
            onClick={() => setShowCommentModal(true)}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            แสดงความคิดเห็น / ส่งคืนแก้ไข
          </button>
        </div>

        {/* Right Pane: Documents */}
        <div className="w-1/2 overflow-y-auto p-6 bg-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">เอกสารแนบ</h2>

          <div className="space-y-3">
            {application.documents.map((doc, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => setSelectedDocument(doc.path)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{doc.type}</h4>
                    <p className="text-sm text-gray-500">{doc.filename}</p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {selectedDocument && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">ตัวอย่างเอกสาร</h3>
              <iframe
                src={selectedDocument}
                className="w-full h-96 border border-gray-300 rounded"
                title="Document Preview"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleReject}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          disabled={application.revisionCount >= 2}
        >
          <X className="w-5 h-5" />
          ปฏิเสธ
        </button>

        <button
          onClick={handlePass}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          อนุมัติ
        </button>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">ส่งคืนเอกสารเพื่อแก้ไข</h3>
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ระบุรายละเอียดที่ต้องแก้ไข..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComment('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReturn}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                ส่งคืน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
