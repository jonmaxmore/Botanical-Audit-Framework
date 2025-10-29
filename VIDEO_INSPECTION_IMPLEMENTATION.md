# 🎥 Video Inspection Implementation Plan

## 📋 Executive Summary

**Goal:** เพิ่ม Remote Video Inspection เพื่อลดต้นทุน 68% และเพิ่มประสิทธิภาพ

**Timeline:** 4-6 สัปดาห์  
**Budget:** ~200,000 THB  
**ROI:** ประหยัด 850,000 THB/เดือน = คืนทุนใน 1 เดือน!

---

## 🎯 Phase 1: Video Call Integration (2 สัปดาห์)

### Week 1: Backend Setup

#### 1.1 เลือก Video Service Provider

**Recommendation: Agora.io**

**เหตุผล:**
- ✅ Free tier: 10,000 นาที/เดือน (เพียงพอสำหรับ testing)
- ✅ Paid: $0.99/1,000 นาที (ถูกกว่า Twilio)
- ✅ มี Thailand data center (latency ต่ำ)
- ✅ Documentation ดี
- ✅ SDK รองรับ Web + Mobile
- ✅ มี Recording API

**Alternative: Zoom SDK**
- ✅ คนรู้จักมาก (UX ดี)
- ❌ ราคาแพงกว่า
- ❌ Setup ซับซ้อนกว่า

#### 1.2 Backend APIs

```typescript
// apps/backend/modules/video-inspection/

// Routes
POST   /api/inspections/:id/video/start
POST   /api/inspections/:id/video/join  
POST   /api/inspections/:id/video/end
GET    /api/inspections/:id/video/token
POST   /api/inspections/:id/video/recording

// Database Schema
interface VideoInspection {
  id: string;
  inspectionId: string;
  type: 'remote' | 'hybrid' | 'on_site';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  channelName: string;
  agoraToken: string;
  participants: {
    inspector: { id: string; name: string; joinedAt?: Date };
    farmer: { id: string; name: string; joinedAt?: Date };
  };
  recording?: {
    resourceId: string;
    sid: string;
    url: string;
    duration: number;
    size: number;
  };
  snapshots: Array<{
    timestamp: Date;
    url: string;
    takenBy: string;
  }>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}
```

#### 1.3 Agora Integration

```typescript
// apps/backend/services/agora-service.ts

import AgoraAccessToken from 'agora-access-token';

export class AgoraService {
  private appId = process.env.AGORA_APP_ID;
  private appCertificate = process.env.AGORA_APP_CERTIFICATE;

  generateToken(channelName: string, uid: number, role: 'publisher' | 'subscriber') {
    const expirationTime = 3600; // 1 hour
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTime + expirationTime;

    const token = AgoraAccessToken.RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      role === 'publisher' ? AgoraAccessToken.RtcRole.PUBLISHER : AgoraAccessToken.RtcRole.SUBSCRIBER,
      privilegeExpiredTs
    );

    return token;
  }

  async startRecording(channelName: string, uid: number) {
    // Call Agora Cloud Recording API
    const response = await fetch('https://api.agora.io/v1/apps/{appId}/cloud_recording/resourceid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${this.appId}:${this.appCertificate}`).toString('base64')}`
      },
      body: JSON.stringify({
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {
          resourceExpiredHour: 24
        }
      })
    });

    return response.json();
  }
}
```

---

### Week 2: Frontend Implementation

#### 2.1 Video Call Component

