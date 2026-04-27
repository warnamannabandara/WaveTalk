'use client';

import { useEffect, useState } from 'react';
import { Video, FileText, Hand, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
    totalMeetings: number;
    meetingsThisWeek: number;
    totalDocuments: number;
    signLanguageDetections: number;
}

const StatsOverview = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/overview')
            .then(({ data }) => setStats(data))
            .catch(() => { /* silent */ })
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            label: 'Total Meetings',
            value: stats?.totalMeetings ?? '—',
            sub: `${stats?.meetingsThisWeek ?? 0} this week`,
            icon: Video,
            color: 'text-emerald-400'
        },
        {
            label: 'This Week',
            value: stats?.meetingsThisWeek ?? '—',
            sub: 'meetings attended',
            icon: Calendar,
            color: 'text-blue-400'
        },
        {
            label: 'Documents',
            value: stats?.totalDocuments ?? '—',
            sub: 'notes & reports',
            icon: FileText,
            color: 'text-teal-400'
        },
        {
            label: 'Sign Detections',
            value: stats?.signLanguageDetections ?? '—',
            sub: 'words detected',
            icon: Hand,
            color: 'text-amber-400'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
                <div key={card.label} className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 transition-all hover:border-[#3A4440]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/5 border border-white/5">
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">{card.label}</p>
                        <div className="flex items-baseline gap-2">
                            {loading ? (
                                <div className="w-12 h-8 bg-[#2A3430] rounded animate-pulse" />
                            ) : (
                                <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
                            )}
                        </div>
                        <p className="text-gray-500 text-xs mt-4">{card.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
