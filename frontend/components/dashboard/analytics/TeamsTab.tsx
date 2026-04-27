"use client";

import { useState, useEffect } from 'react';
import { Users, Mail, X, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Participant {
    _id: string;
    name: string;
    email: string;
    status?: string;
}

interface Contact {
    _id: string;
    name: string;
    email: string;
    status: string;
    conversationId: string;
}

const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const TeamsTab = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Contact | null>(null);

    useEffect(() => {
        api.get('/conversations')
            .then(({ data }) => {
                const convs: Array<{ _id: string; participants: Participant[] }> = data.conversations ?? [];
                const seen = new Set<string>();
                const list: Contact[] = [];
                for (const conv of convs) {
                    const other = conv.participants.find(p => p._id !== user?._id);
                    if (other && !seen.has(other._id)) {
                        seen.add(other._id);
                        list.push({
                            _id: other._id,
                            name: other.name,
                            email: other.email,
                            status: other.status || 'offline',
                            conversationId: conv._id,
                        });
                    }
                }
                setContacts(list);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No chat contacts yet</p>
                <p className="text-gray-600 text-xs mt-1">Start conversations in Chat to see team members here</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contacts.map((contact) => (
                    <button
                        key={contact._id}
                        onClick={() => setSelected(contact)}
                        className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6 hover:border-emerald-500/30 transition-all group text-left"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-200 shrink-0">
                                    {initials(contact.name)}
                                </div>
                                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                    {contact.name}
                                </h3>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                contact.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/20'
                            }`}>
                                {contact.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                            <Mail className="w-4 h-4 shrink-0" />
                            <span className="truncate">{contact.email}</span>
                        </div>

                        <p className="text-xs text-emerald-500/60 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Click to view details
                        </p>
                    </button>
                ))}
            </div>

            {/* Detail modal */}
            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Member Details</h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Avatar + name */}
                        <div className="flex items-center gap-4 mb-6 p-4 bg-[#141B18] rounded-xl border border-[#2A3430]">
                            <div className="w-16 h-16 rounded-full bg-emerald-900/50 border-2 border-emerald-700 flex items-center justify-center text-2xl font-bold text-emerald-200 shrink-0">
                                {initials(selected.name)}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white">{selected.name}</h4>
                                <p className="text-sm text-gray-400 mt-0.5">{selected.email}</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-[#141B18] rounded-xl border border-[#2A3430]">
                                <span className="text-sm text-gray-400">Status</span>
                                <span className={`text-sm font-medium capitalize ${
                                    selected.status === 'active' ? 'text-emerald-400' : 'text-gray-400'
                                }`}>
                                    {selected.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[#141B18] rounded-xl border border-[#2A3430]">
                                <span className="text-sm text-gray-400">Email</span>
                                <span className="text-sm text-white">{selected.email}</span>
                            </div>
                        </div>

                        <a
                            href={`/dashboard/chat`}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Open Chat
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};

export default TeamsTab;
