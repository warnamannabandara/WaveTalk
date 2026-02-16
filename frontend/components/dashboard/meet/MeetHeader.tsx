"use client";

import { Sun } from 'lucide-react';

const MeetHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">Meet</h1>
                <p className="text-gray-400 text-sm mt-1">Start or join video meetings</p>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
                <Sun className="w-5 h-5 text-gray-400" />
            </button>
        </div>
    );
};

export default MeetHeader;
