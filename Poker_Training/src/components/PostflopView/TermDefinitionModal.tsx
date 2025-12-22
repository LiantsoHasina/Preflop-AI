import React from 'react';
import styles from './TermDefinitionModal.module.scss';

export type TermType = 'outs' | 'equity' | 'potOdds' | 'equityNeeded' | 'impliedOdds';

interface TermDefinition {
  title: string;
  beginnerExplanation: string;
  preciseExplanation: string;
  formula?: string;
  example?: string;
}

const termDefinitions: Record<TermType, TermDefinition> = {
  outs: {
    title: 'Outs',
    beginnerExplanation: `Think of "outs" as the cards left in the deck that can help you win. If you're trying to make a flush and you have 4 hearts, there are 9 more hearts in the deck that could complete your hand - those 9 cards are your "outs."`,
    preciseExplanation: `Outs are the number of unseen cards that will improve your hand to what is likely the best hand. The count assumes no card appears twice and accounts for cards that may help opponents (discounted outs).`,
    formula: `Outs = Cards that complete your draw

Common Outs:
• Flush draw: 9 outs (13 cards of suit - 4 you see)
• Open-ended straight: 8 outs (4 cards × 2 ranks)
• Gutshot straight: 4 outs (4 cards × 1 rank)
• Two overcards: 6 outs (3 cards × 2 ranks)
• Set (pocket pair to trips): 2 outs`,
    example: `You have A♥K♥, board shows 7♥2♥9♣

Your outs:
• 9 remaining hearts for flush = 9 outs
• 3 Aces + 3 Kings for top pair = 6 outs
• Total: ~12-15 outs (some overlap)`
  },
  equity: {
    title: 'Equity (Win Probability)',
    beginnerExplanation: `Equity is simply your chance of winning the hand. If you have 36% equity, it means if you played this exact situation 100 times, you'd win about 36 times on average.`,
    preciseExplanation: `Equity represents your expected share of the pot based on the probability of winning the hand by showdown. It's calculated by determining all possible runouts and counting how often your hand wins.`,
    formula: `Quick Estimation (Rule of 2 and 4):

On the Flop (2 cards to come):
Equity ≈ Outs × 4

On the Turn (1 card to come):
Equity ≈ Outs × 2

This slightly overestimates but is accurate enough for quick decisions.`,
    example: `You have a flush draw (9 outs) on the flop:

Quick math: 9 × 4 = 36% equity
Precise: 9/47 + (38/47 × 9/46) = 35%

With 36% equity, you'll complete your flush about 1 in 3 times.`
  },
  potOdds: {
    title: 'Pot Odds',
    beginnerExplanation: `Pot odds tell you what "price" you're getting to call a bet. If there's $100 in the pot and someone bets $50, you're risking $50 to win $150. That's a pretty good deal if your hand has a decent chance of winning!`,
    preciseExplanation: `Pot odds express the ratio between the current pot size (including the bet) and the cost to call. They determine the minimum equity required to profitably call a bet in the long run.`,
    formula: `Pot Odds (as ratio) = Pot : Bet to Call

Pot Odds (as %) = Bet to Call ÷ (Pot + Bet to Call) × 100

This percentage equals the minimum equity needed to break even on a call.`,
    example: `Pot: $100, Opponent bets: $50

Pot odds ratio = $150 : $50 = 3:1
Pot odds % = 50 ÷ 150 = 33.3%

You need at least 33.3% equity to call profitably.
If you have 40% equity → profitable call (+EV)
If you have 25% equity → losing call (-EV)`
  },
  equityNeeded: {
    title: 'Equity Needed',
    beginnerExplanation: `This is the minimum win rate you need for calling to be profitable. If you need 25% equity to call, your hand must win at least 1 out of 4 times on average for the call to make money in the long run.`,
    preciseExplanation: `Equity needed (or "breakeven equity") is derived from pot odds and represents the minimum probability of winning required for a call to have positive expected value (+EV). If your actual equity exceeds this threshold, calling is profitable.`,
    formula: `Equity Needed = Bet to Call ÷ (Pot + Bet to Call) × 100

This is mathematically identical to pot odds expressed as a percentage.

Decision Rule:
• Your Equity > Equity Needed → Call (+EV)
• Your Equity < Equity Needed → Fold (-EV)
• Your Equity = Equity Needed → Break Even`,
    example: `Pot: $80, Bet to call: $20

Equity Needed = 20 ÷ (80 + 20) = 20%

If you have a gutshot (4 outs × 2 = 8% on turn):
8% < 20% → Fold

If you have a flush draw (9 outs × 2 = 18% on turn):
18% < 20% but close → Consider implied odds`
  },
  impliedOdds: {
    title: 'Implied Odds',
    beginnerExplanation: `Implied odds account for the extra money you might win on future streets if you hit your draw. Even if pot odds say "fold," you might call because when you do hit, you could win a lot more from your opponent.`,
    preciseExplanation: `Implied odds extend pot odds by estimating future winnings when your draw completes. They justify calls that appear unprofitable by immediate pot odds but become profitable when accounting for expected future betting.`,
    formula: `Effective Pot = Current Pot + Expected Future Winnings

Implied Odds Adjustment:
• Strong, hidden draws = Higher implied odds
• Obvious draws = Lower implied odds
• Deep stacks = Higher implied odds
• Short stacks = Lower implied odds

Factors that increase implied odds:
• Your draw is disguised (e.g., inside straight)
• Opponent is aggressive and will pay off
• Deep effective stacks remain`,
    example: `Pot: $50, Bet: $25, Your equity: 18%
Direct pot odds need: 25 ÷ 75 = 33%

18% < 33%, so direct call is -EV

But if opponent has $200 behind and will likely:
• Bet $50 on turn that you'll call
• Pay off $100 on river when you hit

Expected future value: $150 × 18% = $27
This extra value makes calling profitable!`
  }
};

interface TermDefinitionModalProps {
  isOpen: boolean;
  term: TermType | null;
  onClose: () => void;
}

export const TermDefinitionModal: React.FC<TermDefinitionModalProps> = ({
  isOpen,
  term,
  onClose
}) => {
  if (!isOpen || !term) return null;

  const definition = termDefinitions[term];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <h2 className={styles.title}>{definition.title}</h2>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Simple Explanation</h3>
          <p className={styles.text}>{definition.beginnerExplanation}</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Technical Definition</h3>
          <p className={styles.text}>{definition.preciseExplanation}</p>
        </div>

        {definition.formula && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Formula & Calculation</h3>
            <pre className={styles.formula}>{definition.formula}</pre>
          </div>
        )}

        {definition.example && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Example</h3>
            <pre className={styles.example}>{definition.example}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
