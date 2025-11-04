/**
 * Usage Examples for BaseActionModal
 * 
 * This file demonstrates how to migrate from old duplicate modals
 * to the new unified BaseActionModal component.
 */

'use client';

import React, { useState } from 'react';
import BaseActionModal, { ApprovalModal, ReviewModal } from './BaseActionModal';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// ============================================================================
// EXAMPLE 1: Simple Approval Modal (replaces ApprovalActionModal)
// ============================================================================

export function SimpleApprovalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    // Call API here
    await fetch('/api/applications/approve', {
      method: 'POST',
      body: JSON.stringify({
        applicationId: 'APP-001',
        ...data
      })
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Approval</button>
      
      <ApprovalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="อนุมัติใบสมัคร"
        subtitle="กรุณาตรวจสอบข้อมูลก่อนอนุมัติ"
        itemId="APP-001"
        itemData={{
          identifier: "APP-001",
          name: "ใบสมัครเกษตรกร นายสมชาย ดีมาก"
        }}
      />
    </>
  );
}

// ============================================================================
// EXAMPLE 2: Review with Rating (replaces ReviewActionModal)
// ============================================================================

export function ReviewWithRatingExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    await fetch('/api/inspections/review', {
      method: 'POST',
      body: JSON.stringify({
        inspectionId: 'INS-001',
        ...data
      })
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Review</button>
      
      <ReviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="ตรวจสอบผลการตรวจเยี่ยม"
        itemId="INS-001"
        itemData={{
          identifier: "INS-001",
          name: "การตรวจเยี่ยมฟาร์ม สวนลำไย บ้านสวนดอกไม้"
        }}
        showRating={true}
        showFeedbackScore={true}
      />
    </>
  );
}

// ============================================================================
// EXAMPLE 3: Custom Decision Options (replaces ReviewDialog)
// ============================================================================

export function CustomDecisionExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (data: any) => {
    await fetch('/api/documents/review', {
      method: 'POST',
      body: JSON.stringify({
        documentId: 'DOC-001',
        ...data
      })
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Custom Review</button>
      
      <BaseActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        type="custom"
        title="ตรวจสอบเอกสาร"
        subtitle="เอกสารรับรองมาตรฐาน GAP"
        itemId="DOC-001"
        itemData={{
          identifier: "DOC-001",
          name: "ใบรับรอง GAP ฉบับที่ 1/2568"
        }}
        decisionOptions={[
          { 
            value: 'approve', 
            label: 'อนุมัติเอกสาร', 
            icon: <CheckCircle />, 
            color: 'success' 
          },
          { 
            value: 'reject', 
            label: 'ปฏิเสธเอกสาร', 
            icon: <XCircle />, 
            color: 'error',
            requiresReason: true 
          },
          { 
            value: 'request_revision', 
            label: 'ขอแก้ไขเอกสาร', 
            icon: <AlertTriangle />, 
            color: 'warning',
            requiresReason: true 
          },
          { 
            value: 'postpone', 
            label: 'พักไว้พิจารณา', 
            icon: '⏸️', 
            color: 'info' 
          }
        ]}
        showRating={true}
        minCommentLength={20}
      />
    </>
  );
}

// ============================================================================
// EXAMPLE 4: With Additional Fields
// ============================================================================

export function WithAdditionalFieldsExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInspector, setSelectedInspector] = useState('');

  const handleSubmit = async (data: any) => {
    await fetch('/api/inspections/assign', {
      method: 'POST',
      body: JSON.stringify({
        inspectionId: 'INS-002',
        ...data
      })
    });
  };

  const AdditionalFields = ({ onChange, disabled, errors }: any) => (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          เลือกผู้ตรวจสอบ *
        </label>
        <select
          value={selectedInspector}
          onChange={(e) => {
            setSelectedInspector(e.target.value);
            onChange('inspectorId', e.target.value);
          }}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- เลือกผู้ตรวจสอบ --</option>
          <option value="INS-001">นายสมชาย ตรวจการ</option>
          <option value="INS-002">นางสมศรี ดูแลกิจ</option>
          <option value="INS-003">นายสมปอง เข้มงวด</option>
        </select>
        {errors?.inspectorId && (
          <p className="text-sm text-red-600">{errors.inspectorId}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          กำหนดวันนัดหมาย
        </label>
        <input
          type="date"
          onChange={(e) => onChange('scheduledDate', e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Assign Inspector</button>
      
      <BaseActionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        type="custom"
        title="มอบหมายผู้ตรวจสอบ"
        itemId="INS-002"
        itemData={{
          identifier: "INS-002",
          name: "การตรวจเยี่ยมฟาร์ม สวนมะม่วง บ้านสวนผลไม้"
        }}
        decisionOptions={[
          { value: 'assign', label: 'มอบหมาย', icon: '👤', color: 'success' },
          { value: 'defer', label: 'เลื่อนการมอบหมาย', icon: '⏰', color: 'warning' }
        ]}
        additionalFields={<AdditionalFields />}
        requiredFields={['inspectorId']}
        submitButtonText="มอบหมายงาน"
      />
    </>
  );
}

// ============================================================================
// MIGRATION GUIDE
// ============================================================================

/**
 * BEFORE (Old ApprovalActionModal):
 * 
 * <ApprovalActionModal
 *   open={open}
 *   onClose={handleClose}
 *   applicationId={applicationId}
 *   applicationData={data}
 *   onApprove={handleApprove}
 * />
 * 
 * AFTER (New BaseActionModal):
 * 
 * <ApprovalModal
 *   isOpen={open}
 *   onClose={handleClose}
 *   itemId={applicationId}
 *   itemData={data}
 *   onSubmit={handleSubmit}
 *   title="อนุมัติใบสมัคร"
 * />
 * 
 * Changes:
 * - open → isOpen
 * - onApprove → onSubmit (receives all form data)
 * - applicationId → itemId
 * - applicationData → itemData
 * - Added title prop for customization
 */

/**
 * BEFORE (Old ReviewActionModal):
 * 
 * <ReviewActionModal
 *   open={open}
 *   onClose={handleClose}
 *   inspectionId={inspectionId}
 *   inspectionData={data}
 *   onReview={handleReview}
 *   showRating={true}
 * />
 * 
 * AFTER (New BaseActionModal):
 * 
 * <ReviewModal
 *   isOpen={open}
 *   onClose={handleClose}
 *   itemId={inspectionId}
 *   itemData={data}
 *   onSubmit={handleSubmit}
 *   title="ตรวจสอบผลการตรวจเยี่ยม"
 *   showRating={true}
 *   showFeedbackScore={true}
 * />
 * 
 * Changes:
 * - open → isOpen
 * - onReview → onSubmit
 * - inspectionId → itemId
 * - inspectionData → itemData
 * - showRating is now optional
 * - Can add showFeedbackScore
 */

/**
 * BENEFITS OF NEW COMPONENT:
 * 
 * 1. Single source of truth (700+ lines saved)
 * 2. Consistent UI/UX across all portals
 * 3. Type-safe with TypeScript
 * 4. Extensible with additional fields
 * 5. Built-in validation
 * 6. Loading states
 * 7. Error handling
 * 8. Pre-configured helpers (ApprovalModal, ReviewModal)
 * 9. Flexible decision options
 * 10. Reusable across farmer, admin, and certificate portals
 */
