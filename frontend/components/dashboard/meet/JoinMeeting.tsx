"use client";

import { Video } from 'lucide-react';

interface JoinMeetingProps {
    onJoin: () => void;
}

const JoinMeeting = ({ onJoin }: JoinMeetingProps) => {
    return (
        <div className="space-y-6">
            {/* Join Section */}
            <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
                <h2 className="text-xl font-medium text-white mb-6">Join a Meeting</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Meeting ID</label>
                        <input
                            type="text"
                            placeholder="Enter meeting ID"
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Passcode (optional)</label>
                        <input
                            type="password"
                            placeholder="Enter passcode"
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    <button
                        onClick={onJoin}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        <Video className="w-5 h-5" />
                        Join Meeting
                    </button>
                </div>
            </div>

            {/* Start Instant Section */}
            <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
                <h2 className="text-xl font-medium text-white mb-6">Start Instant Meeting</h2>
                <button
                    onClick={onJoin}
                    className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <Video className="w-5 h-5" />
                    Start Meeting Now
                </button>
            </div>
        </div>
    );
};

export default JoinMeeting;
