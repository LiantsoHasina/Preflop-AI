import React from 'react';
import { Modal } from '../Modal/Modal';
import styles from './HowToPlayModal.module.scss';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Play Texas Hold'em"
      size="xl"
      showFooter={false}
      contentClassName={styles.content}
    >
      {/* Game Flow Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Game Flow</h3>
        <div className={styles.flowSteps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <strong>Blinds Posted</strong>
              <p>Small blind and big blind are forced bets to start the action.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div>
              <strong>Hole Cards Dealt</strong>
              <p>Each player receives 2 private cards (only you can see yours).</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div>
              <strong>Preflop Betting</strong>
              <p>Betting starts left of big blind. Options: fold, call, or raise.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div>
              <strong>The Flop</strong>
              <p>3 community cards are dealt face-up. Another betting round follows.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div>
              <strong>The Turn</strong>
              <p>4th community card is dealt. Betting continues.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>6</span>
            <div>
              <strong>The River</strong>
              <p>5th and final community card. Last betting round.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>7</span>
            <div>
              <strong>Showdown</strong>
              <p>Best 5-card hand wins using any combination of hole + community cards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hand Rankings Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Hand Rankings (Highest to Lowest)</h3>
        <div className={styles.rankings}>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>1</span>
            <div className={styles.rankInfo}>
              <strong>Royal Flush</strong>
              <span className={styles.example}>A K Q J 10 (same suit)</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>2</span>
            <div className={styles.rankInfo}>
              <strong>Straight Flush</strong>
              <span className={styles.example}>5 consecutive cards, same suit</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>3</span>
            <div className={styles.rankInfo}>
              <strong>Four of a Kind</strong>
              <span className={styles.example}>4 cards of same rank + 1 kicker</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>4</span>
            <div className={styles.rankInfo}>
              <strong>Full House</strong>
              <span className={styles.example}>3 of a kind + a pair</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>5</span>
            <div className={styles.rankInfo}>
              <strong>Flush</strong>
              <span className={styles.example}>5 cards same suit, any order</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>6</span>
            <div className={styles.rankInfo}>
              <strong>Straight</strong>
              <span className={styles.example}>5 consecutive cards, mixed suits</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>7</span>
            <div className={styles.rankInfo}>
              <strong>Three of a Kind</strong>
              <span className={styles.example}>3 cards same rank + 2 kickers</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>8</span>
            <div className={styles.rankInfo}>
              <strong>Two Pair</strong>
              <span className={styles.example}>2 different pairs + 1 kicker</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>9</span>
            <div className={styles.rankInfo}>
              <strong>One Pair</strong>
              <span className={styles.example}>2 cards same rank + 3 kickers</span>
            </div>
          </div>
          <div className={styles.rank}>
            <span className={styles.rankNumber}>10</span>
            <div className={styles.rankInfo}>
              <strong>High Card</strong>
              <span className={styles.example}>No made hand, highest card plays</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kicker Examples Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Understanding Kickers</h3>
        <p className={styles.intro}>
          When players have the same hand type, the <strong>kicker</strong> (highest unpaired card) breaks the tie.
        </p>
        <div className={styles.examples}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Example 1: Pair with Different Kickers</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>A♠ K♦</span>
                <span className={styles.handLabel}>Player 1</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.hand}>
                <span className={styles.cards}>A♥ Q♣</span>
                <span className={styles.handLabel}>Player 2</span>
              </div>
            </div>
            <div className={styles.board}>Board: A♣ 7♠ 4♦ 2♥ 9♣</div>
            <div className={styles.result}>
              <span className={styles.winner}>Player 1 wins!</span>
              <span className={styles.reason}>Both have pair of Aces, but K kicker beats Q kicker</span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Example 2: Two Pair - Second Kicker Matters</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>K♠ J♦</span>
                <span className={styles.handLabel}>Player 1</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.hand}>
                <span className={styles.cards}>K♥ 10♣</span>
                <span className={styles.handLabel}>Player 2</span>
              </div>
            </div>
            <div className={styles.board}>Board: K♣ 7♠ 7♦ 2♥ 3♣</div>
            <div className={styles.result}>
              <span className={styles.winner}>Player 1 wins!</span>
              <span className={styles.reason}>Both have Kings and 7s, J kicker beats 10 kicker</span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Example 3: Kicker Doesn't Always Play</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>A♠ K♦</span>
                <span className={styles.handLabel}>Player 1</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.hand}>
                <span className={styles.cards}>A♥ 2♣</span>
                <span className={styles.handLabel}>Player 2</span>
              </div>
            </div>
            <div className={styles.board}>Board: A♣ A♦ Q♠ J♥ 10♣</div>
            <div className={styles.result}>
              <span className={styles.tie}>Split Pot!</span>
              <span className={styles.reason}>Both play A-A-A-Q-J. The K and 2 don't play (only best 5 cards count)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tricky Hands Section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tricky Hands to Watch For</h3>
        <div className={styles.examples}>
          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>The "Wheel" Straight</div>
            <div className={styles.hand}>
              <span className={styles.cards}>5♠ 4♦ 3♣ 2♥ A♠</span>
            </div>
            <div className={styles.result}>
              <span className={styles.reason}>A-2-3-4-5 is the lowest straight. The Ace plays as a "1" here, not high.</span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Counterfeited Two Pair</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>8♠ 8♦</span>
                <span className={styles.handLabel}>Your Hand</span>
              </div>
            </div>
            <div className={styles.board}>Board: A♣ K♠ 7♦ 7♥ K♣</div>
            <div className={styles.result}>
              <span className={styles.reason}>
                Your 8s are "counterfeited". The board has K-K-7-7, which is higher than your 8-8-7-7.
                Anyone with an Ace wins with A-K-K-7-7.
              </span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Board Plays - "Playing the Board"</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>2♠ 3♦</span>
                <span className={styles.handLabel}>Your Hand</span>
              </div>
            </div>
            <div className={styles.board}>Board: A♣ K♠ Q♦ J♥ 10♣</div>
            <div className={styles.result}>
              <span className={styles.reason}>
                The board is A-K-Q-J-10 (Broadway straight). Everyone still in has the same hand.
                Your 2-3 doesn't improve it. This is a split pot with all remaining players.
              </span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Flush Over Flush</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>9♠ 6♠</span>
                <span className={styles.handLabel}>Player 1</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.hand}>
                <span className={styles.cards}>K♠ 2♠</span>
                <span className={styles.handLabel}>Player 2</span>
              </div>
            </div>
            <div className={styles.board}>Board: A♠ Q♠ 7♠ 4♦ 3♥</div>
            <div className={styles.result}>
              <span className={styles.winner}>Player 2 wins!</span>
              <span className={styles.reason}>Both have spade flushes, but K-high beats 9-high. Never assume your flush is best!</span>
            </div>
          </div>

          <div className={styles.exampleCard}>
            <div className={styles.exampleTitle}>Set vs Set (Set Over Set)</div>
            <div className={styles.versus}>
              <div className={styles.hand}>
                <span className={styles.cards}>7♠ 7♦</span>
                <span className={styles.handLabel}>Player 1</span>
              </div>
              <span className={styles.vs}>vs</span>
              <div className={styles.hand}>
                <span className={styles.cards}>J♥ J♣</span>
                <span className={styles.handLabel}>Player 2</span>
              </div>
            </div>
            <div className={styles.board}>Board: J♠ 7♣ 4♦ 2♥ 9♣</div>
            <div className={styles.result}>
              <span className={styles.winner}>Player 2 wins!</span>
              <span className={styles.reason}>Both flopped sets (three of a kind). Higher set always wins. This is often a "cooler" - hard to avoid losing big.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Tips</h3>
        <ul className={styles.tips}>
          <li>Your best 5 cards are made from ANY combination of your 2 hole cards + 5 community cards</li>
          <li>You can use 0, 1, or both of your hole cards in your final hand</li>
          <li>Position matters: acting last gives you more information</li>
          <li>Pay attention to possible straights and flushes on the board</li>
          <li>When the board pairs, full houses become possible</li>
        </ul>
      </section>
    </Modal>
  );
};
