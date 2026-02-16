import React from 'react';
import { Clock, Users, Link as LinkIcon, MoreHorizontal } from 'lucide-react';

const meetings = [
    {
        id: 1,
        title: 'Daily Standup',
        time: '9:00 AM',
        duration: '30 min',
        attendees: 8,
        link: 'https://meet.google.com/abc-defg-hij'
    },
    {
        id: 2,
        title: 'Client Presentation',
        time: '2:00 PM',
        duration: '1 hour',
        attendees: 5,
        link: 'https://meet.google.com/xyz-uvwx-yz'
    }
];

const MeetingList: React.FC = () => {
    return (
        <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Meetings</h3>
            <div className="space-y-3">
                {meetings.map((meeting) => (
                    <div key={meeting.id} className="bg-[#1A231F] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-medium text-emerald-100">{meeting.title}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{meeting.time}</span>
                                        <span>•</span>
                                        <span>{meeting.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>{meeting.attendees}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-white transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                        <button className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg transition-colors border border-emerald-500/20 border-dashed">
                            <LinkIcon className="w-3 h-3" />
                            Copy Meeting Link
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MeetingList;
