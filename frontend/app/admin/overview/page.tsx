"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import StatCard from "@/components/admin/StatCard";
import MetricCharts from "@/components/admin/MetricCharts";
import AdminQuickStats from "@/components/admin/AdminQuickStats";
import { Users, Video, Database, Activity } from 'lucide-react';

export default function AdminOverviewPage() {
    return (
        <div className="space-y-8">
            <AdminHeader />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value="5"
                    icon={Users}
                    trend="12%"
                    description="4 active"
                />
                <StatCard
                    title="Total Meetings"
                    value="342"
                    icon={Video}
                    trend="8%"
                />
                <StatCard
                    title="Storage Used"
                    value="312GB"
                    icon={Database}
                    description="of 1TB available"
                />
                <StatCard
                    title="System Status"
                    value="Healthy"
                    icon={Activity}
                    description="99.9% uptime"
                />
            </div>

            {/* Charts Section */}
            <MetricCharts />

            {/* Quick Stats Section */}
            <AdminQuickStats />
        </div>
    );
}
