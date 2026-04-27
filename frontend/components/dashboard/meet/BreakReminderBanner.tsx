"use client";

import { Coffee, X, Clock, Bell } from 'lucide-react';

interface BreakReminderBannerProps {
    breakDue: boolean;
    countdown: string;
    breakCount: number;
    onDismiss: () => void;
    onSnooze: (minutes?: number) => void;
}

const BreakReminderBanner = ({
    breakDue,
    countdown,
    breakCount,
    onDismiss,
    onSnooze,
}: BreakReminderBannerProps) => {
    if (!breakDue) {
        // Show subtle countdown in corner
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E2820] border border-[#2A3430] text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Break in {countdown}</span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#141B18] border border-emerald-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-emerald-500/5 animate-in zoom-in-95 duration-300">
                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-4">
                    <Coffee className="w-8 h-8 text-emerald-400" />
                </div>

                <h3 className="text-lg font-bold text-white text-center mb-1">Time for a break!</h3>
                <p className="text-sm text-gray-400 text-center mb-1">
                    You've been in this meeting for a while.
                </p>
                {breakCount > 1 && (
                    <p className="text-xs text-emerald-500/70 text-center mb-4">
                        Break #{breakCount} today
                    </p>
                )}

                <div className="bg-[#1E2820] rounded-xl p-3 mb-4 text-center border border-[#2A3430]">
                    <p className="text-xs text-gray-500 mb-1">Suggested</p>
                    <p className="text-sm text-gray-200">
                        Stand up, stretch, and rest your eyes for 5 minutes.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onSnooze(5)}
                        className="flex-1 py-2.5 rounded-xl border border-[#2A3430] text-sm text-gray-300 hover:border-white/20 hover:text-white transition-colors"
                    >
                        Snooze 5m
                    </button>
                    <button
                        onClick={onDismiss}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-[#141B18] text-sm font-semibold hover:bg-emerald-400 transition-colors"
                    >
                        Got it!
                    </button>
                </div>

                <button
                    onClick={onDismiss}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default BreakReminderBanner;