```typescript
// apps/admin-portal/components/video-inspection/VideoCallRoom.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import { Videocam, VideocamOff, Mic, MicOff, CallEnd, CameraAlt } from '@mui/icons-material';

interface VideoCallRoomProps {
  inspectionId: string;
  channelName: string;
  token: string;
  uid: number;
  role: 'inspector' | 'farmer';
  onEnd: () => void;
}

export default function VideoCallRoom({ inspectionId, channelName, token, uid, role, onEnd }: VideoCallRoomProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initAgora = async () => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setClient(agoraClient);

    // Event listeners
    agoraClient.on('user-published', async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => [...prev, user]);
        const remoteVideoTrack = user.videoTrack;
        remoteVideoTrack?.play(remoteVideoRef.current!);
      }
      
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    agoraClient.on('user-unpublished', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    // Join channel
    await agoraClient.join(process.env.NEXT_PUBLIC_AGORA_APP_ID!, channelName, token, uid);

    // Create local tracks
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack);

    // Play local video
    videoTrack.play(localVideoRef.current!);

    // Publish tracks
    await agoraClient.publish([videoTrack, audioTrack]);
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const takeSnapshot = async () => {
    // Capture screenshot from remote video
    const canvas = document.createElement('canvas');
    const video = remoteVideoRef.current?.querySelector('video');
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve as any, 'image/jpeg'));
      
      // Upload to server
      const formData = new FormData();
      formData.append('snapshot', blob, `snapshot-${Date.now()}.jpg`);
      
      await fetch(`/api/inspections/${inspectionId}/video/snapshot`, {
        method: 'POST',
        body: formData
      });
    }
  };

  const endCall = async () => {
    await cleanup();
    onEnd();
  };

  const cleanup = async () => {
    localVideoTrack?.close();
    localAudioTrack?.close();
    await client?.leave();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      {/* Remote Video (Main) */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <div ref={remoteVideoRef} style={{ width: '100%', height: '100%' }} />
        {remoteUsers.length === 0 && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Typography color="white">รอ {role === 'inspector' ? 'เกษตรกร' : 'Inspector'} เข้าร่วม...</Typography>
          </Box>
        )}
      </Box>

      {/* Local Video (PIP) */}
      <Paper sx={{ position: 'absolute', top: 16, right: 16, width: 200, height: 150, overflow: 'hidden' }}>
        <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
      </Paper>

      {/* Controls */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, bgcolor: 'rgba(0,0,0,0.8)' }}>
        <IconButton onClick={toggleVideo} color={videoEnabled ? 'primary' : 'error'}>
          {videoEnabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <IconButton onClick={toggleAudio} color={audioEnabled ? 'primary' : 'error'}>
          {audioEnabled ? <Mic /> : <MicOff />}
        </IconButton>
        {role === 'inspector' && (
          <IconButton onClick={takeSnapshot} color="primary">
            <CameraAlt />
          </IconButton>
        )}
        <IconButton onClick={endCall} color="error">
          <CallEnd />
        </IconButton>
      </Box>
    </Box>
  );
}
```

#### 2.2 Integration in Application Detail Page

```typescript
// apps/admin-portal/app/applications/[id]/page.tsx

// Add Video Inspection Button
<Button
  variant="contained"
  color="primary"
  startIcon={<Videocam />}
  onClick={handleStartVideoInspection}
>
  เริ่ม Video Inspection
</Button>

// Add Dialog
<Dialog open={videoCallOpen} fullScreen>
  <VideoCallRoom
    inspectionId={application.id}
    channelName={`inspection-${application.id}`}
    token={videoToken}
    uid={inspectorUid}
    role="inspector"
    onEnd={handleEndVideoCall}
  />
</Dialog>
```

---

## 🎯 Phase 2: Mobile Farmer App (2 สัปดาห์)

### Option 1: Progressive Web App (PWA)

**Pros:**
- ✅ ไม่ต้อง install app
- ✅ เปิดผ่าน browser ได้เลย
- ✅ Development เร็ว
- ✅ Update ง่าย

**Cons:**
- ❌ Performance ต่ำกว่า Native
- ❌ Camera control จำกัด

### Option 2: React Native

**Pros:**
- ✅ Performance ดี
- ✅ Camera control เต็มรูปแบบ
- ✅ Offline mode
- ✅ GPS tagging

**Cons:**
- ❌ Development นานกว่า
- ❌ ต้อง publish ใน App Store/Play Store

**Recommendation:** เริ่มด้วย **PWA** ก่อน → Migrate เป็น React Native ทีหลัง

---

## 🎯 Phase 3: Recording & Storage (1 สัปดาห์)

### 3.1 Cloud Recording

```typescript
// Auto-start recording when call begins
await agoraService.startRecording(channelName, uid);

// Stop recording when call ends
await agoraService.stopRecording(resourceId, sid);

// Upload to S3
await s3Service.uploadRecording(recordingUrl, `inspections/${inspectionId}/video.mp4`);
```

### 3.2 Storage Structure

```
s3://gacp-inspections/
├── {inspectionId}/
│   ├── video.mp4 (full recording)
│   ├── snapshots/
│   │   ├── snapshot-1.jpg
│   │   ├── snapshot-2.jpg
│   │   └── snapshot-3.jpg
│   └── metadata.json
```

---

## 🎯 Phase 4: UI/UX Enhancements (1 สัปดาห์)

