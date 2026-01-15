import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { progressionService } from '../services/progression.service';
import type {
  GameMode,
  Progression,
  PreflopProgression,
  PostflopProgression,
  FullGameProgression,
  PlayPokerProgression
} from '../services/progression.service';
import type { Position, BettingRound } from '../types';

interface UseProgressionResult<T extends Progression> {
  progression: T | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Generic hook for any mode
export function useProgression<T extends Progression>(mode: GameMode): UseProgressionResult<T> {
  const { isAuthenticated } = useAuth();
  const [progression, setProgression] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgression = useCallback(async () => {
    if (!isAuthenticated) {
      setProgression(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await progressionService.getProgression(mode);
      setProgression(data as T | null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progression');
    } finally {
      setIsLoading(false);
    }
  }, [mode, isAuthenticated]);

  useEffect(() => {
    loadProgression();
  }, [loadProgression]);

  return {
    progression,
    isLoading,
    error,
    refresh: loadProgression
  };
}

// Preflop-specific hook with update function
export function usePreflopProgression() {
  const { isAuthenticated } = useAuth();
  const base = useProgression<PreflopProgression>('preflop-only');

  const updateProgress = useCallback(
    async (position: Position, isCorrect: boolean, currentStreak: number) => {
      if (!isAuthenticated) return null;

      const updated = await progressionService.updatePreflopProgress(
        position,
        isCorrect,
        currentStreak
      );
      if (updated) {
        base.refresh();
      }
      return updated;
    },
    [isAuthenticated, base]
  );

  return { ...base, updateProgress };
}

// Postflop-specific hook with update function
export function usePostflopProgression() {
  const { isAuthenticated } = useAuth();
  const base = useProgression<PostflopProgression>('postflop-only');

  const updateProgress = useCallback(
    async (
      street: BettingRound,
      decisionType: 'call' | 'fold' | 'raise',
      isCorrect: boolean,
      currentStreak: number
    ) => {
      if (!isAuthenticated) return null;

      const updated = await progressionService.updatePostflopProgress(
        street,
        decisionType,
        isCorrect,
        currentStreak
      );
      if (updated) {
        base.refresh();
      }
      return updated;
    },
    [isAuthenticated, base]
  );

  return { ...base, updateProgress };
}

// Full-game-specific hook with update function
export function useFullGameProgression() {
  const { isAuthenticated } = useAuth();
  const base = useProgression<FullGameProgression>('full-game');

  const updateProgress = useCallback(
    async (
      phase: 'preflop' | 'postflop',
      isCorrect: boolean,
      currentStreak: number,
      position?: Position,
      street?: BettingRound
    ) => {
      if (!isAuthenticated) return null;

      const updated = await progressionService.updateFullGameProgress(
        phase,
        isCorrect,
        currentStreak,
        position,
        street
      );
      if (updated) {
        base.refresh();
      }
      return updated;
    },
    [isAuthenticated, base]
  );

  return { ...base, updateProgress };
}

// Play-poker-specific hook with update function
export function usePlayPokerProgression() {
  const { isAuthenticated } = useAuth();
  const base = useProgression<PlayPokerProgression>('play-poker');

  const updateProgress = useCallback(
    async (update: {
      handComplete?: boolean;
      gameComplete?: boolean;
      winnings?: number;
      potSize?: number;
      reachedShowdown?: boolean;
      wonShowdown?: boolean;
      preflopDecisionCorrect?: boolean;
      postflopDecisionCorrect?: boolean;
      wasBluff?: boolean;
      bluffOptimal?: boolean;
      wasValueBet?: boolean;
      valueBetOptimal?: boolean;
    }) => {
      if (!isAuthenticated) return null;

      const updated = await progressionService.updatePlayPokerProgress(update);
      if (updated) {
        base.refresh();
      }
      return updated;
    },
    [isAuthenticated, base]
  );

  return { ...base, updateProgress };
}

// Hook to get all progressions at once
export function useAllProgressions() {
  const { isAuthenticated } = useAuth();
  const [progressions, setProgressions] = useState<Record<GameMode, Progression | null>>({
    'preflop-only': null,
    'postflop-only': null,
    'full-game': null,
    'play-poker': null,
    'multiplayer': null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await progressionService.getAllProgressions();
      setProgressions(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progressions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    } else {
      setProgressions({
        'preflop-only': null,
        'postflop-only': null,
        'full-game': null,
        'play-poker': null,
        'multiplayer': null
      });
      setIsLoading(false);
    }
  }, [isAuthenticated, loadAll]);

  return { progressions, isLoading, error, refresh: loadAll };
}
