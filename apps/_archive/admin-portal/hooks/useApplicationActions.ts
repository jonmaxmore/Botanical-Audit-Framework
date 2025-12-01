import { useState } from 'react';
import * as applicationsApi from '@/lib/api/applications';
import type { Application } from '@/lib/api/applications';
import type { ReviewData } from '@/components/applications/ReviewDialog';

export function useApplicationActions(onSuccess?: () => void) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const assignReviewer = async (application: Application, reviewerId: string) => {
    try {
      await applicationsApi.assignReviewer(application.id, reviewerId);
      showSnackbar('มอบหมายผู้ตรวจสอบสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาดในการมอบหมาย', 'error');
      return false;
    }
  };

  const startReview = async (application: Application) => {
    try {
      await applicationsApi.startReview(application.id);
      showSnackbar('เริ่มการตรวจสอบสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาด', 'error');
      return false;
    }
  };

  const submitReview = async (application: Application, reviewData: ReviewData) => {
    try {
      await applicationsApi.completeReview(application.id, {
        decision: reviewData.decision,
        comments: reviewData.comment,
        documentsVerified: true,
        inspectionRequired: reviewData.decision === 'approve',
      });
      showSnackbar('บันทึกผลการตรวจสอบสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาด', 'error');
      return false;
    }
  };

  const approveApplication = async (application: Application) => {
    try {
      await applicationsApi.approveApplication(application.id, {
        comments: 'อนุมัติคำขอ',
        certificateData: {
          certificateType: 'gacp',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
      showSnackbar('อนุมัติคำขอสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาด', 'error');
      return false;
    }
  };

  const rejectApplication = async (application: Application) => {
    try {
      await applicationsApi.rejectApplication(application.id, {
        reason: 'ไม่ผ่านการตรวจสอบ',
        comments: 'ไม่ผ่านการตรวจสอบ',
      });
      showSnackbar('ปฏิเสธคำขอสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาด', 'error');
      return false;
    }
  };

  const verifyDocument = async (
    application: Application,
    documentId: string,
    verified: boolean
  ) => {
    try {
      await applicationsApi.verifyDocument(
        application.id,
        documentId,
        verified,
        verified ? undefined : 'ยกเลิกการยืนยัน'
      );
      showSnackbar(verified ? 'ยืนยันเอกสารสำเร็จ' : 'ยกเลิกการยืนยันสำเร็จ');
      onSuccess?.();
      return true;
    } catch (err: any) {
      showSnackbar('เกิดข้อผิดพลาด', 'error');
      return false;
    }
  };

  return {
    snackbar,
    handleCloseSnackbar,
    assignReviewer,
    startReview,
    submitReview,
    approveApplication,
    rejectApplication,
    verifyDocument,
  };
}
