'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Minimize2 } from 'lucide-react';
import { useCall, type ActiveCall } from '@/contexts/CallContext';
import { useSocket } from '@/hooks/useSocket';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

type SignalPayload = {
    type: 'offer' | 'answer' | 'candidate';
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
};

// ── inner component (only mounted when a call is active) ─────────────────────
function CallWindowInner({ call }: { call: ActiveCall }) {
    const { endCall } = useCall();
    const socket = useSocket();

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(call.type === 'video');
    const [minimized, setMinimized] = useState(false);
    const [connected, setConnected] = useState(false);
    const [duration, setDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const connectedAtRef = useRef<number>(0);

    // Duration counter
    useEffect(() => {
        if (!connected) return;
        connectedAtRef.current = Date.now();
        const id = setInterval(() => setDuration(Math.floor((Date.now() - connectedAtRef.current) / 1000)), 1000);
        return () => clearInterval(id);
    }, [connected]);

    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    // ── WebRTC setup ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        let mounted = true;

        // Signal handler — registered first so we never miss early signals
        const handleSignal = async ({ callId, from, signal }: {
            callId: string; from: string; signal: SignalPayload;
        }) => {
            if (callId !== call.callId || from !== call.remoteUser.userId) return;
            const pc = pcRef.current;
            if (!pc) return;

            try {
                if (signal.type === 'offer') {
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('call:signal', {
                        callId: call.callId,
                        to: call.remoteUser.userId,
                        signal: { type: 'answer', sdp: pc.localDescription },
                    });
                } else if (signal.type === 'answer') {
                    if (pc.signalingState === 'have-local-offer') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp!));
                    }
                } else if (signal.type === 'candidate') {
                    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate!));
                }
            } catch (err) {
                console.error('[CallWindow] signal error:', err);
            }
        };

        socket.on('call:signal', handleSignal);

        const init = async () => {
            // 1. Acquire local media
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: call.type === 'video',
                    audio: true,
                });
            } catch {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    if (mounted) setVideoOn(false);
                } catch {
                    return;
                }
            }
            if (!mounted) { stream!.getTracks().forEach(t => t.stop()); return; }

            localStreamRef.current = stream!;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream!;

            // 2. Peer connection
            const pc = new RTCPeerConnection(ICE_SERVERS);
            pcRef.current = pc;

            stream!.getTracks().forEach(t => pc.addTrack(t, stream!));

            pc.ontrack = e => {
                const [remoteStream] = e.streams;
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
                if (mounted) setConnected(true);
            };

            pc.onicecandidate = e => {
                if (e.candidate) {
                    socket.emit('call:signal', {
                        callId: call.callId,
                        to: call.remoteUser.userId,
                        signal: { type: 'candidate', candidate: e.candidate },
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'connected' && mounted) setConnected(true);
                if ((pc.connectionState === 'failed' || pc.connectionState === 'disconnected') && mounted) {
                    setConnected(false);
                }
            };

            // 3. Caller creates offer; callee waits for the offer via handleSignal
            if (call.isCaller) {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('call:signal', {
                        callId: call.callId,
                        to: call.remoteUser.userId,
                        signal: { type: 'offer', sdp: pc.localDescription },
                    });
                } catch (err) {
                    console.error('[CallWindow] offer error:', err);
                }
            }
        };

        init();

        return () => {
            mounted = false;
            socket.off('call:signal', handleSignal);
            pcRef.current?.close();
            pcRef.current = null;
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const toggleMic = () => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMicOn(track.enabled);
    };

    const toggleVideo = () => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setVideoOn(track.enabled);
    };

    const { remoteUser } = call;
    const initials = remoteUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // ── minimised pill ────────────────────────────────────────────────────────
    if (minimized) {
        return (
            <div
                onClick={() => setMinimized(false)}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1A231F] border border-emerald-600/40 rounded-2xl px-4 py-3 shadow-2xl cursor-pointer hover:border-emerald-500/60 transition-all animate-in slide-in-from-bottom-2"
            >
                <div className="w-9 h-9 rounded-full bg-emerald-800/60 border border-emerald-600/40 flex items-center justify-center text-xs font-bold text-emerald-200 overflow-hidden shrink-0">
                    {remoteUser.avatar
                        ? <img src={remoteUser.avatar} alt="" className="w-full h-full object-cover" />
                        : initials
                    }
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{remoteUser.name}</p>
                    <p className="text-xs text-emerald-400">{connected ? fmt(duration) : 'Connecting…'}</p>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); endCall(); }}
                    className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center ml-1 shrink-0 transition-colors"
                >
                    <PhoneOff className="w-3.5 h-3.5 text-white" />
                </button>
            </div>
        );
    }

    // ── full window ───────────────────────────────────────────────────────────
    const isVideo = call.type === 'video';

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[340px] bg-[#141B18] border border-[#2A3430] rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Remote area */}
            <div className="relative bg-[#0D1510] h-52 flex items-center justify-center">
                {isVideo && (
                    <video ref={remoteVideoRef} autoPlay playsInline
                        className="absolute inset-0 w-full h-full object-cover" />
                )}

                {/* Avatar / status overlay when audio-only or not yet connected */}
                {(!connected || !isVideo) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                        <div className={`w-16 h-16 rounded-full bg-emerald-800/60 border-2 border-emerald-500/50 flex items-center justify-center text-xl font-bold text-emerald-200 overflow-hidden ${!connected ? 'animate-pulse' : ''}`}>
                            {remoteUser.avatar
                                ? <img src={remoteUser.avatar} alt="" className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <p className="text-sm font-semibold text-white">{remoteUser.name}</p>
                        <p className="text-xs text-emerald-400">
                            {connected ? fmt(duration) : 'Connecting…'}
                        </p>
                    </div>
                )}

                {/* Duration badge (video connected) */}
                {isVideo && connected && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-xs text-white/70 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {fmt(duration)}
                    </div>
                )}

                {/* Local video PiP */}
                {isVideo && (
                    <div className="absolute top-3 left-3 z-20 w-20 h-14 rounded-xl overflow-hidden border border-[#2A3430] bg-[#0D1510]">
                        <video ref={localVideoRef} autoPlay playsInline muted
                            className="w-full h-full object-cover" />
                        {!videoOn && (
                            <div className="absolute inset-0 bg-[#0D1510] flex items-center justify-center">
                                <VideoOff className="w-4 h-4 text-gray-500" />
                            </div>
                        )}
                    </div>
                )}

                {/* Minimise button */}
                <button
                    onClick={() => setMinimized(true)}
                    className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                    <Minimize2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Controls */}
            <div className="p-4">
                <div className="text-center mb-3">
                    <p className="text-sm font-semibold text-white">{remoteUser.name}</p>
                    <p className="text-xs text-gray-400">{remoteUser.email}</p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button onClick={toggleMic}
                        title={micOn ? 'Mute' : 'Unmute'}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${micOn ? 'bg-[#2A3430] hover:bg-[#354540] text-white' : 'bg-red-600/80 hover:bg-red-600 text-white'}`}>
                        {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>

                    {isVideo && (
                        <button onClick={toggleVideo}
                            title={videoOn ? 'Turn off camera' : 'Turn on camera'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${videoOn ? 'bg-[#2A3430] hover:bg-[#354540] text-white' : 'bg-red-600/80 hover:bg-red-600 text-white'}`}>
                            {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>
                    )}

                    <button onClick={endCall}
                        title="End call"
                        className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/40">
                        <PhoneOff className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── exported component — only renders when a call is active ──────────────────
export default function CallWindow() {
    const { activeCall } = useCall();
    if (!activeCall) return null;
    return <CallWindowInner call={activeCall} />;
}
