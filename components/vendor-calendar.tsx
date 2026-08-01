'use client';

import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
export interface UnavailableSlot {
  id: string;
  vendor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at?: string;
}

interface VendorCalendarProps {
  unavailableSlots: UnavailableSlot[];
  onAddSlot: (dates: string[], startTime: string, endTime: string) => Promise<void>;
  onClearSlots: (dates: string[]) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export function VendorCalendar({ unavailableSlots, onAddSlot, onClearSlots, onDeleteSlot, isSubmitting }: VendorCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [lastSelectedDate, setLastSelectedDate] = useState<string | null>(null);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [slotToDelete, setSlotToDelete] = useState<UnavailableSlot | null>(null);

  // Generate calendar days
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date, event: React.MouseEvent) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let newSelection = [...selectedDates];

    if (event.shiftKey && lastSelectedDate) {
      // Range selection
      const start = new Date(lastSelectedDate);
      const end = date;
      const range = eachDayOfInterval({
        start: start < end ? start : end,
        end: start > end ? start : end
      }).map(d => format(d, 'yyyy-MM-dd'));

      range.forEach(d => {
        if (!newSelection.includes(d)) newSelection.push(d);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle single
      if (newSelection.includes(dateStr)) {
        newSelection = newSelection.filter(d => d !== dateStr);
      } else {
        newSelection.push(dateStr);
      }
    } else {
      // Single select (or deselect if already selected and only one)
      if (newSelection.length === 1 && newSelection[0] === dateStr) {
        newSelection = [];
      } else {
        newSelection = [dateStr];
      }
    }

    setSelectedDates(newSelection);
    setLastSelectedDate(dateStr);
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setLastSelectedDate(null);
  };

  // Determine status for selected dates
  const isAllDayAvailable = selectedDates.length > 0 && selectedDates.every(date => {
    return !unavailableSlots.some(slot => slot.date === date);
  });

  const isAllDayUnavailable = selectedDates.length > 0 && selectedDates.every(date => {
    return unavailableSlots.some(slot => slot.date === date && slot.start_time.startsWith('00:00') && slot.end_time.startsWith('23:59'));
  });

  const handleToggleAvailableAllDay = async () => {
    if (isAllDayAvailable) return; // Already available
    await onClearSlots(selectedDates);
  };

  const handleToggleUnavailableAllDay = async () => {
    if (isAllDayUnavailable) {
      // If turning off, clear the full day slots
      await onClearSlots(selectedDates);
    } else {
      // If turning on, clear existing and add 00:00-23:59
      await onClearSlots(selectedDates);
      await onAddSlot(selectedDates, '00:00', '23:59');
    }
  };

  const handleAddCustomSlot = async () => {
    if (!startTime || !endTime) return;
    await onAddSlot(selectedDates, startTime, endTime);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.12)] overflow-hidden flex flex-col">
      {/* Calendar Header */}
      <div className="p-6 border-b border-[rgba(15,23,42,0.08)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-[#0F172A]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-white rounded-md border border-[rgba(15,23,42,0.12)] shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 text-gray-600 rounded-l-md transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-gray-200"></div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 text-gray-600 rounded-r-md transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-white border border-gray-200"></div> Available</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200"></div> Partial</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-50 border border-red-200"></div> Unavailable</div>
        </div>
      </div>

      {/* Toolbar (Appears when dates are selected) */}
      {selectedDates.length > 0 && (
        <div className="bg-[#1B2740] p-4 text-white flex flex-col lg:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-2">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
              <button onClick={clearSelection} className="ml-2 p-0.5 hover:bg-white/20 rounded-full transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Available All Day</span>
              <button
                onClick={handleToggleAvailableAllDay}
                disabled={isSubmitting}
                className={`w-12 h-6 rounded-full relative transition-colors ${isAllDayAvailable ? 'bg-green-500' : 'bg-white/20'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isAllDayAvailable ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Unavailable All Day</span>
              <button
                onClick={handleToggleUnavailableAllDay}
                disabled={isSubmitting}
                className={`w-12 h-6 rounded-full relative transition-colors ${isAllDayUnavailable ? 'bg-red-500' : 'bg-white/20'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${isAllDayUnavailable ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/20 hidden lg:block"></div>

            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              disabled={isSubmitting || isAllDayUnavailable}
              className="bg-[#E8960C] hover:bg-[#F5A929] text-[#0F172A] font-bold"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Unavailable Time Slot
            </Button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex-1 min-h-[600px] flex flex-col bg-gray-50">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-[rgba(15,23,42,0.08)] bg-white">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-auto">
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDates.includes(dateStr);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            // Get slots for this day
            const daySlots = unavailableSlots.filter(s => s.date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
            const hasFullDay = daySlots.some(s => s.start_time.startsWith('00:00') && s.end_time.startsWith('23:59'));
            const isPartiallyAvailable = daySlots.length > 0 && !hasFullDay;

            // Background color logic
            let bgClass = "bg-white";
            if (!isCurrentMonth) bgClass = "bg-gray-50/50";
            if (hasFullDay) bgClass = "bg-red-50/80";
            else if (isPartiallyAvailable) bgClass = "bg-amber-50/80";

            return (
              <div
                key={dateStr}
                onClick={(e) => handleDateClick(day, e)}
                className={`min-h-[120px] p-2 border-r border-b border-[rgba(15,23,42,0.04)] relative group transition-colors cursor-pointer select-none
                  ${bgClass}
                  ${isSelected ? 'ring-2 ring-inset ring-[#E8960C] bg-orange-50/30' : 'hover:bg-gray-50'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                    ${isToday(day) ? 'bg-[#1B2740] text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2">
                  {hasFullDay ? (
                    <div className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded border border-red-200 truncate flex justify-between items-center group/slot">
                      Full Day
                      <button
                        onClick={(e) => { e.stopPropagation(); setSlotToDelete(daySlots.find(s => s.start_time.startsWith('00:00'))!); }}
                        className="opacity-0 group-hover/slot:opacity-100 p-0.5 hover:bg-red-200 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    daySlots.map(slot => (
                      <div
                        key={slot.id}
                        className="px-2 py-1 bg-amber-100 text-amber-900 text-[11px] font-medium rounded border border-amber-200 truncate flex justify-between items-center group/slot"
                      >
                        <span>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSlotToDelete(slot); }}
                          className="opacity-0 group-hover/slot:opacity-100 p-0.5 hover:bg-amber-200 rounded shrink-0 ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Unavailable Time</DialogTitle>
            <DialogDescription>
              Set specific hours you are booked for the {selectedDates.length} selected date(s).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCustomSlot} disabled={isSubmitting} className="bg-[#E8960C] hover:bg-[#F5A929] text-[#0F172A] font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Unavailable Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!slotToDelete} onOpenChange={(open) => !open && setSlotToDelete(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove Time Slot?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this unavailable time slot? You will be marked as available during this time.
            </DialogDescription>
          </DialogHeader>
          {slotToDelete && (
            <div className="py-4 px-4 bg-gray-50 rounded-lg border border-gray-100 my-2 text-sm font-medium">
              {format(parseISO(slotToDelete.date), 'MMMM do, yyyy')} <br />
              <span className="text-gray-500 mt-1 block">
                {slotToDelete.start_time.startsWith('00:00') && slotToDelete.end_time.startsWith('23:59')
                  ? 'Full Day'
                  : `${slotToDelete.start_time.substring(0, 5)} to ${slotToDelete.end_time.substring(0, 5)}`}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotToDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (slotToDelete) {
                  await onDeleteSlot(slotToDelete.id);
                  setSlotToDelete(null);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
