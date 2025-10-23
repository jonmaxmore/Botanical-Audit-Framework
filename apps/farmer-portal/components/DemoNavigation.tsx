/**
 * Demo Navigation Component
 * แสดงการนำทางระหว่างขั้นตอนต่างๆ ในระบบ demo
 */
// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getDemoController } from '../lib/demoController';

interface DemoNavigationProps {
  onStepChange?: (step: any) => void;
  className?: string;
}

interface DemoStatus {
  hasActiveSession: boolean;
  stepData?: any;
  currentUser?: any;
}

export default function DemoNavigation({ onStepChange, className = '' }: DemoNavigationProps) {
  const [demoStatus, setDemoStatus] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const demoController = getDemoController();

  const updateDemoStatus = useCallback(() => {
    const status = demoController.getStatus();
    setDemoStatus(status);
    if (onStepChange && status.stepData) {
      onStepChange(status.stepData);
    }
  }, [demoController, onStepChange]);

  useEffect(() => {
    updateDemoStatus();
  }, [updateDemoStatus]);

  const handlePreviousStep = () => {
    demoController.previousStep();
    updateDemoStatus();
  };

  const handleNextStep = () => {
    demoController.nextStep();
    updateDemoStatus();
  };

  const handleGoToStep = (stepIndex: number) => {
    demoController.goToStep(stepIndex);
    updateDemoStatus();
  };

  const handleSwitchRole = (role: string) => {
    demoController.switchRole(role);
    updateDemoStatus();
  };

  const handleStartScenario = (scenarioId: string) => {
    demoController.startScenario(scenarioId);
    updateDemoStatus();
  };

  const handleResetDemo = () => {
    demoController.resetDemo();
    setDemoStatus(null);
  };

  if (!demoStatus?.hasActiveSession) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">🎭 เริ่มต้น Demo</h3>
        </div>
        <p className="text-blue-700 mb-4">เลือก scenario เพื่อเริ่มต้นการ demo ระบบ</p>
        <div className="space-y-2">
          <button
            onClick={() => handleStartScenario('scenario-1')}
            className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium">🌾 เกษตรกรใหม่ยื่นคำขอครั้งแรก</div>
            <div className="text-sm text-gray-600">
              แสดงกระบวนการยื่นคำขอตั้งแต่เริ่มต้นจนได้รับใบรับรอง
            </div>
          </button>
          <button
            onClick={() => handleStartScenario('scenario-2')}
            className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium">🔍 การตรวจประเมินในพื้นที่</div>
            <div className="text-sm text-gray-600">แสดงกระบวนการตรวจสอบในฟาร์มตามมาตรฐาน GACP</div>
          </button>
          <button
            onClick={() => handleStartScenario('scenario-3')}
            className="w-full text-left p-3 bg-white rounded border hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium">⚙️ การบริหารจัดการระบบ</div>
            <div className="text-sm text-gray-600">แสดงการทำงานของผู้บริหารในการดูแลระบบ</div>
          </button>
        </div>
      </div>
    );
  }

  const { stepData, currentUser } = demoStatus;

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎭</span>
            <div>
              <h3 className="font-semibold text-green-900">Demo Mode</h3>
              <p className="text-sm text-green-700">
                {stepData?.scenario.title} - ขั้นที่ {stepData?.currentStepIndex + 1}/
                {stepData?.totalSteps}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-green-600 hover:text-green-800"
          >
            {isExpanded ? '🔼' : '🔽'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Current User */}
          <div className="bg-white rounded p-3 border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">ผู้ใช้งานปัจจุบัน:</span>
              <select
                value={currentUser?.role || 'farmer'}
                onChange={e => handleSwitchRole(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="farmer">🌾 เกษตรกร</option>
                <option value="inspector">🔍 ผู้ตรวจสอบ</option>
                <option value="reviewer">📋 ผู้ประเมิน</option>
                <option value="admin">⚙️ ผู้บริหาร</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {currentUser?.name} ({currentUser?.email})
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-white rounded p-3 border">
            <div className="font-medium text-gray-900 mb-2">ขั้นตอนปัจจุบัน:</div>
            <div className="text-sm">
              <div className="font-medium text-blue-600">{stepData?.currentStepData.action}</div>
              <div className="text-gray-600">บทบาท: {stepData?.currentStepData.role}</div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded p-3 border">
            <div className="font-medium text-gray-900 mb-3">ความคืบหน้า:</div>
            <div className="space-y-2">
              {stepData?.scenario.steps.map((step: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleGoToStep(index)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    index === stepData.currentStepIndex
                      ? 'bg-blue-100 border-blue-300 border-2'
                      : index < stepData.currentStepIndex
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        index === stepData.currentStepIndex
                          ? 'bg-blue-500 text-white'
                          : index < stepData.currentStepIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index < stepData.currentStepIndex ? '✓' : index + 1}
                    </span>
                    <span className="flex-1">{step.action}</span>
                    <span className="text-xs opacity-60">{step.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handlePreviousStep}
              disabled={stepData?.isFirstStep}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              ⬅️ ก่อนหน้า
            </button>

            <div className="text-sm text-gray-600">
              {stepData?.currentStepIndex + 1} / {stepData?.totalSteps}
            </div>

            <button
              onClick={handleNextStep}
              disabled={stepData?.isLastStep}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              ถัดไป ➡️
            </button>
          </div>

          {/* Demo Actions */}
          <div className="border-t pt-3 space-y-2">
            <button
              onClick={handleResetDemo}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              🔄 รีเซ็ต Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
