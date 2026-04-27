"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface Meeting {
    _id: string;
    scheduledAt: string;
    startedAt?: string;
    endedAt?: string;
    status: string;
    participants: { _id: string }[];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AttendanceTab = () => {
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

    // Past meetings only
    const pastMeetings = meetings.filter(m => new Date(m.scheduledAt) < now);
    const total = pastMeetings.length || 1;

    // On time: ended meetings that started within 5 min of schedule (or no startedAt recorded)
    const ended = pastMeetings.filter(m => m.status === 'ended');
    const onTime = ended.filter(m => {
        if (!m.startedAt) return true;
        const diff = (new Date(m.startedAt).getTime() - new Date(m.scheduledAt).getTime()) / 60000;
        return diff <= 5;
    });
    const late = ended.filter(m => {
        if (!m.startedAt) return false;
        const diff = (new Date(m.startedAt).getTime() - new Date(m.scheduledAt).getTime()) / 60000;
        return diff > 5;
    });
    // Absent: scheduled meetings in the past that never started
    const absent = pastMeetings.filter(m => m.status === 'scheduled');

    const onTimePct = Math.round((onTime.length / total) * 100);
    const latePct = Math.round((late.length / total) * 100);
    const absentPct = Math.round((absent.length / total) * 100);
    const avgAttendance = Math.round((ended.length / total) * 100);

    const distributionData = [
        { name: 'On Time', value: onTimePct || (pastMeetings.length === 0 ? 68 : 0), color: '#10B981' },
        { name: 'Late', value: latePct || (pastMeetings.length === 0 ? 22 : 0), color: '#34D399' },
        { name: 'Absent', value: absentPct || (pastMeetings.length === 0 ? 10 : 0), color: '#EF4444' },
    ];

    // Attendance trend per month for current year
    const trendData = MONTH_LABELS.map((name, idx) => {
        const monthMeetings = meetings.filter(m => {
            const d = new Date(m.scheduledAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx && d < now;
        });
        if (monthMeetings.length === 0) return { name, attendance: 0 };
        const attendedCount = monthMeetings.filter(m => m.status === 'ended').length;
        return { name, attendance: Math.round((attendedCount / monthMeetings.length) * 100) };
    });

    const summaryCards = [
        {
            label: 'On Time',
            value: `${onTimePct}%`,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            subtitle: 'Punctuality rate across all meetings',
        },
        {
            label: 'Late',
            value: `${latePct}%`,
            icon: Clock,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            subtitle: 'Started more than 5 minutes after schedule',
        },
        {
            label: 'Absent',
            value: `${absentPct}%`,
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            subtitle: 'Did not attend scheduled meetings',
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Attendance Distribution</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                    formatter={(v: number) => `${v}%`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="text-3xl font-bold text-white">{avgAttendance}%</p>
                            <p className="text-xs text-gray-500">Attended</p>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {distributionData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-400">{item.name} {item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Trend */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Attendance Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                    formatter={(v: number) => `${v}%`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{card.value}</p>
                                <p className="text-sm text-gray-400">{card.label}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{card.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceTab;
