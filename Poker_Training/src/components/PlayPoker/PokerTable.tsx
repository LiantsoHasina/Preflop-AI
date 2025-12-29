import React from 'react';
import type { PokerGameState, PokerPlayer } from '../../types';
import { Card } from '../Card';
import styles from './PlayPoker.module.scss';

interface PokerTableProps {
  gameState: PokerGameState;
  onViewResults?: () => void;
  onNextHand?: () => void;
}

const PlayerSeat: React.FC<{
  player: PokerPlayer;
  isCurrentPlayer: boolean;
  showCards: boolean;
  isWinner: boolean;
  gameState: PokerGameState;
}> = ({ player, isCurrentPlayer, showCards, isWinner, gameState }) => {
  const statusClasses = {
    active: styles.active,
    folded: styles.folded,
    'all-in': styles.allIn,
    waiting: styles.waiting,
    out: styles.out
  };

  const isDealer = gameState.dealerPosition === player.position;
  const isSB = gameState.smallBlindPosition === player.position;
  const isBB = gameState.bigBlindPosition === player.position;

  return (
    <div
      className={`${styles.playerSeat} ${statusClasses[player.status]} ${isCurrentPlayer ? styles.currentTurn : ''} ${isWinner ? styles.winner : ''}`}
      style={{
        '--seat-position': player.position
      } as React.CSSProperties}
    >
      <div className={styles.playerInfo}>
        <div className={styles.playerName}>
          {player.name}
          {player.isHuman && <span className={styles.youTag}>(You)</span>}
        </div>
        <div className={styles.playerChips}>${player.chips}</div>
        <div className={styles.positionBadges}>
          {isDealer && <span className={styles.dealerBadge}>D</span>}
          {isSB && <span className={styles.sbBadge}>SB</span>}
          {isBB && <span className={styles.bbBadge}>BB</span>}
        </div>
      </div>

      <div className={styles.playerCards}>
        {player.holeCards.length > 0 ? (
          showCards || player.isHuman || gameState.showdown ? (
            player.holeCards.map((card, idx) => (
              <Card key={idx} card={card} size="small" />
            ))
          ) : (
            <>
              <div className={styles.cardBack} />
              <div className={styles.cardBack} />
            </>
          )
        ) : null}
      </div>

      {player.currentBet > 0 && (
        <div className={styles.playerBet}>
          ${player.currentBet}
        </div>
      )}

      {player.status === 'folded' && (
        <div className={styles.statusOverlay}>FOLDED</div>
      )}
      {player.status === 'all-in' && (
        <div className={styles.statusOverlay}>ALL-IN</div>
      )}
    </div>
  );
};

export const PokerTable: React.FC<PokerTableProps> = ({ gameState, onViewResults, onNextHand }) => {
  const { players, communityCards, pot, bettingRound, currentPlayerIndex, winners, showdown, isHandComplete } = gameState;

  // Calculate positions for players around table
  const getPlayerPositions = (count: number) => {
    // Positions are distributed around an oval table
    // Human player is always at bottom center
    return players.map((_, index) => {
      const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
      return {
        x: 50 + 40 * Math.cos(angle),
        y: 50 + 35 * Math.sin(angle)
      };
    });
  };

  const positions = getPlayerPositions(players.length);

  return (
    <div className={styles.tableContainer}>
      <div className={styles.table}>
        {/* Pot display */}
        <div className={styles.potArea}>
          <div className={styles.potAmount}>${pot}</div>
          <div className={styles.potLabel}>Pot</div>
        </div>

        {/* Community cards */}
        <div className={styles.communityCards}>
          {communityCards.map((card, idx) => (
            <Card key={idx} card={card} />
          ))}
          {/* Placeholder cards */}
          {bettingRound === 'preflop' && Array(5).fill(0).map((_, i) => (
            <div key={`placeholder-${i}`} className={styles.cardPlaceholder} />
          ))}
          {bettingRound === 'flop' && Array(2).fill(0).map((_, i) => (
            <div key={`placeholder-${i}`} className={styles.cardPlaceholder} />
          ))}
          {bettingRound === 'turn' && (
            <div className={styles.cardPlaceholder} />
          )}
        </div>

        {/* Round indicator */}
        <div className={styles.roundIndicator}>
          {bettingRound.toUpperCase()}
        </div>

        {/* Winner announcement */}
        {showdown && winners.length > 0 && (
          <div className={styles.winnerAnnouncement}>
            {winners.length === 1 ? (
              <>
                <div className={styles.winnerName}>{winners[0].playerName} wins!</div>
                <div className={styles.winnerHand}>{winners[0].hand.description}</div>
                <div className={styles.winnerAmount}>${winners[0].amount}</div>
              </>
            ) : (
              <>
                <div className={styles.winnerName}>Split pot!</div>
                <div className={styles.winnerHand}>
                  {winners.map(w => w.playerName).join(', ')}
                </div>
              </>
            )}
          </div>
        )}

        {/* Player seats */}
        {players.map((player, index) => (
          <div
            key={player.id}
            className={styles.seatWrapper}
            style={{
              left: `${positions[index].x}%`,
              top: `${positions[index].y}%`
            }}
          >
            <PlayerSeat
              player={player}
              isCurrentPlayer={currentPlayerIndex === index && !isHandComplete}
              showCards={showdown || isHandComplete}
              isWinner={winners.some(w => w.playerId === player.id)}
              gameState={gameState}
            />
          </div>
        ))}
      </div>

      {/* Action buttons - appear when hand is complete */}
      {isHandComplete && (
        <div className={styles.handCompleteActions}>
          {onViewResults && (
            <button onClick={onViewResults} className={styles.viewResultsButton}>
              View Hand Analysis
            </button>
          )}
          {onNextHand && (
            <button onClick={onNextHand} className={styles.nextHandButton}>
              Next Hand →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
