"use client";

import { Mic, Video, Monitor, Users, MessageSquare, Settings, PhoneOff, Image, Volume2, Edit3 } from 'lucide-react';

interface MeetingControlsProps {
    onEnd: () => void;
}

const MeetingControls = ({ onEnd }: MeetingControlsProps) => {
    return (
        <div className="bg-[#141B18] px-6 py-6 rounded-b-2xl border-x border-b border-[#2A3430] flex flex-col items-center gap-6">
            {/* Main Controls */}
            <div className="flex items-center gap-6">
                <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-[#141B18] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                    <Mic className="w-6 h-6" />
                </button>
                <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-[#141B18] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                    <Video className="w-6 h-6" />
                </button>
                <button className="w-10 h-10 bg-transparent hover:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
                    <Monitor className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-transparent hover:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
                    <Users className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-transparent hover:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-transparent hover:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5">
                    <Settings className="w-5 h-5" />
                </button>
                <button
                    onClick={onEnd}
                    className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 group">
                    <div className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 group-hover:text-emerald-400">
                        <Image className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Background</span>
                </button>
                <button className="flex items-center gap-2 group">
                    <div className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 group-hover:text-emerald-400">
                        <Volume2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Noise Cancellation</span>
                </button>
                <button className="flex items-center gap-2 group">
                    <div className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 group-hover:text-emerald-400">
                        <Edit3 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Whiteboard</span>
                </button>
            </div>
        </div>
    );
};

export default MeetingControls;
