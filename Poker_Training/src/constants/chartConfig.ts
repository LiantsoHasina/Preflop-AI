// Shared chart configuration and colors for Recharts

// Chart colors for different data types
export const CHART_COLORS = {
  // Primary colors for main metrics
  primary: '#10B981',     // Green
  secondary: '#3B82F6',   // Blue
  tertiary: '#8B5CF6',    // Purple
  quaternary: '#F59E0B',  // Amber

  // Action colors (poker-specific)
  raise: '#22C55E',       // Green
  call: '#F59E0B',        // Amber
  fold: '#EF4444',        // Red

  // Street colors
  flop: '#10B981',        // Green
  turn: '#3B82F6',        // Blue
  river: '#8B5CF6',       // Purple

  // UI colors
  grid: '#374151',        // Gray-700
  axis: '#9CA3AF',        // Gray-400
  text: '#F3F4F6',        // Gray-100

  // Status colors
  good: '#22C55E',
  ok: '#F59E0B',
  poor: '#EF4444',
} as const;

// Position colors (for preflop stats)
export const POSITION_COLORS: Record<string, string> = {
  UTG: '#EF4444',
  'UTG+1': '#F97316',
  'UTG+2': '#F59E0B',
  LJ: '#EAB308',
  HJ: '#84CC16',
  CO: '#22C55E',
  BTN: '#14B8A6',
  SB: '#06B6D4',
  BB: '#3B82F6',
};

// Street colors array for charts
export const STREET_COLORS = [CHART_COLORS.flop, CHART_COLORS.turn, CHART_COLORS.river];

// Decision colors array for charts
export const DECISION_COLORS = [CHART_COLORS.raise, CHART_COLORS.fold, CHART_COLORS.call];

// Common tooltip styling
export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1F2937',
    border: 'none',
    borderRadius: '8px',
  },
  labelStyle: {
    color: '#F3F4F6',
  },
};

// Common chart margins
export const CHART_MARGINS = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 5,
};

// Utility function to calculate accuracy percentage
export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

// Utility function to get accuracy color based on percentage
export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 70) return CHART_COLORS.good;
  if (accuracy >= 50) return CHART_COLORS.ok;
  return CHART_COLORS.poor;
};
