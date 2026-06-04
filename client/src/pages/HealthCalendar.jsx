import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '../store/healthStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, parseISO, isValid } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Save, Plus, MessageSquare } from 'lucide-react';

export default function HealthCalendar() {
  const { periodLogs } = useHealthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [noteText, setNoteText] = useState('');
  const [dailyLogs, setDailyLogs] = useState(() => {
    const saved = localStorage.getItem('herverse-calendar-notes');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('herverse-calendar-notes', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  // Calendar math
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 (Sun) to 6 (Sat)

  // Empty slots for padding the calendar grid
  const padSlots = Array.from({ length: startDayOfWeek });

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    setDailyLogs({
      ...dailyLogs,
      [dateKey]: {
        note: noteText,
        loggedAt: new Date().toISOString()
      }
    });
    setNoteText('');
  };

  const handleDeleteNote = (dateKey) => {
    const updated = { ...dailyLogs };
    delete updated[dateKey];
    setDailyLogs(updated);
  };

  // Determine if a date falls in cycle categories
  // For mock calculations, let's look at periodLogs or use a simple cycle interval
  const getDateClassification = (date) => {
    // If we have actual periodLogs, find matching logs
    let classification = { isPeriod: false, isFertile: false, isOvulation: false };

    // Default mock cycle predictions based on 28-day cycle if no logs exist
    // Let's check periodLogs first
    if (periodLogs.length > 0) {
      const latestPeriod = parseISO(periodLogs[0].startDate);
      if (isValid(latestPeriod)) {
        // Calculate difference in days modulo 28
        const diff = Math.floor((date.getTime() - latestPeriod.getTime()) / (24 * 60 * 60 * 1000));
        if (diff >= 0) {
          const cycleDay = (diff % 28) + 1;
          if (cycleDay >= 1 && cycleDay <= 5) {
            classification.isPeriod = true;
          } else if (cycleDay >= 10 && cycleDay <= 16) {
            classification.isFertile = true;
            if (cycleDay === 14) {
              classification.isOvulation = true;
            }
          }
        }
      }
    } else {
      // Mock days just so the calendar looks beautiful even if empty
      const day = date.getDate();
      if (day >= 2 && day <= 6) {
        classification.isPeriod = true;
      } else if (day >= 12 && day <= 17) {
        classification.isFertile = true;
        if (day === 15) {
          classification.isOvulation = true;
        }
      }
    }

    return classification;
  };

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateLogs = dailyLogs[selectedDateKey];
  const selectedClassification = getDateClassification(selectedDate);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Health Calendar</h2>
        <p className="text-muted text-sm">Visualize cycle projections, track daily wellness logs, and add notes to key calendar days.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Calendar Grid (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            {/* Header controls */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-bold text-gradient">{format(currentDate, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-white border border-primary/10 hover:bg-primary/5 text-primary shadow-sm">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNextMonth} className="p-2 rounded-xl bg-white border border-primary/10 hover:bg-primary/5 text-primary shadow-sm">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center font-bold text-sm text-muted mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {padSlots.map((_, idx) => <div key={`pad-${idx}`} className="h-16 md:h-20" />)}
              
              {daysInMonth.map((day) => {
                const classifications = getDateClassification(day);
                const isSelected = isSameDay(day, selectedDate);
                const hasNote = !!dailyLogs[format(day, 'yyyy-MM-dd')];

                return (
                  <button 
                    key={day.toString()}
                    onClick={() => { setSelectedDate(day); setNoteText(dailyLogs[format(day, 'yyyy-MM-dd')]?.note || ''); }}
                    className={`h-16 md:h-20 rounded-2xl border flex flex-col justify-between p-2 relative transition-all-smooth ${
                      isSelected 
                        ? 'bg-primary/15 border-primary shadow-sm scale-105 z-10' 
                        : 'bg-white/90 border-primary/5 hover:bg-primary/5 hover:border-primary/20'
                    }`}
                  >
                    {/* Day number */}
                    <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-textMain'}`}>{day.getDate()}</span>
                    
                    {/* Indicators */}
                    <div className="flex gap-1.5 justify-center w-full mb-1">
                      {classifications.isPeriod && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" title="Menstruation" />}
                      {classifications.isFertile && <span className={`w-2.5 h-2.5 rounded-full ${classifications.isOvulation ? 'bg-amber-400' : 'bg-primary'} shadow-sm`} title={classifications.isOvulation ? 'Ovulation Day' : 'Fertile Window'} />}
                      {hasNote && <MessageSquare className="text-muted" size={10} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-primary/10 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /> <span>Menstrual Flow</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /> <span>Fertile Window</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400" /> <span>Peak Ovulation</span></div>
              <div className="flex items-center gap-2"><MessageSquare size={12} className="text-muted" /> <span>Logged Notes</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Date Notes and Logging (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Calendar className="text-primary" size={22} /> Date Info
            </h3>
            <p className="text-sm font-bold text-primary mb-4">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>

            {/* Day classification details */}
            <div className="space-y-3 mb-6">
              {selectedClassification.isPeriod && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                  🌸 Menstruation day predicted. Focus on iron intake and restful sleep.
                </div>
              )}
              {selectedClassification.isFertile && (
                <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-xl text-xs font-semibold">
                  ✨ Fertile Window active. Estrogen is high, raising endurance and energy.
                </div>
              )}
              {selectedClassification.isOvulation && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-xl text-xs font-semibold">
                  🔥 Ovulation peak predicted. Excellent day for physical activity.
                </div>
              )}
              {!selectedClassification.isPeriod && !selectedClassification.isFertile && (
                <div className="bg-primary/5 border border-primary/10 text-muted p-3 rounded-xl text-xs font-medium">
                  🍃 Luteal / Follicular quiet phase. Keep up regular wellness habits!
                </div>
              )}
            </div>

            {/* Daily note Form */}
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Add Note for this day</label>
                <textarea 
                  rows="3" 
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="e.g. Felt cramps in morning, did 30 mins yoga..."
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none focus:border-primary resize-none placeholder-muted/50"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-95 shadow active:scale-95 transition-all-smooth flex items-center justify-center gap-1.5"
              >
                <Save size={16} /> Save Day Log
              </button>
            </form>
          </div>

          {/* Notes display */}
          {selectedDateLogs && (
            <div className="glass-card p-6 border-primary/20 shadow-sm relative">
              <h4 className="font-bold text-sm text-textMain mb-2">Saved Log:</h4>
              <p className="text-sm text-textMain leading-relaxed break-words">{selectedDateLogs.note}</p>
              <button 
                onClick={() => handleDeleteNote(selectedDateKey)}
                className="text-[10px] text-red-500 font-bold hover:underline mt-4 block"
              >
                Delete Log
              </button>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
