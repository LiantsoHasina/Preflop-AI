import React, { useState, useEffect } from 'react';
import type { Card, Position, View, Feedback, PositionStats, Action } from '../../types';
import { generateHand, getCorrectAction, getHandNotation, getFullAnalysisAI, getExplanation } from '../../utils';
import { PracticeView, StatsView, ChartsView, AISelectionModal } from '../../components';
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
  const [useAI, setUseAI] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiExplanation, setAIExplanation] = useState<string>('');
  const [showAISelectionModal, setShowAISelectionModal] = useState<boolean>(true);

  useEffect(() => {
    handleGenerateHand();
  }, []);

  const handleGenerateHand = (): void => {
    const newHand = generateHand();
    setCurrentHand(newHand);
    setFeedback(null);
    setShowExplanation(false);
  };

  const handleAction = async (action: Action): Promise<void> => {
    setIsAnalyzing(true);

    try {
      let correctAction: Action;
      let explanation: string;

      if (useAI) {
        // Use AI analysis
        const analysis = await getFullAnalysisAI(currentHand, position);
        correctAction = analysis.action;
        explanation = `${analysis.explanation}\n\n${analysis.reasoning}`;
        setAIExplanation(explanation);
      } else {
        // Use static ranges
        correctAction = getCorrectAction(currentHand, position);
        explanation = getExplanation(currentHand, position, correctAction);
        setAIExplanation(explanation);
      }

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
    } catch (error) {
      console.error('Error in handleAction:', error);
      // Fallback to static ranges on error
      const correctAction = getCorrectAction(currentHand, position);
      const explanation = getExplanation(currentHand, position, correctAction);
      setAIExplanation(explanation);

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
    } finally {
      setIsAnalyzing(false);
    }
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

  const handleAISelection = (selectedUseAI: boolean): void => {
    setUseAI(selectedUseAI);
    setShowAISelectionModal(false);
  };

  return (
    <div className={styles.app}>
      <AISelectionModal
        isOpen={showAISelectionModal}
        onSelect={handleAISelection}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>♠ Poker Preflop Trainer ♣</h1>
          <p className={styles.subtitle}>Master your preflop strategy with instant feedback</p>
          <div className={styles.aiToggleContainer}>
            <label className={styles.aiToggle}>
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className={styles.aiCheckbox}
              />
              <span className={styles.aiLabel}>
                {useAI ? '🤖 AI Mode (Claude)' : '📊 Static Ranges'}
              </span>
            </label>
          </div>
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
            aiExplanation={aiExplanation}
            isAnalyzing={isAnalyzing}
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
