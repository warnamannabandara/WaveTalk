"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    FileText, X, Trash2, Download, Sparkles, ChevronUp, ChevronDown,
    AlertTriangle, WifiOff, Globe, Loader2,
} from 'lucide-react';
import type { TranscriptEntry, STTError } from '@/hooks/useSpeechToText';
import { SUPPORTED_LANGUAGES } from './MeetingSettingsPanel';

interface TranscriptPanelProps {
    transcript: TranscriptEntry[];
    interimText: string;
    isListening: boolean;
    sttError?: STTError;
    isSupported?: boolean;
    /** BCP-47 code of the current recognition language (e.g. "si-LK") */
    language?: string;
    /** Called when the user changes the recognition language from within the panel */
    onLanguageChange?: (lang: string) => void;
    onClose: () => void;
    onClear: () => void;
}

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function generateSummary(entries: TranscriptEntry[]): string {
    if (entries.length === 0) return '';
    const bySpeaker: Record<string, string[]> = {};
    for (const e of entries) {
        if (!bySpeaker[e.speaker]) bySpeaker[e.speaker] = [];
        bySpeaker[e.speaker].push(e.text);
    }
    const speakers = Object.keys(bySpeaker);
    const totalWords = entries.reduce((n, e) => n + e.text.split(' ').length, 0);
    const lines: string[] = [];
    for (const speaker of speakers) {
        const texts = bySpeaker[speaker];
        const allText = texts.join(' ');
        const wordCount = allText.split(' ').length;
        let snippet: string;
        if (wordCount <= 40) {
            snippet = allText;
        } else {
            const first = texts[0].split('. ')[0];
            const last = texts[texts.length - 1];
            snippet = first === last ? first : `${first}… ${last}`;
        }
        lines.push(`${speaker}: ${snippet}`);
    }
    const wordLabel = `${totalWords} word${totalWords !== 1 ? 's' : ''}`;
    const segLabel = `${entries.length} segment${entries.length !== 1 ? 's' : ''}`;
    const speakerLabel = `${speakers.length} speaker${speakers.length !== 1 ? 's' : ''}`;
    return JSON.stringify({ lines, stats: `${wordLabel} · ${segLabel} · ${speakerLabel}` });
}

// Translate text using the unofficial Google Translate API (no key required)
async function googleTranslate(text: string, targetLang: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translate request failed');
    const data = await res.json();
    // data[0] is an array of [translatedChunk, originalChunk, ...]
    return (data[0] as [string][]).map(item => item[0]).join('');
}

// Maps Google Translate 2-letter codes → BCP-47 codes used by Web Speech API
const DETECT_TO_BCP47: Record<string, string> = {
    en: 'en-US', si: 'si-LK', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
    kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN',
    pa: 'pa-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR',
    it: 'it-IT', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP', ar: 'ar-SA',
    ru: 'ru-RU', tr: 'tr-TR',
};

async function detectLanguage(text: string): Promise<string | null> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        // data[2] contains the detected ISO 639-1 language code
        return typeof data[2] === 'string' ? data[2] : null;
    } catch {
        return null;
    }
}

const TRANSLATE_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'si', label: 'Sinhala' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh-CN', label: 'Chinese' },
    { code: 'ar', label: 'Arabic' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'pt', label: 'Portuguese' },
    { code: 'ru', label: 'Russian' },
    { code: 'tr', label: 'Turkish' },
    { code: 'it', label: 'Italian' },
];

const STT_ERROR_MSG: Record<NonNullable<STTError>, { title: string; body: string }> = {
    'not-supported': {
        title: 'Not supported',
        body: 'Speech-to-text requires Chrome or Edge. Firefox/Safari are not supported.',
    },
    'not-allowed': {
        title: 'Microphone blocked',
        body: 'Browser blocked microphone access. Click the 🔒 icon in the address bar and allow the microphone, then reload.',
    },
    'network': {
        title: 'Network error',
        body: "Speech recognition needs an internet connection to reach Google's API. Check your connection.",
    },
    'unknown': {
        title: 'Recognition error',
        body: 'An unexpected error occurred. Try toggling the transcript off and on again.',
    },
};

