'use client';

import {
    createContext, useContext, useState, useCallback,
    useEffect, useRef, ReactNode
} from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/contexts/AuthContext';

export interface CallUser {
    userId: string;
    name: string;
    avatar: string;
    email: string;
}

export interface IncomingCall {
    callId: string;
    type: 'audio' | 'video';
    caller: CallUser;
}

export interface OutgoingCall extends CallUser {
    callId: string;
    type: 'audio' | 'video';
}

export interface ActiveCall {
    callId: string;
    type: 'audio' | 'video';
    remoteUser: CallUser;
    isCaller: boolean;
}

interface CallContextType {
    incomingCall: IncomingCall | null;
    activeCall: ActiveCall | null;
    outgoingCall: OutgoingCall | null;
    initiateCall: (toUser: CallUser, type: 'audio' | 'video') => void;
    acceptCall: () => void;
    declineCall: () => void;
    endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

let ringtone: HTMLAudioElement | null = null;

function stopRingtone() {
    if (ringtone) { ringtone.pause(); ringtone.currentTime = 0; }
}

function playRingtone(src: string) {
    stopRingtone();
    try {
        ringtone = new Audio(src);
        ringtone.loop = true;
        ringtone.play().catch(() => { /* browser may block autoplay */ });
    } catch { /* ignore */ }
}

export function CallProvider({ children }: { children: ReactNode }) {
    const socket = useSocket();
    const { user } = useAuth();

    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [outgoingCall, setOutgoingCall] = useState<OutgoingCall | null>(null);

    // Refs so socket handlers always see fresh state without re-registering
    const outgoingCallRef = useRef<OutgoingCall | null>(null);
    const activeCallRef = useRef<ActiveCall | null>(null);
    outgoingCallRef.current = outgoingCall;
    activeCallRef.current = activeCall;

    useEffect(() => {
        if (!socket) return;

        const onInvite = (data: {
            callId: string; type: 'audio' | 'video';
            callerId: string; callerName: string; callerAvatar: string; callerEmail: string;
        }) => {
            // Decline automatically if already in a call
            if (activeCallRef.current) {
                socket.emit('call:decline', { callId: data.callId, toUserId: data.callerId });
                return;
            }
            setIncomingCall({
                callId: data.callId,
                type: data.type,
                caller: {
                    userId: data.callerId,
                    name: data.callerName,
                    avatar: data.callerAvatar,
                    email: data.callerEmail,
                },
            });
            playRingtone('/sounds/ringtone.mp3');
        };

        const onAccept = (data: {
            callId: string;
            accepterId: string; accepterName: string;
            accepterAvatar: string; accepterEmail: string;
        }) => {
            const oc = outgoingCallRef.current;
            if (!oc || oc.callId !== data.callId) return;
            stopRingtone();
            setActiveCall({
                callId: data.callId,
                type: oc.type,
                remoteUser: {
                    userId: data.accepterId,
                    name: data.accepterName,
                    avatar: data.accepterAvatar,
                    email: data.accepterEmail,
                },
                isCaller: true,
            });
            setOutgoingCall(null);
        };

        const onDecline = ({ callId }: { callId: string }) => {
            if (outgoingCallRef.current?.callId === callId) {
                stopRingtone();
                setOutgoingCall(null);
            }
        };

        const onEnd = ({ callId }: { callId: string }) => {
            if (activeCallRef.current?.callId === callId) {
                stopRingtone();
                setActiveCall(null);
            }
        };

        socket.on('call:invite', onInvite);
        socket.on('call:accept', onAccept);
        socket.on('call:decline', onDecline);
        socket.on('call:end', onEnd);

        return () => {
            socket.off('call:invite', onInvite);
            socket.off('call:accept', onAccept);
            socket.off('call:decline', onDecline);
            socket.off('call:end', onEnd);
        };
    }, [socket]);

    // Auto-cancel outgoing call after 30 s
    useEffect(() => {
        if (!outgoingCall || !socket) return;
        const timer = setTimeout(() => {
            socket.emit('call:decline', { callId: outgoingCall.callId, toUserId: outgoingCall.userId });
            stopRingtone();
            setOutgoingCall(null);
        }, 30_000);
        return () => clearTimeout(timer);
    }, [outgoingCall?.callId, socket]);

    const initiateCall = useCallback((toUser: CallUser, type: 'audio' | 'video') => {
        if (!socket || !user) return;
        const callId = `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        socket.emit('call:invite', { callId, type, toUserId: toUser.userId });
        setOutgoingCall({ ...toUser, callId, type });
        playRingtone('/sounds/dialing.mp3');
    }, [socket, user]);

    const acceptCall = useCallback(() => {
        if (!socket || !incomingCall) return;
        stopRingtone();
        socket.emit('call:accept', { callId: incomingCall.callId, toUserId: incomingCall.caller.userId });
        setActiveCall({
            callId: incomingCall.callId,
            type: incomingCall.type,
            remoteUser: incomingCall.caller,
            isCaller: false,
        });
        setIncomingCall(null);
    }, [socket, incomingCall]);

    const declineCall = useCallback(() => {
        if (!socket || !incomingCall) return;
        stopRingtone();
        socket.emit('call:decline', { callId: incomingCall.callId, toUserId: incomingCall.caller.userId });
        setIncomingCall(null);
    }, [socket, incomingCall]);

    const endCall = useCallback(() => {
        if (!socket) return;
        stopRingtone();
        const ac = activeCallRef.current;
        const oc = outgoingCallRef.current;
        if (ac) {
            socket.emit('call:end', { callId: ac.callId, toUserId: ac.remoteUser.userId });
            setActiveCall(null);
        }
        if (oc) {
            socket.emit('call:decline', { callId: oc.callId, toUserId: oc.userId });
            setOutgoingCall(null);
        }
    }, [socket]);

    return (
        <CallContext.Provider value={{
            incomingCall, activeCall, outgoingCall,
            initiateCall, acceptCall, declineCall, endCall,
        }}>
            {children}
        </CallContext.Provider>
    );
}

export function useCall() {
    const ctx = useContext(CallContext);
    if (!ctx) throw new Error('useCall must be inside CallProvider');
    return ctx;
}
