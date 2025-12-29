import React, { useMemo } from 'react';
import type { PokerGameState, Position } from '../../types';
import { CHART_RANKS } from '../../constants';
import { getHandNotation, getActionForHandNotation, getHandNotationFromGrid } from '../../utils';
import styles from './PlayPoker.module.scss';

interface GameSidebarsProps {
  gameState: PokerGameState;
  leftOpen: boolean;
  rightOpen: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

// Calculate pot odds
const calculatePotOdds = (pot: number, toCall: number): { percentage: number; ratio: string } => {
  if (toCall === 0) return { percentage: 0, ratio: '0:1' };
  const percentage = (toCall / (pot + toCall)) * 100;
  const ratio = ((pot + toCall) / toCall).toFixed(1);
  return { percentage, ratio: `${ratio}:1` };
};

// Estimate CPU hand range based on their actions
const estimateCPURange = (
  actions: { action: string; amount: number }[],
  position: number,
  totalPlayers: number
): { range: string; strength: string; description: string } => {
  if (actions.length === 0) {
    return { range: 'Unknown', strength: 'Unknown', description: 'No actions yet' };
  }

  const lastAction = actions[actions.length - 1];
  const isEarlyPosition = position < totalPlayers / 3;
  const isLatePosition = position >= (totalPlayers * 2) / 3;

  if (lastAction.action === 'fold') {
    return { range: 'Weak', strength: 'Low', description: 'Likely had a weak hand' };
  }

  if (lastAction.action === 'all-in') {
    return {
      range: 'Polarized',
      strength: 'Very Strong or Bluff',
      description: 'Premium hands (AA-JJ, AK) or a bluff'
    };
  }

  if (lastAction.action === 'raise') {
    if (isEarlyPosition) {
      return {
        range: 'Premium',
        strength: 'Strong',
        description: 'Likely AA-TT, AK-AQ, possibly KQs'
      };
    } else if (isLatePosition) {
      return {
        range: 'Wide',
        strength: 'Medium-Strong',
        description: 'Any pair, suited connectors, broadways, Ax suited'
      };
    }
    return {
      range: 'Standard',
      strength: 'Medium',
      description: 'Pairs 66+, suited broadways, AJ+'
    };
  }

  if (lastAction.action === 'call') {
    return {
      range: 'Speculative',
      strength: 'Medium',
      description: 'Small pairs, suited connectors, suited aces'
    };
  }

  if (lastAction.action === 'check') {
    return {
      range: 'Mixed',
      strength: 'Weak-Medium',
      description: 'Could be trapping or genuinely weak'
    };
  }

  return { range: 'Unknown', strength: 'Unknown', description: 'Unable to determine' };
};

// Preflop chart component with hand notations
const MiniPreflopChart: React.FC<{ position: Position; currentHand: string | null }> = ({
  position,
  currentHand
}) => {
  const getCellClassName = (row: number, col: number): string => {
    const hand = getHandNotationFromGrid(row, col, CHART_RANKS);
    const action = getActionForHandNotation(hand, position);
    const isCurrentHand = hand === currentHand;

    let classes = styles[`mini${action.charAt(0).toUpperCase() + action.slice(1)}`] || styles.miniFold;
    if (isCurrentHand) {
      classes += ` ${styles.miniHighlighted}`;
    }
    return classes;
  };

  return (
    <div className={styles.miniChart}>
      <table>
        <tbody>
          {CHART_RANKS.map((rowRank, rowIdx) => (
            <tr key={rowRank}>
              {CHART_RANKS.map((colRank, colIdx) => {
                const hand = getHandNotationFromGrid(rowIdx, colIdx, CHART_RANKS);
                return (
                  <td
                    key={`${rowRank}-${colRank}`}
                    className={getCellClassName(rowIdx, colIdx)}
                    title={hand}
                  >
                    {hand}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const GameSidebars: React.FC<GameSidebarsProps> = ({
  gameState,
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight
}) => {
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const currentHand = humanPlayer?.holeCards.length === 2
    ? getHandNotation(humanPlayer.holeCards)
    : null;

  // Determine user's position relative to the button
  const getUserPosition = (): Position => {
    if (!humanPlayer) return 'BTN';

    const playerCount = gameState.players.length;
    const dealerPos = gameState.dealerPosition;
    const humanPos = humanPlayer.position;

    // Calculate relative position from dealer
    const relativePos = (humanPos - dealerPos + playerCount) % playerCount;

    if (relativePos === 0) return 'BTN';
    if (relativePos === 1) return 'SB';
    if (relativePos === 2) return 'BB';
    if (relativePos === 3) return 'UTG';
    if (relativePos <= playerCount - 2) return 'MP';
    return 'CO';
  };

  const userPosition = getUserPosition();
  const toCall = humanPlayer ? gameState.currentBet - humanPlayer.currentBet : 0;
  const potOdds = calculatePotOdds(gameState.pot, toCall);

  // Calculate equity (simplified estimation based on hand strength)
  const calculateEquity = (): number => {
    if (!humanPlayer || humanPlayer.holeCards.length < 2) return 50;

    const hand = getHandNotation(humanPlayer.holeCards);
    const action = getActionForHandNotation(hand, userPosition);

    // Rough equity estimation
    if (action === 'raise') return 65 + Math.random() * 15;
    if (action === 'call') return 45 + Math.random() * 15;
    return 25 + Math.random() * 15;
  };

  const equity = useMemo(() => calculateEquity(), [humanPlayer?.holeCards, userPosition]);

  // Get CPU players and their estimated ranges
  const cpuAnalysis = useMemo(() => {
    return gameState.players
      .filter(p => !p.isHuman && p.status !== 'out' && p.status !== 'folded')
      .map(cpu => {
        const cpuActions = gameState.actionHistory
          .filter(a => a.playerId === cpu.id)
          .map(a => ({ action: a.action, amount: a.amount }));

        const range = estimateCPURange(cpuActions, cpu.position, gameState.players.length);
        return {
          name: cpu.name,
          chips: cpu.chips,
          status: cpu.status,
          ...range
        };
      });
  }, [gameState.players, gameState.actionHistory]);

  return (
    <>
      {/* Left Panel Toggle Button - always visible on left edge */}
      <button
        className={`${styles.panelToggle} ${styles.leftToggle}`}
        onClick={onToggleLeft}
      >
        {leftOpen ? '◀' : '▶'}
        <span className={styles.toggleLabel}>Charts</span>
      </button>

      {/* Left Panel - Preflop Chart */}
      <div className={`${styles.sidePanel} ${styles.leftPanel} ${leftOpen ? styles.panelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3>📊 Preflop Chart ({userPosition})</h3>
          <button onClick={onToggleLeft} className={styles.closePanel}>✕</button>
        </div>
        <div className={styles.panelContent}>
          <MiniPreflopChart position={userPosition} currentHand={currentHand} />
          {currentHand && (
            <div className={styles.currentHandInfo}>
              Your hand: <strong>{currentHand}</strong>
              <span className={styles.recommendedAction}>
                Suggested: <strong>{getActionForHandNotation(currentHand, userPosition).toUpperCase()}</strong>
              </span>
            </div>
          )}
          <div className={styles.chartLegendLarge}>
            <div className={styles.legendItem}>
              <span className={styles.legendColorRaise}></span>
              <span>Raise</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColorCall}></span>
              <span>Call</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColorFold}></span>
              <span>Fold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel Toggle Button - always visible on right edge */}
      <button
        className={`${styles.panelToggle} ${styles.rightToggle}`}
        onClick={onToggleRight}
      >
        <span className={styles.toggleLabel}>Analysis</span>
        {rightOpen ? '▶' : '◀'}
      </button>

      {/* Right Panel - Analysis */}
      <div className={`${styles.sidePanel} ${styles.rightPanel} ${rightOpen ? styles.panelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <h3>📈 Live Analysis</h3>
          <button onClick={onToggleRight} className={styles.closePanel}>✕</button>
        </div>
        <div className={styles.panelContent}>
          {/* Pot Odds */}
          <div className={styles.analysisSection}>
            <h4>Pot Odds</h4>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Pot</span>
                <span className={styles.statValue}>${gameState.pot}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>To Call</span>
                <span className={styles.statValue}>${toCall}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Odds</span>
                <span className={styles.statValue}>{potOdds.ratio}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Need</span>
                <span className={styles.statValue}>{potOdds.percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Your Edge */}
          <div className={styles.analysisSection}>
            <h4>Your Edge</h4>
            <div className={styles.equityBar}>
              <div
                className={styles.equityFill}
                style={{ width: `${equity}%` }}
              />
              <span className={styles.equityLabel}>{equity.toFixed(0)}% equity</span>
            </div>
            <p className={styles.equityNote}>
              {equity > potOdds.percentage + 10
                ? '✓ Good spot - equity exceeds pot odds'
                : equity > potOdds.percentage
                ? '~ Marginal - close decision'
                : '✗ Poor odds - need a better spot'}
            </p>
          </div>

          {/* CPU Ranges */}
          <div className={styles.analysisSection}>
            <h4>Opponent Ranges</h4>
            <div className={styles.cpuRanges}>
              {cpuAnalysis.length === 0 ? (
                <p className={styles.noCpu}>All opponents folded</p>
              ) : (
                cpuAnalysis.map((cpu, idx) => (
                  <div key={idx} className={styles.cpuRange}>
                    <div className={styles.cpuHeader}>
                      <span className={styles.cpuName}>{cpu.name}</span>
                      <span className={styles.cpuChips}>${cpu.chips}</span>
                    </div>
                    <div className={styles.cpuDetails}>
                      <span className={styles.rangeStrength}>{cpu.strength}</span>
                      <p className={styles.rangeDescription}>{cpu.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
