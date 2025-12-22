import type {
  Card,
  Rank,
  Suit,
  BettingRound,
  DrawType,
  DrawInfo,
  OutsAnalysis,
  PostflopAction,
  PostflopGameState
} from '../types';
import { ranks, suits, GAME_CONSTANTS } from '../constants';

/**
 * Get the numeric value of a rank for comparison
 */
export const getRankValue = (rank: Rank): number => ranks.indexOf(rank);

/**
 * Generate a full deck of 52 cards
 */
export const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck;
};

/**
 * Remove specific cards from a deck
 */
export const removeCardsFromDeck = (deck: Card[], cardsToRemove: Card[]): Card[] => {
  return deck.filter(
    (card) =>
      !cardsToRemove.some(
        (removeCard) => removeCard.rank === card.rank && removeCard.suit === card.suit
      )
  );
};

/**
 * Deal community cards for a specific round
 */
export const dealCommunityCards = (
  usedCards: Card[],
  round: BettingRound
): Card[] => {
  const deck = removeCardsFromDeck(generateDeck(), usedCards);
  const shuffled = [...deck].sort(() => Math.random() - 0.5);

  switch (round) {
    case 'flop':
      return shuffled.slice(0, 3);
    case 'turn':
      return shuffled.slice(0, 1);
    case 'river':
      return shuffled.slice(0, 1);
    default:
      return [];
  }
};

/**
 * Count flush draw outs
 */
export const countFlushDrawOuts = (
  holeCards: Card[],
  communityCards: Card[]
): { outs: number; suit: Suit | null; isFlushDraw: boolean } => {
  const allCards = [...holeCards, ...communityCards];
  const suitCounts: Record<Suit, number> = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };

  for (const card of allCards) {
    suitCounts[card.suit]++;
  }

  for (const suit of suits) {
    if (suitCounts[suit] === 4) {
      // 4 to a flush = 9 outs (13 cards of suit - 4 we have)
      return { outs: 9, suit, isFlushDraw: true };
    }
  }

  return { outs: 0, suit: null, isFlushDraw: false };
};

/**
 * Check for backdoor flush draw (3 cards of same suit)
 */
export const hasBackdoorFlushDraw = (
  holeCards: Card[],
  communityCards: Card[]
): { hasBackdoor: boolean; suit: Suit | null } => {
  if (communityCards.length > 3) {
    return { hasBackdoor: false, suit: null }; // Only relevant on flop
  }

  const allCards = [...holeCards, ...communityCards];
  const suitCounts: Record<Suit, number> = { '♠': 0, '♥': 0, '♦': 0, '♣': 0 };

  for (const card of allCards) {
    suitCounts[card.suit]++;
  }

  for (const suit of suits) {
    if (suitCounts[suit] === 3) {
      return { hasBackdoor: true, suit };
    }
  }

  return { hasBackdoor: false, suit: null };
};

/**
 * Count straight draw outs
 */
export const countStraightDrawOuts = (
  holeCards: Card[],
  communityCards: Card[]
): { outs: number; type: 'open-ended' | 'gutshot' | 'none'; neededRanks: Rank[] } => {
  const allCards = [...holeCards, ...communityCards];
  const uniqueRanks = [...new Set(allCards.map((c) => getRankValue(c.rank)))];

  // Add ace as low for A-2-3-4-5 straight (ace = 12 in our ranks, but also counts as -1)
  const hasAce = uniqueRanks.includes(12);
  const extendedRanks = hasAce ? [-1, ...uniqueRanks] : uniqueRanks;
  extendedRanks.sort((a, b) => a - b);

  // Check for open-ended straight draws (4 consecutive, needs either end)
  for (let i = 0; i <= extendedRanks.length - 4; i++) {
    const slice = extendedRanks.slice(i, i + 4);
    if (isConsecutive(slice)) {
      const lowNeeded = slice[0] - 1;
      const highNeeded = slice[3] + 1;
      const neededRanks: Rank[] = [];

      // Check if we can add a card at either end
      if (lowNeeded >= 0 && lowNeeded <= 12) {
        neededRanks.push(ranks[lowNeeded]);
      }
      if (highNeeded >= 0 && highNeeded <= 12) {
        neededRanks.push(ranks[highNeeded]);
      }

      if (neededRanks.length === 2) {
        // Open-ended: 8 outs (4 cards × 2 ranks)
        return { outs: 8, type: 'open-ended', neededRanks };
      }
    }
  }

  // Check for gutshot straight draws (4 cards with one gap)
  for (let i = 0; i <= extendedRanks.length - 4; i++) {
    const possibleCards = extendedRanks.slice(i, i + 5);
    if (possibleCards.length >= 4) {
      // Check if there's exactly one gap in a 5-card range
      const gaps = findGaps(possibleCards, 4);
      if (gaps.length === 1 && gaps[0] >= 0 && gaps[0] <= 12) {
        // Gutshot: 4 outs
        return { outs: 4, type: 'gutshot', neededRanks: [ranks[gaps[0]]] };
      }
    }
  }

  return { outs: 0, type: 'none', neededRanks: [] };
};

