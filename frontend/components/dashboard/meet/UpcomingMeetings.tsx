"use client";

import { Calendar, Clock, Video } from 'lucide-react';

interface UpcomingMeetingsProps {
    onJoin: () => void;
}

const UpcomingMeetings = ({ onJoin }: UpcomingMeetingsProps) => {
    // Mock data - in a real app this would come from an API
    const meetings = [
        {
            id: '1',
            title: 'Team Standup',
            date: 'Today',
            time: '10:00 AM',
            active: true
        },
        {
            id: '2',
            title: 'Client Presentation',
            date: 'Today',
            time: '2:00 PM',
            active: false
        },
        {
            id: '3',
            title: 'Design Review',
            date: 'Tomorrow',
            time: '11:00 AM',
            active: false
        }
    ];

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-medium text-emerald-100/60 mb-4 px-1 uppercase tracking-wider">
                Upcoming Meetings
            </h2>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {meetings.map((meeting) => (
                    <div
                        key={meeting.id}
                        className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-5 flex flex-col gap-4 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                    >
                         {meeting.active && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        )}

                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                    {meeting.title}
                                </h3>
                                <div className="flex items-center gap-3 text-emerald-100/40 text-xs">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {meeting.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {meeting.time}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={onJoin}
                                className={`p-2.5 rounded-xl transition-all ${meeting.active
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-90'
                                    : 'bg-[#2A3430] hover:bg-[#34403A] text-gray-400 active:scale-90'
                                    }`}>
                                <Video className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {meetings.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center text-center bg-[#1A231F]/50 rounded-3xl border border-dashed border-[#2A3430]">
                        <Calendar className="w-8 h-8 text-emerald-100/10 mb-2" />
                        <h3 className="text-emerald-100/40 text-sm font-medium">No meetings scheduled</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingMeetings;

