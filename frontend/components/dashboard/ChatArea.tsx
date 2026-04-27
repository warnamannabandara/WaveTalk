'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MoreVertical, Send, Paperclip, Phone, Video, Hand, X, Download, FileText, Trash2, UserPlus, SmilePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

// ── Emoji picker data ────────────────────────────────────────────────────────
const EMOJI_ROWS = [
    ['😀','😂','😅','😊','😍','🥰','😘','😎','🤔','😒','😢','😭','😡','🥺','🤗'],
    ['😴','🤣','😇','🙃','😬','😤','🥳','🤩','😏','😔','😳','🫠','😵','🤯','😱'],
    ['👍','👎','👏','🙌','🤝','👋','🤙','💪','🙏','✌️','🤞','👊','✊','🫶','❤️'],
    ['🔥','⭐','🎉','🎊','💡','💰','🏆','🎮','🎵','🎶','📷','📚','✅','❌','💬'],
];

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    return (
        <div ref={ref}
            className="absolute bottom-full left-0 mb-2 bg-[#141B18] border border-[#2A3430] rounded-2xl shadow-2xl p-3 z-50 w-72">
            {EMOJI_ROWS.map((row, i) => (
                <div key={i} className="flex gap-0.5 mb-0.5">
                    {row.map(emoji => (
                        <button key={emoji} onClick={() => onSelect(emoji)}
                            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors">
                            {emoji}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ── Types ────────────────────────────────────────────────────────────────────
interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
}

interface Message {
    _id: string;
    content: string;
    sender: User;
    type: string;
    createdAt: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    signLanguageData?: { word: string; sentence: string; confidence: number };
}

interface Participant {
    _id: string;
    name: string;
    email: string;
    avatar: string;
}

interface Conversation {
    _id: string;
    participants: Participant[];
    isGroup: boolean;
    groupName: string;
}

interface Props {
    conversationId: string | null;
}

// ── Helper ───────────────────────────────────────────────────────────────────
function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(type: string, fileName?: string | null) {
    if (type === 'image') return true;
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }
    return false;
}

function isVideoType(type: string, fileName?: string | null) {
    if (type === 'video') return true;
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['mp4', 'mov', 'avi', 'webm'].includes(ext || '');
    }
    return false;
}

// ── AddMember modal ──────────────────────────────────────────────────────────
interface AddMemberProps {
    conversationId: string;
    currentParticipantIds: string[];
    onClose: () => void;
    onAdded: () => void;
}

function AddMemberModal({ conversationId, currentParticipantIds, onClose, onAdded }: AddMemberProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const search = async (q: string) => {
        setQuery(q);
        if (q.length < 2) { setResults([]); return; }
        try {
            const { data } = await api.get(`/users?search=${encodeURIComponent(q)}`);
            setResults(data.users.filter((u: Participant) => !currentParticipantIds.includes(u._id)));
        } catch { /* silent */ }
    };

    const add = async (userId: string) => {
        setLoading(true);
        setError('');
        try {
            await api.post(`/conversations/${conversationId}/members`, { userId });
            onAdded();
            onClose();
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add member');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-5 w-80 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Add Member</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="w-4 h-4" /></button>
                </div>
                <input
                    type="text" placeholder="Search by name or email..."
                    value={query} onChange={e => search(e.target.value)}
                    className="w-full bg-[#151b18] text-sm text-white px-3 py-2 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50 mb-2"
                    autoFocus
                />
                {error && (
                    <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 mb-1">{error}</p>
                )}
                <div className="space-y-0.5 max-h-52 overflow-y-auto">
                    {results.map(u => (
                        <button key={u._id} onClick={() => add(u._id)} disabled={loading}
                            className="w-full flex items-center gap-2 px-2 py-2 text-left text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50">
                            <div className="w-7 h-7 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-[10px] font-medium text-emerald-200 shrink-0">
                                {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                        </button>
                    ))}
                    {query.length >= 2 && results.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-3">No users found</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
const ChatArea = ({ conversationId }: Props) => {
    const { user } = useAuth();
    const socket = useSocket();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [callLoading, setCallLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    const otherUser = conversation?.participants.find(p => p._id !== user?._id) || null;

    const fetchData = useCallback(async () => {
        if (!conversationId) return;
        setLoading(true);
        try {
            const [msgRes, convRes] = await Promise.all([
                api.get(`/conversations/${conversationId}/messages`),
                api.get('/conversations')
            ]);
            setMessages(msgRes.data.messages);
            const conv = convRes.data.conversations.find((c: Conversation) => c._id === conversationId);
            if (conv) setConversation(conv);
        } catch { /* silent */ } finally { setLoading(false); }
    }, [conversationId]);

    useEffect(() => {
        setMessages([]);
        setConversation(null);
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close more-menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
                setShowMoreMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Socket: real-time messages
    useEffect(() => {
        if (!socket || !conversationId) return;

        const onMessage = ({ conversationId: cid, message }: { conversationId: string; message: Message }) => {
            if (cid !== conversationId) return;
            setMessages(prev => [...prev, message]);
            socket.emit('chat:read', { conversationId });
        };

        const onSent = ({ conversationId: cid, message, tempId }: { conversationId: string; message: Message; tempId?: string }) => {
            if (cid !== conversationId) return;
            setMessages(prev =>
                tempId
                    ? prev.map(m => m._id === tempId ? message : m)
                    : [...prev.filter(m => m._id !== message._id), message]
            );
        };

        const onError = ({ tempId }: { message: string; tempId?: string }) => {
            if (tempId) setMessages(prev => prev.filter(m => m._id !== tempId));
        };

        socket.on('chat:message', onMessage);
        socket.on('chat:sent', onSent);
        socket.on('chat:error', onError);
        socket.emit('chat:read', { conversationId });

        return () => {
            socket.off('chat:message', onMessage);
            socket.off('chat:sent', onSent);
            socket.off('chat:error', onError);
        };
    }, [socket, conversationId]);

    // ── Send text message ────────────────────────────────────────────────────
    const sendMessage = (content?: string) => {
        const text = (content ?? input).trim();
        if (!text || !conversationId) return;
        if (!content) setInput('');

        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            _id: tempId,
            content: text,
            sender: user as User,
            type: 'text',
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        if (socket?.connected) {
            socket.emit('chat:send', { conversationId, content: text, type: 'text', tempId });
        } else {
            api.post(`/conversations/${conversationId}/messages`, { content: text })
                .then(({ data }) => setMessages(prev => prev.map(m => m._id === tempId ? data.message : m)))
                .catch(() => setMessages(prev => prev.filter(m => m._id !== tempId)));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    // ── File upload ──────────────────────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !conversationId) return;
        e.target.value = '';

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            // Let axios/browser set Content-Type with the multipart boundary automatically
            const { data } = await api.post('/upload', formData, {
                transformRequest: [(reqData: FormData, headers: Record<string, unknown>) => {
                    if (headers) delete headers['Content-Type'];
                    return reqData;
                }]
            });

            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const videoExts = ['mp4', 'mov', 'avi', 'webm'];
            const msgType = imageExts.includes(ext) ? 'image' : videoExts.includes(ext) ? 'video' : 'file';

            const tempId = `temp-${Date.now()}`;
            const tempMsg: Message = {
                _id: tempId,
                content: file.name,
                sender: user as User,
                type: msgType,
                fileUrl: data.fileUrl,
                fileName: file.name,
                fileSize: file.size,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);

            if (socket?.connected) {
                socket.emit('chat:send', {
                    conversationId,
                    content: file.name,
                    type: msgType,
                    fileUrl: data.fileUrl,
                    fileName: file.name,
                    fileSize: file.size,
                    tempId
                });
            } else {
                api.post(`/conversations/${conversationId}/messages`, {
                    content: file.name, type: msgType,
                    fileUrl: data.fileUrl, fileName: file.name, fileSize: file.size
                })
                    .then(({ data: d }) => setMessages(prev => prev.map(m => m._id === tempId ? d.message : m)))
                    .catch(() => setMessages(prev => prev.filter(m => m._id !== tempId)));
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'File upload failed';
            setUploadError(msg);
            setTimeout(() => setUploadError(''), 4000);
        } finally { setUploading(false); }
    };

    // ── Start meeting via video call button ──────────────────────────────────
    const startMeeting = async () => {
        if (!conversationId || !otherUser) return;
        setCallLoading(true);
        try {
            const title = conversation?.isGroup
                ? `Group call: ${conversation.groupName}`
                : `Call with ${otherUser.name}`;

            const { data } = await api.post('/meetings', {
                title,
                scheduledAt: new Date().toISOString()
            });
            await api.put(`/meetings/${data.meeting._id}/start`);

            // Send a "meeting invite" message so the other participant can join
            const meetingId = data.meeting.meetingId;
            if (socket?.connected) {
                socket.emit('chat:send', {
                    conversationId,
                    content: meetingId,
                    type: 'meeting',
                    tempId: `temp-${Date.now()}`
                });
            }

            router.push(`/dashboard/meet?meetingId=${meetingId}&autoJoin=true`);
        } catch { /* silent */ } finally { setCallLoading(false); }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────
    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initials = (name: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const getDisplayName = () => {
        if (!conversation) return 'Loading...';
        if (conversation.isGroup) return conversation.groupName;
        return otherUser?.name || 'Unknown';
    };

    const getSubtitle = () => {
        if (!conversation) return '';
        if (conversation.isGroup) return `${conversation.participants.length} members`;
        return otherUser?.email || '';
    };

    // ── Empty state ──────────────────────────────────────────────────────────
    if (!conversationId) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#15231D] text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-center mb-4">
                    <Send className="w-7 h-7 text-emerald-700" />
                </div>
                <h3 className="text-white font-medium text-lg">Your Messages</h3>
                <p className="text-gray-500 text-sm mt-1">Select a conversation or start a new chat</p>
            </div>
        );
    }

    // ── Message bubble renderer ──────────────────────────────────────────────
    const renderMessageContent = (msg: Message, isMe: boolean) => {
        // Meeting invite card
        if (msg.type === 'meeting') {
            return (
                <div className={`rounded-2xl overflow-hidden border ${isMe ? 'border-emerald-500/40' : 'border-[#2A4034]'} bg-[#1A2C24] min-w-[180px]`}>
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2A4034]">
                        <div className="w-6 h-6 rounded-full bg-emerald-700/40 flex items-center justify-center">
                            <Video className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-xs font-medium text-emerald-300">Video Meeting</span>
                    </div>
                    <div className="px-3 py-2">
                        <p className="text-xs text-gray-400 mb-2 font-mono">{msg.content}</p>
                        <button
                            onClick={() => router.push(`/dashboard/meet?meetingId=${msg.content}&autoJoin=true`)}
                            className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                            Join Meeting
                        </button>
                    </div>
                </div>
            );
        }

        // Image
        if (isImageType(msg.type, msg.fileName) && msg.fileUrl) {
            return (
                <div className="rounded-2xl overflow-hidden max-w-[240px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.fileUrl} alt={msg.fileName || 'image'}
                        className="w-full object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                    />
                    <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                        {formatTime(msg.createdAt)}
                    </span>
                </div>
            );
        }

        // Video
        if (isVideoType(msg.type, msg.fileName) && msg.fileUrl) {
            return (
                <div className="rounded-2xl overflow-hidden max-w-[280px]">
                    <video src={msg.fileUrl} controls className="w-full rounded-2xl" />
                    <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                        {formatTime(msg.createdAt)}
                    </span>
                </div>
            );
        }

        // File attachment
        if (msg.type === 'file' && msg.fileUrl) {
            return (
                <div>
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" download={msg.fileName}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${isMe ? 'bg-emerald-600/80 text-white' : 'bg-[#1A2C24] text-gray-200 border border-[#2A4034]'} hover:opacity-80 transition-opacity`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-emerald-900/50'}`}>
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-medium text-xs max-w-[160px]">{msg.fileName}</p>
                            {msg.fileSize && <p className="text-[10px] opacity-70">{formatBytes(msg.fileSize)}</p>}
                        </div>
                        <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </a>
                    <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                        {formatTime(msg.createdAt)}
                    </span>
                </div>
            );
        }

        // Sign language
        if (msg.type === 'sign_language' && msg.signLanguageData) {
            return (
                <div className={`max-w-[70%]`}>
                    <div className="flex items-center gap-1 mb-1 text-emerald-400 text-xs">
                        <Hand className="w-3 h-3" />
                        <span>Sign detected</span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-[#1A2C24] text-gray-200 rounded-bl-none border border-[#2A4034]'}`}>
                        {msg.content}
                    </div>
                    <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                        {formatTime(msg.createdAt)}
                    </span>
                </div>
            );
        }

        // Default: text
        return (
            <div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-[#1A2C24] text-gray-200 rounded-bl-none border border-[#2A4034]'}`}>
                    {msg.content}
                </div>
                <span className={`text-[10px] text-gray-500 mt-1 block ${isMe ? 'text-right pr-1' : 'pl-1'}`}>
                    {formatTime(msg.createdAt)}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#15231D] relative">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.csv"
                onChange={handleFileChange}
            />

            {/* Header */}
            <div className="h-16 border-b border-[#2A3430] flex items-center justify-between px-6 bg-[#1A231F]">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${conversation?.isGroup ? 'bg-violet-700/50 text-violet-100' : 'bg-emerald-700/50 text-emerald-100'}`}>
                        {initials(getDisplayName())}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">{getDisplayName()}</h2>
                        <p className="text-xs text-emerald-400">{getSubtitle()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <button
                        title="Voice call"
                        onClick={startMeeting}
                        disabled={callLoading || !conversation}
                        className="hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                    <button
                        title="Video call / Meeting"
                        onClick={startMeeting}
                        disabled={callLoading || !conversation}
                        className="hover:text-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Video className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-[#2A3430]" />

                    {/* More menu */}
                    <div className="relative" ref={moreMenuRef}>
                        <button onClick={() => setShowMoreMenu(v => !v)}
                            className="hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMoreMenu && (
                            <div className="absolute right-0 top-full mt-2 bg-[#1A231F] border border-[#2A3430] rounded-xl shadow-2xl py-1 w-44 z-50 text-sm">
                                {conversation?.isGroup && (
                                    <button
                                        onClick={() => { setShowAddMember(true); setShowMoreMenu(false); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-white/5 transition-colors"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> Add member
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        setShowMoreMenu(false);
                                        if (!conversationId) return;
                                        await api.delete(`/conversations/${conversationId}`);
                                        window.location.reload();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-900/10 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete chat
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="flex justify-center">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center">
                        <span className="text-xs text-gray-600 bg-[#1A231F] px-3 py-1.5 rounded-full border border-[#2A3430]">
                            No messages yet — say hello!
                        </span>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender?._id === user?._id;
                        return (
                            <div key={msg._id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                {!isMe && (
                                    <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 shrink-0">
                                        {initials(msg.sender?.name || '')}
                                    </div>
                                )}
                                <div className="max-w-[70%]">
                                    {conversation?.isGroup && !isMe && (
                                        <p className="text-[10px] text-gray-500 mb-0.5 pl-1">{msg.sender?.name}</p>
                                    )}
                                    {renderMessageContent(msg, isMe)}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Upload error */}
            {uploadError && (
                <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/40 text-red-400 text-xs">
                    {uploadError}
                </div>
            )}

            {/* Input bar */}
            <div className="p-4 border-t border-[#2A3430] bg-[#1A231F]">
                <div className="relative">
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelect={emoji => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
                <div className="bg-[#151b18] border border-[#2A3430] rounded-xl flex items-center p-2 gap-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
                    {/* Emoji */}
                    <button
                        onClick={() => setShowEmojiPicker(v => !v)}
                        className={`p-2 rounded-lg transition-colors ${showEmojiPicker ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                    >
                        <SmilePlus className="w-4 h-4" />
                    </button>

                    {/* Attach file */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-40"
                    >
                        {uploading
                            ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            : <Paperclip className="w-4 h-4" />
                        }
                    </button>

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none px-2"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Add member modal */}
            {showAddMember && conversation && (
                <AddMemberModal
                    conversationId={conversationId!}
                    currentParticipantIds={conversation.participants.map(p => p._id)}
                    onClose={() => setShowAddMember(false)}
                    onAdded={fetchData}
                />
            )}
        </div>
    );
};

export default ChatArea;
