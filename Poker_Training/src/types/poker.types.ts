// Basic Poker Types
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Action = 'raise' | 'call' | 'fold';
export type View = 'practice' | 'stats' | 'charts';
export type FeedbackType = 'correct' | 'incorrect';

// Game Mode Types
export type GameMode = 'preflop-only' | 'full-game' | 'postflop-only';
export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river';
export type PostflopAction = 'check' | 'bet' | 'call' | 'raise' | 'fold';

// Post-flop Types
export type DrawType =
  | 'flush-draw'
  | 'open-ended-straight'
  | 'gutshot-straight'
  | 'backdoor-flush'
  | 'backdoor-straight'
  | 'overcards'
  | 'set'
  | 'two-pair'
  | 'top-pair'
  | 'middle-pair'
  | 'bottom-pair'
  | 'nothing';

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
  UTG: PositionRange;
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
  UTG: PositionStat;
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

// Post-flop Game State Interface
export interface PostflopGameState {
  communityCards: Card[];
  pot: number;
  betToCall: number;
  bettingRound: BettingRound;
  playerChips: number;
  opponentChips: number;
}

// Outs and Odds Interface
export interface OutsAnalysis {
  outs: number;
  draws: DrawInfo[];
  potOdds: number;
  equityNeeded: number;
  impliedOdds: number;
  recommendedAction: PostflopAction;
  explanation: string;
}

export interface DrawInfo {
  type: DrawType;
  outs: number;
  description: string;
}

// Post-flop Feedback Interface
export interface PostflopFeedback {
  type: FeedbackType;
  playerAction: PostflopAction;
  correctAction: PostflopAction;
  analysis: OutsAnalysis;
}
