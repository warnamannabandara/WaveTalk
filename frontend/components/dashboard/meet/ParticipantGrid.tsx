"use client";

import { MicOff } from 'lucide-react';

const ParticipantGrid = () => {
    const participants = [
        { id: '1', name: 'You', status: 'online', micOn: true, active: true },
        { id: '2', name: 'Sarah Johnson', status: 'online', micOn: true, active: false },
        { id: '3', name: 'Mike Chen', status: 'online', micOn: true, active: false, initial: 'M' },
        { id: '4', name: 'Emily Davis', status: 'online', micOn: false, active: false },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 flex-1 h-[600px] bg-[#141B18] p-6 border-x border-[#2A3430]">
            {participants.map((participant) => (
                <div
                    key={participant.id}
                    className="relative bg-[#2A3430]/30 rounded-2xl border border-emerald-500/10 overflow-hidden group flex items-center justify-center transition-all hover:border-emerald-500/30"
                >
                    {/* Placeholder for Video Feed */}
                    <div className="absolute inset-0 bg-[#2D4A3E]/40" />

                    {/* Initial for non-video/avatar */}
                    {participant.initial && (
                        <div className="w-24 h-24 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center text-3xl font-semibold text-emerald-200 z-10">
                            {participant.initial}
                        </div>
                    )}

                    {/* Participant Name Overlay */}
                    <div className="absolute bottom-4 left-4 bg-[#141B18]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 z-20">
                        <span className="text-xs font-medium text-white">{participant.name}</span>
                    </div>

                    {/* Muted Status */}
                    {!participant.micOn && (
                        <div className="absolute bottom-4 right-4 bg-red-500 px-3 py-1.5 rounded-lg border border-red-400/50 z-20 flex items-center justify-center shadow-lg shadow-red-500/20">
                            <MicOff className="w-3.5 h-3.5 text-white" />
                        </div>
                    )}

                    {/* Active Speaker Border (Optional effect) */}
                    {participant.active && (
                        <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-2xl pointer-events-none" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ParticipantGrid;
