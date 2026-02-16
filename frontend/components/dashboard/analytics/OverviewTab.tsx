"use client";

import { Calendar, Briefcase, Users, Layout } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const activityData = [
    { name: 'Jan', meetings: 25 },
    { name: 'Feb', meetings: 22 },
    { name: 'Mar', meetings: 30 },
    { name: 'Apr', meetings: 28 },
    { name: 'May', meetings: 35 },
    { name: 'Jun', meetings: 32 },
    { name: 'Jul', meetings: 38 },
    { name: 'Aug', meetings: 35 },
    { name: 'Sep', meetings: 42 },
    { name: 'Oct', meetings: 40 },
    { name: 'Nov', meetings: 45 },
    { name: 'Dec', meetings: 38 },
];

const performanceData = [
    { name: 'Mon', hours: 8, meetings: 4 },
    { name: 'Tue', hours: 7, meetings: 3 },
    { name: 'Wed', hours: 9, meetings: 5 },
    { name: 'Thu', hours: 6, meetings: 2 },
    { name: 'Fri', hours: 8, meetings: 4 },
    { name: 'Sat', hours: 2, meetings: 1 },
    { name: 'Sun', hours: 1, meetings: 1 },
];

const meetings = [
    { id: 1, title: 'Team Standup', date: 'Jan 12', time: '9:00 AM', tag: 'Development', color: 'bg-blue-500' },
    { id: 2, title: 'Client Review', date: 'Jan 13', time: '2:00 PM', tag: 'Sales', color: 'bg-emerald-500' },
    { id: 3, title: 'Sprint Planning', date: 'Jan 15', time: '10:00 AM', tag: 'Development', color: 'bg-blue-500' },
    { id: 4, title: 'Design Sync', date: 'Jan 16', time: '3:00 PM', tag: 'Design', color: 'bg-purple-500' },
    { id: 5, title: 'All Hands', date: 'Jan 18', time: '11:00 AM', tag: 'Company', color: 'bg-amber-500' },
];

const OverviewTab = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Activity */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly Activity</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData}>
                                <defs>
                                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10B981' }}
                                />
                                <Area type="monotone" dataKey="meetings" stroke="#10B981" fillOpacity={1} fill="url(#colorMeetings)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Performance */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Weekly Performance</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                />
                                <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="meetings" fill="#065F46" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Upcoming Meetings</h3>
                <div className="space-y-3">
                    {meetings.map((meeting) => (
                        <div key={meeting.id} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl hover:border-[#3A4440] transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Calendar className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{meeting.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{meeting.date} • {meeting.time}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-[#1A231F] border border-[#2A3430] rounded-full text-[10px] font-medium text-gray-400">
                                {meeting.tag}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
