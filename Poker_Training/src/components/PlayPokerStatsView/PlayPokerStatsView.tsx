import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { usePlayPokerProgression } from '../../hooks/useProgression';
import styles from './PlayPokerStatsView.module.scss';

interface PlayPokerStatsViewProps {
  // Local session stats
  sessionHandsPlayed?: number;
  sessionWinnings?: number;
}

export const PlayPokerStatsView: React.FC<PlayPokerStatsViewProps> = ({
  sessionHandsPlayed = 0,
  sessionWinnings = 0
}) => {
  const { isAuthenticated } = useAuth();
  const { progression, isLoading } = usePlayPokerProgression();

  const gamesPlayed = progression?.gamesPlayed || 0;
  const handsPlayed = (progression?.handsPlayed || 0) + sessionHandsPlayed;
  const totalWinnings = (progression?.totalWinnings || 0) + sessionWinnings;
  const biggestPot = progression?.biggestPot || 0;
  const showdownWins = progression?.showdownWins || 0;
  const showdownsReached = progression?.showdownsReached || 0;

  // Decision quality metrics
  const correctPreflop = progression?.correctPreflopDecisions || 0;
  const totalPreflop = progression?.totalPreflopDecisions || 0;
  const correctPostflop = progression?.correctPostflopDecisions || 0;
  const totalPostflop = progression?.totalPostflopDecisions || 0;
  const optimalBluffs = progression?.optimalBluffs || 0;
  const totalBluffs = progression?.totalBluffAttempts || 0;
  const optimalValueBets = progression?.optimalValueBets || 0;
  const totalValueBets = progression?.totalValueBetAttempts || 0;

  // Calculate percentages
  const preflopAccuracy = totalPreflop > 0 ? Math.round((correctPreflop / totalPreflop) * 100) : 0;
  const postflopAccuracy = totalPostflop > 0 ? Math.round((correctPostflop / totalPostflop) * 100) : 0;
  const showdownWinRate = showdownsReached > 0 ? Math.round((showdownWins / showdownsReached) * 100) : 0;
  const bluffEfficiency = totalBluffs > 0 ? Math.round((optimalBluffs / totalBluffs) * 100) : 0;
  const valueBetEfficiency = totalValueBets > 0 ? Math.round((optimalValueBets / totalValueBets) * 100) : 0;

  const decisionQualityData = [
    { name: 'Preflop', accuracy: preflopAccuracy },
    { name: 'Postflop', accuracy: postflopAccuracy }
  ];

  const advancedPlayData = [
    { name: 'Bluffs', efficiency: bluffEfficiency, total: totalBluffs },
    { name: 'Value Bets', efficiency: valueBetEfficiency, total: totalValueBets }
  ];

  const showdownData = [
    { name: 'Won', value: showdownWins, color: '#22C55E' },
    { name: 'Lost', value: showdownsReached - showdownWins, color: '#EF4444' }
  ].filter(d => d.value > 0);

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

      {/* Win Rate Section */}
      <div className={styles.sectionHeader}>
        <h2>Win Rate Metrics</h2>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${totalWinnings >= 0 ? styles.positive : styles.negative}`}>
            {totalWinnings >= 0 ? '+' : ''}{totalWinnings}
          </div>
          <div className={styles.label}>Total Winnings</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.games}`}>{gamesPlayed}</div>
          <div className={styles.label}>Games Played</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.hands}`}>{handsPlayed}</div>
          <div className={styles.label}>Hands Played</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.value} ${styles.pot}`}>${biggestPot}</div>
          <div className={styles.label}>Biggest Pot Won</div>
        </div>
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartSection}>
          <h3 className={styles.title}>Showdown Results</h3>
          <div className={styles.showdownSummary}>
            <div className={styles.showdownRate}>
              <span className={styles.rateValue}>{showdownWinRate}%</span>
              <span className={styles.rateLabel}>Win Rate at Showdown</span>
            </div>
            <div className={styles.showdownCount}>
              {showdownWins} / {showdownsReached} showdowns won
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {showdownData.length > 0 ? (
              <PieChart>
                <Pie
                  data={showdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {showdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            ) : (
              <div className={styles.noData}>No showdowns yet</div>
            )}
          </ResponsiveContainer>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.title}>Session Performance</h3>
          <div className={styles.performanceGrid}>
            <div className={styles.perfItem}>
              <span className={styles.perfLabel}>Avg Win/Hand</span>
              <span className={styles.perfValue}>
                ${handsPlayed > 0 ? (totalWinnings / handsPlayed).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className={styles.perfItem}>
              <span className={styles.perfLabel}>Hands/Game</span>
              <span className={styles.perfValue}>
                {gamesPlayed > 0 ? Math.round(handsPlayed / gamesPlayed) : 0}
              </span>
            </div>
            <div className={styles.perfItem}>
              <span className={styles.perfLabel}>Showdown Rate</span>
              <span className={styles.perfValue}>
                {handsPlayed > 0 ? Math.round((showdownsReached / handsPlayed) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Quality Section */}
      <div className={styles.sectionHeader}>
        <h2>Decision Quality</h2>
      </div>

      <div className={styles.qualityCards}>
        <div className={styles.qualityCard}>
          <div className={styles.qualityHeader}>
            <span className={styles.qualityTitle}>Preflop Decisions</span>
            <span className={`${styles.qualityValue} ${preflopAccuracy >= 70 ? styles.good : preflopAccuracy >= 50 ? styles.ok : styles.poor}`}>
              {preflopAccuracy}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${preflopAccuracy}%` }} />
          </div>
          <div className={styles.qualityDetail}>{correctPreflop} / {totalPreflop} correct</div>
        </div>

        <div className={styles.qualityCard}>
          <div className={styles.qualityHeader}>
            <span className={styles.qualityTitle}>Postflop Decisions</span>
            <span className={`${styles.qualityValue} ${postflopAccuracy >= 70 ? styles.good : postflopAccuracy >= 50 ? styles.ok : styles.poor}`}>
              {postflopAccuracy}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${postflopAccuracy}%` }} />
          </div>
          <div className={styles.qualityDetail}>{correctPostflop} / {totalPostflop} correct</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3 className={styles.title}>Decision Accuracy Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={decisionQualityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Advanced Play Section */}
      <div className={styles.sectionHeader}>
        <h2>Advanced Play Analysis</h2>
      </div>

      <div className={styles.advancedCards}>
        <div className={styles.advancedCard}>
          <div className={styles.advancedIcon}>🎭</div>
          <div className={styles.advancedInfo}>
            <div className={styles.advancedTitle}>Bluff Efficiency</div>
            <div className={`${styles.advancedValue} ${bluffEfficiency >= 60 ? styles.good : styles.poor}`}>
              {bluffEfficiency}%
            </div>
            <div className={styles.advancedDetail}>
              {optimalBluffs} optimal / {totalBluffs} attempts
            </div>
          </div>
        </div>

        <div className={styles.advancedCard}>
          <div className={styles.advancedIcon}>💰</div>
          <div className={styles.advancedInfo}>
            <div className={styles.advancedTitle}>Value Bet Efficiency</div>
            <div className={`${styles.advancedValue} ${valueBetEfficiency >= 60 ? styles.good : styles.poor}`}>
              {valueBetEfficiency}%
            </div>
            <div className={styles.advancedDetail}>
              {optimalValueBets} optimal / {totalValueBets} attempts
            </div>
          </div>
        </div>
      </div>

      {(totalBluffs > 0 || totalValueBets > 0) && (
        <div className={styles.chartSection}>
          <h3 className={styles.title}>Advanced Play Efficiency</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={advancedPlayData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                formatter={(value: number) => [`${value}%`, 'Efficiency']}
              />
              <Bar dataKey="efficiency" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
