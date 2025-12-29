import React, { useState } from 'react';
import { usePokerGame } from '../../hooks/usePokerGame';
import { GameSetup } from './GameSetup';
import { PokerTable } from './PokerTable';
import { BettingControls } from './BettingControls';
import { HandAnalysis } from './HandAnalysis';
import { GameSidebars } from './GameSidebars';
import { HowToPlayModal } from './HowToPlayModal';
import styles from './PlayPoker.module.scss';

interface PlayPokerProps {
  onBack: () => void;
}

export const PlayPoker: React.FC<PlayPokerProps> = ({ onBack }) => {
  const {
    gameState,
    phase,
    isProcessing,
    handNumber,
    startGame,
    handleAction,
    continueToNextHand,
    startNewGame,
    viewResults
  } = usePokerGame();

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (phase === 'setup') {
    return <GameSetup onStartGame={startGame} onBack={onBack} />;
  }

  if (!gameState) return null;

  // Game Over Screen
  if (gameState.isGameOver) {
    const humanPlayer = gameState.players.find(p => p.isHuman)!;
    const didWin = humanPlayer.chips > 0 &&
      gameState.players.filter(p => p.chips > 0).length === 1;

    return (
      <div className={styles.gameOverContainer}>
        <div className={styles.gameOverCard}>
          <h2 className={styles.gameOverTitle}>
            {didWin ? 'Congratulations!' : 'Game Over'}
          </h2>
          <p className={styles.gameOverMessage}>
            {didWin
              ? 'You won the tournament!'
              : `You finished with $${humanPlayer.chips}`}
          </p>
          <p className={styles.handCount}>Hands played: {handNumber}</p>
          <button onClick={startNewGame} className={styles.newGameButton}>
            Play Again
          </button>
          <button onClick={onBack} className={styles.backButton}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playPokerContainer}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <button onClick={onBack} className={styles.backLink}>
          ← Back to Menu
        </button>
        <div className={styles.handInfo}>
          Hand #{handNumber}
        </div>
        <div className={styles.headerRight}>
          <div className={styles.blindsInfo}>
            Blinds: ${gameState.settings.smallBlind}/${gameState.settings.bigBlind}
          </div>
          <button onClick={() => setShowHowToPlay(true)} className={styles.howToPlayButton}>
            ? How to Play
          </button>
        </div>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      {/* Main game area */}
      {phase === 'playing' && (
        <>
          <GameSidebars
            gameState={gameState}
            leftOpen={leftPanelOpen}
            rightOpen={rightPanelOpen}
            onToggleLeft={() => setLeftPanelOpen(!leftPanelOpen)}
            onToggleRight={() => setRightPanelOpen(!rightPanelOpen)}
          />
          <div className={`${styles.gameContentWrapper} ${leftPanelOpen ? styles.leftOpen : ''} ${rightPanelOpen ? styles.rightOpen : ''}`}>
            <PokerTable gameState={gameState} onViewResults={viewResults} onNextHand={continueToNextHand} />
            <BettingControls
              gameState={gameState}
              onAction={handleAction}
              disabled={isProcessing}
            />
          </div>
        </>
      )}

      {phase === 'analysis' && (
        <HandAnalysis
          gameState={gameState}
          onContinue={continueToNextHand}
          onNewGame={startNewGame}
        />
      )}
    </div>
  );
};
