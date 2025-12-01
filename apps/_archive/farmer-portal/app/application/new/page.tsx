'use client';

import { useRouter } from 'next/navigation';
import SmartApplicationForm from '../../../components/SmartApplicationForm';
import apiClient from '../../../lib/api-client';
import Link from 'next/link';

export default function NewApplicationPage() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            // Transform data to match backend schema if needed
            // The SmartApplicationForm data structure is already aligned with the backend

            const response = await apiClient.post('/applications', data);

            if (response.data.success) {
                alert('บันทึกคำขอเรียบร้อยแล้ว');
                router.push('/dashboard');
            } else {
                alert('เกิดข้อผิดพลาด: ' + response.data.error);
            }
        } catch (error: any) {
            console.error('Error submitting application:', error);
            alert('เกิดข้อผิดพลาดในการส่งคำขอ: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="text-green-600 hover:underline mb-4 inline-block font-medium">
                    ← กลับไปหน้าแดชบอร์ด
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">📝 ยื่นคำขอใบรับรอง GACP</h1>
                    <p className="text-gray-600 mt-2">
                        กรอกข้อมูลตามแบบฟอร์ม ภ.ท.9 เพื่อขอรับรองมาตรฐานการปฏิบัติทางการเกษตรและการเก็บเกี่ยวที่ดี
                    </p>
                </div>

                <SmartApplicationForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}
