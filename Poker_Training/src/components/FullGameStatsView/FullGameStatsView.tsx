import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useFullGameProgression } from '../../hooks/useProgression';
import { positions, INITIAL_POSITION_STATS } from '../../constants';
import styles from './FullGameStatsView.module.scss';

interface FullGameStatsViewProps {
  // Local session stats
  sessionTotalHands?: number;
  sessionBestStreak?: number;
}

const STREET_COLORS = ['#10B981', '#3B82F6', '#8B5CF6'];

export const FullGameStatsView: React.FC<FullGameStatsViewProps> = ({
  sessionTotalHands = 0,
  sessionBestStreak = 0
}) => {
  const { isAuthenticated } = useAuth();
  const { progression, isLoading } = useFullGameProgression();

  const totalHands = (progression?.totalHands || 0) + sessionTotalHands;
  const bestStreak = Math.max(progression?.bestStreak || 0, sessionBestStreak);

  const preflopCorrect = progression?.preflopCorrect || 0;
  const preflopTotal = progression?.preflopTotal || 0;
  const postflopCorrect = progression?.postflopCorrect || 0;
  const postflopTotal = progression?.postflopTotal || 0;

  const preflopAccuracy = preflopTotal > 0 ? Math.round((preflopCorrect / preflopTotal) * 100) : 0;
  const postflopAccuracy = postflopTotal > 0 ? Math.round((postflopCorrect / postflopTotal) * 100) : 0;
  const overallAccuracy = (preflopTotal + postflopTotal) > 0
    ? Math.round(((preflopCorrect + postflopCorrect) / (preflopTotal + postflopTotal)) * 100)
    : 0;

  const positionStats = progression?.positionStats || INITIAL_POSITION_STATS;

  const streetStats = progression?.streetStats || {
    flop: { correct: 0, total: 0 },
    turn: { correct: 0, total: 0 },
    river: { correct: 0, total: 0 }
  };

  const phaseChartData = [
    { name: 'Preflop', accuracy: preflopAccuracy, hands: preflopTotal },
    { name: 'Postflop', accuracy: postflopAccuracy, hands: postflopTotal }
  ];

  const positionChartData = positions.map(pos => ({
    name: pos.label,
    accuracy: positionStats[pos.value].total > 0
      ? Math.round((positionStats[pos.value].correct / positionStats[pos.value].total) * 100)
      : 0,
    fullMark: 100
  }));

  const streetChartData = [
    {
      name: 'Flop',
      accuracy: streetStats.flop.total > 0
        ? Math.round((streetStats.flop.correct / streetStats.flop.total) * 100)
        : 0,
      hands: streetStats.flop.total
    },
    {
      name: 'Turn',
      accuracy: streetStats.turn.total > 0
        ? Math.round((streetStats.turn.correct / streetStats.turn.total) * 100)
        : 0,
      hands: streetStats.turn.total
    },
    {
      name: 'River',
      accuracy: streetStats.river.total > 0
        ? Math.round((streetStats.river.correct / streetStats.river.total) * 100)
        : 0,
      hands: streetStats.river.total
    }
  ];

  if (isLoading) {
    return <div className={styles.loading}>Loading stats...</div>;
  }

  return (
    <div className={styles.container}>
      {!isAuthenticated && (
        <div className={styles.guestWarning}>
          Sign in to save your progress and track improvement over time
        </div>
      )}

      <div className={styles.summaryCards}>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.overall}`}>{overallAccuracy}%</div>
          <div className={styles.label}>Overall Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.preflop}`}>{preflopAccuracy}%</div>
          <div className={styles.label}>Preflop Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.postflop}`}>{postflopAccuracy}%</div>
          <div className={styles.label}>Postflop Accuracy</div>
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

      <div className={styles.chartsRow}>
        <div className={styles.chartSection}>
          <h3 className={styles.title}>Preflop vs Postflop</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={phaseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Accuracy']}
              />
              <Bar dataKey="accuracy" name="Accuracy" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.title}>Position Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={positionChartData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="name" stroke="#9CA3AF" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9CA3AF" />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Accuracy']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.title}>Postflop Street Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={streetChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={60} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Legend />
            <Bar dataKey="accuracy" name="Accuracy %">
              {streetChartData.map((_, index) => (
                <rect key={index} fill={STREET_COLORS[index]} />
              ))}
            </Bar>
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
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
