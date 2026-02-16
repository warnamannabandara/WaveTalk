"use client";

import { Users, Activity, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
    {
        label: 'Total Meetings',
        value: '342',
        change: '12%',
        trend: 'up',
        period: 'vs last year',
        icon: Users,
        color: 'text-emerald-400'
    },
    {
        label: 'Avg Attendance',
        value: '90%',
        change: '3%',
        trend: 'up',
        period: 'across all meetings',
        icon: Activity,
        color: 'text-blue-400'
    },
    {
        label: 'Completed Projects',
        value: '24',
        change: '8%',
        trend: 'up',
        period: 'this year',
        icon: CheckCircle,
        color: 'text-teal-400'
    },
    {
        label: 'Active Projects',
        value: '12',
        change: '2%',
        trend: 'down',
        period: 'in progress',
        icon: Clock,
        color: 'text-amber-400'
    }
];

const StatsOverview = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 transition-all hover:border-[#3A4440] group">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 rounded-xl bg-emerald-500/5 border border-white/5`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                            <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-4">{stat.period}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
