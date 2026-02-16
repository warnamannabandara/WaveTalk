"use client";

const MetricCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* System Metrics */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">System Metrics</h3>
                <div className="h-[250px] w-full flex items-end justify-between px-2 relative">
                    {/* Placeholder for Area Chart */}
                    <div className="absolute inset-x-6 inset-y-12 bg-emerald-500/5 rounded-lg border border-emerald-500/10 flex items-center justify-center text-gray-500 text-sm italic">
                        [ Interactive Area Chart Visualization ]
                    </div>
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between h-full text-[10px] text-gray-600 absolute left-0 pr-2">
                        <span>160</span>
                        <span>120</span>
                        <span>80</span>
                        <span>40</span>
                        <span>0</span>
                    </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60"></div>
                        <span className="text-xs text-gray-400">users</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30"></div>
                        <span className="text-xs text-gray-400">meetings</span>
                    </div>
                </div>
            </div>

            {/* Feature Usage */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Feature Usage</h3>
                <div className="h-[250px] w-full flex items-end justify-around px-4 group">
                    {[
                        { label: 'Video Calls', val: 82 },
                        { label: 'Chat', val: 91 },
                        { label: 'Documents', val: 64 },
                        { label: 'Calendar', val: 75 },
                        { label: 'Analytics', val: 42 },
                    ].map((bar) => (
                        <div key={bar.label} className="flex flex-col items-center gap-3 w-12">
                            <div
                                className="w-full bg-emerald-600/40 border border-emerald-500/60 rounded-t-md hover:bg-emerald-600/60 transition-all cursor-pointer"
                                style={{ height: `${bar.val}%` }}
                            ></div>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{bar.label}</span>
                        </div>
                    ))}
                    {/* Y-Axis for Feature Usage */}
                    <div className="flex flex-col justify-between h-full text-[10px] text-gray-600 absolute left-[calc(50%+1rem)] pr-2">
                        <span>100</span>
                        <span>75</span>
                        <span>50</span>
                        <span>25</span>
                        <span>0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricCharts;
