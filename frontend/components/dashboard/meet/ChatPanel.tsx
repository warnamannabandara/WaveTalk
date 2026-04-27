"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Paperclip, Download, FileText, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage, ChatFileData } from '@/hooks/useMeeting';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (text?: string, fileData?: ChatFileData) => void;
    onClose: () => void;
    currentUserId: string;
}

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ChatPanel = ({ messages, onSendMessage, onClose, currentUserId }: ChatPanelProps) => {
    const [text, setText] = useState('');
    const [fileError, setFileError] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSendMessage(text.trim());
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileError('');
        if (file.size > MAX_FILE_SIZE) {
            setFileError(`File too large (max ${formatSize(MAX_FILE_SIZE)})`);
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            onSendMessage(undefined, { name: file.name, mimeType: file.type, dataUrl, size: file.size });
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    return (
        <div className="flex flex-col bg-[#141B18] border border-[#2A3430] rounded-2xl overflow-hidden" style={{ height: '480px' }}>
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#2A3430]">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Chat</span>
                    {messages.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                            {messages.length}
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
                        <p className="text-sm text-gray-600">No messages yet</p>
                        <p className="text-xs text-gray-700 mt-1">Be the first to say something</p>
                    </div>
                )}

                {messages.map(msg => {
                    const isOwn = msg.senderId === currentUserId || msg.isLocal;
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                                {!isOwn && (
                                    <span className="text-[10px] text-emerald-400 font-semibold px-1">{msg.senderName}</span>
                                )}
                                {msg.text && (
                                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                        isOwn
                                            ? 'bg-emerald-600 text-white rounded-tr-sm'
                                            : 'bg-[#2A3430] text-gray-200 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                )}
                                {msg.fileData && (
                                    <div className={`px-3 py-2 rounded-2xl border text-xs ${
                                        isOwn
                                            ? 'bg-emerald-600/20 border-emerald-500/30 rounded-tr-sm'
                                            : 'bg-[#2A3430] border-white/5 rounded-tl-sm'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {msg.fileData.mimeType.startsWith('image/')
                                                ? <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                                : <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                            }
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{msg.fileData.name}</p>
                                                <p className="text-gray-500">{formatSize(msg.fileData.size)}</p>
                                            </div>
                                            <a
                                                href={msg.fileData.dataUrl}
                                                download={msg.fileData.name}
                                                className="ml-1 p-1 rounded text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                        {msg.fileData.mimeType.startsWith('image/') && (
                                            <div className="mt-2 rounded overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={msg.fileData.dataUrl}
                                                    alt={msg.fileData.name}
                                                    className="max-w-full max-h-32 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <span className={`text-[10px] text-gray-600 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                    {formatTime(msg.timestamp)}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* File error */}
            {fileError && (
                <div className="shrink-0 px-3 py-1.5 bg-red-900/20 border-t border-red-800/30">
                    <p className="text-xs text-red-400">{fileError}</p>
                </div>
            )}

            {/* Input area */}
            <div className="shrink-0 border-t border-[#2A3430] p-3 flex items-end gap-2">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                >
                    <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    className="flex-1 bg-[#1E2820] border border-[#2A3430] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                    style={{ minHeight: '38px', maxHeight: '80px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
