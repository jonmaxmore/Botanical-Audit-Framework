/**
 * GACP Platform - Payment Countdown Timer Component
 *
 * Displays a 15-minute countdown timer for payment deadline.
 * Features:
 * - Real-time countdown display
 * - Visual urgency indicators (color changes)
 * - Auto-redirect on timeout
 * - Pause/Resume capability (optional)
 *
 * @version 1.0.0
 * @created October 14, 2025
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CountdownTimerProps {
  /** Initial seconds (default: 900 = 15 minutes) */
  initialSeconds?: number;

  /** Callback when timer reaches zero */
  onTimeout?: () => void;

  /** Callback every second with remaining time */
  onTick?: (remainingSeconds: number) => void;

  /** Show warning at X seconds (default: 180 = 3 minutes) */
  warningThreshold?: number;

  /** Show critical warning at X seconds (default: 60 = 1 minute) */
  criticalThreshold?: number;

  /** Auto-start timer (default: true) */
  autoStart?: boolean;

  /** Show pause button (default: false) */
  showPauseButton?: boolean;

  /** Custom className */
  className?: string;
}

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  hasTimedOut: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CountdownTimer({
  initialSeconds = 900, // 15 minutes
  onTimeout,
  onTick,
  warningThreshold = 180, // 3 minutes
  criticalThreshold = 60, // 1 minute
  autoStart = true,
  showPauseButton = false,
  className = '',
}: CountdownTimerProps) {
  const [state, setState] = useState<TimerState>({
    remainingSeconds: initialSeconds,
    isRunning: autoStart,
    isPaused: false,
    hasTimedOut: false,
  });

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Get urgency level
  const getUrgencyLevel = useCallback(
    (seconds: number): 'normal' | 'warning' | 'critical' => {
      if (seconds <= criticalThreshold) return 'critical';
      if (seconds <= warningThreshold) return 'warning';
      return 'normal';
    },
    [criticalThreshold, warningThreshold],
  );

  // Timer effect
  useEffect(() => {
    if (!state.isRunning || state.isPaused || state.hasTimedOut) return;

    const intervalId = setInterval(() => {
      setState(prev => {
        const newRemaining = prev.remainingSeconds - 1;

        // Check timeout
        if (newRemaining <= 0) {
          if (onTimeout) {
            onTimeout();
          }
          return {
            ...prev,
            remainingSeconds: 0,
            isRunning: false,
            hasTimedOut: true,
          };
        }

        // Tick callback
        if (onTick) {
          onTick(newRemaining);
        }

        return {
          ...prev,
          remainingSeconds: newRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [state.isRunning, state.isPaused, state.hasTimedOut, onTimeout, onTick]);

  // Control functions
  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      remainingSeconds: initialSeconds,
      isRunning: autoStart,
      isPaused: false,
      hasTimedOut: false,
    });
  }, [initialSeconds, autoStart]);

  // Get style based on urgency
  const urgencyLevel = getUrgencyLevel(state.remainingSeconds);

  const urgencyStyles = {
    normal: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      progress: 'bg-blue-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-300',
      text: 'text-yellow-900',
      icon: 'text-yellow-600',
      progress: 'bg-yellow-600',
    },
    critical: {
      container: 'bg-red-50 border-red-300 animate-pulse',
      text: 'text-red-900',
      icon: 'text-red-600',
      progress: 'bg-red-600',
    },
  };

  const styles = urgencyStyles[urgencyLevel];

  // Calculate progress percentage
  const progressPercentage = (state.remainingSeconds / initialSeconds) * 100;

  // Get message based on urgency
  const getMessage = () => {
    if (state.hasTimedOut) {
      return 'หมดเวลาชำระเงิน';
    }
    if (urgencyLevel === 'critical') {
      return '⚠️ กรุณาชำระเงินด่วน! เหลือเวลาไม่ถึง 1 นาที';
    }
    if (urgencyLevel === 'warning') {
      return '⏰ เหลือเวลาไม่มาก กรุณาชำระเงินโดยเร็ว';
    }
    return 'กรุณาชำระเงินภายในเวลาที่กำหนด';
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${styles.container} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {urgencyLevel === 'critical' ? (
            <AlertCircle className={`w-6 h-6 ${styles.icon}`} />
          ) : (
            <Clock className={`w-6 h-6 ${styles.icon}`} />
          )}
          <h3 className={`text-lg font-semibold ${styles.text}`}>เวลาที่เหลือในการชำระเงิน</h3>
        </div>

        {showPauseButton && !state.hasTimedOut && (
          <button
            onClick={state.isPaused ? resume : pause}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            {state.isPaused ? 'ดำเนินการต่อ' : 'หยุดชั่วคราว'}
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className={`text-6xl font-bold font-mono ${styles.text}`}>
          {formatTime(state.remainingSeconds)}
        </div>
        <p className={`text-sm mt-2 ${styles.text}`}>
          {state.isPaused ? '⏸️ หยุดชั่วคราว' : getMessage()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${styles.progress}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Time Breakdown */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>เริ่มต้น: {formatTime(initialSeconds)}</span>
        <span>เหลือ: {state.remainingSeconds} วินาที</span>
      </div>

      {/* Warning Messages */}
      {urgencyLevel === 'critical' && !state.hasTimedOut && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          <strong>⚠️ คำเตือน:</strong> หากหมดเวลา ระบบจะยกเลิกการชำระเงินโดยอัตโนมัติ
          และคุณจะต้องเริ่มกระบวนการใหม่
        </div>
      )}

      {/* Timeout Message */}
      {state.hasTimedOut && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-800 font-semibold">หมดเวลาชำระเงิน</p>
          <p className="text-sm text-gray-600 mt-1">
            กรุณากลับไปยังหน้าใบสมัครและเริ่มกระบวนการชำระเงินใหม่
          </p>
          <button
            onClick={reset}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            เริ่มใหม่
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VERSION (for header/navbar)
// ============================================================================

export function CompactCountdownTimer({
  initialSeconds = 900,
  onTimeout,
  className = '',
}: Pick<CountdownTimerProps, 'initialSeconds' | 'onTimeout' | 'className'>) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (onTimeout) onTimeout();
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [remainingSeconds, onTimeout]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWarning = remainingSeconds <= 180;
  const isCritical = remainingSeconds <= 60;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock
        className={`w-4 h-4 ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-600'}`}
      />
      <span
        className={`font-mono font-semibold ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-900'}`}
      >
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CountdownTimer;
