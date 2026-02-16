"use client";

import { Users } from 'lucide-react';

const teams = [
    {
        name: 'Development',
        members: 12,
        metrics: [
            { label: 'Total Meetings', value: '45' },
            { label: 'Avg Attendance', value: '94%' },
            { label: 'Avg per Member', value: '4' },
        ]
    },
    {
        name: 'Design',
        members: 8,
        metrics: [
            { label: 'Total Meetings', value: '32' },
            { label: 'Avg Attendance', value: '91%' },
            { label: 'Avg per Member', value: '4' },
        ]
    },
    {
        name: 'Marketing',
        members: 10,
        metrics: [
            { label: 'Total Meetings', value: '38' },
            { label: 'Avg Attendance', value: '88%' },
            { label: 'Avg per Member', value: '4' },
        ]
    },
    {
        name: 'Sales',
        members: 15,
        metrics: [
            { label: 'Total Meetings', value: '52' },
            { label: 'Avg Attendance', value: '86%' },
            { label: 'Avg per Member', value: '3' },
        ]
    },
];

const TeamsTab = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
                <div key={team.name} className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 hover:border-[#3A4440] transition-all group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{team.name}</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">{team.members} members</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {team.metrics.map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{metric.label}</span>
                                <span className="text-lg font-bold text-white">{metric.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TeamsTab;
