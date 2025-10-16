import React, { useState, useMemo } from 'react';
import { SessionRecord } from '../types';
import HistoryIcon from './icons/HistoryIcon';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const HistoryView: React.FC<{ sessionHistory: SessionRecord[] }> = ({ sessionHistory }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  const historyByDate = useMemo(() => {
    const map = new Map<string, { sessions: SessionRecord[], maxCombo: number }>();
    sessionHistory.forEach(session => {
      const entry = map.get(session.date);
      if (entry) {
        entry.sessions.push(session);
        entry.maxCombo = Math.max(entry.maxCombo, session.maxCombo);
      } else {
        map.set(session.date, { sessions: [session], maxCombo: session.maxCombo });
      }
    });
    return map;
  }, [sessionHistory]);

  const overallMaxCombo = useMemo(() => {
     return Math.max(1, ...Array.from(historyByDate.values()).map(d => d.maxCombo));
  }, [historyByDate]);
  
  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const selectedSessions = selectedDate ? historyByDate.get(selectedDate)?.sessions.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()) || [] : [];

  if (sessionHistory.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-500">
        <HistoryIcon className="w-24 h-24 mb-4 text-slate-400 dark:text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">No History Yet</h2>
        <p className="mt-2 max-w-md">Your session summaries and practice calendar will appear here after you complete a conversation.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100 text-center">Practice Calendar</h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Previous month">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{MONTH_NAMES[month]} {year}</h3>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Next month">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map(day => <div key={day} className="font-bold text-xs text-slate-500 dark:text-slate-400 py-2">{day}</div>)}
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`}></div>;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const data = historyByDate.get(dateStr);
            const combo = data?.maxCombo ?? 0;
            const opacity = combo > 0 ? Math.max(0.15, combo / overallMaxCombo) : 0;
            
            return (
              <div key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`relative flex items-center justify-center h-10 rounded-lg cursor-pointer transition-all duration-200 ${selectedDate === dateStr ? 'ring-2 ring-sky-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <div style={{ backgroundColor: `rgba(14, 165, 233, ${opacity})` }} className="absolute inset-0 rounded-lg transition-colors"></div>
                <span className="relative z-10 text-sm font-medium text-slate-700 dark:text-slate-200">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">
          {selectedDate ? `Sessions on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : 'Select a date'}
        </h3>
        {selectedSessions.length > 0 ? (
          <div className="space-y-4">
            {selectedSessions.map(session => (
              <div key={session.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 flex justify-between items-center shadow-md border border-slate-200 dark:border-slate-700 animate-fade-in">
                <p className="italic text-slate-600 dark:text-slate-300 pr-4">"{session.summary}"</p>
                <div className="text-center ml-4 flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                  <div className="font-bold text-sky-600 dark:text-sky-400 text-xs">MAX COMBO</div>
                  <div className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-200">{session.maxCombo}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-white dark:bg-slate-800 rounded-lg shadow-inner border border-dashed border-slate-300 dark:border-slate-700">
            <p>{selectedDate ? "No sessions recorded on this day." : "Select a day from the calendar to see your sessions."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
