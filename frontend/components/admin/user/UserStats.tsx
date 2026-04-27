"use client";

import { useEffect, useState } from 'react';
import { Users, Video, Database, Activity } from 'lucide-react';
import StatCard from '../StatCard';
import api from '@/lib/api';

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalMeetings: number;
    storageUsed: number;
    systemStatus: string;
    userGrowth: { thisWeek: number; thisMonth: number; thisYear: number };
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const UserStats = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/analytics/admin')
            .then(res => setStats(res.data))
            .finally(() => setLoading(false));
    }, []);

    const growthPct = stats?.userGrowth?.thisMonth
        ? `+${stats.userGrowth.thisMonth} this month`
        : undefined;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Users"
                value={loading ? '—' : stats?.totalUsers ?? 0}
                icon={Users}
                description={loading ? '' : `${stats?.activeUsers ?? 0} active`}
                loading={loading}
            />
            <StatCard
                title="Total Meetings"
                value={loading ? '—' : stats?.totalMeetings ?? 0}
                icon={Video}
                description="all time"
                loading={loading}
            />
            <StatCard
                title="Storage Used"
                value={loading ? '—' : formatBytes(stats?.storageUsed ?? 0)}
                icon={Database}
                description="from uploaded documents"
                loading={loading}
            />
            <StatCard
                title="System Status"
                value={loading ? '—' : stats?.systemStatus === 'healthy' ? 'Healthy' : 'Degraded'}
                icon={Activity}
                description="all services operational"
                loading={loading}
                statusColor={stats?.systemStatus === 'healthy' ? 'emerald' : 'red'}
            />
        </div>
    );
};

export default UserStats;
