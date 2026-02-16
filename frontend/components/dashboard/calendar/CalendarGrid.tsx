import React from 'react';

interface CalendarGridProps {
    currentDate: Date;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper to get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get start day of week (0-6)
    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

    // Create array for grid cells
    const slots = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        slots.push(<div key={`empty-${i}`} className="h-24 bg-white/5 bg-opacity-[0.02] rounded-lg border border-white/5 opacity-50"></div>);
    }
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && day === today.getDate();
        slots.push(
            <div
                key={`day-${day}`}
                className={`h-24 p-2 rounded-lg border transition-colors relative group
                    ${isToday
                        ? 'bg-emerald-900/20 border-emerald-500/50'
                        : 'bg-[#1A231F] border-white/5 hover:border-white/10'
                    }`}
            >
                <span className={`text-sm font-medium ${isToday ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {day}
                </span>

                {/* Example events placeholders - could be dynamic later */}
                {(day === 11 || day === 12 || day === 15) && (
                    <div className="mt-1 space-y-1">
                        <div className={`text-[10px] px-1.5 py-0.5 rounded truncate
                            ${day === 11 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}
                        `}>
                            {day === 11 ? '9:00 AM Standup' : 'Meeting'}
                        </div>
                        {day === 11 && (
                            <div className="text-[10px] px-1.5 py-0.5 rounded truncate bg-emerald-500/20 text-emerald-300">
                                2:00 PM Review
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Fill remaining slots to make the grid look balanced if needed (optional)
    const totalSlots = slots.length;
    const remaining = 35 - totalSlots > 0 ? 35 - totalSlots : (42 - totalSlots > 0 ? 42 - totalSlots : 0);

    for (let i = 0; i < remaining; i++) {
        slots.push(<div key={`next-empty-${i}`} className="h-24 bg-white/5 bg-opacity-[0.02] rounded-lg border border-white/5 opacity-50"></div>);
    }

    return (
        <div className="grid grid-cols-7 gap-2">
            {days.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                </div>
            ))}
            {slots}
        </div>
    );
};

export default CalendarGrid;
