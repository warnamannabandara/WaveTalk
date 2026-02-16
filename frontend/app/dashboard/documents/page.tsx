"use client";

import { useState } from 'react';
import { DocumentHeader } from '../../../components/dashboard/documents/DocumentHeader';
import { DocumentFilters } from '../../../components/dashboard/documents/DocumentFilters';
import { DocumentList } from '../../../components/dashboard/documents/DocumentList';
import { Document } from '../../../components/dashboard/documents/DocumentRow';

// Mock Data matching the screenshot
const initialDocuments: Document[] = [
    {
        id: '1',
        title: 'Q4 Performance Report',
        type: 'report',
        date: '2026-01-10',
        size: '2.4 MB',
        description: 'Quarterly Review',
        status: 'past'
    },
    {
        id: '2',
        title: 'Team Meeting Notes - Jan 11',
        type: 'note',
        date: '2026-01-11',
        size: '156 KB',
        description: 'Daily Standup',
        status: 'current'
    },
    {
        id: '3',
        title: 'Client Presentation Recording',
        type: 'recording',
        date: '2026-01-09',
        size: '124 MB',
        description: 'Client Demo',
        status: 'past'
    },
    {
        id: '4',
        title: 'Sprint Planning Transcript',
        type: 'report',
        date: '2026-01-08',
        size: '89 KB',
        description: 'Sprint Planning',
        status: 'past'
    },
    {
        id: '5',
        title: 'Design Review Notes',
        type: 'note',
        date: '2026-01-12',
        size: '203 KB',
        description: 'Design Review',
        status: 'upcoming'
    },
    {
        id: '6',
        title: 'Monthly Analytics Report',
        type: 'report',
        date: '2025-12-31',
        size: '3.1 MB',
        description: 'End of Year Review',
        status: 'past'
    },
    {
        id: '7',
        title: 'Team Retrospective Recording',
        type: 'recording',
        date: '2026-01-05',
        size: '98 MB',
        description: 'Retrospective',
        status: 'past'
    },
    {
        id: '8',
        title: 'Project Kickoff Notes',
        type: 'note',
        date: '2026-01-15',
        size: '178 KB',
        description: 'Project Alpha Kickoff',
        status: 'upcoming'
    }
];

export default function DocumentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredDocuments = initialDocuments.filter((doc) => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleAddNote = () => {
        console.log('Add Note clicked');
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <DocumentHeader onSearch={handleSearch} onAddNote={handleAddNote} />

            <div className="flex-1 bg-[#1A231F] rounded-2xl border border-[#2A3430] overflow-hidden flex flex-col">
                <div className="p-6 flex-1 overflow-auto">
                    <DocumentFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                    <DocumentList documents={filteredDocuments} />
                </div>
            </div>
        </div>
    );
}
