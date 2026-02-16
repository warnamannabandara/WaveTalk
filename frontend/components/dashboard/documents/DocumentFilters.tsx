
interface DocumentFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export const DocumentFilters = ({ activeFilter, onFilterChange }: DocumentFiltersProps) => {
    const filters = [
        { id: 'all', label: 'All Documents' },
        { id: 'report', label: 'Reports' },
        { id: 'note', label: 'Notes' },
        { id: 'recording', label: 'Recordings' },
    ];

    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {filters.map((filter) => (
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
    );
};
