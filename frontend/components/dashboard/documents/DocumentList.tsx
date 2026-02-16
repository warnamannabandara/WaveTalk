
import { Document, DocumentRow } from './DocumentRow';

interface DocumentListProps {
    documents: Document[];
}

export const DocumentList = ({ documents }: DocumentListProps) => {
    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">No documents found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
            ))}
        </div>
    );
};
