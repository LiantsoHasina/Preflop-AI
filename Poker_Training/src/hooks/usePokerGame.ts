import { useState, useCallback } from 'react';
import type { PokerGameState, PokerGameSettings, MultiplayerAction } from '../types';
import {
  initializeGame,
  startNewHand,
  processAction,
  runCPUTurn,
  isBettingRoundComplete,
  isHandOver,
  advanceToNextRound,
  resolveHand,
  getNextPlayer,
  getActivePlayers
} from '../utils';

export type GamePhase = 'setup' | 'playing' | 'analysis';

interface UsePokerGameResult {
  gameState: PokerGameState | null;
  phase: GamePhase;
  isProcessing: boolean;
  handNumber: number;
  error: string | null;
  startGame: (settings: PokerGameSettings) => void;
  handleAction: (action: MultiplayerAction, amount?: number) => void;
  continueToNextHand: () => void;
  startNewGame: () => void;
  viewResults: () => void;
  clearError: () => void;
}

export function usePokerGame(): UsePokerGameResult {
  const [gameState, setGameState] = useState<PokerGameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [handNumber, setHandNumber] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Process CPU turns with real-time UI updates
  const processCPUTurns = useCallback(async (
    state: PokerGameState,
    onStateUpdate?: (state: PokerGameState) => void
  ): Promise<PokerGameState> => {
    let currentState = state;

    while (true) {
      if (currentState.isHandComplete) break;

      const currentPlayer = currentState.players[currentState.currentPlayerIndex];

      // If it's human's turn and they're still active, stop and wait
      if (currentPlayer.isHuman && currentPlayer.status === 'active') {
        currentState.waitingForHumanAction = true;
        break;
      }

      // If current player is not active, move to next
      if (currentPlayer.status !== 'active') {
        if (isBettingRoundComplete(currentState)) {
          if (isHandOver(currentState)) {
            currentState = resolveHand(currentState);
            onStateUpdate?.(currentState);
            break;
          } else {
            currentState = advanceToNextRound(currentState);
            onStateUpdate?.(currentState);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } else {
          currentState = {
            ...currentState,
            currentPlayerIndex: getNextPlayer(currentState)
          };
        }
        continue;
      }

      // Update UI to show whose turn it is
      onStateUpdate?.(currentState);
      await new Promise(resolve => setTimeout(resolve, 700));

      // Run CPU turn
      currentState = runCPUTurn(currentState);
      onStateUpdate?.(currentState);

      // Check if only one player left
      const activePlayers = getActivePlayers(currentState);
      if (activePlayers.length === 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
        currentState = resolveHand(currentState);
        onStateUpdate?.(currentState);
        break;
      }
    }

    return currentState;
  }, []);

  // Start a new game
  const startGame = useCallback((settings: PokerGameSettings) => {
    const initialState = initializeGame(settings);
    const withHand = startNewHand(initialState);
    setGameState(withHand);
    setPhase('playing');
    setHandNumber(1);
    setIsProcessing(true);

    processCPUTurns(withHand, setGameState)
      .then(newState => {
        setGameState(newState);
        setIsProcessing(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to process CPU turns');
        setIsProcessing(false);
      });
  }, [processCPUTurns]);

  // Handle human player action
  const handleAction = useCallback((action: MultiplayerAction, amount?: number) => {
    if (!gameState || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    const humanPlayer = gameState.players.find(p => p.isHuman);
    if (!humanPlayer) {
      setError('Human player not found');
      setIsProcessing(false);
      return;
    }
    let newState = processAction(gameState, humanPlayer.id, action, amount || 0);

    // Check if betting round complete or hand over
    if (isBettingRoundComplete(newState)) {
      if (isHandOver(newState)) {
        newState = resolveHand(newState);
        setGameState(newState);
        setIsProcessing(false);
        return;
      } else {
        newState = advanceToNextRound(newState);
      }
    } else {
      newState = {
        ...newState,
        currentPlayerIndex: getNextPlayer(newState)
      };
    }

    // Check if only one player left
    const activePlayers = getActivePlayers(newState);
    if (activePlayers.length === 1) {
      newState = resolveHand(newState);
      setGameState(newState);
      setIsProcessing(false);
      return;
    }

    setGameState(newState);

    processCPUTurns(newState, setGameState)
      .then(finalState => {
        setGameState(finalState);
        setIsProcessing(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to process CPU turns');
        setIsProcessing(false);
      });
  }, [gameState, isProcessing, processCPUTurns]);

  // Continue to next hand
  const continueToNextHand = useCallback(() => {
    if (!gameState) return;

    if (gameState.isGameOver) {
      setPhase('setup');
      setGameState(null);
      return;
    }

    setIsProcessing(true);
    const newHand = startNewHand(gameState);
    setHandNumber(prev => prev + 1);

    if (newHand.isGameOver) {
      setGameState(newHand);
      setIsProcessing(false);
      return;
    }

    setGameState(newHand);
    setPhase('playing');

    processCPUTurns(newHand, setGameState)
      .then(newState => {
        setGameState(newState);
        setIsProcessing(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to process CPU turns');
        setIsProcessing(false);
      });
  }, [gameState, processCPUTurns]);

  // Start new game (reset)
  const startNewGame = useCallback(() => {
    setPhase('setup');
    setGameState(null);
    setHandNumber(0);
    setError(null);
  }, []);

  // View analysis results
  const viewResults = useCallback(() => {
    setPhase('analysis');
  }, []);

  return {
    gameState,
    phase,
    isProcessing,
    handNumber,
    error,
    startGame,
    handleAction,
    continueToNextHand,
    startNewGame,
    viewResults,
    clearError
  };
}
