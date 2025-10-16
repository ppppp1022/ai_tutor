
export enum View {
  TUTOR = 'TUTOR',
  HISTORY = 'HISTORY',
}

export interface ConversationTurn {
  speaker: 'user' | 'tutor';
  text: string;
  id: number;
}

export interface FeedbackItem {
  id: string;
  originalText: string;
  correctedText: string;
  comments: string[];
  timestamp: string;
}
