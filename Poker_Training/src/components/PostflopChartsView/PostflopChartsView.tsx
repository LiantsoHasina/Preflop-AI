import React, { useState } from 'react';
import { Card } from '../Card';
import type { Card as CardType } from '../../types';
import styles from './PostflopChartsView.module.scss';

type TabType = 'outs' | 'potOdds' | 'equity' | 'draws';

interface DrawExample {
  name: string;
  outs: number;
  description: string;
  holeCards: CardType[];
  communityCards: CardType[];
  neededCards: string;
}

const drawExamples: DrawExample[] = [
  {
    name: 'Flush Draw',
    outs: 9,
    description: '4 cards of the same suit with 9 remaining to complete',
    holeCards: [
      { rank: 'A', suit: '♥' },
      { rank: 'K', suit: '♥' }
    ],
    communityCards: [
      { rank: '7', suit: '♥' },
      { rank: '2', suit: '♥' },
      { rank: '9', suit: '♣' }
    ],
    neededCards: 'Any heart (9 remaining)'
  },
  {
    name: 'Open-Ended Straight Draw',
    outs: 8,
    description: '4 consecutive cards that can be completed on either end',
    holeCards: [
      { rank: 'J', suit: '♠' },
      { rank: 'T', suit: '♥' }
    ],
    communityCards: [
      { rank: '9', suit: '♦' },
      { rank: '8', suit: '♣' },
      { rank: '2', suit: '♠' }
    ],
    neededCards: 'Any 7 or Q (8 cards total)'
  },
  {
    name: 'Gutshot Straight Draw',
    outs: 4,
    description: 'Need one specific card rank to complete the straight',
    holeCards: [
      { rank: 'K', suit: '♠' },
      { rank: 'Q', suit: '♥' }
    ],
    communityCards: [
      { rank: 'J', suit: '♦' },
      { rank: '9', suit: '♣' },
      { rank: '2', suit: '♠' }
    ],
    neededCards: 'Any T (4 cards)'
  },
  {
    name: 'Two Overcards',
    outs: 6,
    description: 'Two cards higher than the board for top pair potential',
    holeCards: [
      { rank: 'A', suit: '♠' },
      { rank: 'K', suit: '♥' }
    ],
    communityCards: [
      { rank: '7', suit: '♦' },
      { rank: '5', suit: '♣' },
      { rank: '2', suit: '♠' }
    ],
    neededCards: 'Any A (3) or K (3) = 6 outs'
  },
  {
    name: 'Combo Draw (Flush + Straight)',
    outs: 15,
    description: 'Multiple draws that can complete your hand',
    holeCards: [
      { rank: 'J', suit: '♥' },
      { rank: 'T', suit: '♥' }
    ],
    communityCards: [
      { rank: '9', suit: '♥' },
      { rank: '8', suit: '♥' },
      { rank: '2', suit: '♣' }
    ],
    neededCards: '9 hearts + 6 non-heart 7s/Qs = ~15 outs'
  }
];

const potOddsChart = [
  { bet: '1/4 pot', ratio: '5:1', percentage: '16.7%' },
  { bet: '1/3 pot', ratio: '4:1', percentage: '20%' },
  { bet: '1/2 pot', ratio: '3:1', percentage: '25%' },
  { bet: '2/3 pot', ratio: '2.5:1', percentage: '28.5%' },
  { bet: '3/4 pot', ratio: '2.3:1', percentage: '30%' },
  { bet: 'Full pot', ratio: '2:1', percentage: '33.3%' },
  { bet: '2x pot', ratio: '1.5:1', percentage: '40%' }
];

const equityChart = [
  { outs: 1, flop: '4%', turn: '2%' },
  { outs: 2, flop: '8%', turn: '4%' },
  { outs: 4, flop: '16%', turn: '9%' },
  { outs: 6, flop: '24%', turn: '13%' },
  { outs: 8, flop: '32%', turn: '17%' },
  { outs: 9, flop: '36%', turn: '19%' },
  { outs: 12, flop: '45%', turn: '26%' },
  { outs: 15, flop: '54%', turn: '33%' }
];

