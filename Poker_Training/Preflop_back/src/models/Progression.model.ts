import mongoose, { Schema, Document, Types } from 'mongoose';

// Position stats subdocument
const PositionStatsSchema = new Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

// Street stats subdocument
const StreetStatsSchema = new Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

// Decision type stats subdocument
const DecisionStatsSchema = new Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

// Preflop-only mode progression
export interface IPreflopProgression extends Document {
  userId: Types.ObjectId;
  totalHands: number;
  correctAnswers: number;
  bestStreak: number;
  positionStats: {
    UTG: { correct: number; total: number };
    MP: { correct: number; total: number };
    CO: { correct: number; total: number };
    BTN: { correct: number; total: number };
    SB: { correct: number; total: number };
    BB: { correct: number; total: number };
  };
  lastUpdated: Date;
}

const PreflopProgressionSchema = new Schema<IPreflopProgression>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalHands: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  positionStats: {
    UTG: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    MP: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    CO: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    BTN: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    SB: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    BB: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Postflop-only mode progression
export interface IPostflopProgression extends Document {
  userId: Types.ObjectId;
  totalHands: number;
  correctAnswers: number;
  bestStreak: number;
  streetStats: {
    flop: { correct: number; total: number };
    turn: { correct: number; total: number };
    river: { correct: number; total: number };
  };
  decisionTypeStats: {
    call: { correct: number; total: number };
    fold: { correct: number; total: number };
    raise: { correct: number; total: number };
  };
  lastUpdated: Date;
}

const PostflopProgressionSchema = new Schema<IPostflopProgression>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalHands: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  streetStats: {
    flop: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    turn: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    river: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) }
  },
  decisionTypeStats: {
    call: { type: DecisionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    fold: { type: DecisionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    raise: { type: DecisionStatsSchema, default: () => ({ correct: 0, total: 0 }) }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Full-game mode progression
export interface IFullGameProgression extends Document {
  userId: Types.ObjectId;
  totalHands: number;
  preflopCorrect: number;
  preflopTotal: number;
  postflopCorrect: number;
  postflopTotal: number;
  bestStreak: number;
  positionStats: {
    UTG: { correct: number; total: number };
    MP: { correct: number; total: number };
    CO: { correct: number; total: number };
    BTN: { correct: number; total: number };
    SB: { correct: number; total: number };
    BB: { correct: number; total: number };
  };
  streetStats: {
    flop: { correct: number; total: number };
    turn: { correct: number; total: number };
    river: { correct: number; total: number };
  };
  lastUpdated: Date;
}

const FullGameProgressionSchema = new Schema<IFullGameProgression>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  totalHands: { type: Number, default: 0 },
  preflopCorrect: { type: Number, default: 0 },
  preflopTotal: { type: Number, default: 0 },
  postflopCorrect: { type: Number, default: 0 },
  postflopTotal: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  positionStats: {
    UTG: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    MP: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    CO: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    BTN: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    SB: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    BB: { type: PositionStatsSchema, default: () => ({ correct: 0, total: 0 }) }
  },
  streetStats: {
    flop: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    turn: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) },
    river: { type: StreetStatsSchema, default: () => ({ correct: 0, total: 0 }) }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Play Poker mode progression (tracks both win rate AND decision quality)
export interface IPlayPokerProgression extends Document {
  userId: Types.ObjectId;
  gamesPlayed: number;
  handsPlayed: number;
  // Win Rate Metrics
  totalWinnings: number;
  biggestPot: number;
  showdownWins: number;
  showdownsReached: number;
  // Decision Quality Metrics
  correctPreflopDecisions: number;
  totalPreflopDecisions: number;
  correctPostflopDecisions: number;
  totalPostflopDecisions: number;
  optimalBluffs: number;
  totalBluffAttempts: number;
  optimalValueBets: number;
  totalValueBetAttempts: number;
  lastUpdated: Date;
}

const PlayPokerProgressionSchema = new Schema<IPlayPokerProgression>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  gamesPlayed: { type: Number, default: 0 },
  handsPlayed: { type: Number, default: 0 },
  // Win Rate Metrics
  totalWinnings: { type: Number, default: 0 },
  biggestPot: { type: Number, default: 0 },
  showdownWins: { type: Number, default: 0 },
  showdownsReached: { type: Number, default: 0 },
  // Decision Quality Metrics
  correctPreflopDecisions: { type: Number, default: 0 },
  totalPreflopDecisions: { type: Number, default: 0 },
  correctPostflopDecisions: { type: Number, default: 0 },
  totalPostflopDecisions: { type: Number, default: 0 },
  optimalBluffs: { type: Number, default: 0 },
  totalBluffAttempts: { type: Number, default: 0 },
  optimalValueBets: { type: Number, default: 0 },
  totalValueBetAttempts: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

export const PreflopProgression = mongoose.model<IPreflopProgression>('PreflopProgression', PreflopProgressionSchema);
export const PostflopProgression = mongoose.model<IPostflopProgression>('PostflopProgression', PostflopProgressionSchema);
export const FullGameProgression = mongoose.model<IFullGameProgression>('FullGameProgression', FullGameProgressionSchema);
export const PlayPokerProgression = mongoose.model<IPlayPokerProgression>('PlayPokerProgression', PlayPokerProgressionSchema);
