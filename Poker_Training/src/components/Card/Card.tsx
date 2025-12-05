import React from 'react';
import type { Card as CardType } from '../../types';
import { isRedCard } from '../../utils';
import styles from './Card.module.scss';

interface CardProps {
  card: CardType;
}

export const Card: React.FC<CardProps> = ({ card }) => {
  const isRed = isRedCard(card);

  return (
    <div className={`${styles.card} ${isRed ? styles.red : styles.black}`}>
      <div className={styles.rank}>{card.rank}</div>
      <div className={styles.suit}>{card.suit}</div>
    </div>
  );
};
