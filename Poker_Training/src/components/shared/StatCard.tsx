import React from 'react';
import styles from './StatCard.module.scss';

export type StatVariant = 'accuracy' | 'hands' | 'correct' | 'streak' | 'winnings' | 'default';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: StatVariant;
  suffix?: string;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  variant = 'default',
  suffix = '',
  prefix = '',
}) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.value} ${styles[variant]}`}>
        {prefix}{value}{suffix}
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};

// Grid container for stat cards
interface StatCardsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({
  children,
  columns = 4,
}) => {
  return (
    <div className={`${styles.grid} ${styles[`cols${columns}`]}`}>
      {children}
    </div>
  );
};
