import React from 'react';
import type { GameMode } from '../../types';
import styles from './GameModeSelector.module.scss';

interface GameModeSelectorProps {
  isOpen: boolean;
  onSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ isOpen, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Choose Training Mode</h2>
          <p className={styles.subtitle}>
            Select what aspects of poker you'd like to practice
          </p>
        </div>

        <div className={styles.options}>
          <button
            className={`${styles.optionCard} ${styles.preflopOption}`}
            onClick={() => onSelect('preflop-only')}
          >
            <div className={styles.icon}>🎯</div>
            <h3 className={styles.optionTitle}>Preflop Only</h3>
            <p className={styles.optionDescription}>
              Focus exclusively on preflop decisions and range selection
            </p>
            <ul className={styles.features}>
              <li>Master opening ranges</li>
              <li>Learn position-based strategy</li>
              <li>Quick practice sessions</li>
            </ul>
            <span className={styles.badge}>Classic Mode</span>
          </button>

          <button
            className={`${styles.optionCard} ${styles.fullGameOption}`}
            onClick={() => onSelect('full-game')}
          >
            <div className={styles.icon}>♠️</div>
            <h3 className={styles.optionTitle}>Full Game (Preflop + Postflop)</h3>
            <p className={styles.optionDescription}>
              Complete hand training including flop, turn, and river decisions
            </p>
            <ul className={styles.features}>
              <li>Pot odds calculations</li>
              <li>Outs counting practice</li>
              <li>Complete street-by-street play</li>
            </ul>
            <span className={styles.badge}>Recommended</span>
          </button>

          <button
            className={`${styles.optionCard} ${styles.postflopOption}`}
            onClick={() => onSelect('postflop-only')}
          >
            <div className={styles.icon}>🃏</div>
            <h3 className={styles.optionTitle}>Postflop Only</h3>
            <p className={styles.optionDescription}>
              Skip preflop and jump straight into postflop scenarios
            </p>
            <ul className={styles.features}>
              <li>Focus on pot odds decisions</li>
              <li>Practice drawing situations</li>
              <li>Master equity calculations</li>
            </ul>
            <span className={styles.badge}>Quick Practice</span>
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Preflop focuses on opening ranges. Full Game includes all streets.
            Postflop Only skips preflop for focused pot odds practice.
          </p>
          <p className={styles.changeNote}>
            You can restart with a different mode anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
