import { Search, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface DocumentHeaderProps {
    onSearch: (query: string) => void;
    onAddNote: () => void;
}

export const DocumentHeader = ({ onSearch, onAddNote }: DocumentHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
                <p className="text-gray-400 text-sm">Access your meeting documents</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-10 bg-[#1A231F] border-[#2A3430] focus:ring-emerald-500/20"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                <Button onClick={onAddNote} className="gap-2 bg-[#4D8C75] hover:bg-[#3D7260] text-white">
                    <Plus className="w-4 h-4" />
                    Add Note
                </Button>
            </div>
        </div>
    );
};
