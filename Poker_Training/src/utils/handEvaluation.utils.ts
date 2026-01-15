import type { Card, Rank, HandRank, EvaluatedHand } from '../types';
import { getRankValue, ranks } from '../constants';

/**
 * Get all 5-card combinations from 7 cards
 */
const getCombinations = (cards: Card[], size: number): Card[][] => {
  if (size === 0) return [[]];
  if (cards.length < size) return [];

  const result: Card[][] = [];

  for (let i = 0; i <= cards.length - size; i++) {
    const first = cards[i];
    const rest = cards.slice(i + 1);
    const combsWithoutFirst = getCombinations(rest, size - 1);

    for (const comb of combsWithoutFirst) {
      result.push([first, ...comb]);
    }
  }

  return result;
};

/**
 * Check for flush (5 cards same suit)
 */
const isFlush = (cards: Card[]): boolean => {
  const suit = cards[0].suit;
  return cards.every(c => c.suit === suit);
};

/**
 * Check for straight (5 consecutive ranks)
 */
const isStraight = (sortedValues: number[]): boolean => {
  // Check for A-2-3-4-5 (wheel)
  if (sortedValues[4] === 12 && sortedValues[0] === 0 && sortedValues[1] === 1 &&
      sortedValues[2] === 2 && sortedValues[3] === 3) {
    return true;
  }

  // Regular straight
  for (let i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] !== sortedValues[i - 1] + 1) return false;
  }
  return true;
};

/**
 * Count occurrences of each rank
 */
const countRanks = (cards: Card[]): Map<Rank, number> => {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
};

/**
 * Evaluate a single 5-card hand
 */
