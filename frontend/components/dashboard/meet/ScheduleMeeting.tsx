"use client";

import { useState } from 'react';
import { Calendar, Loader2, CheckCircle2, Clock, Users, FileText } from 'lucide-react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

interface ScheduleMeetingProps {
  onClose?: () => void;
}

const ScheduleMeeting = ({ onClose }: ScheduleMeetingProps) => {
    const client = useStreamVideoClient();
    const [isScheduling, setIsScheduling] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        participants: '',
        description: ''
    });

    const generateMeetingId = () => {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    };

    const handleScheduleMeeting = async () => {
        if (!client || !formData.date || !formData.time) return;

        try {
            setIsScheduling(true);
            const id = generateMeetingId();
            const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();

            const call = client.call('default', id);
            await call.getOrCreate({
                data: {
                    starts_at: scheduledAt,
                    custom: {
                        description: formData.description
                    }
                },
            });

            await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meetingId: id,
                    title: formData.title || 'Scheduled Meeting',
                    scheduledAt: scheduledAt,
                    participants: formData.participants.split(',').map(p => p.trim()).filter(Boolean)
                }),
            });

            setIsSuccess(true);
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);

        } catch (error) {
            console.error('Failed to schedule meeting', error);
        } finally {
            setIsScheduling(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-white">Meeting Scheduled!</h3>
                <p className="text-emerald-100/60 max-w-xs">
                    Your meeting "{formData.title || 'Scheduled Meeting'}" has been successfully set up.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="group">
                    <label className="block text-sm font-medium text-emerald-100/60 mb-2 ml-1">Topic</label>
                    <input
                        type="text"
                        placeholder="Project Sync (Optional)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 mb-2 ml-1">
                            <Calendar className="w-3.5 h-3.5" /> Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all [color-scheme:dark]"
                        />
                    </div>
                    <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 mb-2 ml-1">
                            <Clock className="w-3.5 h-3.5" /> Time
                        </label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all [color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 mb-2 ml-1">
                        <Users className="w-3.5 h-3.5" /> Participants
                    </label>
                    <input
                        type="text"
                        placeholder="Emails separated by commas"
                        value={formData.participants}
                        onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                </div>

                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-emerald-100/60 mb-2 ml-1">
                        <FileText className="w-3.5 h-3.5" /> Description
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Agenda or notes..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleScheduleMeeting}
                    disabled={isScheduling || !formData.date || !formData.time}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    {isScheduling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                    {isScheduling ? 'Scheduling...' : 'Schedule'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleMeeting;

