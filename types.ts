export enum View {
  TUTOR = 'TUTOR',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export type Language = 'ko' | 'ja' | 'zh';
export type TutorSpeed = 'default' | 'slightly_slower' | 'slower';

export interface Settings {
  name: string;
  age: string;
  description: string;
  language: Language;
  theme: Theme;
  speed: TutorSpeed;
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

export interface SessionRecord {
  id: string; // ISO string of session start time
  date: string; // YYYY-MM-DD
  summary: string;
  maxCombo: number;
  conversation: ConversationTurn[];
  feedbackItems: FeedbackItem[];
}