/**
 * Check if array contains consecutive numbers
 */
const isConsecutive = (arr: number[]): boolean => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1] + 1) return false;
  }
  return true;
};

/**
 * Find gaps in a potential straight
 */
const findGaps = (arr: number[], _minConnected: number): number[] => {
  const sorted = [...arr].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  if (max - min > 4) return []; // Range too wide for a straight

  const gaps: number[] = [];
  for (let i = min; i <= max; i++) {
    if (!sorted.includes(i)) {
      gaps.push(i);
    }
  }

  return gaps;
};

/**
 * Count overcard outs (cards higher than board)
 */
export const countOvercardOuts = (
  holeCards: Card[],
  communityCards: Card[]
): { outs: number; overcards: Rank[] } => {
  const boardHighest = Math.max(...communityCards.map((c) => getRankValue(c.rank)));
  const overcards = holeCards.filter((c) => getRankValue(c.rank) > boardHighest);

  // Each overcard has 3 outs (3 remaining cards of that rank)
  return {
    outs: overcards.length * 3,
    overcards: overcards.map((c) => c.rank)
  };
};

/**
 * Check if we have a made hand (pair or better)
 */
export const getMadeHand = (
  holeCards: Card[],
  communityCards: Card[]
): { type: DrawType; description: string } | null => {
  const allCards = [...holeCards, ...communityCards];
  const rankCounts: Record<Rank, number> = {} as Record<Rank, number>;

  for (const card of allCards) {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  }

  // Check for set (three of a kind with pocket pair)
  for (const card of holeCards) {
    if (rankCounts[card.rank] === 3 && holeCards[0].rank === holeCards[1].rank) {
      return { type: 'set', description: `Set of ${card.rank}s` };
    }
  }

  // Check for two pair
  const pairs = Object.entries(rankCounts).filter(([_, count]) => count >= 2);
  if (pairs.length >= 2) {
    const holeCardRanks = holeCards.map((c) => c.rank);
    const pairRanks = pairs.map(([rank]) => rank);
    if (holeCardRanks.some((r) => pairRanks.includes(r))) {
      return { type: 'two-pair', description: 'Two pair' };
    }
  }

  // Check for top/middle/bottom pair
  const boardRanks = communityCards.map((c) => getRankValue(c.rank)).sort((a, b) => b - a);

  for (const holeCard of holeCards) {
    if (rankCounts[holeCard.rank] === 2) {
      const holeRankValue = getRankValue(holeCard.rank);
      if (holeRankValue === boardRanks[0]) {
        return { type: 'top-pair', description: `Top pair (${holeCard.rank}s)` };
      } else if (boardRanks.length >= 2 && holeRankValue === boardRanks[1]) {
        return { type: 'middle-pair', description: `Middle pair (${holeCard.rank}s)` };
      } else if (boardRanks.includes(holeRankValue)) {
        return { type: 'bottom-pair', description: `Bottom pair (${holeCard.rank}s)` };
      }
    }
  }

  return null;
};

/**
 * Calculate pot odds as a percentage
 * Pot odds = bet to call / (pot + bet to call)
 */
export const calculatePotOdds = (pot: number, betToCall: number): number => {
  if (betToCall === 0) return 0;
  return (betToCall / (pot + betToCall)) * 100;
};

/**
 * Calculate equity needed to call based on pot odds
 */
export const calculateEquityNeeded = (pot: number, betToCall: number): number => {
  return calculatePotOdds(pot, betToCall);
};

/**
 * Calculate equity from outs using the rule of 2 and 4
 * Flop: outs × 4 (for turn + river)
 * Turn: outs × 2 (for river only)
 */
export const calculateEquityFromOuts = (
  outs: number,
  bettingRound: BettingRound
): number => {
  const multiplier = GAME_CONSTANTS.equityMultipliers[bettingRound as keyof typeof GAME_CONSTANTS.equityMultipliers] || 2;
  return Math.min(outs * multiplier, 100); // Cap at 100%
};

/**
 * Analyze the full post-flop situation
 */
