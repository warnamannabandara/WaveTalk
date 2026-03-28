"use client";

import React, { useState, useEffect } from 'react';
import { Video, Calendar, MessageSquare, Clock, Users, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HomePage() {
    const { data: session } = useSession();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

    // Mock upcoming meetings
    const upcomingMeetings = [
        { id: 1, title: 'Weekly Team Sync', time: '10:00 AM', duration: '45 min', attendees: 5, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
        { id: 2, title: 'Project Review', time: '1:30 PM', duration: '60 min', attendees: 3, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { id: 3, title: 'Client Presentation', time: '3:00 PM', duration: '30 min', attendees: 8, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
    ];

    const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'there';

    return (
        <div className="flex-1 h-full overflow-y-auto bg-[#141C18] p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8 pb-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                            Good morning, {firstName} 👋
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Here's what's happening today.
                        </p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="text-2xl font-semibold text-white tracking-tight">{timeString}</div>
                        <div className="text-sm text-gray-400">{dateString}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/dashboard/meet" className="group relative p-6 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden text-left flex flex-col justify-between h-40">
                        <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            <Video className="w-12 h-12 text-emerald-500/30" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 relative z-10">
                            <Video className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-medium mb-1">New Meeting</h3>
                            <p className="text-xs text-emerald-400/80">Start instantly</p>
                        </div>
                    </Link>

                    <button className="group relative p-6 rounded-2xl bg-[#1A231F] border border-[#2A3430] hover:border-gray-500/50 transition-all duration-300 overflow-hidden text-left flex flex-col justify-between h-40">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            <Plus className="w-12 h-12 text-gray-500/20" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4 relative z-10">
                            <Plus className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-medium mb-1">Join Meeting</h3>
                            <p className="text-xs text-gray-400">Via code or link</p>
                        </div>
                    </button>

                    <button className="group relative p-6 rounded-2xl bg-[#1A231F] border border-[#2A3430] hover:border-blue-500/50 transition-all duration-300 overflow-hidden text-left flex flex-col justify-between h-40">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            <Calendar className="w-12 h-12 text-blue-500/20" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 relative z-10">
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-medium mb-1">Schedule</h3>
                            <p className="text-xs text-gray-400">Plan ahead</p>
                        </div>
                    </button>

                    <Link href="/dashboard/chat" className="group relative p-6 rounded-2xl bg-[#1A231F] border border-[#2A3430] hover:border-purple-500/50 transition-all duration-300 overflow-hidden text-left flex flex-col justify-between h-40">
                         <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                            <MessageSquare className="w-12 h-12 text-purple-500/20" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 relative z-10">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-white font-medium mb-1">New Chat</h3>
                            <p className="text-xs text-gray-400">Start conversation</p>
                        </div>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Upcoming Meetings */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
                            <Link href="/dashboard/meet" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                View calendar <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        
                        <div className="bg-[#1A231F] rounded-2xl border border-[#2A3430] overflow-hidden">
                            {upcomingMeetings.length > 0 ? (
                                <div className="divide-y divide-[#2A3430]">
                                    {upcomingMeetings.map((meeting) => (
                                        <div key={meeting.id} className="p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${meeting.color}`}>
                                                    <Clock className="w-4 h-4 mb-0.5" />
                                                    <span className="text-[10px] font-bold tracking-wider uppercase leading-none">{meeting.time.split(' ')[0]}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium text-sm mb-1 group-hover:text-emerald-300 transition-colors">{meeting.title}</h4>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {meeting.duration}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {meeting.attendees} attendees
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 rounded-lg bg-emerald-600/10 text-emerald-400 text-sm font-medium hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                                Join
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">No upcoming meetings today</p>
                                    <p className="text-gray-500 text-xs mt-1">Take a break or schedule a new one!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Recent Activity / Stats */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1A231F] rounded-2xl border border-[#2A3430] p-5">
                                <div className="text-gray-400 text-xs font-medium mb-1">Meetings Today</div>
                                <div className="text-2xl font-bold text-white mb-2">3</div>
                                <div className="text-xs text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 2 remaining
                                </div>
                            </div>
                            <div className="bg-[#1A231F] rounded-2xl border border-[#2A3430] p-5">
                                <div className="text-gray-400 text-xs font-medium mb-1">Unread Messages</div>
                                <div className="text-2xl font-bold text-white mb-2">12</div>
                                <div className="text-xs text-blue-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> In 4 chats
                                </div>
                            </div>
                            <div className="col-span-2 bg-gradient-to-tr from-emerald-900/40 to-emerald-600/10 rounded-2xl border border-emerald-500/20 p-5 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Users className="w-32 h-32 text-emerald-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                                        <Users className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">Invite Team Members</h3>
                                    <p className="text-xs text-emerald-100/70 mb-4 line-clamp-2">Collaborate instantly with high-quality video and chat.</p>
                                    <button className="w-full py-2 bg-white text-[#141C18] text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                        Copy Invite Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
