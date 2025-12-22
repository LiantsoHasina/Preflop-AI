import { useState, useCallback } from 'react';
import type {
  Card,
  BettingRound,
  PostflopFeedback,
  OutsAnalysis,
  PostflopGameState,
  PostflopAction
} from '../types';
import {
  dealCommunityCards,
  analyzePostflop,
  generateBettingScenario
} from '../utils';

export const usePostflopGame = () => {
  const [bettingRound, setBettingRound] = useState<BettingRound>('preflop');
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [betToCall, setBetToCall] = useState(0);
  const [playerChips, setPlayerChips] = useState(200);
  const [opponentChips, setOpponentChips] = useState(200);
  const [postflopAnalysis, setPostflopAnalysis] = useState<OutsAnalysis | null>(null);
  const [postflopFeedback, setPostflopFeedback] = useState<PostflopFeedback | null>(null);
  const [showPostflopFeedback, setShowPostflopFeedback] = useState(false);

  const dealFlop = useCallback((holeCards: Card[]) => {
    const flop = dealCommunityCards(holeCards, 'flop');
    setCommunityCards(flop);
    setBettingRound('flop');

    const scenario = generateBettingScenario('flop');
    setPot(scenario.pot);
    setBetToCall(scenario.betToCall);
    setPlayerChips(scenario.playerChips);
    setOpponentChips(scenario.opponentChips);

    const gameState: PostflopGameState = {
      communityCards: flop,
      pot: scenario.pot,
      betToCall: scenario.betToCall,
      bettingRound: 'flop',
      playerChips: scenario.playerChips,
      opponentChips: scenario.opponentChips
    };
    const analysis = analyzePostflop(holeCards, flop, gameState);
    setPostflopAnalysis(analysis);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);

    return { flop, analysis };
  }, []);

  const dealNextStreet = useCallback((holeCards: Card[]) => {
    const nextRound: BettingRound = bettingRound === 'flop' ? 'turn' : 'river';
    const newCard = dealCommunityCards([...holeCards, ...communityCards], nextRound);
    const updatedCommunity = [...communityCards, ...newCard];
    setCommunityCards(updatedCommunity);
    setBettingRound(nextRound);

    const scenario = generateBettingScenario(nextRound);
    const newPot = pot + scenario.pot;
    setPot(newPot);
    setBetToCall(scenario.betToCall);

    const gameState: PostflopGameState = {
      communityCards: updatedCommunity,
      pot: newPot,
      betToCall: scenario.betToCall,
      bettingRound: nextRound,
      playerChips,
      opponentChips
    };
    const analysis = analyzePostflop(holeCards, updatedCommunity, gameState);
    setPostflopAnalysis(analysis);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);

    return { updatedCommunity, analysis };
  }, [bettingRound, communityCards, pot, playerChips, opponentChips]);

  const evaluateAction = useCallback((action: PostflopAction): boolean => {
    if (!postflopAnalysis) return false;

    const correctAction = postflopAnalysis.recommendedAction;
    const isCorrect = action === correctAction;

    setPostflopFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      playerAction: action,
      correctAction,
      analysis: postflopAnalysis
    });
    setShowPostflopFeedback(true);

    return isCorrect;
  }, [postflopAnalysis]);

  const resetPostflop = useCallback(() => {
    setBettingRound('preflop');
    setCommunityCards([]);
    setPot(0);
    setBetToCall(0);
    setPostflopAnalysis(null);
    setPostflopFeedback(null);
    setShowPostflopFeedback(false);
  }, []);

  return {
    bettingRound,
    communityCards,
    pot,
    betToCall,
    playerChips,
    opponentChips,
    postflopAnalysis,
    postflopFeedback,
    showPostflopFeedback,
    dealFlop,
    dealNextStreet,
    evaluateAction,
    resetPostflop
  };
};
