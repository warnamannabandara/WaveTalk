"use client";

import { useState, useRef } from 'react';
import { Volume2, VolumeX, Send, X, ChevronDown } from 'lucide-react';

// Re-export the return type shape so the panel can be typed
export interface TextToSpeechPanelProps {
    tts: {
        speak: (text: string, lang?: string) => void;
        stop: () => void;
        isSpeaking: boolean;
        isSupported: boolean;
        voices: { voice: SpeechSynthesisVoice; label: string }[];
        selectedVoiceIndex: number;
        setSelectedVoiceIndex: (i: number) => void;
        rate: number;
        setRate: (r: number) => void;
        pitch: number;
        setPitch: (p: number) => void;
    };
    onClose: () => void;
}

const QUICK_PHRASES = [
    "Yes",
    "No",
    "Please repeat that",
    "I understand",
    "Can you slow down?",
    "Thank you",
    "One moment please",
    "I agree",
];

const TextToSpeechPanel = ({ tts, onClose }: TextToSpeechPanelProps) => {
    const [text, setText] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSpeak = () => {
        if (!text.trim()) return;
        tts.speak(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSpeak();
        }
    };

    if (!tts.isSupported) {
        return (
            <div className="bg-[#141B18] border border-[#2A3430] rounded-2xl p-4">
                <p className="text-sm text-gray-400">Text-to-speech is not supported in this browser.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3430]">
                <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Text to Speech</span>
                    <span className="text-xs text-gray-500">for non-verbal users</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowSettings(v => !v)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs px-2 font-medium"
                    >
                        Settings
                    </button>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Settings pane */}
            {showSettings && (
                <div className="border-b border-[#2A3430] px-4 py-3 space-y-3 bg-black/10">
                    {/* Voice selector */}
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Voice</label>
                        <div className="relative">
                            <select
                                value={tts.selectedVoiceIndex}
                                onChange={e => tts.setSelectedVoiceIndex(Number(e.target.value))}
                                className="w-full bg-[#1E2820] border border-[#2A3430] rounded-lg px-3 py-2 text-sm text-white appearance-none pr-8 focus:outline-none focus:border-emerald-500/50"
                            >
                                {tts.voices.map((v, i) => (
                                    <option key={i} value={i}>{v.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Rate */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Speed</label>
                            <span className="text-xs text-emerald-400">{tts.rate.toFixed(1)}x</span>
                        </div>
                        <input type="range" min={0.5} max={2} step={0.1}
                            value={tts.rate}
                            onChange={e => tts.setRate(Number(e.target.value))}
                            className="w-full accent-emerald-500" />
                    </div>

                    {/* Pitch */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-400">Pitch</label>
                            <span className="text-xs text-emerald-400">{tts.pitch.toFixed(1)}</span>
                        </div>
                        <input type="range" min={0.5} max={2} step={0.1}
                            value={tts.pitch}
                            onChange={e => tts.setPitch(Number(e.target.value))}
                            className="w-full accent-emerald-500" />
                    </div>
                </div>
            )}

            {/* Quick phrases */}
            <div className="px-4 pt-3 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick phrases</p>
                <div className="flex flex-wrap gap-1.5">
                    {QUICK_PHRASES.map(phrase => (
                        <button
                            key={phrase}
                            onClick={() => tts.speak(phrase)}
                            className="px-2.5 py-1 text-xs bg-[#1E2820] border border-[#2A3430] rounded-full text-gray-300 hover:border-emerald-500/40 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors"
                        >
                            {phrase}
                        </button>
                    ))}
                </div>
            </div>

            {/* Text input + speak */}
            <div className="px-4 pb-4 pt-2">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type what you want to say… (Enter to speak)"
                        rows={3}
                        className="w-full bg-[#1E2820] border border-[#2A3430] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                    <div className="absolute bottom-3 right-3 flex gap-1">
                        {tts.isSpeaking && (
                            <button onClick={tts.stop}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                <VolumeX className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={handleSpeak}
                            disabled={!text.trim() || tts.isSpeaking}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                {tts.isSpeaking && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-0.5">
                            {[0, 1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="w-1 bg-emerald-400 rounded-full animate-pulse"
                                    style={{ height: `${8 + (i % 3) * 4}px`, animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-emerald-400">Speaking…</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToSpeechPanel;
