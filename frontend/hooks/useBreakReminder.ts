'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseBreakReminderOptions {
    intervalMinutes?: number;
    enabled?: boolean;
}

export function useBreakReminder({
    intervalMinutes = 30,
    enabled = true,
}: UseBreakReminderOptions = {}) {
    const [breakDue, setBreakDue] = useState(false);
    const [nextBreakAt, setNextBreakAt] = useState<Date | null>(null);
    const [secondsUntilBreak, setSecondsUntilBreak] = useState(0);
    const [breakCount, setBreakCount] = useState(0);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const schedule = useCallback((minutes: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);

        const ms = minutes * 60 * 1000;
        const target = new Date(Date.now() + ms);
        setNextBreakAt(target);
        setSecondsUntilBreak(Math.floor(ms / 1000));

        // Countdown display
        countdownRef.current = setInterval(() => {
            setSecondsUntilBreak(s => Math.max(0, s - 1));
        }, 1000);

        timerRef.current = setTimeout(() => {
            setBreakDue(true);
            setBreakCount(c => c + 1);
            if (countdownRef.current) clearInterval(countdownRef.current);

            // Vibrate if supported
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }, ms);
    }, []);

    useEffect(() => {
        if (!enabled) {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setBreakDue(false);
            setNextBreakAt(null);
            return;
        }
        schedule(intervalMinutes);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [enabled, intervalMinutes, schedule]);

    const dismissBreak = useCallback(() => {
        setBreakDue(false);
        schedule(intervalMinutes);
    }, [intervalMinutes, schedule]);

    const snoozeBreak = useCallback((minutes = 5) => {
        setBreakDue(false);
        schedule(minutes);
    }, [schedule]);

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return {
        breakDue,
        nextBreakAt,
        secondsUntilBreak,
        countdown: formatCountdown(secondsUntilBreak),
        breakCount,
        dismissBreak,
        snoozeBreak,
    };
}
