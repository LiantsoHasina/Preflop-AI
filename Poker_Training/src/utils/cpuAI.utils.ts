import type {
  Card,
  PokerPlayer,
  PokerGameState,
  MultiplayerAction,
  BettingRound
} from '../types';
import { evaluateHand, getRankNumericValue } from './handEvaluation.utils';
import { getHandNotation } from './poker.utils';
import { preflopRanges } from '../constants';

/**
 * Calculate hand strength as a percentage (0-100)
 */
const calculateHandStrength = (
  holeCards: Card[],
  communityCards: Card[],
  bettingRound: BettingRound
): number => {
  if (bettingRound === 'preflop') {
    return calculatePreflopStrength(holeCards);
  }

  const hand = evaluateHand(holeCards, communityCards);

  // Base strength from hand rank
  const rankStrengths: Record<string, number> = {
    'royal-flush': 100,
    'straight-flush': 97,
    'four-of-a-kind': 93,
    'full-house': 85,
    'flush': 78,
    'straight': 72,
    'three-of-a-kind': 60,
    'two-pair': 50,
    'pair': 35,
    'high-card': 15
  };

  let strength = rankStrengths[hand.rank] || 15;

  // Adjust for kickers
  if (hand.kickers.length > 0) {
    strength += (hand.kickers[0] / 12) * 5;
  }

  return Math.min(100, strength);
};

/**
 * Calculate preflop hand strength
 */
const calculatePreflopStrength = (holeCards: Card[]): number => {
  const notation = getHandNotation(holeCards);
  const isPair = holeCards[0].rank === holeCards[1].rank;
  const isSuited = holeCards[0].suit === holeCards[1].suit;

  // Check premium hands
  const premiumPairs = ['AA', 'KK', 'QQ', 'JJ'];
  if (premiumPairs.includes(notation)) return 90 + (getRankNumericValue(holeCards[0].rank) - 9) * 2;

  // Check if in raise range for various positions
  const positions = ['UTG', 'MP', 'CO', 'BTN'] as const;
  let positionsInRange = 0;
  for (const pos of positions) {
    if (preflopRanges[pos].raise.includes(notation)) positionsInRange++;
    if (preflopRanges[pos].call.includes(notation)) positionsInRange += 0.5;
  }

  // High cards matter
  const highCardValue = Math.max(
    getRankNumericValue(holeCards[0].rank),
    getRankNumericValue(holeCards[1].rank)
  );

  let strength = 20 + positionsInRange * 12 + highCardValue * 2;

  // Suited bonus
  if (isSuited) strength += 5;

  // Pair bonus
  if (isPair) strength += 15;

  // Connected cards bonus
  const gap = Math.abs(
    getRankNumericValue(holeCards[0].rank) - getRankNumericValue(holeCards[1].rank)
  );
  if (gap <= 2) strength += (3 - gap) * 3;

  return Math.min(95, Math.max(10, strength));
};

/**
 * Calculate pot odds
 */
const calculatePotOdds = (pot: number, toCall: number): number => {
  if (toCall === 0) return 0;
  return (toCall / (pot + toCall)) * 100;
};

/**
 * Determine CPU action based on game state
 */
