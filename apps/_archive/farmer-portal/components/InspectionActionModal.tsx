'use client';

import React, { useState, useRef } from 'react';
import { X, Camera, Video, MapPin, CheckSquare, Upload, Image as ImageIcon } from 'lucide-react';

export interface InspectionFormData {
  decision: 'pass' | 'fail';
  lotId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos: File[];
  videos: File[];
  checklist: {
    item: string;
    checked: boolean;
    notes?: string;
  }[];
  comments: string;
  feedbackScore?: number;
}

interface InspectionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicationData: {
    farmerId: string;
    farmerName: string;
    farmName: string;
    farmLocation?: string;
  };
  onSubmit: (data: InspectionFormData) => Promise<void>;
}

const defaultChecklist = [
  'พื้นที่เพาะปลูกตรงตามแผนที่',
  'มีการจัดการดินตามมาตรฐาน',
  'แหล่งน้ำเพียงพอและสะอาด',
  'ไม่พบการใช้สารเคมีต้องห้าม',
  'มีระบบจัดการศัตรูพืช',
  'พื้นที่เก็บผลผลิตเหมาะสม',
  'มีการบันทึกข้อมูลครบถ้วน',
  'ปลอดจากสิ่งปนเปื้อน'
];

export default function InspectionActionModal({
  isOpen,
  onClose,
  applicationId,
  applicationData,
  onSubmit
}: InspectionActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'pass' | 'fail'>('pass');
  const [lotId, setLotId] = useState(`LOT-${Date.now().toString(36).toUpperCase()}`);
  const [location, setLocation] = useState<InspectionFormData['location'] | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [checklist, setChecklist] = useState(
    defaultChecklist.map(item => ({ item, checked: false, notes: '' }))
  );
  const [comments, setComments] = useState('');
  const [feedbackScore, setFeedbackScore] = useState(3);
  const [gettingLocation, setGettingLocation] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);

    if (!navigator.geolocation) {
      alert('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        // Try to get address from reverse geocoding (optional)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          setLocation({
            latitude,
            longitude,
            address: data.display_name
          });
        } catch {
          setLocation({
            latitude,
            longitude
          });
        }

        setGettingLocation(false);
      },
      error => {
        console.error('Error getting location:', error);
        alert('ไม่สามารถระบุตำแหน่งได้');
        setGettingLocation(false);
      }
    );
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideos = Array.from(e.target.files);
      setVideos([...videos, ...newVideos]);
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Remove video
  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Update checklist item
  const updateChecklistItem = (
    index: number,
    field: 'checked' | 'notes',
    value: boolean | string
  ) => {
    const newChecklist = [...checklist];
    if (field === 'checked') {
      newChecklist[index].checked = value as boolean;
    } else {
      newChecklist[index].notes = value as string;
    }
    setChecklist(newChecklist);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!location) {
      alert('กรุณาระบุตำแหน่งที่ตรวจสอบ');
      return;
    }

    if (photos.length === 0) {
      alert('กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป');
      return;
    }

    if (!comments.trim()) {
      alert('กรุณากรอกความคิดเห็น');
      return;
    }

    try {
      setLoading(true);

      const formData: InspectionFormData = {
        decision,
        lotId,
        location,
        photos,
        videos,
        checklist,
        comments: comments.trim(),
        feedbackScore
      };

      await onSubmit(formData);

      // Reset form
      setPhotos([]);
      setVideos([]);
      setComments('');
      setLocation(null);
      onClose();
    } catch (error) {
      console.error('Failed to submit inspection:', error);
      alert('เกิดข้อผิดพลาดในการส่งผลการตรวจสอบ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ตรวจสอบแปลงเพาะปลูก</h2>
                  <p className="text-sm text-gray-600">รหัสใบสมัคร: {applicationId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Farm info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">ข้อมูลฟาร์ม</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ชื่อเกษตรกร:</span>
                  <span className="ml-2 font-medium">{applicationData.farmerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">ชื่อฟาร์ม:</span>
                  <span className="ml-2 font-medium">{applicationData.farmName}</span>
                </div>
                {applicationData.farmLocation && (
                  <div className="col-span-2">
                    <span className="text-gray-600">ที่ตั้ง:</span>
                    <span className="ml-2 font-medium">{applicationData.farmLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lot ID */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">Lot ID *</label>
              <input
                type="text"
                value={lotId}
                onChange={e => setLotId(e.target.value)}
                placeholder="LOT-XXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                ตำแหน่งที่ตรวจสอบ *
              </label>
              {location ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-900 mb-1">✓ ระบุตำแหน่งแล้ว</div>
                  <div className="text-sm text-gray-600">
                    <div>Latitude: {location.latitude.toFixed(6)}</div>
                    <div>Longitude: {location.longitude.toFixed(6)}</div>
                    {location.address && <div className="mt-2">{location.address}</div>}
                  </div>
                </div>
              ) : (
                <button
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {gettingLocation ? 'กำลังระบุตำแหน่ง...' : 'ระบุตำแหน่งปัจจุบัน'}
                </button>
              )}
            </div>

            {/* Photos */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                รูปภาพประกอบ * (อย่างน้อย 1 รูป)
              </label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                aria-label="อัพโหลดรูปภาพ"
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">คลิกเพื่ออัพโหลดรูปภาพ</span>
              </button>
              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ลบรูปภาพ"
                        aria-label="ลบรูปภาพ"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                วิดีโอประกอบ (ถ้ามี)
              </label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
                aria-label="อัพโหลดวิดีโอ"
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-600">คลิกเพื่ออัพโหลดวิดีโอ</span>
              </button>
              {videos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">{video.name}</span>
                      <button
                        onClick={() => removeVideo(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="ลบวิดีโอ"
                        aria-label="ลบวิดีโอ"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-3">
                <CheckSquare className="w-4 h-4 inline mr-1" />
                รายการตรวจสอบ
              </label>
              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={e => updateChecklistItem(index, 'checked', e.target.checked)}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.item}</div>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={e => updateChecklistItem(index, 'notes', e.target.value)}
                          placeholder="หมายเหตุ (ถ้ามี)"
                          className="mt-1 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">ผลการตรวจสอบ</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDecision('pass')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'pass'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <CheckSquare
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'pass' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">ผ่าน</div>
                </button>

                <button
                  onClick={() => setDecision('fail')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    decision === 'fail'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <X
                    className={`w-8 h-8 mx-auto mb-2 ${
                      decision === 'fail' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium">ไม่ผ่าน</div>
                </button>
              </div>
            </div>

            {/* Feedback score */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">คะแนนความพึงพอใจ (1-5)</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => setFeedbackScore(score)}
                    className={`w-12 h-12 rounded-lg font-bold transition-all ${
                      feedbackScore >= score
                        ? 'bg-yellow-400 text-yellow-900 scale-110'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 mb-2">ความคิดเห็น *</label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="กรุณากรอกความคิดเห็นเกี่ยวกับการตรวจสอบ..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !location || photos.length === 0 || !comments.trim()}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  decision === 'pass'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจสอบ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
