/**
 * Math utility functions used across the application
 */

/**
 * Calculate percentage with optional decimal places
 */
export const calculatePercentage = (value: number, total: number, decimals: number = 0): number => {
  if (total === 0) return 0;
  const result = (value / total) * 100;
  return decimals > 0 ? Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(result);
};

/**
 * Calculate accuracy as a percentage (0-100)
 */
export const calculateAccuracy = (correct: number, total: number): number => {
  return calculatePercentage(correct, total);
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Find the maximum value from an array using a selector function
 */
export const findMax = <T>(items: T[], selector: (item: T) => number): number => {
  if (items.length === 0) return 0;
  return Math.max(...items.map(selector));
};

/**
 * Find the minimum value from an array using a selector function
 */
export const findMin = <T>(items: T[], selector: (item: T) => number): number => {
  if (items.length === 0) return 0;
  return Math.min(...items.map(selector));
};

/**
 * Calculate the sum of values using a selector function
 */
export const sum = <T>(items: T[], selector: (item: T) => number): number => {
  return items.reduce((acc, item) => acc + selector(item), 0);
};

/**
 * Calculate pot odds as a percentage
 */
export const calculatePotOdds = (betToCall: number, potSize: number): number => {
  if (betToCall === 0) return 0;
  return calculatePercentage(betToCall, potSize + betToCall, 1);
};

/**
 * Calculate equity needed to call based on pot odds
 */
export const calculateEquityNeeded = (betToCall: number, potSize: number): number => {
  return calculatePotOdds(betToCall, potSize);
};

/**
 * Calculate implied odds multiplier based on stack depth
 */
export const calculateImpliedOdds = (
  potOdds: number,
  stackDepth: number,
  drawStrength: 'weak' | 'medium' | 'strong' = 'medium'
): number => {
  const multipliers = {
    weak: 1.0,
    medium: 1.25,
    strong: 1.5
  };

  const baseMultiplier = multipliers[drawStrength];
  const stackMultiplier = Math.min(stackDepth / 50, 2); // Cap at 2x for deep stacks

  return potOdds * baseMultiplier * stackMultiplier;
};

/**
 * Round a number to specified decimal places
 */
export const roundTo = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Generate a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