const TranscriptPanel = ({
    transcript, interimText, isListening, sttError, isSupported = true,
    language, onLanguageChange, onClose, onClear,
}: TranscriptPanelProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [detectedLang, setDetectedLang] = useState<string | null>(null);
    const [translateLang, setTranslateLang] = useState('en');
    const [translateOpen, setTranslateOpen] = useState(false);
    const [translated, setTranslated] = useState<Map<string, string>>(new Map());
    const [translating, setTranslating] = useState(false);
    const [translateError, setTranslateError] = useState('');

    useEffect(() => {
        if (!showSummary) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, interimText, showSummary]);

    // Derive a sensible default target lang from the meeting language
    useEffect(() => {
        if (language) {
            // Meeting lang is BCP-47 like "si-LK"; Google Translate wants "si"
            const base = language.split('-')[0];
            // Default target = English unless meeting is already English
            setTranslateLang(base === 'en' ? 'en' : 'en');
        }
    }, [language]);

    // Keep a ref so async callbacks always read the latest lang without stale closures
    const translateLangRef = useRef(translateLang);
    translateLangRef.current = translateLang;

    // When auto-detect is on, detect language from each new segment and switch recognition
    useEffect(() => {
        if (language !== 'auto' || !onLanguageChange) return;
        const last = transcript[transcript.length - 1];
        if (!last || last.text.length < 8) return;
        detectLanguage(last.text).then(code => {
            if (!code) return;
            const bcp47 = DETECT_TO_BCP47[code];
            if (bcp47) {
                setDetectedLang(code);
                onLanguageChange(bcp47);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript.length]);

    const handleTranslate = useCallback(async (lang?: string) => {
        if (transcript.length === 0) return;
        const targetLang = lang ?? translateLangRef.current;
        setTranslating(true);
        setTranslateError('');
        try {
            const newMap = new Map<string, string>();
            for (const entry of transcript) {
                // Re-use cached translation only when it exists for this same run
                if (newMap.has(entry.id)) continue;
                const result = await googleTranslate(entry.text, targetLang);
                newMap.set(entry.id, result);
            }
            setTranslated(newMap);
        } catch {
            setTranslateError('Translation failed. Check your internet connection.');
        } finally {
            setTranslating(false);
        }
    }, [transcript]);

    // Auto-translate when the panel opens or language changes — no button needed
    useEffect(() => {
        if (!translateOpen || transcript.length === 0) return;
        setTranslated(new Map());
        handleTranslate(translateLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [translateLang, translateOpen]);

    // Auto-translate each new segment as it arrives while translation is active
    useEffect(() => {
        if (!translateOpen || translated.size === 0 || translating) return;
        const last = transcript[transcript.length - 1];
        if (!last || translated.has(last.id)) return;
        googleTranslate(last.text, translateLangRef.current)
            .then(result => setTranslated(prev => new Map(prev).set(last.id, result)))
            .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript.length]);

    const clearTranslation = () => {
        setTranslated(new Map());
        setTranslateOpen(false);
    };

    const downloadTranscript = () => {
        const lines = transcript.map(e => {
            const t = translated.get(e.id);
            const line = `[${formatTime(e.timestamp)}] ${e.speaker}: ${e.text}`;
            return t ? `${line}\n  [Translated]: ${t}` : line;
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Summary parsing
    let summaryLines: string[] = [];
    let summaryStats = '';
    if (showSummary && transcript.length > 0) {
        try {
            const parsed = JSON.parse(generateSummary(transcript));
            summaryLines = parsed.lines;
            summaryStats = parsed.stats;
        } catch {
            summaryLines = [transcript.map(e => e.text).join(' ')];
        }
    }

    return (
        <div className="flex flex-col bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden h-full" style={{ minHeight: 0 }}>
            {/* Header */}
            <div className="shrink-0 px-4 py-3 border-b border-[#2A3430] space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Live Transcript</span>
                        {isListening ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                Listening
                            </span>
                        ) : !sttError && isSupported && (
                            <span className="flex items-center gap-1 text-xs text-yellow-500">
                                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                                Starting…
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                    <button onClick={downloadTranscript} disabled={transcript.length === 0}
                        title="Download transcript"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClear} disabled={transcript.length === 0}
                        title="Clear transcript"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                </div>
                {/* Auto-detected language badge */}
                {detectedLang && (
                    <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-emerald-500/60" />
                        <span className="text-[10px] text-gray-500">Detected:</span>
                        <span className="text-[10px] text-emerald-400">
                            {SUPPORTED_LANGUAGES.find(l => l.code === DETECT_TO_BCP47[detectedLang])?.label ?? detectedLang}
                        </span>
                    </div>
                )}
            </div>

            {/* Summary toggle */}
            <div className="shrink-0 px-4 py-2 border-b border-[#2A3430]">
                <button
                    onClick={() => setShowSummary(v => !v)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        showSummary
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-[#1E2820] border-[#2A3430] text-gray-400 hover:text-white hover:border-white/10'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto Summary</span>
                        {transcript.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                                {transcript.length} segments
                            </span>
                        )}
                    </div>
                    {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
            </div>

            {/* Google Translate bar */}
            <div className="shrink-0 px-4 py-2 border-b border-[#2A3430]">
                <button
                    onClick={() => setTranslateOpen(v => !v)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                        translateOpen || translated.size > 0
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                            : 'bg-[#1E2820] border-[#2A3430] text-gray-400 hover:text-white hover:border-white/10'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Translate</span>
                        {translated.size > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px]">
                                Active
                            </span>
                        )}
                    </div>
                    {translateOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {translateOpen && (
                    <div className="mt-2 flex items-center gap-2">
                        <select
                            value={translateLang}
                            onChange={e => setTranslateLang(e.target.value)}
                            className="flex-1 bg-[#1E2820] border border-[#2A3430] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                        >
                            {TRANSLATE_LANGUAGES.map(l => (
                                <option key={l.code} value={l.code}>{l.label}</option>
                            ))}
                        </select>
                        {translating && (
                            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                        )}
                        {translated.size > 0 && !translating && (
                            <button onClick={clearTranslation}
                                className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-xs transition-colors shrink-0">
                                Clear
                            </button>
                        )}
                    </div>
                )}

                {translateError && (
                    <p className="mt-1.5 text-[10px] text-red-400">{translateError}</p>
                )}
            </div>

            {/* Error banner */}
            {(sttError || !isSupported) && (
                <div className="shrink-0 border-b border-red-500/20 bg-red-500/8 px-4 py-3">
                    <div className="flex items-start gap-2">
                        {sttError === 'network' || !isSupported
                            ? <WifiOff className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            : <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />}
                        <div>
                            <p className="text-xs font-semibold text-red-400">
                                {!isSupported
                                    ? STT_ERROR_MSG['not-supported'].title
                                    : sttError ? STT_ERROR_MSG[sttError]?.title ?? 'Error' : 'Error'}
                            </p>
                            <p className="text-xs text-red-300/80 mt-0.5 leading-relaxed">
                                {!isSupported
                                    ? STT_ERROR_MSG['not-supported'].body
                                    : sttError ? STT_ERROR_MSG[sttError]?.body : ''}
                            </p>
                            {!isSupported && language?.startsWith('si') && (
                                <p className="text-xs text-yellow-400/80 mt-1 leading-relaxed">
                                    Note: Sinhala speech recognition requires Chrome with Google Cloud Speech support enabled.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary content */}
            {showSummary && (
                <div className="shrink-0 border-b border-[#2A3430] bg-[#0f1a14] px-4 py-3 max-h-52 overflow-y-auto">
                    {transcript.length === 0 ? (
                        <div className="flex flex-col items-center py-4 text-center">
                            <Sparkles className="w-6 h-6 text-gray-700 mb-2" />
                            <p className="text-xs text-gray-500">Start speaking to generate a summary</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {summaryLines.map((line, i) => {
                                const colonIdx = line.indexOf(': ');
                                const speaker = colonIdx > -1 ? line.slice(0, colonIdx) : '';
                                const text = colonIdx > -1 ? line.slice(colonIdx + 2) : line;
                                return (
                                    <div key={i}>
                                        {speaker && (
                                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide block mb-0.5">
                                                {speaker}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
                                    </div>
                                );
                            })}
                            {summaryStats && (
                                <p className="text-[10px] text-gray-600 pt-1 border-t border-white/5">{summaryStats}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Transcript list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {transcript.length === 0 && !interimText && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <FileText className="w-8 h-8 text-gray-700 mb-2" />
                        <p className="text-sm text-gray-600">Transcript will appear here</p>
                        <p className="text-xs text-gray-700 mt-1">when speech is detected</p>
                    </div>
                )}

                {transcript.map(entry => (
                    <div key={entry.id}>
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-emerald-400">{entry.speaker}</span>
                            <span className="text-[10px] text-gray-600">{formatTime(entry.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed">{entry.text}</p>
                        {translated.get(entry.id) && (
                            <p className="text-xs text-blue-300/80 mt-1 leading-relaxed italic border-l-2 border-blue-500/30 pl-2">
                                {translated.get(entry.id)}
                            </p>
                        )}
                    </div>
                ))}

                {interimText && (
                    <div className="opacity-60">
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-emerald-400">You</span>
                            <span className="text-[10px] text-gray-600">now</span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed italic">{interimText}</p>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default TranscriptPanel;
