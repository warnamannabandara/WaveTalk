"use client";

const StatsCards = () => {
    const stats = [
        { label: 'Total Tasks', value: '5' },
        { label: 'Completed', value: '2' },
        { label: 'Meetings This Week', value: '5' },
    ];

    return (
        <div className="grid grid-cols-3 gap-6 mb-8 mt-6">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-[#1A231F] border border-[#2A3430] p-8 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <span className="text-4xl font-semibold text-emerald-500 block mb-2 group-hover:scale-110 transition-transform origin-left">{stat.value}</span>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
