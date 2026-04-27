
import { FileText } from 'lucide-react';
import { Document, DocumentRow } from './DocumentRow';

interface DocumentListProps {
    documents: Document[];
    onEdit?: (doc: Document) => void;
    onDelete?: (id: string) => void;
    onDownload?: (doc: Document) => void;
    onView?: (doc: Document) => void;
}

const STATUS_GROUPS: { key: Document['status']; label: string; dotColor: string }[] = [
    { key: 'current', label: 'Current', dotColor: 'bg-emerald-400' },
    { key: 'upcoming', label: 'Upcoming', dotColor: 'bg-blue-400' },
    { key: 'past', label: 'Past', dotColor: 'bg-gray-500' },
];

export const DocumentList = ({ documents, onEdit, onDelete, onDownload, onView }: DocumentListProps) => {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-gray-400 text-sm">No documents found.</p>
                <p className="text-gray-600 text-xs mt-1">Documents from meetings will appear here automatically.</p>
            </div>
        );
    }

    const allInOneGroup = new Set(documents.map(d => d.status)).size === 1;

    return (
        <div className="space-y-6">
            {STATUS_GROUPS.map(({ key, label, dotColor }) => {
                const group = documents.filter(d => d.status === key);
                if (group.length === 0) return null;
                return (
                    <div key={key}>
                        {!allInOneGroup && (
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                                <div className="flex-1 h-px bg-[#2A3430]" />
                                <span className="text-xs text-gray-600">{group.length}</span>
                            </div>
                        )}
                        <div className="space-y-1">
                            {group.map(doc => (
                                <DocumentRow
                                    key={doc.id}
                                    document={doc}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onDownload={onDownload}
                                    onView={onView}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
