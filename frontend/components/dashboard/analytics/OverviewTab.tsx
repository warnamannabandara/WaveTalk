"use client";

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '@/lib/api';

interface Meeting {
    _id: string;
    title: string;
    meetingId: string;
    scheduledAt: string;
    status: string;
    participants: { _id: string; name: string }[];
    host: { _id: string; name: string };
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const OverviewTab = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/meetings')
            .then(({ data }) => setMeetings(data.meetings ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const now = new Date();
    const currentYear = now.getFullYear();

    // Monthly activity: meetings per month for current year
    const activityData = MONTH_LABELS.map((name, idx) => {
        const count = meetings.filter(m => {
            const d = new Date(m.scheduledAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
        }).length;
        return { name, meetings: count };
    });

    // Weekly performance: meetings per day for current week
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const performanceData = DAY_LABELS.map((name, idx) => {
        const dayStart = new Date(weekStart);
        dayStart.setDate(weekStart.getDate() + idx);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);
        const count = meetings.filter(m => {
            const d = new Date(m.scheduledAt);
            return d >= dayStart && d < dayEnd;
        }).length;
        return { name, meetings: count };
    });

    // Upcoming meetings: scheduled and in the future
    const upcomingMeetings = meetings
        .filter(m => m.status === 'scheduled' && new Date(m.scheduledAt) > now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Activity */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly Activity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Area type="monotone" dataKey="meetings" stroke="#10B981" fillOpacity={1} fill="url(#colorMeetings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Performance */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Weekly Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                />
                                <Bar dataKey="meetings" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Upcoming Meetings</h3>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : upcomingMeetings.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No upcoming meetings scheduled</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingMeetings.map((meeting) => (
                            <div key={meeting._id} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl hover:border-[#3A4440] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Calendar className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{meeting.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{formatDate(meeting.scheduledAt)} • {formatTime(meeting.scheduledAt)}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-[#1A231F] border border-[#2A3430] rounded-full text-[10px] font-medium text-gray-400">
                                    {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverviewTab;
