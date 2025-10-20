'use client';

import React from 'react';
import { Box, Container, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import ProtectedRoute from '@/lib/protected-route';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReviewDetail from '@/components/applications/ReviewDetail';

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBack = () => {
    router.push('/reviews');
  };

  const handleSubmitReview = (decision: 'approve' | 'reject' | 'revise', comment: string) => {
    console.log('Decision:', decision);
    console.log('Comment:', comment);
    alert(
      `ส่งผลการตรวจสอบ: ${decision === 'approve' ? 'อนุมัติ' : decision === 'reject' ? 'ไม่อนุมัติ' : 'ส่งกลับแก้ไข'}\n\nความเห็น: ${comment}`
    );
    router.push('/reviews');
  };

  const handleSaveDraft = () => {
    alert('บันทึกแบบร่างเรียบร้อย');
  };

  // Mock data
  const reviewData = {
    id: params.id,
    applicationNumber: 'GACP-2025-0001',
    status: 'pending',
    submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    farmer: {
      name: 'นายสมชาย ใจดี',
      idCard: '1-2345-67890-12-3',
      phone: '081-234-5678',
      email: 'somchai@example.com',
    },
    farm: {
      name: 'แปลงผักปลอดภัย 1',
      address: '123 หมู่ 5',
      province: 'เชียงใหม่',
      district: 'แม่ริม',
      subdistrict: 'ริมใต้',
      area: '5 ไร่ 2 งาน',
      cropType: 'ผักสลัด, ผักกาดหอม, คะน้า',
    },
    documents: [
      {
        id: '1',
        name: 'สำเนาบัตรประชาชน',
        type: 'PDF',
        size: '1.2 MB',
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        name: 'เอกสารสิทธิ์ที่ดิน',
        type: 'PDF',
        size: '2.5 MB',
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        name: 'แผนผังแปลงเพาะปลูก',
        type: 'PDF',
        size: '3.8 MB',
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        name: 'รายการสารเคมีที่ใช้',
        type: 'PDF',
        size: '850 KB',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    checklistItems: [
      {
        id: '1',
        category: '1. ที่ตั้งและสภาพแวดล้อม',
        item: 'แปลงปลูกอยู่ห่างจากแหล่งมลพิษ',
        status: 'pending' as const,
        note: '',
      },
      {
        id: '2',
        category: '1. ที่ตั้งและสภาพแวดล้อม',
        item: 'มีแหล่งน้ำสะอาดเพียงพอ',
        status: 'pending' as const,
        note: '',
      },
      {
        id: '3',
        category: '2. การจัดการน้ำ',
        item: 'มีระบบระบายน้ำที่เหมาะสม',
        status: 'pending' as const,
        note: '',
      },
      {
        id: '4',
        category: '2. การจัดการน้ำ',
        item: 'ตรวจสอบคุณภาพน้ำเป็นประจำ',
        status: 'pending' as const,
        note: '',
      },
      {
        id: '5',
        category: '3. การใช้สารเคมี',
        item: 'ใช้สารเคมีที่ได้รับอนุญาตเท่านั้น',
        status: 'pending' as const,
        note: '',
      },
      {
        id: '6',
        category: '3. การใช้สารเคมี',
        item: 'บันทึกการใช้สารเคมีครบถ้วน',
        status: 'pending' as const,
        note: '',
      },
    ],
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex' }}>
        <AdminSidebar open={sidebarOpen} onClose={handleSidebarToggle} />

        <Box component="main" sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <AdminHeader onMenuClick={handleSidebarToggle} />

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header with Back Button */}
            <Box sx={{ mb: 3 }}>
              <Button startIcon={<BackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
                กลับไปคิวตรวจสอบ
              </Button>

              <Breadcrumbs sx={{ mb: 2 }}>
                <Link
                  underline="hover"
                  color="inherit"
                  href="/reviews"
                  onClick={e => {
                    e.preventDefault();
                    handleBack();
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  คิวตรวจสอบ
                </Link>
                <Typography color="text.primary">{reviewData.applicationNumber}</Typography>
              </Breadcrumbs>

              <Typography variant="h4" fontWeight={700} gutterBottom>
                ตรวจสอบคำขอรับรอง
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ตรวจสอบและประเมินคำขอรับรอง GACP
              </Typography>
            </Box>

            {/* Review Detail Component */}
            <ReviewDetail
              data={reviewData}
              onSubmitReview={handleSubmitReview}
              onSaveDraft={handleSaveDraft}
            />
          </Container>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
