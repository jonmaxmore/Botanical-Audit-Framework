# Agora Video Call Integration

## การติดตั้ง

1. ติดตั้ง dependencies:

```bash
# Admin Portal
cd apps/admin-portal
pnpm install

# Backend
cd apps/backend
pnpm install
```

2. ตั้งค่า environment variables:

**Backend (.env)**

```env
AGORA_APP_ID=20028831
AGORA_APP_CERTIFICATE=4a458225df3358aee176b10efcca32869070dcbf1411175731e8639402e90d3b
```

**Admin Portal (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## การใช้งาน

### 1. Credentials ที่ใช้งาน

- **App ID:** 20028831
- **Secret Key:** 4a458225df3358aee176b10efcca32869070dcbf1411175731e8639402e90d3b

### 2. Backend API (✅ พร้อมใช้งาน)

Endpoint สำหรับ generate Agora token:

**POST** `/api/video/inspections/:id/video-token`

Request Body:

```json
{
  "uid": 12345,
  "role": "inspector"
}
```

Response:

```json
{
  "token": "agora_token_here",
  "channelName": "inspection_123",
  "uid": 12345,
  "appId": "20028831",
  "expiresAt": 1234567890
}
```

### 3. Component Usage

```tsx
import VideoCallRoom from '@/components/video-inspection/VideoCallRoom';

function InspectionPage() {
  const handleSnapshot = (blob: Blob) => {
    const formData = new FormData();
    formData.append('snapshot', blob);
    // Upload to server
  };

  return (
    <VideoCallRoom
      inspectionId="123"
      role="inspector"
      onEnd={() => console.log('Call ended')}
      onSnapshot={handleSnapshot}
    />
  );
}
```

## Features

- ✅ Video/Audio toggle
- ✅ Remote user detection
- ✅ Snapshot capture (inspector only)
- ✅ Screen sharing button (inspector only)
- ✅ Auto cleanup on unmount
- ✅ Error handling

## ไฟล์ที่สร้างแล้ว

✅ `apps/backend/routes/video-inspection.routes.js` - Token generation API
✅ `apps/admin-portal/hooks/useAgoraVideoCall.ts` - Custom hook
✅ `apps/admin-portal/components/video-inspection/VideoCallRoom.tsx` - Video call UI
✅ Backend และ Frontend package.json อัปเดตแล้ว
✅ Environment variables ตั้งค่าแล้ว

## Security Notes

- Token ต้อง generate จาก backend เท่านั้น (ไม่ควรเก็บ App Certificate ใน frontend)
- Token มีอายุ 1 ชั่วโมง (ปรับได้ตามต้องการ)
- Inspector มี role เป็น PUBLISHER (สามารถส่งและรับ)
- Farmer มี role เป็น PUBLISHER (สามารถส่งและรับ)

## Testing

1. รัน Backend:

```bash
cd apps/backend
pnpm install
node atlas-server.js
```

2. รัน Admin Portal:

```bash
cd apps/admin-portal
pnpm install
npm run dev
```

3. ทดสอบ API:

```bash
curl -X POST http://localhost:3000/api/video/inspections/123/video-token \
  -H "Content-Type: application/json" \
  -d '{"uid": 12345, "role": "inspector"}'
```

4. เปิด video call component และทดสอบ:
   - Toggle video/audio
   - Remote user connection
   - Snapshot capture
