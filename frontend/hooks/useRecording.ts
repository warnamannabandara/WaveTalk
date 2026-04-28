'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useRecording(
    stream: MediaStream | null,
    onStop?: (blob: Blob, durationSecs: number) => void,
) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const durationRef = useRef(0);
    const onStopRef = useRef(onStop);
    useEffect(() => { onStopRef.current = onStop; }, [onStop]);

    const startRecording = useCallback(() => {
        if (!stream || isRecording) return;
        chunksRef.current = [];
        durationRef.current = 0;

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : 'video/webm';

        try {
            const recorder = new MediaRecorder(stream, { mimeType });
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meeting-recording-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                onStopRef.current?.(blob, durationRef.current);
            };
            recorder.start(1000);
            recorderRef.current = recorder;
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                durationRef.current += 1;
                setDuration(durationRef.current);
            }, 1000);
        } catch (err) {
            console.error('[useRecording] Failed to start:', err);
        }
    }, [stream, isRecording]);

    const stopRecording = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        recorderRef.current = null;
        setIsRecording(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }, []);

    useEffect(() => () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const formatDuration = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return {
        isRecording,
        duration,
        durationFormatted: formatDuration(duration),
        startRecording,
        stopRecording,
    };
}