export const PostflopChartsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('outs');

  const renderOutsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>How Outs Work</h3>
        <p className={styles.explanation}>
          Outs are the cards remaining in the deck that can improve your hand to (likely) the best hand.
          There are 52 cards total, and you can see your 2 hole cards plus the community cards.
        </p>
        <div className={styles.formula}>
          <strong>Calculating Available Cards:</strong>
          <br />
          52 total cards - 2 hole cards - 3/4/5 community cards = Unseen cards
          <br />
          <br />
          <strong>Example on Flop:</strong>
          <br />
          52 - 2 - 3 = 47 unseen cards
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Common Outs Reference</h3>
        <div className={styles.outsTable}>
          <div className={styles.tableHeader}>
            <span>Draw Type</span>
            <span>Outs</span>
            <span>Example</span>
          </div>
          <div className={styles.tableRow}>
            <span>Pocket pair to set</span>
            <span className={styles.outsNum}>2</span>
            <span>2 remaining cards of your pair</span>
          </div>
          <div className={styles.tableRow}>
            <span>One overcard</span>
            <span className={styles.outsNum}>3</span>
            <span>3 cards of that rank left</span>
          </div>
          <div className={styles.tableRow}>
            <span>Gutshot straight</span>
            <span className={styles.outsNum}>4</span>
            <span>4 cards complete the straight</span>
          </div>
          <div className={styles.tableRow}>
            <span>Two pair to full house</span>
            <span className={styles.outsNum}>4</span>
            <span>2 of each pair remaining</span>
          </div>
          <div className={styles.tableRow}>
            <span>Two overcards</span>
            <span className={styles.outsNum}>6</span>
            <span>3 of each rank</span>
          </div>
          <div className={styles.tableRow}>
            <span>Open-ended straight</span>
            <span className={styles.outsNum}>8</span>
            <span>4 cards on each end</span>
          </div>
          <div className={styles.tableRow}>
            <span>Flush draw</span>
            <span className={styles.outsNum}>9</span>
            <span>13 of suit - 4 seen = 9</span>
          </div>
          <div className={styles.tableRow}>
            <span>Flush + gutshot</span>
            <span className={styles.outsNum}>12</span>
            <span>9 + 4 - 1 overlap</span>
          </div>
          <div className={styles.tableRow}>
            <span>Flush + open-ended</span>
            <span className={styles.outsNum}>15</span>
            <span>9 + 8 - 2 overlap</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPotOddsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Understanding Pot Odds</h3>
        <p className={styles.explanation}>
          Pot odds compare how much you need to call versus the total pot. They tell you
          the minimum win rate required for a call to be profitable in the long run.
        </p>
        <div className={styles.formula}>
          <strong>Pot Odds Formula:</strong>
          <br />
          <br />
          As Ratio: Pot : Bet to Call
          <br />
          As Percentage: Bet ÷ (Pot + Bet) × 100
          <br />
          <br />
          <strong>Example:</strong>
          <br />
          Pot = $100, Bet = $50
          <br />
          Ratio: $150 : $50 = 3:1
          <br />
          Percentage: 50 ÷ 150 = 33.3%
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pot Odds Quick Reference</h3>
        <div className={styles.potOddsTable}>
          <div className={styles.tableHeader}>
            <span>Bet Size</span>
            <span>Odds Ratio</span>
            <span>Equity Needed</span>
          </div>
          {potOddsChart.map((row, idx) => (
            <div key={idx} className={styles.tableRow}>
              <span>{row.bet}</span>
              <span className={styles.ratio}>{row.ratio}</span>
              <span className={styles.percentage}>{row.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEquityTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>The Rule of 2 and 4</h3>
        <p className={styles.explanation}>
          A quick method to estimate your equity from outs. Multiply your outs by 4 on the flop
          (2 cards to come) or by 2 on the turn (1 card to come).
        </p>
        <div className={styles.formula}>
          <strong>On the Flop (turn + river to come):</strong>
          <br />
          Equity ≈ Outs × 4
          <br />
          <br />
          <strong>On the Turn (only river to come):</strong>
          <br />
          Equity ≈ Outs × 2
          <br />
          <br />
          <em>Note: Slightly overestimates but good for quick decisions</em>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Outs to Equity Conversion</h3>
        <div className={styles.equityTable}>
          <div className={styles.tableHeader}>
            <span>Outs</span>
            <span>Flop Equity</span>
            <span>Turn Equity</span>
          </div>
          {equityChart.map((row, idx) => (
            <div key={idx} className={styles.tableRow}>
              <span className={styles.outsNum}>{row.outs}</span>
              <span className={styles.flopEquity}>{row.flop}</span>
              <span className={styles.turnEquity}>{row.turn}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Decision Making</h3>
        <div className={styles.decisionBox}>
          <div className={styles.decisionRule}>
            <span className={styles.check}>✓</span>
            <span>If Your Equity {'>'} Equity Needed → <strong>CALL</strong> (profitable)</span>
          </div>
          <div className={styles.decisionRule}>
            <span className={styles.cross}>✗</span>
            <span>If Your Equity {'<'} Equity Needed → <strong>FOLD</strong> (unprofitable)</span>
          </div>
          <div className={styles.decisionRule}>
            <span className={styles.implied}>+</span>
            <span>Consider Implied Odds if close → <strong>CALL</strong> may be correct</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDrawsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Interactive Draw Examples</h3>
        <p className={styles.explanation}>
          See how different draws look and calculate their outs. Click on each example to understand
          how the cards on the board affect your drawing potential.
        </p>
      </div>

      <div className={styles.drawExamples}>
        {drawExamples.map((example, idx) => (
          <div key={idx} className={styles.drawExample}>
            <div className={styles.drawHeader}>
              <span className={styles.drawName}>{example.name}</span>
              <span className={styles.drawOuts}>{example.outs} outs</span>
            </div>
            <p className={styles.drawDescription}>{example.description}</p>

            <div className={styles.cardsSection}>
              <div className={styles.cardGroup}>
                <span className={styles.cardLabel}>Your Hand</span>
                <div className={styles.cards}>
                  {example.holeCards.map((card, i) => (
                    <Card key={i} card={card} />
                  ))}
                </div>
              </div>
              <div className={styles.cardGroup}>
                <span className={styles.cardLabel}>Board</span>
                <div className={styles.cards}>
                  {example.communityCards.map((card, i) => (
                    <Card key={i} card={card} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.neededCards}>
              <strong>Cards needed:</strong> {example.neededCards}
            </div>

            <div className={styles.equityCalc}>
              <span>Flop equity: ~{example.outs * 4}%</span>
              <span>Turn equity: ~{example.outs * 2}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Postflop Mechanics Guide</h2>
        <p className={styles.subtitle}>
          Learn how to calculate your edge in postflop situations
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'outs' ? styles.active : ''}`}
          onClick={() => setActiveTab('outs')}
        >
          Outs
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'potOdds' ? styles.active : ''}`}
          onClick={() => setActiveTab('potOdds')}
        >
          Pot Odds
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'equity' ? styles.active : ''}`}
          onClick={() => setActiveTab('equity')}
        >
          Equity
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'draws' ? styles.active : ''}`}
          onClick={() => setActiveTab('draws')}
        >
          Draw Examples
        </button>
      </div>

      {activeTab === 'outs' && renderOutsTab()}
      {activeTab === 'potOdds' && renderPotOddsTab()}
      {activeTab === 'equity' && renderEquityTab()}
      {activeTab === 'draws' && renderDrawsTab()}
    </div>
  );
};
