"use client";

import { useRef } from 'react';
import { X, ImageOff, Palette, Layers, Upload } from 'lucide-react';
import type { BackgroundConfig, BackgroundType } from '@/hooks/useBackgroundBlur';

interface BackgroundSelectorProps {
    config: BackgroundConfig;
    onChange: (config: BackgroundConfig) => void;
    onClose: () => void;
}

const PRESET_COLORS = [
    { label: 'Dark Green', value: '#0d2317' },
    { label: 'Navy', value: '#0a0f2c' },
    { label: 'Deep Purple', value: '#1a0a2e' },
    { label: 'Charcoal', value: '#1a1a1a' },
    { label: 'Forest', value: '#1b3a2a' },
    { label: 'Slate', value: '#1e2540' },
];

const PRESET_BACKGROUNDS = [
    { label: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=640&q=80' },
    { label: 'Library', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=640&q=80' },
    { label: 'Nature', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=640&q=80' },
    { label: 'Abstract', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=640&q=80' },
];

const BackgroundSelector = ({ config, onChange, onClose }: BackgroundSelectorProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const deviceUrlRef = useRef<string | null>(null);

    const select = (type: BackgroundType, extra?: Partial<BackgroundConfig>) =>
        onChange({ type, blurAmount: 10, ...extra });

    const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Revoke previous blob URL to avoid memory leaks
        if (deviceUrlRef.current) URL.revokeObjectURL(deviceUrlRef.current);
        const url = URL.createObjectURL(file);
        deviceUrlRef.current = url;
        onChange({ type: 'image', imageUrl: url });
    };

    return (
        <div className="bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3430]">
                <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Background</span>
                </div>
                <button onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Type selection */}
                <div>
                    <p className="text-xs text-gray-500 mb-2">Effect</p>
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => select('none')}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                                config.type === 'none'
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                    : 'border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                        >
                            <ImageOff className="w-5 h-5" />
                            None
                        </button>
                        <button
                            onClick={() => select('blur', { blurAmount: 10 })}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                                config.type === 'blur'
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                    : 'border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                        >
                            <Layers className="w-5 h-5" />
                            Blur
                        </button>
                        <button
                            onClick={() => select('color', { color: PRESET_COLORS[0].value })}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                                config.type === 'color'
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                    : 'border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                        >
                            <Palette className="w-5 h-5" />
                            Color
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                                config.type === 'image' && config.imageUrl?.startsWith('blob:')
                                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                    : 'border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                        >
                            <Upload className="w-5 h-5" />
                            Device
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleDeviceUpload}
                        />
                    </div>
                </div>

                {/* Blur intensity */}
                {config.type === 'blur' && (
                    <div>
                        <div className="flex justify-between mb-1">
                            <p className="text-xs text-gray-500">Blur intensity</p>
                            <span className="text-xs text-emerald-400">{config.blurAmount ?? 10}px</span>
                        </div>
                        <input
                            type="range" min={2} max={30} step={1}
                            value={config.blurAmount ?? 10}
                            onChange={e => onChange({ ...config, blurAmount: Number(e.target.value) })}
                            className="w-full accent-emerald-500"
                        />
                    </div>
                )}

                {/* Color presets */}
                {config.type === 'color' && (
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Color presets</p>
                        <div className="grid grid-cols-6 gap-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => onChange({ ...config, color: c.value })}
                                    title={c.label}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                        config.color === c.value ? 'border-emerald-400 scale-110' : 'border-transparent hover:border-white/20'
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                />
                            ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <label className="text-xs text-gray-500">Custom:</label>
                            <input
                                type="color"
                                value={config.color ?? '#0d2317'}
                                onChange={e => onChange({ ...config, color: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                        </div>
                    </div>
                )}

                {/* Virtual backgrounds */}
                <div>
                    <p className="text-xs text-gray-500 mb-2">Virtual backgrounds</p>
                    <div className="grid grid-cols-2 gap-2">
                        {PRESET_BACKGROUNDS.map(bg => (
                            <button
                                key={bg.url}
                                onClick={() => select('image', { imageUrl: bg.url })}
                                className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all ${
                                    config.type === 'image' && config.imageUrl === bg.url
                                        ? 'border-emerald-400'
                                        : 'border-transparent hover:border-white/20'
                                }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                                    <span className="text-xs text-white font-medium">{bg.label}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundSelector;
