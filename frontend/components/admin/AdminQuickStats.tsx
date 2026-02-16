"use client";

const AdminQuickStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Peak Hours */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Peak Hours</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Morning (9-12)', val: '45%' },
                        { label: 'Afternoon (1-5)', val: '38%' },
                        { label: 'Evening (5-9)', val: '17%' },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{item.label}</span>
                            <span className="text-xs font-semibold text-emerald-400">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Meeting Duration */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Meeting Duration</h3>
                <div className="space-y-4">
                    {[
                        { label: '0-30 mins', val: '52%' },
                        { label: '30-60 mins', val: '33%' },
                        { label: '60+ mins', val: '15%' },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{item.label}</span>
                            <span className="text-xs font-semibold text-emerald-400">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Growth */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">User Growth</h3>
                <div className="space-y-4">
                    {[
                        { label: 'This Week', val: '+12' },
                        { label: 'This Month', val: '+48' },
                        { label: 'This Year', val: '+150' },
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{item.label}</span>
                            <span className="text-xs font-semibold text-emerald-400">{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminQuickStats;
