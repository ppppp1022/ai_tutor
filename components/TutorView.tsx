
import React, { useRef, useEffect } from 'react';
import { FeedbackItem, ConversationTurn } from '../types';
import { useTutor } from '../hooks/useTutor';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface TutorViewProps {
  addFeedback: (item: FeedbackItem) => void;
}

const FeedbackCard: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => (
  <div className="bg-slate-800 rounded-lg p-4 animate-fade-in">
    <h3 className="text-lg font-semibold text-sky-400 mb-2">Feedback</h3>
    <p className="text-sm text-slate-400 italic">"{feedback.originalText}"</p>
    <p className="text-sm text-green-400 mt-2">
      <span className="font-semibold">Suggestion:</span> "{feedback.correctedText}"
    </p>
    <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
      {feedback.comments.map((comment, i) => <li key={i}>{comment}</li>)}
    </ul>
  </div>
);

const ConversationBubble: React.FC<{ turn: ConversationTurn }> = ({ turn }) => {
  const isUser = turn.speaker === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl px-4 py-2 rounded-lg ${isUser ? 'bg-sky-700 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
        <p>{turn.text}</p>
      </div>
    </div>
  );
};

const TutorView: React.FC<TutorViewProps> = ({ addFeedback }) => {
  const { isSessionActive, isProcessing, conversation, latestFeedback, startSession, stopSession } = useTutor(addFeedback);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col flex-grow bg-slate-800/50 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-4">
          {conversation.length === 0 && !isSessionActive && (
             <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                <MicrophoneIcon className="w-16 h-16 mb-4" />
                <h2 className="text-2xl font-bold text-slate-200">Ready to Practice?</h2>
                <p className="mt-2">Click the microphone button to start your English speaking session.</p>
            </div>
          )}
          {conversation.map((turn) => <ConversationBubble key={turn.id} turn={turn} />)}
          <div ref={conversationEndRef} />
        </div>
        
        {latestFeedback && (
          <div className="p-4 md:p-6 border-t border-slate-700">
            <FeedbackCard feedback={latestFeedback} />
          </div>
        )}
        
        <div className="p-4 md:p-6 border-t border-slate-700 flex flex-col items-center justify-center">
          <button 
            onClick={isSessionActive ? stopSession : startSession}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${isSessionActive ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500'}
            ${isProcessing ? 'cursor-not-allowed bg-slate-600' : ''}`}
          >
            <MicrophoneIcon className="w-10 h-10 text-white" />
          </button>
          <p className="mt-4 text-sm text-slate-400">
            {isProcessing ? 'Analyzing your speech...' : (isSessionActive ? 'Click to stop session' : 'Click to start speaking')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorView;
