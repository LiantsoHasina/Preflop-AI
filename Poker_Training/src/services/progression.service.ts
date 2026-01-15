import { authService } from './auth.service';
import type { Position, BettingRound } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export type GameMode = 'preflop-only' | 'postflop-only' | 'full-game' | 'play-poker' | 'multiplayer';

export interface PreflopProgression {
  totalHands: number;
  correctAnswers: number;
  bestStreak: number;
  positionStats: {
    [key in Position]: { correct: number; total: number };
  };
  lastUpdated: string;
}

export interface PostflopProgression {
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
  lastUpdated: string;
}

export interface FullGameProgression {
  totalHands: number;
  preflopCorrect: number;
  preflopTotal: number;
  postflopCorrect: number;
  postflopTotal: number;
  bestStreak: number;
  positionStats: {
    [key in Position]: { correct: number; total: number };
  };
  streetStats: {
    flop: { correct: number; total: number };
    turn: { correct: number; total: number };
    river: { correct: number; total: number };
  };
  lastUpdated: string;
}

export interface PlayPokerProgression {
  gamesPlayed: number;
  handsPlayed: number;
  totalWinnings: number;
  biggestPot: number;
  showdownWins: number;
  showdownsReached: number;
  correctPreflopDecisions: number;
  totalPreflopDecisions: number;
  correctPostflopDecisions: number;
  totalPostflopDecisions: number;
  optimalBluffs: number;
  totalBluffAttempts: number;
  optimalValueBets: number;
  totalValueBetAttempts: number;
  lastUpdated: string;
}

export type Progression = PreflopProgression | PostflopProgression | FullGameProgression | PlayPokerProgression;

class ProgressionService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: authService.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated');
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getProgression(mode: GameMode): Promise<Progression | null> {
    if (!authService.isAuthenticated()) return null;

    try {
      const data = await this.fetch<{ progression: Progression }>(`/progression/${mode}`);
      return data.progression;
    } catch {
      return null;
    }
  }

  async getAllProgressions(): Promise<Record<GameMode, Progression | null>> {
    if (!authService.isAuthenticated()) {
      return {
        'preflop-only': null,
        'postflop-only': null,
        'full-game': null,
        'play-poker': null,
        'multiplayer': null
      };
    }

    try {
      const data = await this.fetch<{ progressions: Record<GameMode, Progression | null> }>('/progression');
      return data.progressions;
    } catch {
      return {
        'preflop-only': null,
        'postflop-only': null,
        'full-game': null,
        'play-poker': null,
        'multiplayer': null
      };
    }
  }

  // Preflop-only mode update
  async updatePreflopProgress(
    position: Position,
    isCorrect: boolean,
    currentStreak: number
  ): Promise<PreflopProgression | null> {
    if (!authService.isAuthenticated()) return null;

    try {
      const data = await this.fetch<{ progression: PreflopProgression }>('/progression/preflop-only', {
        method: 'POST',
        body: JSON.stringify({ position, isCorrect, currentStreak })
      });
      return data.progression;
    } catch {
      return null;
    }
  }

  // Postflop-only mode update
  async updatePostflopProgress(
    street: BettingRound,
    decisionType: 'call' | 'fold' | 'raise',
    isCorrect: boolean,
    currentStreak: number
  ): Promise<PostflopProgression | null> {
    if (!authService.isAuthenticated()) return null;

    try {
      const data = await this.fetch<{ progression: PostflopProgression }>('/progression/postflop-only', {
        method: 'POST',
        body: JSON.stringify({ street, decisionType, isCorrect, currentStreak })
      });
      return data.progression;
    } catch {
      return null;
    }
  }

  // Full-game mode update
  async updateFullGameProgress(
    phase: 'preflop' | 'postflop',
    isCorrect: boolean,
    currentStreak: number,
    position?: Position,
    street?: BettingRound
  ): Promise<FullGameProgression | null> {
    if (!authService.isAuthenticated()) return null;

    try {
      const data = await this.fetch<{ progression: FullGameProgression }>('/progression/full-game', {
        method: 'POST',
        body: JSON.stringify({ phase, position, street, isCorrect, currentStreak })
      });
      return data.progression;
    } catch {
      return null;
    }
  }

  // Play-poker mode update
  async updatePlayPokerProgress(update: {
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
  }): Promise<PlayPokerProgression | null> {
    if (!authService.isAuthenticated()) return null;

    try {
      const data = await this.fetch<{ progression: PlayPokerProgression }>('/progression/play-poker', {
        method: 'POST',
        body: JSON.stringify(update)
      });
      return data.progression;
    } catch {
      return null;
    }
  }

  // Reset progression for a mode
  async resetProgression(mode: GameMode): Promise<boolean> {
    if (!authService.isAuthenticated()) return false;

    try {
      await this.fetch(`/progression/${mode}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }
}

export const progressionService = new ProgressionService();
