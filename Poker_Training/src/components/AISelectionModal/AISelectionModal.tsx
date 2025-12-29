// AI SELECTION MODAL TEMPORARILY DISABLED - Searching for better option
// This modal is now hidden and always returns false (static ranges)

import React, { useEffect } from 'react';
// import styles from './AISelectionModal.module.scss';

interface AISelectionModalProps {
  isOpen: boolean;
  onSelect: (useAI: boolean) => void;
}

export const AISelectionModal: React.FC<AISelectionModalProps> = ({ isOpen, onSelect }) => {
  // AI DISABLED - Auto-select static ranges and don't show modal
  useEffect(() => {
    if (isOpen) {
      onSelect(false); // Always use static ranges
    }
  }, [isOpen, onSelect]);

  // Don't render anything - AI is disabled
  return null;

  /* ORIGINAL AI SELECTION MODAL - Uncomment when ready
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Choose Analysis Mode</h2>
          <p className={styles.subtitle}>
            Select how you'd like your hands to be analyzed during practice
          </p>
        </div>

        <div className={styles.options}>
          <button
            className={`${styles.optionCard} ${styles.aiOption}`}
            onClick={() => onSelect(true)}
          >
            <div className={styles.icon}>🤖</div>
            <h3 className={styles.optionTitle}>AI-Powered Analysis</h3>
            <p className={styles.optionDescription}>
              Uses Claude AI to analyze your hands with contextual reasoning
            </p>
            <ul className={styles.features}>
              <li>Slightly more precise edge cases</li>
              <li>Detailed reasoning for each decision</li>
              <li>Adapts to specific hand dynamics</li>
            </ul>
            <span className={styles.badge}>Recommended</span>
          </button>

          <button
            className={`${styles.optionCard} ${styles.staticOption}`}
            onClick={() => onSelect(false)}
          >
            <div className={styles.icon}>📊</div>
            <h3 className={styles.optionTitle}>Static Ranges</h3>
            <p className={styles.optionDescription}>
              Uses pre-computed GTO-based ranges for analysis
            </p>
            <ul className={styles.features}>
              <li>Instant responses</li>
              <li>No API calls needed</li>
              <li>Proven standard ranges</li>
            </ul>
            <span className={styles.badge}>Works Offline</span>
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            Both modes are accurate and effective for learning. AI mode provides
            slightly more nuanced analysis for borderline hands, but static ranges
            are already very reliable for mastering preflop fundamentals.
          </p>
          <p className={styles.changeNote}>
            You can change this setting anytime during practice.
          </p>
        </div>
      </div>
    </div>
  );
  */
};
