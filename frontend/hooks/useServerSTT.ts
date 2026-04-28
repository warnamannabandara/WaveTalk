'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { TranscriptEntry, STTError } from './useSpeechToText';

export interface UseServerSTTOptions {
    localStream: MediaStream | null;
    language?: string;
    speakerName?: string;
    enabled?: boolean;
    chunkIntervalMs?: number; // how often to send audio to server (default 4000ms)
}

/**
 * Server-side speech-to-text via Flask.
 * Captures audio from localStream with MediaRecorder, sends base64 audio
 * chunks to Flask every `chunkIntervalMs`, receives transcription results.
 *
 * Works regardless of HTTP/HTTPS since the browser never calls Google directly —
 * the Flask server makes the API call from the server side.
 */
export function useServerSTT({
    localStream,
    language = 'en-US',
    speakerName = 'You',
    enabled = false,
    chunkIntervalMs = 4000,
}: UseServerSTTOptions) {
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [interimText, setInterimText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sttError, setSttError] = useState<STTError>(null);
    const [isSupported, setIsSupported] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Keep latest values accessible in callbacks without causing effect re-runs
    const langRef = useRef(language);
    const speakerRef = useRef(speakerName);
    langRef.current = language;
    speakerRef.current = speakerName;

    // Check MediaRecorder support once on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.MediaRecorder) {
            setIsSupported(false);
        }
    }, []);

    useEffect(() => {
        if (!enabled || !localStream) return;
        if (!window.MediaRecorder) {
            setSttError('not-supported');
            return;
        }

        setSttError(null);
        let cancelled = false;

        // ── 1. Connect to Flask Socket.io ────────────────────────────────────
        const flaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:8000';
        const socket = io(flaskUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
        });
        socketRef.current = socket;

        socket.on('stt:result', ({ text }: { text: string }) => {
            if (cancelled || !text?.trim()) return;
            const entry: TranscriptEntry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                speaker: speakerRef.current,
                text: text.trim(),
                timestamp: Date.now(),
                isFinal: true,
            };
            setTranscript(prev => [...prev, entry]);
            setInterimText('');
        });

        socket.on('stt:error', ({ message }: { message: string }) => {
            if (cancelled) return;
            console.warn('[ServerSTT] server error:', message);
            setSttError('network');
        });

        // ── 2. Build audio-only stream from localStream ───────────────────────
        const audioTracks = localStream.getAudioTracks();
        if (!audioTracks.length) {
            setSttError('not-allowed');
            socket.disconnect();
            return;
        }
        const audioStream = new MediaStream(audioTracks);

        // Pick a supported MIME type
        const mimeType = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4',
        ].find(m => MediaRecorder.isTypeSupported(m)) || '';

        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : {});
        } catch {
            setSttError('not-supported');
            socket.disconnect();
            return;
        }
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstart = () => { if (!cancelled) setIsListening(true); };
        recorder.onstop = () => { if (!cancelled) setIsListening(false); };

        // Send accumulated chunks to Flask on each interval tick
        const sendChunk = () => {
            if (cancelled || !chunksRef.current.length) return;
            const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
            chunksRef.current = [];

            const reader = new FileReader();
            reader.onloadend = () => {
                if (cancelled || !socketRef.current?.connected) return;
                const b64 = (reader.result as string).split(',')[1];
                if (b64) {
                    socketRef.current.emit('stt:audio', {
                        audio: b64,
                        lang: langRef.current,
                        mime: mimeType || 'audio/webm',
                    });
                    // Show interim "listening…" while awaiting result
                    setInterimText('…');
                }
            };
            reader.readAsDataURL(blob);
        };

        // Start recorder in timeslice mode — ondataavailable fires every 1s
        recorder.start(1000);

        // Every `chunkIntervalMs`, flush the accumulated audio to the server
        intervalRef.current = setInterval(sendChunk, chunkIntervalMs);

        return () => {
            cancelled = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            try { recorder.stop(); } catch { /* ignore */ }
            socket.disconnect();
            socketRef.current = null;
            recorderRef.current = null;
            setIsListening(false);
            setInterimText('');
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, localStream, chunkIntervalMs]);

    const clearTranscript = useCallback(() => setTranscript([]), []);

    return { transcript, interimText, isListening, isSupported, sttError, clearTranscript };
}
