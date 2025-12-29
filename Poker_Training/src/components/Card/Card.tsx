import React from 'react';
import type { Card as CardType } from '../../types';
import { isRedCard } from '../../utils';
import styles from './Card.module.scss';

interface CardProps {
  card: CardType;
  size?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ card, size = 'medium' }) => {
  const isRed = isRedCard(card);
  const sizeClass = size === 'small' ? styles.small : size === 'large' ? styles.large : '';

  return (
    <div className={`${styles.card} ${isRed ? styles.red : styles.black} ${sizeClass}`}>
      <div className={styles.rank}>{card.rank}</div>
      <div className={styles.suit}>{card.suit}</div>
    </div>
  );
};
