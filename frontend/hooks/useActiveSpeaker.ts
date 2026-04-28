'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const POLL_INTERVAL_MS = 150;
const SILENCE_THRESHOLD = 0.01;

export function useActiveSpeaker(
    localStream: MediaStream | null,
    remoteParticipants: Array<{ userId: string; stream: MediaStream | null }>
) {
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    // Map userId → AnalyserNode
    const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getOrCreateCtx = useCallback(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new AudioContext();
        }
        return audioCtxRef.current;
    }, []);

    const attachStream = useCallback((id: string, stream: MediaStream) => {
        if (analysersRef.current.has(id)) return;
        try {
            const ctx = getOrCreateCtx();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            analysersRef.current.set(id, analyser);
        } catch {
            // AudioContext not available (e.g., SSR)
        }
    }, [getOrCreateCtx]);

    // Attach/detach analysers when participants change
    useEffect(() => {
        if (localStream) attachStream('local', localStream);

        for (const p of remoteParticipants) {
            if (p.stream) attachStream(p.userId, p.stream);
        }

        // Remove stale entries
        const currentIds = new Set(['local', ...remoteParticipants.map(p => p.userId)]);
        for (const id of analysersRef.current.keys()) {
            if (!currentIds.has(id)) analysersRef.current.delete(id);
        }
    }, [localStream, remoteParticipants, attachStream]);

    // Poll volumes
    useEffect(() => {
        timerRef.current = setInterval(() => {
            let loudestId: string | null = null;
            let loudestVolume = SILENCE_THRESHOLD;

            const buf = new Float32Array(512);
            for (const [id, analyser] of analysersRef.current.entries()) {
                analyser.getFloatTimeDomainData(buf);
                let sum = 0;
                for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
                const rms = Math.sqrt(sum / buf.length);
                if (rms > loudestVolume) {
                    loudestVolume = rms;
                    loudestId = id;
                }
            }

            setActiveSpeakerId(loudestId);
        }, POLL_INTERVAL_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            audioCtxRef.current?.close().catch(() => {});
        };
    }, []);

    return { activeSpeakerId };
}
