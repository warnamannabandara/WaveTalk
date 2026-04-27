"use client";

import { useRef, useState, useEffect } from 'react';
import { Users, Hand, Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import type { MeetingInfo, RemoteParticipant } from '@/hooks/useMeeting';

interface InMeetingHeaderProps {
    meetingInfo: MeetingInfo | null;
    participantCount: number;
    signLangEnabled: boolean;
    flaskConnected: boolean;
    modelLoading: boolean;
    localName: string;
    micOn: boolean;
    videoOn: boolean;
    remoteParticipants: RemoteParticipant[];
    localJoinedAt: number;
}

function formatDuration(ms: number) {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

const InMeetingHeader = ({
    meetingInfo,
    participantCount,
    signLangEnabled,
    flaskConnected,
    modelLoading,
    localName,
    micOn,
    videoOn,
    remoteParticipants,
    localJoinedAt,
}: InMeetingHeaderProps) => {
    const [panelOpen, setPanelOpen] = useState(false);
    const [now, setNow] = useState(Date.now());
    const containerRef = useRef<HTMLDivElement>(null);

    // Tick every second to update per-participant durations
    useEffect(() => {
        if (!panelOpen) return;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [panelOpen]);

    useEffect(() => {
        if (!panelOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [panelOpen]);

    return (
        <div className="bg-[#141B18] px-6 py-4 flex items-center justify-between rounded-t-2xl border-x border-t border-[#2A3430]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">Live</span>
                </div>

                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">
                        {meetingInfo?.title ?? 'Meeting'}
                    </h2>
                    {meetingInfo?.meetingId && (
                        <>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500 text-xs font-mono">{meetingInfo.meetingId}</span>
                        </>
                    )}
                </div>

                {signLangEnabled && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${
                        modelLoading
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            : flaskConnected
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}>
                        <Hand className="w-3 h-3" />
                        <span>{modelLoading ? 'Loading model…' : flaskConnected ? 'SL Translation ON' : 'Connecting…'}</span>
                    </div>
                )}
            </div>

            {/* Participant count — click to open panel */}
            <div ref={containerRef} className="relative">
                <button
                    onClick={() => setPanelOpen(v => !v)}
                    className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border transition-all ${
                        panelOpen
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                    }`}
                    title="Show participants"
                >
                    <Users className="w-4 h-4" />
                    <span>{participantCount}</span>
                </button>

                {panelOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#1A2420] border border-[#2A3430] rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-3 border-b border-[#2A3430] flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Participants</span>
                            <span className="text-xs text-gray-500 bg-[#2A3430] px-2 py-0.5 rounded-full">{participantCount}</span>
                        </div>

                        <ul className="max-h-72 overflow-y-auto divide-y divide-[#2A3430]/60">
                            {/* Local participant */}
                            <li className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-200 text-sm font-semibold shrink-0">
                                    {localName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{localName} <span className="text-gray-500 text-xs">(You)</span></p>
                                    <p className="text-xs text-gray-500 font-mono">{formatDuration(now - localJoinedAt)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {micOn
                                        ? <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                        : <MicOff className="w-3.5 h-3.5 text-red-400" />
                                    }
                                    {videoOn
                                        ? <Video className="w-3.5 h-3.5 text-emerald-400" />
                                        : <VideoOff className="w-3.5 h-3.5 text-gray-500" />
                                    }
                                </div>
                            </li>

                            {/* Remote participants */}
                            {remoteParticipants.map(p => (
                                <li key={p.userId} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-emerald-200 text-sm font-semibold shrink-0">
                                        {p.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{p.userName}</p>
                                        <p className="text-xs text-gray-500 font-mono">{formatDuration(now - p.joinedAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {p.isScreenSharing && (
                                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                                        )}
                                        {p.micOn
                                            ? <Mic className="w-3.5 h-3.5 text-emerald-400" />
                                            : <MicOff className="w-3.5 h-3.5 text-red-400" />
                                        }
                                        {p.videoOn
                                            ? <Video className="w-3.5 h-3.5 text-emerald-400" />
                                            : <VideoOff className="w-3.5 h-3.5 text-gray-500" />
                                        }
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InMeetingHeader;
