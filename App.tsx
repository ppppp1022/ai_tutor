
import React, { useState, useCallback } from 'react';
import { View, FeedbackItem } from './types';
import Header from './components/Header';
import TutorView from './components/TutorView';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.TUTOR);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

  const addFeedback = useCallback((item: FeedbackItem) => {
    setFeedbackHistory(prev => [item, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-grow container mx-auto p-4 md:p-6 flex">
        {currentView === View.TUTOR && <TutorView addFeedback={addFeedback} />}
        {currentView === View.HISTORY && <HistoryView feedbackHistory={feedbackHistory} />}
      </main>
      <footer className="text-center p-4 text-xs text-slate-500">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
