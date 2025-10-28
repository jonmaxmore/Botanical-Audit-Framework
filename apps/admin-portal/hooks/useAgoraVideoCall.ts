import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import axios from 'axios';

interface UseAgoraVideoCallProps {
  inspectionId: string;
  role: 'inspector' | 'farmer';
}

export const useAgoraVideoCall = ({ inspectionId, role }: UseAgoraVideoCallProps) => {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<number, { videoTrack?: IRemoteVideoTrack; audioTrack?: IRemoteAudioTrack }>>(new Map());
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const uid = Math.floor(Math.random() * 100000);
        
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/video/inspections/${inspectionId}/video-token`,
          { uid, role }
        );
        
        const { token, channelName, appId } = response.data;
        
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          setRemoteUsers(prev => {
            const newMap = new Map(prev);
            const userData = newMap.get(user.uid as number) || {};
            
            if (mediaType === 'video') {
              userData.videoTrack = user.videoTrack;
            } else if (mediaType === 'audio') {
              userData.audioTrack = user.audioTrack;
              user.audioTrack?.play();
            }
            
            newMap.set(user.uid as number, userData);
            return newMap;
          });
        });

        client.on('user-unpublished', (user, mediaType) => {
          setRemoteUsers(prev => {
            const newMap = new Map(prev);
            const userData = newMap.get(user.uid as number);
            
            if (userData) {
              if (mediaType === 'video') {
                delete userData.videoTrack;
              } else if (mediaType === 'audio') {
                delete userData.audioTrack;
              }
              
              if (!userData.videoTrack && !userData.audioTrack) {
                newMap.delete(user.uid as number);
              } else {
                newMap.set(user.uid as number, userData);
              }
            }
            
            return newMap;
          });
        });

        client.on('user-left', (user) => {
          setRemoteUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(user.uid as number);
            return newMap;
          });
        });

        await client.join(appId, channelName, token, uid);
        
        const [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);
        
        await client.publish([videoTrack, audioTrack]);
        setIsJoined(true);
      } catch (err: any) {
        setError(err.message || 'ไม่สามารถเชื่อมต่อได้');
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [inspectionId, role]);

  const cleanup = async () => {
    localVideoTrack?.close();
    localAudioTrack?.close();
    
    if (clientRef.current) {
      await clientRef.current.leave();
      clientRef.current.removeAllListeners();
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled);
    }
  };

  const leave = async () => {
    await cleanup();
    setIsJoined(false);
  };

  return {
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    error,
    toggleVideo,
    toggleAudio,
    leave,
  };
};
