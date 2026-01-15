import { useState, useCallback } from 'react';
import type { Position, PositionStats } from '../types';
import { INITIAL_POSITION_STATS } from '../constants';

export const useGameStats = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalHands, setTotalHands] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [positionStats, setPositionStats] = useState<PositionStats>({ ...INITIAL_POSITION_STATS });

  const updateStats = useCallback((isCorrect: boolean, position: Position) => {
    setTotalHands((prev) => prev + 1);

    setPositionStats((prev) => ({
      ...prev,
      [position]: {
        correct: prev[position].correct + (isCorrect ? 1 : 0),
        total: prev[position].total + 1
      }
    }));

    if (isCorrect) {
      setScore((prev) => prev + 10);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }, [bestStreak]);

  const resetStats = useCallback(() => {
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalHands(0);
    setCorrectAnswers(0);
    setPositionStats({ ...INITIAL_POSITION_STATS });
  }, []);

  return {
    score,
    streak,
    bestStreak,
    totalHands,
    correctAnswers,
    positionStats,
    updateStats,
    resetStats
  };
};
