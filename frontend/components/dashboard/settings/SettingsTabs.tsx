"use client";

interface SettingsTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const SettingsTabs = ({ activeTab, setActiveTab }: SettingsTabsProps) => {
    const tabs = [
        { id: 'account', label: 'Account' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'about', label: 'About' },
        { id: 'help', label: 'Help' },
    ];

    return (
        <div className="flex items-center gap-1 bg-[#1A231F] p-1 rounded-xl mb-8 border border-[#2A3430] w-full max-w-4xl">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
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

export default SettingsTabs;
