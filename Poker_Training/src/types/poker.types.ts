// Basic Poker Types
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Position = 'EP' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Action = 'raise' | 'call' | 'fold';
export type View = 'practice' | 'stats' | 'charts';
export type FeedbackType = 'correct' | 'incorrect';

// Card Interface
export interface Card {
  rank: Rank;
  suit: Suit;
}

// Position Related Interfaces
export interface PositionInfo {
  value: Position;
  label: string;
}

export interface PositionRange {
  raise: string[];
  call: string[];
  fold: 'default';
}

export interface PreflopRanges {
  EP: PositionRange;
  MP: PositionRange;
  CO: PositionRange;
  BTN: PositionRange;
  SB: PositionRange;
  BB: PositionRange;
}

// Stats Related Interfaces
export interface PositionStat {
  correct: number;
  total: number;
}

export interface PositionStats {
  EP: PositionStat;
  MP: PositionStat;
  CO: PositionStat;
  BTN: PositionStat;
  SB: PositionStat;
  BB: PositionStat;
}

// Feedback Interface
export interface Feedback {
  type: FeedbackType;
  action: Action;
}

// Chart Data Interface
export interface ChartData {
  name: string;
  accuracy: number;
  hands: number;
}
