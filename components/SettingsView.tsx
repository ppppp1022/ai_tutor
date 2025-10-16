import React from 'react';
import { Settings, Theme, Language, TutorSpeed } from '../types';

interface SettingsViewProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handleThemeChange = (theme: Theme) => {
    setSettings(prev => ({...prev, theme}));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100 text-center">Settings</h2>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8 space-y-8 border border-slate-200 dark:border-slate-700">
        
        {/* Personal Information Section */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-slate-700 pb-2">Personalize Tutor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input type="text" name="name" id="name" value={settings.name} onChange={handleChange} className="w-full input-style" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input type="number" name="age" id="age" value={settings.age} onChange={handleChange} className="w-full input-style" placeholder="Your age" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Interests & Goals</label>
              <textarea name="description" id="description" value={settings.description} onChange={handleChange} rows={3} className="w-full input-style" placeholder="e.g., I love talking about technology and movies. I want to improve my conversational fluency."></textarea>
            </div>
          </div>
        </section>

        {/* App Settings Section */}
        <section>
          <h3 className="text-xl font-semibold mb-4 text-sky-600 dark:text-sky-400 border-b border-slate-200 dark:border-slate-700 pb-2">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feedback Language</label>
              <select name="language" id="language" value={settings.language} onChange={handleChange} className="w-full input-style">
                <option value="ko">한국어 (Korean)</option>
                <option value="ja">日本語 (Japanese)</option>
                <option value="zh">中文 (Chinese)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme</label>
              <div className="flex gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                  <button onClick={() => handleThemeChange(Theme.LIGHT)} className={`flex-1 p-2 rounded-md text-sm transition-colors ${settings.theme === Theme.LIGHT ? 'bg-white shadow text-sky-600 font-semibold' : 'text-slate-600'}`}>Light</button>
                  <button onClick={() => handleThemeChange(Theme.DARK)} className={`flex-1 p-2 rounded-md text-sm transition-colors ${settings.theme === Theme.DARK ? 'bg-slate-800 shadow text-sky-400 font-semibold' : 'dark:text-slate-300'}`}>Dark</button>
              </div>
            </div>
             <div>
              <label htmlFor="speed" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tutor Speed</label>
              <select name="speed" id="speed" value={settings.speed} onChange={handleChange} className="w-full input-style">
                <option value="default">Default</option>
                <option value="slightly_slower">Slightly Slower</option>
                <option value="slower">Slower</option>
              </select>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};

// Add a simple base style for inputs to avoid repetition
const styles = document.createElement('style');
styles.innerHTML = `
  .input-style {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    background-color: #f1f5f9; /* slate-100 */
    border: 1px solid #cbd5e1; /* slate-300 */
    transition: all 0.2s;
  }
  .dark .input-style {
    background-color: #334155; /* slate-700 */
    border-color: #475569; /* slate-600 */
    color: #e2e8f0; /* slate-200 */
  }
  .input-style:focus {
    outline: none;
    border-color: #0ea5e9; /* sky-500 */
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.5);
  }
`;
document.head.appendChild(styles);

export default SettingsView;