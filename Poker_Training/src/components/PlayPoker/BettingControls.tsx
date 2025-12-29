import React, { useState, useEffect } from 'react';
import type { PokerGameState, MultiplayerAction } from '../../types';
import { getAvailableActions, getPotSizeAmounts } from '../../utils';
import styles from './PlayPoker.module.scss';

interface BettingControlsProps {
  gameState: PokerGameState;
  onAction: (action: MultiplayerAction, amount?: number) => void;
  disabled?: boolean;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  gameState,
  onAction,
  disabled = false
}) => {
  const player = gameState.players.find(p => p.isHuman)!;
  const toCall = gameState.currentBet - player.currentBet;
  const availableActions = getAvailableActions(gameState);
  const potAmounts = getPotSizeAmounts(gameState, player.id);

  const minBet = gameState.currentBet > 0
    ? gameState.currentBet + gameState.minRaise
    : gameState.settings.bigBlind;
  const maxBet = player.chips + player.currentBet;

  const [raiseAmount, setRaiseAmount] = useState(minBet);

  useEffect(() => {
    setRaiseAmount(Math.max(minBet, Math.min(raiseAmount, maxBet)));
  }, [minBet, maxBet]);

  const handleRaiseAmountChange = (value: number) => {
    setRaiseAmount(Math.max(minBet, Math.min(value, maxBet)));
  };

  const canCheck = availableActions.includes('check');
  const canCall = availableActions.includes('call');
  const canBet = availableActions.includes('bet');
  const canRaise = availableActions.includes('raise');
  const canAllIn = availableActions.includes('all-in');

  const isHumanTurn = gameState.currentPlayerIndex === gameState.players.findIndex(p => p.isHuman);
  const humanHasFolded = player.status === 'folded';
  const currentPlayerName = gameState.players[gameState.currentPlayerIndex]?.name || 'Player';

  // Show watching message if human folded or not their turn
  if (humanHasFolded || !isHumanTurn || gameState.isHandComplete) {
    let message = 'Hand complete';
    if (!gameState.isHandComplete) {
      if (humanHasFolded) {
        message = `You folded. Watching ${currentPlayerName}...`;
      } else {
        message = `Waiting for ${currentPlayerName}...`;
      }
    }

    return (
      <div className={styles.bettingControls}>
        <div className={styles.waitingMessage}>
          {message}
        </div>
        {/* Show pot size while watching */}
        {!gameState.isHandComplete && (
          <div className={styles.betInfo}>
            <div className={styles.betInfoItem}>
              <span className={styles.betLabel}>Pot:</span>
              <span className={styles.betValue}>${gameState.pot}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.bettingControls}>
      {/* Current bet info */}
      <div className={styles.betInfo}>
        <div className={styles.betInfoItem}>
          <span className={styles.betLabel}>Pot:</span>
          <span className={styles.betValue}>${gameState.pot}</span>
        </div>
        {toCall > 0 && (
          <div className={styles.betInfoItem}>
            <span className={styles.betLabel}>To Call:</span>
            <span className={styles.betValue}>${toCall}</span>
          </div>
        )}
        <div className={styles.betInfoItem}>
          <span className={styles.betLabel}>Your Stack:</span>
          <span className={styles.betValue}>${player.chips}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={() => onAction('fold')}
          className={`${styles.actionButton} ${styles.foldButton}`}
          disabled={disabled}
        >
          Fold
        </button>

        {canCheck && (
          <button
            onClick={() => onAction('check')}
            className={`${styles.actionButton} ${styles.checkButton}`}
            disabled={disabled}
          >
            Check
          </button>
        )}

        {canCall && (
          <button
            onClick={() => onAction('call')}
            className={`${styles.actionButton} ${styles.callButton}`}
            disabled={disabled}
          >
            Call ${toCall}
          </button>
        )}

        {(canBet || canRaise) && (
          <button
            onClick={() => onAction(canBet ? 'bet' : 'raise', raiseAmount)}
            className={`${styles.actionButton} ${styles.raiseButton}`}
            disabled={disabled}
          >
            {canBet ? 'Bet' : 'Raise to'} ${raiseAmount}
          </button>
        )}

        {canAllIn && (
          <button
            onClick={() => onAction('all-in')}
            className={`${styles.actionButton} ${styles.allInButton}`}
            disabled={disabled}
          >
            All-In ${player.chips}
          </button>
        )}
      </div>

      {/* Raise slider and shortcuts */}
      {(canBet || canRaise) && (
        <div className={styles.raiseControls}>
          <div className={styles.raiseSlider}>
            <span className={styles.sliderLabel}>Min ${minBet}</span>
            <input
              type="range"
              min={minBet}
              max={maxBet}
              value={raiseAmount}
              onChange={(e) => handleRaiseAmountChange(parseInt(e.target.value))}
              className={styles.slider}
              disabled={disabled}
            />
            <span className={styles.sliderLabel}>Max ${maxBet}</span>
          </div>

          <div className={styles.potShortcuts}>
            <button
              onClick={() => handleRaiseAmountChange(potAmounts.half)}
              className={styles.shortcutButton}
              disabled={disabled}
            >
              1/2 Pot
            </button>
            <button
              onClick={() => handleRaiseAmountChange(potAmounts.twoThirds)}
              className={styles.shortcutButton}
              disabled={disabled}
            >
              2/3 Pot
            </button>
            <button
              onClick={() => handleRaiseAmountChange(potAmounts.full)}
              className={styles.shortcutButton}
              disabled={disabled}
            >
              Pot
            </button>
            <button
              onClick={() => handleRaiseAmountChange(maxBet)}
              className={styles.shortcutButton}
              disabled={disabled}
            >
              All-In
            </button>
          </div>

          <div className={styles.customAmount}>
            <span>Custom:</span>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => handleRaiseAmountChange(parseInt(e.target.value) || minBet)}
              min={minBet}
              max={maxBet}
              className={styles.amountInput}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
};
