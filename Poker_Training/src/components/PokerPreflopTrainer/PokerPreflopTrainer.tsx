import React, { useState, useEffect } from 'react';
import type {
  Card,
  Position,
  View,
  Feedback,
  PositionStats,
  Action,
  GameMode,
  BettingRound,
  PostflopAction,
  PostflopFeedback,
  OutsAnalysis,
  PostflopGameState
} from '../../types';
import {
  generateHand,
  getCorrectAction,
  getHandNotation,
  getFullAnalysisAI,
  getExplanation,
  dealCommunityCards,
  analyzePostflop,
  generateBettingScenario
} from '../../utils';
import {
  PracticeView,
  PostflopView,
  PostflopChartsView,
  StatsView,
  PostflopStatsView,
  FullGameStatsView,
  ChartsView,
  AISelectionModal,
  AuthModal,
  GameModeSelector,
  PlayPoker
} from '../../components';
import { MultiplayerLobby } from '../Multiplayer';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_POSITION_STATS } from '../../constants';
import { usePreflopProgression, usePostflopProgression, useFullGameProgression } from '../../hooks/useProgression';
import styles from './PokerPreflopTrainer.module.scss';

export const PokerPreflopTrainer: React.FC = () => {
  // Auth State
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Preflop State
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
  const [positionStats, setPositionStats] = useState<PositionStats>({ ...INITIAL_POSITION_STATS });
  const [chartPosition, setChartPosition] = useState<Position>('BTN');
  const [highlightedHand, setHighlightedHand] = useState<string | null>(null);
  const [useAI, setUseAI] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiExplanation, setAIExplanation] = useState<string>('');
  const [showAISelectionModal, setShowAISelectionModal] = useState<boolean>(true);

  // Game Mode State
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [showGameModeSelector, setShowGameModeSelector] = useState<boolean>(true);

  // Progression hooks
  const { updateProgress: updatePreflopProgress } = usePreflopProgression();
  const { updateProgress: updatePostflopProgress } = usePostflopProgression();
  const { updateProgress: updateFullGameProgress } = useFullGameProgression();

  // Postflop State
  const [bettingRound, setBettingRound] = useState<BettingRound>('preflop');
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [pot, setPot] = useState<number>(0);
  const [betToCall, setBetToCall] = useState<number>(0);
  const [playerChips, setPlayerChips] = useState<number>(200);
  const [opponentChips, setOpponentChips] = useState<number>(200);
  const [postflopAnalysis, setPostflopAnalysis] = useState<OutsAnalysis | null>(null);
  const [postflopFeedback, setPostflopFeedback] = useState<PostflopFeedback | null>(null);
  const [showPostflopFeedback, setShowPostflopFeedback] = useState<boolean>(false);

  useEffect(() => {
    handleGenerateHand();
  }, []);

  const handleGenerateHand = (): void => {
    const newHand = generateHand();
    setCurrentHand(newHand);
    setFeedback(null);
    setShowExplanation(false);
    // Reset postflop state
    setBettingRound('preflop');
    setCommunityCards([]);
    setPot(0);
    setBetToCall(0);
    setPostflopAnalysis(null);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);
  };

  const handleGameModeSelect = (mode: GameMode): void => {
    setGameMode(mode);
    setShowGameModeSelector(false);

    // If postflop-only mode, immediately transition to postflop
    if (mode === 'postflop-only') {
      startPostflopOnly();
    }
    // play-poker mode is handled separately in the render
  };

  const handleBackFromPlayPoker = (): void => {
    setGameMode(null);
    setShowGameModeSelector(true);
  };

  const startPostflopOnly = (): void => {
    // Generate a new hand and immediately deal the flop
    const newHand = generateHand();
    setCurrentHand(newHand);
    setFeedback(null);
    setShowExplanation(false);

    // Deal the flop
    const flop = dealCommunityCards(newHand, 'flop');
    setCommunityCards(flop);
    setBettingRound('flop');

    // Generate betting scenario
    const scenario = generateBettingScenario('flop');
    setPot(scenario.pot);
    setBetToCall(scenario.betToCall);
    setPlayerChips(scenario.playerChips);
    setOpponentChips(scenario.opponentChips);

    // Analyze the flop
    const gameState: PostflopGameState = {
      communityCards: flop,
      pot: scenario.pot,
      betToCall: scenario.betToCall,
      bettingRound: 'flop',
      playerChips: scenario.playerChips,
      opponentChips: scenario.opponentChips
    };
    const analysis = analyzePostflop(newHand, flop, gameState);
    setPostflopAnalysis(analysis);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);
  };

  const handleTransitionToPostflop = (): void => {
    // Deal the flop
    const flop = dealCommunityCards(currentHand, 'flop');
    setCommunityCards(flop);
    setBettingRound('flop');

    // Generate betting scenario
    const scenario = generateBettingScenario('flop');
    setPot(scenario.pot);
    setBetToCall(scenario.betToCall);
    setPlayerChips(scenario.playerChips);
    setOpponentChips(scenario.opponentChips);

    // Analyze the flop
    const gameState: PostflopGameState = {
      communityCards: flop,
      pot: scenario.pot,
      betToCall: scenario.betToCall,
      bettingRound: 'flop',
      playerChips: scenario.playerChips,
      opponentChips: scenario.opponentChips
    };
    const analysis = analyzePostflop(currentHand, flop, gameState);
    setPostflopAnalysis(analysis);
  };

  const handleDealNextStreet = (): void => {
    const nextRound: BettingRound = bettingRound === 'flop' ? 'turn' : 'river';
    const newCard = dealCommunityCards([...currentHand, ...communityCards], nextRound);
    const updatedCommunity = [...communityCards, ...newCard];
    setCommunityCards(updatedCommunity);
    setBettingRound(nextRound);

    // Generate new betting scenario
    const scenario = generateBettingScenario(nextRound);
    setPot(pot + scenario.pot); // Add to existing pot
    setBetToCall(scenario.betToCall);

    // Analyze the new street
    const gameState: PostflopGameState = {
      communityCards: updatedCommunity,
      pot: pot + scenario.pot,
      betToCall: scenario.betToCall,
      bettingRound: nextRound,
      playerChips,
      opponentChips
    };
    const analysis = analyzePostflop(currentHand, updatedCommunity, gameState);
    setPostflopAnalysis(analysis);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);
  };

  const handlePostflopAction = (action: PostflopAction): void => {
    if (!postflopAnalysis) return;

    setIsAnalyzing(true);

    // Determine if the action is correct
    const correctAction = postflopAnalysis.recommendedAction;
    const isCorrect = action === correctAction;
    const newStreak = isCorrect ? streak + 1 : 0;

    // Update stats
    setTotalHands(totalHands + 1);

    if (isCorrect) {
      setScore(score + 10);
      setStreak(newStreak);
      setCorrectAnswers(correctAnswers + 1);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setStreak(0);
    }

    // Save progression based on game mode
    // Map PostflopAction to the decision types accepted by progression service
    const mapActionToDecisionType = (act: PostflopAction): 'call' | 'fold' | 'raise' => {
      if (act === 'check') return 'call'; // check is passive like call
      if (act === 'bet') return 'raise'; // bet is aggressive like raise
      return act as 'call' | 'fold' | 'raise';
    };

    if (gameMode === 'postflop-only') {
      updatePostflopProgress(bettingRound, mapActionToDecisionType(action), isCorrect, newStreak);
    } else if (gameMode === 'full-game') {
      updateFullGameProgress('postflop', isCorrect, newStreak, undefined, bettingRound);
    }

    // Set feedback
    setPostflopFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      playerAction: action,
      correctAction,
      analysis: postflopAnalysis
    });
    setShowPostflopFeedback(true);
    setIsAnalyzing(false);
  };

  const handleAction = async (action: Action): Promise<void> => {
    setIsAnalyzing(true);

    try {
      let correctAction: Action;
      let explanation: string;

      if (useAI) {
        // Use AI analysis
        const analysis = await getFullAnalysisAI(currentHand, position);
        correctAction = analysis.action;
        explanation = `${analysis.explanation}\n\n${analysis.reasoning}`;
        setAIExplanation(explanation);
      } else {
        // Use static ranges
        correctAction = getCorrectAction(currentHand, position);
        explanation = getExplanation(currentHand, position, correctAction);
        setAIExplanation(explanation);
      }

      const isCorrect: boolean = action === correctAction;
      const newStreak = isCorrect ? streak + 1 : 0;

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
        setStreak(newStreak);
        setCorrectAnswers(correctAnswers + 1);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        setFeedback({ type: 'correct', action: correctAction });
      } else {
        setStreak(0);
        setFeedback({ type: 'incorrect', action: correctAction });
      }

      // Save progression based on game mode
      if (gameMode === 'preflop-only' || !gameMode) {
        updatePreflopProgress(position, isCorrect, newStreak);
      } else if (gameMode === 'full-game') {
        updateFullGameProgress('preflop', isCorrect, newStreak, position);
      }

      setShowExplanation(true);
    } catch (error) {
      console.error('Error in handleAction:', error);
      // Fallback to static ranges on error
      const correctAction = getCorrectAction(currentHand, position);
      const explanation = getExplanation(currentHand, position, correctAction);
      setAIExplanation(explanation);

      const isCorrect: boolean = action === correctAction;
      const newStreak = isCorrect ? streak + 1 : 0;
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
        setStreak(newStreak);
        setCorrectAnswers(correctAnswers + 1);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        setFeedback({ type: 'correct', action: correctAction });
      } else {
        setStreak(0);
        setFeedback({ type: 'incorrect', action: correctAction });
      }

      // Save progression even on error fallback
      if (gameMode === 'preflop-only' || !gameMode) {
        updatePreflopProgress(position, isCorrect, newStreak);
      } else if (gameMode === 'full-game') {
        updateFullGameProgress('preflop', isCorrect, newStreak, position);
      }

      setShowExplanation(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextHand = (): void => {
    if (gameMode === 'postflop-only') {
      startPostflopOnly();
    } else {
      handleGenerateHand();
    }
    setHighlightedHand(null);
  };

  const handleContinueToPostflop = (): void => {
    // Only transition if in full-game mode and preflop was correct
    if (gameMode === 'full-game' && feedback?.type === 'correct') {
      handleTransitionToPostflop();
      setFeedback(null);
      setShowExplanation(false);
    }
  };

  const handleViewInChart = (): void => {
    setHighlightedHand(getHandNotation(currentHand));
    setChartPosition(position);
    setView('charts');
  };

  const handleChartPositionChange = (newPosition: Position): void => {
    setChartPosition(newPosition);
    // Keep highlighted hand active when changing position
  };

  const handleAISelection = (selectedUseAI: boolean): void => {
    setUseAI(selectedUseAI);
    setShowAISelectionModal(false);
  };

  const isInPostflop = (bettingRound !== 'preflop' && gameMode === 'full-game') || gameMode === 'postflop-only';
  const showContinueToPostflop = gameMode === 'full-game' &&
    feedback?.type === 'correct' &&
    bettingRound === 'preflop' &&
    (feedback.action === 'raise' || feedback.action === 'call');

  const getTitle = () => {
    switch (gameMode) {
      case 'full-game':
        return '♠ Poker Trainer ♣';
      case 'postflop-only':
        return '♠ Postflop Trainer ♣';
      default:
        return '♠ Poker Preflop Trainer ♣';
    }
  };

  const getSubtitle = () => {
    switch (gameMode) {
      case 'full-game':
        return 'Master preflop and postflop strategy with pot odds';
      case 'postflop-only':
        return 'Practice pot odds, outs, and drawing decisions';
      default:
        return 'Master your preflop strategy with instant feedback';
    }
  };

  // If in play-poker mode, render the PlayPoker component
  if (gameMode === 'play-poker') {
    return <PlayPoker onBack={handleBackFromPlayPoker} />;
  }

  // If in multiplayer mode, render the MultiplayerLobby component
  if (gameMode === 'multiplayer') {
    return <MultiplayerLobby onBack={handleBackFromPlayPoker} />;
  }

  return (
    <div className={styles.app}>
      <GameModeSelector
        isOpen={showGameModeSelector}
        onSelect={handleGameModeSelect}
      />
      {!showGameModeSelector && (
        <AISelectionModal
          isOpen={showAISelectionModal}
          onSelect={handleAISelection}
        />
      )}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.authSection}>
            {isAuthenticated ? (
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>{user?.email}</span>
                <button onClick={logout} className={styles.logoutButton}>
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={styles.loginButton}
              >
                Sign In
              </button>
            )}
          </div>
          <h1 className={styles.title}>{getTitle()}</h1>
          <p className={styles.subtitle}>{getSubtitle()}</p>
          <div className={styles.aiToggleContainer}>
            {/* AI TOGGLE TEMPORARILY DISABLED - Searching for better option
            <label className={styles.aiToggle}>
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className={styles.aiCheckbox}
              />
              <span className={styles.aiLabel}>
                {useAI ? '🤖 AI Mode (Claude)' : '📊 Static Ranges'}
              </span>
            </label>
            */}
            <button
              onClick={() => setShowGameModeSelector(true)}
              className={styles.changeModeButton}
            >
              Change Mode
            </button>
          </div>
        </div>

        <div className={styles.tabNavigation}>
          <button
            onClick={() => setView('practice')}
            className={`${styles.tab} ${view === 'practice' ? styles.active : styles.inactive}`}
          >
            Practice
          </button>
          <button
            onClick={() => setView('stats')}
            className={`${styles.tab} ${view === 'stats' ? styles.active : styles.inactive}`}
          >
            Stats
          </button>
          {gameMode !== 'full-game' && (
            <button
              onClick={() => setView('charts')}
              className={`${styles.tab} ${view === 'charts' ? styles.active : styles.inactive}`}
            >
              Charts
            </button>
          )}
        </div>

        {view === 'practice' && !isInPostflop && (
          <PracticeView
            currentHand={currentHand}
            position={position}
            streak={streak}
            bestStreak={bestStreak}
            feedback={feedback}
            showExplanation={showExplanation}
            onPositionChange={setPosition}
            onAction={handleAction}
            onNextHand={handleNextHand}
            onViewInChart={handleViewInChart}
            aiExplanation={aiExplanation}
            isAnalyzing={isAnalyzing}
            showContinueToPostflop={showContinueToPostflop}
            onContinueToPostflop={handleContinueToPostflop}
          />
        )}

        {view === 'practice' && isInPostflop && (
          <PostflopView
            holeCards={currentHand}
            communityCards={communityCards}
            bettingRound={bettingRound}
            pot={pot}
            betToCall={betToCall}
            analysis={postflopAnalysis}
            feedback={postflopFeedback}
            showFeedback={showPostflopFeedback}
            isAnalyzing={isAnalyzing}
            onAction={handlePostflopAction}
            onNextStreet={handleDealNextStreet}
            onNewHand={handleNextHand}
          />
        )}

        {view === 'stats' && gameMode === 'postflop-only' && (
          <PostflopStatsView
            sessionTotalHands={totalHands}
            sessionCorrectAnswers={correctAnswers}
            sessionBestStreak={bestStreak}
          />
        )}

        {view === 'stats' && gameMode === 'full-game' && (
          <FullGameStatsView
            sessionTotalHands={totalHands}
            sessionBestStreak={bestStreak}
          />
        )}

        {view === 'stats' && (gameMode === 'preflop-only' || !gameMode) && (
          <StatsView
            score={score}
            totalHands={totalHands}
            correctAnswers={correctAnswers}
            bestStreak={bestStreak}
            positionStats={positionStats}
          />
        )}

        {view === 'charts' && !isInPostflop && (
          <ChartsView
            chartPosition={chartPosition}
            highlightedHand={highlightedHand}
            onPositionChange={handleChartPositionChange}
          />
        )}

        {view === 'charts' && isInPostflop && (
          <PostflopChartsView />
        )}
      </div>
    </div>
  );
};