export const analyzePostflop = (
  holeCards: Card[],
  communityCards: Card[],
  gameState: PostflopGameState
): OutsAnalysis => {
  const draws: DrawInfo[] = [];
  let totalOuts = 0;

  // Check for made hands first
  const madeHand = getMadeHand(holeCards, communityCards);
  if (madeHand) {
    draws.push({
      type: madeHand.type,
      outs: 0,
      description: madeHand.description
    });
  }

  // Count flush draw outs
  const flushDraw = countFlushDrawOuts(holeCards, communityCards);
  if (flushDraw.isFlushDraw) {
    draws.push({
      type: 'flush-draw',
      outs: flushDraw.outs,
      description: `Flush draw (${flushDraw.suit}) - ${flushDraw.outs} outs`
    });
    totalOuts += flushDraw.outs;
  }

  // Check for backdoor flush on flop
  if (gameState.bettingRound === 'flop' && !flushDraw.isFlushDraw) {
    const backdoorFlush = hasBackdoorFlushDraw(holeCards, communityCards);
    if (backdoorFlush.hasBackdoor) {
      draws.push({
        type: 'backdoor-flush',
        outs: 1.5, // Backdoor flush is roughly 1.5 outs
        description: `Backdoor flush draw (${backdoorFlush.suit})`
      });
      totalOuts += 1.5;
    }
  }

  // Count straight draw outs
  const straightDraw = countStraightDrawOuts(holeCards, communityCards);
  if (straightDraw.type !== 'none') {
    const drawType: DrawType =
      straightDraw.type === 'open-ended' ? 'open-ended-straight' : 'gutshot-straight';
    draws.push({
      type: drawType,
      outs: straightDraw.outs,
      description: `${straightDraw.type === 'open-ended' ? 'Open-ended' : 'Gutshot'} straight draw - ${straightDraw.outs} outs (needs ${straightDraw.neededRanks.join(' or ')})`
    });
    // Discount overlapping outs with flush draw
    const discountedOuts = flushDraw.isFlushDraw
      ? Math.max(0, straightDraw.outs - 2)
      : straightDraw.outs;
    totalOuts += discountedOuts;
  }

  // Count overcard outs (only if no made hand)
  if (!madeHand) {
    const overcards = countOvercardOuts(holeCards, communityCards);
    if (overcards.outs > 0) {
      draws.push({
        type: 'overcards',
        outs: overcards.outs,
        description: `Overcards (${overcards.overcards.join(', ')}) - ${overcards.outs} outs`
      });
      totalOuts += overcards.outs;
    }
  }

  // If no draws found
  if (draws.length === 0) {
    draws.push({
      type: 'nothing',
      outs: 0,
      description: 'No significant draws'
    });
  }

  // Calculate pot odds
  const potOdds = calculatePotOdds(gameState.pot, gameState.betToCall);
  const equityNeeded = calculateEquityNeeded(gameState.pot, gameState.betToCall);
  const equity = calculateEquityFromOuts(totalOuts, gameState.bettingRound);

  // Calculate implied odds (rough estimate based on stack sizes)
  const impliedOdds = calculateImpliedOdds(
    gameState.pot,
    gameState.betToCall,
    gameState.opponentChips,
    totalOuts
  );

  // Determine recommended action
  const recommendedAction = determineRecommendedAction(
    madeHand,
    equity,
    equityNeeded,
    impliedOdds,
    gameState.betToCall
  );

  // Generate explanation
  const explanation = generateExplanation(
    draws,
    totalOuts,
    potOdds,
    equity,
    equityNeeded,
    impliedOdds,
    recommendedAction,
    gameState.bettingRound,
    madeHand
  );

  return {
    outs: totalOuts,
    draws,
    potOdds,
    equityNeeded,
    impliedOdds,
    recommendedAction,
    explanation
  };
};

/**
 * Calculate implied odds factor
 */
const calculateImpliedOdds = (
  pot: number,
  betToCall: number,
  opponentStack: number,
  outs: number
): number => {
  if (betToCall === 0) return 0;

  // Strong draws have better implied odds based on thresholds
  const { strong, medium, weak } = GAME_CONSTANTS.drawStrength;
  const drawStrengthMultiplier = outs >= strong.minOuts
    ? strong.multiplier
    : outs >= medium.minOuts
      ? medium.multiplier
      : weak.multiplier;

  // More chips behind = better implied odds
  const stackToPotRatio = opponentStack / (pot + betToCall);
  const impliedFactor = Math.min(stackToPotRatio * 0.2, 1) * drawStrengthMultiplier;

  return impliedFactor * 100;
};

/**
 * Determine the recommended action based on the analysis
 */