const evaluateFiveCards = (cards: Card[]): EvaluatedHand => {
  const sortedValues = cards.map(c => getRankValue(c.rank)).sort((a, b) => a - b);
  const rankCounts = countRanks(cards);
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);

  const flush = isFlush(cards);
  const straight = isStraight(sortedValues);

  // Get high card for straights (special case for wheel)
  let straightHighCard = sortedValues[4];
  if (straight && sortedValues[4] === 12 && sortedValues[0] === 0) {
    straightHighCard = 3; // 5-high straight (wheel)
  }

  // Royal Flush
  if (flush && straight && sortedValues[4] === 12 && sortedValues[0] === 8) {
    return {
      rank: 'royal-flush',
      rankValue: 9000,
      description: 'Royal Flush',
      bestFiveCards: cards,
      kickers: []
    };
  }

  // Straight Flush
  if (flush && straight) {
    return {
      rank: 'straight-flush',
      rankValue: 8000 + straightHighCard,
      description: `Straight Flush, ${ranks[straightHighCard]} high`,
      bestFiveCards: cards,
      kickers: []
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const quadRank = Array.from(rankCounts.entries()).find(([_, c]) => c === 4)![0];
    const kicker = Array.from(rankCounts.entries()).find(([_, c]) => c === 1)![0];
    return {
      rank: 'four-of-a-kind',
      rankValue: 7000 + getRankValue(quadRank) * 13 + getRankValue(kicker),
      description: `Four of a Kind, ${quadRank}s`,
      bestFiveCards: cards,
      kickers: [getRankValue(kicker)]
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = Array.from(rankCounts.entries()).find(([_, c]) => c === 3)![0];
    const pairRank = Array.from(rankCounts.entries()).find(([_, c]) => c === 2)![0];
    return {
      rank: 'full-house',
      rankValue: 6000 + getRankValue(tripRank) * 13 + getRankValue(pairRank),
      description: `Full House, ${tripRank}s full of ${pairRank}s`,
      bestFiveCards: cards,
      kickers: []
    };
  }

  // Flush
  if (flush) {
    return {
      rank: 'flush',
      rankValue: 5000 + sortedValues.reduceRight((acc, v, i) => acc + v * Math.pow(13, i), 0),
      description: `Flush, ${ranks[sortedValues[4]]} high`,
      bestFiveCards: cards,
      kickers: sortedValues.slice().reverse()
    };
  }

  // Straight
  if (straight) {
    return {
      rank: 'straight',
      rankValue: 4000 + straightHighCard,
      description: `Straight, ${ranks[straightHighCard]} high`,
      bestFiveCards: cards,
      kickers: []
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const tripRank = Array.from(rankCounts.entries()).find(([_, c]) => c === 3)![0];
    const kickers = Array.from(rankCounts.entries())
      .filter(([_, c]) => c === 1)
      .map(([r]) => getRankValue(r))
      .sort((a, b) => b - a);
    return {
      rank: 'three-of-a-kind',
      rankValue: 3000 + getRankValue(tripRank) * 169 + kickers[0] * 13 + kickers[1],
      description: `Three of a Kind, ${tripRank}s`,
      bestFiveCards: cards,
      kickers
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Array.from(rankCounts.entries())
      .filter(([_, c]) => c === 2)
      .map(([r]) => getRankValue(r))
      .sort((a, b) => b - a);
    const kicker = Array.from(rankCounts.entries()).find(([_, c]) => c === 1)![0];
    return {
      rank: 'two-pair',
      rankValue: 2000 + pairs[0] * 169 + pairs[1] * 13 + getRankValue(kicker),
      description: `Two Pair, ${ranks[pairs[0]]}s and ${ranks[pairs[1]]}s`,
      bestFiveCards: cards,
      kickers: [getRankValue(kicker)]
    };
  }

  // One Pair
  if (counts[0] === 2) {
    const pairRank = Array.from(rankCounts.entries()).find(([_, c]) => c === 2)![0];
    const kickers = Array.from(rankCounts.entries())
      .filter(([_, c]) => c === 1)
      .map(([r]) => getRankValue(r))
      .sort((a, b) => b - a);
    return {
      rank: 'pair',
      rankValue: 1000 + getRankValue(pairRank) * 2197 + kickers[0] * 169 + kickers[1] * 13 + kickers[2],
      description: `Pair of ${pairRank}s`,
      bestFiveCards: cards,
      kickers
    };
  }

  // High Card
  return {
    rank: 'high-card',
    rankValue: sortedValues.reduceRight((acc, v, i) => acc + v * Math.pow(13, i), 0),
    description: `High Card, ${ranks[sortedValues[4]]}`,
    bestFiveCards: cards,
    kickers: sortedValues.slice().reverse()
  };
};

/**
 * Evaluate the best 5-card hand from hole cards + community cards
 */
export const evaluateHand = (holeCards: Card[], communityCards: Card[]): EvaluatedHand => {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    return {
      rank: 'high-card',
      rankValue: 0,
      description: 'Incomplete hand',
      bestFiveCards: allCards,
      kickers: []
    };
  }

  const combinations = getCombinations(allCards, 5);
  let bestHand: EvaluatedHand | null = null;

  for (const combo of combinations) {
    const evaluated = evaluateFiveCards(combo);
    if (!bestHand || evaluated.rankValue > bestHand.rankValue) {
      bestHand = evaluated;
    }
  }

  return bestHand!;
};

/**
 * Compare two evaluated hands
 * Returns: positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
export const compareHands = (hand1: EvaluatedHand, hand2: EvaluatedHand): number => {
  return hand1.rankValue - hand2.rankValue;
};

/**
 * Get human-readable hand strength description
 */
export const getHandStrengthDescription = (hand: EvaluatedHand): string => {
  const strengthLevels: Record<HandRank, string> = {
    'royal-flush': 'Unbeatable! The nuts!',
    'straight-flush': 'Monster hand - extremely strong',
    'four-of-a-kind': 'Monster hand - extremely strong',
    'full-house': 'Very strong hand',
    'flush': 'Strong hand',
    'straight': 'Strong hand',
    'three-of-a-kind': 'Good hand - playable',
    'two-pair': 'Decent hand',
    'pair': 'Marginal hand - depends on kickers',
    'high-card': 'Weak - only bluff value'
  };

  return strengthLevels[hand.rank];
};

/**
 * Determine winners from list of players (handles ties/split pots)
 */
export const determineWinners = (
  players: { id: number; name: string; holeCards: Card[] }[],
  communityCards: Card[]
): { playerId: number; playerName: string; hand: EvaluatedHand; holeCards: Card[] }[] => {
  if (players.length === 0) return [];

  const evaluatedPlayers = players.map(p => ({
    playerId: p.id,
    playerName: p.name,
    holeCards: p.holeCards,
    hand: evaluateHand(p.holeCards, communityCards)
  }));

  // Find highest hand value
  const maxValue = Math.max(...evaluatedPlayers.map(p => p.hand.rankValue));

  // Return all players with the highest hand value (handles ties)
  return evaluatedPlayers.filter(p => p.hand.rankValue === maxValue);
};
