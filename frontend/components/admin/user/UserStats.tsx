"use client";

import { Users, Video, Database, Activity } from 'lucide-react';
import StatCard from '../StatCard';

const UserStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                description="this month"
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
    );
};

export default UserStats;
