
import { FileText, Video, File, Download, Trash2, Edit2, Calendar, Tag, Mic, Eye } from 'lucide-react';
import { Button } from '../../ui/Button';

export interface Document {
    id: string;
    title: string;
    type: 'report' | 'note' | 'recording' | 'transcript' | 'other';
    date: string;
    size: string;
    description: string;
    status: 'past' | 'current' | 'upcoming';
    meetingTitle?: string;
    content?: string;
    fileUrl?: string;
}

interface DocumentRowProps {
    document: Document;
    onEdit?: (doc: Document) => void;
    onDelete?: (id: string) => void;
    onDownload?: (doc: Document) => void;
    onView?: (doc: Document) => void;
}

export const DocumentRow = ({ document, onEdit, onDelete, onDownload, onView }: DocumentRowProps) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'report':
                return <FileText className="w-5 h-5 text-emerald-400" />;
            case 'recording':
                return <Video className="w-5 h-5 text-blue-400" />;
            case 'transcript':
                return <Mic className="w-5 h-5 text-purple-400" />;
            case 'note':
            default:
                return <File className="w-5 h-5 text-orange-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'current':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
            case 'upcoming':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
            case 'past':
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'current': return 'Current';
            case 'upcoming': return 'Upcoming';
            case 'past': return 'Past';
            default: return status;
        }
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-[#1A231F] border border-[#2A3430] rounded-xl hover:bg-[#202B26] transition-all hover:border-emerald-500/30 mb-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#2A3430] flex items-center justify-center group-hover:bg-[#323D37] shrink-0">
                    {getIcon(document.type)}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                        {document.title}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                        {document.meetingTitle && (
                            <>
                                <span className="flex items-center gap-1 text-emerald-400/70 truncate max-w-45">
                                    <Tag className="w-3 h-3 shrink-0" />
                                    {document.meetingTitle}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-gray-600" />
                            </>
                        )}
                        {document.description && (
                            <>
                                <span className="truncate max-w-35">{document.description}</span>
                                <div className="w-1 h-1 rounded-full bg-gray-600" />
                            </>
                        )}
                        <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {document.date}
                        </span>
                        {document.size !== '—' && (
                            <>
                                <div className="w-1 h-1 rounded-full bg-gray-600" />
                                <span className="shrink-0">{document.size}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 ml-4 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                    {getStatusLabel(document.status)}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(document.type === 'transcript' || document.type === 'note') && onView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() => onView(document)}
                            title={`View ${document.type}`}
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    )}
                    {document.type === 'note' && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            onClick={() => onEdit(document)}
                            title="Edit note"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => onDownload?.(document)}
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => onDelete?.(document.id)}
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
