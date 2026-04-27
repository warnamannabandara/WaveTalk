'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentHeader } from '../../../components/dashboard/documents/DocumentHeader';
import { DocumentFilters } from '../../../components/dashboard/documents/DocumentFilters';
import { DocumentList } from '../../../components/dashboard/documents/DocumentList';
import { NoteModal } from '../../../components/dashboard/documents/NoteModal';
import { Document } from '../../../components/dashboard/documents/DocumentRow';
import api from '@/lib/api';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeStatus, setActiveStatus] = useState('all');
    const [error, setError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeFilter !== 'all') params.set('type', activeFilter);
            if (activeStatus !== 'all') params.set('status', activeStatus);
            if (searchQuery) params.set('search', searchQuery);
            const { data } = await api.get(`/documents?${params.toString()}`);
            const mapped: Document[] = data.documents.map((d: {
                _id: string;
                title: string;
                type: string;
                updatedAt: string;
                fileSize?: number;
                description?: string;
                status: string;
                content?: string;
                fileUrl?: string;
                meeting?: { title: string };
            }) => ({
                id: d._id,
                title: d.title,
                type: d.type as Document['type'],
                date: new Date(d.updatedAt).toLocaleDateString(),
                size: d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : '—',
                description: d.description || '',
                status: d.status as Document['status'],
                content: d.content || '',
                fileUrl: d.fileUrl || '',
                meetingTitle: d.meeting?.title || '',
            }));
            setDocuments(mapped);
        } catch {
            setError('Failed to load documents');
        } finally { setLoading(false); }
    }, [activeFilter, activeStatus, searchQuery]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

    const handleAddNote = () => {
        setEditingDoc(null);
        setModalMode('add');
        setModalOpen(true);
    };

    const handleSaveNote = async (title: string, content: string) => {
        if (modalMode === 'add') {
            await api.post('/documents', { title, type: 'note', content });
        } else if (editingDoc) {
            await api.put(`/documents/${editingDoc.id}`, { title, content });
        }
        fetchDocuments();
    };

    const handleEdit = (doc: Document) => {
        setEditingDoc(doc);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleView = (doc: Document) => {
        setEditingDoc(doc);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch {
            setError('Failed to delete document');
        }
    };

    const handleDownload = (doc: Document) => {
        if (doc.fileUrl) {
            window.open(doc.fileUrl, '_blank');
            return;
        }
        // Download text content as .txt
        const text = doc.content
            ? `${doc.title}\n${'='.repeat(doc.title.length)}\n\n${doc.content}`
            : doc.title;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <NoteModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveNote}
                initialTitle={editingDoc?.title ?? ''}
                initialContent={editingDoc?.content ?? ''}
                mode={modalMode}
            />

            <div className="p-8 h-full flex flex-col">
                <DocumentHeader onSearch={setSearchQuery} onAddNote={handleAddNote} />
                {error && (
                    <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}
                <div className="flex-1 bg-[#1A231F] rounded-2xl border border-[#2A3430] overflow-hidden flex flex-col">
                    <div className="p-6 flex-1 overflow-auto">
                        <DocumentFilters
                            activeFilter={activeFilter}
                            onFilterChange={setActiveFilter}
                            activeStatus={activeStatus}
                            onStatusChange={setActiveStatus}
                        />
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <DocumentList
                                documents={documents}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onDownload={handleDownload}
                                onView={handleView}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
