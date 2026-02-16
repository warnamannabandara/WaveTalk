"use client";

import { Calendar } from 'lucide-react';

const ScheduleMeeting = () => {
    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <h2 className="text-xl font-medium text-white mb-6">Schedule New Meeting</h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Meeting Title</label>
                    <input
                        type="text"
                        placeholder="Team Sync Meeting"
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Date</label>
                        <input
                            type="date"
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Time</label>
                        <input
                            type="time"
                            className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Time Zone</label>
                    <select className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors outline-none cursor-pointer">
                        <option>UTC</option>
                        <option>GMT</option>
                        <option>PST</option>
                        <option>EST</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Participants (Email or Name)</label>
                    <input
                        type="text"
                        placeholder="Enter emails separated by commas"
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Location (optional)</label>
                    <input
                        type="text"
                        placeholder="Conference Room A or Meeting Link"
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Repeat</label>
                    <select className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors outline-none cursor-pointer">
                        <option>Does not repeat</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Additional Details (optional)</label>
                    <textarea
                        rows={4}
                        placeholder="Meeting agenda, notes, etc."
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    />
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule Meeting
                </button>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
