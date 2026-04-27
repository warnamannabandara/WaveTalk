'use client';

import { useState, useRef } from 'react';
import {
    Calendar, Plus, Trash2, Paperclip, FileText, X, Users, RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface AttachedDoc {
    name: string;
    size: number;
    url: string;
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ScheduleMeeting = () => {
    // Core fields
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timezone, setTimezone] = useState('UTC');
    const [description, setDescription] = useState('');
    const [passcode, setPasscode] = useState('');

    // Participants
    const [participants, setParticipants] = useState<string[]>(['']);

    // Document attachments
    const [documents, setDocuments] = useState<AttachedDoc[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Recurrence
    const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
    const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [recurrenceCount, setRecurrenceCount] = useState(1);
    const [recurrenceEndMode, setRecurrenceEndMode] = useState<'count' | 'date'>('count');

    // State
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // ── Participants ──────────────────────────────────────────────────────────
    const addParticipant = () => setParticipants(prev => [...prev, '']);
    const removeParticipant = (i: number) => setParticipants(prev => prev.filter((_, idx) => idx !== i));
    const updateParticipant = (i: number, val: string) =>
        setParticipants(prev => { const n = [...prev]; n[i] = val; return n; });

    // ── Document attachments ──────────────────────────────────────────────────
    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newDocs: AttachedDoc[] = files.map(f => ({
            name: f.name,
            size: f.size,
            url: URL.createObjectURL(f),
        }));
        setDocuments(prev => [...prev, ...newDocs]);
        e.target.value = '';
    };

    const removeDoc = (i: number) => {
        setDocuments(prev => {
            URL.revokeObjectURL(prev[i].url);
            return prev.filter((_, idx) => idx !== i);
        });
    };

    // ── Recurrence helpers ────────────────────────────────────────────────────
    const toggleWeekday = (d: number) =>
        setRecurrenceWeekdays(prev =>
            prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
        );

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSchedule = async () => {
        if (!title.trim() || !date || !time) {
            setError('Title, date, and time are required');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const scheduledAt = new Date(`${date}T${time}`).toISOString();
            const validParticipants = participants.filter(p => p.trim() && p.includes('@'));
            const recurrencePayload = recurrence !== 'none' ? {
                type: recurrence,
                weekdays: recurrence === 'weekly' ? recurrenceWeekdays : undefined,
                endDate: recurrenceEndMode === 'date' ? recurrenceEndDate : undefined,
                occurrences: recurrenceEndMode === 'count' ? recurrenceCount : undefined,
            } : undefined;

            const { data } = await api.post('/meetings', {
                title,
                scheduledAt,
                timezone,
                description,
                passcode,
                invitedEmails: validParticipants,
                documents: documents.map(d => ({ name: d.name, size: d.size })),
                recurrence: recurrencePayload,
            });

            setSuccess(`Meeting scheduled! ID: ${data.meeting.meetingId}`);
            // Reset form
            setTitle(''); setDate(''); setTime(''); setDescription(''); setPasscode('');
            setParticipants(['']); setDocuments([]); setRecurrence('none');
            setRecurrenceWeekdays([]); setRecurrenceEndDate(''); setRecurrenceCount(1);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                || 'Failed to schedule meeting';
            setError(msg);
        } finally { setLoading(false); }
    };

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <h2 className="text-xl font-medium text-white mb-6">Schedule New Meeting</h2>

            {success && (
                <div className="mb-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800 rounded-lg px-3 py-2">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Meeting Title</label>
                    <input type="text" placeholder="Team Sync Meeting" value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors scheme-dark" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Time</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors scheme-dark" />
                    </div>
                </div>

                {/* Timezone */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Time Zone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors outline-none cursor-pointer">
                        <option>UTC</option><option>GMT</option>
                        <option>Asia/Colombo</option>
                        <option>PST</option><option>EST</option><option>CST</option><option>IST</option>
                        <option>Europe/London</option><option>Europe/Paris</option>
                        <option>Asia/Tokyo</option><option>Asia/Singapore</option>
                    </select>
                </div>

                {/* Participants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-400 flex items-center gap-1.5">
                            <Users className="w-4 h-4" /> Participants
                        </label>
                        <button onClick={addParticipant}
                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add email
                        </button>
                    </div>
                    <div className="space-y-2">
                        {participants.map((email, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="email"
                                    placeholder="participant@example.com"
                                    value={email}
                                    onChange={e => updateParticipant(i, e.target.value)}
                                    className="flex-1 bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                                />
                                {participants.length > 1 && (
                                    <button onClick={() => removeParticipant(i)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document attachments */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-400 flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4" /> Documents
                            <span className="text-xs text-gray-600">(participants can access before/after joining)</span>
                        </label>
                        <button onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Attach
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleDocUpload} />

                    {documents.length === 0 ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border border-dashed border-[#2A3430] rounded-xl py-4 text-center text-xs text-gray-600 hover:border-emerald-500/30 hover:text-gray-400 transition-colors"
                        >
                            Click to attach documents, PDFs, slides…
                        </button>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc, i) => (
                                <div key={i}
                                    className="flex items-center gap-3 bg-[#141B18] border border-[#2A3430] rounded-xl px-3 py-2.5">
                                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-white truncate">{doc.name}</p>
                                        <p className="text-xs text-gray-500">{formatSize(doc.size)}</p>
                                    </div>
                                    <button onClick={() => removeDoc(i)}
                                        className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors shrink-0">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => fileInputRef.current?.click()}
                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Attach more
                            </button>
                        </div>
                    )}
                </div>

                {/* Recurrence */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
                        <RefreshCw className="w-4 h-4" /> Repeat
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                        {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map(r => (
                            <button
                                key={r}
                                onClick={() => setRecurrence(r)}
                                className={`py-2 rounded-xl text-xs font-medium capitalize transition-all border ${
                                    recurrence === r
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                        : 'bg-[#141B18] border-[#2A3430] text-gray-400 hover:border-white/10 hover:text-white'
                                }`}
                            >
                                {r === 'none' ? 'No repeat' : r}
                            </button>
                        ))}
                    </div>

                    {recurrence === 'weekly' && (
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">Repeat on</p>
                            <div className="flex gap-1.5">
                                {WEEKDAYS.map((day, d) => (
                                    <button
                                        key={d}
                                        onClick={() => toggleWeekday(d)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            recurrenceWeekdays.includes(d)
                                                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                                : 'bg-[#141B18] border border-[#2A3430] text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {recurrence !== 'none' && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">End</p>
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setRecurrenceEndMode('count')}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                                        recurrenceEndMode === 'count'
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                            : 'bg-[#141B18] border-[#2A3430] text-gray-400'
                                    }`}
                                >
                                    After N occurrences
                                </button>
                                <button
                                    onClick={() => setRecurrenceEndMode('date')}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                                        recurrenceEndMode === 'date'
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                            : 'bg-[#141B18] border-[#2A3430] text-gray-400'
                                    }`}
                                >
                                    On date
                                </button>
                            </div>
                            {recurrenceEndMode === 'count' ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number" min={1} max={365}
                                        value={recurrenceCount}
                                        onChange={e => setRecurrenceCount(Number(e.target.value))}
                                        className="w-24 bg-[#141B18] border border-[#2A3430] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                    />
                                    <span className="text-xs text-gray-500">times</span>
                                </div>
                            ) : (
                                <input
                                    type="date"
                                    value={recurrenceEndDate}
                                    onChange={e => setRecurrenceEndDate(e.target.value)}
                                    className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-colors scheme-dark text-sm"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Passcode */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Passcode (optional)</label>
                    <input type="text" placeholder="Leave blank for open meeting" value={passcode}
                        onChange={e => setPasscode(e.target.value)}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Agenda / Notes (optional)</label>
                    <textarea rows={3} placeholder="Meeting agenda, discussion points, etc." value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none" />
                </div>

                <button onClick={handleSchedule} disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {loading ? 'Scheduling…' : 'Schedule Meeting'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
