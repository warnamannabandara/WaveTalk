"use client";

import { Settings, X, Volume2, Globe, MicOff, Clock } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
    { code: 'auto', label: 'Auto-detect' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'si-LK', label: 'Sinhala (සිංහල)' },
    { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
    { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
    { code: 'te-IN', label: 'Telugu (తెలుగు)' },
    { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml-IN', label: 'Malayalam (മലയാളം)' },
    { code: 'mr-IN', label: 'Marathi (मराठी)' },
    { code: 'bn-IN', label: 'Bengali (বাংলা)' },
    { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)' },
    { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
    { code: 'pt-BR', label: 'Portuguese (Brazil)' },
    { code: 'it-IT', label: 'Italian' },
    { code: 'ko-KR', label: 'Korean (한국어)' },
    { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: 'Chinese (Traditional)' },
    { code: 'ja-JP', label: 'Japanese (日本語)' },
    { code: 'ar-SA', label: 'Arabic (العربية)' },
    { code: 'ru-RU', label: 'Russian' },
    { code: 'tr-TR', label: 'Turkish' },
];

export const BREAK_INTERVALS = [
    { minutes: 15, label: 'Every 15 min' },
    { minutes: 25, label: 'Every 25 min (Pomodoro)' },
    { minutes: 30, label: 'Every 30 min' },
    { minutes: 45, label: 'Every 45 min' },
    { minutes: 60, label: 'Every 1 hour' },
];

interface MeetingSettingsPanelProps {
    noiseCancellation: boolean;
    onToggleNoiseCancellation: () => void;
    language: string;
    onLanguageChange: (lang: string) => void;
    breakIntervalMinutes: number;
    onBreakIntervalChange: (minutes: number) => void;
    breakReminderEnabled: boolean;
    onToggleBreakReminder: () => void;
    activeSpeakerFocus: boolean;
    onToggleActiveSpeakerFocus: () => void;
    onClose: () => void;
}

const MeetingSettingsPanel = ({
    noiseCancellation,
    onToggleNoiseCancellation,
    language,
    onLanguageChange,
    breakIntervalMinutes,
    onBreakIntervalChange,
    breakReminderEnabled,
    onToggleBreakReminder,
    activeSpeakerFocus,
    onToggleActiveSpeakerFocus,
    onClose,
}: MeetingSettingsPanelProps) => {
    return (
        <div className="bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3430]">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Meeting Settings</span>
                </div>
                <button onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="p-4 space-y-5">
                {/* Noise Cancellation */}
                <div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MicOff className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-white font-medium">Noise Cancellation</p>
                                <p className="text-xs text-gray-500">Reduce background noise and echo</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggleNoiseCancellation}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                                noiseCancellation ? 'bg-emerald-500' : 'bg-[#2A3430]'
                            }`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                noiseCancellation ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                    {noiseCancellation && (
                        <p className="text-xs text-emerald-500/70 mt-1.5 ml-6">
                            Echo cancellation and noise suppression active
                        </p>
                    )}
                </div>

                {/* Language */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-white font-medium">Meeting Language</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Used for speech-to-text transcription</p>
                    <select
                        value={language}
                        onChange={e => onLanguageChange(e.target.value)}
                        className="w-full bg-[#1E2820] border border-[#2A3430] rounded-xl px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                </div>

                {/* Break Reminders */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                                <p className="text-sm text-white font-medium">Break Reminders</p>
                                <p className="text-xs text-gray-500">Remind you to rest during long meetings</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggleBreakReminder}
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                                breakReminderEnabled ? 'bg-emerald-500' : 'bg-[#2A3430]'
                            }`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                breakReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                    {breakReminderEnabled && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                            {BREAK_INTERVALS.map(({ minutes, label }) => (
                                <button
                                    key={minutes}
                                    onClick={() => onBreakIntervalChange(minutes)}
                                    className={`px-3 py-2 rounded-lg text-xs text-left transition-all ${
                                        breakIntervalMinutes === minutes
                                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                            : 'bg-[#1E2820] border border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Speaker Focus */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-sm text-white font-medium">Active Speaker Focus</p>
                            <p className="text-xs text-gray-500">Highlight who is speaking</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleActiveSpeakerFocus}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                            activeSpeakerFocus ? 'bg-emerald-500' : 'bg-[#2A3430]'
                        }`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            activeSpeakerFocus ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingSettingsPanel;
