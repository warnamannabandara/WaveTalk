"use client";

import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface SystemMetric {
    month: string;
    users: number;
    meetings: number;
}

interface FeatureUsage {
    label: string;
    count: number;
    pct: number;
}

interface MetricChartsProps {
    systemMetrics: SystemMetric[];
    featureUsage: FeatureUsage[];
    loading?: boolean;
}

const tooltipStyle = {
    backgroundColor: '#1A231F',
    border: '1px solid #2A3430',
    borderRadius: '8px',
    color: '#d1d5db',
    fontSize: '12px',
};

const MetricCharts = ({ systemMetrics, featureUsage, loading }: MetricChartsProps) => {
    const barData = featureUsage.map(f => ({ name: f.label, count: f.count }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Metrics */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">System Metrics</h3>
                {loading ? (
                    <div className="h-62.5 bg-white/5 rounded-lg animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={systemMetrics} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradMeetings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" />
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                            <Area type="monotone" dataKey="users" name="Users" stroke="#10b981" strokeWidth={2} fill="url(#gradUsers)" dot={false} />
                            <Area type="monotone" dataKey="meetings" name="Meetings" stroke="#34d399" strokeWidth={2} fill="url(#gradMeetings)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Feature Usage */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Feature Usage</h3>
                {loading ? (
                    <div className="h-62.5 bg-white/5 rounded-lg animate-pulse" />
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" name="Count" fill="#10b981" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default MetricCharts;
