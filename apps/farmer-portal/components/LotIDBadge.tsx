'use client';

import React, { useState } from 'react';
import { QrCode, Copy, Check } from 'lucide-react';

interface LotIDBadgeProps {
  lotId: string;
  applicationId?: string;
  showQR?: boolean;
  className?: string;
}

export default function LotIDBadge({
  lotId,
  applicationId,
  showQR = false,
  className = '',
}: LotIDBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lotId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Generate QR code URL (using a QR code API)
  const getQRCodeUrl = () => {
    const data = JSON.stringify({
      lotId,
      applicationId,
      type: 'inspection',
      timestamp: new Date().toISOString(),
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
  };

  return (
    <>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
      >
        <span className="text-lg">📦</span>
        <div className="flex flex-col">
          <span className="text-xs text-blue-600 font-medium">Lot ID</span>
          <span className="text-sm font-mono font-bold text-blue-900">{lotId}</span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
          title={copied ? 'คัดลอกแล้ว' : 'คัดลอก Lot ID'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* QR Code button */}
        {showQR && (
          <button
            onClick={() => setShowQRModal(true)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="แสดง QR Code"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
          </button>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-gray-500 text-xl">×</span>
            </button>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code สำหรับตรวจสอบ</h3>
              <p className="text-sm text-gray-600 mb-4">สแกนเพื่อเข้าถึงข้อมูล Lot ID</p>

              {/* QR Code image */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getQRCodeUrl()} alt={`QR Code for Lot ${lotId}`} className="w-64 h-64" />
              </div>

              {/* Lot ID display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-xs text-blue-600 font-medium mb-1">Lot ID</div>
                <div className="text-lg font-mono font-bold text-blue-900">{lotId}</div>
              </div>

              {applicationId && (
                <div className="text-xs text-gray-500">Application ID: {applicationId}</div>
              )}

              {/* Download button */}
              <a
                href={getQRCodeUrl()}
                download={`lot-${lotId}-qr.png`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                ดาวน์โหลด QR Code
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Compact variant for table cells
export function LotIDLabel({ lotId }: { lotId: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-mono font-medium text-blue-600">
      <span>📦</span>
      <span>{lotId}</span>
    </span>
  );
}
