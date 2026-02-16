"use client";

interface AnalyticsTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AnalyticsTabs = ({ activeTab, setActiveTab }: AnalyticsTabsProps) => {
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'projects', label: 'Projects' },
        { id: 'teams', label: 'Teams' },
    ];

    return (
        <div className="flex items-center gap-1 bg-[#1A231F] p-1 rounded-xl mb-8 border border-[#2A3430] w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-[#2A3430] text-emerald-400 border border-white/5'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AnalyticsTabs;
