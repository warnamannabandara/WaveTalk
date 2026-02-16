import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, onPrevMonth, onNextMonth, onToday }) => {
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white">{month}</h2>
                <p className="text-emerald-400 font-medium">{year}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onPrevMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={onToday}
                    className="px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                >
                    Today
                </button>
                <button
                    onClick={onNextMonth}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CalendarHeader;
