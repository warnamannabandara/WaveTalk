'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface TTSVoice {
    voice: SpeechSynthesisVoice;
    label: string;
}

export function useTextToSpeech() {
    const [voices, setVoices] = useState<TTSVoice[]>([]);
    const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setIsSupported('speechSynthesis' in window);

        const loadVoices = () => {
            const raw = window.speechSynthesis.getVoices();
            setVoices(raw.map(v => ({ voice: v, label: `${v.name} (${v.lang})` })));
        };

        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }, []);

    const speak = useCallback((text: string, lang?: string) => {
        if (!isSupported || !text.trim()) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = voices[selectedVoiceIndex]?.voice;

        if (lang) {
            // Find a voice matching requested language
            const match = voices.find(v => v.voice.lang.startsWith(lang));
            utterance.voice = match?.voice ?? selectedVoice ?? null;
            utterance.lang = lang;
        } else if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported, voices, selectedVoiceIndex, rate, pitch, volume]);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        isSupported,
        voices,
        selectedVoiceIndex,
        setSelectedVoiceIndex,
        rate,
        setRate,
        pitch,
        setPitch,
        volume,
        setVolume,
    };
}
