// Basic Poker Types
export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Action = 'raise' | 'call' | 'fold';
export type View = 'practice' | 'stats' | 'charts';
export type FeedbackType = 'correct' | 'incorrect';

// Game Mode Types
export type GameMode = 'preflop-only' | 'full-game' | 'postflop-only' | 'play-poker';
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

// ==========================================
// Multiplayer Poker Game Types
// ==========================================

// Player action in multiplayer game
export type MultiplayerAction = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';

// Player status in game
export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'waiting' | 'out';

// Hand ranking types
export type HandRank =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

// Player in multiplayer game
export interface PokerPlayer {
  id: number;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBetThisRound: number;
  status: PlayerStatus;
  isHuman: boolean;
  isDealer: boolean;
  position: number; // Seat position at table (0-8)
  hasActed: boolean;
}

// Action record for analysis
export interface ActionRecord {
  playerId: number;
  playerName: string;
  action: MultiplayerAction;
  amount: number;
  potBefore: number;
  potAfter: number;
  bettingRound: BettingRound;
  communityCards: Card[];
  playerHoleCards: Card[];
  reasoning?: string;
  wasOptimal?: boolean;
  optimalAction?: MultiplayerAction;
  lesson?: string;
}

// Evaluated hand result
export interface EvaluatedHand {
  rank: HandRank;
  rankValue: number; // Numeric value for comparison
  description: string;
  bestFiveCards: Card[];
  kickers: number[];
}

// Winner info
export interface WinnerInfo {
  playerId: number;
  playerName: string;
  amount: number;
  hand: EvaluatedHand;
  holeCards: Card[];
}

// Side pot
export interface SidePot {
  amount: number;
  eligiblePlayerIds: number[];
}

// Game settings
export interface PokerGameSettings {
  playerCount: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  playerName: string;
}

// Full multiplayer game state
export interface PokerGameState {
  // Game settings
  settings: PokerGameSettings;

  // Players
  players: PokerPlayer[];
  humanPlayerId: number;

  // Dealer and blinds
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;

  // Current round state
  bettingRound: BettingRound;
  currentPlayerIndex: number;
  currentBet: number;
  minRaise: number;

  // Cards
  communityCards: Card[];
  deck: Card[];

  // Pot
  pot: number;
  sidePots: SidePot[];

  // Game flow
  isHandComplete: boolean;
  isGameOver: boolean;
  winners: WinnerInfo[];

  // Action history for analysis
  actionHistory: ActionRecord[];

  // UI state
  showdown: boolean;
  waitingForHumanAction: boolean;
}

// Post-hand analysis
export interface HandAnalysis {
  handNumber: number;
  actions: ActionRecord[];
  winners: WinnerInfo[];
  keyMoments: KeyMoment[];
  overallAssessment: string;
  lessonsLearned: string[];
}

// Key moment in hand for analysis
export interface KeyMoment {
  round: BettingRound;
  description: string;
  playerAction: ActionRecord;
  analysis: string;
  improvement?: string;
}
