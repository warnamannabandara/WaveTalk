"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, MicOff, VideoOff } from 'lucide-react';

interface JoinMeetingProps {
  onClose?: () => void;
}

const JoinMeeting = ({ onClose }: JoinMeetingProps) => {
    const router = useRouter();
    const [meetingId, setMeetingId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [options, setOptions] = useState({
        noAudio: false,
        noVideo: false,
    });

    const handleJoinMeeting = () => {
        if (!meetingId.trim()) return;
        setIsJoining(true);
        
        // Append preferences if needed (logic can be extended later)
        router.push(`/meeting/${meetingId.trim()}`);
        if (onClose) onClose();
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="relative group">
                    <label className="block text-sm font-medium text-emerald-100/60 mb-2 ml-1 transition-colors group-focus-within:text-emerald-400">
                        Meeting ID or Personal Link Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter meeting ID"
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg"
                    />
                </div>

                <div className="relative group">
                    <label className="block text-sm font-medium text-emerald-100/60 mb-2 ml-1 transition-colors group-focus-within:text-emerald-400">
                        Your Name
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4 border-t border-[#2A3430] pt-6">
                <p className="text-sm font-medium text-emerald-100/40 uppercase tracking-wider mb-4">Join Options</p>
                
                <label className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${options.noAudio ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           <MicOff className="w-4 h-4" />
                        </div>
                        <span className="text-gray-300">Don't connect to audio</span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={options.noAudio}
                        onChange={(e) => setOptions(prev => ({ ...prev, noAudio: e.target.checked }))}
                        className="w-5 h-5 rounded-md border-[#2A3430] bg-[#141B18] text-emerald-500 focus:ring-emerald-500/20" 
                    />
                </label>

                <label className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${options.noVideo ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                           <VideoOff className="w-4 h-4" />
                        </div>
                        <span className="text-gray-300">Turn off my video</span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={options.noVideo}
                        onChange={(e) => setOptions(prev => ({ ...prev, noVideo: e.target.checked }))}
                        className="w-5 h-5 rounded-md border-[#2A3430] bg-[#141B18] text-emerald-500 focus:ring-emerald-500/20" 
                    />
                </label>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all active:scale-95"
                >
                    Cancel
                </button>
                <button
                    onClick={handleJoinMeeting}
                    disabled={isJoining || !meetingId.trim()}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    {isJoining ? "Joining..." : "Join"}
                </button>
            </div>
        </div>
    );
};

export default JoinMeeting;

