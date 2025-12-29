import type {
  Card,
  PokerPlayer,
  PokerGameState,
  PokerGameSettings,
  MultiplayerAction,
  BettingRound,
  ActionRecord
} from '../types';
import { generateDeck } from './postflop.utils';
import { evaluateHand, determineWinners } from './handEvaluation.utils';
import { getCPUAction, getCPUPlayerName } from './cpuAI.utils';

/**
 * Create a shuffled deck
 */
export const createShuffledDeck = (): Card[] => {
  const deck = generateDeck();
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

/**
 * Initialize a new poker game
 */
export const initializeGame = (settings: PokerGameSettings): PokerGameState => {
  const deck = createShuffledDeck();
  const players: PokerPlayer[] = [];

  // Create human player (always seat 0)
  players.push({
    id: 0,
    name: settings.playerName || 'You',
    chips: settings.buyIn,
    holeCards: [],
    currentBet: 0,
    totalBetThisRound: 0,
    status: 'active',
    isHuman: true,
    isDealer: false,
    position: 0,
    hasActed: false
  });

  // Create CPU players
  for (let i = 1; i < settings.playerCount; i++) {
    players.push({
      id: i,
      name: getCPUPlayerName(i),
      chips: settings.buyIn,
      holeCards: [],
      currentBet: 0,
      totalBetThisRound: 0,
      status: 'active',
      isHuman: false,
      isDealer: false,
      position: i,
      hasActed: false
    });
  }

  // Random dealer position
  const dealerPosition = Math.floor(Math.random() * settings.playerCount);
  const smallBlindPosition = (dealerPosition + 1) % settings.playerCount;
  const bigBlindPosition = (dealerPosition + 2) % settings.playerCount;

  players[dealerPosition].isDealer = true;

  return {
    settings,
    players,
    humanPlayerId: 0,
    dealerPosition,
    smallBlindPosition,
    bigBlindPosition,
    bettingRound: 'preflop',
    currentPlayerIndex: (bigBlindPosition + 1) % settings.playerCount,
    currentBet: settings.bigBlind,
    minRaise: settings.bigBlind,
    communityCards: [],
    deck,
    pot: 0,
    sidePots: [],
    isHandComplete: false,
    isGameOver: false,
    winners: [],
    actionHistory: [],
    showdown: false,
    waitingForHumanAction: false
  };
};

/**
 * Deal hole cards to all players
 */
export const dealHoleCards = (state: PokerGameState): PokerGameState => {
  const newState = { ...state };
  let deckIndex = 0;

  // Deal 2 cards to each player
  for (const player of newState.players) {
    if (player.status !== 'out') {
      player.holeCards = [newState.deck[deckIndex], newState.deck[deckIndex + 1]];
      deckIndex += 2;
    }
  }

  // Remove dealt cards from deck
  newState.deck = newState.deck.slice(deckIndex);

  return newState;
};

/**
 * Post blinds
 */
export const postBlinds = (state: PokerGameState): PokerGameState => {
  const newState = { ...state };
  const { smallBlind, bigBlind } = newState.settings;

  // Small blind
  const sbPlayer = newState.players[newState.smallBlindPosition];
  const sbAmount = Math.min(smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  sbPlayer.totalBetThisRound = sbAmount;
  newState.pot += sbAmount;

  // Big blind
  const bbPlayer = newState.players[newState.bigBlindPosition];
  const bbAmount = Math.min(bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  bbPlayer.totalBetThisRound = bbAmount;
  newState.pot += bbAmount;

  newState.currentBet = bigBlind;

  return newState;
};

/**
 * Deal community cards for current round (for multiplayer game state)
 */
const dealCommunityCardsForRound = (state: PokerGameState): PokerGameState => {
  const newState = { ...state };

  switch (newState.bettingRound) {
    case 'flop':
      // Burn one, deal 3
      newState.communityCards = newState.deck.slice(1, 4);
      newState.deck = newState.deck.slice(4);
      break;
    case 'turn':
      // Burn one, deal 1
      newState.communityCards = [...newState.communityCards, newState.deck[1]];
      newState.deck = newState.deck.slice(2);
      break;
    case 'river':
      // Burn one, deal 1
      newState.communityCards = [...newState.communityCards, newState.deck[1]];
      newState.deck = newState.deck.slice(2);
      break;
  }

  return newState;
};

/**
 * Process a player action
 */
export const processAction = (
  state: PokerGameState,
  playerId: number,
  action: MultiplayerAction,
  amount: number = 0,
  reasoning?: string
): PokerGameState => {
  const newState = { ...state };
  const player = newState.players.find(p => p.id === playerId)!;
  const toCall = newState.currentBet - player.currentBet;

  // Record the action
  const actionRecord: ActionRecord = {
    playerId,
    playerName: player.name,
    action,
    amount,
    potBefore: newState.pot,
    potAfter: newState.pot,
    bettingRound: newState.bettingRound,
    communityCards: [...newState.communityCards],
    playerHoleCards: [...player.holeCards],
    reasoning
  };

  switch (action) {
    case 'fold':
      player.status = 'folded';
      break;

    case 'check':
      // No action needed
      break;

    case 'call':
      const callAmount = Math.min(toCall, player.chips);
      player.chips -= callAmount;
      player.currentBet += callAmount;
      player.totalBetThisRound += callAmount;
      newState.pot += callAmount;
      if (player.chips === 0) player.status = 'all-in';
      break;

    case 'bet':
    case 'raise':
      const raiseAmount = Math.min(amount, player.chips);
      const additionalBet = raiseAmount - player.currentBet;
      player.chips -= additionalBet;
      newState.pot += additionalBet;
      newState.minRaise = raiseAmount - newState.currentBet;
      newState.currentBet = raiseAmount;
      player.currentBet = raiseAmount;
      player.totalBetThisRound += additionalBet;
      if (player.chips === 0) player.status = 'all-in';
      // Reset hasActed for other players when there's a raise
      newState.players.forEach(p => {
        if (p.id !== playerId && p.status === 'active') {
          p.hasActed = false;
        }
      });
      break;

    case 'all-in':
      const allInAmount = player.chips;
      newState.pot += allInAmount;
      if (player.currentBet + allInAmount > newState.currentBet) {
        newState.minRaise = (player.currentBet + allInAmount) - newState.currentBet;
        newState.currentBet = player.currentBet + allInAmount;
        // Reset hasActed for other players
        newState.players.forEach(p => {
          if (p.id !== playerId && p.status === 'active') {
            p.hasActed = false;
          }
        });
      }
      player.currentBet += allInAmount;
      player.totalBetThisRound += allInAmount;
      player.chips = 0;
      player.status = 'all-in';
      break;
  }

  player.hasActed = true;
  actionRecord.potAfter = newState.pot;
  actionRecord.amount = action === 'fold' || action === 'check' ? 0 : amount;
  newState.actionHistory.push(actionRecord);

  return newState;
};

/**
 * Get active players (not folded, not out)
 */
export const getActivePlayers = (state: PokerGameState): PokerPlayer[] => {
  return state.players.filter(p => p.status === 'active' || p.status === 'all-in');
};

/**
 * Get players who can still act
 */
export const getActingPlayers = (state: PokerGameState): PokerPlayer[] => {
  return state.players.filter(p => p.status === 'active');
};

/**
 * Check if betting round is complete
 */
export const isBettingRoundComplete = (state: PokerGameState): boolean => {
  const actingPlayers = getActingPlayers(state);

  // If only one player can act, round is complete
  if (actingPlayers.length <= 1) return true;

  // All players must have acted and bets must be equal
  const allActed = actingPlayers.every(p => p.hasActed);
  const betsEqual = actingPlayers.every(p => p.currentBet === state.currentBet);

  return allActed && betsEqual;
};

/**
 * Check if hand is over (only one player left or showdown)
 */
export const isHandOver = (state: PokerGameState): boolean => {
  const activePlayers = getActivePlayers(state);
  return activePlayers.length <= 1 || (state.bettingRound === 'river' && isBettingRoundComplete(state));
};

/**
 * Move to next betting round
 */
export const advanceToNextRound = (state: PokerGameState): PokerGameState => {
  const newState = { ...state };

  // Reset betting for new round
  newState.players.forEach(p => {
    p.currentBet = 0;
    p.hasActed = false;
  });
  newState.currentBet = 0;
  newState.minRaise = newState.settings.bigBlind;

  // Advance round
  const roundOrder: BettingRound[] = ['preflop', 'flop', 'turn', 'river'];
  const currentIndex = roundOrder.indexOf(newState.bettingRound);

  if (currentIndex < roundOrder.length - 1) {
    newState.bettingRound = roundOrder[currentIndex + 1];

    // Deal community cards
    const withCards = dealCommunityCardsForRound(newState);
    Object.assign(newState, withCards);
  }

  // First to act is first active player after dealer
  let nextActor = (newState.dealerPosition + 1) % newState.players.length;
  while (newState.players[nextActor].status !== 'active') {
    nextActor = (nextActor + 1) % newState.players.length;
    if (nextActor === newState.dealerPosition) break;
  }
  newState.currentPlayerIndex = nextActor;

  return newState;
};

/**
 * Get next player to act
 */
export const getNextPlayer = (state: PokerGameState): number => {
  let next = (state.currentPlayerIndex + 1) % state.players.length;
  let attempts = 0;

  while (state.players[next].status !== 'active' && attempts < state.players.length) {
    next = (next + 1) % state.players.length;
    attempts++;
  }

  return next;
};

/**
 * Determine and distribute winnings
 */
export const resolveHand = (state: PokerGameState): PokerGameState => {
  const newState = { ...state };
  const activePlayers = getActivePlayers(state);

  if (activePlayers.length === 1) {
    // Only one player left - they win
    const winner = activePlayers[0];
    winner.chips += newState.pot;
    newState.winners = [{
      playerId: winner.id,
      playerName: winner.name,
      amount: newState.pot,
      hand: evaluateHand(winner.holeCards, newState.communityCards),
      holeCards: winner.holeCards
    }];
  } else {
    // Showdown - determine winners
    const winnersData = determineWinners(
      activePlayers.map(p => ({ id: p.id, name: p.name, holeCards: p.holeCards })),
      newState.communityCards
    );

    const potPerWinner = Math.floor(newState.pot / winnersData.length);

    newState.winners = winnersData.map(w => ({
      playerId: w.playerId,
      playerName: w.playerName,
      amount: potPerWinner,
      hand: w.hand,
      holeCards: w.holeCards
    }));

    // Distribute winnings
    for (const winner of newState.winners) {
      const player = newState.players.find(p => p.id === winner.playerId)!;
      player.chips += winner.amount;
    }

    newState.showdown = true;
  }

  newState.pot = 0;
  newState.isHandComplete = true;

  return newState;
};

/**
 * Start a new hand
 */
export const startNewHand = (state: PokerGameState): PokerGameState => {
  // Remove players with no chips
  const activePlayers = state.players.filter(p => p.chips > 0);

  if (activePlayers.length <= 1) {
    return { ...state, isGameOver: true };
  }

  // Reset for new hand
  const newState = { ...state };
  newState.deck = createShuffledDeck();
  newState.communityCards = [];
  newState.pot = 0;
  newState.sidePots = [];
  newState.bettingRound = 'preflop';
  newState.isHandComplete = false;
  newState.showdown = false;
  newState.winners = [];
  newState.actionHistory = [];

  // Reset players
  newState.players.forEach(p => {
    p.holeCards = [];
    p.currentBet = 0;
    p.totalBetThisRound = 0;
    p.hasActed = false;
    p.isDealer = false;
    if (p.chips > 0) {
      p.status = 'active';
    } else {
      p.status = 'out';
    }
  });

  // Move dealer button
  let newDealer = (newState.dealerPosition + 1) % newState.players.length;
  while (newState.players[newDealer].status === 'out') {
    newDealer = (newDealer + 1) % newState.players.length;
  }
  newState.dealerPosition = newDealer;
  newState.players[newDealer].isDealer = true;

  // Set blinds positions
  let sb = (newDealer + 1) % newState.players.length;
  while (newState.players[sb].status === 'out') {
    sb = (sb + 1) % newState.players.length;
  }
  newState.smallBlindPosition = sb;

  let bb = (sb + 1) % newState.players.length;
  while (newState.players[bb].status === 'out') {
    bb = (bb + 1) % newState.players.length;
  }
  newState.bigBlindPosition = bb;

  // First to act after BB
  let firstActor = (bb + 1) % newState.players.length;
  while (newState.players[firstActor].status === 'out') {
    firstActor = (firstActor + 1) % newState.players.length;
  }
  newState.currentPlayerIndex = firstActor;

  newState.currentBet = newState.settings.bigBlind;
  newState.minRaise = newState.settings.bigBlind;

  // Deal and post blinds
  const withCards = dealHoleCards(newState);
  const withBlinds = postBlinds(withCards);

  return withBlinds;
};

/**
 * Get available actions for current player
 */
export const getAvailableActions = (state: PokerGameState): MultiplayerAction[] => {
  const player = state.players[state.currentPlayerIndex];
  const toCall = state.currentBet - player.currentBet;
  const actions: MultiplayerAction[] = [];

  if (toCall === 0) {
    actions.push('check');
    if (player.chips > 0) {
      actions.push('bet');
    }
  } else {
    actions.push('fold');
    if (player.chips >= toCall) {
      actions.push('call');
    }
    if (player.chips > toCall + state.minRaise) {
      actions.push('raise');
    }
  }

  if (player.chips > 0) {
    actions.push('all-in');
  }

  return actions;
};

/**
 * Calculate pot size shortcuts
 */
export const getPotSizeAmounts = (
  state: PokerGameState,
  playerId: number
): { half: number; twoThirds: number; full: number } => {
  const player = state.players.find(p => p.id === playerId)!;
  const toCall = state.currentBet - player.currentBet;
  const effectivePot = state.pot + toCall;

  return {
    half: Math.min(Math.round(effectivePot * 0.5), player.chips),
    twoThirds: Math.min(Math.round(effectivePot * 0.67), player.chips),
    full: Math.min(effectivePot, player.chips)
  };
};

/**
 * Run CPU player turn
 */
export const runCPUTurn = (state: PokerGameState): PokerGameState => {
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.isHuman || currentPlayer.status !== 'active') {
    return state;
  }

  const { action, amount, reasoning } = getCPUAction(currentPlayer, state);
  let newState = processAction(state, currentPlayer.id, action, amount, reasoning);

  // Move to next player or advance round
  if (isBettingRoundComplete(newState)) {
    if (isHandOver(newState)) {
      newState = resolveHand(newState);
    } else {
      newState = advanceToNextRound(newState);
    }
  } else {
    newState.currentPlayerIndex = getNextPlayer(newState);
  }

  return newState;
};
