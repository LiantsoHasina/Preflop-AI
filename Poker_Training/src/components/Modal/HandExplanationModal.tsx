import React, { useState, useEffect } from 'react';
import type { Position, Action, Card } from '../../types';
import { positions, preflopRanges, suits } from '../../constants';
import { getExplanation } from '../../utils';
import { Modal } from './Modal';
import styles from './Modal.module.scss';

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

  // Reset to initial values when modal opens with new hand
  useEffect(() => {
    setCurrentPosition(initialPosition);
    setCurrentAction(initialAction);
    setCurrentExplanation(initialExplanation);
  }, [hand, initialPosition, initialAction, initialExplanation]);

  const convertHandToCards = (handNotation: string): Card[] => {
    const rank1 = handNotation[0] as any;
    const rank2 = handNotation[1] as any;
    const isSuited = handNotation.includes('s');
    const isPair = rank1 === rank2;

    const suit1 = suits[0];
    const suit2 = isSuited || isPair ? suits[0] : suits[1];

    return [
      { rank: rank1, suit: suit1 },
      { rank: rank2, suit: suit2 }
    ];
  };

  const getActionForHand = (handNotation: string, pos: Position): Action => {
    const range = preflopRanges[pos];
    if (range.raise.includes(handNotation)) return 'raise';
    if (range.call.includes(handNotation)) return 'call';
    return 'fold';
  };

  const handlePositionChange = (newPosition: Position) => {
    setCurrentPosition(newPosition);
    const newAction = getActionForHand(hand, newPosition);
    setCurrentAction(newAction);

    const cards = convertHandToCards(hand);
    const newExplanation = getExplanation(cards, newPosition, newAction);
    setCurrentExplanation(newExplanation);
  };

  const getActionColor = (act: Action): string => {
    if (act === 'raise') return styles.raise;
    if (act === 'call') return styles.call;
    return styles.fold;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hand Analysis">
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
