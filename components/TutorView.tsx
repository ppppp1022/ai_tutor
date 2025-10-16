import React, { useRef, useEffect, useState } from 'react';
import { FeedbackItem, ConversationTurn, Settings, SessionRecord } from '../types';
import { useTutor } from '../hooks/useTutor';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface TutorViewProps {
  saveSession: (session: SessionRecord) => void;
  settings: Settings;
}

const FeedbackCard: React.FC<{ feedback: FeedbackItem, lang: string }> = ({ feedback, lang }) => (
  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 animate-fade-in border border-slate-200 dark:border-slate-700">
    <h3 className="text-lg font-semibold text-sky-500 dark:text-sky-400 mb-2">피드백 (Feedback)</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{feedback.originalText}"</p>
    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
      <span className="font-semibold">추천 문장 (Suggestion):</span> "{feedback.correctedText}"
    </p>
    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 dark:text-slate-300" lang={lang}>
      {feedback.comments.map((comment, i) => <li key={i}>{comment}</li>)}
    </ul>
  </div>
);

const ConversationBubble: React.FC<{ turn: ConversationTurn }> = ({ turn }) => {
  const isUser = turn.speaker === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-xl px-4 py-2 rounded-lg shadow ${isUser ? 'bg-sky-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
        <p>{turn.text}</p>
      </div>
    </div>
  );
};

const ComboCounter: React.FC<{ combo: number }> = ({ combo }) => {
    if (combo === 0) return null;
    return (
        <div className="absolute top-4 right-4 z-10 animate-fade-in">
            <div className="flex items-center gap-2 bg-slate-900/60 text-white py-1 px-3 rounded-full shadow-lg backdrop-blur-sm">
                <span className="text-sm font-bold text-sky-300">COMBO</span>
                <span className="text-xl font-mono font-bold">{combo}</span>
            </div>
        </div>
    );
};


const TutorView: React.FC<TutorViewProps> = ({ saveSession, settings }) => {
  const { isSessionActive, isProcessing, conversation, latestFeedback, combo, startSession, stopSession } = useTutor(saveSession, settings);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);
  
  const handleStartSession = () => {
    startSession(topic);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col flex-grow bg-white/50 dark:bg-slate-800/50 rounded-lg shadow-2xl overflow-hidden relative">
        {isSessionActive && <ComboCounter combo={combo} />}
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
          {conversation.length === 0 && !isSessionActive && (
             <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 dark:text-slate-400 p-4">
                <MicrophoneIcon className="w-16 h-16 mb-4 text-sky-500 dark:text-sky-400" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Let's talk!</h2>
                <p className="mb-6 max-w-md">What would you like to talk about today? Enter a topic below, or just press the microphone to get a suggestion.</p>
                <div className="w-full max-w-sm">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., My favorite movie, weekend plans..."
                    className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400 dark:placeholder-slate-500"
                    aria-label="Conversation topic"
                  />
                </div>
            </div>
          )}
          {conversation.map((turn) => <ConversationBubble key={turn.id} turn={turn} />)}
          <div ref={conversationEndRef} />
        </div>
        
        {latestFeedback && (
          <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-700">
            <FeedbackCard feedback={latestFeedback} lang={settings.language} />
          </div>
        )}
        
        <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50">
          <button 
            onClick={isSessionActive ? stopSession : handleStartSession}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${isSessionActive ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500'}
            ${isProcessing ? 'cursor-not-allowed bg-slate-500' : ''}`}
            aria-label={isSessionActive ? 'Stop session' : 'Start session'}
          >
            <MicrophoneIcon className="w-10 h-10 text-white" />
          </button>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {isProcessing ? 'Analyzing feedback...' : (isSessionActive ? 'Click to end session' : 'Click to start speaking')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorView;
