import React, { useState } from 'react';
import type { Position, Action } from '../../types';
import { positions, CHART_RANKS } from '../../constants';
import {
  getExplanation,
  getActionForHandNotation,
  getHandNotationFromGrid,
  convertHandNotationToCards
} from '../../utils';
import { PositionSelector } from '../PositionSelector';
import { HandExplanationModal } from '../Modal/HandExplanationModal';
import styles from './ChartsView.module.scss';

interface ChartsViewProps {
  chartPosition: Position;
  highlightedHand: string | null;
  onPositionChange: (position: Position) => void;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  chartPosition,
  highlightedHand,
  onPositionChange
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action>('fold');
  const [selectedExplanation, setSelectedExplanation] = useState<string>('');

  const getCellClassName = (row: number, col: number): string => {
    const hand = getHandNotationFromGrid(row, col, CHART_RANKS);
    const action = getActionForHandNotation(hand, chartPosition);
    const isHighlighted = hand === highlightedHand;

    const classes = [styles[action]];
    if (isHighlighted) {
      classes.push(styles.highlighted);
    }
    return classes.join(' ');
  };

  const handleCellClick = (hand: string, action: Action) => {
    const cards = convertHandNotationToCards(hand);
    const explanation = getExplanation(cards, chartPosition, action);

    setSelectedHand(hand);
    setSelectedAction(action);
    setSelectedExplanation(explanation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartSection}>
        <h3 className={styles.title}>Preflop Range Chart</h3>

        <PositionSelector
          currentPosition={chartPosition}
          onPositionChange={onPositionChange}
        />

        <div className={styles.positionLabel}>
          {positions.find(p => p.value === chartPosition)?.label}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.raise}`}></div>
            <span className={styles.label}>Raise</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.call}`}></div>
            <span className={styles.label}>Call</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.colorBox} ${styles.fold}`}></div>
            <span className={styles.label}>Fold</span>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartTable}>
            <table>
              <thead>
                <tr>
                  <th className={styles.empty}></th>
                  {CHART_RANKS.map(rank => (
                    <th key={rank}>{rank}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CHART_RANKS.map((rowRank, rowIdx) => (
                  <tr key={rowRank}>
                    <td className={styles.headerCell}>{rowRank}</td>
                    {CHART_RANKS.map((colRank, colIdx) => {
                      const hand = getHandNotationFromGrid(rowIdx, colIdx, CHART_RANKS);
                      const action = getActionForHandNotation(hand, chartPosition);
                      return (
                        <td
                          key={`${rowRank}-${colRank}`}
                          className={getCellClassName(rowIdx, colIdx)}
                          title={hand}
                          onClick={() => handleCellClick(hand, action)}
                        >
                          {hand}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.instructionsBox}>
          <div className={styles.instructionsText}>
            <div className={styles.instructionsTitle}>How to read this chart:</div>
            <ul>
              <li>• <span className={styles.bold}>Pairs</span> are on the diagonal (AA, KK, QQ, etc.)</li>
              <li>• <span className={styles.bold}>Suited hands</span> are above the diagonal (marked with 's')</li>
              <li>• <span className={styles.bold}>Offsuit hands</span> are below the diagonal (marked with 'o')</li>
              <li>• <span className={styles.green}>Green</span> = Raise, <span className={styles.yellow}>Yellow</span> = Call, <span className={styles.red}>Red</span> = Fold</li>
              <li>• <span className={styles.bold}>Click any hand</span> to see detailed explanation</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedHand && (
        <HandExplanationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          hand={selectedHand}
          position={chartPosition}
          action={selectedAction}
          explanation={selectedExplanation}
        />
      )}
    </div>
  );
};
