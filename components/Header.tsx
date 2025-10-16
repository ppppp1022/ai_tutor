
import React from 'react';
import { View } from '../types';
import TutorIcon from './icons/TutorIcon';
import HistoryIcon from './icons/HistoryIcon';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-400";
  const activeClasses = "bg-sky-600 text-white shadow-md";
  const inactiveClasses = "text-slate-300 hover:bg-slate-700";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.28 15.32c-.37.37-.88.58-1.42.58-.53 0-1.04-.21-1.42-.58-.78-.78-.78-2.05 0-2.83l4.95-4.95c.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83l-4.95 4.95zm7.13-7.17c-.78-.78-2.05-.78-2.83 0l-1.06 1.06c-.78.78-.78 2.05 0 2.83.37.37.88.58 1.42.58s1.04-.21 1.42-.58l1.06-1.06c.78-.78.78-2.05-.01-2.83z" />
          </svg>
          <h1 className="text-xl font-bold text-slate-100">Gemini English Tutor</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NavButton 
            label="Tutor"
            icon={<TutorIcon />}
            isActive={currentView === View.TUTOR}
            onClick={() => setCurrentView(View.TUTOR)}
          />
          <NavButton 
            label="History"
            icon={<HistoryIcon />}
            isActive={currentView === View.HISTORY}
            onClick={() => setCurrentView(View.HISTORY)}
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
