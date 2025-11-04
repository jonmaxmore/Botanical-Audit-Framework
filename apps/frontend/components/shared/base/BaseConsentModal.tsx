/**
 * Base Consent Modal Component
 * 
 * Reusable modal for PDPA consent, terms & conditions, and privacy policy.
 * Consolidates logic from:
 * - DataConsentModal (farmer-portal)
 * - TermsConsentModal (farmer-portal)
 * - PrivacyConsentModal (certificate-portal)
 * 
 * Features:
 * - PDPA compliance (Thai Personal Data Protection Act พ.ศ. 2562)
 * - Multiple consent items with checkboxes
 * - Digital signature capture
 * - Document versioning
 * - Consent history tracking
 * - Required/optional consents
 * - Print and download functionality
 * 
 * @version 1.0.0
 * @created November 4, 2025
 * @author Code Refactoring - Phase 5
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, FileText, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ConsentType = 'data' | 'terms' | 'privacy' | 'marketing' | 'custom';

export interface ConsentItem {
  id: string;
  type: ConsentType;
  title: string;
  description: string;
  content?: string; // Full text content
  required: boolean;
  version?: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface ConsentData {
  consents: Record<string, boolean>; // consent_id -> accepted
  signature?: string; // Base64 image
  signedBy?: string;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface BaseConsentModalProps {
  // Display
  isOpen: boolean;
  onClose: () => void;
  
  // Mode
  mode?: 'data' | 'terms' | 'privacy' | 'custom';
  
  // Content
  title?: string;
  consentItems: ConsentItem[];
  
  // Signature
  requireSignature?: boolean;
  signaturePlaceholder?: string;
  
  // Actions
  onAccept: (data: ConsentData) => void;
  onDecline?: () => void;
  
  // Labels
  acceptLabel?: string;
  declineLabel?: string;
  acceptAllLabel?: string;
  signatureLabel?: string;
  clearSignatureLabel?: string;
  
  // Configuration
  showPrint?: boolean;
  showDownload?: boolean;
  allowPartialAccept?: boolean; // Can accept some items and reject others
  
  // State
  loading?: boolean;
  error?: string;
  
  // Customization
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseConsentModal({
  isOpen,
  onClose,
  mode = 'custom',
  title = 'ข้อตกลงและเงื่อนไข',
  consentItems,
  requireSignature = false,
  signaturePlaceholder = 'ลงนามที่นี่',
  onAccept,
  onDecline,
  acceptLabel = 'ยอมรับ',
  declineLabel = 'ปฏิเสธ',
  acceptAllLabel = 'ยอมรับทั้งหมด',
  signatureLabel = 'ลายเซ็น',
  clearSignatureLabel = 'ล้างลายเซ็น',
  showPrint = true,
  showDownload = true,
  allowPartialAccept = false,
  loading = false,
  error,
  className = ''
}: BaseConsentModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [acceptedItems, setAcceptedItems] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState<string>('');
  const [showSignature, setShowSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [validationError, setValidationError] = useState<string>('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setAcceptedItems({});
      setSignature('');
      setShowSignature(requireSignature);
      setValidationError('');
      setExpandedItems({});
    }
  }, [isOpen, requireSignature]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ============================================================================
  // SIGNATURE DRAWING
  // ============================================================================

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  // ============================================================================
  // CONSENT HANDLERS
  // ============================================================================

  const toggleConsent = (id: string) => {
    setAcceptedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setValidationError('');
  };

  const acceptAll = () => {
    const allAccepted: Record<string, boolean> = {};
    consentItems.forEach(item => {
      allAccepted[item.id] = true;
    });
    setAcceptedItems(allAccepted);
    setValidationError('');
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateConsent = (): boolean => {
    // Check required consents
    const requiredItems = consentItems.filter(item => item.required);
    const unacceptedRequired = requiredItems.filter(item => !acceptedItems[item.id]);

    if (unacceptedRequired.length > 0) {
      setValidationError(`กรุณายอมรับข้อตกลงที่จำเป็น: ${unacceptedRequired.map(i => i.title).join(', ')}`);
      return false;
    }

    // Check signature if required
    if (requireSignature && !signature) {
      setValidationError('กรุณาลงนามเพื่อยืนยัน');
      return false;
    }

    return true;
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleAccept = () => {
    if (!validateConsent()) return;

    const consentData: ConsentData = {
      consents: acceptedItems,
      signature: signature || undefined,
      signedAt: new Date(),
      ipAddress: undefined, // Will be set by backend
      userAgent: navigator.userAgent
    };

    onAccept(consentData);
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    }
    onClose();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Sarabun', Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .consent-item { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
            .required { color: red; font-weight: bold; }
            .signature { margin-top: 30px; border-top: 2px solid #000; padding-top: 20px; }
            .signature img { max-width: 300px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${consentItems.map(item => `
            <div class="consent-item">
              <h3>${item.title} ${item.required ? '<span class="required">*</span>' : ''}</h3>
              <p>${item.description}</p>
              ${item.content ? `<div style="white-space: pre-line;">${item.content}</div>` : ''}
              <p><strong>สถานะ:</strong> ${acceptedItems[item.id] ? '✓ ยอมรับ' : '✗ ไม่ยอมรับ'}</p>
            </div>
          `).join('')}
          ${signature ? `
            <div class="signature">
              <h3>ลายเซ็น</h3>
              <img src="${signature}" alt="Signature" />
              <p>วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    // Generate PDF (simplified version - use jsPDF in production)
    const text = consentItems.map(item => 
      `${item.title}\n${item.description}\n${acceptedItems[item.id] ? '✓ ยอมรับ' : '✗ ไม่ยอมรับ'}\n\n`
    ).join('');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Accept All Button */}
          {consentItems.length > 1 && (
            <button
              onClick={acceptAll}
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {acceptAllLabel}
            </button>
          )}

          {/* Consent Items */}
          {consentItems.map((item) => {
            const isAccepted = acceptedItems[item.id];
            const isExpanded = expandedItems[item.id];

            return (
              <div
                key={item.id}
                className={`border rounded-lg p-4 transition-all ${
                  isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isAccepted || false}
                    onChange={() => toggleConsent(item.id)}
                    disabled={loading}
                    className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {item.content && (
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>

                    {/* Version & Date */}
                    {(item.version || item.effectiveDate) && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {item.version && <span>เวอร์ชัน {item.version}</span>}
                        {item.effectiveDate && (
                          <span>
                            มีผลตั้งแต่: {new Date(item.effectiveDate).toLocaleDateString('th-TH')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Full Content (Expandable) */}
                    {item.content && isExpanded && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200 text-sm whitespace-pre-line max-h-60 overflow-y-auto">
                        {item.content}
                      </div>
                    )}

                    {/* Document Link */}
                    {item.documentUrl && (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        ดูเอกสารฉบับเต็ม
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Signature */}
          {showSignature && (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">
                  {signatureLabel} {requireSignature && <span className="text-red-500">*</span>}
                </label>
                {signature && (
                  <button
                    onClick={clearSignature}
                    disabled={loading}
                    className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {clearSignatureLabel}
                  </button>
                )}
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair bg-white"
                style={{ touchAction: 'none' }}
              />
              <p className="text-xs text-gray-500 mt-2">{signaturePlaceholder}</p>
            </div>
          )}

          {/* Error Messages */}
          {(validationError || error) && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{validationError || error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 gap-3">
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {showPrint && (
              <button
                onClick={handlePrint}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                พิมพ์
              </button>
            )}
            {showDownload && (
              <button
                onClick={handleDownload}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </button>
            )}
          </div>

          {/* Main Actions */}
          <div className="flex items-center gap-3">
            {onDecline && (
              <button
                onClick={handleDecline}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {declineLabel}
              </button>
            )}
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {acceptLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Pre-configured for PDPA data consent
 */
export const DataConsentModal = (props: Omit<BaseConsentModalProps, 'mode' | 'title' | 'consentItems'>) => {
  const consentItems: ConsentItem[] = [
    {
      id: 'personal_data',
      type: 'data',
      title: 'การเก็บรวบรวมข้อมูลส่วนบุคคล',
      description: 'เราจะเก็บรวบรวมข้อมูลส่วนบุคคลของคุณเพื่อใช้ในการให้บริการตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
      content: `1. ข้อมูลที่เราเก็บรวบรวม:
   - ชื่อ-นามสกุล
   - เลขประจำตัวประชาชน
   - ที่อยู่
   - เบอร์โทรศัพท์
   - อีเมล

2. วัตถุประสงค์ในการเก็บข้อมูล:
   - เพื่อการลงทะเบียนและยืนยันตัวตน
   - เพื่อติดต่อสื่อสารและแจ้งข้อมูลข่าวสาร
   - เพื่อปรับปรุงการให้บริการ

3. ระยะเวลาในการเก็บข้อมูล:
   - เก็บข้อมูลตลอดระยะเวลาที่ใช้บริการ
   - เก็บต่อไปอีก 10 ปีหลังสิ้นสุดการใช้บริการ

4. สิทธิของเจ้าของข้อมูล:
   - สิทธิในการเข้าถึงข้อมูล
   - สิทธิในการแก้ไขข้อมูล
   - สิทธิในการลบข้อมูล
   - สิทธิในการโอนย้ายข้อมูล
   - สิทธิในการคัดค้าน`,
      required: true,
      version: '1.0',
      effectiveDate: new Date('2024-01-01')
    },
    {
      id: 'data_sharing',
      type: 'data',
      title: 'การแชร์ข้อมูลกับบุคคลที่สาม',
      description: 'เราอาจแชร์ข้อมูลของคุณกับหน่วยงานที่เกี่ยวข้องเพื่อการดำเนินงาน',
      required: true
    },
    {
      id: 'marketing',
      type: 'marketing',
      title: 'การรับข้อมูลข่าวสารทางการตลาด',
      description: 'รับข้อมูลข่าวสาร โปรโมชั่น และข้อเสนอพิเศษทาง Email และ SMS',
      required: false
    }
  ];

  return (
    <BaseConsentModal
      {...props}
      mode="data"
      title="ความยินยอมในการเก็บรวบรวมข้อมูลส่วนบุคคล (PDPA)"
      consentItems={consentItems}
      requireSignature={true}
    />
  );
};

/**
 * Pre-configured for terms & conditions
 */
export const TermsConsentModal = (props: Omit<BaseConsentModalProps, 'mode' | 'title' | 'consentItems'>) => {
  const consentItems: ConsentItem[] = [
    {
      id: 'terms_of_service',
      type: 'terms',
      title: 'ข้อตกลงในการให้บริการ',
      description: 'เงื่อนไขการใช้บริการและความรับผิดชอบของผู้ใช้งาน',
      content: `1. การยอมรับข้อตกลง
เมื่อคุณใช้บริการของเรา ถือว่าคุณยอมรับข้อตกลงนี้ทั้งหมด

2. การใช้บริการ
- ใช้บริการตามวัตถุประสงค์ที่กำหนด
- ไม่ใช้บริการในทางที่ผิดกฎหมาย
- รักษาความปลอดภัยของบัญชี

3. ความรับผิดชอบ
- เราไม่รับผิดชอบต่อความเสียหายจากการใช้บริการ
- ผู้ใช้รับผิดชอบต่อข้อมูลที่กรอก

4. การยกเลิกบริการ
- เราสงวนสิทธิ์ในการยกเลิกบริการได้ตลอดเวลา
- แจ้งล่วงหน้า 30 วัน`,
      required: true,
      version: '2.1',
      effectiveDate: new Date('2024-06-01')
    },
    {
      id: 'user_conduct',
      type: 'terms',
      title: 'จรรยาบรรณผู้ใช้งาน',
      description: 'ข้อกำหนดเกี่ยวกับพฤติกรรมการใช้งานที่เหมาะสม',
      required: true
    }
  ];

  return (
    <BaseConsentModal
      {...props}
      mode="terms"
      title="ข้อตกลงและเงื่อนไขการใช้บริการ"
      consentItems={consentItems}
      requireSignature={false}
    />
  );
};

/**
 * Pre-configured for privacy policy
 */
export const PrivacyConsentModal = (props: Omit<BaseConsentModalProps, 'mode' | 'title' | 'consentItems'>) => {
  const consentItems: ConsentItem[] = [
    {
      id: 'privacy_policy',
      type: 'privacy',
      title: 'นโยบายความเป็นส่วนตัว',
      description: 'การเก็บรักษา ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณ',
      content: `นโยบายความเป็นส่วนตัวฉบับนี้อธิบายวิธีการที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ

1. ข้อมูลที่เก็บรวบรวม
   - ข้อมูลที่คุณให้โดยตรง
   - ข้อมูลการใช้งานระบบ
   - Cookies และเทคโนโลยีติดตาม

2. วิธีการใช้ข้อมูล
   - ให้บริการตามที่คุณร้องขอ
   - ปรับปรุงคุณภาพการบริการ
   - ติดต่อสื่อสาร

3. การปกป้องข้อมูล
   - เข้ารหัสข้อมูลทั้งหมด
   - จำกัดการเข้าถึงเฉพาะผู้มีสิทธิ์
   - ตรวจสอบความปลอดภัยอย่างสม่ำเสมอ

4. สิทธิของคุณ
   - ขอเข้าถึงข้อมูลของคุณ
   - แก้ไขหรือลบข้อมูล
   - คัดค้านการประมวลผล
   - ถอนความยินยอม`,
      required: true,
      version: '1.5',
      effectiveDate: new Date('2024-03-15')
    },
    {
      id: 'cookies',
      type: 'privacy',
      title: 'นโยบาย Cookies',
      description: 'การใช้งาน Cookies เพื่อปรับปรุงประสบการณ์การใช้งาน',
      required: false
    }
  ];

  return (
    <BaseConsentModal
      {...props}
      mode="privacy"
      title="นโยบายความเป็นส่วนตัว"
      consentItems={consentItems}
      requireSignature={false}
    />
  );
};
