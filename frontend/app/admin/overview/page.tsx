"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import MetricCharts from "@/components/admin/MetricCharts";
import AdminQuickStats from "@/components/admin/AdminQuickStats";
import { Users, Video, Database, Activity } from 'lucide-react';
import api from "@/lib/api";

interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    totalMeetings: number;
    activeMeetings: number;
    storageUsed: number;
    systemStatus: string;
    systemMetrics: { month: string; users: number; meetings: number }[];
    featureUsage: { label: string; count: number; pct: number }[];
    peakHours: { label: string; count: number; pct: number }[];
    meetingDuration: { label: string; count: number; pct: number }[];
    userGrowth: { thisWeek: number; thisMonth: number; thisYear: number };
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.get('/analytics/admin')
            .then(res => setStats(res.data))
            .catch(() => setError('Failed to load dashboard data'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <AdminHeader />

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    description={loading ? '' : `${stats?.activeMeetings ?? 0} live now`}
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

            {/* Charts Section */}
            <MetricCharts
                systemMetrics={stats?.systemMetrics ?? []}
                featureUsage={stats?.featureUsage ?? []}
                loading={loading}
            />

            {/* Quick Stats Section */}
            <AdminQuickStats
                peakHours={stats?.peakHours ?? []}
                meetingDuration={stats?.meetingDuration ?? []}
                userGrowth={stats?.userGrowth ?? { thisWeek: 0, thisMonth: 0, thisYear: 0 }}
                loading={loading}
            />
        </div>
    );
}
