"use client";

import { Sun } from 'lucide-react';

const CalendarHeader = () => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold text-white">Calendar</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your schedule and tasks</p>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
                <Sun className="w-5 h-5 text-gray-400" />
            </button>
        </div>
    );
};

export default CalendarHeader;
