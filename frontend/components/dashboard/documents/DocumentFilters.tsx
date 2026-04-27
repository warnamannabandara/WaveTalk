
interface DocumentFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    activeStatus: string;
    onStatusChange: (status: string) => void;
}

export const DocumentFilters = ({ activeFilter, onFilterChange, activeStatus, onStatusChange }: DocumentFiltersProps) => {
    const typeFilters = [
        { id: 'all', label: 'All Types' },
        { id: 'report', label: 'Reports' },
        { id: 'transcript', label: 'Transcripts' },
        { id: 'recording', label: 'Recordings' },
        { id: 'note', label: 'Notes' },
    ];

    const statusFilters = [
        { id: 'all', label: 'All' },
        { id: 'current', label: 'Current' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'past', label: 'Past' },
    ];

    return (
        <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {typeFilters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeFilter === filter.id
                                ? 'bg-[#2A3430] text-white border border-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {statusFilters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onStatusChange(filter.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${activeStatus === filter.id
                                ? filter.id === 'current'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : filter.id === 'upcoming'
                                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                        : filter.id === 'past'
                                            ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                            : 'bg-[#2A3430] text-white border-white/10'
                                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
