'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, content: string) => Promise<void>;
    initialTitle?: string;
    initialContent?: string;
    mode: 'add' | 'edit' | 'view';
}

export const NoteModal = ({ isOpen, onClose, onSave, initialTitle = '', initialContent = '', mode }: NoteModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setContent(initialContent);
            setError('');
        }
    }, [isOpen, initialTitle, initialContent]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) { setError('Title is required'); return; }
        setSaving(true);
        setError('');
        try {
            await onSave(title.trim(), content.trim());
            onClose();
        } catch {
            setError('Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#1A231F] border border-[#2A3430] rounded-2xl shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A3430]">
                    <h2 className="text-lg font-semibold text-white">
                        {mode === 'add' ? 'Add Note' : mode === 'edit' ? 'Edit Note' : title || 'Preview'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 flex flex-col gap-4">
                    {error && mode !== 'view' && (
                        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2">{error}</p>
                    )}
                    {mode === 'view' ? (
                        <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {content || <span className="text-gray-500 italic">No content available.</span>}
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Note title..."
                                    className="bg-[#141C18] border-[#2A3430] focus:ring-emerald-500/20 text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your note here..."
                                    rows={6}
                                    className="w-full px-3 py-2 rounded-lg bg-[#141C18] border border-[#2A3430] text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#2A3430]">
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        {mode === 'view' ? 'Close' : 'Cancel'}
                    </Button>
                    {mode !== 'view' && (
                        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[#4D8C75] hover:bg-[#3D7260] text-white disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Note'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
