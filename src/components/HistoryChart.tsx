
import React, { useState, useMemo, useEffect } from 'react';
import type { HistoryEntry } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface DailyData {
    date: Date;
    totalCarbs: number;
    entries: HistoryEntry[];
}
interface HistoryChartProps {
  data: HistoryEntry[];
  onDayBarClick: (entries: HistoryEntry[]) => void;
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, onDayBarClick }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: DailyData } | null>(null);
  
  // Initialize with the date of the most recent entry if available, otherwise today.
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (data && data.length > 0) {
        return new Date(data[0].date);
    }
    return new Date();
  });

  // Safety check: If data changes significantly, reset view
  useEffect(() => {
     if (data.length > 0) {
         const year = currentMonth.getFullYear();
         const month = currentMonth.getMonth();
         const hasDataForCurrentView = data.some(entry => {
             const d = new Date(entry.date);
             return d.getMonth() === month && d.getFullYear() === year;
         });
         
         if (!hasDataForCurrentView) {
             setCurrentMonth(new Date(data[0].date));
         }
     }
  }, [data, currentMonth]);

  const chartData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthDays: DailyData[] = Array.from({ length: daysInMonth }, (_, i) => ({
        date: new Date(year, month, i + 1),
        totalCarbs: 0,
        entries: []
    }));

    data.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
            const dayOfMonth = entryDate.getDate() - 1;
            if (monthDays[dayOfMonth]) {
                monthDays[dayOfMonth].totalCarbs += entry.totalCarbs;
                monthDays[dayOfMonth].entries.push(entry);
            }
        }
    });

    return monthDays;
  }, [data, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { top: 20, right: 20, bottom: 40, left: 70 }; // Increased left padding
  
  const maxCarbs = useMemo(() => {
    if (chartData.length === 0) return 0;
    const maxVal = Math.max(...chartData.map(d => d.totalCarbs));
    return Math.ceil(maxVal / 50) * 50 || 50; 
  }, [chartData]);

  const xScale = (index: number) => {
    return padding.left + (index * (chartWidth - padding.left - padding.right)) / chartData.length;
  };

  const yScale = (value: number) => {
    if (maxCarbs === 0) return chartHeight - padding.bottom;
    return chartHeight - padding.bottom - (value / maxCarbs) * (chartHeight - padding.top - padding.bottom);
  };
  
  const barWidth = useMemo(() => {
      if(chartData.length === 0) return 0;
      return (chartWidth - padding.left - padding.right) / chartData.length * 0.6; // Thinner bars for cleaner look
  }, [chartData.length]);

  const handleMouseOver = (e: React.MouseEvent<SVGRectElement>, day: DailyData, index: number) => {
    if (day.totalCarbs === 0) return;
    const x = xScale(index) + barWidth / 2;
    const y = yScale(day.totalCarbs) - 10;
    setTooltip({ x, y, day });
  };
  
  const handleMouseOut = () => {
    setTooltip(null);
  };
  
  const handleBarClick = (day: DailyData) => {
      if (day.entries.length > 0) {
          onDayBarClick(day.entries);
      }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2 shrink-0">
            <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronLeftIcon className="w-5 h-5 text-slate-500" />
            </button>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-center capitalize">
                Ingesta de Carbohidratos
            </h3>
             <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <ChevronRightIcon className="w-5 h-5 text-slate-500" />
            </button>
      </div>
      
      <p className="text-xs text-center text-slate-400 mb-2 shrink-0">{currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</p>

      <div className="flex-grow flex items-center justify-center overflow-hidden w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Grid Lines - Minimalist */}
            {Array.from({ length: 5 }).map((_, i) => {
                const y = chartHeight - padding.bottom - i * (chartHeight - padding.top - padding.bottom) / 4;
                const value = (i * maxCarbs) / 4;
                return (
                    <g key={i}>
                        <line x1={padding.left - 5} y1={y} x2={chartWidth - padding.right} y2={y} stroke="currentColor" strokeDasharray="0" className="text-slate-100 dark:text-slate-800" strokeWidth="1"/>
                        <text x={padding.left - 10} y={y + 3} textAnchor="end" fontSize="10" className="fill-slate-400 dark:fill-slate-500 font-mono">
                            {value.toFixed(0)}
                        </text>
                    </g>
                );
            })}
            
            {/* Bars */}
            {chartData.map((day, index) => {
                const dayNumber = index + 1;
                const showLabel = index % 5 === 0; // Show label every 5 days to avoid clutter
                const barHeight = (chartHeight - padding.bottom) - yScale(day.totalCarbs);
                
                return (
                <g key={index} onClick={() => handleBarClick(day)} className={day.entries.length > 0 ? "cursor-pointer group" : "cursor-default"}>
                    {/* Background hover rect */}
                    <rect 
                        x={xScale(index) - barWidth/2}
                        y={padding.top}
                        width={barWidth * 2}
                        height={chartHeight - padding.bottom - padding.top}
                        className="fill-transparent group-hover:fill-slate-50 dark:group-hover:fill-slate-800 transition-colors"
                    />
                    
                    <rect
                        x={xScale(index)}
                        y={yScale(day.totalCarbs)}
                        width={barWidth}
                        height={barHeight}
                        rx={barWidth / 2} // Rounded top corners
                        className="fill-brand-primary transition-all duration-200 group-hover:fill-brand-dark"
                        onMouseOver={(e) => handleMouseOver(e, day, index)}
                        onMouseOut={handleMouseOut}
                    />
                    
                    {showLabel && (
                        <text
                            x={xScale(index) + barWidth / 2}
                            y={chartHeight - padding.bottom + 15}
                            textAnchor="middle"
                            fontSize="10"
                            className="fill-slate-400 dark:fill-slate-500 font-medium"
                        >
                            {dayNumber}
                        </text>
                    )}
                </g>
                );
            })}
        </svg>
      </div>

      {tooltip && (
        <div 
          className="absolute bg-slate-800 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none transition-opacity duration-200 opacity-100 z-10"
          style={{ 
            left: `${tooltip.x * 100 / chartWidth}%`, 
            top: `${tooltip.y * 100 / chartHeight}%`,
            transform: `translate(-50%, -100%)`
          }}
        >
          <p className="font-bold mb-1">{tooltip.day.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
          <p>Total: <span className="font-mono font-bold text-brand-secondary">{tooltip.day.totalCarbs.toFixed(0)}g</span></p>
        </div>
      )}
    </div>
  );
};

export default HistoryChart;
