import React, { useState, useCallback, useEffect } from 'react';
import { View, SessionRecord, Settings, Theme } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import BottomNav from './components/Header';
import TutorView from './components/TutorView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.TUTOR);
  const [sessionHistory, setSessionHistory] = useLocalStorage<SessionRecord[]>('sessionHistory', []);
  const [settings, setSettings] = useLocalStorage<Settings>('userSettings', {
    name: '',
    age: '',
    description: '',
    language: 'ko',
    theme: Theme.DARK,
    speed: 'default'
  });

  const saveSession = useCallback((session: SessionRecord) => {
    setSessionHistory(prev => [session, ...prev.filter(s => s.id !== session.id)]);
  }, [setSessionHistory]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === Theme.LIGHT) {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [settings.theme]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-sky-500" xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.28 15.32c-.37.37-.88.58-1.42.58-.53 0-1.04-.21-1.42-.58-.78-.78-.78-2.05 0-2.83l4.95-4.95c.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83l-4.95 4.95zm7.13-7.17c-.78-.78-2.05-.78-2.83 0l-1.06 1.06c-.78.78-.78 2.05 0 2.83.37.37.88.58 1.42.58s1.04-.21 1.42-.58l1.06-1.06c.78-.78.78-2.05-.01-2.83z" />
            </svg>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gemini English Tutor</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 flex pb-24">
        {currentView === View.TUTOR && <TutorView saveSession={saveSession} settings={settings} />}
        {currentView === View.HISTORY && <HistoryView sessionHistory={sessionHistory} />}
        {currentView === View.SETTINGS && <SettingsView settings={settings} setSettings={setSettings} />}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;
