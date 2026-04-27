'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Plus, Users, Archive, Bell, BellOff, Trash2, CheckCheck, Circle, X, ChevronDown, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';

interface Participant {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    status: string;
}

interface Message {
    _id: string;
    content: string;
    sender: { _id: string };
    createdAt: string;
    type?: string;
}

interface Conversation {
    _id: string;
    participants: Participant[];
    lastMessage: Message | null;
    lastMessageAt: string;
    unreadCount: Record<string, number>;
    isGroup: boolean;
    groupName: string;
    mutedBy: string[];
    archivedBy: string[];
}

interface Props {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

type FilterMode = 'all' | 'unread' | 'archived';

interface CtxMenu {
    convId: string;
    x: number;
    y: number;
    isMuted: boolean;
    isArchived: boolean;
    unread: number;
}

const MessageList = ({ selectedId, onSelect }: Props) => {
    const { user } = useAuth();
    const socket = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterMode>('all');

    // New chat
    const [showNewChat, setShowNewChat] = useState(false);
    const [newChatQuery, setNewChatQuery] = useState('');
    const [newChatLoading, setNewChatLoading] = useState(false);
    const [searchUsers, setSearchUsers] = useState<Participant[]>([]);

    // Group creation
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupMemberQuery, setGroupMemberQuery] = useState('');
    const [groupMemberResults, setGroupMemberResults] = useState<Participant[]>([]);
    const [groupMembers, setGroupMembers] = useState<Participant[]>([]);
    const [groupLoading, setGroupLoading] = useState(false);
    const [groupError, setGroupError] = useState('');

    // Context menu
    const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
    const ctxRef = useRef<HTMLDivElement>(null);

    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations');
            setConversations(data.conversations);
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    // Close context menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ctxRef.current && !ctxRef.current.contains(e.target as Node)) {
                setCtxMenu(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handler = ({ conversationId, message }: { conversationId: string; message: Message }) => {
            setConversations(prev => {
                const exists = prev.find(c => c._id === conversationId);
                if (!exists) { fetchConversations(); return prev; }
                return prev.map(c =>
                    c._id === conversationId
                        ? {
                            ...c,
                            lastMessage: message,
                            lastMessageAt: message.createdAt,
                            unreadCount: conversationId === selectedId
                                ? c.unreadCount
                                : { ...c.unreadCount, [user!._id]: (c.unreadCount[user!._id] || 0) + 1 }
                        }
                        : c
                ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
            });
        };
        socket.on('chat:message', handler);
        return () => { socket.off('chat:message', handler); };
    }, [socket, selectedId, user, fetchConversations]);

    const getOther = (conv: Conversation) =>
        conv.participants.find(p => p._id !== user?._id) || conv.participants[0];

    const getDisplayName = (conv: Conversation) =>
        conv.isGroup ? conv.groupName : (getOther(conv)?.name || 'Unknown');

