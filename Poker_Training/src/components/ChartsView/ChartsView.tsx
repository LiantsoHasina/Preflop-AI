import React from 'react';
import type { Position, Rank, Action } from '../../types';
import { positions, preflopRanges } from '../../constants';
import { PositionSelector } from '../PositionSelector';
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
                      return (
                        <td
                          key={`${rowRank}-${colRank}`}
                          className={getCellClassName(rowIdx, colIdx)}
                          title={hand}
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
