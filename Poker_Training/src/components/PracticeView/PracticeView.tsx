import React from 'react';
import type { Card as CardType, Position, Action, Feedback } from '../../types';
import { getHandNotation, getExplanation } from '../../utils';
import { Card } from '../Card';
import { PositionSelector } from '../PositionSelector';
import styles from './PracticeView.module.scss';

interface PracticeViewProps {
  currentHand: CardType[];
  position: Position;
  streak: number;
  bestStreak: number;
  feedback: Feedback | null;
  showExplanation: boolean;
  onPositionChange: (position: Position) => void;
  onAction: (action: Action) => void;
  onNextHand: () => void;
  onViewInChart: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentHand,
  position,
  streak,
  bestStreak,
  feedback,
  showExplanation,
  onPositionChange,
  onAction,
  onNextHand,
  onViewInChart
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.gameArea}>
        <div className={styles.streakInfo}>
          <div className={styles.stats}>
            <div>Streak: <span className={styles.label}>{streak}</span></div>
            <div>Best: <span className={styles.label}>{bestStreak}</span></div>
          </div>
        </div>

        <PositionSelector
          currentPosition={position}
          onPositionChange={onPositionChange}
        />

        <div className={styles.handDisplay}>
          {currentHand.map((card, idx) => (
            <Card key={idx} card={card} />
          ))}
        </div>

        <div className={styles.handNotation}>
          <span className={styles.notation}>
            {getHandNotation(currentHand)}
          </span>
        </div>

        {!showExplanation ? (
          <div className={styles.actionButtons}>
            <button
              onClick={() => onAction('fold')}
              className={styles.foldButton}
            >
              Fold
            </button>
            <button
              onClick={() => onAction('call')}
              className={styles.callButton}
            >
              Call
            </button>
            <button
              onClick={() => onAction('raise')}
              className={styles.raiseButton}
            >
              Raise
            </button>
          </div>
        ) : (
          <div className={styles.feedbackSection}>
            <div className={`${styles.feedbackBox} ${feedback?.type === 'correct' ? styles.correct : styles.incorrect}`}>
              <div className={styles.feedbackTitle}>
                {feedback?.type === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className={styles.correctAction}>
                Correct action: <span className={styles.actionText}>{feedback?.action}</span>
              </div>
            </div>

            <div className={styles.explanationBox}>
              <div className={styles.title}>Explanation:</div>
              <div className={styles.content}>
                {feedback && getExplanation(currentHand, position, feedback.action)}
              </div>
            </div>

            <div className={styles.nextButtons}>
              <button
                onClick={onNextHand}
                className={styles.nextButton}
              >
                Next Hand →
              </button>
              <button
                onClick={onViewInChart}
                className={styles.viewChartButton}
              >
                View in Chart 📊
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
