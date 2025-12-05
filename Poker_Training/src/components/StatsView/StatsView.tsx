import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PositionStats, ChartData } from '../../types';
import { positions } from '../../constants';
import styles from './StatsView.module.scss';

interface StatsViewProps {
  score: number;
  totalHands: number;
  correctAnswers: number;
  bestStreak: number;
  positionStats: PositionStats;
}

export const StatsView: React.FC<StatsViewProps> = ({
  score,
  totalHands,
  correctAnswers,
  bestStreak,
  positionStats
}) => {
  const getStatsChartData = (): ChartData[] => {
    return positions.map(pos => ({
      name: pos.label,
      accuracy: positionStats[pos.value].total > 0
        ? Math.round((positionStats[pos.value].correct / positionStats[pos.value].total) * 100)
        : 0,
      hands: positionStats[pos.value].total
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.summaryCards}>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.score}`}>{score}</div>
          <div className={styles.label}>Total Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.accuracy}`}>
            {totalHands > 0 ? Math.round((correctAnswers / totalHands) * 100) : 0}%
          </div>
          <div className={styles.label}>Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.hands}`}>{totalHands}</div>
          <div className={styles.label}>Hands Played</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.streak}`}>{bestStreak}</div>
          <div className={styles.label}>Best Streak</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.title}>Accuracy by Position</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getStatsChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="accuracy" fill="#10B981" name="Accuracy %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.breakdownSection}>
        <h3 className={styles.title}>Position Breakdown</h3>
        <div className={styles.positionGrid}>
          {positions.map(pos => {
            const stats = positionStats[pos.value];
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return (
              <div key={pos.value} className={styles.positionCard}>
                <div className={styles.positionInfo}>
                  <div className={styles.left}>
                    <div className={styles.positionName}>{pos.label}</div>
                    <div className={styles.handsCount}>{stats.total} hands</div>
                  </div>
                  <div className={styles.accuracy}>{accuracy}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
