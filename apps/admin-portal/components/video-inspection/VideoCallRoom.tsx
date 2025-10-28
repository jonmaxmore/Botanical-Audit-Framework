'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Paper, Typography, Alert } from '@mui/material';
import { Videocam, VideocamOff, Mic, MicOff, CallEnd, CameraAlt, ScreenShare } from '@mui/icons-material';
import { useAgoraVideoCall } from '@/hooks/useAgoraVideoCall';

interface VideoCallRoomProps {
  inspectionId: string;
  role: 'inspector' | 'farmer';
  onEnd: () => void;
  onSnapshot?: (blob: Blob) => void;
}

export default function VideoCallRoom({ inspectionId, role, onEnd, onSnapshot }: VideoCallRoomProps) {
  const { localVideoTrack, localAudioTrack, remoteUsers, isJoined, error, toggleVideo, toggleAudio, leave } = useAgoraVideoCall({
    inspectionId,
    role,
  });

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteUsers.size > 0) {
      const firstRemoteUser = Array.from(remoteUsers.values())[0];
      if (firstRemoteUser?.videoTrack) {
        firstRemoteUser.videoTrack.play(remoteVideoRef.current);
      }
    }
  }, [remoteUsers]);

  const takeSnapshot = async () => {
    if (!remoteVideoRef.current) return;
    
    const videoElement = remoteVideoRef.current.querySelector('video');
    if (!videoElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d')?.drawImage(videoElement, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob && onSnapshot) {
        onSnapshot(blob);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleEnd = async () => {
    await leave();
    onEnd();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Remote Video (Main) */}
      <Box sx={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={remoteVideoRef}
          style={{ width: '100%', height: '100%' }}
        />
        {remoteUsers.size === 0 && (
          <Box sx={{ position: 'absolute', textAlign: 'center' }}>
            <Typography variant="h6" color="white">
              รอ {role === 'inspector' ? 'เกษตรกร' : 'ผู้ตรวจสอบ'} เข้าร่วม...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Local Video (PIP) */}
      <Paper sx={{ position: 'absolute', top: 16, right: 16, width: 240, height: 180, overflow: 'hidden' }}>
        <div
          ref={localVideoRef}
          style={{ width: '100%', height: '100%' }}
        />
      </Paper>

      {/* Controls */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, bgcolor: 'rgba(0,0,0,0.9)' }}>
        <IconButton onClick={toggleVideo} sx={{ color: localVideoTrack?.enabled ? 'primary.main' : 'error.main' }}>
          {localVideoTrack?.enabled ? <Videocam /> : <VideocamOff />}
        </IconButton>
        <IconButton onClick={toggleAudio} sx={{ color: localAudioTrack?.enabled ? 'primary.main' : 'error.main' }}>
          {localAudioTrack?.enabled ? <Mic /> : <MicOff />}
        </IconButton>
        {role === 'inspector' && (
          <>
            <IconButton onClick={takeSnapshot} sx={{ color: 'primary.main' }} disabled={remoteUsers.size === 0}>
              <CameraAlt />
            </IconButton>
            <IconButton sx={{ color: 'primary.main' }}>
              <ScreenShare />
            </IconButton>
          </>
        )}
        <IconButton onClick={handleEnd} sx={{ color: 'error.main' }}>
          <CallEnd />
        </IconButton>
      </Box>
    </Box>
  );
}
