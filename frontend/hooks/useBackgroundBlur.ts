'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type BackgroundType = 'none' | 'blur' | 'color' | 'image';

export interface BackgroundConfig {
    type: BackgroundType;
    blurAmount?: number;
    color?: string;
    imageUrl?: string;
}

const DEFAULT_CONFIG: BackgroundConfig = { type: 'none' };
const MEDIAPIPE_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm';
const SELFIE_MODEL =
    'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/1/selfie_segmenter_landscape.tflite';

type SegmentResult = {
    confidenceMasks?: Array<{ getAsFloat32Array: () => Float32Array }>;
    close: () => void;
};
type Segmenter = {
    segmentForVideo: (video: HTMLVideoElement, timestamp: number) => SegmentResult;
};

export function useBackgroundBlur(
    rawStream: MediaStream | null,
    config: BackgroundConfig = DEFAULT_CONFIG
) {
    const [processedStream, setProcessedStream] = useState<MediaStream | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const configRef = useRef(config);
    configRef.current = config;
    const segmenterRef = useRef<Segmenter | null>(null);

    const stopProcessing = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current = null; }
        canvasRef.current = null;
        offscreenRef.current = null;
        setProcessedStream(null);
        setIsProcessing(false);
    }, []);

    // Reload background image when imageUrl changes (even while processing is active)
    useEffect(() => {
        if (config.type !== 'image' || !config.imageUrl) {
            bgImageRef.current = null;
            return;
        }
        const img = new Image();
        if (!config.imageUrl.startsWith('blob:')) img.crossOrigin = 'anonymous';
        img.src = config.imageUrl;
        img.onload = () => { bgImageRef.current = img; };
        img.onerror = () => { bgImageRef.current = null; };
    }, [config.imageUrl, config.type]);

    useEffect(() => {
        if (!rawStream || config.type === 'none') {
            stopProcessing();
            return;
        }

        let cancelled = false;

        const start = async () => {
            setIsProcessing(true);

            const video = document.createElement('video');
            video.srcObject = rawStream;
            video.muted = true;
            video.playsInline = true;
            await video.play();
            if (!video.videoWidth) {
                await new Promise<void>(resolve => {
                    video.addEventListener('loadedmetadata', () => resolve(), { once: true });
                });
            }
            if (cancelled) { video.srcObject = null; return; }
            videoRef.current = video;

            const w = video.videoWidth || 640;
            const h = video.videoHeight || 480;

            // Main output canvas
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvasRef.current = canvas;
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

            // Offscreen canvas for background rendering
            const offscreen = document.createElement('canvas');
            offscreen.width = w; offscreen.height = h;
            offscreenRef.current = offscreen;
            const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

            // Try to load MediaPipe segmenter for proper person/background separation solely if it isn't loaded yet
            if (!segmenterRef.current) {
                try {
                    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');
                    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM);
                    const seg = await ImageSegmenter.createFromOptions(vision, {
                        baseOptions: { modelAssetPath: SELFIE_MODEL },
                        runningMode: 'VIDEO',
                        outputCategoryMask: false,
                        outputConfidenceMasks: true,
                    });
                    if (!cancelled) segmenterRef.current = seg as unknown as Segmenter;
                } catch {
                    console.warn('[BackgroundBlur] MediaPipe segmenter unavailable, using fallback');
                }
            }

            const render = () => {
                if (!videoRef.current || !canvasRef.current || cancelled) return;
                const cfg = configRef.current;
                const v = videoRef.current;

                if (cfg.type === 'none') {
                    ctx.drawImage(v, 0, 0, w, h);
                    rafRef.current = requestAnimationFrame(render);
                    return;
                }

                const seg = segmenterRef.current;

                if (seg) {
                    // ── Proper segmentation: person in front, background replaced ──
                    let maskData: Float32Array | null = null;
                    try {
                        const result = seg.segmentForVideo(v, performance.now());
                        if (result.confidenceMasks?.[0]) {
                            maskData = result.confidenceMasks[0].getAsFloat32Array();
                        }
                        result.close();
                    } catch { /* skip frame on error */ }

                    if (maskData) {
                        // Draw background effect to offscreen canvas
                        if (cfg.type === 'blur') {
                            offCtx.filter = `blur(${cfg.blurAmount ?? 15}px)`;
                            offCtx.drawImage(v, 0, 0, w, h);
                            offCtx.filter = 'none';
                        } else if (cfg.type === 'color') {
                            offCtx.fillStyle = cfg.color ?? '#0d2317';
                            offCtx.fillRect(0, 0, w, h);
                        } else if (cfg.type === 'image') {
                            if (bgImageRef.current) {
                                offCtx.drawImage(bgImageRef.current, 0, 0, w, h);
                            } else {
                                offCtx.fillStyle = '#0d2317';
                                offCtx.fillRect(0, 0, w, h);
                            }
                        }

                        // Draw raw person to main canvas
                        ctx.drawImage(v, 0, 0, w, h);

                        // Per-pixel composite: bg where mask≈0 (background), person where mask≈1
                        const personData = ctx.getImageData(0, 0, w, h);
                        const bgData = offCtx.getImageData(0, 0, w, h);
                        const out = new ImageData(w, h);

                        for (let i = 0; i < maskData.length; i++) {
                            const a = maskData[i]; // 1 = person, 0 = background
                            const ia = 1 - a;
                            const p = i << 2;
                            out.data[p]   = (bgData.data[p]   * ia + personData.data[p]   * a) | 0;
                            out.data[p+1] = (bgData.data[p+1] * ia + personData.data[p+1] * a) | 0;
                            out.data[p+2] = (bgData.data[p+2] * ia + personData.data[p+2] * a) | 0;
                            out.data[p+3] = 255;
                        }
                        ctx.putImageData(out, 0, 0);
                    } else {
                        ctx.drawImage(v, 0, 0, w, h);
                    }
                } else {
                    // ── Fallback (no segmentation model available) ────────────────
                    if (cfg.type === 'blur') {
                        ctx.filter = `blur(${cfg.blurAmount ?? 15}px)`;
                        ctx.drawImage(v, 0, 0, w, h);
                        ctx.filter = 'none';
                        // Restore an approximated center region for the person
                        const m = 0.18;
                        ctx.drawImage(v, w*m, h*m, w*(1-2*m), h*(1-2*m), w*m, h*m, w*(1-2*m), h*(1-2*m));
                    } else if (cfg.type === 'color') {
                        offCtx.fillStyle = cfg.color ?? '#0d2317';
                        offCtx.fillRect(0, 0, w, h);
                        // Draw video on top with high opacity so person is visible
                        ctx.drawImage(v, 0, 0, w, h);
                        ctx.globalAlpha = 0.15;
                        ctx.fillStyle = cfg.color ?? '#0d2317';
                        ctx.fillRect(0, 0, w, h);
                        ctx.globalAlpha = 1;
                    } else if (cfg.type === 'image' && bgImageRef.current) {
                        ctx.drawImage(bgImageRef.current, 0, 0, w, h);
                        ctx.globalAlpha = 0.82;
                        ctx.drawImage(v, 0, 0, w, h);
                        ctx.globalAlpha = 1;
                    } else {
                        ctx.drawImage(v, 0, 0, w, h);
                    }
                }

                rafRef.current = requestAnimationFrame(render);
            };

            rafRef.current = requestAnimationFrame(render);

            // Capture canvas as stream; preserve original audio tracks
            const canvasStream = canvas.captureStream(30);
            rawStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

            if (!cancelled) {
                setProcessedStream(canvasStream);
                setIsProcessing(false);
            }
        };

        start().catch(err => {
            console.warn('[BackgroundBlur] setup error:', err);
            setIsProcessing(false);
        });

        return () => {
            cancelled = true;
            stopProcessing();
        };
    }, [rawStream, config.type, config.blurAmount, config.color, config.imageUrl, stopProcessing]);

    return {
        outputStream: config.type !== 'none' ? (processedStream ?? rawStream) : rawStream,
        isProcessing,
    };
}
