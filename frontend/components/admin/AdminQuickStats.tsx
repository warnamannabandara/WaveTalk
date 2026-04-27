"use client";

interface PeakHour {
    label: string;
    count: number;
    pct: number;
}

interface MeetingDuration {
    label: string;
    count: number;
    pct: number;
}

interface UserGrowth {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
}

interface AdminQuickStatsProps {
    peakHours: PeakHour[];
    meetingDuration: MeetingDuration[];
    userGrowth: UserGrowth;
    loading?: boolean;
}

const Skeleton = () => (
    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
);

const AdminQuickStats = ({ peakHours, meetingDuration, userGrowth, loading }: AdminQuickStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Peak Hours */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Peak Hours</h3>
                <div className="space-y-4">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                                <Skeleton />
                            </div>
                        ))
                        : peakHours.map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{item.label}</span>
                                    <span className="text-xs font-semibold text-emerald-400">{item.pct}%</span>
                                </div>
                                <div className="h-1 w-full bg-[#2A3430] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500/60 rounded-full transition-all"
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Meeting Duration */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">Meeting Duration</h3>
                <div className="space-y-4">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                                <Skeleton />
                            </div>
                        ))
                        : meetingDuration.map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{item.label}</span>
                                    <span className="text-xs font-semibold text-emerald-400">{item.pct}%</span>
                                </div>
                                <div className="h-1 w-full bg-[#2A3430] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500/60 rounded-full transition-all"
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* User Growth */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-6">User Growth</h3>
                <div className="space-y-4">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                                <Skeleton />
                            </div>
                        ))
                        : [
                            { label: 'This Week', val: userGrowth.thisWeek },
                            { label: 'This Month', val: userGrowth.thisMonth },
                            { label: 'This Year', val: userGrowth.thisYear },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">{item.label}</span>
                                <span className="text-xs font-semibold text-emerald-400">
                                    +{item.val}
                                </span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default AdminQuickStats;
