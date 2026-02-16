"use client";

import { FileText, Maximize2 } from 'lucide-react';

const InMeetingHeader = () => {
    return (
        <div className="bg-[#141B18] px-6 py-4 flex items-center justify-between rounded-t-2xl border-x border-t border-[#2A3430]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-red-400">Recording</span>
                </div>
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Team Meeting</h2>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 text-sm">12 participants</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white border border-[#2A3430]">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Summary</span>
                </button>
                <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-gray-400 hover:text-white border border-[#2A3430]">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default InMeetingHeader;
