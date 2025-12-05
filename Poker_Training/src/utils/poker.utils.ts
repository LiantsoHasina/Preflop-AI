import type { Card, Rank, Suit, Position, Action } from '../types';
import { suits, ranks, preflopRanges, positionAdvantages } from '../constants';

/**
 * Generates a random poker hand
 */
export const generateHand = (): Card[] => {
  const card1Rank: Rank = ranks[Math.floor(Math.random() * ranks.length)];
  const card2Rank: Rank = ranks[Math.floor(Math.random() * ranks.length)];
  const card1Suit: Suit = suits[Math.floor(Math.random() * suits.length)];
  const card2Suit: Suit = suits[Math.floor(Math.random() * suits.length)];

  return [
    { rank: card1Rank, suit: card1Suit },
    { rank: card2Rank, suit: card2Suit }
  ];
};

/**
 * Converts a hand to poker notation (e.g., AKs, 77, JTo)
 */
export const getHandNotation = (hand: Card[]): string => {
  if (!hand || hand.length !== 2) return '';

  const rank1: Rank = hand[0].rank;
  const rank2: Rank = hand[1].rank;
  const suit1: Suit = hand[0].suit;
  const suit2: Suit = hand[1].suit;

  const rankValue = (r: Rank): number => ranks.indexOf(r);
  const higherRank: Rank = rankValue(rank1) > rankValue(rank2) ? rank1 : rank2;
  const lowerRank: Rank = rankValue(rank1) > rankValue(rank2) ? rank2 : rank1;

  if (rank1 === rank2) return rank1 + rank2;
  if (suit1 === suit2) return higherRank + lowerRank + 's';
  return higherRank + lowerRank + 'o';
};

/**
 * Determines the correct action for a given hand and position
 */
export const getCorrectAction = (hand: Card[], pos: Position): Action => {
  const notation: string = getHandNotation(hand);
  const range = preflopRanges[pos];

  if (range.raise.includes(notation)) return 'raise';
  if (range.call.includes(notation)) return 'call';
  return 'fold';
};

/**
 * Generates an explanation for why a certain action is correct
 */
export const getExplanation = (hand: Card[], pos: Position, action: Action): string => {
  const notation: string = getHandNotation(hand);
  const isPair: boolean = hand[0].rank === hand[1].rank;
  const isSuited: boolean = hand[0].suit === hand[1].suit;
  const highCard: Rank = ranks.indexOf(hand[0].rank) > ranks.indexOf(hand[1].rank) ? hand[0].rank : hand[1].rank;
  const lowCard: Rank = ranks.indexOf(hand[0].rank) > ranks.indexOf(hand[1].rank) ? hand[1].rank : hand[0].rank;

  if (action === 'raise') {
    if (isPair && ranks.indexOf(hand[0].rank) >= 8) {
      return `Premium pocket pair ${notation} should be raised from ${positionAdvantages[pos]}. High pairs have excellent equity against most ranges and can build the pot with a strong made hand. They play well both heads-up and multiway.`;
    }
    if (notation.includes('A') && notation.includes('K')) {
      return `AK is the strongest unpaired hand and should be raised from ${positionAdvantages[pos]}. It has excellent equity against most hands, dominates other Ax hands, and can make top pair with the best kicker. ${isSuited ? 'Being suited adds flush potential and about 2.5% equity.' : ''}`;
    }
    if (notation.includes('A') && isSuited) {
      return `Suited aces like ${notation} should be raised from ${positionAdvantages[pos]}. They have good playability with nut flush potential, can make strong top pairs, and benefit from positional advantage. These hands perform well against calling ranges.`;
    }
    if (isSuited && ['K', 'Q', 'J', 'T'].includes(highCard) && ['Q', 'J', 'T', '9'].includes(lowCard)) {
      return `Broadway suited connector ${notation} should be raised from ${positionAdvantages[pos]}. These hands have excellent playability with straight and flush potential, plus they can make strong top pairs. They perform well in position and can win big pots when they connect.`;
    }
    return `Hand ${notation} falls into the raising range from ${positionAdvantages[pos]}. This hand has sufficient equity and playability to raise for value and to build a balanced range that protects your premium holdings.`;
  }

  if (action === 'call') {
    if (pos === 'BB') {
      return `From the big blind, ${notation} should call as you're getting good pot odds with money already invested. The BB can defend wider because you close the action preflop and only need to win the pot a small percentage of the time to profit. This hand has enough equity to continue.`;
    }
    return `Hand ${notation} is borderline from ${positionAdvantages[pos]}. It's profitable to call in the right situations but not strong enough to raise. Calling allows you to see a flop cheaply while keeping your range balanced. Be prepared to fold to aggression postflop if you don't connect.`;
  }

  if (action === 'fold') {
    return `Hand ${notation} should be folded from ${positionAdvantages[pos]}. This hand lacks the equity and playability needed to profitably continue. It's dominated by better hands in opponents' ranges and doesn't have enough potential to win large pots. Folding here preserves chips for stronger spots and maintains optimal range selection.`;
  }

  return '';
};

/**
 * Checks if a card is red (hearts or diamonds)
 */
export const isRedCard = (card: Card): boolean => {
  return card.suit === '♥' || card.suit === '♦';
};
