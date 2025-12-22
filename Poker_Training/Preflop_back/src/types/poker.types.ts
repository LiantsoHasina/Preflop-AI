export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Position = 'EP' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Action = 'raise' | 'call' | 'fold';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface HandAnalysisRequest {
  hand: Card[];
  position: Position;
}

export interface HandAnalysisResponse {
  action: Action;
  explanation: string;
  confidence: number;
  reasoning: string;
}
