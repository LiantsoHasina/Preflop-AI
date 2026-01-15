import React, { useState } from 'react';
import type { MultiplayerRoomSettings } from '../../types';
import styles from './MultiplayerLobby.module.scss';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (settings: MultiplayerRoomSettings) => void;
}

const TIMER_OPTIONS = [15, 30, 45, 60];
const PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9];
const BLIND_PRESETS = [
  { small: 5, big: 10, label: '5/10' },
  { small: 10, big: 20, label: '10/20' },
  { small: 25, big: 50, label: '25/50' },
  { small: 50, big: 100, label: '50/100' },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreate }) => {
  const [settings, setSettings] = useState<MultiplayerRoomSettings>({
    maxPlayers: 6,
    buyIn: 1000,
    smallBlind: 10,
    bigBlind: 20,
    timerEnabled: true,
    timerSeconds: 30,
    isPrivate: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(settings);
  };

  const handleBlindSelect = (small: number, big: number) => {
    setSettings(prev => ({ ...prev, smallBlind: small, bigBlind: big }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Create Room</h2>
          <button onClick={onClose} className={styles.closeBtn}>X</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Room Type */}
          <div className={styles.formGroup}>
            <label>Room Type</label>
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!settings.isPrivate ? styles.active : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, isPrivate: false }))}
              >
                Public
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${settings.isPrivate ? styles.active : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, isPrivate: true }))}
              >
                Private
              </button>
            </div>
            <p className={styles.hint}>
              {settings.isPrivate
                ? 'Only players with the room code can join'
                : 'Anyone can see and join this room'}
            </p>
          </div>

          {/* Max Players */}
          <div className={styles.formGroup}>
            <label>Max Players</label>
            <div className={styles.buttonGrid}>
              {PLAYER_OPTIONS.map(count => (
                <button
                  key={count}
                  type="button"
                  className={`${styles.optionBtn} ${settings.maxPlayers === count ? styles.active : ''}`}
                  onClick={() => setSettings(prev => ({ ...prev, maxPlayers: count }))}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Blinds */}
          <div className={styles.formGroup}>
            <label>Blinds</label>
            <div className={styles.buttonGrid}>
              {BLIND_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  className={`${styles.optionBtn} ${
                    settings.smallBlind === preset.small && settings.bigBlind === preset.big
                      ? styles.active
                      : ''
                  }`}
                  onClick={() => handleBlindSelect(preset.small, preset.big)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buy-in */}
          <div className={styles.formGroup}>
            <label>Buy-in</label>
            <input
              type="number"
              value={settings.buyIn}
              onChange={(e) => setSettings(prev => ({ ...prev, buyIn: Math.max(100, parseInt(e.target.value) || 0) }))}
              min={100}
              step={100}
              className={styles.numberInput}
            />
            <p className={styles.hint}>
              {Math.floor(settings.buyIn / settings.bigBlind)} big blinds
            </p>
          </div>

          {/* Timer */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={settings.timerEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, timerEnabled: e.target.checked }))}
              />
              Action Timer
            </label>
            {settings.timerEnabled && (
              <div className={styles.buttonGrid}>
                {TIMER_OPTIONS.map(seconds => (
                  <button
                    key={seconds}
                    type="button"
                    className={`${styles.optionBtn} ${settings.timerSeconds === seconds ? styles.active : ''}`}
                    onClick={() => setSettings(prev => ({ ...prev, timerSeconds: seconds }))}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            )}
            <p className={styles.hint}>
              {settings.timerEnabled
                ? `Players must act within ${settings.timerSeconds} seconds or auto-fold`
                : 'No time limit for actions'}
            </p>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.createBtn}>
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
