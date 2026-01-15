import type { Card, Position, Action } from '../types';
import { getCorrectAction, getExplanation } from './poker.utils';

/**
 * Gets action for a hand using static ranges
 * Note: AI functionality available in backend if needed in future
 */
export const getCorrectActionAI = async (
  hand: Card[],
  position: Position
): Promise<Action> => {
  return getCorrectAction(hand, position);
};

/**
 * Gets explanation for a hand using static explanation
 */
export const getExplanationAI = async (
  hand: Card[],
  position: Position
): Promise<{ explanation: string; reasoning?: string; confidence?: number }> => {
  const action = getCorrectAction(hand, position);
  return {
    explanation: getExplanation(hand, position, action)
  };
};

/**
 * Gets full analysis for a hand using static ranges
 */
export const getFullAnalysisAI = async (
  hand: Card[],
  position: Position
): Promise<{
  action: Action;
  explanation: string;
  reasoning: string;
  confidence: number;
  isAI: boolean;
}> => {
  const action = getCorrectAction(hand, position);
  return {
    action,
    explanation: getExplanation(hand, position, action),
    reasoning: 'Based on standard GTO preflop ranges',
    confidence: 100,
    isAI: false
  };
};
