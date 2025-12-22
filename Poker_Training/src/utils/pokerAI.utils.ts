import type { Card, Position, Action } from '../types';
import { pokerAPI } from '../services/api.service';
import { getCorrectAction, getExplanation } from './poker.utils';

/**
 * Gets AI-powered action for a hand (with fallback to static ranges)
 */
export const getCorrectActionAI = async (
  hand: Card[],
  position: Position
): Promise<Action> => {
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return analysis.action;
  } catch (error) {
    console.error('AI analysis failed, falling back to static ranges:', error);
    // Fallback to static ranges
    return getCorrectAction(hand, position);
  }
};

/**
 * Gets AI-powered explanation for a hand (with fallback to static explanation)
 */
export const getExplanationAI = async (
  hand: Card[],
  position: Position
): Promise<{ explanation: string; reasoning?: string; confidence?: number }> => {
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return {
      explanation: analysis.explanation,
      reasoning: analysis.reasoning,
      confidence: analysis.confidence
    };
  } catch (error) {
    console.error('AI explanation failed, using static explanation:', error);
    // Fallback to static explanation
    const action = getCorrectAction(hand, position);
    return {
      explanation: getExplanation(hand, position, action)
    };
  }
};

/**
 * Gets full AI analysis for a hand
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
  try {
    const analysis = await pokerAPI.analyzeHand(hand, position);
    return {
      ...analysis,
      isAI: true
    };
  } catch (error) {
    console.error('Full AI analysis failed, using static ranges:', error);
    // Fallback to static
    const action = getCorrectAction(hand, position);
    return {
      action,
      explanation: getExplanation(hand, position, action),
      reasoning: 'Based on standard GTO preflop ranges',
      confidence: 100,
      isAI: false
    };
  }
};
