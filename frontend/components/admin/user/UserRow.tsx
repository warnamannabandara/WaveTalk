"use client";

import { Edit, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';

interface UserRowProps {
    name: string;
    email: string;
    role: string;
    meetings: number;
    lastActive: string;
    status: 'Active' | 'Inactive';
}

const UserRow = ({ name, email, role, meetings, lastActive, status }: UserRowProps) => {
    return (
        <div className="flex items-center justify-between p-4 bg-[#1A231F]/40 border border-[#2A3430] rounded-xl hover:bg-[#1A231F]/60 transition-all group">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-800/50">
                    <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{name}</span>
                        {role === 'Admin' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                Admin
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span>{email}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{meetings} meetings</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="text-gray-500 italic">● {lastActive}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status === 'Active'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                    }`}>
                    {status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {status}
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRow;
