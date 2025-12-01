/**
 * GACP Platform - Revocation Banner Component
 *
 * Displays prominent banner for users with revoked certificates.
 * Shows remaining wait period before reapplication.
 *
 * Features:
 * - Countdown to reapplication date
 * - Revocation reason display
 * - Contact support link
 * - Dismissible (with localStorage)
 *
 * @version 1.0.0
 * @created October 14, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Calendar, Info } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RevocationBannerProps {
  /** Certificate ID */
  certificateId: string;

  /** Date when certificate was revoked */
  revokedAt: Date;

  /** Reason for revocation */
  revocationReason: string;

  /** Wait period in days (default: 30) */
  waitPeriodDays?: number;

  /** User ID for localStorage key */
  userId: string;

  /** Callback when banner is dismissed */
  onDismiss?: () => void;

  /** Show dismiss button (default: false - important notice) */
  dismissible?: boolean;

  /** Custom className */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateRemainingDays(
  revokedAt: Date,
  waitPeriodDays: number
): {
  remainingDays: number;
  allowedDate: Date;
  canApply: boolean;
} {
  const now = new Date();
  const revokedDate = new Date(revokedAt);
  const allowedDate = new Date(revokedDate.getTime() + waitPeriodDays * 24 * 60 * 60 * 1000);

  const remainingMs = allowedDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  return {
    remainingDays: Math.max(0, remainingDays),
    allowedDate,
    canApply: now >= allowedDate
  };
}

function formatThaiDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export function RevocationBanner({
  certificateId,
  revokedAt,
  revocationReason,
  waitPeriodDays = 30,
  userId,
  onDismiss,
  dismissible = false,
  className = ''
}: RevocationBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [remainingInfo, setRemainingInfo] = useState(
    calculateRemainingDays(revokedAt, waitPeriodDays)
  );

  // Check localStorage on mount
  useEffect(() => {
    if (dismissible) {
      const storageKey = `revocation-banner-dismissed-${userId}-${certificateId}`;
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [dismissible, userId, certificateId]);

  // Update remaining days every hour
  useEffect(() => {
    const intervalId = setInterval(
      () => {
        setRemainingInfo(calculateRemainingDays(revokedAt, waitPeriodDays));
      },
      60 * 60 * 1000
    ); // Update every hour

    return () => clearInterval(intervalId);
  }, [revokedAt, waitPeriodDays]);

  // Handle dismiss
  const handleDismiss = () => {
    if (dismissible) {
      const storageKey = `revocation-banner-dismissed-${userId}-${certificateId}`;
      localStorage.setItem(storageKey, 'true');
      setIsDismissed(true);
      if (onDismiss) onDismiss();
    }
  };

  // Don't render if dismissed
  if (isDismissed) return null;

  // Get message based on status
  const getMessage = () => {
    if (remainingInfo.canApply) {
      return {
        title: '✅ คุณสามารถยื่นคำขอใหม่ได้แล้ว',
        description: 'ระยะเวลารอคอย 30 วันผ่านไปแล้ว คุณสามารถยื่นคำขอรับรองใหม่ได้ทันที',
        type: 'success' as const
      };
    }

    return {
      title: '⚠️ ใบรับรองของคุณถูกเพิกถอน',
      description: `คุณต้องรอ ${remainingInfo.remainingDays} วัน ก่อนยื่นคำขอใหม่`,
      type: 'warning' as const
    };
  };

  const message = getMessage();

  // Styling based on type
  const styles = {
    success: {
      container: 'bg-green-50 border-green-300',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800',
      button: 'bg-green-600 hover:bg-green-700'
    },
    warning: {
      container: 'bg-red-50 border-red-300',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700'
    }
  };

  const style = styles[message.type];

  return (
    <div className={`relative border-2 rounded-lg p-6 ${style.container} ${className}`}>
      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className={`w-8 h-8 ${style.icon}`} />
        </div>

        <div className="flex-1">
          {/* Title */}
          <h3 className={`text-xl font-bold mb-2 ${style.title}`}>{message.title}</h3>

          {/* Description */}
          <p className={`text-base mb-4 ${style.text}`}>{message.description}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Revocation Date */}
            <div className="flex items-start gap-2">
              <Calendar className={`w-5 h-5 mt-0.5 ${style.icon}`} />
              <div>
                <p className={`text-sm font-semibold ${style.text}`}>วันที่เพิกถอน</p>
                <p className={`text-sm ${style.text}`}>{formatThaiDate(revokedAt)}</p>
              </div>
            </div>

            {/* Allowed Date */}
            <div className="flex items-start gap-2">
              <Calendar className={`w-5 h-5 mt-0.5 ${style.icon}`} />
              <div>
                <p className={`text-sm font-semibold ${style.text}`}>วันที่สามารถยื่นคำขอใหม่</p>
                <p className={`text-sm ${style.text}`}>
                  {formatThaiDate(remainingInfo.allowedDate)}
                </p>
              </div>
            </div>

            {/* Revocation Reason */}
            <div className="flex items-start gap-2 md:col-span-2">
              <Info className={`w-5 h-5 mt-0.5 ${style.icon}`} />
              <div>
                <p className={`text-sm font-semibold ${style.text}`}>เหตุผลการเพิกถอน</p>
                <p className={`text-sm ${style.text}`}>{revocationReason}</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator (if waiting) */}
          {!remainingInfo.canApply && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={style.text}>ความคืบหน้า</span>
                <span className={style.text}>
                  {waitPeriodDays - remainingInfo.remainingDays} / {waitPeriodDays} วัน
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                  style={{
                    width: `${((waitPeriodDays - remainingInfo.remainingDays) / waitPeriodDays) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {remainingInfo.canApply ? (
              <a
                href="/applications/new"
                className={`px-6 py-2 text-white rounded-lg font-semibold ${style.button}`}
              >
                ยื่นคำขอใหม่
              </a>
            ) : (
              <div
                className={`px-6 py-2 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed`}
              >
                ยังไม่สามารถยื่นคำขอได้
              </div>
            )}

            <a
              href="/support"
              className="px-6 py-2 border-2 border-current rounded-lg font-semibold hover:bg-white/50"
            >
              ติดต่อเจ้าหน้าที่
            </a>

            <a
              href="/certificates/revocation-policy"
              className="px-6 py-2 text-sm underline hover:no-underline"
            >
              อ่านนโยบายการเพิกถอน
            </a>
          </div>
        </div>
      </div>

      {/* Additional Info Box */}
      <div className={`mt-4 p-4 bg-white/50 border border-current rounded-lg`}>
        <p className={`text-sm ${style.text}`}>
          <strong>หมายเหตุ:</strong> ระยะเวลารอคอย 30 วัน เป็นนโยบายเพื่อให้คุณมีเวลาแก้ไขปัญหา
          และเตรียมความพร้อมก่อนยื่นคำขอใหม่ หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT VERSION (for dashboard)
// ============================================================================

export function CompactRevocationBanner({
  remainingDays,
  allowedDate,
  className = ''
}: {
  remainingDays: number;
  allowedDate: Date;
  className?: string;
}) {
  const canApply = remainingDays <= 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        canApply
          ? 'bg-green-50 border-green-300 text-green-900'
          : 'bg-red-50 border-red-300 text-red-900'
      } ${className}`}
    >
      <AlertTriangle className={`w-5 h-5 ${canApply ? 'text-green-600' : 'text-red-600'}`} />
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {canApply ? 'สามารถยื่นคำขอใหม่ได้แล้ว' : `รอ ${remainingDays} วัน`}
        </p>
        <p className="text-xs">
          {canApply ? 'คลิกเพื่อยื่นคำขอ' : `ยื่นได้ ${formatThaiDate(allowedDate)}`}
        </p>
      </div>
      {canApply && (
        <a
          href="/applications/new"
          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          ยื่นคำขอ
        </a>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RevocationBanner;
