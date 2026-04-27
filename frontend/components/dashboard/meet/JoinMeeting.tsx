'use client';

import { useState } from 'react';
import { Video } from 'lucide-react';
import api from '@/lib/api';

interface Props {
    onJoin: (meetingId: string) => void;
}

const JoinMeeting = ({ onJoin }: Props) => {
    const [meetingId, setMeetingId] = useState('');
    const [passcode, setPasscode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [instantLoading, setInstantLoading] = useState(false);

    const handleJoin = async () => {
        if (!meetingId.trim()) { setError('Meeting ID is required'); return; }
        setError('');
        setLoading(true);
        try {
            await api.post('/meetings/join', { meetingId: meetingId.trim(), passcode: passcode.trim() });
            onJoin(meetingId.trim());
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not join meeting';
            setError(msg);
        } finally { setLoading(false); }
    };

    const handleInstant = async () => {
        setInstantLoading(true);
        try {
            const { data } = await api.post('/meetings', {
                title: 'Instant Meeting',
                scheduledAt: new Date().toISOString()
            });
            await api.put(`/meetings/${data.meeting._id}/start`);
            onJoin(data.meeting.meetingId);
        } catch {
            setError('Could not start instant meeting');
        } finally { setInstantLoading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
                <h2 className="text-xl font-medium text-white mb-6">Join a Meeting</h2>
                {error && (
                    <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</div>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Meeting ID</label>
                        <input type="text" placeholder="e.g. abc-defg-hij" value={meetingId} onChange={e => setMeetingId(e.target.value)}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Passcode (optional)</label>
                        <input type="password" placeholder="Enter passcode" value={passcode} onChange={e => setPasscode(e.target.value)}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                    </div>
                    <button onClick={handleJoin} disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                        <Video className="w-5 h-5" />
                        {loading ? 'Joining...' : 'Join Meeting'}
                    </button>
                </div>
            </div>

            <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
                <h2 className="text-xl font-medium text-white mb-6">Start Instant Meeting</h2>
                <button onClick={handleInstant} disabled={instantLoading}
                    className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 disabled:opacity-50 text-emerald-400 border border-emerald-600/30 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Video className="w-5 h-5" />
                    {instantLoading ? 'Creating...' : 'Start Meeting Now'}
                </button>
            </div>
        </div>
    );
};

export default JoinMeeting;