export const getCPUAction = (
  player: PokerPlayer,
  gameState: PokerGameState
): { action: MultiplayerAction; amount: number; reasoning: string } => {
  const { bettingRound, pot, currentBet, minRaise, communityCards } = gameState;
  const toCall = currentBet - player.currentBet;
  const canCheck = toCall === 0;

  // Calculate hand strength
  const handStrength = calculateHandStrength(player.holeCards, communityCards, bettingRound);
  const potOdds = calculatePotOdds(pot, toCall);

  // Add some randomness for variety (±10%)
  const randomFactor = (Math.random() - 0.5) * 20;
  const adjustedStrength = handStrength + randomFactor;

  // Stack consideration
  const isShortStacked = player.chips < gameState.settings.bigBlind * 10;

  // Decision logic
  let action: MultiplayerAction;
  let amount = 0;
  let reasoning = '';

  // Preflop logic
  if (bettingRound === 'preflop') {
    if (adjustedStrength >= 80) {
      // Premium hand - raise/re-raise
      if (toCall === 0 || currentBet <= gameState.settings.bigBlind) {
        action = 'raise';
        amount = Math.min(pot + currentBet * 3, player.chips);
        reasoning = 'Premium hand, raising for value';
      } else if (adjustedStrength >= 90) {
        action = 'raise';
        amount = Math.min(currentBet * 3, player.chips);
        reasoning = 'Premium hand, 3-betting for value';
      } else {
        action = 'call';
        amount = toCall;
        reasoning = 'Strong hand, calling to see flop';
      }
    } else if (adjustedStrength >= 55) {
      // Playable hand
      if (canCheck) {
        action = 'check';
        reasoning = 'Decent hand, checking to see flop';
      } else if (toCall <= gameState.settings.bigBlind * 3) {
        action = 'call';
        amount = toCall;
        reasoning = 'Playable hand, calling small raise';
      } else {
        action = 'fold';
        reasoning = 'Hand not strong enough for large raise';
      }
    } else if (adjustedStrength >= 35 && canCheck) {
      action = 'check';
      reasoning = 'Marginal hand, checking from big blind';
    } else if (adjustedStrength >= 35 && toCall <= gameState.settings.bigBlind) {
      action = 'call';
      amount = toCall;
      reasoning = 'Getting good pot odds to see flop';
    } else {
      action = 'fold';
      reasoning = 'Hand too weak to continue';
    }
  } else {
    // Postflop logic
    if (adjustedStrength >= 85) {
      // Monster hand - bet/raise for value
      if (canCheck && Math.random() > 0.3) {
        // Sometimes check to trap
        action = 'check';
        reasoning = 'Strong hand, checking to trap';
      } else if (currentBet > 0) {
        action = 'raise';
        amount = Math.min(currentBet * 2.5, player.chips);
        reasoning = 'Strong hand, raising for value';
      } else {
        action = 'bet';
        amount = Math.round(pot * (0.6 + Math.random() * 0.4));
        reasoning = 'Strong hand, betting for value';
      }
    } else if (adjustedStrength >= 60) {
      // Good hand
      if (canCheck) {
        if (Math.random() > 0.5) {
          action = 'bet';
          amount = Math.round(pot * 0.5);
          reasoning = 'Good hand, betting for value';
        } else {
          action = 'check';
          reasoning = 'Good hand, checking to control pot';
        }
      } else if (potOdds < adjustedStrength - 10) {
        action = 'call';
        amount = toCall;
        reasoning = 'Good hand with proper pot odds';
      } else {
        action = 'fold';
        reasoning = 'Pot odds not favorable';
      }
    } else if (adjustedStrength >= 40) {
      // Marginal hand
      if (canCheck) {
        action = 'check';
        reasoning = 'Marginal hand, checking';
      } else if (toCall <= pot * 0.3 && potOdds < adjustedStrength) {
        action = 'call';
        amount = toCall;
        reasoning = 'Small bet, worth calling with draws';
      } else {
        action = 'fold';
        reasoning = 'Marginal hand facing bet';
      }
    } else {
      // Weak hand - sometimes bluff
      if (canCheck) {
        if (Math.random() > 0.85) {
          action = 'bet';
          amount = Math.round(pot * 0.5);
          reasoning = 'Bluff bet';
        } else {
          action = 'check';
          reasoning = 'Weak hand, checking';
        }
      } else {
        action = 'fold';
        reasoning = 'Hand too weak to continue';
      }
    }
  }

  // Handle all-in situations
  if (action === 'raise' || action === 'bet') {
    if (amount >= player.chips) {
      action = 'all-in';
      amount = player.chips;
      reasoning = isShortStacked ? 'Short-stacked, going all-in' : 'Committing all chips with strong hand';
    } else if (amount < minRaise && action === 'raise') {
      // Minimum raise requirement
      if (minRaise >= player.chips) {
        action = 'all-in';
        amount = player.chips;
      } else {
        amount = minRaise;
      }
    }
  }

  if (action === 'call' && toCall >= player.chips) {
    action = 'all-in';
    amount = player.chips;
    reasoning = 'Calling all-in';
  }

  return { action, amount, reasoning };
};

/**
 * Get CPU player names
 */
export const getCPUPlayerName = (index: number): string => {
  const names = [
    'Alex', 'Blake', 'Casey', 'Drew', 'Ellis',
    'Flynn', 'Gray', 'Harper', 'Jordan'
  ];
  return names[index % names.length];
};
