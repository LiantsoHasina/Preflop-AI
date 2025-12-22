import React, { useState } from 'react';
import type {
  Card as CardType,
  BettingRound,
  PostflopAction,
  PostflopFeedback,
  OutsAnalysis
} from '../../types';
import { BETTING_ROUND_LABELS, GAME_CONSTANTS } from '../../constants';
import { getHandNotation } from '../../utils';
import { Card } from '../Card';
import { TermDefinitionModal } from './TermDefinitionModal';
import type { TermType } from './TermDefinitionModal';
import styles from './PostflopView.module.scss';

interface PostflopViewProps {
  holeCards: CardType[];
  communityCards: CardType[];
  bettingRound: BettingRound;
  pot: number;
  betToCall: number;
  analysis: OutsAnalysis | null;
  feedback: PostflopFeedback | null;
  showFeedback: boolean;
  isAnalyzing: boolean;
  onAction: (action: PostflopAction) => void;
  onNextStreet: () => void;
  onNewHand: () => void;
}

export const PostflopView: React.FC<PostflopViewProps> = ({
  holeCards,
  communityCards,
  bettingRound,
  pot,
  betToCall,
  analysis,
  feedback,
  showFeedback,
  isAnalyzing,
  onAction,
  onNextStreet,
  onNewHand
}) => {
  const [selectedTerm, setSelectedTerm] = useState<TermType | null>(null);
  const [showOddsValues, setShowOddsValues] = useState(false);

  const handleTermClick = (term: TermType) => {
    setSelectedTerm(term);
  };

  const toggleOddsVisibility = () => {
    setShowOddsValues(!showOddsValues);
  };

  const getEquityMultiplier = (): number => {
    return GAME_CONSTANTS.equityMultipliers[bettingRound as keyof typeof GAME_CONSTANTS.equityMultipliers] || 0;
  };

  const renderActionButtons = () => {
    if (betToCall === 0) {
      return (
        <div className={styles.actionButtons}>
          <button
            onClick={() => onAction('check')}
            className={styles.checkButton}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Check'}
          </button>
          <button
            onClick={() => onAction('bet')}
            className={styles.betButton}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Bet'}
          </button>
        </div>
      );
    }

    return (
      <div className={styles.actionButtons}>
        <button
          onClick={() => onAction('fold')}
          className={styles.foldButton}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Fold'}
        </button>
        <button
          onClick={() => onAction('call')}
          className={styles.callButton}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : `Call $${betToCall}`}
        </button>
        <button
          onClick={() => onAction('raise')}
          className={styles.raiseButton}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Raise'}
        </button>
      </div>
    );
  };

  const canContinue = feedback?.type === 'correct' && bettingRound !== 'river';

  return (
    <div className={styles.container}>
      <div className={styles.gameArea}>
        {/* Betting Round Indicator */}
        <div className={styles.roundIndicator}>
          <span className={styles.roundBadge}>{BETTING_ROUND_LABELS[bettingRound]}</span>
        </div>

        {/* Pot Info */}
        <div className={styles.potInfo}>
          <div className={styles.potAmount}>
            <span className={styles.label}>Pot:</span>
            <span className={styles.value}>${pot}</span>
          </div>
          {betToCall > 0 && (
            <div className={styles.betToCall}>
              <span className={styles.label}>To Call:</span>
              <span className={styles.value}>${betToCall}</span>
            </div>
          )}
        </div>

        {/* Community Cards */}
        <div className={styles.communitySection}>
          <div className={styles.sectionLabel}>Community Cards</div>
          <div className={styles.communityCards}>
            {communityCards.map((card, idx) => (
              <Card key={`community-${idx}`} card={card} />
            ))}
            {/* Show placeholder cards for unrevealed streets */}
            {bettingRound === 'flop' &&
              [0, 1].map((i) => (
                <div key={`placeholder-${i}`} className={styles.cardPlaceholder}>
                  ?
                </div>
              ))}
            {bettingRound === 'turn' && (
              <div className={styles.cardPlaceholder}>?</div>
            )}
          </div>
        </div>

        {/* Hole Cards */}
        <div className={styles.holeCardsSection}>
          <div className={styles.sectionLabel}>Your Hand</div>
          <div className={styles.holeCards}>
            {holeCards.map((card, idx) => (
              <Card key={`hole-${idx}`} card={card} />
            ))}
          </div>
          <div className={styles.handNotation}>
            <span className={styles.notation}>{getHandNotation(holeCards)}</span>
          </div>
        </div>

        {/* Pot Odds Info (shown before action) */}
        {!showFeedback && analysis && (
          <div className={styles.oddsInfo}>
            <div className={styles.oddsHeader}>
              <div className={styles.oddsHeaderLeft}>
                Pot Odds Analysis
                <span className={styles.clickHint}>(click terms for details)</span>
              </div>
              <button
                className={styles.visibilityToggle}
                onClick={toggleOddsVisibility}
                title={showOddsValues ? 'Hide values' : 'Show values'}
              >
                {showOddsValues ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
            <div className={styles.oddsGrid}>
              <div
                className={`${styles.oddsItem} ${styles.clickable}`}
                onClick={() => handleTermClick('outs')}
              >
                <span className={styles.oddsLabel}>Total Outs:</span>
                <span className={styles.oddsValue}>
                  {showOddsValues ? analysis.outs.toFixed(1) : '???'}
                </span>
              </div>
              <div
                className={`${styles.oddsItem} ${styles.clickable}`}
                onClick={() => handleTermClick('equity')}
              >
                <span className={styles.oddsLabel}>Your Equity:</span>
                <span className={styles.oddsValue}>
                  {showOddsValues ? `~${(analysis.outs * getEquityMultiplier()).toFixed(1)}%` : '???'}
                </span>
              </div>
              <div
                className={`${styles.oddsItem} ${styles.clickable}`}
                onClick={() => handleTermClick('equityNeeded')}
              >
                <span className={styles.oddsLabel}>Equity Needed:</span>
                <span className={styles.oddsValue}>
                  {showOddsValues ? `${analysis.equityNeeded.toFixed(1)}%` : '???'}
                </span>
              </div>
              {analysis.impliedOdds > 5 && (
                <div
                  className={`${styles.oddsItem} ${styles.clickable}`}
                  onClick={() => handleTermClick('impliedOdds')}
                >
                  <span className={styles.oddsLabel}>Implied Odds:</span>
                  <span className={styles.oddsValue}>
                    {showOddsValues ? `+${analysis.impliedOdds.toFixed(0)}%` : '???'}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.drawsList}>
              {analysis.draws
                .filter((d) => d.outs > 0 || d.type !== 'nothing')
                .map((draw, idx) => (
                  <div key={idx} className={styles.drawItem}>
                    {showOddsValues ? draw.description : draw.description.replace(/\d+(\.\d+)?/g, '?')}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons or Feedback */}
        {!showFeedback ? (
          renderActionButtons()
        ) : (
          <div className={styles.feedbackSection}>
            <div
              className={`${styles.feedbackBox} ${feedback?.type === 'correct' ? styles.correct : styles.incorrect}`}
            >
              <div className={styles.feedbackTitle}>
                {feedback?.type === 'correct' ? 'Correct!' : 'Incorrect'}
              </div>
              <div className={styles.feedbackActions}>
                <span>Your action: </span>
                <span className={styles.playerAction}>{feedback?.playerAction}</span>
                <span> | Recommended: </span>
                <span className={styles.correctAction}>{feedback?.correctAction}</span>
              </div>
            </div>

            <div className={styles.explanationBox}>
              <div className={styles.title}>Analysis:</div>
              <div className={styles.content}>
                {analysis?.explanation.split('\n').map((line, idx) => (
                  <p key={idx} className={line.startsWith('**') ? styles.bold : ''}>
                    {line.replace(/\*\*/g, '')}
                  </p>
                ))}
              </div>
            </div>

            <div className={styles.nextButtons}>
              {canContinue ? (
                <button onClick={onNextStreet} className={styles.nextStreetButton}>
                  Deal {bettingRound === 'flop' ? 'Turn' : 'River'} Card
                </button>
              ) : (
                <button onClick={onNewHand} className={styles.newHandButton}>
                  {feedback?.type === 'correct' ? 'New Hand' : 'Try New Hand'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <TermDefinitionModal
        isOpen={selectedTerm !== null}
        term={selectedTerm}
        onClose={() => setSelectedTerm(null)}
      />
    </div>
  );
};