    const initials = (name: string) =>
        name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'now';
        if (m < 60) return `${m}m`;
        if (m < 1440) return `${Math.floor(m / 60)}h`;
        return new Date(iso).toLocaleDateString();
    };

    const isMuted = (conv: Conversation) =>
        !!user && conv.mutedBy?.map(String).includes(user._id);

    const isArchived = (conv: Conversation) =>
        !!user && conv.archivedBy?.map(String).includes(user._id);

    const getLastMessagePreview = (conv: Conversation) => {
        if (!conv.lastMessage) return 'No messages yet';
        const t = conv.lastMessage.type;
        if (t === 'image') return '📷 Image';
        if (t === 'file') return '📎 File';
        if (t === 'video') return '🎬 Video';
        if (t === 'meeting') return '📹 Video meeting';
        return conv.lastMessage.content || 'No messages yet';
    };

    // Filter conversations
    const filtered = conversations.filter(c => {
        const name = getDisplayName(c).toLowerCase();
        if (!name.includes(search.toLowerCase())) return false;
        if (filter === 'archived') return isArchived(c);
        if (filter === 'unread') return !isArchived(c) && (user ? (c.unreadCount?.[user._id] || 0) > 0 : false);
        return !isArchived(c); // 'all'
    });

    // ── New 1:1 chat ──
    const startNewChat = async (participant: Participant) => {
        setNewChatLoading(true);
        try {
            const { data } = await api.post('/conversations/by-email', { email: participant.email });
            setConversations(prev =>
                prev.find(c => c._id === data.conversation._id) ? prev : [data.conversation, ...prev]
            );
            onSelect(data.conversation._id);
            setShowNewChat(false);
            setNewChatQuery('');
            setSearchUsers([]);
        } catch { /* silent */ } finally { setNewChatLoading(false); }
    };

    const handleSearchUsers = async (q: string) => {
        setNewChatQuery(q);
        if (q.length < 2) { setSearchUsers([]); return; }
        try {
            const { data } = await api.get(`/users?search=${encodeURIComponent(q)}`);
            setSearchUsers(data.users.filter((u: Participant) => u._id !== user?._id));
        } catch { /* silent */ }
    };

    // ── Group creation ──
    const handleGroupMemberSearch = async (q: string) => {
        setGroupMemberQuery(q);
        if (q.length < 2) { setGroupMemberResults([]); return; }
        try {
            const { data } = await api.get(`/users?search=${encodeURIComponent(q)}`);
            setGroupMemberResults(data.users.filter((u: Participant) =>
                u._id !== user?._id && !groupMembers.find(m => m._id === u._id)
            ));
        } catch { /* silent */ }
    };

    const addGroupMember = (p: Participant) => {
        setGroupMembers(prev => prev.find(m => m._id === p._id) ? prev : [...prev, p]);
        setGroupMemberQuery('');
        setGroupMemberResults([]);
    };

    const removeGroupMember = (id: string) =>
        setGroupMembers(prev => prev.filter(m => m._id !== id));

    const createGroup = async () => {
        if (!groupName.trim() || groupMembers.length < 1) return;
        setGroupLoading(true);
        setGroupError('');
        try {
            const { data } = await api.post('/conversations/group', {
                groupName: groupName.trim(),
                participantIds: groupMembers.map(m => m._id)
            });
            setConversations(prev => [data.conversation, ...prev]);
            onSelect(data.conversation._id);
            setShowCreateGroup(false);
            setGroupName('');
            setGroupMembers([]);
            setGroupError('');
        } catch (err: unknown) {
            setGroupError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create group');
        } finally { setGroupLoading(false); }
    };

    // ── Context menu actions ──
    const openCtxMenu = (e: React.MouseEvent, conv: Conversation) => {
        e.preventDefault();
        const unread = user ? (conv.unreadCount?.[user._id] || 0) : 0;
        setCtxMenu({
            convId: conv._id,
            x: e.clientX,
            y: e.clientY,
            isMuted: isMuted(conv),
            isArchived: isArchived(conv),
            unread
        });
    };

    const ctxAction = async (action: 'mute' | 'archive' | 'delete' | 'read' | 'unread') => {
        if (!ctxMenu) return;
        const id = ctxMenu.convId;
        setCtxMenu(null);
        try {
            if (action === 'delete') {
                await api.delete(`/conversations/${id}`);
                setConversations(prev => prev.filter(c => c._id !== id));
                if (selectedId === id) onSelect('');
            } else if (action === 'mute') {
                const { data } = await api.put(`/conversations/${id}/mute`);
                setConversations(prev => prev.map(c => {
                    if (c._id !== id) return c;
                    const userId = user!._id;
                    return {
                        ...c,
                        mutedBy: data.muted
                            ? [...(c.mutedBy || []), userId]
                            : (c.mutedBy || []).filter(m => m !== userId)
                    };
                }));
            } else if (action === 'archive') {
                const { data } = await api.put(`/conversations/${id}/archive`);
                setConversations(prev => prev.map(c => {
                    if (c._id !== id) return c;
                    const userId = user!._id;
                    return {
                        ...c,
                        archivedBy: data.archived
                            ? [...(c.archivedBy || []), userId]
                            : (c.archivedBy || []).filter(m => m !== userId)
                    };
                }));
            } else if (action === 'read') {
                await api.put(`/conversations/${id}/read`);
                setConversations(prev => prev.map(c =>
                    c._id === id ? { ...c, unreadCount: { ...c.unreadCount, [user!._id]: 0 } } : c
                ));
            } else if (action === 'unread') {
                await api.put(`/conversations/${id}/unread`);
                setConversations(prev => prev.map(c =>
                    c._id === id ? { ...c, unreadCount: { ...c.unreadCount, [user!._id]: 1 } } : c
                ));
            }
        } catch { /* silent */ }
    };

    return (
        <div className="flex flex-col h-full bg-[#1A231F]">
            {/* Header */}
            <div className="p-4 border-b border-[#2A3430]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setShowCreateGroup(v => !v); setShowNewChat(false); setGroupError(''); }}
                            title="Create group"
                            className="text-gray-400 hover:text-emerald-400 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setShowNewChat(v => !v); setShowCreateGroup(false); }}
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            {showNewChat ? 'Cancel' : 'New Chat'}
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#151b18] text-sm text-white pl-10 pr-4 py-2.5 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-600"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 mt-3">
                    {(['all', 'unread', 'archived'] as FilterMode[]).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`flex-1 py-1 text-xs rounded-md font-medium capitalize transition-colors ${filter === f ? 'bg-emerald-700/40 text-emerald-300' : 'text-gray-500 hover:text-gray-300'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* New 1:1 chat panel */}
            {showNewChat && (
                <div className="p-3 border-b border-[#2A3430] bg-[#151b18]">
                    <p className="text-xs text-gray-400 mb-2">Search by name or email</p>
                    <input
                        type="text"
                        placeholder="Name or email..."
                        value={newChatQuery}
                        onChange={e => handleSearchUsers(e.target.value)}
                        className="w-full bg-[#1A231F] text-sm text-white px-3 py-2 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50"
                    />
                    <div className="mt-1 space-y-0.5">
                        {searchUsers.map(u => (
                            <button key={u._id} onClick={() => startNewChat(u)} disabled={newChatLoading}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
                                <div className="w-6 h-6 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-[10px] font-medium text-emerald-200 shrink-0">
                                    {initials(u.name)}
                                </div>
                                <span className="truncate">{u.name}</span>
                                <span className="text-gray-500 text-xs ml-auto truncate">{u.email}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Group creation panel */}
            {showCreateGroup && (
                <div className="p-3 border-b border-[#2A3430] bg-[#151b18] space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-medium">Create Group</p>
                        <button onClick={() => { setShowCreateGroup(false); setGroupError(''); }} className="text-gray-500 hover:text-gray-300">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder="Group name..."
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                        className="w-full bg-[#1A231F] text-sm text-white px-3 py-2 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50"
                    />

                    {/* Selected members */}
                    {groupMembers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {groupMembers.map(m => (
                                <span key={m._id} className="flex items-center gap-1 bg-emerald-900/40 border border-emerald-800/50 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                                    {m.name.split(' ')[0]}
                                    <button onClick={() => removeGroupMember(m._id)}><X className="w-2.5 h-2.5" /></button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Member search */}
                    <div className="relative">
                        <UserPlus className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Add members..."
                            value={groupMemberQuery}
                            onChange={e => handleGroupMemberSearch(e.target.value)}
                            className="w-full bg-[#1A231F] text-sm text-white pl-8 pr-3 py-2 rounded-lg border border-[#2A3430] focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>
                    {groupMemberResults.map(u => (
                        <button key={u._id} onClick={() => addGroupMember(u)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm text-gray-200 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="w-5 h-5 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-[9px] font-medium text-emerald-200 shrink-0">
                                {initials(u.name)}
                            </div>
                            <span className="truncate">{u.name}</span>
                        </button>
                    ))}

                    {groupError && (
                        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-2 py-1.5">{groupError}</p>
                    )}
                    <button
                        onClick={createGroup}
                        disabled={groupLoading || !groupName.trim() || groupMembers.length < 1}
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                    >
                        {groupLoading ? 'Creating...' : `Create Group (${groupMembers.length + 1})`}
                    </button>
                </div>
            )}

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[#151b18] rounded-lg animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                        <p className="text-gray-500 text-sm">
                            {filter === 'archived' ? 'No archived chats' : filter === 'unread' ? 'No unread messages' : 'No conversations yet'}
                        </p>
                        {filter === 'all' && <p className="text-gray-600 text-xs mt-1">Start a new chat above</p>}
                    </div>
                ) : (
                    filtered.map(conv => {
                        const displayName = getDisplayName(conv);
                        const unread = user ? (conv.unreadCount?.[user._id] || 0) : 0;
                        const isActive = conv._id === selectedId;
                        const muted = isMuted(conv);
                        const archived = isArchived(conv);

                        return (
                            <button
                                key={conv._id}
                                onClick={() => onSelect(conv._id)}
                                onContextMenu={e => openCtxMenu(e, conv)}
                                className={`w-full p-4 border-b border-[#2A3430] hover:bg-white/5 cursor-pointer transition-colors text-left border-l-4 ${isActive ? 'bg-emerald-900/10 border-l-emerald-500' : 'border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="relative shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${conv.isGroup ? 'bg-violet-900/50 border border-violet-800 text-violet-200' : 'bg-emerald-900/50 border border-emerald-800 text-emerald-200'}`}>
                                                {conv.isGroup ? <Users className="w-3.5 h-3.5" /> : initials(displayName)}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-sm font-semibold text-gray-200 truncate block">{displayName}</span>
                                            {conv.isGroup && (
                                                <span className="text-[10px] text-gray-500">{conv.participants.length} members</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                        {muted && <BellOff className="w-3 h-3 text-gray-600" />}
                                        {archived && <Archive className="w-3 h-3 text-gray-600" />}
                                        <span className="text-[10px] text-gray-500">
                                            {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pl-10">
                                    <p className="text-xs text-gray-400 truncate max-w-[150px]">
                                        {getLastMessagePreview(conv)}
                                    </p>
                                    {unread > 0 && (
                                        <span className="w-4 h-4 flex items-center justify-center bg-emerald-600 text-[10px] font-bold text-white rounded-full">
                                            {unread > 9 ? '9+' : unread}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Bottom new chat button */}
            <div className="p-4 border-t border-[#2A3430]">
                <button onClick={() => { setShowNewChat(true); setShowCreateGroup(false); }}
                    className="w-full py-2 border border-dashed border-[#2A3430] text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2">
                    <Plus className="w-3.5 h-3.5" /> New Chat
                </button>
            </div>

            {/* Context menu */}
            {ctxMenu && (
                <div
                    ref={ctxRef}
                    style={{ top: ctxMenu.y, left: Math.min(ctxMenu.x, window.innerWidth - 180) }}
                    className="fixed z-50 bg-[#1A231F] border border-[#2A3430] rounded-xl shadow-2xl py-1 w-44 text-sm"
                >
                    {ctxMenu.unread > 0 ? (
                        <button onClick={() => ctxAction('read')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-white/5 transition-colors">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Mark as read
                        </button>
                    ) : (
                        <button onClick={() => ctxAction('unread')}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-white/5 transition-colors">
                            <Circle className="w-3.5 h-3.5 text-blue-400" /> Mark as unread
                        </button>
                    )}
                    <button onClick={() => ctxAction('mute')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-white/5 transition-colors">
                        {ctxMenu.isMuted
                            ? <><Bell className="w-3.5 h-3.5 text-emerald-400" /> Unmute</>
                            : <><BellOff className="w-3.5 h-3.5 text-gray-400" /> Mute</>
                        }
                    </button>
                    <button onClick={() => ctxAction('archive')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-white/5 transition-colors">
                        <Archive className="w-3.5 h-3.5 text-yellow-400" />
                        {ctxMenu.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <div className="border-t border-[#2A3430] my-1" />
                    <button onClick={() => ctxAction('delete')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-900/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete chat
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageList;
