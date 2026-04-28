'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export interface RemoteParticipant {
    userId: string;
    userName: string;
    avatar: string;
    stream: MediaStream | null;
    micOn: boolean;
    videoOn: boolean;
    isScreenSharing?: boolean;
    joinedAt: number;
}

export interface SignCaption {
    word: string;
    sentence: string;
    userId: string;
    userName: string;
}

export interface MeetingInfo {
    _id: string;
    title: string;
    meetingId: string;
    host: { _id: string; name: string };
}

export interface ChatFileData {
    name: string;
    mimeType: string;
    dataUrl: string;
    size: number;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text?: string;
    fileData?: ChatFileData;
    timestamp: number;
    isLocal?: boolean;
}

export interface WhiteboardDrawData {
    color: string;
    lineWidth: number;
    points: { x: number; y: number }[];
    eraser: boolean;
}

export function useMeeting(meetingId: string, onEnd: () => void, noiseCancellation = true) {
    const { user } = useAuth();

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [micOn, setMicOn] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('meeting_micOn') !== 'false';
        return true;
    });
    const [videoOn, setVideoOn] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('meeting_videoOn') !== 'false';
        return true;
    });
    const [screenSharing, setScreenSharing] = useState(false);
    const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
    const [participantCaptions, setParticipantCaptions] = useState<Map<string, SignCaption>>(new Map());
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [remoteDraws, setRemoteDraws] = useState<WhiteboardDrawData[]>([]);
    const [remoteClearCount, setRemoteClearCount] = useState(0);
    const [remoteWhiteboardOpener, setRemoteWhiteboardOpener] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const localJoinedAt = useRef<number>(Date.now());

    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const participantsRef = useRef<Map<string, RemoteParticipant>>(new Map());
    const onEndRef = useRef(onEnd);
    onEndRef.current = onEnd;

    const flush = useCallback(() => {
        setRemoteParticipants(Array.from(participantsRef.current.values()));
    }, []);

    const micOnRef = useRef(micOn);
    micOnRef.current = micOn;
    const videoOnRef = useRef(videoOn);
    videoOnRef.current = videoOn;
    const screenSharingRef = useRef(screenSharing);
    screenSharingRef.current = screenSharing;

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('meeting_micOn', String(micOn));
        }
    }, [micOn]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('meeting_videoOn', String(videoOn));
        }
    }, [videoOn]);

    useEffect(() => {
        if (!user || !meetingId) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;

        let mounted = true;

        // ── helpers ────────────────────────────────────────────────────────
        function getOrCreatePC(targetId: string, targetName: string, targetAvatar: string): RTCPeerConnection {
            if (pcsRef.current.has(targetId)) return pcsRef.current.get(targetId)!;

            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcsRef.current.set(targetId, pc);

            // Ensure participant entry exists
            if (!participantsRef.current.has(targetId)) {
                participantsRef.current.set(targetId, {
                    userId: targetId,
                    userName: targetName,
                    avatar: targetAvatar,
                    stream: null,
                    micOn: true,
                    videoOn: true,
                    isScreenSharing: false,
                    joinedAt: Date.now(),
                });
                flush();
            }

            // Add our local tracks
            localStreamRef.current?.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });

            // If already screen sharing when this PC is created, send the screen track
            if (screenSharingRef.current && screenStreamRef.current) {
                const screenTrack = screenStreamRef.current.getVideoTracks()[0];
                if (screenTrack) {
                    const videoSender = pc.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    } else {
                        pc.addTrack(screenTrack, screenStreamRef.current);
                    }
                }
            }

            // Receive remote track
            pc.ontrack = (e) => {
                const stream = e.streams[0] ?? new MediaStream([e.track]);
                const existing = participantsRef.current.get(targetId);
                if (existing) {
                    participantsRef.current.set(targetId, { ...existing, stream });
                    flush();
                }
            };

            // Send ICE candidates via socket
            pc.onicecandidate = (e) => {
                if (e.candidate && socketRef.current?.connected) {
                    socketRef.current.emit('meeting:signal', {
                        meetingId,
                        to: targetId,
                        signal: { type: 'candidate', candidate: e.candidate },
                    });
                }
            };

            // Remove participant on connection failure
            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                    pcsRef.current.delete(targetId);
                    participantsRef.current.delete(targetId);
                    flush();
                }
            };

            return pc;
        }

        // ── init ──────────────────────────────────────────────────────────
        const init = async () => {
            // 1. Get local media with optional noise cancellation
            const audioConstraints: MediaTrackConstraints = {
                echoCancellation: noiseCancellation,
                noiseSuppression: noiseCancellation,
                autoGainControl: noiseCancellation,
            };
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: audioConstraints });
                // If mic was initially off, mute the acquired audio track
                if (!micOn) {
                    stream.getAudioTracks().forEach(track => track.enabled = false);
                }
            } catch {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: audioConstraints });
                    if (mounted) setVideoOn(false);
                    // If mic was initially off, mute the acquired audio track
                    if (!micOn) {
                        stream.getAudioTracks().forEach(track => track.enabled = false);
                    }
                } catch {
                    if (mounted) setError('Could not access camera or microphone');
                    return;
                }
            }
            if (!mounted) { stream!.getTracks().forEach(t => t.stop()); return; }
            localStreamRef.current = stream!;
            setLocalStream(stream!);

            // 2. Fetch meeting info
            try {
                const { data } = await api.get(`/meetings/info/${meetingId}`);
                if (mounted) setMeetingInfo(data.meeting);
            } catch { /* non-critical */ }

            // 3. Connect Socket.io
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001', {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
            });
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('meeting:join', { meetingId });
                // Ensure we broadcast our initial state to the room upon joining
                socket.emit('media:state', {
                    meetingId,
                    micOn: micOnRef.current,
                    videoOn: videoOnRef.current,
                    screenSharing: screenSharingRef.current,
                });
            });

            // 4. Existing participants → we are the caller for each
            socket.on('meeting:existing-participants', async ({ participants }: {
                participants: Array<{ userId: string; userName: string; avatar: string }>;
            }) => {
                for (const p of participants) {
                    const pc = getOrCreatePC(p.userId, p.userName, p.avatar);
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socket.emit('meeting:signal', {
                            meetingId,
                            to: p.userId,
                            signal: { type: 'offer', sdp: pc.localDescription },
                        });
                    } catch (err) {
                        console.error('[useMeeting] offer error:', err);
                    }
                }
            });

            // 5. New participant joined → pre-register; wait for their offer
            socket.on('meeting:participant:joined', ({ user: u }: { user: { _id: string; name: string; avatar: string } }) => {
                if (!participantsRef.current.has(u._id)) {
                    participantsRef.current.set(u._id, {
                        userId: u._id,
                        userName: u.name,
                        avatar: u.avatar || '',
                        stream: null,
                        micOn: true,
                        videoOn: true,
                        isScreenSharing: false,
                        joinedAt: Date.now(),
                    });
                    flush();
                    socket.emit('media:state', {
                        meetingId,
                        micOn: micOnRef.current,
                        videoOn: videoOnRef.current,
                        screenSharing: screenSharingRef.current,
                    });
                }
            });

            // 6. WebRTC signaling
            socket.on('meeting:signal', async ({ from, fromUserName, fromAvatar, signal }: {
                from: string;
                fromUserName: string;
                fromAvatar: string;
                signal: {
                    type: 'offer' | 'answer' | 'candidate';
                    sdp?: RTCSessionDescriptionInit;
                    candidate?: RTCIceCandidateInit;
                };
            }) => {
                if (signal.type === 'offer') {
                    const pc = getOrCreatePC(from, fromUserName, fromAvatar);
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        socket.emit('meeting:signal', {
                            meetingId,
                            to: from,
                            signal: { type: 'answer', sdp: pc.localDescription },
                        });
                    } catch (err) {
                        console.error('[useMeeting] answer error:', err);
                    }
                } else if (signal.type === 'answer') {
                    const pc = pcsRef.current.get(from);
                    if (pc?.signalingState === 'have-local-offer') {
                        try {
                            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                        } catch (err) {
                            console.error('[useMeeting] setRemote answer error:', err);
                        }
                    }
                } else if (signal.type === 'candidate') {
                    const pc = pcsRef.current.get(from);
                    if (pc) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate!));
                        } catch (err) {
                            console.error('[useMeeting] ICE error:', err);
                        }
                    }
                }
            });

            // 7. Participant left
            socket.on('meeting:participant:left', ({ userId: leftId }: { userId: string }) => {
                pcsRef.current.get(leftId)?.close();
                pcsRef.current.delete(leftId);
                participantsRef.current.delete(leftId);
                flush();
            });

            // 8. Chat messages relayed from other participants
            socket.on('meeting:chat:message', (msg: ChatMessage) => {
                setChatMessages(prev => [...prev, { ...msg, isLocal: false }]);
            });

            // 9. Sign language detections relayed through backend — keyed per participant
            socket.on('sign:detected', (payload: SignCaption) => {
                setParticipantCaptions(prev => new Map(prev).set(payload.userId, payload));
                // Auto-expire after 4 s of silence
                setTimeout(() => {
                    setParticipantCaptions(prev => {
                        const next = new Map(prev);
                        next.delete(payload.userId);
                        return next;
                    });
                }, 4000);
            });

            // 10. Sync mic/video/screen state from peers
            socket.on('media:state', ({ userId, micOn: remoteMic, videoOn: remoteVideo, screenSharing: remoteScreenSharing }: any) => {
                const existing = participantsRef.current.get(userId);
                if (existing) {
                    participantsRef.current.set(userId, {
                        ...existing,
                        micOn: remoteMic,
                        videoOn: remoteVideo,
                        isScreenSharing: remoteScreenSharing
                    });
                    flush();
                }
            });

            // 11. Whiteboard draw/clear/open from peers
            socket.on('meeting:whiteboard:open', ({ userName }: { userName: string }) => {
                setRemoteWhiteboardOpener(userName);
            });

            socket.on('meeting:whiteboard:draw', ({ data }: { data: WhiteboardDrawData }) => {
                if (data) setRemoteDraws(prev => [...prev, data]);
            });

            socket.on('meeting:whiteboard:clear', () => {
                setRemoteDraws([]);
                setRemoteClearCount(n => n + 1);
            });
        };

        init();

        return () => {
            mounted = false;
            socketRef.current?.emit('meeting:leave', { meetingId });
            socketRef.current?.disconnect();
            socketRef.current = null;
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            pcsRef.current.forEach(pc => pc.close());
            pcsRef.current.clear();
            participantsRef.current.clear();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, meetingId, noiseCancellation]);

    // ── broadcast media state changes ───────────────────────────────────────
    useEffect(() => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('media:state', { meetingId, micOn, videoOn, screenSharing });
        }
    }, [micOn, videoOn, screenSharing, meetingId]);

    // ── controls ────────────────────────────────────────────────────────────
    const toggleMic = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
    }, []);

    const toggleVideo = useCallback(async () => {
        const currentStream = localStreamRef.current;
        if (!currentStream) return;

        const videoTrack = currentStream.getVideoTracks()[0];
        if (!videoTrack || videoTrack.readyState === 'ended') {
            // Camera is off — turn it on
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
                const newVideoTrack = newStream.getVideoTracks()[0];
                if (newVideoTrack) {
                    if (videoTrack) currentStream.removeTrack(videoTrack);
                    currentStream.addTrack(newVideoTrack);

                    pcsRef.current.forEach(pc => {
                        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(newVideoTrack);
                        } else {
                            pc.addTrack(newVideoTrack, currentStream);
                        }
                    });

                    setVideoOn(true);
                    setLocalStream(new MediaStream(currentStream.getTracks()));
                }
            } catch (err) {
                console.error("Failed to get new video track", err);
            }
        } else {
            // Camera is on — stop the track and release the hardware
            videoTrack.stop();
            currentStream.removeTrack(videoTrack);

            // Tell peers the video is gone so they see black/no-video
            pcsRef.current.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) sender.replaceTrack(null);
            });

            setVideoOn(false);
            // Update state so downstream hooks (useSignLanguage, useBackgroundBlur)
            // get a stream with no video track and release their camera references
            setLocalStream(new MediaStream(currentStream.getTracks()));
        }
    }, []);

    const toggleScreenShare = useCallback(async () => {
        const replaceVideoTrack = async (newTrack: MediaStreamTrack | null) => {
            for (const [targetId, pc] of pcsRef.current.entries()) {
                // Match active video senders AND senders whose track was set to null (camera off)
                const sender = pc.getSenders().find(s => s.track?.kind === 'video' || s.track === null);
                if (sender) {
                    try {
                        await sender.replaceTrack(newTrack);
                    } catch (err) {
                        console.error('[useMeeting] replaceTrack failed:', err);
                    }
                } else if (newTrack) {
                    // No video sender at all (joined without camera) — add and renegotiate
                    pc.addTrack(newTrack, localStreamRef.current ?? new MediaStream());
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socketRef.current?.emit('meeting:signal', {
                            meetingId,
                            to: targetId,
                            signal: { type: 'offer', sdp: pc.localDescription },
                        });
                    } catch (err) {
                        console.error('[useMeeting] screen share renegotiation failed:', err);
                    }
                }
            }
        };

        if (screenSharing) {
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            setScreenSharing(false);
            setScreenStream(null);
            const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
            await replaceVideoTrack(camTrack);
        } else {
            try {
                const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screen;
                const screenTrack = screen.getVideoTracks()[0];
                setScreenSharing(true);
                setScreenStream(screen);
                await replaceVideoTrack(screenTrack);

                screenTrack.onended = async () => {
                    screenStreamRef.current = null;
                    setScreenSharing(false);
                    setScreenStream(null);
                    const camTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
                    await replaceVideoTrack(camTrack);
                };
            } catch {
                // user cancelled
            }
        }
    }, [screenSharing]);

    const broadcastWhiteboardOpen = useCallback(() => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('meeting:whiteboard:open', { meetingId });
    }, [meetingId]);

    const sendWhiteboardDraw = useCallback((data: WhiteboardDrawData) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('meeting:whiteboard:draw', { meetingId, data });
    }, [meetingId]);

    const sendWhiteboardClear = useCallback(() => {
        if (!socketRef.current?.connected) return;
        setRemoteDraws([]);
        socketRef.current.emit('meeting:whiteboard:clear', { meetingId });
    }, [meetingId]);

    const sendChatMessage = useCallback((text?: string, fileData?: ChatFileData) => {
        if (!socketRef.current?.connected || !user || (!text && !fileData)) return;
        const msg: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            senderId: user._id,
            senderName: (user as { _id: string; name?: string }).name ?? 'You',
            text,
            fileData,
            timestamp: Date.now(),
            isLocal: true,
        };
        setChatMessages(prev => [...prev, msg]);
        socketRef.current!.emit('meeting:chat:message', { meetingId, ...msg });
    }, [meetingId, user]);

    const leaveMeeting = useCallback(async () => {
        socketRef.current?.emit('meeting:leave', { meetingId });
        socketRef.current?.disconnect();
        socketRef.current = null;

        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;

        pcsRef.current.forEach(pc => pc.close());
        pcsRef.current.clear();
        participantsRef.current.clear();

        setLocalStream(null);
        setRemoteParticipants([]);

        // End meeting in DB if we're the host
        if (meetingInfo && user && meetingInfo.host._id === user._id) {
            try { await api.put(`/meetings/${meetingInfo._id}/end`); } catch { /* ignore */ }
        }

        onEndRef.current();
    }, [meetingId, meetingInfo, user]);

    return {
        localStream,
        screenStream,
        remoteParticipants,
        micOn,
        videoOn,
        screenSharing,
        toggleMic,
        toggleVideo,
        toggleScreenShare,
        leaveMeeting,
        meetingInfo,
        participantCaptions,
        chatMessages,
        sendChatMessage,
        remoteDraws,
        remoteClearCount,
        remoteWhiteboardOpener,
        broadcastWhiteboardOpen,
        sendWhiteboardDraw,
        sendWhiteboardClear,
        error,
        localJoinedAt: localJoinedAt.current,
    };
}
