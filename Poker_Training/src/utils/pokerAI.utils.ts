// AI UTILITIES TEMPORARILY DISABLED - Searching for better option
// These functions now directly use static ranges instead of trying AI first

import type { Card, Position, Action } from '../types';
// AI SERVICE DISABLED: import { pokerAPI } from '../services/api.service';
import { getCorrectAction, getExplanation } from './poker.utils';

/**
 * Gets action for a hand (AI disabled - uses static ranges only)
 */
export const getCorrectActionAI = async (
  hand: Card[],
  position: Position
): Promise<Action> => {
  // AI DISABLED - Directly use static ranges
  return getCorrectAction(hand, position);

  /* ORIGINAL AI IMPLEMENTATION - Uncomment when ready
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return analysis.action;
  } catch (error) {
    console.error('AI analysis failed, falling back to static ranges:', error);
    return getCorrectAction(hand, position);
  }
  */
};

/**
 * Gets explanation for a hand (AI disabled - uses static explanation only)
 */
export const getExplanationAI = async (
  hand: Card[],
  position: Position
): Promise<{ explanation: string; reasoning?: string; confidence?: number }> => {
  // AI DISABLED - Directly use static explanation
  const action = getCorrectAction(hand, position);
  return {
    explanation: getExplanation(hand, position, action)
  };

  /* ORIGINAL AI IMPLEMENTATION - Uncomment when ready
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return {
      explanation: analysis.explanation,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence
    };
  } catch (error) {
    console.error('AI explanation failed, using static explanation:', error);
    const action = getCorrectAction(hand, position);
    return {
      explanation: getExplanation(hand, position, action)
    };
  }
  */
};

/**
 * Gets full analysis for a hand (AI disabled - uses static ranges only)
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
  // AI DISABLED - Directly use static ranges
  const action = getCorrectAction(hand, position);
  return {
    action,
    explanation: getExplanation(hand, position, action),
    reasoning: 'Based on standard GTO preflop ranges',
    confidence: 100,
    isAI: false
  };

  /* ORIGINAL AI IMPLEMENTATION - Uncomment when ready
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return {
      ...analysis,
      isAI: true
    };
  } catch (error) {
    console.error('Full AI analysis failed, using static ranges:', error);
    const action = getCorrectAction(hand, position);
    return {
      action,
      explanation: getExplanation(hand, position, action),
      reasoning: 'Based on standard GTO preflop ranges',
      confidence: 100,
      isAI: false
    };
  }
  */
};
