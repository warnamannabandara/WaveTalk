'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SignDetectionState {
    word: string;
    sentence: string;
    confidence: number;
}

// ── MediaPipe types (loaded dynamically) ────────────────────────────────────
interface Landmark { x: number; y: number; z: number }
interface PoseLandmarkerResult { landmarks: Landmark[][] }
interface PoseLandmarkerInstance {
    detectForVideo(video: HTMLVideoElement, timestamp: number): PoseLandmarkerResult;
    close(): void;
}

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// Singleton so the model isn't reloaded on every hook mount
let landmarkerPromise: Promise<PoseLandmarkerInstance> | null = null;

async function getPoseLandmarker(): Promise<PoseLandmarkerInstance> {
    if (!landmarkerPromise) {
        landmarkerPromise = (async () => {
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
            return PoseLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
                runningMode: 'VIDEO',
                numPoses: 1,
            }) as unknown as PoseLandmarkerInstance;
        })().catch(err => {
            landmarkerPromise = null; // allow retry on next call
            throw err;
        });
    }
    return landmarkerPromise;
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useSignLanguage(
    localStream: MediaStream | null,
    meetingId: string,
    enabled: boolean
) {
    const [detection, setDetection] = useState<SignDetectionState>({ word: '', sentence: '', confidence: 0 });
    const [flaskConnected, setFlaskConnected] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [modelReady, setModelReady] = useState(false);

    const flaskSocketRef = useRef<Socket | null>(null);
    const backendSocketRef = useRef<Socket | null>(null);
    const landmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
    const videoElRef = useRef<HTMLVideoElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastFrameRef = useRef<number>(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const stop = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (videoElRef.current) { videoElRef.current.srcObject = null; videoElRef.current = null; }
        flaskSocketRef.current?.disconnect(); flaskSocketRef.current = null;
        backendSocketRef.current?.emit('meeting:leave', { meetingId });
        backendSocketRef.current?.disconnect(); backendSocketRef.current = null;
        if (mountedRef.current) {
            setFlaskConnected(false);
            setDetection({ word: '', sentence: '', confidence: 0 });
        }
    }, [meetingId]);

    useEffect(() => {
        if (!enabled || !localStream) { stop(); return; }

        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        let cancelled = false;

        const start = async () => {
            // 1. Load MediaPipe PoseLandmarker (cached singleton)
            if (!landmarkerRef.current) {
                if (mountedRef.current) setModelLoading(true);
                try {
                    landmarkerRef.current = await getPoseLandmarker();
                } catch (err) {
                    console.error('[SignLanguage] PoseLandmarker load failed:', err);
                    if (mountedRef.current) setModelLoading(false);
                    return;
                }
                if (cancelled) return;
                if (mountedRef.current) { setModelLoading(false); setModelReady(true); }
            }

            // 2. Hidden video element for MediaPipe (separate from the displayed one)
            const video = document.createElement('video');
            video.srcObject = localStream;
            video.muted = true;
            video.playsInline = true;
            try { await video.play(); } catch { return; }
            if (cancelled) { video.srcObject = null; return; }
            videoElRef.current = video;

            // 3. Flask Socket.io — inference server
            const flaskSocket = io(
                process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:8000',
                { transports: ['websocket', 'polling'], reconnection: true }
            );
            flaskSocketRef.current = flaskSocket;

            flaskSocket.on('connect', () => { if (mountedRef.current) setFlaskConnected(true); });
            flaskSocket.on('disconnect', () => { if (mountedRef.current) setFlaskConnected(false); });

            flaskSocket.on('prediction', ({ word, confidence, sentence }: SignDetectionState) => {
                if (!mountedRef.current) return;
                setDetection({ word, confidence, sentence });
                // Relay detection to backend so other participants see it
                backendSocketRef.current?.emit('sign:detected', { meetingId, word, confidence, sentence });
            });

            flaskSocket.on('error', (err: { message: string }) => {
                console.warn('[SignLanguage] Flask error:', err.message);
            });

            // 4. Backend Socket.io — relay sign detections to meeting room
            if (token) {
                const backendSocket = io(
                    process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001',
                    { auth: { token }, transports: ['websocket', 'polling'] }
                );
                backendSocketRef.current = backendSocket;
                backendSocket.on('connect', () => backendSocket.emit('meeting:join', { meetingId }));
            }

            // 5. Pose extraction loop — 20 fps
            const landmarker = landmarkerRef.current;
            const loop = (ts: number) => {
                if (!mountedRef.current || !videoElRef.current || cancelled) return;

                if (ts - lastFrameRef.current >= 50) {
                    lastFrameRef.current = ts;
                    try {
                        const result = landmarker.detectForVideo(videoElRef.current, ts);
                        if (result.landmarks?.[0]?.length === 33) {
                            const flat = result.landmarks[0].flatMap(lm => [lm.x, lm.y, lm.z]);
                            // Model expects exactly 99 features (33 pose keypoints × x,y,z)
                            if (flat.length === 99 && flaskSocketRef.current?.connected) {
                                flaskSocketRef.current.emit('landmarks', flat);
                            }
                        }
                    } catch { /* skip frame */ }
                }
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        };

        start();

        return () => {
            cancelled = true;
            stop();
        };
    }, [enabled, localStream, meetingId, stop]);

    const resetSentence = useCallback(() => {
        flaskSocketRef.current?.emit('reset_sentence');
        setDetection({ word: '', sentence: '', confidence: 0 });
    }, []);

    return { detection, flaskConnected, modelLoading, modelReady, resetSentence };
}
