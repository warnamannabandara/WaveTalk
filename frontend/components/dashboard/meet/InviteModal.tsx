"use client";

import { useState } from 'react';
import { UserPlus, X, Copy, Check, Link2, Mail, Plus, Trash2 } from 'lucide-react';

interface InviteModalProps {
    meetingId: string;
    onClose: () => void;
}

const InviteModal = ({ meetingId, onClose }: InviteModalProps) => {
    const [copiedId, setCopiedId] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [emails, setEmails] = useState<string[]>(['']);
    const [inviteSent, setInviteSent] = useState(false);

    const meetingLink = typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard/meet?join=${meetingId}`
        : '';

    const copyMeetingId = async () => {
        await navigator.clipboard.writeText(meetingId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(meetingLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const addEmail = () => setEmails(prev => [...prev, '']);
    const removeEmail = (i: number) => setEmails(prev => prev.filter((_, idx) => idx !== i));
    const updateEmail = (i: number, val: string) =>
        setEmails(prev => { const n = [...prev]; n[i] = val; return n; });

    const validEmails = emails.filter(e => e.trim() && e.includes('@'));

    const handleSend = () => {
        if (validEmails.length === 0) return;
        // Copy a formatted invite message to clipboard
        const msg = `You're invited to join a meeting!\n\nMeeting ID: ${meetingId}\nLink: ${meetingLink}`;
        navigator.clipboard.writeText(msg);
        setInviteSent(true);
        setTimeout(() => setInviteSent(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#141B18] border border-[#2A3430] rounded-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3430]">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-emerald-400" />
                        <span className="text-base font-semibold text-white">Invite to Meeting</span>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Meeting ID */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Meeting ID</p>
                        <div className="flex items-center gap-2 bg-[#1E2820] border border-[#2A3430] rounded-xl px-3 py-2.5">
                            <code className="flex-1 text-sm text-white font-mono">{meetingId}</code>
                            <button
                                onClick={copyMeetingId}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
                            >
                                {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedId ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Meeting Link */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Meeting Link</p>
                        <div className="flex items-center gap-2 bg-[#1E2820] border border-[#2A3430] rounded-xl px-3 py-2.5">
                            <Link2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <p className="flex-1 text-sm text-gray-400 truncate">{meetingLink}</p>
                            <button
                                onClick={copyLink}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
                            >
                                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedLink ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Email invite */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500">Invite by Email</p>
                            <button
                                onClick={addEmail}
                                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        </div>

                        <div className="space-y-2">
                            {emails.map((email, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="flex-1 flex items-center gap-2 bg-[#1E2820] border border-[#2A3430] rounded-xl px-3 py-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={e => updateEmail(i, e.target.value)}
                                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                                        />
                                    </div>
                                    {emails.length > 1 && (
                                        <button
                                            onClick={() => removeEmail(i)}
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="text-[10px] text-gray-600 mt-2">
                            Clicking &quot;Send Invites&quot; copies a formatted invite message to your clipboard — paste it into email or chat.
                        </p>

                        {inviteSent ? (
                            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                                <Check className="w-4 h-4" />
                                Invite message copied to clipboard!
                            </div>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={validEmails.length === 0}
                                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-all"
                            >
                                Send Invites
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
