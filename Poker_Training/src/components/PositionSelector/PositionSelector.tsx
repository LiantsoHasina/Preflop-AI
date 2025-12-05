import React from 'react';
import type { Position } from '../../types';
import styles from './PositionSelector.module.scss';

interface PositionButtonProps {
  label: string;
  title: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
  className: string;
}

const PositionButton: React.FC<PositionButtonProps> = ({
  label,
  title,
  icon,
  isActive,
  onClick,
  className
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`${styles.positionButton} ${isActive ? styles.active : styles.inactive} ${className}`}
  >
    <div className={styles.icon}>{icon}</div>
    <div className={styles.positionLabel}>{label}</div>
  </button>
);

interface PositionSelectorProps {
  currentPosition: Position;
  onPositionChange: (position: Position) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  currentPosition,
  onPositionChange
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.label}>Select Your Position:</div>
      <div className={styles.table}>
        <PositionButton
          label="EP"
          title="Early Position"
          icon="👤"
          isActive={currentPosition === 'EP'}
          onClick={() => onPositionChange('EP')}
          className={styles.ep}
        />

        <PositionButton
          label="MP"
          title="Middle Position"
          icon="👤"
          isActive={currentPosition === 'MP'}
          onClick={() => onPositionChange('MP')}
          className={styles.mp}
        />

        <PositionButton
          label="CO"
          title="Cutoff"
          icon="👤"
          isActive={currentPosition === 'CO'}
          onClick={() => onPositionChange('CO')}
          className={styles.co}
        />

        <PositionButton
          label="BTN"
          title="Button"
          icon="🔘"
          isActive={currentPosition === 'BTN'}
          onClick={() => onPositionChange('BTN')}
          className={styles.btn}
        />

        <PositionButton
          label="SB"
          title="Small Blind"
          icon="👤"
          isActive={currentPosition === 'SB'}
          onClick={() => onPositionChange('SB')}
          className={styles.sb}
        />

        <PositionButton
          label="BB"
          title="Big Blind"
          icon="👤"
          isActive={currentPosition === 'BB'}
          onClick={() => onPositionChange('BB')}
          className={styles.bb}
        />
      </div>
    </div>
  );
};
