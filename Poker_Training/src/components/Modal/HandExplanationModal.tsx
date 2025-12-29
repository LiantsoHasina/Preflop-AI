import React, { useState, useEffect } from 'react';
import type { Position, Action } from '../../types';
import { positions } from '../../constants';
import { getExplanation, convertHandNotationToCards, getActionForHandNotation } from '../../utils';
import { Modal } from './Modal';
import styles from './HandExplanationModal.module.scss';

interface HandExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hand: string;
  position: Position;
  action: Action;
  explanation: string;
}

export const HandExplanationModal: React.FC<HandExplanationModalProps> = ({
  isOpen,
  onClose,
  hand,
  position: initialPosition,
  action: initialAction,
  explanation: initialExplanation
}) => {
  const [currentPosition, setCurrentPosition] = useState<Position>(initialPosition);
  const [currentAction, setCurrentAction] = useState<Action>(initialAction);
  const [currentExplanation, setCurrentExplanation] = useState<string>(initialExplanation);

  useEffect(() => {
    setCurrentPosition(initialPosition);
    setCurrentAction(initialAction);
    setCurrentExplanation(initialExplanation);
  }, [hand, initialPosition, initialAction, initialExplanation]);

  const handlePositionChange = (newPosition: Position) => {
    setCurrentPosition(newPosition);
    const newAction = getActionForHandNotation(hand, newPosition);
    setCurrentAction(newAction);

    const cards = convertHandNotationToCards(hand);
    const newExplanation = getExplanation(cards, newPosition, newAction);
    setCurrentExplanation(newExplanation);
  };

  const getActionColor = (act: Action): string => {
    if (act === 'raise') return styles.raise;
    if (act === 'call') return styles.call;
    return styles.fold;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hand Analysis" size="lg">
      <div className={styles.handInfo}>
        <div className={styles.handNotation}>
          <span className={styles.notation}>{hand}</span>
        </div>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <div className={styles.label}>Position</div>
            <select
              className={styles.positionSelect}
              value={currentPosition}
              onChange={(e) => handlePositionChange(e.target.value as Position)}
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {pos.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.label}>Recommended Action</div>
            <div className={`${styles.value} ${getActionColor(currentAction)}`}>
              {currentAction.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanationBox}>
        <div className={styles.explanationTitle}>Strategy Explanation:</div>
        <div className={styles.explanationText}>{currentExplanation}</div>
      </div>
    </Modal>
  );
};
