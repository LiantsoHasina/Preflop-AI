import React, { useState } from 'react';
import type { Position, Rank, Action, Card } from '../../types';
import { positions, preflopRanges, suits } from '../../constants';
import { getExplanation } from '../../utils';
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
  const allRanks: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action>('fold');
  const [selectedExplanation, setSelectedExplanation] = useState<string>('');

  const getHandAction = (row: number, col: number): Action => {
    let hand: string = '';
    if (row === col) {
      hand = allRanks[row] + allRanks[col];
    } else if (row < col) {
      hand = allRanks[row] + allRanks[col] + 's';
    } else {
      hand = allRanks[col] + allRanks[row] + 'o';
    }

    const range = preflopRanges[chartPosition];
    if (range.raise.includes(hand)) return 'raise';
    if (range.call.includes(hand)) return 'call';
    return 'fold';
  };

  const getCellClassName = (row: number, col: number): string => {
    const action: Action = getHandAction(row, col);
    const hand: string = row === col ? allRanks[row] + allRanks[col] :
                 row < col ? allRanks[row] + allRanks[col] + 's' :
                 allRanks[col] + allRanks[row] + 'o';

    const isHighlighted: boolean = hand === highlightedHand;

    const classes = [styles[action]];
    if (isHighlighted) {
      classes.push(styles.highlighted);
    }
    return classes.join(' ');
  };

  const handlePositionChange = (position: Position) => {
    onPositionChange(position);
  };

  const convertHandToCards = (hand: string): Card[] => {
    // Parse hand notation (e.g., "AKs", "QQ", "JTo") to Card objects
    const rank1 = hand[0] as Rank;
    const rank2 = hand[1] as Rank;
    const isSuited = hand.includes('s');
    const isPair = rank1 === rank2;

    // Use first two suits for suited/offsuit
    const suit1 = suits[0];
    const suit2 = isSuited || isPair ? suits[0] : suits[1];

    return [
      { rank: rank1, suit: suit1 },
      { rank: rank2, suit: suit2 }
    ];
  };

  const handleCellClick = (hand: string, action: Action) => {
    const cards = convertHandToCards(hand);
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
          onPositionChange={handlePositionChange}
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
                  {allRanks.map(rank => (
                    <th key={rank}>{rank}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRanks.map((rowRank, rowIdx) => (
                  <tr key={rowRank}>
                    <td className={styles.headerCell}>{rowRank}</td>
                    {allRanks.map((colRank, colIdx) => {
                      const hand: string = rowIdx === colIdx ? allRanks[rowIdx] + allRanks[colIdx] :
                                   rowIdx < colIdx ? allRanks[rowIdx] + allRanks[colIdx] + 's' :
                                   allRanks[colIdx] + allRanks[rowIdx] + 'o';
                      const action = getHandAction(rowIdx, colIdx);
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
