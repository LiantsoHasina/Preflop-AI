import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { usePostflopProgression } from '../../hooks/useProgression';
import { StatCard, StatCardsGrid, GuestWarning } from '../shared';
import { STREET_COLORS, DECISION_COLORS, TOOLTIP_STYLE, calculateAccuracy } from '../../constants/chartConfig';
import styles from './PostflopStatsView.module.scss';

interface PostflopStatsViewProps {
  sessionTotalHands?: number;
  sessionCorrectAnswers?: number;
  sessionBestStreak?: number;
}

export const PostflopStatsView: React.FC<PostflopStatsViewProps> = ({
  sessionTotalHands = 0,
  sessionCorrectAnswers = 0,
  sessionBestStreak = 0
}) => {
  const { isAuthenticated } = useAuth();
  const { progression, isLoading } = usePostflopProgression();

  const totalHands = (progression?.totalHands || 0) + sessionTotalHands;
  const correctAnswers = (progression?.correctAnswers || 0) + sessionCorrectAnswers;
  const bestStreak = Math.max(progression?.bestStreak || 0, sessionBestStreak);

  const streetStats = progression?.streetStats || {
    flop: { correct: 0, total: 0 },
    turn: { correct: 0, total: 0 },
    river: { correct: 0, total: 0 }
  };

  const decisionStats = progression?.decisionTypeStats || {
    call: { correct: 0, total: 0 },
    fold: { correct: 0, total: 0 },
    raise: { correct: 0, total: 0 }
  };

  const streetChartData = [
    { name: 'Flop', accuracy: calculateAccuracy(streetStats.flop.correct, streetStats.flop.total), hands: streetStats.flop.total },
    { name: 'Turn', accuracy: calculateAccuracy(streetStats.turn.correct, streetStats.turn.total), hands: streetStats.turn.total },
    { name: 'River', accuracy: calculateAccuracy(streetStats.river.correct, streetStats.river.total), hands: streetStats.river.total }
  ];

  const decisionChartData = [
    { name: 'Call', accuracy: calculateAccuracy(decisionStats.call.correct, decisionStats.call.total), total: decisionStats.call.total },
    { name: 'Fold', accuracy: calculateAccuracy(decisionStats.fold.correct, decisionStats.fold.total), total: decisionStats.fold.total },
    { name: 'Raise', accuracy: calculateAccuracy(decisionStats.raise.correct, decisionStats.raise.total), total: decisionStats.raise.total }
  ];

  const decisionDistribution = [
    { name: 'Call', value: decisionStats.call.total, color: DECISION_COLORS[0] },
    { name: 'Fold', value: decisionStats.fold.total, color: DECISION_COLORS[1] },
    { name: 'Raise', value: decisionStats.raise.total, color: DECISION_COLORS[2] }
  ].filter(d => d.value > 0);

  if (isLoading) {
    return <div className={styles.loading}>Loading stats...</div>;
  }

  return (
    <div className={styles.container}>
      {!isAuthenticated && <GuestWarning />}

      <StatCardsGrid columns={4}>
        <StatCard
          value={calculateAccuracy(correctAnswers, totalHands)}
          suffix="%"
          label="Overall Accuracy"
          variant="accuracy"
        />
        <StatCard value={totalHands} label="Decisions Made" variant="hands" />
        <StatCard value={correctAnswers} label="Correct Calls" variant="correct" />
        <StatCard value={bestStreak} label="Best Streak" variant="streak" />
      </StatCardsGrid>

      <div className={styles.chartsRow}>
        <div className={styles.chartSection}>
          <h3 className={styles.title}>Accuracy by Street</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={streetChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(value: number) => [`${value}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" name="Accuracy %">
                {streetChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={STREET_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.title}>Decision Distribution</h3>
          {decisionDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={decisionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {decisionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No decisions recorded yet</div>
          )}
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.title}>Decision Type Accuracy</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={decisionChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={60} />
            <Tooltip
              {...TOOLTIP_STYLE}
              formatter={(value: number, name: string) => {
                if (name === 'accuracy') return [`${value}%`, 'Accuracy'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="accuracy" name="Accuracy %" fill="#10B981">
              {decisionChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DECISION_COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.breakdownSection}>
        <h3 className={styles.title}>Street Breakdown</h3>
        <div className={styles.streetGrid}>
          {(['flop', 'turn', 'river'] as const).map((street, idx) => {
            const stats = streetStats[street];
            const accuracy = calculateAccuracy(stats.correct, stats.total);
            return (
              <div key={street} className={styles.streetCard}>
                <div className={styles.streetHeader} style={{ borderColor: STREET_COLORS[idx] }}>
                  <span className={styles.streetName}>{street.charAt(0).toUpperCase() + street.slice(1)}</span>
                  <span className={styles.streetAccuracy} style={{ color: STREET_COLORS[idx] }}>
                    {accuracy}%
                  </span>
                </div>
                <div className={styles.streetDetails}>
                  <div className={styles.detailRow}>
                    <span>Correct:</span>
                    <span>{stats.correct}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Total:</span>
                    <span>{stats.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
