'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Browser type shims ────────────────────────────────────────────────────────
interface ISpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((ev: Event) => void) | null;
    onend: ((ev: Event) => void) | null;
    onerror: ((ev: { error: string }) => void) | null;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
}
interface SpeechRecognitionAlternative { transcript: string }
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResult[] & { length: number };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
    if (typeof window === 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Public types ──────────────────────────────────────────────────────────────
export interface TranscriptEntry {
    id: string;
    speaker: string;
    text: string;
    timestamp: number;
    isFinal: boolean;
}

export interface UseSpeechToTextOptions {
    language?: string;
    speakerName?: string;
    enabled?: boolean;
    onTranscript?: (entry: TranscriptEntry) => void;
}

export type STTError = 'not-supported' | 'not-allowed' | 'network' | 'unknown' | null;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSpeechToText({
    language = 'en-US',
    speakerName = 'You',
    enabled = false,
    onTranscript,
}: UseSpeechToTextOptions = {}) {
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [interimText, setInterimText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sttError, setSttError] = useState<STTError>(null);
    const [isSupported] = useState(() => !!getSpeechRecognitionCtor());

    // Stable refs for values used inside recognition callbacks
    const speakerRef = useRef(speakerName);
    const onTranscriptRef = useRef(onTranscript);
    speakerRef.current = speakerName;
    onTranscriptRef.current = onTranscript;

    // The currently-active recognition instance (for cleanup only)
    const recRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        const Ctor = getSpeechRecognitionCtor();
        if (!enabled) return;

        if (!Ctor) {
            setSttError('not-supported');
            return;
        }

        setSttError(null);

        // LOCAL flag — unique to this effect invocation.
        // Using a local variable (not a shared ref) means old onend callbacks
        // always see the correct "cancelled" state for their own lifecycle,
        // even if a new effect has already started.
        let cancelled = false;

        function createAndStart() {
            if (cancelled) return;

            const rec = new Ctor!();
            rec.lang = language === 'auto' ? '' : language;
            rec.continuous = true;
            rec.interimResults = true;
            rec.maxAlternatives = 1;
            recRef.current = rec;

            rec.onstart = () => {
                if (!cancelled) {
                    setIsListening(true);
                    setSttError(null);
                }
            };

            rec.onend = () => {
                if (!cancelled) setIsListening(false);
                setInterimText('');
                // Restart only if this effect is still active
                if (!cancelled) {
                    setTimeout(createAndStart, 300);
                }
            };

            rec.onerror = (e: { error: string }) => {
                if (cancelled) return;
                if (e.error === 'no-speech') return; // normal — let onend restart
                if (e.error === 'aborted') return;   // deliberate abort on cleanup

                if (e.error === 'not-allowed') {
                    setSttError('not-allowed');
                    cancelled = true; // stop restart loop on permission denial
                    return;
                }
                if (e.error === 'network') {
                    setSttError('network');
                    cancelled = true; // stop the restart loop; user must re-enable to retry
                    return;
                }
                setSttError('unknown');
                console.warn('[STT] error:', e.error);
            };

            rec.onresult = (e: SpeechRecognitionEvent) => {
                if (cancelled) return;
                let interim = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const result = e.results[i];
                    if (result.isFinal) {
                        const text = result[0].transcript.trim();
                        if (!text) continue;
                        const entry: TranscriptEntry = {
                            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                            speaker: speakerRef.current,
                            text,
                            timestamp: Date.now(),
                            isFinal: true,
                        };
                        setTranscript(prev => [...prev, entry]);
                        onTranscriptRef.current?.(entry);
                    } else {
                        interim += result[0].transcript;
                    }
                }
                setInterimText(interim);
            };

            try {
                rec.start();
            } catch (err) {
                console.warn('[STT] start() failed:', err);
                // Retry after short delay
                if (!cancelled) setTimeout(createAndStart, 500);
            }
        }

        createAndStart();

        // Cleanup: set cancelled so ALL callbacks from this effect instance stop.
        return () => {
            cancelled = true;
            const rec = recRef.current;
            recRef.current = null;
            setIsListening(false);
            setInterimText('');
            try { rec?.abort(); } catch { /* ignore */ }
        };
    // Intentionally only depends on enabled + language.
    // speakerName and onTranscript are read via refs inside callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, language]);

    const clearTranscript = useCallback(() => setTranscript([]), []);

    return { transcript, interimText, isListening, isSupported, sttError, clearTranscript };
}