const determineRecommendedAction = (
  madeHand: { type: DrawType; description: string } | null,
  equity: number,
  equityNeeded: number,
  impliedOdds: number,
  betToCall: number
): PostflopAction => {
  // If no bet to call, we can check
  if (betToCall === 0) {
    if (madeHand && ['set', 'two-pair', 'top-pair'].includes(madeHand.type)) {
      return 'bet';
    }
    return 'check';
  }

  // Strong made hands should raise
  if (madeHand && ['set', 'two-pair'].includes(madeHand.type)) {
    return 'raise';
  }

  // Top pair can call or raise depending on situation
  if (madeHand && madeHand.type === 'top-pair') {
    return equity + impliedOdds > equityNeeded + 10 ? 'raise' : 'call';
  }

  // For draws: compare equity + implied odds vs equity needed
  const effectiveEquity = equity + impliedOdds * 0.5;

  if (effectiveEquity >= equityNeeded) {
    return 'call';
  }

  // If we're close with good implied odds
  if (effectiveEquity >= equityNeeded - 5 && impliedOdds > 10) {
    return 'call';
  }

  return 'fold';
};

/**
 * Generate a detailed explanation for the decision
 */
const generateExplanation = (
  draws: DrawInfo[],
  totalOuts: number,
  _potOdds: number,
  equity: number,
  equityNeeded: number,
  impliedOdds: number,
  recommendedAction: PostflopAction,
  bettingRound: BettingRound,
  madeHand: { type: DrawType; description: string } | null
): string => {
  let explanation = '';

  // Describe the hand situation
  if (madeHand) {
    explanation += `**Made Hand:** You have ${madeHand.description}.\n\n`;
  }

  // Describe draws
  const drawDescriptions = draws
    .filter((d) => d.type !== 'nothing' && d.outs > 0)
    .map((d) => d.description);

  if (drawDescriptions.length > 0) {
    explanation += `**Draws:** ${drawDescriptions.join('; ')}.\n\n`;
  }

  // Outs summary
  explanation += `**Total Outs:** ${totalOuts.toFixed(1)} outs\n`;

  // Equity calculation
  const multiplier = bettingRound === 'flop' ? 4 : 2;
  explanation += `**Equity:** ${totalOuts.toFixed(1)} outs × ${multiplier} = ~${equity.toFixed(1)}% chance to improve\n\n`;

  // Pot odds explanation
  explanation += `**Pot Odds:** You need ${equityNeeded.toFixed(1)}% equity to call profitably.\n`;
  explanation += `**Your Equity:** ${equity.toFixed(1)}%`;

  if (impliedOdds > 5) {
    explanation += ` + ~${impliedOdds.toFixed(0)}% implied odds\n`;
  } else {
    explanation += '\n';
  }

  explanation += '\n';

  // Decision explanation
  switch (recommendedAction) {
    case 'fold':
      explanation += `**Recommendation: FOLD**\nYour equity (${equity.toFixed(1)}%) is less than the pot odds require (${equityNeeded.toFixed(1)}%). This call would be -EV in the long run.`;
      break;
    case 'call':
      if (equity >= equityNeeded) {
        explanation += `**Recommendation: CALL**\nYour equity (${equity.toFixed(1)}%) exceeds the pot odds (${equityNeeded.toFixed(1)}%), making this a profitable call.`;
      } else {
        explanation += `**Recommendation: CALL**\nWhile your direct equity (${equity.toFixed(1)}%) is slightly below pot odds, the implied odds (potential to win more if you hit) make this call profitable.`;
      }
      break;
    case 'raise':
      explanation += `**Recommendation: RAISE**\nWith ${madeHand?.description || 'a strong draw'}, you should raise for value and protection.`;
      break;
    case 'bet':
      explanation += `**Recommendation: BET**\nWith ${madeHand?.description || 'a strong hand'}, you should bet for value.`;
      break;
    case 'check':
      explanation += `**Recommendation: CHECK**\nWith no made hand, checking is the safest play to see a free card.`;
      break;
  }

  return explanation;
};

/**
 * Generate a random bet scenario for training
 */
export const generateBettingScenario = (
  bettingRound: BettingRound
): { pot: number; betToCall: number; playerChips: number; opponentChips: number } => {
  // Generate realistic betting scenarios using constants
  const basePot = GAME_CONSTANTS.basePot[bettingRound as keyof typeof GAME_CONSTANTS.basePot] || GAME_CONSTANTS.basePot.flop;
  const potVariance = Math.random() * 0.5 + 0.75; // 0.75x to 1.25x
  const pot = Math.round(basePot * potVariance);

  // Bet sizes typically range from 1/3 pot to full pot
  const betSizeFactor = Math.random() * 0.67 + 0.33; // 33% to 100% of pot
  const betToCall = Math.round(pot * betSizeFactor);

  // Standard stack sizes from constants
  const playerChips = GAME_CONSTANTS.defaultPlayerChips;
  const opponentChips = GAME_CONSTANTS.defaultOpponentChips;

  return { pot, betToCall, playerChips, opponentChips };
};
