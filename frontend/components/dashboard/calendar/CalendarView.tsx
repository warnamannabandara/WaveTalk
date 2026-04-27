"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, Link as LinkIcon, Plus, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface Meeting {
    _id: string;
    title: string;
    meetingId: string;
    scheduledAt: string;
    status: string;
    host: { _id: string; name: string };
    participants: { _id: string; name: string }[];
    description?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(start: string, end?: string): string {
    if (!end) return '';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h} hr ${m} min` : `${h} hour`;
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// Color palette for meeting chips (cycles by index)
const CHIP_COLORS = [
    'bg-emerald-500/20 text-emerald-300',
    'bg-blue-500/20 text-blue-300',
    'bg-purple-500/20 text-purple-300',
    'bg-amber-500/20 text-amber-300',
    'bg-pink-500/20 text-pink-300',
];

export default function CalendarView() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date>(today);
    const [loading, setLoading] = useState(true);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

    const fetchMeetings = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/meetings');
            setMeetings(data.meetings ?? []);
        } catch {
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

    // Navigation
    const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const goToday = () => {
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDay(today);
    };

    // Build grid cells
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const getMeetingsForDay = (day: number) => {
        const date = new Date(year, month, day);
        return meetings.filter(m => {
            if (!m.scheduledAt) return false;
            return isSameDay(new Date(m.scheduledAt), date);
        });
    };

    const selectedDayMeetings = meetings.filter(m => {
        if (!m.scheduledAt) return false;
        return isSameDay(new Date(m.scheduledAt), selectedDay);
    });

    const handleCopyLink = (meetingId: string) => {
        const url = `${window.location.origin}/dashboard/meet?join=${meetingId}`;
        navigator.clipboard.writeText(url).catch(() => {});
        setCopyFeedback(meetingId);
        setTimeout(() => setCopyFeedback(null), 1500);
    };

    // Grid cells
    const cells: React.ReactNode[] = [];
    // Leading empty slots
    for (let i = 0; i < firstDay; i++) {
        cells.push(
            <div key={`pre-${i}`} className="h-24 rounded-xl border border-white/5 bg-black/10 opacity-30" />
        );
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const isToday = isSameDay(dayDate, today);
        const isSelected = isSameDay(dayDate, selectedDay);
        const dayMeetings = getMeetingsForDay(day);

        cells.push(
            <div
                key={`day-${day}`}
                onClick={() => setSelectedDay(dayDate)}
                className={`h-24 p-2 rounded-xl border cursor-pointer transition-all group ${
                    isSelected
                        ? 'border-emerald-400/60 bg-emerald-900/20 ring-1 ring-emerald-400/30'
                        : isToday
                            ? 'border-emerald-500/40 bg-emerald-900/10'
                            : 'border-white/5 bg-[#1A231F] hover:border-white/15 hover:bg-[#1f2b24]'
                }`}
            >
                <span className={`text-sm font-medium block mb-1 ${
                    isToday ? 'text-emerald-400' : isSelected ? 'text-emerald-300' : 'text-gray-300'
                }`}>
                    {day}
                </span>
                <div className="space-y-0.5 overflow-hidden">
                    {dayMeetings.slice(0, 2).map((m, idx) => (
                        <div
                            key={m._id}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                                CHIP_COLORS[idx % CHIP_COLORS.length]
                            }`}
                        >
                            {formatTime(m.scheduledAt)}
                        </div>
                    ))}
                    {dayMeetings.length > 2 && (
                        <div className="text-[9px] text-gray-500 px-1">
                            +{dayMeetings.length - 2} more
                        </div>
                    )}
                </div>
            </div>
        );
    }
    // Trailing empty slots to complete grid
    const total = firstDay + daysInMonth;
    const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 0; i < trailing; i++) {
        cells.push(
            <div key={`post-${i}`} className="h-24 rounded-xl border border-white/5 bg-black/10 opacity-30" />
        );
    }

    return (
        <div className="space-y-6">
            {/* Calendar card */}
            <div className="bg-[#1A231F] rounded-2xl border border-[#2A3430] overflow-hidden">
                {/* Month nav */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A3430]">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{MONTHS[month]}</h2>
                        <p className="text-gray-500 text-sm">{year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevMonth}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={goToday}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-4">
                    {/* Day labels */}
                    <div className="grid grid-cols-7 mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    {/* Cells */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {cells}
                    </div>
                </div>
            </div>

            {/* Today's meetings for selected day */}
            <div className="bg-[#1A231F] rounded-2xl border border-[#2A3430] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3430]">
                    <h3 className="text-base font-semibold text-white">
                        {isSameDay(selectedDay, today)
                            ? "Today's Meetings"
                            : `${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()} Meetings`}
                    </h3>
                    <a
                        href="/dashboard/meet?tab=schedule"
                        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Schedule
                    </a>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : selectedDayMeetings.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 rounded-full bg-[#2A3430] flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500">No meetings scheduled for this day</p>
                            <a
                                href="/dashboard/meet?tab=schedule"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                Schedule a meeting
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayMeetings.map((meeting, idx) => (
                                <div
                                    key={meeting._id}
                                    className={`rounded-xl p-4 border transition-colors ${
                                        idx === 0
                                            ? 'border-emerald-500/40 bg-emerald-900/10 ring-1 ring-emerald-500/10'
                                            : 'border-[#2A3430] bg-[#141B18] hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white truncate">{meeting.title}</h4>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                                    <span>{formatTime(meeting.scheduledAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3 flex-shrink-0" />
                                                    <span>{meeting.participants.length}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                                                    meeting.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : meeting.status === 'ended'
                                                            ? 'bg-gray-700/50 text-gray-500'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {meeting.status}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={`/dashboard/meet?join=${meeting.meetingId}`}
                                            className="ml-3 p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex-shrink-0"
                                            title="Open meeting"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleCopyLink(meeting.meetingId)}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-medium transition-colors"
                                    >
                                        <LinkIcon className="w-3 h-3" />
                                        {copyFeedback === meeting.meetingId ? 'Copied!' : 'Copy Meeting Link'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
