import React, { useState, useEffect } from 'react';
import type { Card, Position, View, Feedback, PositionStats, Action } from '../../types';
import { generateHand, getCorrectAction, getHandNotation } from '../../utils';
import { PracticeView, StatsView, ChartsView } from '../../components';
import styles from './PokerPreflopTrainer.module.scss';

export const PokerPreflopTrainer: React.FC = () => {
  const [currentHand, setCurrentHand] = useState<Card[]>([]);
  const [position, setPosition] = useState<Position>('BTN');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalHands, setTotalHands] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [view, setView] = useState<View>('practice');
  const [positionStats, setPositionStats] = useState<PositionStats>({
    EP: { correct: 0, total: 0 },
    MP: { correct: 0, total: 0 },
    CO: { correct: 0, total: 0 },
    BTN: { correct: 0, total: 0 },
    SB: { correct: 0, total: 0 },
    BB: { correct: 0, total: 0 }
  });
  const [chartPosition, setChartPosition] = useState<Position>('BTN');
  const [highlightedHand, setHighlightedHand] = useState<string | null>(null);

  useEffect(() => {
    handleGenerateHand();
  }, []);

  const handleGenerateHand = (): void => {
    const newHand = generateHand();
    setCurrentHand(newHand);
    setFeedback(null);
    setShowExplanation(false);
  };

  const handleAction = (action: Action): void => {
    const correctAction: Action = getCorrectAction(currentHand, position);
    const isCorrect: boolean = action === correctAction;

    setTotalHands(totalHands + 1);

    setPositionStats(prev => ({
      ...prev,
      [position]: {
        correct: prev[position].correct + (isCorrect ? 1 : 0),
        total: prev[position].total + 1
      }
    }));

    if (isCorrect) {
      setScore(score + 10);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      setFeedback({ type: 'correct', action: correctAction });
    } else {
      setStreak(0);
      setFeedback({ type: 'incorrect', action: correctAction });
    }

    setShowExplanation(true);
  };

  const handleNextHand = (): void => {
    handleGenerateHand();
    setHighlightedHand(null);
  };

  const handleViewInChart = (): void => {
    setHighlightedHand(getHandNotation(currentHand));
    setChartPosition(position);
    setView('charts');
  };

  const handleChartPositionChange = (newPosition: Position): void => {
    setChartPosition(newPosition);
    setHighlightedHand(null);
  };

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>♠ Poker Preflop Trainer ♣</h1>
          <p className={styles.subtitle}>Master your preflop strategy with instant feedback</p>
        </div>

        <div className={styles.tabNavigation}>
          <button
            onClick={() => setView('practice')}
            className={`${styles.tab} ${view === 'practice' ? styles.active : styles.inactive}`}
          >
            Practice
          </button>
          <button
            onClick={() => setView('stats')}
            className={`${styles.tab} ${view === 'stats' ? styles.active : styles.inactive}`}
          >
            Stats
          </button>
          <button
            onClick={() => setView('charts')}
            className={`${styles.tab} ${view === 'charts' ? styles.active : styles.inactive}`}
          >
            Charts
          </button>
        </div>

        {view === 'practice' && (
          <PracticeView
            currentHand={currentHand}
            position={position}
            streak={streak}
            bestStreak={bestStreak}
            feedback={feedback}
            showExplanation={showExplanation}
            onPositionChange={setPosition}
            onAction={handleAction}
            onNextHand={handleNextHand}
            onViewInChart={handleViewInChart}
          />
        )}

        {view === 'stats' && (
          <StatsView
            score={score}
            totalHands={totalHands}
            correctAnswers={correctAnswers}
            bestStreak={bestStreak}
            positionStats={positionStats}
          />
        )}

        {view === 'charts' && (
          <ChartsView
            chartPosition={chartPosition}
            highlightedHand={highlightedHand}
            onPositionChange={handleChartPositionChange}
          />
        )}
      </div>
    </div>
  );
};
