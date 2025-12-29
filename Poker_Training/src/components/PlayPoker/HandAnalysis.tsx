import React, { useState } from 'react';
import type { PokerGameState, ActionRecord, BettingRound } from '../../types';
import { Card } from '../Card';
import { PokerTable } from './PokerTable';
import styles from './PlayPoker.module.scss';

interface HandAnalysisProps {
  gameState: PokerGameState;
  onContinue: () => void;
  onNewGame: () => void;
}

const ROUND_ORDER: BettingRound[] = ['preflop', 'flop', 'turn', 'river'];

export const HandAnalysis: React.FC<HandAnalysisProps> = ({
  gameState,
  onContinue,
  onNewGame
}) => {
  const [expandedRound, setExpandedRound] = useState<BettingRound | null>('preflop');
  const [showTable, setShowTable] = useState(false);
  const { actionHistory, winners, communityCards, players } = gameState;

  const humanPlayer = players.find(p => p.isHuman);
  const humanActions = actionHistory.filter(a => a.playerId === humanPlayer?.id);

  // Group actions by round
  const actionsByRound = ROUND_ORDER.reduce((acc, round) => {
    acc[round] = actionHistory.filter(a => a.bettingRound === round);
    return acc;
  }, {} as Record<BettingRound, ActionRecord[]>);

  // Analyze human player's decisions
  const analyzeDecision = (action: ActionRecord): { quality: 'good' | 'neutral' | 'poor'; lesson: string } => {
    // Simple heuristic analysis
    const { action: playerAction, potBefore, amount } = action;

    if (playerAction === 'fold') {
      // Check if fold was reasonable based on pot odds
      const toCall = amount; // amount they would have needed to call
      if (toCall > potBefore * 0.5) {
        return { quality: 'neutral', lesson: 'Folding to a large bet can be correct without a strong hand or draw.' };
      }
      return { quality: 'neutral', lesson: 'Consider pot odds when deciding to fold. Sometimes calling with draws is profitable.' };
    }

    if (playerAction === 'check') {
      return { quality: 'neutral', lesson: 'Checking is fine when you want to see free cards or trap with a strong hand.' };
    }

    if (playerAction === 'call') {
      const potOdds = (amount / (potBefore + amount)) * 100;
      if (potOdds < 25) {
        return { quality: 'good', lesson: 'Good call - you were getting excellent pot odds.' };
      }
      return { quality: 'neutral', lesson: 'Calling can be correct with draws or made hands. Consider your equity vs pot odds.' };
    }

    if (playerAction === 'raise' || playerAction === 'bet') {
      const betSize = amount / potBefore;
      if (betSize >= 0.5 && betSize <= 1.0) {
        return { quality: 'good', lesson: 'Good bet sizing - between half pot and full pot is usually optimal.' };
      }
      if (betSize < 0.3) {
        return { quality: 'poor', lesson: 'Small bets give opponents good odds to call. Consider betting larger for value or protection.' };
      }
      return { quality: 'neutral', lesson: 'Large bets can work for value or as bluffs, but be aware of your pot commitment.' };
    }

    if (playerAction === 'all-in') {
      return { quality: 'neutral', lesson: 'All-in decisions should be based on pot odds, stack sizes, and hand strength.' };
    }

    return { quality: 'neutral', lesson: '' };
  };

  const getQualityColor = (quality: 'good' | 'neutral' | 'poor'): string => {
    switch (quality) {
      case 'good': return styles.qualityGood;
      case 'poor': return styles.qualityPoor;
      default: return styles.qualityNeutral;
    }
  };

  // Generate overall lessons
  const generateLessons = (): string[] => {
    const lessons: string[] = [];

    if (humanActions.length === 0) {
      return ['You folded early - consider staying in with playable hands to gain more experience.'];
    }

    const didWin = winners.some(w => w.playerId === humanPlayer?.id);

    if (didWin) {
      lessons.push('Great job winning this hand! Review your actions to reinforce good habits.');
    }

    // Check for missed value bets
    const checkCount = humanActions.filter(a => a.action === 'check').length;
    if (checkCount >= 2) {
      lessons.push('You checked multiple times. Consider betting for value when you have a strong hand.');
    }

    // Check for oversized bets
    const bigBets = humanActions.filter(a =>
      (a.action === 'bet' || a.action === 'raise') && a.amount > a.potBefore * 1.5
    );
    if (bigBets.length > 0) {
      lessons.push('Some of your bets were very large. Smaller bets often get more value from opponents.');
    }

    // Check for folding to small bets
    const foldActions = humanActions.filter(a => a.action === 'fold');
    if (foldActions.length > 0) {
      const foldedTooEasy = foldActions.some(a => {
        const callAmount = gameState.currentBet - (a.potBefore * 0.2);
        return callAmount < a.potBefore * 0.25;
      });
      if (foldedTooEasy) {
        lessons.push('You may have folded too easily. Small bets often offer good pot odds to continue.');
      }
    }

    if (lessons.length === 0) {
      lessons.push('Solid play this hand. Keep practicing to refine your decision-making.');
    }

    return lessons;
  };

  // If showing table view
  if (showTable) {
    return (
      <div className={styles.analysisContainer}>
        <div className={styles.tableViewHeader}>
          <button onClick={() => setShowTable(false)} className={styles.backToAnalysisButton}>
            ← Back to Analysis
          </button>
          <h2 className={styles.tableViewTitle}>Hand Replay</h2>
        </div>
        <PokerTable gameState={gameState} onNextHand={onContinue} />
        <div className={styles.tableViewActions}>
          <button onClick={() => setShowTable(false)} className={styles.viewResultsButton}>
            View Analysis
          </button>
          <button onClick={onContinue} className={styles.nextHandButton}>
            Next Hand →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analysisContainer}>
      <div className={styles.analysisCard}>
        <div className={styles.analysisHeader}>
          <h2 className={styles.analysisTitle}>Hand Analysis</h2>
          <button onClick={() => setShowTable(true)} className={styles.viewTableButton}>
            View Table
          </button>
        </div>

        {/* Winner display */}
        <div className={styles.winnerSection}>
          {winners.map((winner, idx) => (
            <div key={idx} className={styles.winnerDisplay}>
              <span className={styles.winnerName}>{winner.playerName}</span>
              <span className={styles.winnerHand}>{winner.hand.description}</span>
              <div className={styles.winnerCards}>
                {winner.holeCards.map((card, cardIdx) => (
                  <Card key={cardIdx} card={card} size="small" />
                ))}
              </div>
              <span className={styles.winnerPot}>Won ${winner.amount}</span>
            </div>
          ))}
        </div>

        {/* Community cards */}
        <div className={styles.finalBoard}>
          <span className={styles.boardLabel}>Final Board:</span>
          <div className={styles.boardCards}>
            {communityCards.map((card, idx) => (
              <Card key={idx} card={card} size="small" />
            ))}
          </div>
        </div>

        {/* Action breakdown by round */}
        <div className={styles.actionBreakdown}>
          <h3>Action History</h3>
          {ROUND_ORDER.map((round) => {
            const actions = actionsByRound[round];
            if (actions.length === 0) return null;

            return (
              <div key={round} className={styles.roundSection}>
                <button
                  className={`${styles.roundHeader} ${expandedRound === round ? styles.expanded : ''}`}
                  onClick={() => setExpandedRound(expandedRound === round ? null : round)}
                >
                  <span className={styles.roundName}>{round.toUpperCase()}</span>
                  <span className={styles.actionCount}>{actions.length} actions</span>
                </button>

                {expandedRound === round && (
                  <div className={styles.roundActions}>
                    {actions.map((action, idx) => {
                      const isHuman = action.playerId === humanPlayer?.id;
                      const analysis = isHuman ? analyzeDecision(action) : null;

                      return (
                        <div
                          key={idx}
                          className={`${styles.actionItem} ${isHuman ? styles.humanAction : ''}`}
                        >
                          <div className={styles.actionHeader}>
                            <span className={styles.playerName}>{action.playerName}</span>
                            <span className={styles.actionType}>
                              {action.action.toUpperCase()}
                              {action.amount > 0 && ` $${action.amount}`}
                            </span>
                          </div>
                          {isHuman && analysis && (
                            <div className={`${styles.actionAnalysis} ${getQualityColor(analysis.quality)}`}>
                              <span className={styles.qualityBadge}>{analysis.quality}</span>
                              <p className={styles.lessonText}>{analysis.lesson}</p>
                            </div>
                          )}
                          {action.reasoning && !isHuman && (
                            <div className={styles.cpuReasoning}>
                              <em>{action.reasoning}</em>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key lessons */}
        <div className={styles.lessonsSection}>
          <h3>Key Takeaways</h3>
          <ul className={styles.lessonsList}>
            {generateLessons().map((lesson, idx) => (
              <li key={idx}>{lesson}</li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div className={styles.analysisActions}>
          <button onClick={onContinue} className={styles.continueButton}>
            Next Hand
          </button>
          <button onClick={onNewGame} className={styles.newGameButton}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};
