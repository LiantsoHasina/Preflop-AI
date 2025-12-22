import React from 'react';
import type { Action, PostflopAction } from '../../types';
import styles from './ActionButtons.module.scss';

type ActionButtonsType = 'preflop' | 'postflop-bet' | 'postflop-call';

interface ActionButtonsProps {
  type: ActionButtonsType;
  disabled?: boolean;
  betAmount?: number;
  onAction: (action: Action | PostflopAction) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  type,
  disabled = false,
  betAmount = 0,
  onAction
}) => {
  if (type === 'preflop') {
    return (
      <div className={styles.container}>
        <button
          onClick={() => onAction('fold')}
          className={styles.foldButton}
          disabled={disabled}
        >
          {disabled ? 'Analyzing...' : 'Fold'}
        </button>
        <button
          onClick={() => onAction('call')}
          className={styles.callButton}
          disabled={disabled}
        >
          {disabled ? 'Analyzing...' : 'Call'}
        </button>
        <button
          onClick={() => onAction('raise')}
          className={styles.raiseButton}
          disabled={disabled}
        >
          {disabled ? 'Analyzing...' : 'Raise'}
        </button>
      </div>
    );
  }

  if (type === 'postflop-bet') {
    return (
      <div className={styles.container}>
        <button
          onClick={() => onAction('check')}
          className={styles.checkButton}
          disabled={disabled}
        >
          {disabled ? 'Analyzing...' : 'Check'}
        </button>
        <button
          onClick={() => onAction('bet')}
          className={styles.betButton}
          disabled={disabled}
        >
          {disabled ? 'Analyzing...' : 'Bet'}
        </button>
      </div>
    );
  }

  // postflop-call
  return (
    <div className={styles.container}>
      <button
        onClick={() => onAction('fold')}
        className={styles.foldButton}
        disabled={disabled}
      >
        {disabled ? 'Analyzing...' : 'Fold'}
      </button>
      <button
        onClick={() => onAction('call')}
        className={styles.callButton}
        disabled={disabled}
      >
        {disabled ? 'Analyzing...' : `Call $${betAmount}`}
      </button>
      <button
        onClick={() => onAction('raise')}
        className={styles.raiseButton}
        disabled={disabled}
      >
        {disabled ? 'Analyzing...' : 'Raise'}
      </button>
    </div>
  );
};
