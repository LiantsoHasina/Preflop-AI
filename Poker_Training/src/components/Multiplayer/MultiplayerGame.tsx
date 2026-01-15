import React, { useState, useMemo } from 'react';
import type { PokerGameState, MultiplayerAction } from '../../types';
import { socketService } from '../../services/socket.service';
import { Card } from '../Card';
import styles from './MultiplayerLobby.module.scss';

interface MultiplayerGameProps {
  gameState: PokerGameState;
  timerSeconds: number | null;
  onBack: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  gameState,
  timerSeconds,
  onBack
}) => {
  const [raiseAmount, setRaiseAmount] = useState(gameState.minRaise);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const humanPlayer = gameState.players.find(p => p.isHuman);
  const isMyTurn = humanPlayer && currentPlayer?.id === humanPlayer.id;

  // Calculate available actions
  const availableActions = useMemo(() => {
    if (!humanPlayer || !isMyTurn) return [];

    const actions: MultiplayerAction[] = ['fold'];
    const toCall = gameState.currentBet - humanPlayer.currentBet;

    if (toCall === 0) {
      actions.push('check');
    } else {
      actions.push('call');
    }

    if (humanPlayer.chips > toCall) {
      if (gameState.currentBet === 0) {
        actions.push('bet');
      } else {
        actions.push('raise');
      }
    }

    if (humanPlayer.chips <= toCall + gameState.minRaise) {
      actions.push('all-in');
    }

    return actions;
  }, [humanPlayer, isMyTurn, gameState]);

  const handleAction = (action: MultiplayerAction) => {
    if (action === 'raise' || action === 'bet') {
      socketService.sendAction(action, raiseAmount);
    } else if (action === 'all-in') {
      socketService.sendAction(action, humanPlayer?.chips);
    } else {
      socketService.sendAction(action);
    }
  };

  const toCall = humanPlayer ? gameState.currentBet - humanPlayer.currentBet : 0;

  // Calculate seat positions
  const getSeatStyle = (index: number, total: number) => {
    const angle = (360 / total) * index - 90;
    const radius = 38;
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className={styles.gameContainer}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <button onClick={onBack} className={styles.backBtn}>
          Leave Game
        </button>
        <div className={styles.gameInfo}>
          <span className={styles.bettingRound}>{gameState.bettingRound.toUpperCase()}</span>
          <span className={styles.pot}>Pot: {gameState.pot}</span>
        </div>
        {timerSeconds !== null && (
          <div className={`${styles.timer} ${timerSeconds <= 10 ? styles.warning : ''}`}>
            {timerSeconds}s
          </div>
        )}
      </div>

      {/* Poker Table */}
      <div className={styles.gameTableContainer}>
        <div className={styles.gameTable}>
          {/* Community Cards */}
          <div className={styles.communityCards}>
            {gameState.communityCards.length > 0 ? (
              gameState.communityCards.map((card, i) => (
                <Card key={i} card={card} size="medium" />
              ))
            ) : (
              <div className={styles.noCards}>
                {gameState.bettingRound === 'preflop' ? 'Preflop' : 'Dealing...'}
              </div>
            )}
          </div>

          {/* Pot Display */}
          <div className={styles.potDisplay}>
            <span>Pot: {gameState.pot}</span>
            {gameState.currentBet > 0 && (
              <span className={styles.currentBet}>Current Bet: {gameState.currentBet}</span>
            )}
          </div>

          {/* Players around table */}
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`${styles.gamePlayer} ${
                player.status === 'folded' ? styles.folded : ''
              } ${player.id === currentPlayer?.id ? styles.active : ''} ${
                player.isHuman ? styles.human : ''
              }`}
              style={getSeatStyle(index, gameState.players.length)}
            >
              <div className={styles.playerInfo}>
                <span className={styles.playerName}>
                  {player.name}
                  {player.isDealer && <span className={styles.dealerChip}>D</span>}
                </span>
                <span className={styles.playerChips}>{player.chips}</span>
              </div>

              {/* Player's hole cards */}
              <div className={styles.holeCards}>
                {player.holeCards.length > 0 && (player.isHuman || gameState.showdown) ? (
                  player.holeCards.map((card, i) => (
                    <Card key={i} card={card} size="small" />
                  ))
                ) : player.status !== 'folded' ? (
                  <>
                    <div className={styles.cardBack} />
                    <div className={styles.cardBack} />
                  </>
                ) : null}
              </div>

              {/* Current bet indicator */}
              {player.currentBet > 0 && (
                <div className={styles.playerBet}>
                  {player.currentBet}
                </div>
              )}

              {/* Status badge */}
              {player.status !== 'active' && (
                <div className={styles.statusBadge}>
                  {player.status}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      {isMyTurn && humanPlayer?.status === 'active' && (
        <div className={styles.actionControls}>
          <div className={styles.actionInfo}>
            <span>Your turn</span>
            {toCall > 0 && <span className={styles.toCall}>To call: {toCall}</span>}
          </div>

          <div className={styles.actionButtons}>
            {availableActions.includes('fold') && (
              <button
                onClick={() => handleAction('fold')}
                className={`${styles.actionBtn} ${styles.foldBtn}`}
              >
                Fold
              </button>
            )}

            {availableActions.includes('check') && (
              <button
                onClick={() => handleAction('check')}
                className={`${styles.actionBtn} ${styles.checkBtn}`}
              >
                Check
              </button>
            )}

            {availableActions.includes('call') && (
              <button
                onClick={() => handleAction('call')}
                className={`${styles.actionBtn} ${styles.callBtn}`}
              >
                Call {toCall}
              </button>
            )}

            {(availableActions.includes('bet') || availableActions.includes('raise')) && (
              <div className={styles.raiseControl}>
                <input
                  type="range"
                  min={gameState.minRaise}
                  max={humanPlayer.chips}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                  className={styles.raiseSlider}
                />
                <button
                  onClick={() => handleAction(availableActions.includes('bet') ? 'bet' : 'raise')}
                  className={`${styles.actionBtn} ${styles.raiseBtn}`}
                >
                  {availableActions.includes('bet') ? 'Bet' : 'Raise'} {raiseAmount}
                </button>
              </div>
            )}

            {availableActions.includes('all-in') && (
              <button
                onClick={() => handleAction('all-in')}
                className={`${styles.actionBtn} ${styles.allInBtn}`}
              >
                All-In ({humanPlayer.chips})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Waiting for opponent */}
      {!isMyTurn && !gameState.isHandComplete && (
        <div className={styles.waitingMessage}>
          Waiting for {currentPlayer?.name}...
        </div>
      )}

      {/* Hand complete - show winner */}
      {gameState.isHandComplete && gameState.winners.length > 0 && (
        <div className={styles.winnerOverlay}>
          <div className={styles.winnerCard}>
            <h3>Winner!</h3>
            {gameState.winners.map((winner, i) => (
              <div key={i} className={styles.winnerInfo}>
                <span className={styles.winnerName}>{winner.playerName}</span>
                <span className={styles.winnerAmount}>+{winner.amount}</span>
                <span className={styles.winnerHand}>{winner.hand.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
