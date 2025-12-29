import React, { useState } from 'react';
import type { PokerGameSettings } from '../../types';
import { HowToPlayModal } from './HowToPlayModal';
import styles from './PlayPoker.module.scss';

interface GameSetupProps {
  onStartGame: (settings: PokerGameSettings) => void;
  onBack: () => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, onBack }) => {
  const [playerCount, setPlayerCount] = useState(6);
  const [buyIn, setBuyIn] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [playerName, setPlayerName] = useState('Player');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleStart = () => {
    onStartGame({
      playerCount,
      buyIn,
      smallBlind,
      bigBlind,
      playerName
    });
  };

  const presetBlinds = [
    { sb: 5, bb: 10, label: '5/10' },
    { sb: 10, bb: 20, label: '10/20' },
    { sb: 25, bb: 50, label: '25/50' },
    { sb: 50, bb: 100, label: '50/100' }
  ];

  const presetBuyIns = [500, 1000, 2000, 5000];

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupCard}>
        <div className={styles.setupHeader}>
          <h2 className={styles.setupTitle}>Game Setup</h2>
          <button onClick={() => setShowHowToPlay(true)} className={styles.howToPlayButtonSetup}>
            ? How to Play
          </button>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={styles.textInput}
            placeholder="Enter your name"
            maxLength={12}
          />
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Number of Players</label>
          <div className={styles.playerCountSelector}>
            {[2, 3, 4, 5, 6, 7, 8, 9].map((count) => (
              <button
                key={count}
                onClick={() => setPlayerCount(count)}
                className={`${styles.countButton} ${playerCount === count ? styles.active : ''}`}
              >
                {count}
              </button>
            ))}
          </div>
          <span className={styles.hint}>1 human + {playerCount - 1} CPU players</span>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Buy-In Amount</label>
          <div className={styles.presetButtons}>
            {presetBuyIns.map((amount) => (
              <button
                key={amount}
                onClick={() => setBuyIn(amount)}
                className={`${styles.presetButton} ${buyIn === amount ? styles.active : ''}`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={buyIn}
            onChange={(e) => setBuyIn(Math.max(100, parseInt(e.target.value) || 100))}
            className={styles.numberInput}
            min={100}
            step={100}
          />
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.label}>Blinds (SB/BB)</label>
          <div className={styles.presetButtons}>
            {presetBlinds.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSmallBlind(preset.sb);
                  setBigBlind(preset.bb);
                }}
                className={`${styles.presetButton} ${smallBlind === preset.sb && bigBlind === preset.bb ? styles.active : ''}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className={styles.blindInputs}>
            <div className={styles.blindInput}>
              <span>SB:</span>
              <input
                type="number"
                value={smallBlind}
                onChange={(e) => {
                  const sb = Math.max(1, parseInt(e.target.value) || 1);
                  setSmallBlind(sb);
                  if (bigBlind < sb * 2) setBigBlind(sb * 2);
                }}
                className={styles.numberInput}
                min={1}
              />
            </div>
            <div className={styles.blindInput}>
              <span>BB:</span>
              <input
                type="number"
                value={bigBlind}
                onChange={(e) => setBigBlind(Math.max(smallBlind * 2, parseInt(e.target.value) || smallBlind * 2))}
                className={styles.numberInput}
                min={smallBlind * 2}
              />
            </div>
          </div>
        </div>

        <div className={styles.gameSummary}>
          <div className={styles.summaryItem}>
            <span>Starting Stack:</span>
            <span>{buyIn / bigBlind} BB</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Total Players:</span>
            <span>{playerCount}</span>
          </div>
        </div>

        <div className={styles.setupActions}>
          <button onClick={onBack} className={styles.backButton}>
            Back
          </button>
          <button onClick={handleStart} className={styles.startButton}>
            Start Game
          </button>
        </div>
      </div>

      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </div>
  );
};
