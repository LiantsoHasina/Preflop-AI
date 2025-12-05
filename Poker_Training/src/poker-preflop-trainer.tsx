import React, {useState, useEffect, type JSX} from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Type Definitions
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
type Position = 'EP' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type Action = 'raise' | 'call' | 'fold';
type View = 'practice' | 'stats' | 'charts';
type FeedbackType = 'correct' | 'incorrect';

interface Card {
  rank: Rank;
  suit: Suit;
}

interface PositionInfo {
  value: Position;
  label: string;
}

interface PositionRange {
  raise: string[];
  call: string[];
  fold: 'default';
}

interface PreflopRanges {
  EP: PositionRange;
  MP: PositionRange;
  CO: PositionRange;
  BTN: PositionRange;
  SB: PositionRange;
  BB: PositionRange;
}

interface PositionStat {
  correct: number;
  total: number;
}

interface PositionStats {
  EP: PositionStat;
  MP: PositionStat;
  CO: PositionStat;
  BTN: PositionStat;
  SB: PositionStat;
  BB: PositionStat;
}

interface Feedback {
  type: FeedbackType;
  action: Action;
}

interface ChartData {
  name: string;
  accuracy: number;
  hands: number;
}

const PokerPreflopTrainer: React.FC = () => {
  const [currentHand, setCurrentHand] = useState<Card[]>([]);
  const [position, setPosition] = useState<Position>('BTN');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalHands, setTotalHands] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [view, setView] = useState<View>('practice');
  const [positionStats, setPositionStats] = useState<PositionStats>({
    EP: { correct: 0, total: 0 },
    MP: { correct: 0, total: 0 },
    CO: { correct: 0, total: 0 },
    BTN: { correct: 0, total: 0 },
    SB: { correct: 0, total: 0 },
    BB: { correct: 0, total: 0 }
  });
  const [chartPosition, setChartPosition] = useState<Position>('BTN');
  const [highlightedHand, setHighlightedHand] = useState<string | null>(null);

  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

  const positions: PositionInfo[] = [
    { value: 'EP', label: 'Early Position' },
    { value: 'MP', label: 'Middle Position' },
    { value: 'CO', label: 'Cutoff' },
    { value: 'BTN', label: 'Button' },
    { value: 'SB', label: 'Small Blind' },
    { value: 'BB', label: 'Big Blind' }
  ];

  const preflopRanges: PreflopRanges = {
    EP: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo'],
      call: ['88', '77', 'ATs', 'KQs', 'AQo'],
      fold: 'default'
    },
    MP: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'AKo', 'AQo'],
      call: ['77', '66', 'A9s', 'KJs', 'QJs', 'JTs', 'AJo'],
      fold: 'default'
    },
    CO: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'JTs', 'AKo', 'AQo', 'AJo', 'KQo'],
      call: ['55', '44', 'A8s', 'A7s', 'KTs', 'QTs', 'J9s', 'T9s', 'ATo'],
      fold: 'default'
    },
    BTN: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'],
      call: ['K8s', 'K7s', 'Q8s', 'J8s', '97s', '86s', '75s', '65s', 'A9o', 'KTo', 'QTo'],
      fold: 'default'
    },
    SB: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', 'AKo', 'AQo', 'AJo', 'KQo'],
      call: ['44', '33', '22', 'A6s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J9s', '87s', '76s', 'ATo', 'KJo'],
      fold: 'default'
    },
    BB: {
      raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'AKo', 'AQo'],
      call: ['77', '66', '55', '44', '33', '22', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
      fold: 'default'
    }
  };

  const generateHand = (): void => {
    const card1Rank: Rank = ranks[Math.floor(Math.random() * ranks.length)];
    const card2Rank: Rank = ranks[Math.floor(Math.random() * ranks.length)];
    const card1Suit: Suit = suits[Math.floor(Math.random() * suits.length)];
    const card2Suit: Suit = suits[Math.floor(Math.random() * suits.length)];
    
    setCurrentHand([
      { rank: card1Rank, suit: card1Suit },
      { rank: card2Rank, suit: card2Suit }
    ]);
    setFeedback(null);
    setShowExplanation(false);
  };

  useEffect(() => {
    generateHand();
  }, []);

  const getHandNotation = (hand: Card[]): string => {
    if (!hand || hand.length !== 2) return '';
    
    const rank1: Rank = hand[0].rank;
    const rank2: Rank = hand[1].rank;
    const suit1: Suit = hand[0].suit;
    const suit2: Suit = hand[1].suit;
    
    const rankValue = (r: Rank): number => ranks.indexOf(r);
    const higherRank: Rank = rankValue(rank1) > rankValue(rank2) ? rank1 : rank2;
    const lowerRank: Rank = rankValue(rank1) > rankValue(rank2) ? rank2 : rank1;
    
    if (rank1 === rank2) return rank1 + rank2;
    if (suit1 === suit2) return higherRank + lowerRank + 's';
    return higherRank + lowerRank + 'o';
  };

  const getCorrectAction = (hand: Card[], pos: Position): Action => {
    const notation: string = getHandNotation(hand);
    const range: PositionRange = preflopRanges[pos];
    
    if (range.raise.includes(notation)) return 'raise';
    if (range.call.includes(notation)) return 'call';
    return 'fold';
  };

  const getExplanation = (hand: Card[], pos: Position, action: Action): string => {
    const notation: string = getHandNotation(hand);
    const isPair: boolean = hand[0].rank === hand[1].rank;
    const isSuited: boolean = hand[0].suit === hand[1].suit;
    const highCard: Rank = ranks.indexOf(hand[0].rank) > ranks.indexOf(hand[1].rank) ? hand[0].rank : hand[1].rank;
    const lowCard: Rank = ranks.indexOf(hand[0].rank) > ranks.indexOf(hand[1].rank) ? hand[1].rank : hand[0].rank;
    
    const positionAdvantages: Record<Position, string> = {
      EP: 'early position with many players left to act',
      MP: 'middle position with moderate positional advantage',
      CO: 'cutoff position with good positional advantage',
      BTN: 'button position with maximum positional advantage',
      SB: 'small blind position acting first postflop',
      BB: 'big blind position with money already invested'
    };

    if (action === 'raise') {
      if (isPair && ranks.indexOf(hand[0].rank) >= 8) {
        return `Premium pocket pair ${notation} should be raised from ${positionAdvantages[pos]}. High pairs have excellent equity against most ranges and can build the pot with a strong made hand. They play well both heads-up and multiway.`;
      }
      if (notation.includes('A') && notation.includes('K')) {
        return `AK is the strongest unpaired hand and should be raised from ${positionAdvantages[pos]}. It has excellent equity against most hands, dominates other Ax hands, and can make top pair with the best kicker. ${isSuited ? 'Being suited adds flush potential and about 2.5% equity.' : ''}`;
      }
      if (notation.includes('A') && isSuited) {
        return `Suited aces like ${notation} should be raised from ${positionAdvantages[pos]}. They have good playability with nut flush potential, can make strong top pairs, and benefit from positional advantage. These hands perform well against calling ranges.`;
      }
      if (isSuited && ['K', 'Q', 'J', 'T'].includes(highCard) && ['Q', 'J', 'T', '9'].includes(lowCard)) {
        return `Broadway suited connector ${notation} should be raised from ${positionAdvantages[pos]}. These hands have excellent playability with straight and flush potential, plus they can make strong top pairs. They perform well in position and can win big pots when they connect.`;
      }
      return `Hand ${notation} falls into the raising range from ${positionAdvantages[pos]}. This hand has sufficient equity and playability to raise for value and to build a balanced range that protects your premium holdings.`;
    }
    
    if (action === 'call') {
      if (pos === 'BB') {
        return `From the big blind, ${notation} should call as you're getting good pot odds with money already invested. The BB can defend wider because you close the action preflop and only need to win the pot a small percentage of the time to profit. This hand has enough equity to continue.`;
      }
      return `Hand ${notation} is borderline from ${positionAdvantages[pos]}. It's profitable to call in the right situations but not strong enough to raise. Calling allows you to see a flop cheaply while keeping your range balanced. Be prepared to fold to aggression postflop if you don't connect.`;
    }
    
    if (action === 'fold') {
      return `Hand ${notation} should be folded from ${positionAdvantages[pos]}. This hand lacks the equity and playability needed to profitably continue. It's dominated by better hands in opponents' ranges and doesn't have enough potential to win large pots. Folding here preserves chips for stronger spots and maintains optimal range selection.`;
    }
    
    return '';
  };

  const handleAction = (action: Action): void => {
    const correctAction: Action = getCorrectAction(currentHand, position);
    const isCorrect: boolean = action === correctAction;
    
    setTotalHands(totalHands + 1);
    
    setPositionStats(prev => ({
      ...prev,
      [position]: {
        correct: prev[position].correct + (isCorrect ? 1 : 0),
        total: prev[position].total + 1
      }
    }));
    
    if (isCorrect) {
      setScore(score + 10);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      setFeedback({ type: 'correct', action: correctAction });
    } else {
      setStreak(0);
      setFeedback({ type: 'incorrect', action: correctAction });
    }
    
    setShowExplanation(true);
  };

  const nextHand = (): void => {
    generateHand();
    setHighlightedHand(null);
  };

  const viewInChart = (): void => {
    setHighlightedHand(getHandNotation(currentHand));
    setChartPosition(position);
    setView('charts');
  };

  const getStatsChartData = (): ChartData[] => {
    return positions.map(pos => ({
      name: pos.label,
      accuracy: positionStats[pos.value].total > 0
        ? Math.round((positionStats[pos.value].correct / positionStats[pos.value].total) * 100)
        : 0,
      hands: positionStats[pos.value].total
    }));
  };

  const renderCard = (card: Card): JSX.Element => {
    const isRed: boolean = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`inline-block w-20 h-28 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col items-center justify-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
        <div className="text-3xl font-bold">{card.rank}</div>
        <div className="text-4xl">{card.suit}</div>
      </div>
    );
  };

  const renderPracticeView = (): JSX.Element => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white text-sm">
            <div>Streak: <span className="text-yellow-400 font-bold text-lg">{streak}</span></div>
            <div>Best: <span className="text-yellow-400 font-bold text-lg">{bestStreak}</span></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="text-white text-center mb-3 text-sm font-semibold">Select Your Position:</div>
          <div className="relative bg-green-700 rounded-full mx-auto" style={{ width: '400px', height: '200px' }}>
            <button
              onClick={() => setPosition('EP')}
              title="Early Position"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'EP' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ top: '10%', left: '10%' }}
            >
              <div className="text-2xl">👤</div>
              <div className="text-xs font-bold text-white">EP</div>
            </button>
            
            <button
              onClick={() => setPosition('MP')}
              title="Middle Position"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'MP' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ top: '5%', left: '35%' }}
            >
              <div className="text-2xl">👤</div>
              <div className="text-xs font-bold text-white">MP</div>
            </button>
            
            <button
              onClick={() => setPosition('CO')}
              title="Cutoff"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'CO' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ top: '5%', right: '35%' }}
            >
              <div className="text-2xl">👤</div>
              <div className="text-xs font-bold text-white">CO</div>
            </button>
            
            <button
              onClick={() => setPosition('BTN')}
              title="Button"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'BTN' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ top: '10%', right: '10%' }}
            >
              <div className="text-2xl">🔘</div>
              <div className="text-xs font-bold text-white">BTN</div>
            </button>
            
            <button
              onClick={() => setPosition('SB')}
              title="Small Blind"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'SB' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ bottom: '10%', right: '25%' }}
            >
              <div className="text-2xl">👤</div>
              <div className="text-xs font-bold text-white">SB</div>
            </button>
            
            <button
              onClick={() => setPosition('BB')}
              title="Big Blind"
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                position === 'BB' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              style={{ bottom: '10%', left: '25%' }}
            >
              <div className="text-2xl">👤</div>
              <div className="text-xs font-bold text-white">BB</div>
            </button>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 my-8">
          {currentHand.map((card, idx) => (
            <div key={idx}>{renderCard(card)}</div>
          ))}
        </div>
        
        <div className="text-center mb-4">
          <span className="bg-gray-700 text-white px-4 py-2 rounded text-lg font-mono">
            {getHandNotation(currentHand)}
          </span>
        </div>
        
        {!showExplanation ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleAction('fold')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Fold
            </button>
            <button
              onClick={() => handleAction('call')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Call
            </button>
            <button
              onClick={() => handleAction('raise')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
            >
              Raise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`text-center p-4 rounded-lg ${feedback?.type === 'correct' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
              <div className="text-xl font-bold">
                {feedback?.type === 'correct' ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="text-lg">
                Correct action: <span className="font-bold uppercase">{feedback?.action}</span>
              </div>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg text-white">
              <div className="font-bold mb-2">Explanation:</div>
              <div className="text-sm leading-relaxed">
                {feedback && getExplanation(currentHand, position, feedback.action)}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={nextHand}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition"
              >
                Next Hand →
              </button>
              <button
                onClick={viewInChart}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition"
              >
                View in Chart 📊
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsView = (): JSX.Element => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-400">{score}</div>
          <div className="text-white text-sm">Total Score</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400">{totalHands > 0 ? Math.round((correctAnswers / totalHands) * 100) : 0}%</div>
          <div className="text-white text-sm">Accuracy</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-400">{totalHands}</div>
          <div className="text-white text-sm">Hands Played</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-400">{bestStreak}</div>
          <div className="text-white text-sm">Best Streak</div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-xl font-bold mb-4">Accuracy by Position</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getStatsChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="accuracy" fill="#10B981" name="Accuracy %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-white text-xl font-bold mb-4">Position Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map(pos => {
            const stats: PositionStat = positionStats[pos.value];
            const accuracy: number = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return (
              <div key={pos.value} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-bold">{pos.label}</div>
                    <div className="text-gray-400 text-sm">{stats.total} hands</div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderChartsView = (): JSX.Element => {
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
      
      const range: PositionRange = preflopRanges[chartPosition];
      if (range.raise.includes(hand)) return 'raise';
      if (range.call.includes(hand)) return 'call';
      return 'fold';
    };
    
    const getCellColor = (row: number, col: number): string => {
      const action: Action = getHandAction(row, col);
      const hand: string = row === col ? allRanks[row] + allRanks[col] :
                   row < col ? allRanks[row] + allRanks[col] + 's' :
                   allRanks[col] + allRanks[row] + 'o';
      
      const isHighlighted: boolean = hand === highlightedHand;
      
      if (isHighlighted) {
        if (action === 'raise') return 'bg-green-400 border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110 relative z-10';
        if (action === 'call') return 'bg-yellow-400 border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110 relative z-10';
        return 'bg-red-400 border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-110 relative z-10';
      }
      
      if (action === 'raise') return 'bg-green-600 hover:bg-green-500';
      if (action === 'call') return 'bg-yellow-600 hover:bg-yellow-500';
      return 'bg-red-600 hover:bg-red-500';
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white text-2xl font-bold mb-4 text-center">Preflop Range Chart</h3>
          
          <div className="mb-6">
            <div className="text-white text-center mb-3 text-sm font-semibold">Select Position:</div>
            <div className="relative bg-green-700 rounded-full mx-auto" style={{ width: '400px', height: '200px' }}>
              <button
                onClick={() => { setChartPosition('EP'); setHighlightedHand(null); }}
                title="Early Position"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'EP' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ top: '10%', left: '10%' }}
              >
                <div className="text-2xl">👤</div>
                <div className="text-xs font-bold text-white">EP</div>
              </button>
              
              <button
                onClick={() => { setChartPosition('MP'); setHighlightedHand(null); }}
                title="Middle Position"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'MP' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ top: '5%', left: '35%' }}
              >
                <div className="text-2xl">👤</div>
                <div className="text-xs font-bold text-white">MP</div>
              </button>
              
              <button
                onClick={() => { setChartPosition('CO'); setHighlightedHand(null); }}
                title="Cutoff"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'CO' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ top: '5%', right: '35%' }}
              >
                <div className="text-2xl">👤</div>
                <div className="text-xs font-bold text-white">CO</div>
              </button>
              
              <button
                onClick={() => { setChartPosition('BTN'); setHighlightedHand(null); }}
                title="Button"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'BTN' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ top: '10%', right: '10%' }}
              >
                <div className="text-2xl">🔘</div>
                <div className="text-xs font-bold text-white">BTN</div>
              </button>
              
              <button
                onClick={() => { setChartPosition('SB'); setHighlightedHand(null); }}
                title="Small Blind"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'SB' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ bottom: '10%', right: '25%' }}
              >
                <div className="text-2xl">👤</div>
                <div className="text-xs font-bold text-white">SB</div>
              </button>
              
              <button
                onClick={() => { setChartPosition('BB'); setHighlightedHand(null); }}
                title="Big Blind"
                className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                  chartPosition === 'BB' ? 'bg-yellow-500 scale-110 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={{ bottom: '10%', left: '25%' }}
              >
                <div className="text-2xl">👤</div>
                <div className="text-xs font-bold text-white">BB</div>
              </button>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-white text-xl font-bold mb-2">
              {positions.find(p => p.value === chartPosition)?.label}
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-white">Raise</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                <span className="text-white">Call</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span className="text-white">Fold</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center overflow-x-auto">
            <div className="bg-gray-900 p-4 rounded-lg inline-block">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-800 w-10 h-10"></th>
                    {allRanks.map(rank => (
                      <th key={rank} className="bg-gray-800 text-white font-bold text-center w-10 h-10 text-xs">{rank}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allRanks.map((rowRank, rowIdx) => (
                    <tr key={rowRank}>
                      <td className="bg-gray-800 text-white font-bold text-center w-10 h-10 text-xs">{rowRank}</td>
                      {allRanks.map((colRank, colIdx) => {
                        const hand: string = rowIdx === colIdx ? allRanks[rowIdx] + allRanks[colIdx] :
                                     rowIdx < colIdx ? allRanks[rowIdx] + allRanks[colIdx] + 's' :
                                     allRanks[colIdx] + allRanks[rowIdx] + 'o';
                        return (
                          <td
                            key={`${rowRank}-${colRank}`}
                            className={`${getCellColor(rowIdx, colIdx)} text-white font-bold text-center w-10 h-10 cursor-pointer transition-all text-xs`}
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
          
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <div className="text-white text-sm">
              <div className="font-bold mb-2">How to read this chart:</div>
              <ul className="space-y-1 text-gray-300">
                <li>• <span className="font-bold">Pairs</span> are on the diagonal (AA, KK, QQ, etc.)</li>
                <li>• <span className="font-bold">Suited hands</span> are above the diagonal (marked with 's')</li>
                <li>• <span className="font-bold">Offsuit hands</span> are below the diagonal (marked with 'o')</li>
                <li>• <span className="text-green-400 font-bold">Green</span> = Raise, <span className="text-yellow-400 font-bold">Yellow</span> = Call, <span className="text-red-400 font-bold">Red</span> = Fold</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">♠ Poker Preflop Trainer ♣</h1>
          <p className="text-gray-300">Master your preflop strategy with instant feedback</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setView('practice')}
            className={`flex-1 py-3 rounded font-bold transition ${view === 'practice' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Practice
          </button>
          <button
            onClick={() => setView('stats')}
            className={`flex-1 py-3 rounded font-bold transition ${view === 'stats' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Stats
          </button>
          <button
            onClick={() => setView('charts')}
            className={`flex-1 py-3 rounded font-bold transition ${view === 'charts' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Charts
          </button>
        </div>
        
        {view === 'practice' && renderPracticeView()}
        {view === 'stats' && renderStatsView()}
        {view === 'charts' && renderChartsView()}
      </div>
    </div>
  );
};

export default PokerPreflopTrainer;
