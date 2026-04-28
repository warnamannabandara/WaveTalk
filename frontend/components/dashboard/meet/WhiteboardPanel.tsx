"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { PenLine, X, Trash2, Download, Eraser, Minus, Plus } from 'lucide-react';
import type { WhiteboardDrawData } from '@/hooks/useMeeting';

export type DrawData = WhiteboardDrawData;

interface WhiteboardPanelProps {
    onClose: () => void;
    onDraw?: (data: DrawData) => void;
    onClear?: () => void;
    remoteDraws?: DrawData[];
    remoteClearCount?: number;
}

const COLORS = ['#ffffff', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#1a1a1a'];

const WhiteboardPanel = ({ onClose, onDraw, onClear, remoteDraws = [], remoteClearCount = 0 }: WhiteboardPanelProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('#ffffff');
    const [lineWidth, setLineWidth] = useState(3);
    const [eraser, setEraser] = useState(false);
    const isDrawingRef = useRef(false);
    const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
    const lastRemoteDrawsLen = useRef(0);
    const prevClearCount = useRef(0);

    const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

    const drawPath = useCallback((ctx: CanvasRenderingContext2D, data: DrawData) => {
        if (data.points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = data.eraser ? '#0f1a14' : data.color;
        ctx.lineWidth = data.eraser ? data.lineWidth * 4 : data.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(data.points[0].x, data.points[0].y);
        for (let i = 1; i < data.points.length; i++) {
            ctx.lineTo(data.points[i].x, data.points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }, []);

    // Apply incoming remote draws
    useEffect(() => {
        if (remoteDraws.length <= lastRemoteDrawsLen.current) return;
        const ctx = getCtx();
        if (!ctx) return;
        for (let i = lastRemoteDrawsLen.current; i < remoteDraws.length; i++) {
            drawPath(ctx, remoteDraws[i]);
        }
        lastRemoteDrawsLen.current = remoteDraws.length;
    }, [remoteDraws, drawPath]);

    // Apply remote clear
    useEffect(() => {
        if (remoteClearCount <= prevClearCount.current) return;
        prevClearCount.current = remoteClearCount;
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lastRemoteDrawsLen.current = 0;
    }, [remoteClearCount]);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        isDrawingRef.current = true;
        currentPointsRef.current = [getPos(e)];
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const pos = getPos(e);
        currentPointsRef.current.push(pos);
        const ctx = getCtx();
        if (!ctx || currentPointsRef.current.length < 2) return;
        const pts = currentPointsRef.current;
        const segment = pts.slice(-2);
        drawPath(ctx, { color, lineWidth, points: segment, eraser });
        // Emit each segment live so remote participants see strokes as they're drawn
        onDraw?.({ color, lineWidth, points: segment, eraser });
    };

    const onMouseUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        currentPointsRef.current = [];
    };

    const clearCanvas = () => {
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lastRemoteDrawsLen.current = 0;
        onClear?.();
    };

    const exportCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
        a.click();
    };

    return (
        <div className="flex flex-col bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden" style={{ height: '520px' }}>
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#2A3430]">
                <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Whiteboard</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={exportCanvas} title="Save as PNG"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={clearCanvas} title="Clear whiteboard"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-3 px-3 py-2 border-b border-[#2A3430] flex-wrap">
                {/* Color swatches */}
                <div className="flex items-center gap-1">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => { setColor(c); setEraser(false); }}
                            className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                color === c && !eraser ? 'border-white scale-125' : 'border-transparent hover:scale-110'
                            }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Custom color */}
                <input
                    type="color"
                    value={color}
                    onChange={e => { setColor(e.target.value); setEraser(false); }}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    title="Custom color"
                />

                <div className="w-px h-5 bg-[#2A3430]" />

                {/* Eraser */}
                <button
                    onClick={() => setEraser(v => !v)}
                    title="Eraser"
                    className={`p-1.5 rounded-lg transition-all border ${
                        eraser
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'border-[#2A3430] text-gray-400 hover:text-white'
                    }`}
                >
                    <Eraser className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-5 bg-[#2A3430]" />

                {/* Brush size */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setLineWidth(v => Math.max(1, v - 1))}
                        className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-gray-400 w-5 text-center">{lineWidth}</span>
                    <button
                        onClick={() => setLineWidth(v => Math.min(20, v + 1))}
                        className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>

                {/* Current tool indicator */}
                <div className="ml-auto flex items-center gap-1.5">
                    <div
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: eraser ? '#transparent' : color }}
                    />
                    <span className="text-[10px] text-gray-500">{eraser ? 'Eraser' : 'Pen'} · {lineWidth}px</span>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 min-h-0 bg-[#0f1a14] overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                />
            </div>
        </div>
    );
};

export default WhiteboardPanel;
