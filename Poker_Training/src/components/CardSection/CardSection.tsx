import React from 'react';
import type { Card as CardType } from '../../types';
import { Card } from '../Card';
import { getHandNotation } from '../../utils';
import styles from './CardSection.module.scss';

interface CardSectionProps {
  cards: CardType[];
  label?: string;
  showNotation?: boolean;
  placeholderCount?: number;
}

export const CardSection: React.FC<CardSectionProps> = ({
  cards,
  label,
  showNotation = false,
  placeholderCount = 0
}) => {
  return (
    <div className={styles.container}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.cards}>
        {cards.map((card, idx) => (
          <Card key={idx} card={card} />
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={`placeholder-${i}`} className={styles.placeholder}>
            ?
          </div>
        ))}
      </div>
      {showNotation && cards.length === 2 && (
        <div className={styles.notation}>
          <span className={styles.notationText}>{getHandNotation(cards)}</span>
        </div>
      )}
    </div>
  );
};
