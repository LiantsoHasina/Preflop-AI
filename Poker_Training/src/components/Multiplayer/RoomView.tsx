import React, { useState, useEffect } from 'react';
import type { MultiplayerRoom, PokerGameState } from '../../types';
import { socketService } from '../../services/socket.service';
import { MultiplayerGame } from './MultiplayerGame';
import styles from './MultiplayerLobby.module.scss';

interface RoomViewProps {
  room: MultiplayerRoom;
  currentUserId: string;
  onLeave: () => void;
  onBack: () => void;
}

export const RoomView: React.FC<RoomViewProps> = ({
  room,
  currentUserId,
  onLeave,
  onBack
}) => {
  const [gameState, setGameState] = useState<PokerGameState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const currentPlayer = room.players.find(p => p.socketId === currentUserId);
  const isHost = currentPlayer?.isHost ?? false;
  const readyCount = room.players.filter(p => p.isReady).length;
  const canStart = isHost && room.players.length >= 2 && readyCount === room.players.length;

  // Set up game event listeners
  useEffect(() => {
    const handleGameStarted = (state: PokerGameState) => {
      setGameState(state);
    };

    const handleGameUpdated = (state: PokerGameState) => {
      setGameState(state);
    };

    const handleGameEnded = () => {
      setGameState(null);
    };

    const handleTimerTick = (seconds: number) => {
      setTimerSeconds(seconds);
    };

    socketService.on('game:started', handleGameStarted);
    socketService.on('game:updated', handleGameUpdated);
    socketService.on('game:ended', handleGameEnded);
    socketService.on('timer:tick', handleTimerTick);

    return () => {
      socketService.off('game:started', handleGameStarted);
      socketService.off('game:updated', handleGameUpdated);
      socketService.off('game:ended', handleGameEnded);
      socketService.off('timer:tick', handleTimerTick);
    };
  }, []);

  const handleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    socketService.setReady(newReady);
  };

  const handleStart = () => {
    socketService.startGame();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKick = (socketId: string) => {
    socketService.kickPlayer(socketId);
  };

  // If game is in progress, show game view
  if (gameState && room.status === 'playing') {
    return (
      <MultiplayerGame
        gameState={gameState}
        timerSeconds={timerSeconds}
        onBack={onBack}
      />
    );
  }

  // Waiting room view
  return (
    <div className={styles.roomContainer}>
      <div className={styles.roomHeader}>
        <button onClick={onLeave} className={styles.leaveBtn}>
          Leave Room
        </button>
        <div className={styles.roomCodeSection}>
          <span className={styles.roomCodeLabel}>Room Code:</span>
          <button onClick={handleCopyCode} className={styles.roomCodeValue}>
            {room.roomCode}
            <span className={styles.copyIcon}>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <div className={styles.roomSettings}>
          <span>{room.settings.smallBlind}/{room.settings.bigBlind}</span>
          <span>{room.settings.buyIn} chips</span>
          {room.settings.timerEnabled && <span>{room.settings.timerSeconds}s timer</span>}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.pokerTable}>
          <div className={styles.tableCenter}>
            <h3>Waiting for players...</h3>
            <p className={styles.playerCount}>
              {room.players.length}/{room.settings.maxPlayers} players
            </p>
            <p className={styles.readyCount}>
              {readyCount} ready
            </p>
          </div>

          {/* Render seats around the table */}
          {Array.from({ length: room.settings.maxPlayers }).map((_, seatIndex) => {
            const player = room.players.find(p => p.seatIndex === seatIndex);
            const seatAngle = (360 / room.settings.maxPlayers) * seatIndex - 90;
            const radius = 42; // percentage
            const x = 50 + radius * Math.cos((seatAngle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((seatAngle * Math.PI) / 180);

            return (
              <div
                key={seatIndex}
                className={`${styles.seat} ${player ? styles.occupied : styles.empty}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {player ? (
                  <div className={`${styles.playerSeat} ${player.isReady ? styles.ready : ''}`}>
                    <span className={styles.playerName}>
                      {player.name}
                      {player.isHost && <span className={styles.hostBadge}>Host</span>}
                    </span>
                    <span className={styles.playerChips}>{player.chips}</span>
                    {player.isReady && <span className={styles.readyBadge}>Ready</span>}
                    {isHost && player.socketId !== currentUserId && (
                      <button
                        onClick={() => handleKick(player.socketId)}
                        className={styles.kickBtn}
                        title="Kick player"
                      >
                        X
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.emptySeat}>
                    <span>Empty</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.roomActions}>
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={styles.startBtn}
          >
            {!canStart
              ? room.players.length < 2
                ? 'Need at least 2 players'
                : 'Waiting for all players to be ready'
              : 'Start Game'}
          </button>
        ) : (
          <button
            onClick={handleReady}
            className={`${styles.readyBtn} ${isReady ? styles.isReady : ''}`}
          >
            {isReady ? 'Ready!' : 'Click when Ready'}
          </button>
        )}
      </div>

      {/* Player list */}
      <div className={styles.playerList}>
        <h4>Players ({room.players.length})</h4>
        <ul>
          {room.players.map(player => (
            <li key={player.socketId} className={player.isReady ? styles.ready : ''}>
              <span className={styles.name}>
                {player.name}
                {player.socketId === currentUserId && ' (You)'}
                {player.isHost && ' - Host'}
              </span>
              <span className={styles.status}>
                {player.isReady ? 'Ready' : 'Waiting'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
