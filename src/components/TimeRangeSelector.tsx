
import React from 'react';
import { CalendarDaysIcon } from './Icons';

export type TimeRange = 7 | 14 | 30 | 90;

interface TimeRangeSelectorProps {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ selectedRange, onRangeChange }) => {
    const options: TimeRange[] = [7, 14, 30, 90];

    return (
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg w-fit">
            <div className="pl-2 pr-1 text-slate-400">
                <CalendarDaysIcon className="w-4 h-4" />
            </div>
            {options.map((range) => (
                <button
                    key={range}
                    onClick={() => onRangeChange(range)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                        selectedRange === range
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {range}D
                </button>
            ))}
        </div>
    );
};

export default TimeRangeSelector;
