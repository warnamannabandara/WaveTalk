"use client";

import { Edit, Trash2, CheckCircle2, XCircle, Users } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastSeen: string;
}

interface UserRowProps {
    user: User;
    onEdit: () => void;
    onDelete: () => void;
}

function formatLastSeen(lastSeen: string): string {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function formatDuration(lastSeen: string): string {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w`;
    return `${Math.floor(days / 30)}mo`;
}

const UserRow = ({ user, onEdit, onDelete }: UserRowProps) => {
    const { name, email, role, status, lastSeen } = user;
    const diff = Date.now() - new Date(lastSeen).getTime();
    const isOnline = diff < 15 * 60 * 1000;
    const duration = formatDuration(lastSeen);

    const statusLabel = isOnline
        ? 'Online'
        : status === 'banned'
        ? 'Banned'
        : status === 'active'
        ? `Active · ${duration}`
        : `Inactive · ${duration}`;

    const statusClass = isOnline
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : status === 'banned'
        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        : status === 'inactive'
        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        : 'bg-gray-500/10 border-gray-500/20 text-gray-400';

    return (
        <div className="flex items-center justify-between p-4 bg-[#1A231F]/40 border border-[#2A3430] rounded-xl hover:bg-[#1A231F]/60 transition-all group">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-800/50">
                    <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{name}</span>
                        {role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                Admin
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span>{email}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="text-gray-500 italic">● {formatLastSeen(lastSeen)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                    {isOnline || status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span className="whitespace-nowrap">{statusLabel}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={onDelete} className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserRow;
