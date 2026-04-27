"use client";

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    description?: string;
    loading?: boolean;
    statusColor?: 'emerald' | 'red' | 'yellow';
}

const StatCard = ({ title, value, icon: Icon, trend, description, loading, statusColor = 'emerald' }: StatCardProps) => {
    const colorMap = {
        emerald: 'text-emerald-500',
        red: 'text-red-400',
        yellow: 'text-yellow-400',
    };

    return (
        <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 text-sm font-medium">{title}</span>
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-emerald-500" />
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
                {loading ? (
                    <div className="h-8 w-20 bg-white/5 rounded animate-pulse" />
                ) : (
                    <h3 className={`text-2xl font-bold ${colorMap[statusColor] ?? 'text-white'} ${statusColor === 'emerald' ? 'text-white' : ''}`}>
                        {value}
                    </h3>
                )}
                {trend && !loading && (
                    <span className="text-xs font-medium text-emerald-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        {trend}
                    </span>
                )}
            </div>

            {loading ? (
                <div className="h-3 w-28 bg-white/5 rounded animate-pulse mt-1" />
            ) : (
                (description || trend) && (
                    <p className="text-xs text-gray-500">{description || 'this month'}</p>
                )
            )}
        </div>
    );
};

export default StatCard;
