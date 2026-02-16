"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const distributionData = [
    { name: 'On Time', value: 68, color: '#10B981' },
    { name: 'Late', value: 22, color: '#34D399' },
    { name: 'Absent', value: 10, color: '#EF4444' },
];

const trendData = [
    { name: 'Jan', attendance: 92 },
    { name: 'Feb', attendance: 90 },
    { name: 'Mar', attendance: 85 },
    { name: 'Apr', attendance: 95 },
    { name: 'May', attendance: 88 },
    { name: 'Jun', attendance: 91 },
    { name: 'Jul', attendance: 86 },
    { name: 'Aug', attendance: 94 },
    { name: 'Sep', attendance: 92 },
    { name: 'Oct', attendance: 93 },
    { name: 'Nov', attendance: 89 },
    { name: 'Dec', attendance: 91 },
];

const summaryCards = [
    { label: 'On Time', value: '68%', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', subtitle: 'Punctuality rate across all meetings' },
    { label: 'Late', value: '22%', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', subtitle: 'Joined within 5 minutes' },
    { label: 'Absent', value: '10%', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', subtitle: 'Did not attend scheduled meetings' },
];

const AttendanceTab = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Attendance Distribution</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="text-3xl font-bold text-white">90%</p>
                            <p className="text-xs text-gray-500">Average</p>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {distributionData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-400">{item.name} {item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance Trend */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Attendance Trend</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{card.value}</p>
                                <p className="text-sm text-gray-400">{card.label}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{card.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceTab;