### 4.1 Inspector Dashboard

```typescript
// Add Inspection Type Selection
<Select value={inspectionType} onChange={handleTypeChange}>
  <MenuItem value="remote">Remote Video Inspection</MenuItem>
  <MenuItem value="hybrid">Hybrid (Video + On-site)</MenuItem>
  <MenuItem value="on_site">On-site Only</MenuItem>
</Select>

// Add Quick Actions
<Button onClick={sendVideoLink}>ส่ง Video Link ให้เกษตรกร</Button>
<Button onClick={scheduleVideoCall}>นัดหมาย Video Call</Button>
```

### 4.2 Farmer Portal

```typescript
// Add Video Call Notification
<Alert severity="info">
  Inspector ต้องการทำ Video Inspection
  <Button onClick={joinVideoCall}>เข้าร่วม Video Call</Button>
</Alert>

// Add Instructions
<Box>
  <Typography variant="h6">คำแนะนำสำหรับ Video Inspection:</Typography>
  <ol>
    <li>เตรียมมือถือที่มีกล้องและอินเทอร์เน็ตดี</li>
    <li>อยู่ในพื้นที่ฟาร์มที่ต้องการตรวจสอบ</li>
    <li>ทำตามคำสั่งของ Inspector</li>
    <li>ถ่ายวิดีโอตามจุดที่ Inspector ขอ</li>
  </ol>
</Box>
```

---

## 📊 Implementation Timeline

| Week | Tasks | Deliverables |
|------|-------|--------------|
| **Week 1** | Backend Setup | APIs, Agora integration, Database schema |
| **Week 2** | Frontend (Inspector) | Video call component, Integration |
| **Week 3** | Frontend (Farmer) | PWA, Mobile-friendly UI |
| **Week 4** | Recording & Storage | Cloud recording, S3 upload |
| **Week 5** | Testing | Integration testing, Load testing |
| **Week 6** | Deployment | Production deployment, Training |

---

## 💰 Budget Breakdown

| Item | Cost (THB) | Notes |
|------|------------|-------|
| **Agora.io** | 5,000/month | ~5,000 นาที/เดือน |
| **S3 Storage** | 2,000/month | Video recordings |
| **Development** | 150,000 | 6 weeks × 25,000/week |
| **Testing** | 20,000 | QA testing |
| **Training** | 10,000 | Inspector training |
| **Contingency** | 13,000 | 10% buffer |
| **Total** | **200,000** | One-time + 7,000/month |

**ROI:** ประหยัด 850,000 THB/เดือน → คืนทุนใน **1 เดือน**!

---

## 🎯 Success Metrics

### KPIs:

| Metric | Target | Current | Improvement |
|--------|--------|---------|-------------|
| **Inspection Time** | 1 hour | 5-10 hours | 80-90% ↓ |
| **Inspectors Needed** | 7-8 | 25 | 68% ↓ |
| **Cost per Inspection** | 400 THB | 1,250 THB | 68% ↓ |
| **Inspections per Day** | 6-7 | 2 | 250% ↑ |
| **Travel Cost** | 150K/month | 500K/month | 70% ↓ |

---

## 🚀 Quick Start Guide

### For Developers:

```bash
# 1. Install Agora SDK
npm install agora-rtc-sdk-ng

# 2. Setup environment variables
AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_certificate

# 3. Run backend
cd apps/backend
npm run dev

# 4. Run admin portal
cd apps/admin-portal
npm run dev

# 5. Test video call
# Open http://localhost:3002/applications/{id}
# Click "เริ่ม Video Inspection"
```

---

## 📚 Documentation

- [Agora Documentation](https://docs.agora.io/)
- [Video Inspection User Guide](./VIDEO_INSPECTION_USER_GUIDE.md) - To be created
- [Inspector Training Manual](./INSPECTOR_TRAINING.md) - To be created

---

## 🎬 Next Steps

1. ✅ Get approval for budget (200,000 THB)
2. ✅ Sign up for Agora.io account
3. ✅ Start Week 1 development
4. ✅ Prepare training materials
5. ✅ Plan pilot testing (10 inspections)

---

**สถานะ:** 📋 Implementation Plan Ready  
**Timeline:** 6 สัปดาห์  
**Budget:** 200,000 THB  
**ROI:** คืนทุนใน 1 เดือน  
**อัพเดทล่าสุด:** 2025-01-XX
