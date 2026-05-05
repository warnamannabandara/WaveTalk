'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Camera, CameraOff, RotateCcw, Wifi, WifiOff, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:8000';

interface Prediction {
    word: string;
    confidence: number;
    sentence: string;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Pose: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Camera: any;
    }
}

export default function SignLanguagePage() {
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const poseRef = useRef<unknown>(null);
    const cameraRef = useRef<unknown>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isActive, setIsActive] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [prediction, setPrediction] = useState<Prediction>({ word: '...', confidence: 0, sentence: 'Waiting for gestures...' });
    const [history, setHistory] = useState<Prediction[]>([]);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [error, setError] = useState('');
    const [modelReady, setModelReady] = useState(false);
    const [fps, setFps] = useState(0);
    const frameCount = useRef(0);
    const lastFpsTime = useRef(Date.now());

    // Load MediaPipe scripts dynamically
    useEffect(() => {
        const loadScript = (src: string): Promise<void> =>
            new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => resolve();
                s.onerror = reject;
                document.head.appendChild(s);
            });

        Promise.all([
            loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'),
            loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
            loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
        ]).then(() => setScriptsLoaded(true))
          .catch(() => setError('Failed to load MediaPipe. Check internet connection.'));
    }, []);

    // Connect Socket.IO to Flask
    const connectSocket = useCallback(() => {
        if (socketRef.current?.connected) return;
        const socket = io(FLASK_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            setError('');
        });
        socket.on('connected', (data: { model_ready: boolean }) => {
            setModelReady(data.model_ready);
            if (!data.model_ready) setError('Sign language model not loaded on server.');
        });
        socket.on('prediction', (data: Prediction) => {
            setPrediction(data);
            if (data.word !== '...' && !data.word.startsWith('...')) {
                setHistory(prev => [data, ...prev].slice(0, 20));
            }
        });
        socket.on('disconnect', () => setIsConnected(false));
        socket.on('error', (e: { message: string }) => setError(e.message));
    }, []);

    // Start webcam + MediaPipe
    const startCamera = useCallback(async () => {
        if (!scriptsLoaded || !videoRef.current || !canvasRef.current) return;
        setError('');
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Pose = (window as any).Pose;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const CameraUtil = (window as any).Camera;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const drawingUtils = window as any;

            const pose = new Pose({
                locateFile: (file: string) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });
            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            pose.onResults((results: { poseLandmarks: { x: number; y: number; z: number }[] | null; image: CanvasImageSource }) => {
                canvas.width = videoRef.current?.videoWidth || 640;
                canvas.height = videoRef.current?.videoHeight || 480;
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                if (results.poseLandmarks) {
                    // Draw skeleton overlay
                    if (drawingUtils.drawConnectors && drawingUtils.POSE_CONNECTIONS) {
                        drawingUtils.drawConnectors(ctx, results.poseLandmarks, drawingUtils.POSE_CONNECTIONS, { color: '#00ff88', lineWidth: 2 });
                    }
                    if (drawingUtils.drawLandmarks) {
                        drawingUtils.drawLandmarks(ctx, results.poseLandmarks, { color: '#ff0055', lineWidth: 1, radius: 3 });
                    }

                    // Build 99-feature vector: 33 landmarks * (x, y, z)
                    const features: number[] = [];
                    const lms = results.poseLandmarks;
                    if (lms.length === 33) {
                        for (let i = 0; i < 33; i++) {
                            const lm = lms[i];
                            if (lm) {
                                features.push(
                                    lm.x,
                                    lm.y,
                                    lm.z
                                );
                            } else {
                                features.push(0, 0, 0);
                            }
                        }
                    }

                    if (socketRef.current?.connected && features.length === 99) {
                        socketRef.current.emit('landmarks', features);
                    }
                }
                ctx.restore();

                // FPS counter
                frameCount.current++;
                const now = Date.now();
                if (now - lastFpsTime.current >= 1000) {
                    setFps(frameCount.current);
                    frameCount.current = 0;
                    lastFpsTime.current = now;
                }
            });

            poseRef.current = pose;

            const camera = new CameraUtil(videoRef.current, {
                onFrame: async () => {
                    await (poseRef.current as { send: (opts: { image: HTMLVideoElement }) => Promise<void> }).send({ image: videoRef.current! });
                },
                width: 640,
                height: 480
            });
            cameraRef.current = camera;
            await camera.start();

            setIsActive(true);
            connectSocket();
        } catch (err) {
            setError('Could not access webcam: ' + (err as Error).message);
        }
    }, [scriptsLoaded, connectSocket]);

    const stopCamera = useCallback(() => {
        if (cameraRef.current) {
            (cameraRef.current as { stop: () => void }).stop();
            cameraRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        socketRef.current?.disconnect();
        socketRef.current = null;
        setIsActive(false);
        setIsConnected(false);
        setFps(0);
    }, []);

    const resetSentence = () => {
        socketRef.current?.emit('reset_sentence');
        setPrediction(prev => ({ ...prev, sentence: 'Waiting for gestures...' }));
        setHistory([]);
    };

    const saveSentence = async () => {
        if (!prediction.sentence || prediction.sentence === 'Waiting for gestures...') return;
        try {
            await api.post('/users/sign-language/history', {
                word: prediction.word,
                sentence: prediction.sentence
            });
        } catch { /* silent */ }
    };

    // Save when sentence updates meaningfully
    useEffect(() => {
        if (prediction.sentence && prediction.sentence !== 'Waiting for gestures...') {
            saveSentence();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prediction.sentence]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const confidencePct = Math.round((prediction.confidence || 0) * 100);
    const confidenceColor = confidencePct >= 70 ? 'text-emerald-400' : confidencePct >= 40 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="flex flex-col h-full bg-[#15231D] text-white overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3430]">
                <div>
                    <h1 className="text-xl font-semibold text-white">Sign Language Detection</h1>
                    <p className="text-sm text-gray-400">Real-time recognition using MediaPipe + AI model</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isConnected ? 'bg-emerald-900/40 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isConnected ? 'Server Connected' : 'Disconnected'}
                    </span>
                    {isActive && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1A231F] px-2.5 py-1 rounded-full">
                            {fps} FPS
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 gap-4 p-6 min-h-0">
                {/* Left: Video */}
                <div className="flex flex-col gap-4 flex-1">
                    {/* Camera view */}
                    <div className="relative bg-black rounded-xl overflow-hidden aspect-video max-h-96 flex items-center justify-center border border-[#2A3430]">
                        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-0" playsInline muted />
                        <canvas ref={canvasRef} className="w-full h-full object-contain" />
                        {!isActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D1A14]">
                                <CameraOff className="w-12 h-12 text-gray-600 mb-3" />
                                <p className="text-gray-400 text-sm">Camera is off</p>
                                <p className="text-gray-600 text-xs mt-1">Click &quot;Start Camera&quot; to begin</p>
                            </div>
                        )}
                        {/* Live badge */}
                        {isActive && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                LIVE
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3">
                        {!isActive ? (
                            <button
                                onClick={startCamera}
                                disabled={!scriptsLoaded}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                {scriptsLoaded ? 'Start Camera' : 'Loading MediaPipe...'}
                            </button>
                        ) : (
                            <button
                                onClick={stopCamera}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-600/80 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <CameraOff className="w-4 h-4" />
                                Stop Camera
                            </button>
                        )}
                        <button
                            onClick={resetSentence}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A231F] hover:bg-[#243028] border border-[#2A3430] text-gray-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Sentence
                        </button>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {!modelReady && isConnected && (
                        <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded-lg px-4 py-3">
                            Model not loaded on server. Ensure <code className="text-yellow-300">sign_language_model_final.keras</code> is in the <code className="text-yellow-300">sl_sign_language/</code> folder.
                        </div>
                    )}
                </div>

                {/* Right: Detection results */}
                <div className="flex flex-col gap-4 w-80">
                    {/* Current word */}
                    <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Sign</p>
                        <p className="text-4xl font-bold text-white truncate">{prediction.word}</p>
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Confidence</p>
                            <p className={`text-sm font-semibold ${confidenceColor}`}>{confidencePct}%</p>
                        </div>
                        <div className="mt-1.5 w-full bg-[#0D1A14] rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${confidencePct >= 70 ? 'bg-emerald-500' : confidencePct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${confidencePct}%` }}
                            />
                        </div>
                    </div>

                    {/* Sentence */}
                    <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-5 flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Sentence</p>
                            <Volume2 className="w-4 h-4 text-gray-500" />
                        </div>
                        <p className="text-base text-white leading-relaxed min-h-[60px]">{prediction.sentence}</p>
                    </div>

                    {/* History */}
                    <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                            Recent Detections
                        </p>
                        {history.length === 0 ? (
                            <p className="text-xs text-gray-600">No detections yet</p>
                        ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {history.slice(0, 10).map((h, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-300 font-medium truncate max-w-[140px]">{h.word}</span>
                                        <span className="text-gray-500">{Math.round(h.confidence * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User info */}
                    {user && (
                        <div className="text-xs text-gray-600 text-center">
                            Signed in as <span className="text-gray-400">{user.name}</span>
                            <br />History auto-saved to your profile
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}