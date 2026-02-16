"use client";

import { Calendar, Clock, Users, Video } from 'lucide-react';

interface UpcomingMeetingsProps {
    onJoin: () => void;
}

const UpcomingMeetings = ({ onJoin }: UpcomingMeetingsProps) => {
    const meetings = [
        {
            id: '1',
            title: 'Team Standup',
            date: 'Today',
            time: '10:00 AM',
            participants: 8,
            active: true
        },
        {
            id: '2',
            title: 'Client Presentation',
            date: 'Today',
            time: '2:00 PM',
            participants: 5,
            active: false
        },
        {
            id: '3',
            title: 'Design Review',
            date: 'Tomorrow',
            time: '11:00 AM',
            participants: 6,
            active: false
        }
    ];

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <h2 className="text-xl font-medium text-white mb-6">Upcoming Meetings</h2>

            <div className="space-y-4">
                {meetings.map((meeting) => (
                    <div
                        key={meeting.id}
                        className="bg-[#141B18] border border-[#2A3430] rounded-2xl p-6 flex items-center justify-between hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="space-y-3">
                            <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                                {meeting.title}
                            </h3>
                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {meeting.date}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {meeting.time}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {meeting.participants} participants
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onJoin}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${meeting.active
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                                : 'bg-[#2A3430] hover:bg-[#34403A] text-gray-300'
                                }`}>
                            <Video className="w-4 h-4" />
                            Join
                        </button>
                    </div>
                ))}

                {meetings.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-[#141B18] rounded-full flex items-center justify-center mb-4 border border-[#2A3430]">
                            <Calendar className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-white font-medium">No upcoming meetings</h3>
                        <p className="text-gray-500 text-sm mt-1">Schedule a meeting to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingMeetings;
