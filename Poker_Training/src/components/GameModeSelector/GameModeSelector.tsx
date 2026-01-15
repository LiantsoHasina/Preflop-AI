import React, { useState } from 'react';
import type { GameMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../AuthModal/AuthModal';
import styles from './GameModeSelector.module.scss';

interface GameModeSelectorProps {
  isOpen: boolean;
  onSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ isOpen, onSelect }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Auth Section */}
        <div className={styles.authSection}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>{user?.email}</span>
              <button onClick={logout} className={styles.logoutButton}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className={styles.signInButton}>
              Sign In
            </button>
          )}
        </div>

        <div className={styles.header}>
          <h2 className={styles.title}>Choose Your Mode</h2>
          <p className={styles.subtitle}>
            Train your skills or play a real poker game
          </p>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Featured Mode Cards */}
        <div className={styles.featuredCards}>
          {/* Play Real Poker (vs CPU) */}
          <button
            className={`${styles.featuredCard} ${styles.playPokerOption}`}
            onClick={() => onSelect('play-poker')}
          >
            <div className={styles.featuredContent}>
              <div className={styles.featuredIconWrapper}>
                <span className={styles.featuredIcon}>🎰</span>
              </div>
              <h3 className={styles.featuredTitle}>Play vs CPU</h3>
              <p className={styles.featuredDescription}>
                Play against AI opponents with post-hand analysis
              </p>
              <div className={styles.featuredFeatures}>
                <span>2-9 Players</span>
                <span>Custom Blinds</span>
                <span>Analysis</span>
              </div>
            </div>
          </button>

          {/* Multiplayer Mode */}
          <button
            className={`${styles.featuredCard} ${styles.multiplayerOption} ${!isAuthenticated ? styles.locked : ''}`}
            onClick={() => {
              if (isAuthenticated) {
                onSelect('multiplayer');
              } else {
                setShowAuthModal(true);
              }
            }}
          >
            <div className={styles.featuredContent}>
              <div className={styles.featuredIconWrapper}>
                <span className={styles.featuredIcon}>👥</span>
                <span className={styles.newBadge}>NEW</span>
              </div>
              <h3 className={styles.featuredTitle}>Multiplayer</h3>
              <p className={styles.featuredDescription}>
                Play with friends or join public tables online
              </p>
              <div className={styles.featuredFeatures}>
                <span>2-9 Players</span>
                <span>Room Codes</span>
                <span>Timer</span>
              </div>
              {!isAuthenticated && (
                <div className={styles.lockOverlay}>
                  <span className={styles.lockIcon}>🔒</span>
                  <span className={styles.lockText}>Sign in to play</span>
                </div>
              )}
            </div>
          </button>
        </div>

        <div className={styles.divider}>
          <span>or practice specific skills</span>
        </div>

        <div className={styles.options}>
          <button
            className={`${styles.optionCard} ${styles.preflopOption}`}
            onClick={() => onSelect('preflop-only')}
          >
            <div className={styles.icon}>🎯</div>
            <h3 className={styles.optionTitle}>Preflop Training</h3>
            <p className={styles.optionDescription}>
              Master opening ranges and position-based strategy
            </p>
            <span className={styles.badge}>Classic</span>
          </button>

          <button
            className={`${styles.optionCard} ${styles.fullGameOption}`}
            onClick={() => onSelect('full-game')}
          >
            <div className={styles.icon}>♠️</div>
            <h3 className={styles.optionTitle}>Full Hand Training</h3>
            <p className={styles.optionDescription}>
              Complete preflop + postflop decision training
            </p>
            <span className={styles.badge}>Complete</span>
          </button>

          <button
            className={`${styles.optionCard} ${styles.postflopOption}`}
            onClick={() => onSelect('postflop-only')}
          >
            <div className={styles.icon}>🃏</div>
            <h3 className={styles.optionTitle}>Postflop Training</h3>
            <p className={styles.optionDescription}>
              Focus on pot odds and drawing decisions
            </p>
            <span className={styles.badge}>Focused</span>
          </button>
        </div>

        <div className={styles.footer}>
          <p className={styles.changeNote}>
            You can switch modes anytime from the menu.
          </p>
        </div>
      </div>
    </div>
  );
};
