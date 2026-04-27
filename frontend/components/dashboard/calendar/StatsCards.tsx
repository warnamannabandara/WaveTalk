"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Task } from '@/app/dashboard/calendar/page';

interface Props {
    tasks: Task[];
}

const StatsCards = ({ tasks }: Props) => {
    const [meetingsThisWeek, setMeetingsThisWeek] = useState<number>(0);

    useEffect(() => {
        api.get('/meetings').then(({ data }) => {
            const meetings = data.meetings ?? [];
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            const count = meetings.filter((m: { scheduledAt: string }) => {
                const d = new Date(m.scheduledAt);
                return d >= weekStart && d < weekEnd;
            }).length;
            setMeetingsThisWeek(count);
        }).catch(() => {});
    }, []);

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    const stats = [
        { label: 'Total Tasks', value: String(total) },
        { label: 'Completed', value: String(completed) },
        { label: 'Meetings This Week', value: String(meetingsThisWeek) },
    ];

    return (
        <div className="grid grid-cols-3 gap-6 mb-8 mt-6">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-[#1A231F] border border-[#2A3430] p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <span className="text-4xl font-semibold text-emerald-500 block mb-2 group-hover:scale-110 transition-transform origin-left">{stat.value}</span>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
