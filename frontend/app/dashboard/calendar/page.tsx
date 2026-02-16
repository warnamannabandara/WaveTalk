"use client";

import React, { useState } from 'react';
import CalendarHeader from '../../../components/dashboard/calendar/CalendarHeader';
import CalendarGrid from '../../../components/dashboard/calendar/CalendarGrid';
import MeetingList from '../../../components/dashboard/calendar/MeetingList';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="flex flex-col h-full bg-[#15231D]">
            {/* Header / Top Bar */}
            <div className="p-6 pb-2">
                <h1 className="text-2xl font-bold text-white mb-1">Calendar</h1>
                <p className="text-gray-400 text-sm">Manage your schedule and tasks</p>

                <div className="mt-6 flex items-center bg-[#1A231F] p-1 rounded-lg w-fit border border-white/5">
                    <button className="px-6 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-md text-sm font-medium transition-colors">
                        Calendar
                    </button>
                    <button className="px-6 py-1.5 text-gray-400 hover:text-white rounded-md text-sm font-medium transition-colors">
                        Tasks
                    </button>
                    <button className="px-6 py-1.5 text-gray-400 hover:text-white rounded-md text-sm font-medium transition-colors">
                        Projects
                    </button>
                </div>
            </div>

            {/* Main Content split */}
            <div className="flex-1 overflow-hidden p-6 pt-4 flex flex-col lg:flex-row gap-6">

                {/* Calendar Grid Area */}
                <div className="flex-1 bg-[#1A231F] rounded-2xl p-6 border border-white/5 overflow-y-auto">
                    <CalendarHeader
                        currentDate={currentDate}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                        onToday={handleToday}
                    />
                    <CalendarGrid currentDate={currentDate} />
                </div>

                {/* Right Side: Meeting List / Agenda */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="bg-[#1A231F] rounded-2xl p-5 border border-white/5 h-full overflow-y-auto">
                        <h2 className="text-lg font-semibold text-white mb-4">Today's Meetings</h2>

                        <div className="space-y-4">
                            {/* Re-using the Meeting Item design logic or importing the list */}
                            {/* Since MeetingList component has the header built-in, we might want to adjust it or just use it directly. 
                                Let's inspect MeetingList.tsx again. It has "Today's Meetings" header. 
                                I'll wrap it differently or adjust the page layout. 
                                The MeetingList component I created has a top border and header. 
                                Actually, for the sidebar layout, I probably want a cleaner list.
                                Let's just use the MeetingList component I made, but maybe I should have made it more atomic.
                                For now, I will use it as is, and maybe hide its internal header if I want to control it here, 
                                but the component has it.
                            */}
                            <div className="bg-[#232D28] rounded-xl p-4 border border-emerald-500/10 mb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-emerald-100">Daily Standup</h3>
                                    <span className="text-xs text-gray-400">9:00 AM</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    <span>• 30 min</span>
                                    <span>• 8 People</span>
                                </div>
                                <button className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded transition-colors flex items-center justify-center gap-2">
                                    Link
                                </button>
                            </div>

                            <div className="bg-[#232D28] rounded-xl p-4 border border-emerald-500/10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-emerald-100">Client Presentation</h3>
                                    <span className="text-xs text-gray-400">2:00 PM</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    <span>• 1 hour</span>
                                    <span>• 5 People</span>
                                </div>
                                <button className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded transition-colors flex items-center justify-center gap-2">
                                    Link
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
