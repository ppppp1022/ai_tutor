
import React from 'react';
import { FeedbackItem } from '../types';
import HistoryIcon from './icons/HistoryIcon';

interface HistoryViewProps {
  feedbackHistory: FeedbackItem[];
}

const HistoryCard: React.FC<{ item: FeedbackItem }> = ({ item }) => (
  <div className="bg-slate-800 rounded-lg p-5 transition-transform hover:scale-[1.02] hover:shadow-lg">
    <p className="text-sm text-slate-400 mb-3">{item.timestamp}</p>
    <blockquote className="border-l-4 border-sky-500 pl-4 mb-3">
      <p className="italic text-slate-300">"{item.originalText}"</p>
    </blockquote>
    <div className="mt-4">
      <h4 className="font-semibold text-green-400 mb-2">Suggestion:</h4>
      <p className="text-green-300 bg-green-900/30 p-3 rounded-md">"{item.correctedText}"</p>
    </div>
    <div className="mt-4">
      <h4 className="font-semibold text-sky-400 mb-2">Comments:</h4>
      <ul className="space-y-2">
        {item.comments.map((comment, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-1 text-sky-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-slate-300">{comment}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const HistoryView: React.FC<HistoryViewProps> = ({ feedbackHistory }) => {
  if (feedbackHistory.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center text-slate-500">
        <HistoryIcon className="w-24 h-24 mb-4 text-slate-600" />
        <h2 className="text-2xl font-bold text-slate-300">No History Yet</h2>
        <p className="mt-2 max-w-md">Your feedback from the tutor will appear here after you complete a speaking session.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-slate-100 text-center">Feedback History</h2>
      <div className="space-y-6 max-w-4xl mx-auto">
        {feedbackHistory.map((item) => (
          <HistoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
