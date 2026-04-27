'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Video, Copy } from 'lucide-react';
import api from '@/lib/api';

interface Meeting {
    _id: string;
    title: string;
    meetingId: string;
    status: string;
    scheduledAt: string;
    participants: { _id: string; name: string }[];
    host: { _id: string; name: string };
}

interface Props {
    onJoin: (meetingId: string) => void;
}

const UpcomingMeetings = ({ onJoin }: Props) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        api.get('/meetings?status=scheduled')
            .then(({ data }) => setMeetings(data.meetings))
            .catch(() => { /* silent */ })
            .finally(() => setLoading(false));
    }, []);

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const isToday = d.toDateString() === today.toDateString();
        const isTomorrow = d.toDateString() === tomorrow.toDateString();
        const dateStr = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString();
        const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { dateStr, timeStr };
    };

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <h2 className="text-xl font-medium text-white mb-6">Upcoming Meetings</h2>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-[#141B18] rounded-2xl animate-pulse" />)}
                </div>
            ) : meetings.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#141B18] rounded-full flex items-center justify-center mb-4 border border-[#2A3430]">
                        <Calendar className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-white font-medium">No upcoming meetings</h3>
                    <p className="text-gray-500 text-sm mt-1">Schedule a meeting to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {meetings.map(meeting => {
                        const { dateStr, timeStr } = formatDateTime(meeting.scheduledAt);
                        const isActive = meeting.status === 'active';
                        return (
                            <div key={meeting._id}
                                className="bg-[#141B18] border border-[#2A3430] rounded-2xl p-6 flex items-center justify-between hover:border-emerald-500/30 transition-all group">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">
                                        {meeting.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{dateStr}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{timeStr}</span>
                                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{meeting.participants.length}</span>
                                    </div>
                                    <button onClick={() => copyId(meeting.meetingId)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                                        <Copy className="w-3 h-3" />
                                        {copied === meeting.meetingId ? 'Copied!' : `ID: ${meeting.meetingId}`}
                                    </button>
                                </div>
                                <button onClick={() => onJoin(meeting.meetingId)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${isActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10' : 'bg-[#2A3430] hover:bg-[#34403A] text-gray-300'}`}>
                                    <Video className="w-4 h-4" />
                                    Join
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UpcomingMeetings;
