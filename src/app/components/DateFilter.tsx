import { useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export type DateRange = {
  start: string; // yyyy-MM-dd
  end: string;   // yyyy-MM-dd
  label: string;
};

interface DateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export function getToday(): DateRange {
  const today = format(new Date(), 'yyyy-MM-dd');
  return { start: today, end: today, label: 'Today' };
}

export function getYesterday(): DateRange {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  return { start: yesterday, end: yesterday, label: 'Yesterday' };
}

export function getTomorrow(): DateRange {
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  return { start: tomorrow, end: tomorrow, label: 'Tomorrow' };
}

export function getThisWeek(): DateRange {
  const start = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const end = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  return { start, end, label: 'This Week' };
}

export function getThisMonth(): DateRange {
  const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  return { start, end, label: 'This Month' };
}

export function getAllTime(): DateRange {
  return { start: '2000-01-01', end: '2099-12-31', label: 'All Time' };
}

export default function DateFilter({ dateRange, onDateRangeChange }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.start);
  const [customEnd, setCustomEnd] = useState(dateRange.end);

  const presets = [
    { label: 'Today', fn: getToday },
    { label: 'Yesterday', fn: getYesterday },
    { label: 'Tomorrow', fn: getTomorrow },
    { label: 'This Week', fn: getThisWeek },
    { label: 'This Month', fn: getThisMonth },
    { label: 'All Time', fn: getAllTime },
  ];

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onDateRangeChange({
        start: customStart,
        end: customEnd,
        label: customStart === customEnd
          ? format(new Date(customStart), 'MMM dd')
          : `${format(new Date(customStart), 'MMM dd')} – ${format(new Date(customEnd), 'MMM dd')}`,
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              onDateRangeChange(preset.fn());
              setShowCustom(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              dateRange.label === preset.label
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/50 hover:border-primary/30'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
            showCustom || (dateRange.label !== 'Today' && dateRange.label !== 'Yesterday' && dateRange.label !== 'Tomorrow' && dateRange.label !== 'This Week' && dateRange.label !== 'This Month' && dateRange.label !== 'All Time')
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
              : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/50 hover:border-primary/30'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="mt-3 p-4 bg-card border border-border/50 rounded-2xl shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">From</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border/60 rounded-xl text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground mt-5" />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">To</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border/60 rounded-xl text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="mt-5 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
