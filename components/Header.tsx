import React from 'react';
import { View } from '../types';
import TutorIcon from './icons/TutorIcon';
import HistoryIcon from './icons/HistoryIcon';
import SettingsIcon from './icons/SettingsIcon';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex flex-col items-center justify-center gap-1 w-full h-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 rounded-lg";
  const activeClasses = "text-sky-600 dark:text-sky-400";
  const inactiveClasses = "text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 z-20">
      <div className="container mx-auto h-full px-4 flex justify-around items-center">
        <NavButton 
          label="Tutor"
          icon={<TutorIcon className="w-7 h-7" />}
          isActive={currentView === View.TUTOR}
          onClick={() => setCurrentView(View.TUTOR)}
        />
        <NavButton 
          label="History"
          icon={<HistoryIcon className="w-7 h-7" />}
          isActive={currentView === View.HISTORY}
          onClick={() => setCurrentView(View.HISTORY)}
        />
        <NavButton 
          label="Settings"
          icon={<SettingsIcon className="w-7 h-7" />}
          isActive={currentView === View.SETTINGS}
          onClick={() => setCurrentView(View.SETTINGS)}
        />
      </div>
    </nav>
  );
};

export default BottomNav;